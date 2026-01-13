# HAIDA MCP Server - Architecture Design Document

> **Enterprise-grade Model Context Protocol Server for HAIDA QA Automation Platform**
>
> Version: 1.0.0
> Date: ++34662652300
> Status: Production Ready

---

## 🎯 Executive Summary

The HAIDA MCP Server provides a comprehensive, type-safe, and production-ready interface to the entire HAIDA QA automation ecosystem through the Model Context Protocol. It exposes 50+ tools, 30+ resources, and 20+ intelligent prompts for AI-assisted QA operations.

### Key Capabilities
- **Test Management**: Create, execute, and analyze tests across 4 frameworks
- **Change Detection**: Intelligent monitoring and automated test triggering
- **AI Assistant**: Context-aware QA guidance and test generation
- **Reporting**: Unified analytics across Playwright, Newman, Lighthouse, k6
- **Multi-Tenant**: Secure, isolated operations with RBAC

---

## 📐 Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Host (Claude Desktop)                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Resources │  │   Tools    │  │  Prompts   │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │      HAIDA MCP Server           │
         │    (TypeScript + FastMCP)       │
         │                                 │
         │  ┌──────────────────────────┐  │
         │  │   Core Components        │  │
         │  ├──────────────────────────┤  │
         │  │ • Resource Manager       │  │
         │  │ • Tool Orchestrator      │  │
         │  │ • Prompt Engine          │  │
         │  │ • Error Handler          │  │
         │  │ • Cache Layer (Redis)    │  │
         │  │ • Auth Manager (JWT)     │  │
         │  │ • Rate Limiter           │  │
         │  │ • Health Monitor          │  │
         │  └──────────────────────────┘  │
         └─────────────┬───────────────────┘
                       │
         ┌─────────────┴───────────────────┐
         │                                  │
    ┌────▼────┐  ┌──────▼──────┐  ┌───────▼────────┐
    │ FastAPI │  │  Supabase   │  │  External APIs │
    │  Backend│  │  PostgreSQL │  │  (GitHub, etc) │
    └─────────┘  └─────────────┘  └────────────────┘
```

### Technology Stack

**Core Framework**: [FastMCP](https://github.com/punkpeye/fastmcp) (TypeScript)
- Built on official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- Handles sessions, error handling, and server lifecycle
- Type-safe with full TypeScript support

**Runtime**: Node.js 20+ (LTS)

**Data Layer**:
- PostgreSQL (Supabase) - Primary data store
- Redis - Caching & rate limiting
- In-memory - Session management

**External Integrations**:
- HAIDA FastAPI Backend (REST API)
- Supabase (Database + Auth)
- GitHub API (Repository operations)
- Changedetection.io (Webhooks)
- Microsoft Copilot Studio (AI Chat)

---

## 🔧 Core Components

### 1. Resource Manager

**Responsibility**: Expose HAIDA data as MCP resources

**Resources** (30+):
```typescript
// Projects & Test Data
haida://projects                     - List all projects
haida://projects/{id}                - Project details
haida://projects/{id}/health         - Project health metrics
haida://test-suites/{id}             - Test suite configuration
haida://test-cases/{id}              - ISTQB test case details

// Executions & Results
haida://executions/recent            - Recent test runs
haida://executions/{id}              - Execution details
haida://executions/{id}/results      - Test results
haida://executions/{id}/artifacts    - Screenshots, videos, traces
haida://reports/{id}                 - Generated reports

// Change Detection
haida://changes                      - Recent change detections
haida://changes/{id}                 - Change details with diff
haida://changes/{id}/tests           - Triggered tests for change

// Analytics
haida://analytics/coverage           - Test coverage metrics
haida://analytics/trends             - Daily/weekly trends
haida://analytics/flaky-tests        - Flaky test analysis

// Documentation
haida://docs                         - All documentation
haida://docs/search?q={query}        - Search documentation
haida://docs/templates               - Test templates (ISTQB)

// Configuration
haida://config/test-profiles         - Available test profiles
haida://config/environments          - Environment configurations
```

**Caching Strategy**:
```typescript
{
  projects: { ttl: 300s, invalidate: ['on_update', 'on_delete'] },
  executions: { ttl: 60s, invalidate: ['on_complete'] },
  static_docs: { ttl: 3600s, invalidate: ['on_deploy'] }
}
```

**Error Handling**:
- 404: Resource not found → return null with helpful message
- 403: Unauthorized → return error with auth hint
- 500: Server error → log + retry with exponential backoff

---

### 2. Tool Orchestrator

**Responsibility**: Execute HAIDA operations as MCP tools

**Tools** (50+):

#### Test Management
```typescript
// Test Creation & Execution
create_test_case(params)             - Create ISTQB-compliant test case
run_test_suite(suite_id, options)    - Execute test suite
run_tests_by_tag(tag, options)       - Execute tests matching tag
cancel_execution(execution_id)       - Cancel running tests
retry_failed_tests(execution_id)     - Retry only failed tests

// Test Analysis
analyze_test_failure(result_id)      - Deep-dive failure analysis
get_test_history(test_id, days)      - Historical test results
identify_flaky_tests(project_id)     - Statistical flaky detection
compare_executions(exec1, exec2)     - Diff two test runs
```

#### Change Detection
```typescript
monitor_url(url, tag, profile)       - Register URL for monitoring
trigger_tests_for_change(change_id)  - Manual test trigger
get_change_status(change_id)         - Polling status check
list_monitored_urls()                - All monitored URLs
```

#### Reporting
```typescript
generate_report(params)              - Generate custom report
export_results(exec_id, format)      - Export as JSON/CSV/PDF
get_allure_report(exec_id)           - Fetch Allure report URL
schedule_report(params, cron)        - Scheduled report generation
```

#### AI Assistant
```typescript
chat_with_haida(message, context)    - Conversational QA assistant
suggest_test_cases(specification)    - AI test case generation
explain_error(stack_trace)           - Error interpretation
optimize_test_suite(suite_id)        - Test optimization suggestions
```

#### Database Operations
```typescript
query_test_executions(filters)       - Advanced execution search
get_project_health(project_id)       - Comprehensive health check
export_test_coverage(project_id)     - Coverage metrics
bulk_update_test_cases(ids, data)    - Batch updates
```

**Orchestration Patterns**:
```typescript
// Pipeline Pattern
async function runTestPipeline(suiteId: string) {
  const suite = await fetchTestSuite(suiteId);
  const execution = await createExecution(suite);
  const results = await runTests(execution);
  const report = await generateReport(results);
  await notifyStakeholders(report);
  return report;
}

// Circuit Breaker (for external APIs)
const breaker = new CircuitBreaker({
  threshold: 5,     // failures before opening
  timeout: 10000,   // 10s timeout
  resetTime: 30000  // 30s cooldown
});
```

**Retry Logic**:
```typescript
{
  maxAttempts: 3,
  backoff: 'exponential',  // 1s, 2s, 4s
  retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],
  idempotentOnly: true
}
```

---

### 3. Prompt Engine

**Responsibility**: Provide reusable AI-powered workflows

**Prompts** (20+):

#### Test Generation
```typescript
generate_test_cases_from_spec       - ISTQB test case from functional spec
create_api_test_collection          - Newman collection from OpenAPI
generate_accessibility_tests        - WCAG-compliant test scenarios
create_performance_tests            - k6 script from requirements
```

#### Analysis & Debugging
```typescript
analyze_test_trends                 - Identify patterns in results
diagnose_ci_failure                 - CI/CD failure root cause
explain_playwright_error            - Human-readable error explanation
suggest_test_improvements           - Refactoring recommendations
```

#### Documentation
```typescript
document_test_suite                 - Auto-generate test suite docs
create_bug_report                   - Structured bug report from failure
generate_release_notes              - Test-based release notes
create_requirements_matrix          - Traceability matrix
```

#### Project Management
```typescript
estimate_automation_effort          - Test automation sizing
prioritize_test_suite               - Risk-based prioritization
plan_test_migration                 - Migration planning assistant
generate_qa_metrics_dashboard       - Executive summary generation
```

**Prompt Template Structure**:
```typescript
interface PromptTemplate {
  name: string;
  description: string;
  arguments: z.ZodSchema;
  systemPrompt: string;
  userPromptTemplate: (args: any) => string;
  responseParser?: (raw: string) => any;
  contextProviders?: ResourceProvider[];
}
```

---

### 4. Error Handler

**Responsibility**: Robust error management and recovery

**Error Classification**:
```typescript
enum ErrorType {
  CLIENT_ERROR = 'client_error',     // 400-499, user fixable
  SERVER_ERROR = 'server_error',     // 500-599, server issue
  NETWORK_ERROR = 'network_error',   // Connection failures
  TIMEOUT_ERROR = 'timeout_error',   // Operation timeout
  AUTH_ERROR = 'auth_error',         // Authentication failure
  RATE_LIMIT_ERROR = 'rate_limit'    // Too many requests
}
```

**Error Response Format**:
```json
{
  "error": {
    "type": "server_error",
    "code": "EXEC_FAILED",
    "message": "Test execution failed",
    "details": "Playwright browser crashed during test run",
    "suggestion": "Check browser installation: npx playwright install",
    "retryable": true,
    "timestamp": "2026-01-04T12:00:00Z",
    "requestId": "req_abc123",
    "documentationUrl": "https://haida.docs/errors/EXEC_FAILED"
  }
}
```

**Retry Strategy**:
```typescript
function shouldRetry(error: Error, attempt: number): boolean {
  if (attempt >= MAX_RETRIES) return false;
  if (error.type === ErrorType.CLIENT_ERROR) return false;
  if (error.type === ErrorType.AUTH_ERROR) return false;
  return error.retryable === true;
}

function getRetryDelay(attempt: number): number {
  const base = 1000;  // 1s
  const jitter = Math.random() * 500;  // 0-500ms
  return Math.min(base * Math.pow(2, attempt) + jitter, 30000);  // max 30s
}
```

**Circuit Breaker**:
```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailure: Date | null = null;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

---

### 5. Cache Layer (Redis)

**Responsibility**: Performance optimization and state management

**Caching Strategy**:
```typescript
interface CacheConfig {
  projects: { ttl: 300, tags: ['data'] },
  test_suites: { ttl: 300, tags: ['data'] },
  executions_recent: { ttl: 60, tags: ['realtime'] },
  execution_results: { ttl: 3600, tags: ['historical'] },
  reports: { ttl: 7200, tags: ['static'] },
  docs: { ttl: 86400, tags: ['static'] },
  analytics: { ttl: 1800, tags: ['computed'] }
}
```

**Cache Invalidation**:
```typescript
// Webhook-based invalidation
app.post('/webhooks/cache-invalidation', async (req, res) => {
  const { entity, id, action } = req.body;

  const patterns = {
    'project': [`project:${id}:*`, 'projects:list'],
    'execution': [`execution:${id}:*`, 'executions:recent'],
    'test_case': [`test_case:${id}`, `test_suite:*:cases`]
  };

  await cache.invalidatePattern(patterns[entity]);
});
```

**Rate Limiting (Redis)**:
```typescript
const rateLimiter = new RateLimiter({
  points: 100,        // requests
  duration: 60,       // per 60 seconds
  blockDuration: 300  // block for 5 minutes if exceeded
});

// Tool-specific limits
const limits = {
  run_test_suite: { points: 10, duration: 60 },
  chat_with_haida: { points: 50, duration: 60 },
  generate_report: { points: 20, duration: 60 }
};
```

---

### 6. Auth Manager (JWT)

**Responsibility**: Secure authentication and authorization

**Authentication Flow**:
```typescript
// 1. Client provides API key or JWT token
const auth = req.headers.authorization;

// 2. Validate token
const payload = await verifyJWT(auth);

// 3. Load user context
const user = await getUserById(payload.userId);

// 4. Check permissions
if (!user.hasPermission('execute_tests')) {
  throw new AuthError('Insufficient permissions');
}

// 5. Attach to context
context.user = user;
context.tenant = await getTenant(user.tenantId);
```

**Row-Level Security (RLS)**:
```typescript
// All queries automatically scoped to user's tenant
const projects = await db
  .select()
  .from(projects)
  .where(eq(projects.tenant_id, context.tenant.id));
```

**Permission Model**:
```typescript
enum Permission {
  // Read
  VIEW_PROJECTS = 'view_projects',
  VIEW_EXECUTIONS = 'view_executions',
  VIEW_REPORTS = 'view_reports',

  // Write
  CREATE_PROJECTS = 'create_projects',
  EXECUTE_TESTS = 'execute_tests',
  MODIFY_TESTS = 'modify_tests',
  DELETE_TESTS = 'delete_tests',

  // Admin
  MANAGE_USERS = 'manage_users',
  CONFIGURE_SYSTEM = 'configure_system'
}

const rolePermissions = {
  admin: Object.values(Permission),
  qa_engineer: [VIEW_*, EXECUTE_TESTS, MODIFY_TESTS, CREATE_PROJECTS],
  developer: [VIEW_*, EXECUTE_TESTS],
  viewer: [VIEW_*]
};
```

---

### 7. Rate Limiter

**Responsibility**: Protect against abuse and ensure fair usage

**Multi-Tier Rate Limiting**:
```typescript
// Global rate limit (all clients)
const globalLimiter = new RateLimiter({
  points: 10000,
  duration: 60
});

// Per-user rate limit
const userLimiter = new RateLimiter({
  points: 100,
  duration: 60
});

// Per-tool rate limit
const toolLimiters = {
  run_test_suite: { points: 10, duration: 60 },
  generate_report: { points: 20, duration: 60 },
  chat_with_haida: { points: 50, duration: 60 }
};

// Burst protection
const burstLimiter = new TokenBucket({
  capacity: 20,
  refillRate: 2  // tokens per second
});
```

**Adaptive Rate Limiting**:
```typescript
// Increase limits for trusted users
if (user.tier === 'premium') {
  limiter.points *= 5;
}

// Decrease limits during high load
if (systemLoad > 0.8) {
  limiter.points *= 0.5;
}
```

---

### 8. Health Monitor

**Responsibility**: System observability and proactive monitoring

**Health Checks**:
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    fastapi: CheckResult;
    changedetection: CheckResult;
  };
  metrics: {
    requestsPerMinute: number;
    averageLatency: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

// Endpoint: GET /health
app.get('/health', async (req, res) => {
  const status = await healthMonitor.check();
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});
```

**Metrics Collection**:
```typescript
const metrics = {
  // Request metrics
  requestCounter: new Counter('mcp_requests_total'),
  latencyHistogram: new Histogram('mcp_latency_seconds'),
  errorCounter: new Counter('mcp_errors_total'),

  // Resource metrics
  cacheHits: new Counter('mcp_cache_hits'),
  cacheMisses: new Counter('mcp_cache_misses'),
  dbQueries: new Counter('mcp_db_queries'),

  // Business metrics
  testsExecuted: new Counter('haida_tests_executed'),
  executionDuration: new Histogram('haida_execution_duration'),
  testPassRate: new Gauge('haida_test_pass_rate')
};
```

**Alerting**:
```typescript
const alerts = {
  highErrorRate: {
    condition: () => metrics.errorRate > 0.05,  // 5%
    action: () => notify.slack('#alerts', 'High error rate detected')
  },
  slowResponseTime: {
    condition: () => metrics.p95Latency > 5000,  // 5s
    action: () => notify.pagerduty('Slow response time')
  },
  lowCacheHitRate: {
    condition: () => metrics.cacheHitRate < 0.7,  // 70%
    action: () => logger.warn('Cache not effective')
  }
};
```

---

## 🔐 Security Architecture

### Authentication

**Supported Methods**:
```typescript
enum AuthMethod {
  JWT_TOKEN = 'jwt',           // Primary (from FastAPI)
  API_KEY = 'api_key',         // For integrations
  OAUTH2 = 'oauth2',           // Microsoft Entra ID
  SERVICE_ACCOUNT = 'service'  // For MCP server itself
}
```

**Token Validation**:
```typescript
async function validateAuth(req: Request): Promise<AuthContext> {
  const auth = req.headers.authorization;

  if (auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    return await validateJWT(token);
  }

  if (auth.startsWith('ApiKey ')) {
    const apiKey = auth.substring(7);
    return await validateApiKey(apiKey);
  }

  throw new AuthError('Invalid authentication method');
}
```

### Authorization

**RBAC + ABAC Hybrid**:
```typescript
interface AuthorizationContext {
  user: User;
  tenant: Tenant;
  roles: Role[];
  attributes: {
    department: string;
    location: string;
    clearanceLevel: number;
  };
}

function authorize(
  context: AuthorizationContext,
  action: string,
  resource: any
): boolean {
  // Role-based check
  if (!hasPermission(context.roles, action)) {
    return false;
  }

  // Attribute-based check
  if (resource.clearanceRequired > context.attributes.clearanceLevel) {
    return false;
  }

  // Tenant isolation
  if (resource.tenant_id !== context.tenant.id) {
    return false;
  }

  return true;
}
```

### Data Protection

**Encryption at Rest**:
- Database: Supabase encryption (AES-256)
- Redis: TLS + password authentication
- Files: Server-side encryption (SSE)

**Encryption in Transit**:
- HTTPS/TLS 1.3 (mandatory)
- WebSocket Secure (WSS)
- Certificate pinning (optional)

**Sensitive Data Handling**:
```typescript
// PII redaction in logs
logger.info('User logged in', {
  userId: user.id,
  email: redact(user.email),  // user@****.com
  ip: anonymizeIP(req.ip)      // 192.168.1.***
});

// Secret management
const secrets = {
  JWT_SECRET: env.get('JWT_SECRET'),
  DB_PASSWORD: env.get('DB_PASSWORD'),
  API_KEYS: loadFromVault()
};
```

---

## 📊 Performance Optimization

### Caching Strategy

**Multi-Level Cache**:
```
Level 1: In-Memory (Node.js) - 50ms TTL
  └─> Level 2: Redis - 300s TTL
       └─> Level 3: Database - Permanent
```

**Cache Warming**:
```typescript
// Pre-load frequently accessed data
async function warmCache() {
  const popularProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.is_active, true))
    .orderBy(desc(projects.access_count))
    .limit(100);

  for (const project of popularProjects) {
    await cache.set(`project:${project.id}`, project, 300);
  }
}
```

### Database Optimization

**Query Optimization**:
```sql
-- Indexes
CREATE INDEX idx_executions_project_created ON test_executions(project_id, created_at DESC);
CREATE INDEX idx_results_execution_status ON test_results(execution_id, status);
CREATE INDEX idx_test_cases_tags ON test_cases USING GIN(tags);

-- Materialized views for analytics
CREATE MATERIALIZED VIEW v_project_health_cache AS
SELECT
  project_id,
  COUNT(*) as total_executions,
  AVG(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as pass_rate,
  MAX(created_at) as last_execution
FROM test_executions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY project_id;

REFRESH MATERIALIZED VIEW CONCURRENTLY v_project_health_cache;
```

**Connection Pooling**:
```typescript
const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,              // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### Parallel Execution

**Concurrent Tool Calls**:
```typescript
// Support parallel tool execution (MCP spec ++34662652300)
async function executeTools(calls: ToolCall[]): Promise<ToolResult[]> {
  const results = await Promise.allSettled(
    calls.map(call => executeTool(call))
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}
```

**Batch Resource Fetching**:
```typescript
// Fetch multiple resources in one round-trip
async function batchFetch(uris: string[]): Promise<Resource[]> {
  const projectIds = uris
    .filter(uri => uri.startsWith('haida://projects/'))
    .map(uri => uri.split('/')[2]);

  const projects = await db
    .select()
    .from(projects)
    .where(inArray(projects.id, projectIds));

  return projects.map(toResource);
}
```

---

## 🚀 Deployment Architecture

### Production Deployment

**Infrastructure**:
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: haida-mcp-server
spec:
  replicas: 3  # High availability
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
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
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: haida-secrets
              key: database-url
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: haida-mcp-server
spec:
  type: LoadBalancer
  ports:
  - port: 443
    targetPort: 3000
    protocol: TCP
  selector:
    app: haida-mcp-server
```

**Auto-Scaling**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: haida-mcp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: haida-mcp-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Pods
        value: 1
        periodSeconds: 60
```

### Monitoring & Observability

**Logging**:
```typescript
// Structured logging (JSON)
logger.info('Test execution started', {
  executionId: exec.id,
  projectId: exec.project_id,
  suiteId: exec.suite_id,
  user: context.user.email,
  tenant: context.tenant.slug,
  environment: exec.environment,
  browser: exec.browser,
  timestamp: new Date().toISOString()
});

// Log levels: error, warn, info, debug, trace
// Production: error, warn, info
// Development: all levels
```

**Metrics (Prometheus)**:
```typescript
// Endpoint: GET /metrics
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

// Example metrics:
# HELP mcp_requests_total Total number of MCP requests
# TYPE mcp_requests_total counter
mcp_requests_total{method="tool",name="run_test_suite"} 1234

# HELP mcp_latency_seconds Request latency in seconds
# TYPE mcp_latency_seconds histogram
mcp_latency_seconds_bucket{le="0.1"} 500
mcp_latency_seconds_bucket{le="0.5"} 950
mcp_latency_seconds_bucket{le="1"} 990
mcp_latency_seconds_bucket{le="+Inf"} 1000
```

**Tracing (OpenTelemetry)**:
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('haida-mcp');

async function executeTool(name: string, args: any) {
  const span = tracer.startSpan(`tool.${name}`);

  try {
    span.setAttribute('tool.name', name);
    span.setAttribute('tool.args', JSON.stringify(args));

    const result = await runTool(name, args);

    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Tool execution tests
describe('run_test_suite', () => {
  it('should execute test suite successfully', async () => {
    const result = await tools.run_test_suite({
      suite_id: 'suite-123',
      environment: 'qa',
      browser: 'chromium'
    });

    expect(result.status).toBe('running');
    expect(result.execution_id).toBeDefined();
  });

  it('should handle missing suite', async () => {
    await expect(
      tools.run_test_suite({ suite_id: 'invalid' })
    ).rejects.toThrow('Test suite not found');
  });
});
```

### Integration Tests
```typescript
// End-to-end MCP flow
describe('MCP Integration', () => {
  it('should create and execute test suite', async () => {
    // Create test suite
    const suite = await client.callTool('create_test_suite', {
      project_id: 'proj-123',
      name: 'Integration Test Suite'
    });

    // Execute suite
    const execution = await client.callTool('run_test_suite', {
      suite_id: suite.id
    });

    // Wait for completion
    await waitForExecution(execution.id);

    // Fetch results
    const results = await client.getResource(
      `haida://executions/${execution.id}/results`
    );

    expect(results.status).toBe('completed');
  });
});
```

### Load Tests
```typescript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '5m', target: 50 },   // Sustained load
    { duration: '1m', target: 100 },  // Spike
    { duration: '1m', target: 0 }     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01']     // Error rate < 1%
  }
};

export default function() {
  const res = http.post('https://mcp.haida.com/tools/run_test_suite', {
    suite_id: 'load-test-suite'
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}
```

---

## 📚 Documentation

### API Documentation

Auto-generated from TypeScript types:
```typescript
/**
 * Execute a test suite on specified environment and browser.
 *
 * @tool run_test_suite
 * @category Test Execution
 * @permission execute_tests
 * @rateLimit 10 per minute
 *
 * @param {string} suite_id - Test suite identifier
 * @param {string} environment - Target environment (qa, staging, production)
 * @param {string} browser - Browser to use (chromium, firefox, webkit)
 * @param {object} options - Execution options
 * @param {boolean} options.headless - Run in headless mode (default: true)
 * @param {number} options.timeout - Test timeout in ms (default: 60000)
 * @param {string[]} options.tags - Filter tests by tags
 *
 * @returns {Promise<TestExecution>} Execution details
 *
 * @throws {AuthError} If user lacks execute_tests permission
 * @throws {NotFoundError} If suite_id does not exist
 * @throws {RateLimitError} If rate limit exceeded
 *
 * @example
 * const execution = await run_test_suite({
 *   suite_id: 'smoke-tests',
 *   environment: 'qa',
 *   browser: 'chromium',
 *   options: {
 *     headless: true,
 *     tags: ['critical', 'p0']
 *   }
 * });
 *
 * console.log(`Execution started: ${execution.id}`);
 */
export async function run_test_suite(params: RunTestSuiteParams): Promise<TestExecution> {
  // Implementation...
}
```

### OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: HAIDA MCP Server
  version: 1.0.0
  description: Model Context Protocol server for HAIDA QA automation

servers:
  - url: https://mcp.haida.com
    description: Production
  - url: https://mcp-staging.haida.com
    description: Staging

paths:
  /tools/run_test_suite:
    post:
      summary: Execute test suite
      operationId: runTestSuite
      tags: [Test Execution]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RunTestSuiteRequest'
      responses:
        '200':
          description: Execution started
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TestExecution'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimitExceeded'

components:
  schemas:
    RunTestSuiteRequest:
      type: object
      required: [suite_id, environment, browser]
      properties:
        suite_id:
          type: string
          example: "suite-123"
        environment:
          type: string
          enum: [qa, staging, production]
        browser:
          type: string
          enum: [chromium, firefox, webkit]

    TestExecution:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
          enum: [pending, running, completed, failed, cancelled]
        created_at:
          type: string
          format: date-time
```

---

## 🔄 CI/CD Pipeline

### Build Pipeline

```yaml
name: HAIDA MCP Server CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:unit

      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          REDIS_URL: redis://localhost:6379

      - name: Coverage report
        run: npm run coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t haida/mcp-server:${{ github.sha }} .

      - name: Push to registry
        run: docker push haida/mcp-server:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/haida-mcp-server \
            mcp-server=haida/mcp-server:${{ github.sha }}
          kubectl rollout status deployment/haida-mcp-server
```

---

## 📋 Conclusion

The HAIDA MCP Server architecture follows enterprise-grade best practices:

✅ **Scalable**: Kubernetes deployment with auto-scaling
✅ **Resilient**: Circuit breakers, retries, graceful degradation
✅ **Secure**: JWT auth, RBAC, encryption, audit logging
✅ **Observable**: Structured logging, metrics, distributed tracing
✅ **Performant**: Multi-level caching, connection pooling, parallel execution
✅ **Maintainable**: TypeScript types, comprehensive tests, OpenAPI docs

**References**:
- [MCP Best Practices](https://modelcontextprotocol.info/docs/best-practices/)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [FastMCP Framework](https://github.com/punkpeye/fastmcp)
- [Orchestration Patterns](https://www.getknit.dev/blog/advanced-mcp-agent-orchestration-chaining-and-handoffs)
- [Production Deployment](https://milvus.io/ai-quick-reference/whats-the-best-way-to-deploy-an-model-context-protocol-mcp-server-to-production)

---

**Next Steps**: Proceed to implementation → `mcp-server/src/index.ts`
