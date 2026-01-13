# 📮 Configuración: Postman en VS Code

**Autor:** Carlos Arévalo | hola@stayarta.com

---

## 1. Instalación de Extensión Postman

### Opción A: Desde VS Code Marketplace

1. Abre VS Code
2. Ve a **Extensiones** (Ctrl+Shift+X)
3. Busca: `Postman`
4. Instala la extensión oficial: **Postman for VS Code** (por Postman Inc.)

```
ID: postman.postman-for-vscode
```

### Opción B: Desde Terminal

```powershell
code --install-extension postman.postman-for-vscode
```

---

## 2. Autenticación con Team Hiberus

### Paso 1: Abrir Postman en VS Code

1. Una vez instalada, abre la paleta de comandos: **Ctrl+Shift+P**
2. Escribe: `Postman: Open Postman`
3. Se abrirá el panel de Postman en la barra lateral

### Paso 2: Iniciar Sesión

1. En el panel de Postman, haz clic en **Sign In**
2. Usa credenciales de Hiberus:
   - Email: Tu email corporativo
   - Contraseña: Contraseña de Hiberus
3. Verifica autenticación de dos factores si es necesario

### Paso 3: Seleccionar Team

1. Una vez autenticado, verás: **Team: Hiberus AI-Driven QA**
2. Haz clic en el selector de team
3. Selecciona: `Hiberus AI-Driven QA`

---

## 3. Importar Colecciones de API

### Opción A: Desde la carpeta de proyecto

**Ubicación de colecciones:**

```
qa-starter-kit/configs/postman-collections/
```

### Opción B: Importar vía Team

1. En el panel de Postman, ve a **Collections**
2. Selecciona tu team: `Hiberus AI-Driven QA`
3. Las colecciones compartidas del team aparecerán automáticamente

### Opción C: Importar archivo .json

1. Abre la paleta: **Ctrl+Shift+P**
2. Escribe: `Postman: Import File`
3. Selecciona archivo `.json` de colección
4. Confirma importación

---

## 4. Ejecutar Tests desde VS Code

### Opción A: CLI (Newman) - Recomendado para CI/CD

```powershell
# Ejecutar colección completa
npx newman run "./configs/postman-collections/HAIDA-API-Tests.json" `
  --environment "./configs/postman-collections/environments/ctb-production.json" `
  --reporters cli,json

# Resultado generado en: ./test-results/postman-results.json
```

### Opción B: Desde interfaz Postman en VS Code

1. En panel de Postman, selecciona colección
2. Haz clic en **Run** (ícono de play)
3. Selecciona entorno: `CTB Production`
4. Presiona **Run**
5. Verás resultados en tiempo real en el panel

### Opción C: Scripts de prueba personalizados

Ubicación: `haida/generators/postman-test-runner.ps1`

```powershell
# Ejecutar con reporte Allure
powershell -File haida/generators/postman-test-runner.ps1 `
  -Collection "HAIDA-API-Tests" `
  -Environment "ctb-production" `
  -GenerateAllureReport
```

---

## 5. Estructura de Colecciones Recomendada

```
configs/postman-collections/
├── HAIDA-API-Tests.json                    # Colección principal
├── HAIDA-Performance-Tests.json            # Tests de rendimiento (k6)
├── HAIDA-Security-Tests.json               # Tests de seguridad (OWASP)
├── environments/
│   ├── ctb-development.json                # Entorno desarrollo
│   ├── ctb-staging.json                    # Entorno staging
│   └── ctb-production.json                 # Entorno producción
└── README.md                               # Documentación
```

---

## 6. Variables de Entorno en VS Code

### Configurar variables globales

1. En panel de Postman, ve a **Environments**
2. Haz clic en **Create New Environment**
3. Nombre: `Local Development`
4. Variables:
   ```json
   {
     "base_url": "http://localhost:3000",
     "api_key": "tu-key-local",
     "timeout": "5000"
   }
   ```

### Usar en requests

```
GET {{base_url}}/api/users
```

---

## 7. Integración con Tests Playwright

### Flujo recomendado:

1. **Ejecutar Playwright** (E2E UI):

   ```powershell
   npm test -- --project=chromium
   ```

2. **Ejecutar Newman** (API):

   ```powershell
   npx newman run "./configs/postman-collections/HAIDA-API-Tests.json"
   ```

3. **Generar reporte consolidado**:
   ```powershell
   powershell -File haida/generators/merge-test-reports.ps1
   ```

---

## 8. Troubleshooting

### Problema: "No se puede conectar a Postman"

**Solución:**

```powershell
# Limpiar cache
Remove-Item -Path $env:APPDATA\Postman -Recurse -Force
# Reinstalar extensión
code --install-extension postman.postman-for-vscode --force
```

### Problema: "Colecciones no sincronizadas"

**Solución:**

```powershell
# Verificar sincronización
curl -H "X-API-Key: $env:POSTMAN_API_KEY" `
     https://api.getpostman.com/collections
```

### Problema: "Errores de timeout en Newman"

**Solución:**

```powershell
npx newman run collection.json `
  --timeout-request 10000 `
  --timeout-script 10000
```

---

## 9. Configuración CI/CD (GitHub Actions)

Archivo: `.github/workflows/api-tests.yml`

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run Newman tests
        run: npx newman run "./configs/postman-collections/HAIDA-API-Tests.json"
      - name: Generate report
        if: always()
        run: npm run report:allure
```

---

## 10. Mejores Prácticas

| Práctica          | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| **Organización**  | Agrupa requests por módulo/endpoint            |
| **Variables**     | Usa variables de entorno, no URLs hardcodeadas |
| **Tests**         | Cada request debe tener tests de validación    |
| **Documentación** | Describe cada request y su propósito           |
| **Versionado**    | Guarda colecciones en Git                      |
| **CI/CD**         | Automatiza ejecución en pipelines              |

---

## 11. Comandos Útiles

```powershell
# Listar colecciones en team
postman-cli list collections --team "Hiberus AI-Driven QA"

# Ejecutar con variables personalizadas
npx newman run collection.json `
  -e environment.json `
  -d data.csv `
  -r cli,json,html

# Generar reporte HTML
npx newman run collection.json -r html --reporter-html-template custom-template.html

# Ejecutar con pause entre requests
npx newman run collection.json --delay-request 1000
```

---

## 12. Próximos Pasos

✅ Instalación de extensión  
✅ Autenticación con team  
✅ Importar colecciones  
✅ Ejecutar tests desde VS Code  
✅ Integrar con Playwright  
✅ Configurar CI/CD

**Estado:** Listo para usar Postman en VS Code ✓

---

**Documentación:**

- [Postman for VS Code](https://learning.postman.com/docs/postman-for-vscode/overview/)
- [Newman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-overview/)
- [Team Collaboration](https://learning.postman.com/docs/postman/team-collaboration/managing-your-team/)
