# Jira + Confluence Integration Architecture (High Volume, Multi Project)

## Objetivo
Definir una arquitectura escalable para sincronizar Jira y Confluence con HAIDA/QA,
soportando muchos proyectos y alto volumen de datos sin duplicados.

## Principios
- Source of truth en Supabase, Jira/Confluence como destinos de publicacion.
- Idempotencia por `external_id` + `project_id` + `entity_type`.
- Sincronizacion incremental (por `updated_at` y cursores).
- Lotes pequenos con backoff y rate limit por API.
- Evidencias grandes en storage, no adjuntar binarios pesados a Jira.

## Componentes
1) Integration Hub
- Orquesta ingesta, normalizacion, enrichment y upsert.
- Expone endpoints internos para sync manual y jobs programados.

2) Connectors
- Jira Connector: crea/actualiza issues, links, comments.
- Confluence Connector: crea/actualiza paginas y jerarquia.

3) Queue + Workers
- Cola por proyecto y tipo (issues, pages, results).
- Workers con reintentos y DLQ.

4) Supabase (DB + Storage)
- DB para entidades y mappings.
- Storage para screenshots, videos, logs, reportes.

## Logica de sincronizacion
- Ingesta -> normalizacion -> enrichment -> upsert externo -> audit.
- Upsert por hash de contenido (evitar updates innecesarios).
- En Jira, guardar metadata extendida en issue properties.
- En Confluence, usar Page Properties para metadatos y Page Properties Report para indices.

## Jira (modelo y logica)
- Issue types: Test Case, Test Execution, Bug (o Task si no hay plugin).
- Custom fields: test_case_id, suite_id, run_id, environment, platform, device.
- Labels controladas (no usar labels para datos estructurados).
- Issue properties con JSON (source, external_id, hash, last_sync_at).
- Links: test case <-> defect, test run <-> report.

## Confluence (modelo y logica)
- Espacio por cliente o programa.
- Jerarquia: Proyecto -> Releases -> Test Runs -> Reportes.
- Page Properties Macro con fields: project, run_id, env, status, coverage, date.
- Paginas generadas con template estable (para diffs y comparabilidad).

## Metadata y keywords
- Metadata estructurada (campos/JSON) para reporting.
- Keywords/labels solo para busqueda rapida:
  - project:ctb, module:auth, type:e2e, env:prod, platform:ios
- Taxonomia controlada para evitar ruido.

## Observabilidad
- Sync jobs con estado y metricas.
- Logs con correlation_id.
- Reportes de errores por conector y por proyecto.

## Seguridad
- Tokens almacenados como `credential_ref` (no en texto plano).
- RLS por tenant/proyecto.
- Audit trail de cambios y sincronizaciones.

## Escalabilidad
- Paginacion y lotes (100-200 items).
- Particionar por proyecto.
- Archivado de runs antiguos.
- Storage con retencion y politicas de expiracion.
