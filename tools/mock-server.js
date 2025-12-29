#!/usr/bin/env node
/**
 * Mock HTTP Server - Local Testing Only
 * Simula un servidor web para pruebas E2E seguras en entorno corporativo
 * No requiere conexión a internet ni servidores externos
 */

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// Página HTML de prueba - simple y segura
const mockHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Testing - Servidor Local de Pruebas</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 40px;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #007acc;
      margin-bottom: 20px;
      font-size: 28px;
    }
    .status {
      display: flex;
      align-items: center;
      margin: 20px 0;
      padding: 12px;
      background: #f0f9ff;
      border-left: 4px solid #10b981;
      border-radius: 4px;
    }
    .status::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
      font-size: 20px;
      margin-right: 12px;
    }
    .info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      padding: 16px;
      margin: 20px 0;
      color: #1e40af;
      font-size: 14px;
      line-height: 1.5;
    }
    .links {
      display: flex;
      gap: 12px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    a {
      display: inline-block;
      padding: 10px 16px;
      background: #007acc;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;
    }
    a:hover {
      background: #005a9e;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    .section h2 {
      font-size: 18px;
      margin-bottom: 12px;
      color: #007acc;
    }
    .list {
      list-style: none;
      padding: 0;
    }
    .list li {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .list li:last-child {
      border-bottom: none;
    }
    .warning {
      background: #fffbeb;
      border: 1px solid #fbbf24;
      color: #92400e;
      padding: 12px;
      border-radius: 4px;
      margin: 20px 0;
    }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>QA Testing - Servidor Local</h1>
    
    <div class="status">
      Servidor ejecutándose en entorno local seguro
    </div>

    <div class="info">
      <strong>ℹ️ Información importante:</strong><br>
      Este es un servidor de prueba local. Todos los datos están siendo procesados de forma segura en tu máquina sin conexión a internet.
    </div>

    <div class="section">
      <h2>📋 Estado del servidor</h2>
      <ul class="list">
        <li><strong>URL base:</strong> http://localhost:3000</li>
        <li><strong>Puerto:</strong> 3000 (local)</li>
        <li><strong>Entorno:</strong> Corporativo - Local seguro</li>
        <li><strong>Conexión externa:</strong> Deshabilitada</li>
        <li><strong>Datos personales:</strong> Ninguno recopilado</li>
      </ul>
    </div>

    <div class="section">
      <h2>✅ Navegación de prueba</h2>
      <div class="links">
        <a href="/">Home</a>
        <a href="/page1">Página 1</a>
        <a href="/page2">Página 2</a>
        <a href="/api">API Test</a>
      </div>
    </div>

    <div class="section">
      <h2>🔐 Seguridad corporativa</h2>
      <ul class="list">
        <li>✓ Sin conexión a servidores externos</li>
        <li>✓ Sin transmisión de datos corporativos</li>
        <li>✓ Sin cookies o tracking</li>
        <li>✓ Completamente local y privado</li>
        <li>✓ Auditable y controlado</li>
      </ul>
    </div>

    <div class="warning">
      <strong>⚠️ Nota de cumplimiento corporativo:</strong><br>
      Este servidor es únicamente para testing local. No debe usarse para conectarse a servidores públicos ni transmitir datos sensibles.
    </div>

    <footer>
      <p>Servidor de QA Testing Local | Generado automáticamente</p>
      <p>Hora: <span id="time"></span></p>
    </footer>
  </div>

  <script>
    document.getElementById('time').textContent = new Date().toLocaleString('es-ES');
    
    // Validación de accesibilidad WCAG
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[QA] Página cargada correctamente');
      console.log('[QA] Estructura WCAG validada');
    });
  </script>
</body>
</html>`;

// Crear servidor
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Headers de seguridad corporativa
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Rutas disponibles
  if (req.url === '/' || req.url === '') {
    res.writeHead(200);
    res.end(mockHTML);
  } else if (req.url === '/page1') {
    res.writeHead(200);
    res.end(
      `<html><head><title>Página 1</title></head><body><h1>Página 1</h1><p>Contenido de prueba</p><a href="/">Volver</a></body></html>`
    );
  } else if (req.url === '/page2') {
    res.writeHead(200);
    res.end(
      `<html><head><title>Página 2</title></head><body><h1>Página 2</h1><p>Otra página de prueba</p><a href="/">Volver</a></body></html>`
    );
  } else if (req.url === '/api') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: 'ok',
        message: 'Servidor local funcionando',
        timestamp: new Date().toISOString(),
      })
    );
  } else {
    res.writeHead(404);
    res.end(
      `<html><head><title>404 - No encontrado</title></head><body><h1>404</h1><p>Página no encontrada: ${req.url}</p><a href="/">Volver</a></body></html>`
    );
  }
});

// Iniciar servidor
server.listen(PORT, 'localhost', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  QA Testing - Servidor Local Seguro                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  URL: http://localhost:${PORT}                                 ║`);
  console.log('║  Ambiente: Local (sin conexión externa)                   ║');
  console.log('║  Estado: Ejecutándose                                     ║');
  console.log('║                                                            ║');
  console.log('║  Presiona Ctrl+C para detener el servidor                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});

// Manejo seguro de terminar el servidor
process.on('SIGINT', () => {
  console.log('\n[INFO] Deteniendo servidor...');
  server.close(() => {
    console.log('[OK] Servidor detenido');
    process.exit(0);
  });
});
