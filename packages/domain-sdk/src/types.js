// ============================================================================
// Helper Functions
// ============================================================================
export function createDomain(config) {
    return {
        ...config,
        meta: {
            ...config.meta,
            minPlatformVersion: config.meta.minPlatformVersion || '1.0.0',
        },
    };
}
export function createActivityType(config) {
    return {
        id: config.id || `activity-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...config,
    };
}
export function createMetric(config) {
    return {
        id: config.id || `metric-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        formatter: config.formatter || ((value) => value.toString()),
        ...config,
    };
}
export function createAgent(config) {
    return {
        ...config,
        id: config.id || `agent-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        model: config.model || 'gpt-4',
        tools: config.tools || [],
        maxTokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
    };
}
export function createTool(config) {
    return config;
}
