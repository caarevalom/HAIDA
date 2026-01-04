# CLAUDE.MD - HAIDA Project

## Project Overview

**HAIDA (Hiberus AI-Driven Automation)** is a comprehensive QA automation solution that combines:
- Traditional QA automation framework (Playwright, Newman, Lighthouse, k6)
- AI-powered test case generation system
- Change detection and automated testing trigger system
- Professional reporting with Allure Framework

The project has two main components:
1. **Main QA Framework** - Testing infrastructure for web E2E, API, accessibility, and performance
2. **HAIDA Sub-module** - AI-powered test case generator and change detection system

## Project Structure

```
HAIDA/
├── tests/
│   ├── web-e2e/              # Playwright E2E tests (TypeScript)
│   ├── api/                  # Newman/Postman API tests
│   └── perf/                 # k6 performance tests
├── haida/                    # HAIDA AI test generator sub-module
│   ├── generators/           # PowerShell scripts for test generation
│   ├── templates/            # ISTQB templates and prompts
│   ├── examples/             # Example outputs and demos
│   ├── docs/                 # User specifications
│   ├── outputs/              # Generated test cases (CSV)
│   ├── haida-api/            # Webhook receiver (Node.js/Express)
│   ├── tests/                # Playwright tests for change detection
│   └── change-detection/     # Change detection framework
├── configs/                  # Configuration files (Lighthouse, etc.)
├── reports/                  # Generated test reports
├── .github/workflows/        # CI/CD pipelines
├── playwright.config.ts      # Playwright configuration
├── package.json              # Dependencies and scripts
└── [Documentation files]     # Extensive documentation (100+ MD files)
```

## Technology Stack

### Testing Frameworks
- **Playwright** v1.48.0 - Web E2E testing (multi-browser: Chrome, Firefox, Safari, Edge, Mobile)
- **Newman** v6.0.0 - API testing (Postman collections)
- **Lighthouse** v12.0.0 - Performance and accessibility auditing
- **k6** - Load and performance testing
- **axe-core** v4.9.0 - WCAG accessibility validation

### Reporting & CI/CD
- **Allure Framework** v2.0.0 - Unified test reporting
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization (change detection system)

### HAIDA AI System
- **Node.js/Express** - Webhook API server
- **PostgreSQL** - Historical data storage
- **Redis** - Caching layer
- **Changedetection.io** - UI change monitoring
- **Selenium** - Browser automation for change detection
- **PowerShell** - Test generation scripts

### Languages
- TypeScript (tests, Playwright config)
- JavaScript (Node.js API, mock servers)
- PowerShell (automation scripts)
- Markdown (extensive documentation)

## Development Guidelines

### Code Style
- **TypeScript/JavaScript**:
  - Use ES modules (`type: "module"` in package.json)
  - Prefer `async/await` over promises
  - Use strict TypeScript settings
  - 2-space indentation

- **Test Naming**:
  - Descriptive test names in Spanish (primary language)
  - Use ISTQB terminology where applicable
  - Follow pattern: `[Component/Module] - [Action] - [Expected Result]`

### Testing Best Practices
- Always use `page.waitForLoadState()` for stability
- Capture console errors in smoke tests
- Validate accessibility with axe-core
- Use data-testid attributes when possible
- Implement proper error handling and retries (retries: 1 in config)

### HAIDA Workflow
1. Write functional specification using `FUNCTIONAL-SPEC-TEMPLATE.md`
2. Run `generate-tests.ps1` script with specification path
3. Use AI (Copilot/Claude) to generate CSV test cases
4. Validate CSV structure and ISTQB compliance
5. Import to test management system or use as documentation

## Key Conventions

### File Naming
- Tests: `*.spec.ts` (Playwright), `collection.json` (Newman)
- Scripts: `kebab-case.ps1` or `kebab-case.sh`
- Documentation: `UPPERCASE-WITH-DASHES.md`
- Config: `lowercase.config.ts/js/json`

### Environment Variables
- `BASE_URL` - Target application URL (default: https://mcprod.thisisbarcelona.com)
- `SLACK_WEBHOOK` - Slack notification endpoint
- `DB_PASSWORD` - PostgreSQL password
- `TEST_URL` - URL for change detection monitoring

### Test Categories (ISTQB)
- Unit Tests
- Integration Tests
- API Tests
- E2E Tests
- Smoke Tests
- Regression Tests
- Security Tests
- Accessibility Tests
- Performance Tests
- Data Quality Tests

## Common Tasks

### Getting Started
```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Configure environment
cp .env.example .env
# Edit .env with your values
```

### Running Tests
```bash
# Web E2E tests
npm run test:web

# Web E2E with UI mode
npm run test:web:ui

# API tests (Newman)
npm run test:api

# Performance tests (Lighthouse)
npm run lighthouse

# Load tests (k6) - requires k6 installed
npm run test:perf

# View Playwright report
npm run report
```

### Allure Reports
```bash
# Clean previous reports
npm run allure:clean

# Generate Allure report
npm run allure:generate

# Open Allure report in browser
npm run allure:open
```

### HAIDA Test Generation
```powershell
# Generate test cases from specification
powershell -File haida/generators/generate-tests.ps1 -DocPath "haida/docs/your-spec.md"

# Validate CSV structure
powershell -File haida/generators/ValidateCSVStructure.ps1 -CsvPath "haida/outputs/test-cases.csv"

# Generate requirements matrix
powershell -File haida/generators/GenerateRequirementsMatrix.ps1 -CsvPath "haida/outputs/test-cases.csv"
```

### HAIDA Change Detection System
```bash
# Deploy complete system (Docker)
cd haida
bash deploy.sh

# Check system health
curl http://localhost:3001/health

# Access dashboards
# - Changedetection.io: http://localhost:5000
# - Allure Reports: http://localhost:4040
```

## Important Notes

### Project Philosophy
- **AI-Assisted, Not AI-Replaced**: HAIDA accelerates test case design (95% time reduction) but requires human validation
- **ISTQB Compliance**: All generated test cases follow ISTQB standards for traceability and professionalism
- **Security-First**: Local execution, no external dependencies, corporate-compliant
- **Documentation-Heavy**: 100+ documentation files ensure knowledge transfer and maintenance

### Critical Files
- `START-HERE.md` - Entry point for new users
- `HAIDA-OVERVIEW.md` - High-level overview of HAIDA system
- `PROPOSAL-TO-MANAGER.md` - Executive presentation material
- `haida/README.md` - HAIDA module documentation
- `haida/QUICK-START.md` - Fast-track HAIDA usage
- `INTEGRATION-GUIDE-COMPLETE.md` - Step-by-step integration (8 phases)

### Two Project Modes
1. **Standalone QA Framework**: Use just the Playwright/Newman/Lighthouse stack
2. **Full HAIDA System**: Include AI test generation + change detection automation

### Change Detection System
- Monitors URLs for visual/content changes
- Automatically triggers appropriate test suites based on change type
- 8 predefined test profiles (form validation, navigation, checkout, etc.)
- Complete flow: Change detection → Analysis → Test selection → Execution → Notification (< 6 minutes)

## Architecture Highlights

### Multi-Layer Testing
1. **Unit/Component** - Fast, isolated tests
2. **Integration/API** - Service communication validation
3. **E2E/UI** - Full user journey validation
4. **Performance** - Load, stress, and speed metrics
5. **Accessibility** - WCAG 2.0 AA compliance
6. **Security** - Basic security checks

### Test Pyramid Alignment
- Follows Mike Cohn's test pyramid
- More unit/API tests, fewer E2E tests
- Fast feedback loops
- Cost-effective test maintenance

### Reporting Integration
- Allure Framework for unified reporting
- Historical trending
- Screenshots and videos on failure
- Console logs and traces
- Multi-browser comparison

## ROI & Metrics

### Time Savings
- Manual test case design: 3-4 weeks → HAIDA: 1-3 hours (95% reduction)
- Manual test execution: 30-60 minutes → Automated: < 5 minutes (90% reduction)
- Monthly savings: 40-60 hours per QA engineer

### Quality Improvements
- Test coverage: 70% manual → 95%+ automated
- ISTQB compliance: 100% guaranteed
- False negatives: Reduced to near-zero
- Traceability: Complete requirements mapping

### Business Impact
- Cost savings: €2,000-3,000/month per project
- ROI: 1,200-1,500% annually
- Time to market: Significantly reduced
- Regression confidence: High

## Roadmap & Phases

### Phase 1: ISTQB Traceability (Weeks 1-2)
- Generate test cases for one module
- Create requirements matrix
- Validate ISTQB compliance

### Phase 2: CI/CD Automation (Weeks 3-6)
- Integrate with GitHub Actions/GitLab CI
- Automated test execution on PR
- Coverage reports

### Phase 3: Reporting & KPIs (Weeks 7-10)
- Scheduled test runs
- Historical dashboards
- Trend analysis
- Degradation alerts

### Phase 4: Scale (Week 11+)
- Apply to multiple modules
- Expand to other projects
- Optimize and fine-tune
- Proven ROI documentation

## Troubleshooting

### Common Issues
- **Playwright browser timeout**: Check network stability, increase timeout in config
- **API tests failing**: Verify BASE_URL in .env, check API availability
- **Allure report not generating**: Ensure Java 8+ installed, check allure-results directory
- **HAIDA script fails**: Verify PowerShell execution policy, check file paths

### Debug Commands
```bash
# Check Playwright installation
npx playwright --version

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/web-e2e/smoke.spec.ts

# Debug mode
npx playwright test --debug

# Docker system check
docker-compose ps
docker-compose logs -f [service-name]
```

## Documentation Index

### Getting Started
- `README.md` - Main project overview
- `START-HERE.md` - Visual entry point
- `QA-SETUP-GUIDE.md` - Setup instructions

### HAIDA System
- `haida/COMIENZA-AQUI.md` - Spanish quick start
- `haida/START-HERE.md` - English overview
- `haida/QUICK-START.md` - 3-step guide
- `haida/INDEX.md` - Complete HAIDA index

### Technical Deep-Dives
- `HAIDA-OVERVIEW.md` - System architecture
- `haida/CHANGE-DETECTION-FRAMEWORK.md` - Change detection technical details
- `haida/INTEGRATION-GUIDE-COMPLETE.md` - 8-phase integration guide
- `TIPOS_PRUEBAS_VALIDACION.md` - Test types catalog

### Presentations & Proposals
- `PROPOSAL-TO-MANAGER.md` - Executive proposal
- `haida/PRESENTATION-MANAGER.md` - Presentation guide
- `haida/EXECUTIVE-SUMMARY.md` - ROI and benefits
- `RESUMEN-EJECUTIVO-1PAGINA.md` - One-page executive summary

### Reference Materials
- `REFERENCIA-COMPLETA-DOCUMENTOS-HAIDA.md` - Complete document reference
- `INDICE-MAESTRO-v2.0.md` - Master index v2.0
- `TABLA-CONTENIDOS-GUIA-RAPIDA.md` - Quick contents table

## Security & Compliance

### Corporate Security
- Zero external connections in local mode
- Mock server for isolated testing
- No hardcoded credentials (all in .env)
- Auditable code and logs
- CORS configured properly
- Health checks implemented

### Data Privacy
- No sensitive data transmission
- Local data storage only
- Configurable log levels
- Secure environment variables

## Support & Resources

### Internal Documentation
- Each major component has its own README.md
- Troubleshooting sections in setup guides
- Step-by-step tutorials with examples
- Video-ready demonstrations

### Key Contacts (as per documentation)
- Product Owner: haida-po@hiberus.com
- DevOps Team: devops@hiberus.com
- QA Team: qa-team@hiberus.com

## Version Information

- **Project Version**: 1.0 (Production Ready)
- **Playwright**: 1.48.0
- **Node.js**: 18+ required (20 recommended)
- **HAIDA System**: 1.0.0
- **Last Updated**: December 2024

## Special Notes for AI Assistants

When working with this project:
1. **Respect the bilingual nature**: Documentation is in Spanish and English
2. **ISTQB terminology**: Use proper QA testing terminology
3. **Two-project structure**: Be aware of main framework vs. HAIDA sub-module
4. **Extensive docs**: Check existing documentation before creating new files
5. **PowerShell scripts**: Many automation scripts are PowerShell-based
6. **Security focus**: Always maintain corporate security compliance
7. **Test generation**: HAIDA generates test documentation, not executable tests directly
8. **Change detection**: Complex multi-service Docker architecture in haida/ subdirectory

---

**Generated**: 2024-12-16
**Status**: Production Ready
**Maintainer**: Hiberus QA Team
**License**: Internal/Proprietary
