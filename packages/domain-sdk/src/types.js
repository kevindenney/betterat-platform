"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDomain = createDomain;
exports.createActivityType = createActivityType;
exports.createMetric = createMetric;
exports.createAgent = createAgent;
exports.createTool = createTool;
// ============================================================================
// Helper Functions
// ============================================================================
function createDomain(config) {
    return {
        ...config,
        meta: {
            ...config.meta,
            minPlatformVersion: config.meta.minPlatformVersion || '1.0.0',
        },
    };
}
function createActivityType(config) {
    return {
        id: config.id || `activity-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...config,
    };
}
function createMetric(config) {
    return {
        id: config.id || `metric-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        formatter: config.formatter || ((value) => value.toString()),
        ...config,
    };
}
function createAgent(config) {
    return {
        ...config,
        id: config.id || `agent-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        model: config.model || 'gpt-4',
        tools: config.tools || [],
        maxTokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
    };
}
function createTool(config) {
    return config;
}
