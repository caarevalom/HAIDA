# 🎯 HAIDA - Visión del Proyecto y Roadmap

## Fecha
18 de diciembre de 2025

---

## 🌟 Visión del Proyecto

**HAIDA** es una plataforma completa de gestión y automatización de testing que cumple con los estándares ISTQB, integrando análisis inteligente de documentación, generación automática de casos de prueba, ejecución multi-plataforma, y gestión de incidencias.

---

## 🏗️ Arquitectura Objetivo

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                     HAIDA Platform                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend    │  │  Database    │        │
│  │   React/Next │  │  FastAPI     │  │  PostgreSQL  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │         Módulo 1: Análisis de Documentación       │         │
│  │  - Upload de docs (PDF, Word, MD, Confluence)    │         │
│  │  - Análisis IA (Claude/GPT) → Requisitos         │         │
│  │  - Generación casos de prueba ISTQB              │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │      Módulo 2: Gestión de Test Suites            │         │
│  │  - Editor de casos de prueba                      │         │
│  │  - Review/Aprobación por QA Leader               │         │
│  │  - Versionado de test cases                       │         │
│  │  - Asignación de prioridades                      │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 3: Configuración de Proyectos          │         │
│  │  - Variables de entorno por proyecto             │         │
│  │  - Usuarios/Credenciales (cifrados)              │         │
│  │  - URLs (dev, staging, prod)                      │         │
│  │  - Datos de prueba (fixtures)                     │         │
│  │  - Tablero configurable por QA                    │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 4: Motor de Ejecución                  │         │
│  │  - Playwright (Web: Chrome, Firefox, Safari)     │         │
│  │  - Appium (Mobile: iOS, Android)                 │         │
│  │  - Selenium Grid (escalabilidad)                 │         │
│  │  - BrowserStack/LambdaTest (cloud)               │         │
│  │  - Ejecución paralela                             │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 5: Captura de Evidencias               │         │
│  │  - Screenshots automáticos                        │         │
│  │  - Video recording                                │         │
│  │  - Logs detallados                                │         │
│  │  - Network traces                                 │         │
│  │  - Almacenamiento en S3/Azure Blob                │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 6: Gestión de Incidencias              │         │
│  │  - Detección automática de fallos                │         │
│  │  - Creación de tickets (Jira, Azure DevOps)      │         │
│  │  - Análisis de fallos con IA                      │         │
│  │  - Sugerencias de fix                             │         │
│  │  - Tracking de bugs                               │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 7: Change Detection                     │         │
│  │  - Changedetection.io integration                │         │
│  │  - Visual regression testing                      │         │
│  │  - Trigger automático de tests                    │         │
│  │  - Notificaciones (Slack, Teams, Email)          │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 8: Reportes y Analytics                │         │
│  │  - Dashboard ejecutivo                            │         │
│  │  - Reportes Allure                                │         │
│  │  - Métricas ISTQB (cobertura, pass rate)         │         │
│  │  - Trends y análisis histórico                    │         │
│  │  - Export PDF/Excel                               │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │    Módulo 9: Gestión de Usuarios y Roles         │         │
│  │  - Admin: Configuración global                    │         │
│  │  - QA Leader: Revisión y aprobación               │         │
│  │  - QA Analyst: Ejecución y análisis               │         │
│  │  - Developer: Solo lectura de resultados          │         │
│  │  - Stakeholder: Dashboard ejecutivo               │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Estado Actual vs Estado Objetivo

| Módulo | Estado Actual | Completado | Siguiente |
|--------|---------------|------------|-----------|
| 1. Análisis Docs | 🟡 Parcial (generadores) | 30% | Integrar IA API |
| 2. Test Suites | ❌ No existe | 0% | Crear backend + frontend |
| 3. Config Proyectos | ❌ No existe | 0% | BBDD + UI |
| 4. Motor Ejecución | 🟢 Playwright básico | 40% | Appium + Grid |
| 5. Evidencias | 🟡 Screenshots | 50% | Video + Storage cloud |
| 6. Incidencias | ❌ No existe | 0% | Integración Jira/ADO |
| 7. Change Detection | 🟢 Implementado | 70% | Refinar triggers |
| 8. Reportes | 🟡 Allure básico | 30% | Dashboard completo |
| 9. Usuarios/Roles | ❌ No existe | 0% | Auth + RBAC |

**Progreso Global**: ~22% completado

---

## 🗺️ Roadmap de Implementación

### 🎯 Fase 0: Fundamentos (COMPLETADO ✅)
**Duración**: Ya completado
**Estado**: ✅ Done

- ✅ Configuración de seguridad
- ✅ Docker Compose
- ✅ Schema de base de datos
- ✅ Playwright básico
- ✅ Change Detection

---

### 🎯 Fase 1: Backend Core (8-10 semanas)

#### Sprint 1-2: Autenticación y Usuarios (2 semanas)
**Prioridad**: 🔴 Crítico

**Backend (FastAPI)**:
- [ ] Sistema de autenticación JWT
- [ ] Gestión de usuarios (CRUD)
- [ ] Roles y permisos (RBAC)
- [ ] Endpoints de login/logout/refresh
- [ ] Middleware de autorización

**Base de Datos**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50), -- 'admin', 'qa_leader', 'qa_analyst', 'developer', 'stakeholder'
    full_name VARCHAR(255),
    created_at TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN
);

CREATE TABLE user_projects (
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    role VARCHAR(50), -- Rol específico en el proyecto
    PRIMARY KEY (user_id, project_id)
);
```

**Entregables**:
- API de auth funcionando
- Tests unitarios (80% coverage)
- Documentación OpenAPI

---

#### Sprint 3-4: Gestión de Proyectos (2 semanas)
**Prioridad**: 🔴 Crítico

**Backend**:
- [ ] CRUD de proyectos
- [ ] Configuración de variables por proyecto
- [ ] Gestión de credenciales (cifradas con Vault)
- [ ] URLs de entornos (dev/staging/prod)
- [ ] Fixtures de datos de prueba

**Base de Datos**:
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    status VARCHAR(50) -- 'active', 'archived'
);

CREATE TABLE project_config (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    config_key VARCHAR(100),
    config_value TEXT, -- Cifrado si es sensible
    is_encrypted BOOLEAN,
    environment VARCHAR(50), -- 'dev', 'staging', 'prod'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE test_data_fixtures (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    fixture_name VARCHAR(100),
    fixture_data JSONB,
    created_at TIMESTAMP
);
```

---

#### Sprint 5-6: Test Cases Management (2 semanas)
**Prioridad**: 🔴 Crítico

**Backend**:
- [ ] CRUD de test cases
- [ ] Estructura ISTQB (ID, prerequisitos, pasos, expected)
- [ ] Versionado de test cases
- [ ] Workflow de aprobación (draft → review → approved)
- [ ] Asignación de casos a QA

**Base de Datos**:
```sql
CREATE TABLE test_cases (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    test_id VARCHAR(50) UNIQUE, -- TC-001
    title VARCHAR(255),
    description TEXT,
    prerequisites TEXT,
    test_steps JSONB, -- Array de steps
    expected_result TEXT,
    test_type VARCHAR(50), -- 'functional', 'regression', 'smoke', etc.
    priority VARCHAR(20), -- 'high', 'medium', 'low'
    status VARCHAR(50), -- 'draft', 'review', 'approved', 'deprecated'
    istqb_category VARCHAR(100),
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE test_case_versions (
    id UUID PRIMARY KEY,
    test_case_id UUID REFERENCES test_cases(id),
    version INTEGER,
    changes JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP
);
```

---

#### Sprint 7-8: Document Analysis (2 semanas)
**Prioridad**: 🟡 Alta

**Backend**:
- [ ] Upload de documentos (PDF, DOCX, MD)
- [ ] Integración con Claude API / OpenAI
- [ ] Parser de requisitos
- [ ] Generador de test cases
- [ ] Review de casos generados

**Flujo**:
```
1. Usuario sube documento
2. Sistema extrae texto
3. IA analiza y extrae requisitos
4. IA genera test cases ISTQB
5. QA Leader revisa y aprueba/modifica
6. Test cases pasan a estado "approved"
```

---

### 🎯 Fase 2: Frontend Core (6-8 semanas)

#### Sprint 9-10: UI Base y Auth (2 semanas)
**Prioridad**: 🔴 Crítico

**Frontend (React/Next.js)**:
- [ ] Setup proyecto Next.js 14+ (App Router)
- [ ] Sistema de diseño (Tailwind + Shadcn/ui)
- [ ] Layout principal con navegación
- [ ] Login/Logout
- [ ] Protección de rutas por rol

**Páginas**:
- `/login`
- `/dashboard`
- `/projects`
- `/profile`

---

#### Sprint 11-12: Gestión de Proyectos UI (2 semanas)
**Prioridad**: 🔴 Crítico

**Páginas**:
- [ ] `/projects` - Lista de proyectos
- [ ] `/projects/new` - Crear proyecto
- [ ] `/projects/[id]` - Detalle y dashboard del proyecto
- [ ] `/projects/[id]/config` - Configuración de variables
- [ ] `/projects/[id]/team` - Gestión de equipo

**Componentes**:
- Tablero de configuración editable (key-value pairs)
- Editor de credenciales (con toggle show/hide)
- Gestión de URLs por entorno

---

#### Sprint 13-14: Test Cases UI (2 semanas)
**Prioridad**: 🔴 Crítico

**Páginas**:
- [ ] `/projects/[id]/test-cases` - Lista de casos
- [ ] `/projects/[id]/test-cases/new` - Crear caso
- [ ] `/projects/[id]/test-cases/[tcId]` - Editar caso
- [ ] `/projects/[id]/test-cases/review` - Cola de revisión (QA Leader)

**Componentes**:
- Editor de test case (rich text)
- Preview ISTQB format
- Workflow de aprobación
- Historial de versiones

---

#### Sprint 15-16: Document Upload & AI Generation (2 semanas)
**Prioridad**: 🟡 Alta

**Páginas**:
- [ ] `/projects/[id]/documents` - Lista de documentos
- [ ] `/projects/[id]/documents/upload` - Upload wizard
- [ ] `/projects/[id]/documents/[docId]/generate` - Generación IA

**Flujo UI**:
1. Drag & drop documento
2. Preview de contenido extraído
3. "Generar Test Cases" → Loading con progress
4. Preview de casos generados
5. "Revisar y Aprobar"

---

### 🎯 Fase 3: Execution Engine (4-6 semanas)

#### Sprint 17-18: Playwright Orchestrator (2 semanas)
**Prioridad**: 🔴 Crítico

**Backend**:
- [ ] Convertir test cases → Playwright scripts
- [ ] Template engine para generación de código
- [ ] Queue de ejecución (Bull/BullMQ)
- [ ] Worker pools
- [ ] Gestión de concurrencia

**Arquitectura**:
```
Test Case (DB) → Generator → Playwright Script → Queue → Worker → Results
```

---

#### Sprint 19-20: Mobile Testing (Appium) (2 semanas)
**Prioridad**: 🟡 Alta

**Backend**:
- [ ] Integración con Appium
- [ ] Android emulators
- [ ] iOS simulators
- [ ] Gestión de dispositivos
- [ ] Test cases específicos mobile

---

#### Sprint 21-22: Cross-Browser & Cloud (2 semanas)
**Prioridad**: 🟢 Media

**Integraciones**:
- [ ] Selenium Grid
- [ ] BrowserStack API
- [ ] LambdaTest API
- [ ] Selector de plataformas en UI

---

### 🎯 Fase 4: Evidence & Reporting (4 semanas)

#### Sprint 23-24: Capture System (2 semanas)
**Prioridad**: 🔴 Crítico

**Backend**:
- [ ] Screenshots en cada step
- [ ] Video recording
- [ ] Network logs
- [ ] Console logs
- [ ] Upload a S3/Azure Blob Storage
- [ ] Generación de URLs firmadas

**Base de Datos**:
```sql
CREATE TABLE test_evidences (
    id UUID PRIMARY KEY,
    test_execution_id UUID REFERENCES test_executions(id),
    evidence_type VARCHAR(50), -- 'screenshot', 'video', 'log'
    file_url TEXT,
    step_number INTEGER,
    timestamp TIMESTAMP,
    metadata JSONB
);
```

---

#### Sprint 25-26: Reporting Dashboard (2 semanas)
**Prioridad**: 🔴 Crítico

**Frontend**:
- [ ] Dashboard ejecutivo
- [ ] Gráficas de tendencias (Chart.js/Recharts)
- [ ] Filtros avanzados
- [ ] Export PDF/Excel
- [ ] Integración Allure mejorada

**Métricas**:
- Pass Rate
- Test Coverage
- Execution Time Trends
- Flaky Tests
- Bug Density

---

### 🎯 Fase 5: Issue Management (3 semanas)

#### Sprint 27-28: Bug Detection & Tickets (2 semanas)
**Prioridad**: 🟡 Alta

**Backend**:
- [ ] Detección automática de fallos
- [ ] Análisis de error con IA (sugiere causa)
- [ ] Integración Jira API
- [ ] Integración Azure DevOps API
- [ ] Auto-creación de tickets

**Flujo**:
```
Test Fails → AI Analysis → Generate Ticket → Send to Jira/ADO
             → Attach evidences
             → Link to test case
```

---

#### Sprint 29: Tracking & Resolution (1 semana)
**Prioridad**: 🟢 Media

**Frontend**:
- [ ] Vista de bugs activos
- [ ] Tracking de resolución
- [ ] Re-testing automático
- [ ] Dashboard de bugs

---

### 🎯 Fase 6: Advanced Features (4 semanas)

#### Sprint 30: AI-Powered Features
- [ ] Auto-healing tests (actualizar selectores)
- [ ] Análisis predictivo de fallos
- [ ] Sugerencias de optimización
- [ ] Test case recommendations

#### Sprint 31: Performance & Scale
- [ ] Caching con Redis
- [ ] CDN para evidencias
- [ ] Database indexing optimization
- [ ] Load testing

#### Sprint 32: Integrations
- [ ] GitHub/GitLab webhooks
- [ ] Slack bot
- [ ] Teams bot
- [ ] API pública

#### Sprint 33: Polish & Documentation
- [ ] Documentación completa
- [ ] Videos tutoriales
- [ ] Onboarding wizard
- [ ] Help center

---

## 📁 Estructura de Archivos Objetivo

```
haida/
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── test_cases.py
│   │   │   │   ├── executions.py
│   │   │   │   ├── reports.py
│   │   │   │   └── users.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── ai_analyzer.py
│   │   │   ├── test_generator.py
│   │   │   └── execution_engine.py
│   │   └── workers/
│   │       ├── test_runner.py
│   │       └── evidence_processor.py
│   ├── tests/
│   ├── alembic/                 # DB migrations
│   └── requirements.txt
│
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── test-cases/
│   │   │   └── reports/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # Shadcn components
│   │   ├── forms/
│   │   ├── tables/
│   │   └── charts/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── package.json
│
├── execution-engine/            # Playwright/Appium workers
│   ├── playwright/
│   │   ├── templates/
│   │   └── generated/
│   ├── appium/
│   └── runners/
│
├── change-detection/            # Sistema actual (ya existe)
│   ├── server.js
│   ├── docker-compose.yml
│   └── init-db.sql
│
├── docs/                        # Documentación
├── .github/
│   └── workflows/               # CI/CD
└── docker-compose.yml           # Orchestration completa
```

---

## 💰 Estimación de Esfuerzo

| Fase | Duración | Equipo Recomendado |
|------|----------|-------------------|
| Fase 0: Fundamentos | ✅ Completo | - |
| Fase 1: Backend Core | 10 semanas | 2 Backend + 1 DevOps |
| Fase 2: Frontend Core | 8 semanas | 2 Frontend + 1 UI/UX |
| Fase 3: Execution Engine | 6 semanas | 2 Backend + 1 QA Automation |
| Fase 4: Evidence & Reporting | 4 semanas | 1 Backend + 1 Frontend |
| Fase 5: Issue Management | 3 semanas | 1 Backend + 1 Frontend |
| Fase 6: Advanced Features | 4 semanas | Full team |

**Total**: ~35 semanas (8-9 meses) con equipo de 4-5 personas

---

## 🎯 Decisiones Técnicas Clave

### Stack Tecnológico Recomendado

**Backend**:
- FastAPI (Python) - APIs REST
- Supabase / PostgreSQL - Base de datos
- Redis - Cache y queue
- Bull/BullMQ - Job queue
- Celery - Task execution
- AWS S3 / Azure Blob - Almacenamiento evidencias

**Frontend**:
- Next.js 14+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui - Components
- TanStack Query - Data fetching
- Zustand - State management

**Testing & Automation**:
- Playwright - Web testing
- Appium - Mobile testing
- Selenium Grid - Escalabilidad
- Changedetection.io - Change detection

**IA & ML**:
- Anthropic Claude API - Document analysis
- OpenAI GPT-4 - Alternative
- LangChain - Orchestration

**DevOps**:
- Docker + Docker Compose
- GitHub Actions / Azure DevOps
- Kubernetes (para escala)
- Prometheus + Grafana - Monitoring

---

## 🚀 Próximos Pasos Inmediatos

### Esta Semana

1. **Decisión de Stack**
   - [ ] Confirmar tecnologías
   - [ ] Setup repositorios (mono-repo vs multi-repo)
   - [ ] Configurar entornos

2. **Arquitectura Detallada**
   - [ ] Diagrama de arquitectura completo
   - [ ] Diseño de API (OpenAPI spec)
   - [ ] Modelo de datos completo (ERD)

3. **Setup Proyecto**
   - [ ] Crear repositorio principal
   - [ ] Setup backend (FastAPI)
   - [ ] Setup frontend (Next.js)
   - [ ] CI/CD básico

### Próximas 2 Semanas

4. **Sprint 1: Auth & Users**
   - Iniciar desarrollo de autenticación
   - Tests unitarios
   - Documentación

---

## 📞 Preguntas para Definir

1. **Prioridades**: ¿Qué módulos son más urgentes?
2. **Recursos**: ¿Cuántas personas en el equipo? ¿Roles?
3. **Timeline**: ¿Hay fecha límite?
4. **Infraestructura**: ¿Cloud provider? (AWS/Azure/GCP)
5. **Integraciones**: ¿Qué sistemas ya existen? (Jira, ADO, Slack, etc.)
6. **Presupuesto**: ¿Restricciones en servicios cloud o APIs de IA?

---

## 📊 Métricas de Éxito

Al finalizar el proyecto, HAIDA debe:

- ✅ Reducir 70% el tiempo de creación de test cases
- ✅ Aumentar 50% la cobertura de testing
- ✅ Detectar bugs 80% más rápido
- ✅ Generar reportes automáticos en <5 minutos
- ✅ Ejecutar 1000+ tests en paralelo
- ✅ ROI positivo en 6 meses

---

**Estado**: Documento de Visión v1.0
**Última actualización**: 18 de diciembre de 2025
