/**
 * Base Agent Service
 * Foundation for autonomous AI agents using Anthropic's SDK
 * Provides tool execution framework, error handling, and configuration
 *
 * IMPORTANT: This service should ONLY be used server-side (Edge Functions, Node.js).
 * For browser usage, create Supabase Edge Functions that call these agents.
 *
 * Example:
 * - ❌ Browser → Agent.run() (exposes API keys)
 * - ✅ Browser → Supabase Edge Function → Agent.run() (secure)
 */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
export interface AgentTool {
    name: string;
    description: string;
    input_schema: z.ZodTypeAny;
    execute: (input: any) => Promise<any>;
}
export interface AgentConfig {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
}
export interface AgentRunOptions {
    userMessage: string;
    context?: Record<string, any>;
    maxIterations?: number;
}
export interface AgentRunResult {
    success: boolean;
    result: any;
    iterations: number;
    toolsUsed: string[];
    toolResults?: Record<string, any>;
    error?: string;
}
export declare class BaseAgentService {
    protected client: Anthropic | null;
    protected tools: Map<string, AgentTool>;
    protected config: Required<AgentConfig>;
    private isServerSide;
    constructor(config?: AgentConfig);
    /**
     * Register a custom tool for the agent to use
     */
    protected registerTool(tool: AgentTool): void;
    /**
     * Convert Zod schema to Anthropic tool input schema format
     */
    private zodToAnthropicSchema;
    /**
     * Convert individual Zod schema types to JSON Schema
     */
    private zodSchemaToJsonSchema;
    /**
     * Execute a tool by name with validated input
     */
    private executeTool;
    /**
     * Run the agent with user message and context
     * Agent will autonomously decide which tools to call and in what order
     */
    run(options: AgentRunOptions): Promise<AgentRunResult>;
    /**
     * Build user prompt with context
     */
    private buildUserPrompt;
    /**
     * Get statistics about registered tools
     */
    getToolStats(): {
        totalTools: number;
        toolNames: string[];
    };
}
export default BaseAgentService;
//# sourceMappingURL=BaseAgentService.d.ts.map