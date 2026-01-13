# DeepSeek AI MCP Server

This MCP server provides access to DeepSeek AI models and specialized subagents for different development tasks.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the server:**
   ```bash
   npm run build
   ```

3. **Set up DeepSeek API Key:**
   - Get a free API key from [DeepSeek Platform](https://platform.deepseek.com/)
   - Set the `DEEPSEEK_API_KEY` environment variable

4. **Configure MCP Settings:**
   The server should be automatically configured in your MCP settings. If not, add it manually to your `cline_mcp_settings.json`:

   ```json
   {
     "claude-opus-server": {
       "command": "node",
       "args": ["/path/to/claude-server/build/claude-server/index.js"],
       "env": {
         "DEEPSEEK_API_KEY": "${DEEPSEEK_API_KEY}"
       },
       "disabled": false,
       "autoApprove": [
         "claude_opus_4_5",
         "code_reviewer_agent",
         "qa_testing_agent",
         "architecture_agent",
         "documentation_agent"
       ]
     }
   }
   ```

## Available Tools

### 1. claude_opus_4_5
Direct access to DeepSeek AI models for advanced reasoning and analysis.

**Parameters:**
- `prompt` (string, required): The prompt to send to DeepSeek
- `maxTokens` (number, optional): Maximum tokens to generate (default: 4096)
- `temperature` (number, optional): Temperature for response randomness (0.0-1.0, default: 0.7)
- `systemPrompt` (string, optional): System prompt to set DeepSeek's behavior

### 2. code_reviewer_agent
Specialized agent for code review and analysis.

**Parameters:**
- `task` (string, required): Code review task or question
- `context` (string, optional): Additional context about the code or project

### 3. qa_testing_agent
Specialized agent for QA testing and automation.

**Parameters:**
- `task` (string, required): QA testing task or question
- `context` (string, optional): Context about the application or test requirements

### 4. architecture_agent
Specialized agent for system architecture and design.

**Parameters:**
- `task` (string, required): Architecture or design task
- `context` (string, optional): Context about the system or requirements

### 5. documentation_agent
Specialized agent for technical documentation.

**Parameters:**
- `task` (string, required): Documentation task
- `context` (string, optional): Context about what needs to be documented

## Usage Examples

### Using Claude Opus 4.5 directly:
```javascript
// Access via MCP tools
const result = await use_mcp_tool({
  server_name: "claude-opus-server",
  tool_name: "claude_opus_4_5",
  arguments: {
    prompt: "Explain the benefits of microservices architecture",
    maxTokens: 1000,
    temperature: 0.5
  }
});
```

### Using specialized agents:
```javascript
// Code review agent
const review = await use_mcp_tool({
  server_name: "claude-opus-server",
  tool_name: "code_reviewer_agent",
  arguments: {
    task: "Review this React component for performance issues",
    context: "Component handles large datasets and updates frequently"
  }
});

// QA testing agent
const qaGuidance = await use_mcp_tool({
  server_name: "claude-opus-server",
  tool_name: "qa_testing_agent",
  arguments: {
    task: "Design test cases for user authentication flow",
    context: "Web application with email/password and social login"
  }
});
```

## Integration with HAIDA Project

This MCP server is designed to work with the HAIDA QA automation framework, providing AI-powered assistance for:

- Test case generation and validation
- Code review and quality assurance
- Architecture design and documentation
- QA strategy and automation guidance

## Troubleshooting

### Common Issues:

1. **Missing API Key:**
   - Ensure `DEEPSEEK_API_KEY` environment variable is set
   - Verify your DeepSeek account is active and has credits

2. **Build Errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript compilation errors

3. **MCP Connection Issues:**
   - Verify the path to `build/claude-server/index.js` is correct
   - Check that the MCP server is not disabled in settings
   - Restart your MCP client after configuration changes

4. **Rate Limiting:**
   - DeepSeek has generous free tier limits, but consider upgrading for higher usage
   - Implement appropriate retry logic for production use

## Development

To modify or extend the server:

1. Edit `src/claude-server/index.ts`
2. Run `npm run build` to compile
3. Test changes by restarting the MCP server

## License

Internal/Proprietary - Hiberus QA Team