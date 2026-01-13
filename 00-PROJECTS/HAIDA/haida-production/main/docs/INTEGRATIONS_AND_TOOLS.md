# Integrations and tools registry

This registry is the source of truth for HAIDA tooling and integrations in this workspace.

## Sources

- ../.env.example
- ../package.json
- ../docker-compose.yml
- ../haida/docker-compose.yml
- ../scripts/
- root-docs/misc/HERRAMIENTAS-NECESARIAS.md
- root-docs/misc/CLI-TOOLS-GUIDE.md
- ../docs/INTEGRATION-VERIFICATION-REPORT.md
- ../docs/__config_hits.txt
- ../docs/CLOUDFLARE-DNS-UPDATE.md

## Status legend

- linked: config, script, or code exists in repo
- doc-only: documented but no config in repo
- planned: listed as missing or not implemented
- external: exists outside this repo root

## Counts

- Core runtimes and CLIs: 10
- QA and testing stack: 8
- Infra and hosting: 8
- Collaboration, PM, and design: 6
- AI, LLM, and MCP: 10
- Identity, security, observability: 5
- Messaging and notifications: 2
- Total unique tools and integrations: 49

## Core runtimes and CLIs

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Node.js + NPM | Runtime for tooling and scripts | [../package.json](../package.json), [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | linked |
| Python | Backend runtime | [../requirements.txt](../requirements.txt), [../README_HAIDA.md](../README_HAIDA.md) | linked |
| Git | Version control | [../.git](../.git), [root-docs/misc/CLI-TOOLS-GUIDE.md](root-docs/misc/CLI-TOOLS-GUIDE.md) | linked |
| Docker Desktop + Compose | Local services and orchestration | [../docker-compose.yml](../docker-compose.yml), [../haida/docker-compose.yml](../haida/docker-compose.yml) | linked |
| PowerShell 7 | Automation scripts | [../scripts/](../scripts/), [../setup-supabase.ps1](../setup-supabase.ps1) | linked |
| Java (JDK) | Allure CLI runtime | [root-docs/misc/CLI-TOOLS-GUIDE.md](root-docs/misc/CLI-TOOLS-GUIDE.md) | doc-only |
| Vercel CLI | Deployment | [../vercel.json](../vercel.json), [../setup-vercel.ps1](../setup-vercel.ps1) | linked |
| GitHub CLI | GitHub automation | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | doc-only |
| PostgreSQL client | DB access | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | doc-only |
| Redis client | Cache access | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | doc-only |

## QA and testing stack

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Playwright | Web E2E tests | [../playwright.config.ts](../playwright.config.ts), [../tests/web-e2e](../tests/web-e2e) | linked |
| Newman (Postman CLI) | API tests | [../package.json](../package.json), [../tests/api](../tests/api) | linked |
| Postman app | API authoring | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | doc-only |
| Lighthouse CLI | Performance audits | [../configs/lighthouserc.json](../configs/lighthouserc.json) | linked |
| k6 | Load testing | [../tests/perf](../tests/perf), [../package.json](../package.json) | linked |
| Allure Framework | Unified reports (CLI + Docker) | [../package.json](../package.json), [../haida/docker-compose.yml](../haida/docker-compose.yml) | linked |
| Appium | Mobile testing | [root-docs/setup/APPIUM-MOBILE-SETUP.md](root-docs/setup/APPIUM-MOBILE-SETUP.md) | doc-only |
| axe-core | Accessibility testing | [../package.json](../package.json) | linked |

## Infra and hosting

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Supabase | Postgres + auth | [../.env.example](../.env.example), [../setup-supabase.ps1](../setup-supabase.ps1) | linked |
| PostgreSQL (service) | DB for tests | [../haida/docker-compose.yml](../haida/docker-compose.yml) | linked |
| Redis (service) | Cache and queues | [../docker-compose.yml](../docker-compose.yml), [../haida/docker-compose.yml](../haida/docker-compose.yml) | linked |
| Vercel (hosting) | Frontend hosting | [../vercel.json](../vercel.json), [root-docs/setup/VERCEL-DEPLOYMENT-VARIABLES.md](root-docs/setup/VERCEL-DEPLOYMENT-VARIABLES.md) | linked |
| Railway | Alternate hosting | [../railway.json](../railway.json), [../.env.example](../.env.example) | linked |
| Cloudflare | DNS | [CLOUDFLARE-DNS-UPDATE.md](CLOUDFLARE-DNS-UPDATE.md) | linked |
| changedetection.io | Change detection | [../haida/docker-compose.yml](../haida/docker-compose.yml) | linked |
| Selenium | Browser automation | [../haida/docker-compose.yml](../haida/docker-compose.yml) | linked |

## Collaboration, PM, and design

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Jira | Issue tracking | [../.env.example](../.env.example), [../scripts/create_jira_epics.py](../scripts/create_jira_epics.py) | linked |
| Confluence | Documentation sync | [../.env.example](../.env.example), [../scripts/upload_confluence_empresarial.py](../scripts/upload_confluence_empresarial.py) | linked |
| GitHub/GitLab/Azure DevOps | SCM and CI | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md), [../.github](../.github) | doc-only |
| Slack | Notifications | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | doc-only |
| Figma | Design assets | [../Figma](../Figma), [root-docs/misc/FIGMA-FILES-REFERENCE.md](root-docs/misc/FIGMA-FILES-REFERENCE.md) | linked |
| Microsoft Teams | Teams app | [../../haida-documentation/Agente-TeamsApp](../../haida-documentation/Agente-TeamsApp) | external |

## AI, LLM, and MCP

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Claude AI | LLM workflows | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md), [root-docs/misc/CLAUDE.MD](root-docs/misc/CLAUDE.MD) | doc-only |
| Microsoft 365 Copilot | LLM workflows | [root-docs/misc/HERRAMIENTAS-NECESARIAS.md](root-docs/misc/HERRAMIENTAS-NECESARIAS.md) | doc-only |
| Copilot Studio (Direct Line) | Bot channel | [../.env.example](../.env.example) | linked |
| LM Studio | Local LLM | [../.env.example](../.env.example) | linked |
| MLX-LM | Local LLM | [../.env.example](../.env.example) | linked |
| RouteLLM | LLM routing | [../.env.example](../.env.example) | linked |
| Perplexity | LLM provider | [../.env.example](../.env.example) | linked |
| AI Gateway | LLM gateway | [../.env.example](../.env.example) | linked |
| BrowserOS MCP | MCP endpoint | [../.env.example](../.env.example) | linked |
| Azure MCP | MCP integration | [../package.json](../package.json), [../.mcp](../.mcp) | linked |

## Identity, security, observability

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Microsoft Entra ID | SSO and OAuth | [root-docs/setup/AZURE-AD-SETUP.md](root-docs/setup/AZURE-AD-SETUP.md), [../.env.example](../.env.example) | linked |
| Microsoft Graph | Identity scopes | [../.env.example](../.env.example) | linked |
| Azure Key Vault | Secrets management | [__config_hits.txt](__config_hits.txt) | planned |
| OpenTelemetry | Observability | [__config_hits.txt](__config_hits.txt) | planned |
| Snyk | Security scanning | [../package.json](../package.json), [../.snyk](../.snyk) | linked |

## Messaging and notifications

| Tool | Purpose | Evidence | Status |
| --- | --- | --- | --- |
| Telegram Bot | Alerts | [../.env.example](../.env.example), [../scripts/telegram_bot_v2.py](../scripts/telegram_bot_v2.py) | linked |
| SMTP | Email notifications | [root-docs/setup/SMTP-CONFIG.md](root-docs/setup/SMTP-CONFIG.md), [../.env.example](../.env.example) | linked |

## Link health checklist

- Keep tool references in this file in sync with .env.example and package.json.
- When adding a new service, add a row here and link the setup doc or script.
- If a tool is removed, delete its env keys and remove the row.
