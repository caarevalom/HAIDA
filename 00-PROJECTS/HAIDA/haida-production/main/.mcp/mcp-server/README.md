# HAIDA MCP Server

> **Enterprise-grade Model Context Protocol server for HAIDA QA Automation Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.0-green)](https://github.com/modelcontextprotocol/typescript-sdk)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Overview

The HAIDA MCP Server exposes the complete HAIDA QA automation ecosystem through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling AI assistants like Claude to interact with your test infrastructure, execute tests, analyze results, and provide intelligent QA guidance.

### Key Features

✅ **50+ Tools** - Test management, execution, analysis, and reporting
✅ **30+ Resources** - Access to projects, executions, results, and analytics
✅ **20+ AI Prompts** - Intelligent test generation and failure analysis
✅ **Enterprise Security** - JWT auth, RBAC, rate limiting, audit logging
✅ **High Performance** - Multi-level caching, connection pooling, parallel execution
✅ **Production Ready** - Health checks, metrics, distributed tracing, auto-scaling

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Host (Claude Desktop)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Resources │  │   Tools    │  │  Prompts   │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │      HAIDA MCP Server           │
         │  ┌──────────────────────────┐  │
         │  │ • Resource Manager       │  │
         │  │ • Tool Orchestrator      │  │
         │  │ • Prompt Engine          │  │
         │  │ • Cache Layer (Redis)    │  │
         │  │ • Auth Manager (JWT)     │  │
         │  │ • Rate Limiter           │  │
         │  │ • Health Monitor          │  │
         │  │ • Metrics Collector      │  │
         │  └──────────────────────────┘  │
         └─────────────┬───────────────────┘
                       │
         ┌─────────────┴───────────────────┐
         │                                  │
    ┌────▼────┐  ┌──────▼──────┐  ┌───────▼────────┐
    │ FastAPI │  │  Supabase   │  │  External APIs │
    └─────────┘  └─────────────┘  └────────────────┘
```

**[→ Complete Architecture Documentation](./ARCHITECTURE.md)**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL (Supabase)
- Redis
- HAIDA FastAPI backend running

### Installation

```bash
# Clone repository
git clone https://github.com/haida/mcp-server.git
cd mcp-server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Build
npm run build

# Start server
npm start
```

### Development Mode

```bash
# Watch mode with auto-reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

---

## 🔧 Configuration

### Environment Variables

See [`.env.example`](./.env.example) for all available configuration options.

**Required:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
FASTAPI_BASE_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
```

### Claude Desktop Integration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "haida": {
      "command": "node",
      "args": ["/path/to/haida-mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your_anon_key"
      }
    }
  }
}
```

---

## 📚 Capabilities

### Tools (50+)

#### Test Management
```typescript
// Create ISTQB-compliant test case
create_test_case({
  suite_id: "suite-123",
  name: "Login with valid credentials",
  steps: "1. Navigate to login\n2. Enter email\n3. Enter password\n4. Click submit",
  expected: "User redirected to dashboard"
})

// Execute test suite
run_test_suite({
  suite_id: "smoke-tests",
  environment: "qa",
  browser: "chromium"
})

// Analyze failures
analyze_test_failure({
  result_id: "result-456"
})
```

#### Change Detection
```typescript
// Monitor URL for changes
monitor_url({
  url: "https://app.example.com/login",
  tag: "login",
  profile: "form-validation"
})

// Trigger tests for detected change
trigger_tests_for_change({
  change_id: "change-789"
})
```

#### Reporting
```typescript
// Generate custom report
generate_report({
  project_id: "proj-123",
  type: "execution_summary",
  date_range_start: "++34662652300",
  date_range_end: "++34662652300"
})

// Export results
export_results({
  execution_id: "exec-123",
  format: "csv"
})
```

**[→ Complete Tools Reference](./docs/TOOLS.md)**

### Resources (30+)

```typescript
// Access project data
haida://projects                      // List all projects
haida://projects/{id}                 // Project details
haida://projects/{id}/health          // Health metrics

// Test execution data
haida://executions/recent             // Recent runs
haida://executions/{id}/results       // Test results
haida://executions/{id}/artifacts     // Screenshots, videos

// Analytics
haida://analytics/coverage            // Test coverage
haida://analytics/trends              // Trends over time
haida://analytics/flaky-tests         // Flaky test analysis

// Documentation
haida://docs                          // All docs
haida://docs/search?q={query}         // Search docs
```

**[→ Complete Resources Reference](./docs/RESOURCES.md)**

### Prompts (20+)

```typescript
// AI-powered test generation
generate_test_cases_from_spec({
  specification: "# User Login Feature\n..."
})

// Failure analysis
diagnose_ci_failure({
  execution_id: "exec-123"
})

// Test optimization
suggest_test_improvements({
  suite_id: "regression-suite"
})
```

**[→ Complete Prompts Reference](./docs/PROMPTS.md)**

---

## 🔐 Security

### Authentication

The server supports multiple authentication methods:

1. **JWT Tokens** (Primary)
   ```typescript
   headers: {
     'Authorization': 'Bearer eyJhbGc...'
   }
   ```

2. **API Keys** (For integrations)
   ```typescript
   headers: {
     'Authorization': 'ApiKey haida_...'
   }
   ```

3. **OAuth 2.0** (Microsoft Entra ID)

### Authorization

- **RBAC**: Role-based access control (admin, qa_engineer, developer, viewer)
- **ABAC**: Attribute-based access control
- **RLS**: Row-level security (tenant isolation)
- **Audit Logging**: All operations logged

### Rate Limiting

```typescript
Global: 10,000 requests/minute
Per User: 100 requests/minute
Per Tool:
  - run_test_suite: 10/minute
  - generate_report: 20/minute
  - chat_with_haida: 50/minute
```

---

## 📊 Monitoring

### Health Checks

```bash
# Simple health check
GET /health

# Detailed status
GET /health/detailed
```

### Metrics (Prometheus)

```bash
# Prometheus metrics endpoint
GET /metrics

# Example metrics:
mcp_requests_total{method="tool",name="run_test_suite"} 1234
mcp_latency_seconds_bucket{le="0.5"} 950
mcp_errors_total{type="server_error"} 12
mcp_cache_hits 5678
```

### Logging

Structured JSON logging with Pino:

```json
{
  "level": "info",
  "time": "2026-01-04T12:00:00.000Z",
  "msg": "Test execution started",
  "executionId": "exec-123",
  "projectId": "proj-456",
  "user": "hola@stayarta.com",
  "tenant": "acme-corp"
}
```

---

## 🚀 Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: haida-mcp-server
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: mcp-server
        image: haida/mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
```

**[→ Complete Deployment Guide](./docs/DEPLOYMENT.md)**

---

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage

# Load tests (k6)
k6 run tests/load/mcp-server.js
```

---

## 📖 Documentation

- **[Architecture](./ARCHITECTURE.md)** - Complete system design
- **[Tools Reference](./docs/TOOLS.md)** - All available tools
- **[Resources Reference](./docs/RESOURCES.md)** - All available resources
- **[Prompts Reference](./docs/PROMPTS.md)** - All AI prompts
- **[API Documentation](./docs/API.md)** - REST API reference
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[Security Guide](./docs/SECURITY.md)** - Security best practices
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run all checks
npm run validate
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [https://haida.docs.io](https://haida.docs.io)
- **Issues**: [GitHub Issues](https://github.com/haida/mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/haida/mcp-server/discussions)
- **Email**: hola@stayarta.com

---

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [FastMCP Framework](https://github.com/punkpeye/fastmcp)
- HAIDA QA Team

---

**Built with ❤️ by the HAIDA Team**

*Empowering AI-driven QA automation for modern software development*
