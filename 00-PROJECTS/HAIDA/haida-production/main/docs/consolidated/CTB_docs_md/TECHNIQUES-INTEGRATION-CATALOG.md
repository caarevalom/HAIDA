# TECHNIQUES-INTEGRATION-CATALOG

Resumen ejecutivo: catálogo de 50 técnicas de IA/automatización (RAG, NLP, LLM, Orquestación, Observabilidad, Seguridad) mapeadas a la arquitectura HAIDA v2.0.

Objetivo: ofrecer un inventario accionable que indique para cada técnica:
- propósito
- punto(s) de integración (componentes/pipelines)
- endpoint o micro-función sugerida
- prioridad: **v2.0** (core, implementar en fase inicial) o **v2.1+** (post-lanzamiento)
- requerimientos de observabilidad y seguridad

---

## Convenciones
- Endpoints internos propuestos:
  - POST /ingest/sanitize → Normalización y limpieza de texto (encoding/characters)
  - POST /nlp/{task} → Servicios NLP (keyphrases, ner, sentiment, summarization)
  - POST /rag/search → Recuperación híbrida / RAG
  - POST /gen/{task} → Generación LLM (summaries, tests, prompts)
  - POST /guardrails/{check} → Validaciones (hallucination, toxicity, PII)
  - POST /orchestrator/execute → Orquestador (Temporal/Prefect jobs interface)
  - POST /observability/event → Telemetría / evaluaciones

---

## Mapeo por categoría

### 1) Recuperación & RAG (8 técnicas)
- semantic_search — Búsqueda semántica sobre índice (FAISS/Milvus/Weaviate).
  - Integración: ingestion → indexación → query service
  - Endpoint: POST /rag/search
  - Prioridad: **v2.0**
  - Observabilidad: query latency, hit-rate, recall@k

- hybrid_search — Mezcla BM25 + dense retrieval.
  - Integración: query pipeline, reranking
  - Endpoint: POST /rag/search (mode: hybrid)
  - Prioridad: **v2.0**

- dense_retrieval — Vectores de embeddings para documentos (OpenAI/Local EMM)
  - Integración: embedding jobs durante ingest
  - Prioridad: **v2.0**

- reranking — Reordenar candidatos con modelo ligero (distilBERT)
  - Integración: post-retrieval
  - Prioridad: **v2.1+**

- query_rewriting — Reescribe queries para mejorar recall (paraphrase)
  - Integración: pre-retrieval step
  - Prioridad: **v2.1+**

- result_fusion — Combina resultados multifuente (kb, web, cache)
  - Integración: response composer
  - Prioridad: **v2.1+**

- chunking_strategies — Estrategias de chunking para indexación (overlap, size)
  - Integración: ingestion pipeline
  - Prioridad: **v2.0**

- context_window_optimization — Selección dinámica del contexto antes de LLM call
  - Integración: gen pipeline
  - Prioridad: **v2.0**

---

### 2) NLP Avanzado (13 técnicas)
- keyphrase_extraction — Extraer frases clave de documentos (useful para tagging/test generation)
  - Endpoint: POST /nlp/keyphrases
  - Prioridad: **v2.0**

- topic_modeling — Agrupar documentación en temas para priorización de pruebas
  - Endpoint: POST /nlp/topics
  - Prioridad: **v2.1+**

- summarization — Resúmenes automáticos (docs → short/long)
  - Endpoint: POST /gen/summarize
  - Prioridad: **v2.0**

- sentiment_analysis — Calidad / tono en requisitos y comentarios
  - Endpoint: POST /nlp/sentiment
  - Prioridad: **v2.1+**

- NER — Identificación de entidades (endpoints, APIs, recursos)
  - Endpoint: POST /nlp/ner
  - Prioridad: **v2.0**

- PII_detection — Detectar datos sensibles (GDPR compliance)
  - Endpoint: POST /guardrails/pii
  - Prioridad: **v2.0** (crítico)

- deduplication — Detección y fusión de duplicados en corpus
  - Integración: ingestion → dedupe job
  - Prioridad: **v2.0**

- intent_classification — Clasificar intención en inputs (human-in-loop)
  - Endpoint: POST /nlp/intent
  - Prioridad: **v2.1+**

- text_normalization — Normalizar texto (unicode, control chars)
  - Endpoint: POST /ingest/sanitize
  - Prioridad: **v2.0** (crítico) — ver sección "Ingestión y normalización" abajo

- hallucination_detection — Detectar contenido inventado por LLMs
  - Endpoint: POST /guardrails/hallucination
  - Prioridad: **v2.1+**

- toxicity_filtering — Filtrar contenido ofensivo
  - Endpoint: POST /guardrails/toxicity
  - Prioridad: **v2.0**

- prompt_engineering — Templates y prompt compression (prompt cache)
  - Integración: gen pipeline + templates store
  - Prioridad: **v2.0**

- prompt_compression — Resumir contexto para reducir coste en LLM calls
  - Integración: pre-gen step
  - Prioridad: **v2.1+**

---

### 3) Generación & Control LLM (9 técnicas)
- structured_output — Forzar respuestas estructuradas (JSON Schema)
  - Endpoint: POST /gen/structured
  - Prioridad: **v2.0**

- function_calling — Usar function-calling para acciones seguras
  - Integración: gen orchestrator
  - Prioridad: **v2.1+**

- tool_selection — LLM chooses plugins/tools (search, calculator)
  - Integración: tool proxy layer
  - Prioridad: **v2.1+**

- guardrails — Validaciones de salida (PII/hallucination/toxicity)
  - Endpoint: POST /guardrails/validate
  - Prioridad: **v2.0**

- self_consistency — Aggregrar múltiples samples para robustez
  - Integración: sampling wrapper
  - Prioridad: **v2.1+**

- chain_of_thought_light — Traza de razonamiento reducido para debugging
  - Integración: debug mode en gen
  - Prioridad: **v2.1+**

- critique_and_revise — Ciclo: gen -> critique -> revise
  - Integración: iterate wrapper
  - Prioridad: **v2.1+**

- knowledge_grounding — Forzar grounding via RAG/kb citations
  - Integración: gen + RAG fusion
  - Prioridad: **v2.0**

- style_transfer — Convertir tono/formato (ej. ISTQB style)
  - Endpoint: POST /gen/style
  - Prioridad: **v2.1+**

---

### 4) Automatización & Orquestación (9 técnicas)
- workflow_orchestration — Jobs definidos en Temporal/Prefect (playbooks)
  - Integración: /orchestrator/execute + job definitions repo
  - Pri: **v2.0**

- event_driven_actions — Triggers desde webhook (changedetection → run tests)
  - Integración: webhook handlers + orchestrator
  - Pri: **v2.0**

- human_in_the_loop — Step approvals for sensitive actions
  - Integración: UI approval flow + events
  - Pri: **v2.0**

- auto_retry_backoff — Robust job retries with backoff policies
  - Integración: Temporal policies
  - Pri: **v2.0**

- rate_limiting — Multi-tenant rate limits and per-route quotas
  - Integración: API gateway + express-rate-limit
  - Pri: **v2.0**

- cache_layer — Vector & document cache for fast responses
  - Integración: Redis/LRU cache on /rag/search
  - Pri: **v2.0**

- policy_enforcement — Enforce corporate policies at runtime
  - Integración: policy engine (OPA) before heavy ops
  - Pri: **v2.0**

- template_engine — Prompt/templates management (versioned)
  - Integración: Templates store + editor
  - Pri: **v2.0**

- (reserved) extensibility pattern — Plugin architecture for external tools
  - Pri: **v2.1+**

---

### 5) Observabilidad & Calidad (7 técnicas)
- eval_harness — Framework para evaluar LLM outputs contra oracles
  - Integración: test harness + nightly jobs
  - Pri: **v2.1+**

- test_generation_auto — Auto-generate tests from specs (ISTQB prompts)
  - Integración: gen -> test generator
  - Pri: **v2.0**

- drift_detection — Detect shift in model or data distributions
  - Integración: telemetry + model-monitor jobs
  - Pri: **v2.1+**

- feedback_loop — Collect user feedback to retrain/re-rank
  - Integración: feedback endpoint + dataset store
  - Pri: **v2.1+**

- telemetry_logging — Rich traces for LLM calls (latency, tokens)
  - Integración: /observability/event
  - Pri: **v2.0**

- explanations_trace — Store explainability artifacts (why a test was generated)
  - Integración: attach explanation to test metadata
  - Pri: **v2.1+**

- error_bucketing — Group LLM/infra errors for prioritization
  - Integración: Sentry/Grafana alerts
  - Pri: **v2.0**

---

### 6) Seguridad & Compliance (5 técnicas)
- input_validation — Strong validation for all inputs (Joi/OpenAPI)
  - Pri: **v2.0**

- secrets_management — Vault + RBAC for keys
  - Pri: **v2.0**

- abuse_prevention — Rate limits, CAPTCHAs, verification
  - Pri: **v2.0**

- red_team_testing — Regular adversarial tests to find failure modes
  - Pri: **v2.1+**

- privacy_preserving — Pseudonymization, data minimization
  - Pri: **v2.1+**

---

## Ingestión y Normalización (caracteres extraños) — Diseño e implementación
Problema: los documentos pueden contener encodings distintos y caracteres no imprimibles que rompen pipelines de NLP/RAG/LLM.

Solución propuesta (pipeline):
1. Detect encoding (chardet) y convertir a UTF-8 si es necesario.
2. Normalizar Unicode (NFC o NFKC según política).
3. Eliminar caracteres de control y reemplazar espacios especiales (NBSP, 	, 


















































© HAIDA - Técnicas Integration Catalog — Generado por Copilot---- Mantener el catálogo como living document (`TECHNIQUES-INTEGRATION-CATALOG.md`), actualizable por PRs.- Usar feature flags para togglear técnicas experimentales (v2.1+) y habilitarlas por entorno.- Cada endpoint debe incluir schema OpenAPI y tests (unit + integration) en la carpeta `tests/`.## Notas finales---- latency_ms, token_count, success_rate, error_rate, PII_hits, replaced_chars_count, index_size, recall@k## Observabilidad y métricas mínimas por técnica---- Week 5-7 (v2.1): reranking, query_rewriting, drift_detection, eval_harness, red_team_testing.- Week 3 (v2.0): workflow_orchestration (Temporal), event_driven_actions, cache_layer, rate_limiting.- Week 1 (v2.0 core): /ingest/sanitize, text_normalization, semantic_search, dense_retrieval, keyphrase_extraction, structured_output, guardrails (PII/toxicity), telemetry.## Plan de implementación (prioridad y hitos)---Recomendación: agregar `tools/normalize-text.js` con la función y `POST /ingest/sanitize` en HAIDA API (middleware de validación + logging). También activar métricas en Prometheus para monitorizar documentos con problemas de encoding.```}  return s  s = s.replace(/\s+/g, ' ').trim()  // Collapse multiple spaces  s = s.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')  // Replace NBSP and other whitespace with normal space  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')  // Remove control chars  s = s.normalize('NFKC')  // Normalize unicode  if (!s) return sfunction sanitizeText(s) {```jsSnippet Node.js (pseudocódigo):- Response: { ok: true, sanitized: string, issues: [ { type, detail } ] }- Request: { source: string, content: base64|string, filename?: string }Endpoint de integración: POST /ingest/sanitize6. Registro: telemetría por documento (errors, replaced_chars_count, encoding)5. Validación y guardado: mantener `original_text` + `sanitized_text` en el repositorio/document-store.4. Aplicar transliteration opcional (ej: å → a) para idiomas no críticos o dejar original y almacenar alias.) por espacios simples.