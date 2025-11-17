// @ts-nocheck
import Anthropic from '@anthropic-ai/sdk';
import { ZodFirstPartyTypeKind } from 'zod';
export class BaseAgent {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        console.warn('BaseAgent: Stub - needs implementation');
    }
    async process(input) {
        console.warn('BaseAgent.process: Stub - needs implementation');
        return null;
    }
}
export class BaseAgentService {
    constructor(config) {
        this.config = {
            ...config,
            systemPrompt: config.systemPrompt || '',
        };
        this.tools = new Map();
        this.client = this.initializeAnthropicClient();
    }
    registerTool(tool) {
        if (!tool?.name) {
            throw new Error('Tool must include a name');
        }
        if (this.tools.has(tool.name)) {
            console.warn(`Tool "${tool.name}" already registered. Overwriting definition.`);
        }
        this.tools.set(tool.name, tool);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    listTools() {
        return Array.from(this.tools.values());
    }
    async executeTool(toolName, input) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        const validatedInput = typeof tool.input_schema?.parse === 'function'
            ? tool.input_schema.parse(input)
            : input;
        return tool.execute(validatedInput);
    }
    async run(options) {
        const { userMessage, maxIterations = 1 } = options;
        if (!userMessage?.trim()) {
            return { success: false, error: 'userMessage is required' };
        }
        try {
            const client = this.ensureClient();
            const toolDefinitions = this.listTools().map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: this.zodToAnthropicSchema(tool.input_schema),
            }));
            const messages = [{ role: 'user', content: userMessage }];
            const toolResults = {};
            for (let iteration = 0; iteration < maxIterations; iteration++) {
                const response = await client.messages.create({
                    model: this.config.model,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                    system: this.config.systemPrompt,
                    messages,
                    tools: toolDefinitions.length ? toolDefinitions : undefined,
                });
                if (!response?.content?.length) {
                    return { success: true, response, toolResults };
                }
                let toolInvoked = false;
                for (const block of response.content) {
                    if (block.type === 'tool_use') {
                        toolInvoked = true;
                        const { name, input, id } = block;
                        const result = await this.executeTool(name, input);
                        toolResults[name] = result;
                        messages.push({
                            role: 'user',
                            content: [
                                {
                                    type: 'tool_result',
                                    tool_use_id: id,
                                    content: JSON.stringify(result),
                                },
                            ],
                        });
                    }
                }
                if (!toolInvoked || Object.keys(toolResults).length > 0) {
                    return { success: true, response, toolResults };
                }
            }
            return { success: true, toolResults };
        }
        catch (error) {
            return {
                success: false,
                error: error?.message || 'Agent run failed',
            };
        }
    }
    /**
     * Convert a Zod input schema into the JSON schema dialect expected by
     * Anthropic tool definitions. Many of the tools already pass JSON directly,
     * but the conversion keeps backwards compatibility with the Zod helpers.
     */
    zodToAnthropicSchema(schema) {
        try {
            if (!schema) {
                return { type: 'object', properties: {} };
            }
            if (typeof schema.parse !== 'function') {
                return schema;
            }
            return this.convertZodSchema(schema);
        }
        catch (error) {
            console.warn('Failed to convert Zod schema to Anthropic format:', error);
            return { type: 'object', properties: {} };
        }
    }
    ensureClient() {
        if (!this.client) {
            throw new Error('Anthropic client not initialized.');
        }
        return this.client;
    }
    // Subclasses should override this with the actual AI workflow they need.
    // Keeping the default implementation explicit helps surface missing overrides.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async process(_input) {
        throw new Error('process() must be implemented by subclasses');
    }
    initializeAnthropicClient() {
        const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            const help = 'Anthropic API key not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY (preferred) or ANTHROPIC_API_KEY.';
            console.warn(help);
            // Create a lightweight stub so downstream code gets a clear runtime error
            // the first time it tries to talk to the API instead of crashing earlier
            // when `this.client` is undefined.
            const notConfigured = {
                messages: {
                    create: async () => {
                        throw new Error(help);
                    },
                    stream: async () => {
                        throw new Error(help);
                    },
                },
            };
            return notConfigured;
        }
        return new Anthropic({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }
    convertZodSchema(schema) {
        const typeName = schema._def?.typeName;
        switch (typeName) {
            case ZodFirstPartyTypeKind.ZodObject: {
                const properties = {};
                const required = [];
                const shape = schema.shape;
                for (const key of Object.keys(shape)) {
                    const fieldSchema = shape[key];
                    properties[key] = this.convertZodSchema(fieldSchema);
                    const optional = typeof fieldSchema.isOptional === 'function' &&
                        fieldSchema.isOptional();
                    if (!optional) {
                        required.push(key);
                    }
                }
                const baseSchema = {
                    type: 'object',
                    properties,
                    additionalProperties: false,
                };
                if (required.length > 0) {
                    baseSchema.required = required;
                }
                return this.applyDescription(baseSchema, schema);
            }
            case ZodFirstPartyTypeKind.ZodString:
                return this.applyDescription({ type: 'string' }, schema);
            case ZodFirstPartyTypeKind.ZodNumber:
                return this.applyDescription({ type: 'number' }, schema);
            case ZodFirstPartyTypeKind.ZodBoolean:
                return this.applyDescription({ type: 'boolean' }, schema);
            case ZodFirstPartyTypeKind.ZodDate:
                return this.applyDescription({ type: 'string', format: 'date-time' }, schema);
            case ZodFirstPartyTypeKind.ZodEnum:
                return this.applyDescription({ type: 'string', enum: schema._def.values }, schema);
            case ZodFirstPartyTypeKind.ZodNativeEnum: {
                const values = Object.values(schema._def.values).filter((value) => typeof value === 'string' || typeof value === 'number');
                return this.applyDescription({ enum: values }, schema);
            }
            case ZodFirstPartyTypeKind.ZodArray:
                return this.applyDescription({
                    type: 'array',
                    items: this.convertZodSchema(schema._def.type),
                }, schema);
            case ZodFirstPartyTypeKind.ZodUnion:
                return this.applyDescription({
                    anyOf: schema._def.options.map((option) => this.convertZodSchema(option)),
                }, schema);
            case ZodFirstPartyTypeKind.ZodLiteral:
                return this.applyDescription({ const: schema._def.value }, schema);
            case ZodFirstPartyTypeKind.ZodOptional:
            case ZodFirstPartyTypeKind.ZodNullable:
            case ZodFirstPartyTypeKind.ZodDefault:
                return this.convertZodSchema(schema._def.innerType);
            case ZodFirstPartyTypeKind.ZodEffects:
                return this.convertZodSchema(schema._def.schema);
            case ZodFirstPartyTypeKind.ZodRecord:
                return this.applyDescription({
                    type: 'object',
                    additionalProperties: this.convertZodSchema(schema._def.valueType),
                }, schema);
            case ZodFirstPartyTypeKind.ZodTuple:
                return this.applyDescription({
                    type: 'array',
                    prefixItems: schema._def.items.map((item) => this.convertZodSchema(item)),
                    minItems: schema._def.items.length,
                    maxItems: schema._def.items.length,
                }, schema);
            default:
                return this.applyDescription({ type: 'object' }, schema);
        }
    }
    applyDescription(jsonSchema, schema) {
        if (schema.description) {
            return {
                ...jsonSchema,
                description: schema.description,
            };
        }
        return jsonSchema;
    }
}
export default BaseAgent;
