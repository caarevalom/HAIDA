#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY environment variable is required');
}
const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});
const isValidClaudeArgs = (args) => typeof args === 'object' &&
    args !== null &&
    typeof args.prompt === 'string' &&
    (args.maxTokens === undefined || typeof args.maxTokens === 'number') &&
    (args.temperature === undefined || typeof args.temperature === 'number') &&
    (args.systemPrompt === undefined || typeof args.systemPrompt === 'string');
const isValidSubagentArgs = (args) => typeof args === 'object' &&
    args !== null &&
    typeof args.agent === 'string' &&
    typeof args.task === 'string' &&
    (args.context === undefined || typeof args.context === 'string');
class ClaudeServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'claude-opus-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'claude_opus_4_5',
                    description: 'Access Claude Opus 4.5 model for advanced reasoning and analysis',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'The prompt to send to Claude Opus 4.5',
                            },
                            maxTokens: {
                                type: 'number',
                                description: 'Maximum tokens to generate (default: 4096)',
                                minimum: 1,
                                maximum: 4096,
                            },
                            temperature: {
                                type: 'number',
                                description: 'Temperature for response randomness (0.0-1.0, default: 0.7)',
                                minimum: 0.0,
                                maximum: 1.0,
                            },
                            systemPrompt: {
                                type: 'string',
                                description: 'System prompt to set Claude\'s behavior',
                            },
                        },
                        required: ['prompt'],
                    },
                },
                {
                    name: 'code_reviewer_agent',
                    description: 'Specialized agent for code review and analysis',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                description: 'Code review task or question',
                            },
                            context: {
                                type: 'string',
                                description: 'Additional context about the code or project',
                            },
                        },
                        required: ['task'],
                    },
                },
                {
                    name: 'qa_testing_agent',
                    description: 'Specialized agent for QA testing and automation',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                description: 'QA testing task or question',
                            },
                            context: {
                                type: 'string',
                                description: 'Context about the application or test requirements',
                            },
                        },
                        required: ['task'],
                    },
                },
                {
                    name: 'architecture_agent',
                    description: 'Specialized agent for system architecture and design',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                description: 'Architecture or design task',
                            },
                            context: {
                                type: 'string',
                                description: 'Context about the system or requirements',
                            },
                        },
                        required: ['task'],
                    },
                },
                {
                    name: 'documentation_agent',
                    description: 'Specialized agent for technical documentation',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                description: 'Documentation task',
                            },
                            context: {
                                type: 'string',
                                description: 'Context about what needs to be documented',
                            },
                        },
                        required: ['task'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'claude_opus_4_5':
                    return this.handleClaudeOpus(args);
                case 'code_reviewer_agent':
                    return this.handleSubagent('code_reviewer', args);
                case 'qa_testing_agent':
                    return this.handleSubagent('qa_testing', args);
                case 'architecture_agent':
                    return this.handleSubagent('architecture', args);
                case 'documentation_agent':
                    return this.handleSubagent('documentation', args);
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        });
    }
    async handleClaudeOpus(args) {
        if (!isValidClaudeArgs(args)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid Claude Opus arguments');
        }
        const { prompt, maxTokens = 4096, temperature = 0.7, systemPrompt } = args;
        try {
            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });
            const response = await client.chat.completions.create({
                model: 'deepseek-chat', // DeepSeek's main model
                max_tokens: maxTokens,
                temperature: temperature,
                messages: messages,
            });
            const content = response.choices[0].message.content || '';
            return {
                content: [
                    {
                        type: 'text',
                        text: content,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `DeepSeek API error: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleSubagent(agentType, args) {
        if (!isValidSubagentArgs(args)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid subagent arguments');
        }
        const { task, context = '' } = args;
        // Define specialized prompts for each subagent
        const agentPrompts = {
            code_reviewer: `You are an expert code reviewer with extensive experience in software development best practices, security, and performance optimization. Analyze the following code review request and provide detailed, actionable feedback.

Task: ${task}
${context ? `Context: ${context}` : ''}

Provide your analysis in a structured format with:
1. Overall assessment
2. Specific issues found
3. Security considerations
4. Performance recommendations
5. Best practices suggestions`,
            qa_testing: `You are a senior QA engineer specializing in automated testing, test strategy, and quality assurance. Help with the following QA/testing request.

Task: ${task}
${context ? `Context: ${context}` : ''}

Provide comprehensive QA guidance including:
1. Test strategy recommendations
2. Test case suggestions
3. Automation opportunities
4. Quality metrics
5. Risk assessment`,
            architecture: `You are a senior software architect with expertise in system design, scalability, and technical leadership. Address the following architecture/design request.

Task: ${task}
${context ? `Context: ${context}` : ''}

Provide architectural guidance covering:
1. System design recommendations
2. Technology choices
3. Scalability considerations
4. Security architecture
5. Implementation roadmap`,
            documentation: `You are a technical writer specializing in clear, comprehensive documentation for software projects. Help with the following documentation request.

Task: ${task}
${context ? `Context: ${context}` : ''}

Provide documentation that includes:
1. Clear structure and organization
2. Comprehensive coverage
3. Code examples where relevant
4. Usage instructions
5. Best practices and guidelines`,
        };
        const systemPrompt = agentPrompts[agentType];
        try {
            const response = await client.chat.completions.create({
                model: 'deepseek-chat',
                max_tokens: 4096,
                temperature: 0.7,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Please help me with this ${agentType.replace('_', ' ')} task.` },
                ],
            });
            const content = response.choices[0].message.content || '';
            return {
                content: [
                    {
                        type: 'text',
                        text: content,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Subagent API error: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Claude Opus 4.5 MCP server running on stdio');
    }
}
const server = new ClaudeServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map