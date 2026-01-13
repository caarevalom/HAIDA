# HAIDA AI System Prompts & Training Protocols

**Version:** 2.1.0
**Date:** +34662652300
**Purpose:** Guide AI systems (Claude, Copilot, etc.) to operate HAIDA development and testing

---

## 1. SYSTEM CONTEXT SETUP

### Initial Instruction for Any AI
```
You are operating within HAIDA v2.1.0, an AI-powered QA automation system.
Project: Hiberus AI-Driven Automation (HAIDA)
Environment: Vercel deployment with Supabase PostgreSQL + Redis
Your Role: Code development, test creation, execution, and reporting
Language: Primary Spanish, Secondary English

CRITICAL GUARDRAILS:
- Read CLAUDE.md for project conventions before ANY task
- Check git status before commits
- Verify test coverage before deployment
- Run security audit: npm run security:audit
- Never modify .env secrets directly
- Always use feature branches (pattern: feature/* or fix/*)
```

---

## 2. DEVELOPMENT PROTOCOLS

### A. Test Case Creation Protocol

**When asked: "Crea casos de prueba para [componente]"**

1. Read CSV format from `haida/outputs/ctb/ctb-master.csv`
2. Analyze structure:
   ```
   TEST_ID|TIPO_PRUEBA|COMPONENTE|MODULO|REQUISITO_ID|DESCRIPCION|
   PRECONDICIONES|PASOS|RESULTADO_ESPERADO|PRIORIDAD|RIESGO|
   ETIQUETA_AUTOMATIZACION|ESTADO
   ```

3. Generate test cases following ISTQB:
   - TEST_ID format: `TC_[MODULE]_[NUMBER]` (e.g., TC_HOME_001)
   - TIPO_PRUEBA: Smoke, Unit, E2E, Integration, Security, Performance, etc.
   - PRIORIDAD: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
   - ETIQUETA_AUTOMATIZACION: @smoke @e2e @desktop @mobile @api @security

4. Create CSV and save to: `haida/outputs/ctb/[component]-tests.csv`
5. Validate with: `node scripts/sync-jira-tests.js`

**Example:**
```csv
TC_HOME_001|Smoke|Home|Landing|REQ-HOME-001|Banner visible with CTA|User on home page|1. Navigate to / 2. Wait for load 3. Verify banner|Banner visible, CTA clickable, load < 3s|P0|Alto|@smoke @e2e @desktop|Generado
```

### B. Test Execution Protocol

**When asked: "Ejecuta pruebas para [componente]"**

```bash
# Configure BASE_URL
export BASE_URL=https://haida-one.vercel.app

# Run specific test file
npm run test:web tests/web-e2e/[component].spec.ts

# Run all tests with reports
npm run test:web && npm run allure:generate

# View reports
npm run allure:open
```

**Check points:**
- ✅ 5 browsers executing (Chrome, Firefox, Safari, iPhone 14, Pixel 7)
- ✅ Screenshots captured on failure
- ✅ Videos recorded (WebM format)
- ✅ Traces available (ZIP format)
- ✅ Allure report generating

### C. Bug Fix Protocol

**When asked: "Hay un error en [modulo], corrígelo"**

1. Identify issue:
   ```bash
   npm run test:web [failing-test]
   npm run allure:open  # Review failure details
   ```

2. Analyze error:
   - Check console logs in screenshot
   - Review video to understand failure
   - Check trace for stack trace

3. Create fix branch:
   ```bash
   git checkout -b fix/[issue-description]
   ```

4. Fix and test:
   ```bash
   npm run test:web  # Verify fix
   npm run allure:generate
   ```

5. Commit with message:
   ```bash
   git commit -m "fix: [Module] [Issue description]"
   ```

---

## 3. PERFORMANCE TESTING PROTOCOL

**When asked: "Ejecuta tests de rendimiento"**

```bash
# Lighthouse performance audit
npm run lighthouse

# Load testing with k6
npm run test:perf

# Check metrics
cat reports/lighthouse/report.html
```

**Success Criteria:**
- Performance: ≥80
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90
- Load time: <3s
- Response time: <200ms

---

## 4. INCIDENT RESOLUTION PROTOCOL

**When asked: "Hay una incidencia en producción"**

1. **Identify issue:**
   ```bash
   vercel logs --follow
   ```

2. **Check system health:**
   ```bash
   curl https://haida-one.vercel.app/health
   curl https://haida-one.vercel.app/api/entra/status
   curl https://haida-one.vercel.app/api/perplexity/status
   curl https://haida-one.vercel.app/api/telegram/status
   ```

3. **Review database:**
   ```bash
   # Connection check
   DATABASE_URL=[production-url] psql -c "SELECT NOW();"
   ```

4. **Create hotfix:**
   ```bash
   git checkout -b hotfix/[issue]
   # Fix code
   git commit --no-verify -m "hotfix: [issue]"
   git push origin hotfix/[issue]
   ```

5. **Deploy:**
   - Create PR: hotfix/[issue] → main
   - Vercel auto-deploys on merge
   - Monitor health checks

---

## 5. PROJECT MANAGEMENT INTEGRATION

### Jira Synchronization

**When test cases exist:**
```bash
node scripts/sync-jira-tests.js
```

**Jira Issue Types:**
- Test: Individual test case
- Test Suite: Collection of tests
- Defect: Bug found during testing
- Incident: Production issue

**Linking:**
- HAIDA-[number]: Test case
- REQ-[module]-[number]: Requirement

### Confluence Documentation

**When documentation changes:**
```bash
node scripts/sync-confluence.js
```

**Pages to sync:**
- TESTING_VERIFICATION_REPORT.md → Testing
- VERCEL_DEPLOYMENT_GUIDE.md → Deployment
- API_TESTING_GUIDE.md → API Reference
- COMPLETION_SUMMARY.md → Project Status

---

## 6. SECURITY PROTOCOLS

**Before any deployment:**

```bash
# Run security audit
npm run security:audit

# Check for secrets
grep -r "password\|secret\|token\|key" .env --color=never

# Verify no hardcoded credentials
grep -r "API_KEY\|SECRET" app/ --include="*.ts" --include="*.js"
```

**Required:**
- ✅ No secrets in git history
- ✅ All tokens in environment variables
- ✅ .env.example with placeholders
- ✅ Security headers configured

---

## 7. DOCUMENTATION PROTOCOLS

**When creating new features:**

1. Create feature documentation:
   ```
   docs/[feature-name].md
   ```

2. Include sections:
   - Overview
   - Configuration
   - Examples
   - Error handling
   - Performance considerations

3. Update main docs:
   - CLAUDE.md (conventions)
   - API_TESTING_GUIDE.md (endpoints)
   - VERCEL_DEPLOYMENT_GUIDE.md (deployment)

4. Sync to Confluence:
   ```bash
   node scripts/sync-confluence.js
   ```

---

## 8. DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All tests passing: `npm run test:web` ✅
- [ ] API tests passing: `npm run test:api` ✅
- [ ] No security warnings: `npm run security:audit` ✅
- [ ] Lighthouse scores ≥80: `npm run lighthouse` ✅
- [ ] Documentation updated and synced
- [ ] Test cases synced to Jira
- [ ] Environment variables configured in Vercel
- [ ] Database migrations ready: `bash database/setup-chat-tables.sh`
- [ ] Health checks configured
- [ ] Monitoring alerts set up
- [ ] Slack notifications enabled

---

## 9. HANDOFF TO NEXT AI INSTANCE

When transitioning to a different AI:

1. **Read these critical files first:**
   - CLAUDE.md (project conventions)
   - COMPLETION_SUMMARY.md (what's been done)
   - TESTING_VERIFICATION_REPORT.md (testing status)
   - VERCEL_DEPLOYMENT_GUIDE.md (deployment)
   - This file (HAIDA-AI-SYSTEM-PROMPTS.md)

2. **Check system status:**
   ```bash
   git log --oneline -10  # Recent commits
   git status            # Current state
   npm list             # Dependencies
   ```

3. **Understand current state:**
   - Branch: `git branch -a`
   - Tests: `npm run test:web`
   - Deployment: Check Vercel dashboard
   - Issues: Check Jira board

4. **Identify tasks in progress:**
   - Check TODO in files
   - Review open PRs
   - Check Jira issues marked "In Progress"

---

## 10. COMMON TASKS QUICK REFERENCE

| Task | Command | Expected | Time |
|------|---------|----------|------|
| Create test cases | `node scripts/generate-tests.js [spec]` | CSV with ISTQB compliance | 2-5 min |
| Run E2E tests | `npm run test:web` | 75 test runs, 5 browsers | 3-5 min |
| Run API tests | `npm run test:api` | All endpoints respond 200 | 1-2 min |
| Generate report | `npm run allure:generate` | HTML report in allure-report/ | 30 sec |
| Deploy to Vercel | Push to main → Auto-deploy | Health check passes | 2-3 min |
| Sync to Jira | `node scripts/sync-jira-tests.js` | Test cases in Jira | 1-2 min |
| Sync to Confluence | `node scripts/sync-confluence.js` | Docs in Confluence | 1 min |
| Check health | `curl https://haida-one.vercel.app/health` | 200 OK | Immediate |
| View logs | `vercel logs --follow` | Production logs | Real-time |
| Create hotfix | `git checkout -b hotfix/[issue]` | Fix committed | 5-10 min |

---

## 11. ERROR TROUBLESHOOTING

**Tests timeout:**
- Increase timeout: Edit `playwright.config.ts`
- Check BASE_URL is accessible
- Run with `--headed` flag to debug

**Allure report not generating:**
- Ensure Java 8+ installed
- Clear old reports: `npm run allure:clean`
- Regenerate: `npm run test:web && npm run allure:generate`

**Deployment fails:**
- Check build: `npm run build`
- Check environment variables in Vercel
- Review Vercel logs

**Tests failing on CI/CD:**
- Run locally first: `npm run test:web`
- Check .env configuration
- Verify BASE_URL is correct

---

## 12. SYSTEM ARCHITECTURE (For Reference)

```
HAIDA v2.1.0
├── Frontend: Vercel (Next.js/React)
├── Backend: FastAPI Python + Vercel Functions
├── Database: Supabase (PostgreSQL + RLS)
├── Cache: Redis
├── Testing: Playwright (5 browsers) + Newman + Lighthouse
├── Reporting: Allure Framework
├── Integration: Jira + Confluence
├── External: Perplexity AI + Telegram Bot + Microsoft Entra
└── Documentation: Markdown → Confluence sync
```

---

## 13. CONTACT & ESCALATION

- **Critical Issue:** hola@stayarta.com
- **QA Questions:** hola@stayarta.com
- **Project Owner:** HAIDA PO
- **Documentation:** See files in project root

---

## 14. VERSION HISTORY

- **v2.1.0** (+34662652300): Complete testing verification, AI protocols, integration setup
- **v2.0.0** (Previous): Initial deployment
- **v1.0.0** (Initial): Project creation

---

**Last Updated:** +34662652300
**Maintained By:** Claude AI System
**Status:** ✅ Active and Operational
