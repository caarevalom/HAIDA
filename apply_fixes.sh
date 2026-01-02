  #!/bin/bash
  echo "🚀 Aplicando FASE 1 - Fixes Críticos..."

  # FIX 0: Eliminar routers obsoletos
  echo "📁 Eliminando app/routers/..."
  rm -rf app/routers/

  # FIX 1: runs.py
  echo "⚡ Fix 1/5: runs.py - Optimizando imports..."
  # Agregar imports después de línea 8
  sed -i.bak '/^import uuid$/a\
  import jwt\
  import os' app/routes/runs.py

  # Eliminar imports duplicados dentro de funciones (líneas 93-94)
  sed -i '' '/get_current_user_id/,/except/{/^[[:space:]]*import jwt$/d; /^[[:space:]]*import os$/d;}' app/routes/runs.py

  # FIX 2: scripts.py
  echo "⚡ Fix 2/5: scripts.py - Optimizando imports..."
  sed -i.bak '/^import uuid$/a\
  import jwt\
  import os' app/routes/scripts.py

  sed -i '' '/get_current_user_id/,/except/{/^[[:space:]]*import jwt$/d; /^[[:space:]]*import os$/d;}' app/routes/scripts.py

  # FIX 3: chat.py - LIMIT en mensajes
  echo "⚡ Fix 3/5: chat.py - Agregando LIMIT 500..."
  sed -i.bak 's/ORDER BY created_at ASC"/ORDER BY created_at ASC LIMIT 500"/' app/routes/chat.py

  # FIX 4: reports.py - 4 LIMITs
  echo "⚡ Fix 4/5: reports.py - Agregando 4 LIMITs..."
  sed -i.bak 's/SELECT id FROM test_suites WHERE project_id = %s)$/SELECT id FROM test_suites WHERE project_id = %s) LIMIT 1000/' app/routes/reports.py

  # Agregar ORDER BY y LIMIT a GROUP BY test_type
  perl -i -pe 's/(GROUP BY test_type\s*)"\s*,/$1 ORDER BY count DESC LIMIT 100\n    ",/' app/routes/reports.py

  # Agregar LIMIT 30 a daily_trends
  perl -i -pe 's/(ORDER BY date DESC\s*)"\s*,/$1 LIMIT 30\n    ",/' app/routes/reports.py

  # Cambiar LIMIT 100 por LIMIT 50 en performance
  sed -i '' 's/LIMIT 100$/LIMIT 50/' app/routes/reports.py

  echo ""
  echo "✅ Todos los fixes aplicados!"
  echo ""
  echo "📊 Archivos modificados:"
  echo "  - app/routers/ (eliminado)"
  echo "  - app/routes/runs.py"
  echo "  - app/routes/scripts.py"
  echo "  - app/routes/chat.py"
  echo "  - app/routes/reports.py"
  echo ""
  echo "💾 Backups creados:"
  echo "  - app/routes/runs.py.bak"
  echo "  - app/routes/scripts.py.bak"
  echo "  - app/routes/chat.py.bak"
  echo "  - app/routes/reports.py.bak"
  EOF

  chmod +x apply_fixes.sh
  ./apply_fixes.sh
