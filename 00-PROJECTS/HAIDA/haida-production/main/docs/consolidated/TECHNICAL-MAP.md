# HAIDA Technical Map (Consolidated)

## Scope
This map summarizes the current HAIDA system using the consolidated documentation corpus.

## Primary Services
- Frontend (Vercel): `https://haida.stayarta.com`
- Backend API (Vercel serverless): `https://haidapi.stayarta.com`
- Database (Supabase PostgreSQL): see Supabase URL in env files

## DNS Targets (Stayarta)
- Frontend: `haida.stayarta.com` -> CNAME to Vercel frontend
- Backend API: `haidapi.stayarta.com` -> CNAME to Vercel backend
- Telegram bot: `bothaida.stayarta.com` -> CNAME to Railway app
- Optional: `docs.stayarta.com`, `reports.stayarta.com`, `metrics.stayarta.com`

## Microsoft SSO (Entra)
- Dual auth: email/password + Microsoft SSO
- Redirect URIs include frontend, backend callback, and Supabase callback
- Secrets and client IDs must live in environment variables (do not commit)

## Repository Layout (HAIDA-PROJECT)
- `Figma/`: React + Vite frontend
- `api/`: FastAPI backend (serverless)
- `database/`: SQL schema, migrations, seed data
- `tests/`: Playwright (web), Newman (API), k6 (perf)
- `haida/`: AI test generator + change detection tooling
- `docs/`: Project and operational documentation
- `configs/`: Lighthouse and testing config
- `scripts/`: Ops and automation scripts

## Frontend
- Framework: React 18 + Vite
- UI: Radix UI + MUI + Tailwind
- Auth: Supabase Auth + JWT integration
- Pages (examples): Login, Dashboard, Projects, Executor, Reporter, Chat, Documentation, Profile, Inbox
- Config: `Figma/vercel.json`, `.env*` and Vite envs

## Backend API
- Framework: FastAPI (serverless)
- Entry points: `api/index.py`, `api/auth.py`, `api/entra.py`, `api/db.py`, `api/email.py`
- Auth: JWT, Supabase, Microsoft Entra (partially configured)
- Health/status endpoints: `/api/health`, `/api/status`

## Database
- Supabase PostgreSQL
- Schema and migrations in `database/`
- RLS policies and fixes documented in SQL files

## Testing
- Web E2E: Playwright (`tests/web-e2e`)
- API: Newman (`tests/api`)
- Performance: k6 (`tests/perf`) + Lighthouse config
- Reporting: Allure (`allure-results`, `reports/`)

## HAIDA AI Module
- Templates: ISTQB prompts and CSV schema in `haida/templates/`
- Generator: PowerShell scripts in `haida/generators/`
- Change detection tooling under `haida/change-detection/`
- Outputs: generated CSV test cases in `haida/outputs/`

## Automation & Integrations
- Telegram bot: `scripts/telegram_bot_v2.py` (MiniApp dashboard, test triggers, reporting, Jira/Confluence links, inline mode)
- Copilot Studio (Direct Line): env variables in `.env.example`; instructions in `.github/copilot-instructions.md`
- Jira/Confluence references: see `docs/business/01-REQUERIMIENTOS-JIRA.md` and bot menus
- LLM local gateway: LM Studio/DeepSeek R1 referenced via `LM_STUDIO_*` envs and bot status text

## Runtime/Infra
- Docker: `Dockerfile`, `docker-compose.yml` (backend + redis)
- CI/CD: `.github/workflows/`
- Vercel: `vercel.json`, `Figma/vercel.json`
