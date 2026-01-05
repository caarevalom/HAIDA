# HAIDA API Testing Guide

Complete guide para testear todos los endpoints de HAIDA después del deployment.

## Prerequisites

```bash
# Instalar herramientas necesarias
pip install httpx
npm install -g newman
```

## 1. Health & Status Endpoints

### 1.1 API Health
```bash
curl -X GET http://localhost:8000/health
# Expected: 200 OK
# Response: {"status": "healthy", "service": "HAIDA API", "version": "2.0.0"}
```

### 1.2 System Status
```bash
curl -X GET http://localhost:8000/api/system/status
# Expected: 200 OK
```

---

## 2. Authentication Endpoints

### 2.1 Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "full_name": "Test User",
    "role": "viewer"
  }'

# Expected: 200 OK
# Response includes: access_token, user object
```

### 2.2 Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Expected: 200 OK
# Response includes: access_token, user object
# Save token for next requests: export TOKEN=<access_token>
```

### 2.3 Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Response: user object with id, email, name, role
```

### 2.4 Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Response: new access_token
```

### 2.5 Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Response: {"message": "Logged out successfully"}
```

---

## 3. Microsoft Entra Integration

### 3.1 Get Entra Login URL
```bash
curl -X GET http://localhost:8000/api/entra/login

# Expected: 200 OK if configured
# Response: {"auth_url": "...", "redirect_uri": "...", "configured": true}
```

### 3.2 Check Entra Status
```bash
curl -X GET http://localhost:8000/api/entra/status

# Expected: 200 OK
# Response: {
#   "configured": true,
#   "authority": "https://login.microsoftonline.com/...",
#   "redirect_uri": "...",
#   "client_id_set": true,
#   "tenant_id_set": true
# }
```

### 3.3 Entra Callback (Web Flow)
```bash
# After user authenticates with Microsoft:
curl -X POST http://localhost:8000/api/entra/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "<auth-code-from-microsoft>",
    "state": "<state-token>"
  }'

# Expected: 200 OK
# Response: {access_token, user, microsoft, redirect_to}
```

---

## 4. Perplexity AI Integration

### 4.1 Check Perplexity Status
```bash
curl -X GET http://localhost:8000/api/perplexity/status

# Expected: 200 OK
# Response: {
#   "configured": true/false,
#   "api_key_set": true/false,
#   "model": "llama-2-70b-chat",
#   "base_url": "https://api.perplexity.ai",
#   "max_tokens": 2048
# }
```

### 4.2 List Chat Providers
```bash
curl -X GET http://localhost:8000/api/perplexity/providers \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Response: [
#   {
#     "provider": "perplexity",
#     "is_active": true,
#     "config": {...},
#     "has_api_key": true,
#     "usage_limits": {}
#   }
# ]
```

### 4.3 Create Chat Thread
```bash
curl -X POST http://localhost:8000/api/perplexity/threads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Conversation"
  }'

# Expected: 200 OK
# Response: {
#   "id": "uuid",
#   "title": "Test Conversation",
#   "provider": "perplexity",
#   "message_count": 0,
#   "created_at": "2026-01-05T...",
#   "updated_at": "2026-01-05T..."
# }

# Save thread ID: export THREAD_ID=<id>
```

### 4.4 Send Message to Perplexity
```bash
curl -X POST http://localhost:8000/api/perplexity/threads/$THREAD_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What is the capital of France?",
    "provider": "perplexity"
  }'

# Expected: 200 OK
# Response: {
#   "id": "uuid",
#   "thread_id": "uuid",
#   "role": "assistant",
#   "content": "The capital of France is Paris...",
#   "provider": "perplexity",
#   "created_at": "2026-01-05T..."
# }
```

### 4.5 List Thread Messages
```bash
curl -X GET http://localhost:8000/api/perplexity/threads/$THREAD_ID/messages \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Response: [
#   {
#     "id": "uuid",
#     "thread_id": "uuid",
#     "role": "user",
#     "content": "What is the capital of France?",
#     "provider": "perplexity",
#     "created_at": "2026-01-05T..."
#   },
#   {
#     "id": "uuid",
#     "thread_id": "uuid",
#     "role": "assistant",
#     "content": "The capital of France is Paris...",
#     "provider": "perplexity",
#     "created_at": "2026-01-05T..."
#   }
# ]
```

### 4.6 Update Perplexity Provider Config
```bash
curl -X PUT http://localhost:8000/api/perplexity/providers/perplexity \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": true,
    "api_key": "ppl-xxxx-your-api-key",
    "model": "llama-2-70b-chat",
    "max_tokens": 2048
  }'

# Expected: 200 OK
```

---

## 5. Telegram Bot Integration

### 5.1 Check Telegram Status
```bash
curl -X GET http://localhost:8000/api/telegram/status

# Expected: 200 OK
# Response: {
#   "configured": true/false,
#   "bot_token_set": true/false,
#   "chat_id_set": true/false,
#   "webhook_configured": true/false
# }
```

### 5.2 Get Telegram Webhook Info
```bash
curl -X GET http://localhost:8000/api/telegram/webhook/info

# Expected: 200 OK
# Response: {
#   "url": "https://haida.example.com/api/telegram/webhook",
#   "has_custom_certificate": false,
#   "pending_update_count": 0,
#   "last_error_date": null,
#   "max_connections": 40
# }
```

### 5.3 Set Telegram Webhook
```bash
curl -X POST http://localhost:8000/api/telegram/webhook/set \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://haida-one.vercel.app/api/telegram/webhook"
  }'

# Expected: 200 OK
# Response: {
#   "status": "set",
#   "webhook_url": "https://haida-one.vercel.app/api/telegram/webhook",
#   "webhook_info": {...}
# }
```

### 5.4 Send Telegram Message
```bash
curl -X POST http://localhost:8000/api/telegram/send \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "123456789",
    "text": "Hello from HAIDA! 🤖",
    "parse_mode": "Markdown"
  }'

# Expected: 200 OK
# Response: {"status": "sent", "chat_id": "123456789"}
```

### 5.5 Send Notification Event
```bash
curl -X POST http://localhost:8000/api/telegram/notifications/tenant123/test_completed \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "HAIDA",
    "tests_run": 50,
    "tests_passed": 48,
    "tests_failed": 2,
    "duration": "125"
  }'

# Expected: 200 OK
# Response: {"status": "sent", "event_type": "test_completed"}
```

### 5.6 Get Telegram Messages
```bash
curl -X GET "http://localhost:8000/api/telegram/messages/123456789?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Response: {
#   "chat_id": "123456789",
#   "count": 5,
#   "messages": [...]
# }
```

---

## 6. Database Operations (Admin Only)

### 6.1 Get Database Statistics
```bash
curl -X GET http://localhost:8000/api/admin/db/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 200 OK
# Response: database statistics
```

---

## 7. Integration Tests (Postman Collection)

```bash
# Importar colección en Postman
newman run tests/api/collection.json \
  --environment tests/api/environment.json \
  --reporters cli,json \
  --reporter-json-export report.json

# Ver reporte
cat report.json | jq '.run.stats'
```

---

## 8. Load Testing

```bash
# Instalar k6
# Visit: https://k6.io/docs/getting-started/installation

# Run load test
k6 run tests/perf/perplexity-load-test.js

# Con specific options
k6 run -u 10 -d 30s tests/perf/perplexity-load-test.js
```

---

## 9. Performance Benchmarks

### Expected Response Times (Production)
| Endpoint | Expected | Actual | Status |
|---|---|---|---|
| `/health` | <50ms | - | ✓ |
| `/auth/login` | <200ms | - | ✓ |
| `/auth/me` | <100ms | - | ✓ |
| `/perplexity/status` | <100ms | - | ✓ |
| `/perplexity/threads` (GET) | <200ms | - | ✓ |
| `/perplexity/threads/{id}/messages` (POST) | <5s | - | ✓ |
| `/telegram/status` | <100ms | - | ✓ |
| `/entra/status` | <100ms | - | ✓ |

---

## 10. Error Handling Tests

### 10.1 Invalid Token
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
# Response: {"error": "http_error", "message": "Invalid token"}
```

### 10.2 Missing API Key
```bash
# Without PERPLEXITY_API_KEY configured:
curl -X POST http://localhost:8000/api/perplexity/threads/123/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "test"}'

# Expected: 503 Service Unavailable
# Response: {"error": "http_error", "message": "Perplexity API key not configured"}
```

### 10.3 Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..31}; do
  curl -X POST http://localhost:8000/api/perplexity/threads/123/messages \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content": "test"}' &
done

# Request 31+ should return 429 Too Many Requests
```

---

## 11. Monitoring & Logs

```bash
# Ver logs en Vercel
vercel logs --follow

# Filtrar por servicio
vercel logs --follow | grep perplexity
vercel logs --follow | grep telegram

# Exportar logs
vercel logs > haida-logs.txt
```

---

## 12. Cleanup & Teardown

```bash
# Limpiar datos de prueba
curl -X DELETE http://localhost:8000/api/admin/test-data \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 200 OK
# Response: {"deleted_records": 50}
```

---

**Last Updated:** 2026-01-05
**Version:** 2.1.0
