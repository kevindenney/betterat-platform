// @ts-nocheck
import { ComponentType } from 'react';

// These types match the domain-sdk DomainModule interface
// but are defined locally to avoid TypeScript compilation issues

export interface DomainMeta {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon?: string;
  primaryColor?: string;
  minPlatformVersion?: string;
}

export interface DomainModule {
  meta: DomainMeta;
  activityTypes?: any[];
  metrics?: any[];
  agents?: any[];
  routes?: any[];
  components?: {
    Dashboard?: ComponentType<any>;
    Settings?: ComponentType<any>;
    Header?: ComponentType<any>;
  };
  onboarding?: {
    steps: any[];
    component?: ComponentType<any>;
  };
  lifecycle?: {
    initialize?: (services: any) => Promise<void>;
    cleanup?: (services: any) => Promise<void>;
  };
  settings?: {
    schema: any;
    component: ComponentType<any>;
    defaults?: any;
  };
  // Legacy support
  initialize?: () => Promise<void>;
  screens?: Record<string, ComponentType<any>>;
}
