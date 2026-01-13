# Configuraciones Centralizadas

Centro de configuración para el sistema de desarrollo y herramientas.

## 📋 Estructura

```
04-CONFIGURATION/
├── deployment/         → Configuraciones de despliegue
├── git-config/        → Configuraciones de Git
├── tool-configs/      → Configuraciones de herramientas de desarrollo
├── .env               → Configuración principal de HAIDA (189 variables)
├── README.md          → Este archivo
└── TOOLS-INVENTORY.md → Inventario detallado de herramientas
```

## ⚙️ Archivos de Configuración

### .env - Configuración Principal

**Ubicación**: `/Users/carlosa/04-CONFIGURATION/.env`
**Tamaño**: ~10 KB (189 líneas)
**Propósito**: Configuración centralizada para HAIDA

**Contenido**:
- Configuración de aplicación
- Credenciales de servicios de terceros
- URLs de endpoints
- Configuraciones de base de datos
- Configuraciones de autenticación

**Nota**: Este es el archivo .env principal para despliegues de HAIDA.

### .env (Raíz - Complementario)

**Ubicación**: `/Users/carlosa/.env`
**Tamaño**: ~55 bytes (1 línea)
**Propósito**: Variables complementarias locales

**Contenido**:
```
GEMINI_API_KEY=AIzaSyAcALT2NEFcT0OltzhYzjot3m7YZue9OTA
```

**Nota**: Esta clave es única y local. No está en 04-CONFIGURATION/.env.

## 🔀 Cuándo Usar Cada .env

| Escenario | Archivo | Razón |
|-----------|---------|-------|
| Despliegue de HAIDA | `04-CONFIGURATION/.env` | Contiene todas las variables necesarias |
| Desarrollo local con Gemini | `/Users/carlosa/.env` | Acceso rápido, variable única |
| Nuevos despliegues | `04-CONFIGURATION/.env` | Archivo principal y documentado |
| Scripts locales rápidos | `/Users/carlosa/.env` | Para herramientas del sistema |

## 🗂️ Subdirectorios

### deployment/
Configuraciones específicas de despliegue:
- Archivos de configuración para diferentes entornos
- Scripts de setup de infraestructura

### git-config/
Configuraciones de Git:
- Configuración de hooks
- Ignoring patterns
- Configuración de usuario

### tool-configs/
Configuraciones de herramientas de desarrollo:
- VSCode (`.vscode/`)
- IDE settings
- Linter configurations
- Build tool configs

## 📚 Referencias Rápidas

- **Desplegar HAIDA**: Ver `01-DOCUMENTATION/TECHNICAL/HAIDA/DEPLOYMENT/`
- **Inventario de herramientas**: Ver `04-CONFIGURATION/TOOLS-INVENTORY.md`
- **Configuración de VSCode**: Ver `04-CONFIGURATION/tool-configs/`

## ⚠️ Notas de Seguridad

- ✅ `.env` files contienen credenciales sensibles
- ✅ Nunca commitear `.env` en Git (ya excluido)
- ✅ Hacer backup seguro de archivos `.env`
- ✅ Restringir permisos: `chmod 600 .env`
- ✅ Cambiar credenciales expuestas después de reorganización

## 🔄 Próximos Pasos

1. Revisar `TOOLS-INVENTORY.md` para documentación de herramientas
2. Actualizar credenciales si es necesario
3. Sincronizar configuraciones entre entornos
4. Documentar nuevas herramientas cuando se agreguen

---

**Última actualización**: 11 de enero, 2026
**Estado**: Consolidado y documentado
