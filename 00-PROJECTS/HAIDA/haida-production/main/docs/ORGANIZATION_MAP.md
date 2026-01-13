# Organization map (HAIDA)

This file documents the current layout and a proposed target structure. It does not move files.

## Current roots

- /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev (dev workspace)
- /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main (prod workspace)
- /Users/carlosa/00-PROJECTS/HAIDA/haida-documentation (TeamsApp + iOS)
- /Users/carlosa/Documents/01-DOCUMENTATION/TECHNICAL/HAIDA (technical docs)

## Current subprojects inside haida-production/main

- app/ (frontend)
- api/ (backend APIs)
- haida/ (change detection stack + separate docker compose)
- chat-sdk/ (chat SDK)
- agents/ (agent assets)
- docs/ (docs + consolidated)
- tests/ (test suites)
- scripts/ (automation scripts)
- tools/ (utility scripts)
- supabase/ (supabase config)
- database/ (sql and schema)
- configs/ (tool configs)
- Figma/ (design assets)

## Proposed target structure (logical grouping)

```
haida-production/main/
  apps/               # app/, api/, chat-sdk/
  services/           # haida/ (change detection + haida-api)
  infra/              # docker-compose*.yml, vercel.json, railway.json
  data/               # database/, supabase/
  tests/              # tests/, test-results/, reports/
  scripts/            # scripts/, tools/, setup-*.ps1
  docs/               # keep docs here, add indexes
    root-docs/        # migrated root docs by category
```

## Move results (applied)

- Root-level docs moved under `docs/root-docs/` with categories.
- Tool registry lives at `docs/INTEGRATIONS_AND_TOOLS.md`.

## Link rules (keep consistent)

- Update README.md to point to docs/ORGANIZATION_MAP.md and docs/INTEGRATIONS_AND_TOOLS.md.
- When adding new tools, add them to docs/INTEGRATIONS_AND_TOOLS.md.
- When moving files, update links in README_HAIDA.md and OPERATIONAL_SETUP.md.
