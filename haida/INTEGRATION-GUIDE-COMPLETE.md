# 🚀 HAIDA Change Detection Integration Guide

## 📋 Overview

This guide provides a comprehensive step-by-step process to implement the HAIDA Change Detection system, which monitors frontend UI changes and automatically triggers appropriate test suites.

**Architecture Summary:**
```
Frontend Changes → Changedetection.io → Webhook → HAIDA API → Test Routing → Playwright → Results
```

---

## 🎯 Phase 1: Environment Setup

### 1.1 Prerequisites

- **Docker & Docker Compose** installed
- **Node.js 18+** with npm
- **Git** for version control
- **Slack** workspace (optional, for notifications)

### 1.2 Clone Repository & Install Dependencies

```bash
# Navigate to HAIDA directory
cd ~/Documents/Proyectos/HAIDA/haida

# Install Node dependencies for API
cd haida-api
npm install

# Install Playwright browsers
npx playwright install

# Return to root
cd ..
```

### 1.3 Configure Environment Variables

```bash
# Copy example to actual .env
cp .env.example .env

# Edit with your configuration
# CRITICAL CHANGES:
# 1. SLACK_WEBHOOK - Get from https://api.slack.com/apps
# 2. DB_PASSWORD - Change from default
# 3. TEST_URL - Your application URL
# 4. CI token if using GitHub/Azure DevOps
```

---

## 🐳 Phase 2: Docker Deployment

### 2.1 Build and Start Services

```bash
# Navigate to change-detection directory
cd change-detection

# Build custom HAIDA API image
docker-compose build haida-api

# Start all services (background)
docker-compose up -d

# Verify all services are running
docker-compose ps

# Expected output:
# NAME                    STATUS              PORTS
# haida-changedetection   Up (healthy)        0.0.0.0:5000->5000/tcp
# haida-selenium          Up (healthy)        0.0.0.0:4444->4444/tcp
# haida-api               Up (healthy)        0.0.0.0:3001->3001/tcp
# haida-postgres          Up (healthy)        0.0.0.0:5432->5432/tcp
# haida-redis             Up                  0.0.0.0:6379->6379/tcp
# haida-allure            Up                  0.0.0.0:4040->4040/tcp
```

### 2.2 Verify Services

```bash
# Check HAIDA API health
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-15T10:30:45.123Z","uptime":45.234}

# Check Changedetection.io
curl http://localhost:5000/api/watches

# Check Selenium Hub
curl http://localhost:4444/wd/hub/status
```

### 2.3 View Service Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f haida-api
docker-compose logs -f haida-changedetection

# Exit logs (Ctrl+C)
```

---

## 📡 Phase 3: Configure Changedetection.io

### 3.1 Access Web UI

Open browser: `http://localhost:5000`

### 3.2 Add Monitoring Watches

**For Login Form:**
1. Click "Add Watch"
2. URL: `https://your-app.com/login`
3. Tag: `frontend-ui-login`
4. Fetch backend: `Selenium` (for JavaScript rendering)
5. Check interval: `300 seconds` (5 minutes)
6. Click "Save"

**Add Subfilters for Specific Elements:**

1. Click "Edit Watch" on the created watch
2. Add "Subfilter" for login button:
   - Element type: `XPath`
   - Value: `//button[@class='btn-submit']`
   - Name: `Login Button`
3. Add another for form labels:
   - Value: `//label[@for='email']|//label[@for='password']`
   - Name: `Form Labels`
4. Save changes

### 3.3 Configure Webhook Notifications

1. In watch settings, find "Notification URLs"
2. Add notification:
   - URL: `http://haida-api:3001/webhook/change-detected`
   - Method: `POST`
   - Format: `JSON`
3. Enable: ✓ Notify on change
4. Save

**Webhook Payload Example:**
```json
{
  "url": "https://your-app.com/login",
  "tag": "frontend-ui-login",
  "notification_type": "form 16 chars changed",
  "uuid": "abc123...",
  "title": "Login Form Monitor",
  "previous_md5": "abc123...",
  "current_md5": "def456..."
}
```

### 3.4 Test Webhook Manually

```bash
# From your terminal
curl -X POST http://localhost:3001/webhook/change-detected \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/login",
    "tag": "frontend-ui-login",
    "notification_type": "form_change",
    "previous_md5": "old_hash",
    "current_md5": "new_hash",
    "uuid": "test-123"
  }'

# Expected response:
# {"status":"accepted","message":"Change detection webhook accepted, tests queued","webhookId":"webhook-1705318245123",...}
```

---

## 🧪 Phase 4: Configure Test Profiles

### 4.1 Understand Test Profiles

Test profiles map change types to specific test suites:

| Change Type | Profile | Tests | Timeout |
|-------------|---------|-------|---------|
| Login form | form-validation | login-fields, error-handling, form-submission | 30s |
| Dashboard | widget-rendering | widget-load, data-display, responsive | 60s |
| Checkout | form-validation | form-validation, payment, confirmation | 45s |
| Navigation | navigation-flow | link-validity, menu, breadcrumb | 35s |
| Table | data-rendering | data-load, sorting, filtering, pagination | 50s |
| Modal | modal-interaction | modal-render, close-handlers, form | 30s |
| Button | interaction | click-handlers, state-change, loading | 25s |
| Generic | general-e2e | page-load, basic-functionality | 60s |

### 4.2 Create Test Profiles

```bash
# Create profiles directory
mkdir -p tests/profiles

# The system automatically selects profiles based on:
# 1. Tag matching (frontend-ui-LOGIN matches login profile)
# 2. URL path matching (/dashboard matches dashboard profile)
# 3. Change details analysis
```

### 4.3 Review Test Implementation

Test file: `tests/form-validation.spec.js`

Key test cases included:
- ✓ Page load time validation (< 3 seconds)
- ✓ Form field rendering
- ✓ Email validation
- ✓ Password validation
- ✓ Submit button state
- ✓ WCAG 2A accessibility (axe-core)
- ✓ Form submission handling
- ✓ Error message display
- ✓ Visual regression (screenshots)
- ✓ Rapid submission handling
- ✓ Form state preservation

---

## 📊 Phase 5: Test Execution & Monitoring

### 5.1 Manual Test Run

```bash
# From project root
npm test

# Run specific test file
npx playwright test tests/form-validation.spec.js

# Run with specific browser
npx playwright test --project=Google\ Chrome

# Generate HTML report
npx playwright show-report
```

### 5.2 Trigger via Webhook

Simulate a change detection by sending webhook:

```bash
# Terminal 1: Watch API logs
cd haida
docker-compose logs -f haida-api

# Terminal 2: Send webhook
curl -X POST http://localhost:3001/webhook/change-detected \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/login",
    "tag": "frontend-ui-login",
    "notification_type": "input_changed",
    "uuid": "manual-test"
  }'

# Terminal 1 should show:
# 🔔 Change Detection Webhook Received
# ✓ Selected Profile: form-validation
# 🚀 Launching tests...
# ✓ Test execution completed
```

### 5.3 View Test Results

**Via API:**
```bash
# Get all test executions
curl http://localhost:3001/results

# Get specific execution
curl http://localhost:3001/results/webhook-1705318245123

# Returns JSON with test results, duration, status
```

**Via Allure Reports:**
```bash
# Open browser to:
http://localhost:4040
```

**Via Slack:**
- Notifications sent to configured Slack channel
- Shows: ✅ PASSED / ❌ FAILED / ⚠️ ERROR
- Includes: URL, profile, status, webhook ID

### 5.4 Monitor Changedetection.io Status

```bash
# Check watches and their status
curl http://localhost:3001/changedetection/status

# Manually trigger check in Changedetection UI
# Go to http://localhost:5000
# Click watch → "Manually run now" button
```

---

## 🔧 Phase 6: Integration with CI/CD

### 6.1 GitHub Actions Integration

Create `.github/workflows/haida-tests.yml`:

```yaml
name: HAIDA Change Detection Tests

on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch:
  push:
    paths:
      - 'src/**'
      - 'tests/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      changedetection:
        image: ghcr.io/dgtlmoon/changedetection.io:latest
        ports:
          - 5000:5000
      
      haida-api:
        image: haida-api:latest
        ports:
          - 3001:3001
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm test
      
      - name: Upload results to Allure
        if: always()
        run: |
          curl -X POST http://localhost:4040/api/allure \
            -F "allure=@test-results/results.json"
      
      - name: Publish test report
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Playwright Report
          path: 'test-results/junit.xml'
          reporter: 'java-junit'
```

### 6.2 Scheduled Webhook Triggers

Create a scheduled job that polls changedetection.io:

```bash
# Add to crontab (every 5 minutes)
*/5 * * * * curl -X GET "http://localhost:3001/changedetection/status" >> /var/log/haida-checks.log

# Or use GitHub Actions/Azure DevOps for scheduling
```

### 6.3 Azure DevOps Pipeline

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

schedules:
  - cron: "*/5 * * * *"
    displayName: Run HAIDA tests every 5 minutes
    branches:
      include:
        - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
  
  - script: npm ci
    displayName: 'Install dependencies'
  
  - script: npx playwright install --with-deps
    displayName: 'Install Playwright'
  
  - script: npm test
    displayName: 'Run tests'
    env:
      TEST_URL: $(TEST_URL)
      SLACK_WEBHOOK: $(SLACK_WEBHOOK)
  
  - task: PublishTestResults@2
    condition: succeededOrFailed()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: '**/junit.xml'
```

---

## 📈 Phase 7: Monitoring & Alerts

### 7.1 Enable Slack Notifications

```bash
# 1. Create Slack App
# https://api.slack.com/apps → Create New App → From scratch

# 2. Enable Incoming Webhooks
# Settings → Incoming Webhooks → Add New Webhook to Workspace

# 3. Copy webhook URL and set in .env
SLACK_WEBHOOK=https://hooks.slack.com/services/T0000/B0000/XXX

# 4. Test notification
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"HAIDA test notification working ✅"}'
```

### 7.2 Set Up Alerts

Notification events:
- ✅ Test passed
- ❌ Test failed
- ⚠️ Test flaky (pass & fail within 24h)
- 🚀 Change detected
- 📊 Daily summary

### 7.3 Dashboard & Metrics

Access via browser:
- **Allure Reports**: `http://localhost:4040`
- **Changedetection.io**: `http://localhost:5000`
- **API Health**: `http://localhost:3001/health`

Key metrics:
- Total executions
- Pass rate
- Average execution time
- Most frequently detected changes
- Flaky tests

---

## 🔍 Phase 8: Troubleshooting

### Issue: Webhook not received

```bash
# Check firewall/network
telnet localhost 3001

# Check HAIDA API logs
docker-compose logs haida-api

# Verify webhook configuration in Changedetection.io
# Go to http://localhost:5000 → Watch details → Notifications
```

### Issue: Tests not executing

```bash
# Check Playwright installation
npx playwright --version

# Check test configuration
cat playwright.config.js

# Run single test manually
npx playwright test tests/form-validation.spec.js --headed
```

### Issue: Changedetection.io not detecting changes

```bash
# Check Selenium Hub
curl http://localhost:4444/wd/hub/status

# Verify fetch backend setting
# Changedetection.io → Watch → Settings → Fetch Backend: Selenium

# Check website accessibility
curl -I https://your-app.com
```

### Issue: Database connection errors

```bash
# Check PostgreSQL
docker-compose logs postgres

# Verify connection string
docker exec haida-postgres psql -U haida_user -d haida_results -c "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up postgres -d
```

---

## 📚 Additional Resources

- **Changedetection.io Docs**: https://changedetection.io/
- **Playwright Docs**: https://playwright.dev/
- **axe Accessibility**: https://www.deque.com/axe/
- **Allure Reports**: https://docs.qameta.io/allure/

---

## ✅ Validation Checklist

Before deploying to production:

- [ ] All Docker services healthy (`docker-compose ps`)
- [ ] Webhook endpoint responding (`curl http://localhost:3001/health`)
- [ ] Changedetection.io watching URLs (http://localhost:5000)
- [ ] Manual webhook test successful
- [ ] Playwright tests running locally (`npm test`)
- [ ] Slack notifications working
- [ ] Database populated with test results
- [ ] Allure reports generating
- [ ] CI/CD pipeline configured
- [ ] Team trained on system usage
- [ ] Monitoring/alerts set up

---

## 🚀 Next Steps

1. **Deploy to staging environment** - Test full pipeline
2. **Create dashboards** - Monitor key metrics
3. **Train team** - Document procedures
4. **Set up backup** - Database + results backup
5. **Scale if needed** - Add more workers/services
6. **Optimize performance** - Monitor and improve execution times

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs -f [service-name]`
2. Review error messages in test results
3. Consult Changedetection.io documentation
4. Review Playwright test failures
5. Check CI/CD pipeline logs

---

**Generated:** 2024
**Last Updated:** 2024-01-15
**System:** HAIDA Change Detection v1.0
**Status:** Production Ready ✅
