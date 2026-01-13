# TypeSpec Tools

Herramientas y utilidades para trabajar con TypeSpec (especificación de APIs).

## 📋 Descripción

Este proyecto contiene herramientas para compilar y trabajar con especificaciones TypeSpec:

- **@typespec/compiler** - Compilador principal de TypeSpec
- **Dependencias asociadas** - Todas las librerías necesarias para TypeSpec

## 🛠️ Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
cd /Users/carlosa/00-PROJECTS/typespec-tools
npm install
```

## 📦 Dependencias

```json
{
  "dependencies": {
    "@typespec/compiler": "^1.7.1"
  }
}
```

## 🚀 Uso

Para usar TypeSpec desde línea de comandos:

```bash
cd /Users/carlosa/00-PROJECTS/typespec-tools
npx tsp --version
npx tsp compile ./spec.tsp
```

O agregar a tu PATH:

```bash
export PATH="/Users/carlosa/00-PROJECTS/typespec-tools/node_modules/.bin:$PATH"
```

## 📂 Estructura

```
typespec-tools/
├── node_modules/        → Dependencias instaladas
├── package.json         → Definición de dependencias
├── package-lock.json    → Lock file de dependencias
└── README.md            → Este archivo
```

## 🔗 Enlaces Útiles

- [Documentación de TypeSpec](https://typespec.io/)
- [GitHub de TypeSpec](https://github.com/microsoft/typespec)

## 📝 Notas

- Proyecto creado el **11 de enero, 2026**
- Relocalizado desde la raíz del home a este directorio dedicado
- Propósito: Mantener las herramientas de desarrollo organizadas

---

**Ubicación**: `/Users/carlosa/00-PROJECTS/typespec-tools/`
**Última actualización**: 11 de enero, 2026
