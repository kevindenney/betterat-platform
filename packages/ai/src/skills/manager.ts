// @ts-nocheck
/**
 * Claude Skills Management Service
 * Handles uploading, listing, and managing custom Claude Skills for the application
 *
 * Features:
 * - Upload custom skills to Anthropic
 * - List and retrieve skill metadata
 * - Cache skill IDs for performance
 * - Automatic skill initialization on app startup
 */

interface SkillDefinition {
  description: string;
  content: string;
  aliases?: string[];
}

const BUILT_IN_SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  // Add your BetterAt-specific skills here
};

// Skills Registry - maps skill names to skill IDs
export const SKILL_REGISTRY: Record<string, string> = {
  // Add your skill IDs here as they're created
};

/**
 * Get skill ID from skill name
 */
export function getSkillId(skillName: keyof typeof SKILL_REGISTRY): string {
  return SKILL_REGISTRY[skillName];
}

type BuiltInSkillKey = keyof typeof BUILT_IN_SKILL_DEFINITIONS;

function resolveBuiltInSkill(skillName: string): { key: BuiltInSkillKey; definition: SkillDefinition } | null {
  if (skillName in BUILT_IN_SKILL_DEFINITIONS) {
    const key = skillName as BuiltInSkillKey;
    return { key, definition: BUILT_IN_SKILL_DEFINITIONS[key] };
  }

  const lower = skillName.toLowerCase();
  for (const [key, definition] of Object.entries(BUILT_IN_SKILL_DEFINITIONS)) {
    if (definition.aliases?.some(alias => alias.toLowerCase() === lower)) {
      return { key: key as BuiltInSkillKey, definition };
    }
  }

  return null;
}

function getPreconfiguredSkillId(skillKey: BuiltInSkillKey): string | null {
  const candidate = SKILL_REGISTRY[skillKey as keyof typeof SKILL_REGISTRY];
  if (!candidate) {
    return null;
  }

  if (candidate.startsWith('skill_builtin_')) {
    return candidate;
  }

  // Anthropic-issued skill IDs always begin with skill_0 and include base62 characters
  if (/^skill_0[0-9A-Za-z]+$/.test(candidate)) {
    return candidate;
  }

  return null;
}

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  uploadedAt: Date;
  source: 'anthropic' | 'custom';
}

export class SkillManagementService {
  private skillCache: Map<string, SkillMetadata> = new Map();
  private initialized = false;
  private readonly EDGE_FUNCTION_URL: string;
  private remoteSkillProxyEnabled: boolean;
  private remoteSkillDisableReason: string | null = null;
  private remoteSkillNoticeLogged = false;
  private loggedSkipForSkill = new Set<string>();
  private loggedPreconfiguredSkill = new Set<string>();

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('No Supabase URL found');
      this.EDGE_FUNCTION_URL = '';
    } else {
      this.EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/anthropic-skills-proxy`;
    }

    const disableViaEnv =
      (process.env.EXPO_PUBLIC_DISABLE_REMOTE_SKILLS ?? '').toLowerCase() === 'true';

    if (disableViaEnv) {
      this.remoteSkillProxyEnabled = false;
      this.remoteSkillDisableReason = 'Disabled via EXPO_PUBLIC_DISABLE_REMOTE_SKILLS';
    } else if (!this.EDGE_FUNCTION_URL) {
      this.remoteSkillProxyEnabled = false;
      this.remoteSkillDisableReason = 'No Supabase Edge Function URL configured';
    } else {
      this.remoteSkillProxyEnabled = true;
    }
  }

  /**
   * Initialize the service (lazy initialization)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  /**
   * Call the Anthropic Skills proxy Edge Function
   */
  private async callSkillsProxy(action: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.remoteSkillProxyEnabled) {
      throw new Error(this.remoteSkillDisableReason || 'Skill proxy disabled');
    }

    // Get Supabase credentials for authentication
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Supabase authentication headers
    if (supabaseAnonKey) {
      headers['apikey'] = supabaseAnonKey;
      headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
    }

    try {
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...params }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as any;
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        const normalizedMessage = errorMessage.toLowerCase();

        if (
          response.status === 404 ||
          /not\s+found/i.test(errorMessage) ||
          normalizedMessage.includes('function not found')
        ) {
          this.disableRemoteSkills('Skill proxy edge function not deployed on this Supabase project');
        } else if (response.status === 401 || response.status === 403) {
          this.disableRemoteSkills('Skill proxy access denied (check Supabase anon key permissions)');
        } else if (response.status >= 500) {
          this.disableRemoteSkills(
            `Skill proxy returned server error (HTTP ${response.status}). Check Supabase Edge Function logs.`
          );
        }

        throw new Error(`Anthropic API error: ${errorMessage}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('Network request failed')) {
        this.disableRemoteSkills('Skill proxy unreachable (offline or blocked network)', error);
      }
      throw error;
    }
  }

  /**
   * Upload a custom skill to Anthropic
   * @param name Skill name
   * @param description Brief description of the skill
   * @param content Skill content (markdown/text defining the skill's expertise)
   * @returns Skill ID if successful
   */
  async uploadSkill(
    name: string,
    description: string,
    content: string
  ): Promise<string | null> {
    await this.ensureInitialized();

    if (!this.remoteSkillProxyEnabled) {
      this.logRemoteSkillsDisabled();
      return null;
    }

    try {
      console.debug(`Uploading skill '${name}'`);

      // First check if the skill already exists
      const existingSkillId = await this.getSkillId(name);
      if (existingSkillId) {
        console.debug(`Found existing skill '${name}' with ID: ${existingSkillId}`);
        return existingSkillId;
      }

      // Upload via Edge Function proxy
      console.debug(`Uploading skill '${name}' via Edge Function proxy`);
      const response = await this.callSkillsProxy('create_skill', {
        name,
        description,
        content
      });

      const skillId = (response as any).id;

      if (skillId) {
        console.debug(`Skill '${name}' uploaded successfully. ID: ${skillId}`);

        // Cache the skill metadata
        const metadata: SkillMetadata = {
          id: skillId,
          name,
          description,
          version: 'latest',
          uploadedAt: new Date(),
          source: 'custom'
        };

        this.skillCache.set(name, metadata);

        return skillId;
      }

      console.warn(`Skill upload returned no ID for '${name}'`);
      return null;
    } catch (error) {
      console.error(`Failed to upload skill '${name}':`, error);

      // If skill already exists, try to retrieve it
      const errorMessage = (error as any)?.message?.toLowerCase() || '';
      const isDuplicateError =
        errorMessage.includes('already exists') ||
        errorMessage.includes('cannot reuse an existing display_title') ||
        errorMessage.includes('display_title');

      if (isDuplicateError) {
        console.debug(`Skill '${name}' appears to exist, fetching from API...`);

        // Refresh the skill list to update cache
        await this.listSkills();

        // Try to get the skill ID from refreshed cache
        const existingId = await this.getSkillId(name);
        if (existingId) {
          console.debug(`Found existing skill '${name}' after refresh: ${existingId}`);
          return existingId;
        }
      }

      return null;
    }
  }

  /**
   * Convert display_title to slug format
   */
  private slugifyDisplayTitle(displayTitle: string): string {
    return displayTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * List all available skills (both Anthropic and custom)
   */
  async listSkills(): Promise<SkillMetadata[]> {
    await this.ensureInitialized();

    if (!this.remoteSkillProxyEnabled) {
      this.logRemoteSkillsDisabled();
      return Array.from(this.skillCache.values());
    }

    try {
      console.debug('Listing all skills via proxy');

      const response = await this.callSkillsProxy('list_skills');

      const skills = (response as any).data || [];

      // Update cache with latest skills
      skills.forEach((skill: any) => {
        const metadata: SkillMetadata = {
          id: skill.id,
          name: skill.name,
          description: skill.description || '',
          version: skill.version || 'latest',
          uploadedAt: new Date(skill.created_at),
          source: skill.type === 'anthropic' ? 'anthropic' : 'custom'
        };

        // Cache by skill.name if available
        if (skill.name) {
          this.skillCache.set(skill.name, metadata);
        }

        // ALSO cache by slugified display_title for lookup compatibility
        if (skill.display_title) {
          const slug = this.slugifyDisplayTitle(skill.display_title);
          this.skillCache.set(slug, metadata);
          console.debug(`Cached skill by display_title slug: ${slug} -> ${skill.id}`);
        }
      });

      // Log skill names for debugging
      if (skills.length > 0) {
        const skillNames = skills.map((s: any) => s.name || s.display_title).join(', ');
        console.debug(`Found ${skills.length} skills: ${skillNames}`);
      } else {
        console.warn('No skills found');
      }

      return Array.from(this.skillCache.values());
    } catch (error) {
      if (this.remoteSkillProxyEnabled) {
        console.error('Failed to list skills:', error);
      } else {
        this.logRemoteSkillsDisabled();
      }
      // Return cached skills as fallback
      return Array.from(this.skillCache.values());
    }
  }

  /**
   * Get skill ID by name from cache or API
   */
  async getSkillId(name: string): Promise<string | null> {
    await this.ensureInitialized();

    // Check cache first
    const cached = this.skillCache.get(name);
    if (cached) {
      return cached.id;
    }

    if (!this.remoteSkillProxyEnabled) {
      this.logRemoteSkillsDisabled();
      return null;
    }

    // Fetch from API
    const skills = await this.listSkills();
    const skill = skills.find(s => s.name === name);
    return skill?.id || null;
  }

  /**
   * Load skill content from definition
   */
  private async loadSkillContent(skillName: string): Promise<string | null> {
    const resolved = resolveBuiltInSkill(skillName);
    if (!resolved) {
      console.warn(`No built-in definition for skill '${skillName}'`);
      return null;
    }
    return resolved.definition.content;
  }

  private async initializeSkillInternal(skillKey: BuiltInSkillKey): Promise<string | null> {
    await this.ensureInitialized();

    const preconfiguredId = getPreconfiguredSkillId(skillKey);
    if (preconfiguredId) {
      if (!this.loggedPreconfiguredSkill.has(skillKey)) {
        this.loggedPreconfiguredSkill.add(skillKey);
        console.debug(
          `Using preconfigured skill ID for '${skillKey}' (${preconfiguredId}) - skipping remote initialization`
        );
      }
      return preconfiguredId;
    }

    if (!this.remoteSkillProxyEnabled) {
      this.logRemoteSkillsDisabled();
      this.logSkipForSkill(skillKey);
      return null;
    }

    try {
      const definition = BUILT_IN_SKILL_DEFINITIONS[skillKey];
      if (!definition) {
        console.warn(`No definition registered for '${skillKey}'`);
        return null;
      }

      console.debug(`Initializing skill '${skillKey}'`);

      const possibleNames = [skillKey, ...(definition.aliases ?? [])];

      for (const name of possibleNames) {
        const skillId = await this.getSkillId(name);
        if (skillId) {
          console.debug(`Found existing skill '${name}' with ID: ${skillId}`);
          return skillId;
        }
      }

      const skillContent = await this.loadSkillContent(skillKey);
      if (!skillContent) {
        console.error(`Failed to load content for '${skillKey}'`);
        return null;
      }

      console.debug(`Uploading new '${skillKey}' skill`);
      const skillId = await this.uploadSkill(
        skillKey,
        definition.description,
        skillContent
      );

      if (skillId) {
        console.debug(`Skill '${skillKey}' initialized with ID: ${skillId}`);
        return skillId;
      }

      console.warn(`Skill initialization returned null for '${skillKey}'`);
      return null;
    } catch (error) {
      console.error(`Failed to initialize skill '${skillKey}':`, error);
      return null;
    }
  }

  /**
   * Clear skills cache (useful for debugging)
   */
  async clearCache(): Promise<void> {
    this.skillCache.clear();
    console.debug('Cache cleared');
  }

  /**
   * Get a built-in skill definition by name or alias
   */
  static getBuiltInSkillDefinition(skillName: string): SkillDefinition | null {
    const resolved = resolveBuiltInSkill(skillName);
    return resolved?.definition || null;
  }

  /**
   * Get all built-in skill definitions
   */
  static getAllBuiltInSkills(): Record<string, SkillDefinition> {
    return { ...BUILT_IN_SKILL_DEFINITIONS };
  }

  /**
   * Get list of built-in skill names
   */
  static getBuiltInSkillNames(): string[] {
    return Object.keys(BUILT_IN_SKILL_DEFINITIONS);
  }

  private disableRemoteSkills(reason: string, error?: unknown) {
    if (!this.remoteSkillProxyEnabled) {
      return;
    }
    this.remoteSkillProxyEnabled = false;
    this.remoteSkillDisableReason = reason;
    if (error) {
      console.warn(`${reason} - disabling Claude skill proxy for this session`, error);
    } else {
      console.warn(`${reason} - disabling Claude skill proxy for this session`);
    }
  }

  private logRemoteSkillsDisabled() {
    if (this.remoteSkillNoticeLogged) {
      return;
    }
    this.remoteSkillNoticeLogged = true;
    const reason = this.remoteSkillDisableReason ?? 'unknown reason';
    console.info(`Remote Claude skills disabled (${reason}). Falling back to full prompts.`);
  }

  private logSkipForSkill(skillKey: string) {
    if (this.loggedSkipForSkill.has(skillKey)) {
      return;
    }
    this.loggedSkipForSkill.add(skillKey);
    const reason = this.remoteSkillDisableReason ? ` (${this.remoteSkillDisableReason})` : '';
    console.info(`Skipping '${skillKey}' skill initialization${reason}. Core AI flows will continue without skills.`);
  }
}

// Export singleton instance
export const skillManagementService = new SkillManagementService();
