# Repository Guidelines

## Estructura del Proyecto y Módulos
- `app/`: Entrada FastAPI (`app/main.py`), middleware/config en `app/core/`, routers de features en `app/routes/`.
- `api/`: Punto de entrada serverless para Vercel que expone la app de FastAPI.
- `database/` e `infrastructure/supabase/`: Esquemas SQL, migraciones y ayudas de conexión.
- `tests/`: Web E2E en `tests/web-e2e/` (Playwright), flujos API en `tests/api/` (Newman), scripts de performance en `tests/perf/` (k6).
- `configs/`, `reports/` y `tools/`: Configuración compartida, reportes generados (Allure/Lighthouse/Newman) y utilidades.

## Comandos de Build, Test y Desarrollo
- Backend Python: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
- Herramientas JS: `npm install` (Node 18+).
- Backend local: `uvicorn app.main:app --reload --port 8000` (usa `.env` si existe). Alternativa: `docker-compose up -d --build`.
- Web E2E: `npm run test:web` (headless) o `npm run test:web:ui` (UI de depuración).
- API: `npm run test:api` (JUnit en `reports/newman/results.xml`).
- Performance: `npm run test:perf`.
- Auditoría accesibilidad/perf: `npm run lighthouse` con `BASE_URL` definido.
- Reportes: `npm run report` (HTML Playwright) y `npm run allure:generate && npm run allure:open`.

## Estilo de Código y Convenciones
- Python: PEP8, indentación 4 espacios, type hints cuando aplique; módulos/funciones en `snake_case`.
- TS/JS tests: cumplir `tsconfig.json`; variables en `camelCase`, clases/fixtures en `PascalCase`; archivos `*.spec.ts`.
- Configuración como código: llaves de entorno en plantillas `.env` y defaults documentados en su README.
- Formato: no hay formateador global; sigue el patrón existente y ordena/importa por grupos.

## Guía de Testing
- Añade/expande specs Playwright en la carpeta de la funcionalidad; comparte fixtures/helpers en `tests/web-e2e/`.
- Las colecciones Newman deben reflejar el contrato del API; actualiza entornos si cambian endpoints.
- Cubre al menos un caso feliz y uno negativo/borde por endpoint o flujo UI tocado.
- Deja artefactos en `reports/`; evita commitear binarios pesados salvo que sean evidencia requerida.

## Commits y Pull Requests
- Usa estilo Conventional Commits (`feat:`, `fix:`, `chore:`). Ej.: `feat: agregar refresh de auth`.
- En PRs incluye: resumen de alcance, issue/ticket vinculado, pruebas ejecutadas (`npm run test:web`, `npm run test:api`, etc.) y enlaces a evidencias (Allure/Playwright).
- Señala explícitamente cambios de configuración o esquemas y los env vars/migraciones necesarios.
- Mantén diffs pequeños y acotados; separa PRs de docs, código y migraciones cuando sea posible.

## Seguridad y Configuración
- No subas secretos; usa `.env` con placeholders documentados.
- Rota tokens de prueba y limpia credenciales cacheadas en artefactos CI.
- Al añadir rutas nuevas, revisa CORS y auth para seguir el patrón de routers existentes y registra con IDs de correlación de `RequestIdMiddleware`.
