import Anthropic from '@anthropic-ai/sdk';
export interface Agent {
    id: string;
    name: string;
    type: string;
}
export interface AgentTool {
    name: string;
    description: string;
    input_schema?: any;
    execute: (input: any) => Promise<any>;
}
export interface AgentRunOptions {
    userMessage: string;
    maxIterations?: number;
}
export interface AgentRunResult {
    success: boolean;
    response?: any;
    toolResults?: Record<string, any>;
    error?: string;
}
export interface AgentConfig {
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt?: string;
}
export declare class BaseAgent implements Agent {
    id: string;
    name: string;
    type: string;
    constructor(id: string, name: string, type: string);
    process(input: any): Promise<any>;
}
/**
 * Anthropic client subset used by the agents. We only rely on the `messages`
 * namespace today (stream + create) so the type can remain narrow and easy to
 * stub when the API key is missing.
 */
type AnthropicMessagesClient = Pick<Anthropic, 'messages'>;
export declare class BaseAgentService {
    protected config: AgentConfig;
    protected tools: Map<string, AgentTool>;
    protected client: AnthropicMessagesClient;
    constructor(config: AgentConfig);
    registerTool(tool: AgentTool): void;
    getTool(name: string): AgentTool | undefined;
    listTools(): AgentTool[];
    executeTool(toolName: string, input: any): Promise<any>;
    run(options: AgentRunOptions): Promise<AgentRunResult>;
    /**
     * Convert a Zod input schema into the JSON schema dialect expected by
     * Anthropic tool definitions. Many of the tools already pass JSON directly,
     * but the conversion keeps backwards compatibility with the Zod helpers.
     */
    protected zodToAnthropicSchema(schema?: any): any;
    protected ensureClient(): AnthropicMessagesClient;
    process(_input: any): Promise<any>;
    private initializeAnthropicClient;
    private convertZodSchema;
    private applyDescription;
}
export default BaseAgent;
//# sourceMappingURL=base.d.ts.map