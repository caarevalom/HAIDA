╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              PREGUNTAS CRÍTICAS ANTES DE EMPEZAR IMPLEMENTACIÓN             ║
║                                                                              ║
║         Responde estas para que proceda de forma segura con cliente         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
❓ PREGUNTA 1: CLIENTE REAL - ¿CUÁL ES EL PROYECTO?
═══════════════════════════════════════════════════════════════════════════════

Necesito un proyecto REAL del cliente para demostrar funcionalidad completa.

OPCIONES:

A) Tienes un cliente actual con un proyecto específico:
   └─ Cuéntame: Nombre proyecto, descripción, módulos, requisitos
   └─ Ejemplo: "App de autenticación con login, 2FA, recuperar contraseña"

B) Prefieres que cree un caso ficticio pero realista:
   └─ Puedo crear: Sistema de Biblioteca, E-commerce, CRM, etc.
   └─ Será lo suficientemente complejo para demostrar toda la toolchain

C) Tienes documentación de cliente listo:
   └─ Puedes pasar: BRD, PRD, User Stories
   └─ Lo usaré como base para la especificación

RESPONDE: ¿Opción A, B, o C? ¿Detalles del proyecto?


═══════════════════════════════════════════════════════════════════════════════
❓ PREGUNTA 2: AMBIENTE - ¿DÓNDE IMPLEMENTAMOS?
═══════════════════════════════════════════════════════════════════════════════

OPCIONES:

A) Local + Git branches (MÁS SEGURO)
   └─ Creamos ramas: feature/etapa-1, feature/etapa-2, etc.
   └─ Cada etapa se merge solo si apruebas
   └─ Rollback fácil si algo falla
   └─ Zero riesgo para producción

B) Clon del repo (ALTERNATIVA SEGURA)
   └─ Clonamos qa-starter-kit a qa-starter-kit-production
   └─ Implementamos en clon
   └─ Comparamos resultados antes de merge a original
   └─ Bueno si hay múltiples personas trabajando

C) Directamente en main (NO RECOMENDADO PARA CLIENTE)
   └─ Cambios directos, sin rama
   └─ Riesgo alto si algo falla
   └─ Solo si ya tienes cambios en producción

RESPONDE: ¿Opción A (recomendada) o B?


═══════════════════════════════════════════════════════════════════════════════
❓ PREGUNTA 3: APROBACIÓN - ¿QUIÉN VALIDA?
═══════════════════════════════════════════════════════════════════════════════

OPCIONES:

A) Solo tú (usuario actual)
   └─ Tú apruebas cada etapa
   └─ Tú decides si continuamos o rollback
   └─ Más simple, pero requiere tu tiempo

B) Tú + Tech Lead del cliente
   └─ Tech lead revisa antes de aprobación final
   └─ Ambos aprueban para continuar
   └─ Más rigor (bueno para cliente real)

C) Solo avanzamos, reportamos al final
   └─ Implemento todas etapas, luego muestro resultados
   └─ Más rápido, pero menos control en el camino
   └─ No recomendado para cliente real

RESPONDE: ¿Opción A (rápido) o B (más rigor)?


═══════════════════════════════════════════════════════════════════════════════
❓ PREGUNTA 4: TIMING - ¿CUÁL ES LA PRIORIDAD?
═══════════════════════════════════════════════════════════════════════════════

OPCIONES:

A) Rápido: 1-2 semanas completo
   └─ Implemento todos cambios de forma concentrada
   └─ Etapas más cortas (algunas de 2-3 horas)
   └─ Menos tiempo de espera entre aprobaciones

B) Deliberado: 3-4 semanas, bien hecho
   └─ Cada etapa bien testada
   └─ Tiempo para ajustes y mejoras
   └─ Menos presión, mejor calidad
   └─ RECOMENDADO PARA CLIENTE

C) Solo lo crítico (Fase 1): 1 semana
   └─ Implemento items 1.1-1.5 nada más
   └─ Dejaría Fase 2 (escalabilidad) para después
   └─ Mínimo riesgo, máximo beneficio inmediato

RESPONDE: ¿Opción A, B, o C?


═══════════════════════════════════════════════════════════════════════════════
📋 RESPONDE ESTAS 4 PREGUNTAS Y EMPEZAMOS
═══════════════════════════════════════════════════════════════════════════════

Copia y completa:

1. PROYECTO (A/B/C): ___________________
   Detalles: ___________________

2. AMBIENTE (A/B): ___________________

3. APROBACIÓN (A/B/C): ___________________

4. TIMING (A/B/C): ___________________

Una vez respondas, comienzo INMEDIATAMENTE con Etapa 1 (POC Validación).
