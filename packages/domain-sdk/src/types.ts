import { ComponentType, ReactNode } from 'react';
import { z } from 'zod';

// ============================================================================
// Domain Meta Information
// ============================================================================

export interface DomainMeta {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  primaryColor?: string;
  version: string;
  minPlatformVersion?: string;
}

// ============================================================================
// Activity Type System
// ============================================================================

export interface ActivityTypeDefinition<TMetadata = any> {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  metadataSchema: z.ZodSchema<TMetadata>;
  displayComponent: ComponentType<ActivityDisplayProps<TMetadata>>;
  loggerComponent: ComponentType<ActivityLoggerProps<TMetadata>>;
  defaultMetadata?: Partial<TMetadata>;
}

export interface ActivityDisplayProps<TMetadata = any> {
  activity: Activity<TMetadata>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface ActivityLoggerProps<TMetadata = any> {
  activityTypeId: string;
  onSave: (metadata: TMetadata) => Promise<void>;
  initialData?: Partial<TMetadata>;
}

// ============================================================================
// Metrics System
// ============================================================================

export interface MetricDefinition {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  calculator: (activities: Activity[]) => number | null;
  formatter?: (value: number) => string;
  chartConfig?: {
    type: 'line' | 'bar' | 'pie' | 'area';
    color?: string;
  };
}

// ============================================================================
// AI Agent System
// ============================================================================

export interface AITool {
  name: string;
  description: string;
  parameters: z.ZodSchema<any>;
  execute: (params: any, context: AIToolContext) => Promise<any>;
}

export interface AIToolContext {
  userId: string;
  domainId: string;
  services: PlatformServices;
}

export interface AIAgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  tools: AITool[];
  contextBuilder?: (userId: string, services: PlatformServices) => Promise<string>;
  maxTokens?: number;
  temperature?: number;
}

// ============================================================================
// Navigation & Routing
// ============================================================================

export interface DomainRoute {
  path: string;
  component: ComponentType<any>;
  name: string;
  tabLabel?: string;
  tabIcon?: string;
  requiresAuth?: boolean;
}

// ============================================================================
// Onboarding
// ============================================================================

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  component: ComponentType<OnboardingStepProps>;
  skippable?: boolean;
  validation?: (data: any) => Promise<boolean>;
}

export interface OnboardingStepProps {
  onNext: (data?: any) => void;
  onSkip?: () => void;
  onBack?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// ============================================================================
// Domain Module
// ============================================================================

export interface DomainModule {
  meta: DomainMeta;
  activityTypes: ActivityTypeDefinition[];
  metrics?: MetricDefinition[];
  agents?: AIAgentConfig[];
  routes?: DomainRoute[];
  components?: {
    Dashboard?: ComponentType<DomainDashboardProps>;
    Settings?: ComponentType<DomainSettingsProps>;
    Header?: ComponentType<DomainHeaderProps>;
  };
  onboarding?: {
    steps: OnboardingStep[];
    component?: ComponentType<DomainOnboardingProps>;
  };
  lifecycle?: {
    initialize?: (services: PlatformServices) => Promise<void>;
    cleanup?: (services: PlatformServices) => Promise<void>;
  };
  settings?: {
    schema: z.ZodSchema<any>;
    component: ComponentType<DomainSettingsProps>;
    defaults?: any;
  };
}

export interface DomainDashboardProps {
  userId: string;
  services: PlatformServices;
}

export interface DomainSettingsProps {
  settings: any;
  onSave: (settings: any) => Promise<void>;
}

export interface DomainHeaderProps {
  title?: string;
  subtitle?: string;
}

export interface DomainOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

// ============================================================================
// Base Data Models
// ============================================================================

export interface Activity<TMetadata = any> {
  id: string;
  userId: string;
  domainId: string;
  activityTypeId: string;
  metadata: TMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  notes?: string;
  tags?: string[];
}

export interface ProgressMetric {
  id: string;
  userId: string;
  domainId: string;
  metricId: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CoachingSession {
  id: string;
  userId: string;
  domainId: string;
  agentId: string;
  messages: CoachingMessage[];
  startedAt: Date;
  endedAt?: Date;
  metadata?: Record<string, any>;
}

export interface CoachingMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  toolName: string;
  parameters: any;
  result?: any;
  error?: string;
}

// ============================================================================
// Platform Services
// ============================================================================

export interface PlatformServices {
  user: UserService;
  data: DataService;
  ai: AIService;
  storage: StorageService;
  analytics: AnalyticsService;
  navigation: NavigationService;
}

export interface UserService {
  getCurrentUser: () => Promise<User | null>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface UserProfile extends User {
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: Record<string, any>;
}

export interface DataService {
  activities: {
    list: (filters?: ActivityFilters) => Promise<Activity[]>;
    get: (id: string) => Promise<Activity | null>;
    create: (data: CreateActivityInput) => Promise<Activity>;
    update: (id: string, data: UpdateActivityInput) => Promise<Activity>;
    delete: (id: string) => Promise<void>;
  };
  metrics: {
    list: (filters?: MetricFilters) => Promise<ProgressMetric[]>;
    record: (metricId: string, value: number, metadata?: any) => Promise<ProgressMetric>;
  };
  sessions: {
    list: (filters?: SessionFilters) => Promise<CoachingSession[]>;
    get: (id: string) => Promise<CoachingSession | null>;
    create: (agentId: string) => Promise<CoachingSession>;
    addMessage: (sessionId: string, message: Omit<CoachingMessage, 'id' | 'timestamp'>) => Promise<void>;
    end: (sessionId: string) => Promise<void>;
  };
}

export interface ActivityFilters {
  domainId?: string;
  activityTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface MetricFilters {
  domainId?: string;
  metricId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface SessionFilters {
  domainId?: string;
  agentId?: string;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
  limit?: number;
}

export interface CreateActivityInput {
  domainId: string;
  activityTypeId: string;
  metadata: any;
  notes?: string;
  tags?: string[];
}

export interface UpdateActivityInput {
  metadata?: any;
  notes?: string;
  tags?: string[];
}

export interface AIService {
  chat: (config: AIAgentConfig, messages: CoachingMessage[]) => Promise<AIResponse>;
  executeTools: (toolCalls: ToolCall[], context: AIToolContext) => Promise<ToolCall[]>;
}

export interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StorageService {
  uploadFile: (file: File | Blob, path: string) => Promise<string>;
  getFileUrl: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
}

export interface AnalyticsService {
  trackEvent: (event: string, properties?: Record<string, any>) => Promise<void>;
  trackScreen: (screenName: string, properties?: Record<string, any>) => Promise<void>;
}

export interface NavigationService {
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  reset: (route: string) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createDomain(config: DomainModule): DomainModule {
  return {
    ...config,
    meta: {
      ...config.meta,
      minPlatformVersion: config.meta.minPlatformVersion || '1.0.0',
    },
  };
}

export function createActivityType<TMetadata = any>(
  config: Omit<ActivityTypeDefinition<TMetadata>, 'id'> & { id?: string }
): ActivityTypeDefinition<TMetadata> {
  return {
    id: config.id || `activity-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
    ...config,
  };
}

export function createMetric(
  config: Omit<MetricDefinition, 'id'> & { id?: string }
): MetricDefinition {
  return {
    id: config.id || `metric-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
    formatter: config.formatter || ((value) => value.toString()),
    ...config,
  };
}

export function createAgent(
  config: Omit<AIAgentConfig, 'id'> & { id?: string }
): AIAgentConfig {
  return {
    ...config,
    id: config.id || `agent-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
    model: config.model || 'gpt-4',
    tools: config.tools || [],
    maxTokens: config.maxTokens || 2000,
    temperature: config.temperature || 0.7,
  };
}

export function createTool(config: AITool): AITool {
  return config;
}
