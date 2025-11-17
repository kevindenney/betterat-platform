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
export declare const SKILL_REGISTRY: Record<string, string>;
/**
 * Get skill ID from skill name
 */
export declare function getSkillId(skillName: keyof typeof SKILL_REGISTRY): string;
export interface SkillMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    uploadedAt: Date;
    source: 'anthropic' | 'custom';
}
export declare class SkillManagementService {
    private skillCache;
    private initialized;
    private readonly EDGE_FUNCTION_URL;
    private remoteSkillProxyEnabled;
    private remoteSkillDisableReason;
    private remoteSkillNoticeLogged;
    private loggedSkipForSkill;
    private loggedPreconfiguredSkill;
    constructor();
    /**
     * Initialize the service (lazy initialization)
     */
    private ensureInitialized;
    /**
     * Call the Anthropic Skills proxy Edge Function
     */
    private callSkillsProxy;
    /**
     * Upload a custom skill to Anthropic
     * @param name Skill name
     * @param description Brief description of the skill
     * @param content Skill content (markdown/text defining the skill's expertise)
     * @returns Skill ID if successful
     */
    uploadSkill(name: string, description: string, content: string): Promise<string | null>;
    /**
     * Convert display_title to slug format
     */
    private slugifyDisplayTitle;
    /**
     * List all available skills (both Anthropic and custom)
     */
    listSkills(): Promise<SkillMetadata[]>;
    /**
     * Get skill ID by name from cache or API
     */
    getSkillId(name: string): Promise<string | null>;
    /**
     * Load skill content from definition
     */
    private loadSkillContent;
    private initializeSkillInternal;
    /**
     * Clear skills cache (useful for debugging)
     */
    clearCache(): Promise<void>;
    /**
     * Get a built-in skill definition by name or alias
     */
    static getBuiltInSkillDefinition(skillName: string): SkillDefinition | null;
    /**
     * Get all built-in skill definitions
     */
    static getAllBuiltInSkills(): Record<string, SkillDefinition>;
    /**
     * Get list of built-in skill names
     */
    static getBuiltInSkillNames(): string[];
    private disableRemoteSkills;
    private logRemoteSkillsDisabled;
    private logSkipForSkill;
}
export declare const skillManagementService: SkillManagementService;
export {};
//# sourceMappingURL=manager.d.ts.map