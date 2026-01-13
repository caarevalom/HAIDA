# HAIDA Gaps and Risks (Consolidated)

## Context
This summary consolidates gaps/risks mentioned across the HAIDA documentation set. Some items may be historical; verify current status before action.

## High / Medium Gaps
- Microsoft Entra OAuth was previously marked partial; latest scope indicates SSO configured. Verify `/entra/status` and envs in Vercel to reconcile docs.
- Backend routes reported as skeleton/mocked in `GAPS-INCIDENCIAS.md` (requires verification vs current production status).
- Frontend vs backend schema alignment issues (see `ANALISIS-ALINEACION-DATOS-FIGMA-DB.md`): tenant fields, enum mismatches, JSON vs text fields, missing tables.
- Missing backend unit/integration test coverage for FastAPI (`GAPS-INCIDENCIAS.md`).

## Operational Risks
- Environment variables are extensive and spread across multiple `.env*` files; drift risk between local, Vercel, and Railway.
- Multiple deploy targets referenced (Vercel, Railway) can create config divergence.
- Generated reports and large artifact directories (allure, test-results) can grow unbounded without cleanup policy.
- Telegram bot deployment depends on `TELEGRAM_BOT_TOKEN` and a valid MiniApp URL; verify Railway worker config and webapp domain.
- Copilot Studio (Direct Line) integration requires secrets/endpoints; ensure env values are defined where used.

## Recommended Next Actions (Verify + Execute)
1. Confirm OAuth status in production and update Entra config if SSO is required.
2. Re-validate backend routes against real DB operations (remove mocks if present).
3. Align frontend schema with Supabase schema (update enums and missing tables).
4. Add FastAPI tests (pytest) for auth, projects, and system endpoints.
5. Normalize environment variable sources and document canonical values.
