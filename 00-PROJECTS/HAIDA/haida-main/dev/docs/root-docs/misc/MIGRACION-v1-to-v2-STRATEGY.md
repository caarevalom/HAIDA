# 🚀 ESTRATEGIA DE MIGRACIÓN HAIDA v1.0 → v2.0

## Plan Detallado de Consolidación y Profesionalización

**Documento:** Migration Strategy v2.0  
**Fecha:** 16 Diciembre 2024  
**Objetivo:** Convertir v1.0 fragmentado a v2.0 unified, professional-grade

---

## 📋 TABLA DE CONTENIDOS

1. [Visión v2.0](#vision)
2. [Pilares del Refactoring](#pilares)
3. [Timeline & Roadmap](#timeline)
4. [Arquitectura Consolidada](#arquitectura)
5. [Plan Técnico Detallado](#plan-tecnico)
6. [Mitigación de Riesgos](#riesgos)
7. [Success Criteria](#criteria)

---

## 🎯 VISIÓN v2.0 {#vision}

### Estado Deseado

```
HAIDA v2.0: Professional, Unified, Complete
├── ✅ Un único directorio de fuente verdadera
├── ✅ Documentación consolidada y clara
├── ✅ 8/8 test profiles implementados
├── ✅ Autenticación + Rate Limiting
├── ✅ Base de datos con schema definido
├── ✅ Logging centralizado (Winston)
├── ✅ CLI tool único entry point
├── ✅ Sistema de versionamiento
├── ✅ Error handling robusto
├── ✅ Monitoreo y alerting
├── ✅ >70% code coverage
└── ✅ Production-ready deployment

BENEFICIOS INMEDIATOS:
- 🚀 Setup en <5 minutos (vs. 30 min actualmente)
- 🔒 Seguridad enterprise-grade
- 📈 Escalable a 1000s de webhooks/día
- 🛠️ Mantenible y extensible
- 📚 Documentación clara (vs. caótica ahora)
- 🎯 Claro roadmap para futuro
```

---

## 🏛️ PILARES DEL REFACTORING {#pilares}

### Pilar 1: Consolidación Estructural

**Objetivo:** Un único directorio, una fuente verdadera

```
ANTES (v1.0 - Caótico):
HAIDA/
├── haida-api/ (API)
├── tests/ (Tests)
├── docs/ (20+ archivos)
├── 40+ otros archivos
└── haida/ (SUBFOLDER)
    ├── haida-api/ (Duplicado?)
    ├── tests/ (Duplicado?)
    └── docs/ (Duplicado?)

DESPUÉS (v2.0 - Unificado):
/versions/v2.0/
├── src/
│   ├── api/
│   ├── tests/
│   ├── database/
│   └── config/
├── docker/
├── docs/ (Consolidado)
└── README.md (Punto de entrada único)
```

### Pilar 2: Profesionalización de Código

**Objetivo:** Enterprise-grade, production-ready

```
Antes:
- console.log para logging
- File I/O para datos
- Sin autenticación
- Sin rate limiting
- 1/8 test profiles

Después:
- Winston logger (structured, rotación, niveles)
- PostgreSQL + Knex (schema, migrations)
- JWT + HMAC (autenticación robusta)
- express-rate-limit (DDoS protection)
- 8/8 test profiles
- >70% code coverage
```

### Pilar 3: Escalabilidad y Monitoreo

**Objetivo:** Listo para producción a escala

```
Antes:
- Sin métricas
- Sin health checks
- Sin alerting
- Redis instalado pero no usado

Después:
- Prometheus metrics
- Health check dashboard
- Alert rules (down, high error rate)
- Redis para caching
- Tracer distribuido (OpenTelemetry opcional)
```

### Pilar 4: Documentación Unificada

**Objetivo:** Una fuente de verdad, múltiples formatos

```
Antes (18+ archivos duplicados):
- START-HERE.md (raíz)
- START-HERE.md (haida/)
- README.md (raíz)
- README.md (haida/)
- ... más duplicados

Después (1 índice maestro):
docs/
├── README.md (índice - dónde empezar)
├── 01-QUICKSTART.md
├── 02-INSTALLATION.md
├── 03-CONFIGURATION.md
├── 04-ARCHITECTURE.md
├── 05-API-REFERENCE.md
├── 06-DEVELOPER-GUIDE.md
├── 07-TROUBLESHOOTING.md
├── 08-FAQ.md
├── CHANGELOG.md
└── API-WEBHOOKS.md

+ Formatos derivados:
├── docs.html (versión HTML)
└── docs.pdf (versión PDF)
```

### Pilar 5: Versionamiento y Control

**Objetivo:** Versiones manejables, migración clara

```
/versions/
├── v1.0/
│   ├── ARCHIVED_CODE/
│   ├── CHANGELOG.md (qué cambió en v1.0)
│   ├── MIGRATION-v1-to-v2.md
│   └── README.md
│
└── v2.0/ (symlink a ../)
    ├── src/
    ├── docs/
    ├── CHANGELOG.md (qué es nuevo en v2.0)
    └── README.md

Migration Path:
v1.0 → (script de migración) → v2.0
     ← (datos históricos se importan)
```

---

## ⏱️ TIMELINE & ROADMAP {#timeline}

### Duración Total: 8-10 semanas (2-2.5 meses)

```
WEEK 1-2: PHASE 1 - Architecture & Planning
WEEK 3-4: PHASE 2 - Code Consolidation & Refactor
WEEK 5-6: PHASE 3 - Implement Critical Features
WEEK 7:   PHASE 4 - Testing & Validation
WEEK 8:   PHASE 5 - Documentation & Polish
WEEK 9-10: PHASE 6 - Launch & Stabilization
```

### PHASE 1: Architecture & Planning (Week 1-2)

**Days 1-3: Design Documents**

- [ ] Create detailed API specification
- [ ] Database schema design
- [ ] Configuration strategy document
- [ ] Error handling strategy
- [ ] Monitoring & alerting plan

**Days 4-6: Proof of Concept**

- [ ] Create sample v2.0 directory structure
- [ ] Spike on authentication approach
- [ ] Spike on logging strategy
- [ ] Create migration script skeleton

**Days 7-10: Planning**

- [ ] Create detailed work breakdown structure
- [ ] Assign tasks and estimate effort
- [ ] Create risk register
- [ ] Plan rollback strategy

**Deliverables:**

- ✅ Architecture document (this document)
- ✅ Detailed API specification
- ✅ Database schema ERD
- ✅ Risk mitigation plan

---

### PHASE 2: Code Consolidation & Refactor (Week 3-4)

**Days 1-3: Create v2.0 Structure**

- [ ] Create `/versions/v2.0/` directory
- [ ] Create directory structure (src/, docker/, docs/)
- [ ] Copy haida-api → src/api/
- [ ] Copy tests → src/tests/
- [ ] Copy docker-compose → docker/

**Days 4-6: Refactor server.js**

- [ ] Split into: server, routes, middleware, controllers
- [ ] Extract config to files
- [ ] Create service layer
- [ ] Create utility modules
- [ ] Add input validation (Joi)

**Days 7-10: Consolidate Tests & Config**

- [ ] Move test files to src/tests/
- [ ] Create test utilities
- [ ] Consolidate selectors
- [ ] Create playwright.config.js en src/
- [ ] Create jest.config.js para unit tests

**Days 11-14: Clean Documentation**

- [ ] Archive v1.0 to `/versions/v1.0/`
- [ ] Delete 40+ docs de otros proyectos
- [ ] Create docs/ directory en v2.0
- [ ] Start consolidating documentation

**Deliverables:**

- ✅ v2.0 directory structure complete
- ✅ Refactored server.js (modular)
- ✅ Consolidated tests
- ✅ Clean documentation start

---

### PHASE 3: Implement Critical Features (Week 5-6)

**Days 1-5: Database & Persistence**

- [ ] Create PostgreSQL schema
- [ ] Set up Knex.js with migrations
- [ ] Create seed data
- [ ] Implement data persistence layer
- [ ] Create database utilities

**Days 6-10: Authentication & Security**

- [ ] Implement JWT authentication
- [ ] Implement HMAC webhook signing
- [ ] Add express-rate-limit
- [ ] Add input validation
- [ ] Add audit logging

**Days 11-15: Logging & Monitoring**

- [ ] Integrate Winston logger
- [ ] Configure log rotation
- [ ] Create structured logging
- [ ] Add log correlation IDs
- [ ] Create health check endpoints

**Days 16-20: Test Profiles**

- [ ] Implement widget-rendering.spec.js
- [ ] Implement navigation-flow.spec.js
- [ ] Implement interaction.spec.js
- [ ] Implement data-rendering.spec.js
- [ ] Implement modal-handling.spec.js
- [ ] Implement performance-testing.spec.js
- [ ] Improve accessibility-full.spec.js

**Deliverables:**

- ✅ Full database schema with migrations
- ✅ Production-grade authentication
- ✅ Centralized logging with Winston
- ✅ 8/8 test profiles complete

---

### PHASE 4: Testing & Validation (Week 7)

**Days 1-3: Unit Tests**

- [ ] Write Jest tests for server.js
- [ ] Write tests for middleware
- [ ] Write tests for controllers
- [ ] Aim for >70% code coverage

**Days 4-5: Integration Tests**

- [ ] Test full webhook flow
- [ ] Test database persistence
- [ ] Test authentication
- [ ] Test error handling

**Days 6-7: Load Testing**

- [ ] Stress test webhook endpoint
- [ ] Test rate limiting
- [ ] Performance profiling
- [ ] Database query optimization

**Deliverables:**

- ✅ >70% code coverage
- ✅ All integration tests passing
- ✅ Load test report

---

### PHASE 5: Documentation & Polish (Week 8)

**Days 1-3: Complete Documentation**

- [ ] Finish all 8 docs
- [ ] Create API reference
- [ ] Create developer guide
- [ ] Create troubleshooting guide

**Days 4-5: Create CLI Tool**

- [ ] Build haida-cli (Node.js)
- [ ] Implement setup command
- [ ] Implement start/stop commands
- [ ] Implement test commands

**Days 6-7: Polish & Review**

- [ ] Code review and cleanup
- [ ] Documentation review
- [ ] Final testing
- [ ] Create release notes

**Deliverables:**

- ✅ Complete documentation (8 docs)
- ✅ haida-cli tool working
- ✅ Release notes

---

### PHASE 6: Launch & Stabilization (Week 9-10)

**Days 1-3: Pre-launch**

- [ ] Final QA testing
- [ ] Security review
- [ ] Performance review
- [ ] Documentation validation

**Days 4-5: Launch**

- [ ] Tag v2.0 in git
- [ ] Publish to npm (opcional)
- [ ] Create announcement
- [ ] Send notifications

**Days 6-10: Post-launch Monitoring**

- [ ] Monitor for issues
- [ ] Address bugs
- [ ] Gather feedback
- [ ] Plan v2.1 improvements

**Deliverables:**

- ✅ v2.0 launched and stable
- ✅ User feedback collected
- ✅ Bug tracking system active

---

## 🏗️ ARQUITECTURA CONSOLIDADA {#arquitectura}

### Directory Structure v2.0

```
/versions/v2.0/
│
├── src/
│   │
│   ├── api/
│   │   ├── server.js              # Express app (refactored)
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT + HMAC validation
│   │   │   ├── rateLimit.js       # express-rate-limit
│   │   │   ├── validation.js      # Input validation (Joi)
│   │   │   ├── errorHandler.js    # Global error handler
│   │   │   └── logging.js         # Request logging
│   │   │
│   │   ├── routes/
│   │   │   ├── webhooks.js        # /api/v1/webhooks/*
│   │   │   ├── results.js         # /api/v1/results/*
│   │   │   ├── profiles.js        # /api/v1/profiles/*
│   │   │   ├── metrics.js         # /api/v1/metrics/*
│   │   │   ├── health.js          # /api/v1/health
│   │   │   └── index.js           # Route aggregation
│   │   │
│   │   ├── controllers/
│   │   │   ├── webhookController.js
│   │   │   ├── resultController.js
│   │   │   ├── profileController.js
│   │   │   ├── metricController.js
│   │   │   └── healthController.js
│   │   │
│   │   ├── services/
│   │   │   ├── testProfileService.js    # determineTestProfile()
│   │   │   ├── testExecutionService.js  # launchTests()
│   │   │   ├── notificationService.js   # Slack, Email
│   │   │   ├── metricsService.js        # Prometheus
│   │   │   └── auditService.js          # Audit logging
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js          # Winston setup
│   │   │   ├── database.js        # Knex setup
│   │   │   ├── errors.js          # Custom error classes
│   │   │   └── validators.js      # Joi schemas
│   │   │
│   │   └── __tests__/
│   │       ├── server.test.js
│   │       ├── webhookController.test.js
│   │       ├── testExecutionService.test.js
│   │       └── ...
│   │
│   ├── tests/
│   │   ├── form-validation.spec.js       # ✅ Form inputs
│   │   ├── widget-rendering.spec.js      # 📊 Widgets
│   │   ├── navigation-flow.spec.js       # 🗺️ Navigation
│   │   ├── interaction.spec.js           # 🖱️ Interactions
│   │   ├── data-rendering.spec.js        # 📋 Tables/Lists
│   │   ├── modal-handling.spec.js        # 🪟 Modals/Dialogs
│   │   ├── performance-testing.spec.js   # ⚡ Performance
│   │   ├── accessibility-full.spec.js    # ♿ WCAG 2A
│   │   │
│   │   ├── fixtures/
│   │   │   ├── test-data.json
│   │   │   ├── selectors.js
│   │   │   └── mocks.js
│   │   │
│   │   ├── utils/
│   │   │   ├── testHelpers.js
│   │   │   ├── visualRegression.js
│   │   │   └── accessibility.js
│   │   │
│   │   └── reports/
│   │       ├── form-validation-report/
│   │       ├── widget-rendering-report/
│   │       └── ... (uno por profile)
│   │
│   ├── database/
│   │   ├── schema.sql              # Schema definition
│   │   ├── migrations/
│   │   │   ├── 001_create_tables.js
│   │   │   ├── 002_add_indexes.js
│   │   │   └── 003_create_audit_tables.js
│   │   │
│   │   ├── seeds/
│   │   │   ├── seed_users.js       # Admin user
│   │   │   └── seed_test_data.js   # Sample data
│   │   │
│   │   └── models/
│   │       ├── Webhook.js
│   │       ├── TestResult.js
│   │       ├── TestRun.js
│   │       ├── User.js
│   │       └── AuditLog.js
│   │
│   └── config/
│       ├── haida.yml              # Main configuration
│       ├── logger.js              # Winston config
│       ├── database.js            # Knex config
│       ├── cache.js               # Redis config
│       └── constants.js           # App constants
│
├── docker/
│   ├── docker-compose.yml         # 6 services
│   ├── Dockerfile                 # HAIDA API image
│   ├── init-db.sql               # PostgreSQL setup
│   ├── init-redis.conf           # Redis persistence
│   └── init-changedetection.json # Changedetection config
│
├── cli/
│   ├── haida-cli.js              # CLI entry point
│   ├── commands/
│   │   ├── setup.js              # Setup wizard
│   │   ├── start.js              # Start services
│   │   ├── stop.js               # Stop services
│   │   ├── test.js               # Run tests
│   │   ├── dashboard.js          # Open dashboard
│   │   ├── status.js             # Show status
│   │   └── cleanup.js            # Cleanup
│   │
│   └── utils/
│       ├── spinner.js            # CLI spinners
│       ├── colors.js             # CLI colors
│       └── prompts.js            # User input
│
├── docs/
│   ├── README.md                 # Index & navigation
│   ├── 01-QUICKSTART.md          # 5-min setup
│   ├── 02-INSTALLATION.md        # Detailed setup
│   ├── 03-CONFIGURATION.md       # Env vars & config
│   ├── 04-ARCHITECTURE.md        # System design
│   ├── 05-API-REFERENCE.md       # API endpoints
│   ├── 06-DEVELOPER-GUIDE.md     # For developers
│   ├── 07-TROUBLESHOOTING.md     # Common issues
│   ├── 08-FAQ.md                 # FAQ
│   ├── CHANGELOG.md              # Version history
│   ├── EXAMPLES.md               # Code examples
│   └── assets/
│       ├── architecture.png
│       ├── api-flow.png
│       └── dashboard.png
│
├── tools/
│   ├── migrate-v1-to-v2.js      # Migration script
│   ├── benchmark.js              # Performance testing
│   └── generator.js              # Code generators
│
├── .env.example                  # Template vars
├── .gitignore
├── .eslintrc.js                 # Linting rules
├── .prettierrc                   # Code formatting
├── package.json                  # Dependencies
├── package-lock.json
├── jest.config.js                # Jest configuration
├── playwright.config.js          # Playwright config
├── tsconfig.json                 # TypeScript (future)
├── README.md                     # Main readme
├── LICENSE
└── MIGRATION-GUIDE.md            # v1 → v2 guide
```

### version/v1.0/ Structure

```
/versions/v1.0/
├── ARCHIVED_CODE/                # Original v1.0 source
│   ├── haida-api/
│   ├── change-detection/
│   ├── tests/
│   └── ... (original structure)
│
├── CHANGELOG.md                  # What was in v1.0
├── MIGRATION-v1-to-v2.md        # How to migrate
└── README.md                     # v1.0 documentation
```

---

## 🛠️ PLAN TÉCNICO DETALLADO {#plan-tecnico}

### 1. Refactoring de server.js

**Antes (459 líneas, monolítico):**

```javascript
const express = require('express');
const app = express();

// Todo mezclado:
// - Middleware
// - Routes
// - Business logic
// - Error handling
// - Logging

app.post('/webhook/change-detected', (req, res) => {
  // TODO: 50+ líneas de lógica
  // TODO: Sin manejo de errores
  // TODO: Sin logging
  // TODO: Sin validación
});
```

**Después (Modularizado):**

```javascript
// src/api/server.js (100 líneas - solo orchestration)
const express = require('express');
const config = require('../config/haida');
const logger = require('../utils/logger');
const middleware = require('./middleware');
const routes = require('./routes');

const app = express();

// Setup middleware
app.use(middleware.logging);
app.use(middleware.validation);
app.use(middleware.auth);
app.use(middleware.rateLimit);

// Setup routes
app.use('/api/v1', routes);

// Global error handler
app.use(middleware.errorHandler);

module.exports = app;
```

**Ventajas:**

- 🎯 Single responsibility
- 🔧 Fácil de mantener
- 🧪 Fácil de testear
- 📈 Escalable

---

### 2. Introducir Autenticación

**Implementación JWT + HMAC:**

```javascript
// src/api/middleware/auth.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function authenticateWebhook(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  // Verify HMAC signature
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

function authenticateAPI(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticateWebhook, authenticateAPI };
```

**Configuración .env:**

```env
JWT_SECRET=your-super-secret-key-min-32-chars
WEBHOOK_SECRET=webhook-secret-for-changedetection
API_KEY_EXPIRY=24h
```

---

### 3. Implementar Database Persistence

**Schema PostgreSQL:**

```sql
-- src/database/schema.sql

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(255) NOT NULL,
  tag VARCHAR(100),
  change_type VARCHAR(50),
  payload JSONB NOT NULL,
  received_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_status (status),
  INDEX idx_url (url),
  INDEX idx_received_at (received_at)
);

CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  profile_name VARCHAR(100) NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- PASSED, FAILED, SKIPPED
  duration_ms INTEGER,
  error_message TEXT,
  screenshot_path VARCHAR(255),
  browser VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_webhook_id (webhook_id),
  INDEX idx_profile_name (profile_name),
  INDEX idx_status (status)
);

CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(20),  -- RUNNING, PASSED, FAILED
  total_tests INTEGER,
  passed_tests INTEGER,
  failed_tests INTEGER,
  duration_ms INTEGER,

  INDEX idx_webhook_id (webhook_id),
  INDEX idx_status (status)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Create indexes for common queries
CREATE INDEX idx_webhooks_recent ON webhooks(created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_results_by_profile_date ON test_results(profile_name, created_at DESC);
```

**Knex Migration:**

```javascript
// src/database/migrations/001_create_tables.js
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email', 255).unique().notNullable();
      table.string('api_key', 255).unique().notNullable();
      table.string('role', 50).defaultTo('user');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('webhooks', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('url', 255).notNullable();
      table.string('tag', 100);
      table.string('change_type', 50);
      table.json('payload').notNullable();
      table.timestamp('received_at').defaultTo(knex.fn.now());
      table.string('status', 20).defaultTo('pending');
      table.timestamp('processed_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.index('status');
      table.index('url');
      table.index('received_at');
    });
  // ... más tables
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('webhooks').dropTableIfExists('users');
  // ... resto
};
```

---

### 4. Logging Centralizado con Winston

```javascript
// src/utils/logger.js
const winston = require('winston');
const config = require('../config/haida');

const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'haida-api' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // All logs
    new winston.transports.File({
      filename: 'logs/app.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console output in development
if (config.nodeEnv === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

module.exports = logger;
```

**Uso en toda la app:**

```javascript
// src/api/routes/webhooks.js
const logger = require('../../utils/logger');

router.post('/change-detected', async (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || generateId();

  try {
    logger.info('Webhook received', {
      correlationId,
      url: req.body.url,
      tag: req.body.tag,
    });

    const result = await processWebhook(req.body);

    logger.info('Webhook processed successfully', {
      correlationId,
      webhook_id: result.id,
      test_count: result.testCount,
    });

    res.json({ success: true, webhookId: result.id });
  } catch (error) {
    logger.error('Webhook processing failed', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
});
```

---

### 5. Rate Limiting

```javascript
// src/api/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Webhook endpoint: 100 requests per IP per 15 minutes
const webhookLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'webhook-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// API endpoint: 1000 requests per API key per hour
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'api-limit:',
  }),
  keyGenerator: (req) => req.user?.apiKey || req.ip,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
});

module.exports = { webhookLimiter, apiLimiter };
```

---

### 6. Input Validation con Joi

```javascript
// src/utils/validators.js
const Joi = require('joi');

const webhookPayloadSchema = Joi.object({
  url: Joi.string().uri().required(),
  tag: Joi.string().max(100),
  change_type: Joi.string().valid('DOM_CHANGE', 'CSS_CHANGE', 'JS_CHANGE', 'TEXT_CHANGE'),
  payload: Joi.object().required(),
  timestamp: Joi.date().iso(),
}).unknown(true);

function validateWebhook(payload) {
  const { error, value } = webhookPayloadSchema.validate(payload);
  if (error) throw new Error(`Invalid payload: ${error.message}`);
  return value;
}

module.exports = { validateWebhook };
```

---

## ⚠️ MITIGACIÓN DE RIESGOS {#riesgos}

### Riesgo #1: Datos Históricos Se Pierden

**Probabilidad:** Alta  
**Impacto:** Alto

**Mitigación:**

- [ ] Crear script de migración que importa v1.0 file results a v2.0 DB
- [ ] Backup de todos los JSONs originales en `/versions/v1.0/backup/`
- [ ] Documentar proceso de migración
- [ ] Dry-run antes de producción

---

### Riesgo #2: Downtime Durante Migración

**Probabilidad:** Media  
**Impacto:** Medio

**Mitigación:**

- [ ] Mantener v1.0 running mientras se desarrolla v2.0
- [ ] Crear blue-green deployment
- [ ] Test full failover antes de cutover
- [ ] Plan de rollback en <1 hora

---

### Riesgo #3: Incompatibilidad de API

**Probabilidad:** Media  
**Impacto:** Alto

**Mitigación:**

- [ ] Mantener compatibilidad backwards si es posible
- [ ] Crear v1 API wrapper que mapea a v2
- [ ] Documentar breaking changes claro
- [ ] Deprecation period de 2 semanas

---

### Riesgo #4: Performance Regression

**Probabilidad:** Baja  
**Impacto:** Alto

**Mitigación:**

- [ ] Benchmark v1.0 (baseline)
- [ ] Benchmark v2.0 (target: +/- 5%)
- [ ] Load test con 1000 webhooks/día
- [ ] Database query optimization

---

### Riesgo #5: Security Vulnerabilities

**Probabilidad:** Media  
**Impacto:** Alto

**Mitigación:**

- [ ] Security audit de nuevo código
- [ ] Dependency scanning (Snyk)
- [ ] OWASP Top 10 review
- [ ] Penetration testing (opcional)

---

## ✅ SUCCESS CRITERIA {#criteria}

### Funcional

- [x] v2.0 directory structure creado y documentado
- [ ] 8/8 test profiles implementados y funcionales
- [ ] Autenticación JWT + HMAC working
- [ ] Database schema con todos los datos
- [ ] Rate limiting funcionando
- [ ] Logging centralizado funcional
- [ ] CLI tool creada y testeable
- [ ] All endpoints responsive (<100ms)

### Quality

- [ ] > 70% code coverage (Jest)
- [ ] All tests passing (both Jest y Playwright)
- [ ] No security vulnerabilities (npm audit)
- [ ] <30 second webhook to result
- [ ] Zero data loss on migration

### Documentation

- [ ] 8 documentation files complete
- [ ] API reference up-to-date
- [ ] Troubleshooting guide with 20+ scenarios
- [ ] Developer guide with examples
- [ ] MIGRATION-v1-to-v2 guide clear and complete

### User Experience

- [ ] Setup in <5 minutes (vs 30 min v1.0)
- [ ] Clear entry point (haida-cli)
- [ ] Intuitive error messages
- [ ] Health check dashboard
- [ ] Migration path transparent

---

## 📋 RESUMEN EJECUCIÓN

| Aspecto               | v1.0          | v2.0                 | Mejora          |
| --------------------- | ------------- | -------------------- | --------------- |
| **Test Profiles**     | 1/8           | 8/8                  | ✅ +700%        |
| **Security**          | None          | JWT+HMAC+RateLimit   | ✅ Enterprise   |
| **Logging**           | console.log   | Winston + structured | ✅ Professional |
| **Persistence**       | File I/O      | PostgreSQL + schema  | ✅ Scalable     |
| **Setup Time**        | 30 min        | 5 min                | ✅ -80%         |
| **Code Organization** | Monolithic    | Modular              | ✅ Maintainable |
| **Documentation**     | 18+ redundant | 8 consolidated       | ✅ Clear        |
| **Monitoring**        | None          | Prometheus + health  | ✅ Observable   |
| **Code Coverage**     | Unknown       | >70%                 | ✅ Testable     |

---

**Conclusión:** Con este plan de 8-10 semanas, HAIDA se transformará de un sistema fragmentado y limitado a una herramienta professional-grade, production-ready, completamente integrada y escalable.

**Siguiente Paso:** Aprobación de este plan y inicio de FASE 1
