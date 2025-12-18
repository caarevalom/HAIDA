# 📱 HAIDA - Mobile Deployment Checklist
**Fecha**: 2025-12-17
**Objetivo**: Verificar disponibilidad del backend para iOS y Android

---

## 🎯 Deployment del Backend

### Paso 1: Deploy a Vercel (MANUAL)

Ejecuta desde PowerShell en el directorio raíz del proyecto:

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
npx vercel --prod --yes
```

Si no estás autenticado, primero ejecuta:
```powershell
npx vercel login
```

---

## 📋 Checklist de Verificación Mobile

### 1. ✅ Backend Disponible

```bash
# Health Check
curl -i https://haida-backend.vercel.app/health

# Debe retornar:
HTTP/2 200
content-type: application/json
{"status":"healthy","timestamp":"2025-12-17..."}
```

### 2. ✅ CORS Configurado para Mobile

**Archivo**: `app/core/cors.py`

Verificar que CORS permite:
- ✅ Orígenes desde mobile apps
- ✅ Métodos HTTP necesarios (GET, POST, PUT, DELETE, OPTIONS)
- ✅ Headers de autenticación
- ✅ Credentials si es necesario

**Configuración Requerida**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O específicos para producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
```

### 3. ✅ HTTPS/SSL Habilitado

Vercel proporciona SSL automático:
```bash
curl -I https://haida-backend.vercel.app/health
# Debe mostrar: HTTP/2 200 (no HTTP/1.1)
```

### 4. ✅ Response Headers para Mobile

Verificar headers en la respuesta:
```bash
curl -i https://haida-backend.vercel.app/health

# Headers críticos para mobile:
✅ Content-Type: application/json
✅ Access-Control-Allow-Origin: *
✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
✅ Access-Control-Allow-Headers: *
✅ Strict-Transport-Security: max-age=...
```

---

## 🍎 iOS Compatibility Check

### User-Agent Testing

```bash
# Simular request desde iOS
curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
  https://haida-backend.vercel.app/health
```

### iOS Specific Headers

```bash
# Verificar que acepta requests desde apps iOS nativas
curl -H "User-Agent: HAIDA-iOS/2.0.0" \
     -H "X-Platform: iOS" \
     -H "X-Device: iPhone" \
     https://haida-backend.vercel.app/health
```

### App Transport Security (ATS)

**Requisitos iOS**:
- ✅ HTTPS obligatorio (Vercel lo proporciona)
- ✅ TLS 1.2 o superior
- ✅ Forward secrecy ciphers
- ✅ SHA-256 certificates

**Verificación**:
```bash
openssl s_client -connect haida-backend.vercel.app:443 -tls1_2
```

### WKWebView Compatibility

Si usas WebView en la app iOS:
```javascript
// Configuración en Swift
let config = WKWebViewConfiguration()
config.allowsInlineMediaPlayback = true
config.mediaTypesRequiringUserActionForPlayback = []
```

---

## 🤖 Android Compatibility Check

### User-Agent Testing

```bash
# Simular request desde Android
curl -H "User-Agent: Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" \
  https://haida-backend.vercel.app/health
```

### Android Specific Headers

```bash
# Verificar que acepta requests desde apps Android nativas
curl -H "User-Agent: HAIDA-Android/2.0.0" \
     -H "X-Platform: Android" \
     -H "X-Device: Pixel7" \
     https://haida-backend.vercel.app/health
```

### Network Security Config

**Requisitos Android (API 28+)**:
- ✅ HTTPS obligatorio por defecto
- ✅ No HTTP cleartext traffic
- ✅ Certificate pinning opcional

**Configuración en AndroidManifest.xml**:
```xml
<application
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config">
</application>
```

**network_security_config.xml**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config>
        <domain includeSubdomains="true">haida-backend.vercel.app</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>
```

---

## 🔐 API Authentication para Mobile

### 1. JWT Token Flow

```bash
# 1. Login desde mobile
curl -X POST https://haida-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: HAIDA-Mobile/2.0.0" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Response:
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### 2. Authenticated Requests

```bash
# 2. Usar token en requests subsecuentes
curl -H "Authorization: Bearer eyJhbGci..." \
  https://haida-backend.vercel.app/api/protected-endpoint
```

### 3. Token Refresh

```bash
# 3. Refresh token antes de expiración
curl -X POST https://haida-backend.vercel.app/auth/refresh \
  -H "Authorization: Bearer eyJhbGci..."
```

---

## 📊 Performance Testing para Mobile

### Latency Tests

```bash
# iOS (simulado desde WiFi)
time curl -w "\nTime: %{time_total}s\n" https://haida-backend.vercel.app/health

# Android (simulado desde 4G)
time curl -w "\nTime: %{time_total}s\n" https://haida-backend.vercel.app/health
```

**Métricas Objetivo**:
- ✅ WiFi: < 200ms
- ✅ 4G: < 500ms
- ✅ 3G: < 1000ms

### Payload Size

```bash
# Verificar tamaño de respuestas
curl -w "Size: %{size_download} bytes\n" -o /dev/null https://haida-backend.vercel.app/status
```

**Objetivo**: Responses < 100KB para mobile

### Compression

```bash
# Verificar que Vercel comprime responses
curl -H "Accept-Encoding: gzip, deflate, br" -I https://haida-backend.vercel.app/health
# Debe incluir: Content-Encoding: gzip (o br)
```

---

## 🧪 Tests Automatizados para Mobile

### Appium Setup (Opcional)

```bash
# Instalar Appium
npm install -g appium

# Drivers para iOS y Android
appium driver install xcuitest
appium driver install uiautomator2
```

### Test Script Example

```javascript
// tests/mobile/app-connectivity.spec.js
const axios = require('axios');

describe('HAIDA Mobile API Connectivity', () => {
  const API_URL = 'https://haida-backend.vercel.app';

  it('should connect from iOS device', async () => {
    const response = await axios.get(`${API_URL}/health`, {
      headers: {
        'User-Agent': 'HAIDA-iOS/2.0.0',
        'X-Platform': 'iOS'
      }
    });
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });

  it('should connect from Android device', async () => {
    const response = await axios.get(`${API_URL}/health`, {
      headers: {
        'User-Agent': 'HAIDA-Android/2.0.0',
        'X-Platform': 'Android'
      }
    });
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });

  it('should handle authentication flow', async () => {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    expect(loginResponse.data.access_token).toBeDefined();

    // Authenticated request
    const token = loginResponse.data.access_token;
    const protectedResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(protectedResponse.status).toBe(200);
  });
});
```

---

## 🔍 Debugging Mobile Issues

### Common Issues

#### 1. CORS Errors en Mobile WebView
**Síntoma**: Requests fallan en WebView pero funcionan en browser desktop
**Solución**: Verificar CORS headers en backend

```python
# app/core/cors.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O whitelist específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 2. SSL Certificate Errors
**Síntoma**: "SSL certificate error" en app nativa
**Solución**: Verificar que Vercel SSL está activo
```bash
curl -vvv https://haida-backend.vercel.app/health 2>&1 | grep -i ssl
```

#### 3. Network Timeout
**Síntoma**: Requests timeout en mobile pero no en desktop
**Solución**:
- Aumentar timeout en app mobile (default: 30s → 60s)
- Optimizar backend response time
- Implementar retry logic

#### 4. JSON Parsing Errors
**Síntoma**: "Failed to parse JSON" en mobile
**Solución**: Verificar Content-Type header
```bash
curl -i https://haida-backend.vercel.app/health | grep -i content-type
# Debe ser: Content-Type: application/json
```

---

## 📱 Frontend Mobile Configuration

### iOS App (Swift)

```swift
// NetworkManager.swift
class NetworkManager {
    static let baseURL = "https://haida-backend.vercel.app"

    func healthCheck() async throws -> HealthResponse {
        let url = URL(string: "\(NetworkManager.baseURL)/health")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("HAIDA-iOS/2.0.0", forHTTPHeaderField: "User-Agent")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }

        return try JSONDecoder().decode(HealthResponse.self, from: data)
    }
}
```

### Android App (Kotlin)

```kotlin
// ApiService.kt
object ApiService {
    private const val BASE_URL = "https://haida-backend.vercel.app"

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("User-Agent", "HAIDA-Android/2.0.0")
                .addHeader("Content-Type", "application/json")
                .build()
            chain.proceed(request)
        }
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val api: HaidaApi = retrofit.create(HaidaApi::class.java)
}

interface HaidaApi {
    @GET("/health")
    suspend fun healthCheck(): HealthResponse

    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): TokenResponse
}
```

### React Native App

```javascript
// api.js
import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL = 'https://haida-backend.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `HAIDA-${Platform.OS}/2.0.0`,
    'X-Platform': Platform.OS,
  },
});

// Interceptor para autenticación
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const healthCheck = () => api.get('/health');
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getCurrentUser = () => api.get('/auth/me');
```

---

## ✅ Deployment Verification Checklist

Una vez desplegado el backend, verificar:

### Backend Production
- [ ] ✅ `curl https://haida-backend.vercel.app/health` → 200 OK
- [ ] ✅ `curl https://haida-backend.vercel.app/status` → 200 OK
- [ ] ✅ `curl https://haida-backend.vercel.app/version` → 200 OK
- [ ] ✅ HTTPS activo (SSL certificate válido)
- [ ] ✅ CORS configurado correctamente

### iOS Compatibility
- [ ] ✅ Request con User-Agent iOS → 200 OK
- [ ] ✅ TLS 1.2+ activo
- [ ] ✅ Response time < 500ms
- [ ] ✅ JSON parsing funciona

### Android Compatibility
- [ ] ✅ Request con User-Agent Android → 200 OK
- [ ] ✅ HTTPS enforcement
- [ ] ✅ Response time < 500ms
- [ ] ✅ JSON parsing funciona

### Authentication Flow
- [ ] ✅ Login endpoint funciona
- [ ] ✅ Token JWT se genera correctamente
- [ ] ✅ Endpoints protegidos validan token
- [ ] ✅ Token refresh funciona

### Performance
- [ ] ✅ Response time < 200ms (WiFi)
- [ ] ✅ Response time < 500ms (4G)
- [ ] ✅ Gzip compression activo
- [ ] ✅ Response sizes < 100KB

---

## 🚀 Quick Test Commands

Después de deployar, ejecuta estos comandos para verificación rápida:

```bash
# 1. Health Check
curl https://haida-backend.vercel.app/health

# 2. iOS Request Simulation
curl -H "User-Agent: HAIDA-iOS/2.0.0" https://haida-backend.vercel.app/health

# 3. Android Request Simulation
curl -H "User-Agent: HAIDA-Android/2.0.0" https://haida-backend.vercel.app/health

# 4. Auth Test
curl -X POST https://haida-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 5. CORS Test
curl -H "Origin: capacitor://localhost" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://haida-backend.vercel.app/auth/login

# 6. Performance Test
time curl -w "\n%{time_total}s\n" https://haida-backend.vercel.app/health
```

---

## 📊 Expected Results

### Successful Deployment Output:

```
✅ Health Check: {"status":"healthy","timestamp":"2025-12-17..."}
✅ iOS Test: HTTP/2 200 OK
✅ Android Test: HTTP/2 200 OK
✅ Auth Test: {"access_token":"eyJ...","token_type":"bearer"}
✅ CORS Test: Access-Control-Allow-Origin: *
✅ Performance: ~150ms average
```

---

**Próximo Paso**: Ejecuta el deploy y luego verifica con estos tests!

```bash
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
npx vercel --prod --yes
```
