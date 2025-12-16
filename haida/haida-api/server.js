// HAIDA Change Detection API Server
// Webhook receiver for Changedetection.io triggers

const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const CONFIG = {
  changedetectionUrl: process.env.CHANGEDETECTION_URL || 'http://changedetection:5000',
  slackWebhook: process.env.SLACK_WEBHOOK || '',
  testResultsDir: './test-results',
  reportsDir: './reports',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(CONFIG.testResultsDir, { recursive: true });
    await fs.mkdir(CONFIG.reportsDir, { recursive: true });
    console.log('✓ Directories ensured');
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: CONFIG.nodeEnv
  });
});

// ============================================
// DETERMINE TEST PROFILE BASED ON CHANGE
// ============================================
function determineTestProfile(tag, url, changeDetails) {
  const normalizedTag = tag.toLowerCase();
  const urlLower = url.toLowerCase();

  // Map change type to test profile
  const profileMap = {
    'login': {
      profile: 'form-validation',
      tests: ['login-fields', 'error-handling', 'form-submission'],
      timeout: 30000,
      priority: 'high'
    },
    'dashboard': {
      profile: 'widget-rendering',
      tests: ['widget-load', 'data-display', 'responsive-check'],
      timeout: 60000,
      priority: 'high'
    },
    'checkout': {
      profile: 'form-validation',
      tests: ['form-validation', 'payment-processing', 'order-confirmation'],
      timeout: 45000,
      priority: 'critical'
    },
    'navigation': {
      profile: 'navigation-flow',
      tests: ['link-validity', 'menu-functionality', 'breadcrumb-navigation'],
      timeout: 35000,
      priority: 'medium'
    },
    'button': {
      profile: 'interaction',
      tests: ['click-handlers', 'state-change', 'loading-states'],
      timeout: 25000,
      priority: 'medium'
    },
    'form': {
      profile: 'form-validation',
      tests: ['field-validation', 'error-messages', 'form-submission'],
      timeout: 40000,
      priority: 'high'
    },
    'table': {
      profile: 'data-rendering',
      tests: ['data-load', 'sorting', 'filtering', 'pagination'],
      timeout: 50000,
      priority: 'high'
    },
    'modal': {
      profile: 'modal-interaction',
      tests: ['modal-render', 'close-handlers', 'form-in-modal'],
      timeout: 30000,
      priority: 'medium'
    }
  };

  // Find best matching profile
  for (const [key, profile] of Object.entries(profileMap)) {
    if (normalizedTag.includes(key) || urlLower.includes(key)) {
      return profile;
    }
  }

  // Default fallback profile
  return {
    profile: 'general-e2e',
    tests: ['page-load', 'basic-functionality', 'accessibility'],
    timeout: 60000,
    priority: 'low'
  };
}

// ============================================
// WEBHOOK RECEIVER FROM CHANGEDETECTION.IO
// ============================================
app.post('/webhook/change-detected', async (req, res) => {
  const timestamp = new Date().toISOString();
  const webhookId = `webhook-${Date.now()}`;

  console.log(`\n[${ timestamp}] 🔔 Change Detection Webhook Received`);
  console.log(`Webhook ID: ${webhookId}`);

  try {
    const {
      url,
      tag,
      notification_type,
      previous_md5,
      current_md5,
      uuid,
      title,
      notification_format,
      change_text
    } = req.body;

    // Validate required fields
    if (!url || !tag) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: url, tag',
        webhookId
      });
    }

    console.log(`📍 URL: ${url}`);
    console.log(`🏷️  Tag: ${tag}`);
    console.log(`📝 Notification Type: ${notification_type}`);

    // Determine which tests to run
    const testProfile = determineTestProfile(tag, url, req.body);
    console.log(`✓ Selected Profile: ${testProfile.profile}`);
    console.log(`✓ Tests to Execute: ${testProfile.tests.join(', ')}`);
    console.log(`✓ Priority: ${testProfile.priority}`);

    // Store webhook event
    const webhookEvent = {
      webhookId,
      timestamp,
      url,
      tag,
      notificationType: notification_type,
      previousMd5: previous_md5,
      currentMd5: current_md5,
      selectedProfile: testProfile.profile,
      selectedTests: testProfile.tests,
      status: 'received'
    };

    await fs.writeFile(
      path.join(CONFIG.testResultsDir, `${webhookId}-webhook.json`),
      JSON.stringify(webhookEvent, null, 2)
    );

    // Launch tests asynchronously (don't wait for completion)
    launchTests(webhookId, url, testProfile, webhookEvent);

    // Respond immediately to webhook
    res.status(202).json({
      status: 'accepted',
      message: 'Change detection webhook accepted, tests queued',
      webhookId,
      selectedProfile: testProfile.profile,
      selectedTests: testProfile.tests,
      expectedCompletionTime: `${Math.round(testProfile.timeout / 1000)}s`
    });

  } catch (error) {
    console.error(`❌ Error processing webhook: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message,
      webhookId
    });
  }
});

// ============================================
// LAUNCH TEST EXECUTION
// ============================================
async function launchTests(webhookId, url, testProfile, webhookEvent) {
  const testStartTime = Date.now();

  try {
    console.log(`\n🚀 Launching tests for webhook ${webhookId}...`);

    // Build test command
    const testArgs = [
      'test',
      `--project=${testProfile.profile}`,
      `--grep=${testProfile.tests.join('|')}`,
      `--timeout=${testProfile.timeout}`,
      `--reporter=json`,
      `--output=${path.join(CONFIG.testResultsDir, `${webhookId}-results.json`)}`
    ];

    // Set environment variables for test execution
    const testEnv = {
      ...process.env,
      TEST_URL: url,
      TEST_PROFILE: testProfile.profile,
      WEBHOOK_ID: webhookId,
      CHANGE_DETECTED_AT: webhookEvent.timestamp
    };

    // Spawn Playwright test process
    const testProcess = spawn('npx', ['playwright', ...testArgs], {
      env: testEnv,
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[TEST] ${data.toString().trim()}`);
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`[TEST ERROR] ${data.toString().trim()}`);
    });

    testProcess.on('close', async (code) => {
      const testDuration = Date.now() - testStartTime;
      const testPassed = code === 0;

      console.log(`\n✓ Test execution completed in ${testDuration}ms`);

      // Parse results
      const testResults = {
        webhookId,
        url,
        profile: testProfile.profile,
        tests: testProfile.tests,
        timestamp: new Date().toISOString(),
        duration: testDuration,
        exitCode: code,
        status: testPassed ? 'PASSED' : 'FAILED',
        stdout,
        stderr,
        changeDetection: webhookEvent
      };

      // Save results
      await fs.writeFile(
        path.join(CONFIG.testResultsDir, `${webhookId}-execution.json`),
        JSON.stringify(testResults, null, 2)
      );

      // Send notifications
      await notifyResults(testResults);

      console.log(`📊 Results saved to ${webhookId}-execution.json`);
    });

  } catch (error) {
    console.error(`❌ Error launching tests: ${error.message}`);

    // Notify of launch failure
    await notifyResults({
      webhookId,
      url,
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================
// NOTIFY TEST RESULTS
// ============================================
async function notifyResults(testResults) {
  const { webhookId, status, profile, url } = testResults;

  // Slack notification
  if (CONFIG.slackWebhook) {
    try {
      const color = status === 'PASSED' ? '#36a64f' : status === 'FAILED' ? '#d50200' : '#ff9800';
      const emoji = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';

      const payload = {
        text: `${emoji} HAIDA Test Results`,
        attachments: [
          {
            color,
            title: `${status} - ${profile}`,
            title_link: `http://localhost:3001/results/${webhookId}`,
            fields: [
              {
                title: 'URL',
                value: url,
                short: false
              },
              {
                title: 'Profile',
                value: profile,
                short: true
              },
              {
                title: 'Status',
                value: status,
                short: true
              },
              {
                title: 'Webhook ID',
                value: webhookId,
                short: false
              }
            ],
            footer: 'HAIDA Change Detection System',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      await axios.post(CONFIG.slackWebhook, payload);
      console.log('✓ Slack notification sent');
    } catch (error) {
      console.error('⚠️  Failed to send Slack notification:', error.message);
    }
  }
}

// ============================================
// GET TEST RESULTS
// ============================================
app.get('/results/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const resultsFile = path.join(CONFIG.testResultsDir, `${webhookId}-execution.json`);

    const data = await fs.readFile(resultsFile, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: 'Results not found',
      details: error.message
    });
  }
});

// ============================================
// LIST ALL TEST EXECUTIONS
// ============================================
app.get('/results', async (req, res) => {
  try {
    const files = await fs.readdir(CONFIG.testResultsDir);
    const executionFiles = files.filter(f => f.endsWith('-execution.json'));

    const results = [];
    for (const file of executionFiles) {
      const data = await fs.readFile(path.join(CONFIG.testResultsDir, file), 'utf-8');
      results.push(JSON.parse(data));
    }

    res.json({
      count: results.length,
      results: results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error reading results',
      details: error.message
    });
  }
});

// ============================================
// MONITOR CHANGEDETECTION.IO STATUS
// ============================================
app.get('/changedetection/status', async (req, res) => {
  try {
    const response = await axios.get(`${CONFIG.changedetectionUrl}/api/watches`);
    res.json(response.data);
  } catch (error) {
    res.status(502).json({
      status: 'error',
      message: 'Cannot reach Changedetection.io',
      details: error.message
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================
async function start() {
  try {
    await ensureDirectories();

    app.listen(PORT, () => {
      console.log(`\n✨ HAIDA API Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${CONFIG.nodeEnv}`);
      console.log(`Changedetection URL: ${CONFIG.changedetectionUrl}`);
      console.log(`Test Results Dir: ${CONFIG.testResultsDir}`);
      console.log(`\nEndpoints:`);
      console.log(`  GET  /health                    - Health check`);
      console.log(`  POST /webhook/change-detected   - Webhook receiver`);
      console.log(`  GET  /results/:webhookId        - Get test results`);
      console.log(`  GET  /results                   - List all executions`);
      console.log(`  GET  /changedetection/status    - Changedetection.io status\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
