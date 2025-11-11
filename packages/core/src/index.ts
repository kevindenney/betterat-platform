// Auth exports
export * from './auth';
export * from './auth/AuthService';

// Providers
export * from './providers/AuthProvider';
export * from './providers/CoachWorkspaceProvider';
export * from './providers/StripeProvider';

// Domain exports
export * from './domains';

// Shared services
export { supabase } from './database/client';
export type { Database, UserType, Tables, TablesInsert, TablesUpdate } from './database/client';
export * from './storage';
export * from './hooks';
export * from './lib/utils';
export * from './lib/gates';
export * from './lib/imageConfig';
export * from './lib/styles/shadow';
export * from './lib/types/map';
export * from './lib/types/advanced-map';
export * from './lib/types/ai-knowledge';
export * from './lib/types/global-venues';
export * from './lib/types/venues';
export * from './lib/utils/logger';
export * from './lib/utils/userTypeRouting';
export * from './utils/authDebug';
export * from './utils/clipboard';
export * from './utils/uuid';
export * from './stores/raceConditionsStore';
export * from './constants/mockData';
export * from './services/SailorRacePreparationService';
export * from './services/VenueIntelligenceService';
export * from './services/venue/RegionalIntelligenceService';
export * from './services/agents/VenueIntelligenceAgent';
