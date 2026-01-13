# GitHub Secrets Configuration

This document describes the required GitHub Secrets for CI/CD pipeline deployment.

## Setup Instructions

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the values below

## Required Secrets

### 1. Railway Deployment

**Name**: `RAILWAY_TOKEN`

- **Description**: Authentication token for Railway deployments
- **Where to get it**:
  1. Go to https://railway.app
  2. Click your profile → Account Settings
  3. Copy API Token
- **Value**: `railway_<your-token>`

### 2. Vercel Deployment

**Name**: `VERCEL_TOKEN`

- **Description**: Authentication token for Vercel deployments
- **Where to get it**:
  1. Go to https://vercel.com/account/tokens
  2. Click "Create" → "Create Token"
  3. Copy the token
- **Value**: `vercel_<your-token>`

**Name**: `VERCEL_ORG_ID`

- **Description**: Vercel organization ID
- **Where to get it**:
  1. Go to https://vercel.com/dashboard
  2. Click your organization
  3. Go to Settings → General
  4. Copy Organization ID
- **Value**: `your-org-id`

**Name**: `VERCEL_PROJECT_ID`

- **Description**: Vercel project ID for the HAIDA frontend
- **Where to get it**:
  1. Go to your project in Vercel
  2. Go to Settings → General
  3. Copy Project ID
- **Value**: `your-project-id`

### 3. Notifications

**Name**: `SLACK_WEBHOOK`

- **Description**: Slack webhook URL for deployment notifications
- **Where to get it**:
  1. Go to https://api.slack.com/apps
  2. Create or select your app
  3. Go to "Incoming Webhooks"
  4. Click "Add New Webhook to Workspace"
  5. Select channel (e.g., #deployments)
  6. Copy the Webhook URL
- **Value**: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

### 4. Container Registry

**Note**: GitHub Actions automatically provides `GITHUB_TOKEN`, no configuration needed.

The workflow uses GitHub Container Registry (ghcr.io) with automatic authentication.

## Optional Secrets

### Sentry Monitoring

**Name**: `SENTRY_DSN`

- **Description**: Sentry error tracking DSN
- **Where to get it**:
  1. Go to https://sentry.io
  2. Create a project
  3. Copy DSN from Settings
- **Value**: `https://hola@stayarta.com/123456`

### Logtail Logging

**Name**: `LOGTAIL_TOKEN`

- **Description**: Logtail centralized logging token
- **Where to get it**:
  1. Go to https://betterstack.com
  2. Create a log source
  3. Copy token
- **Value**: `your-logtail-token`

## Environment-Specific Secrets

### Production Database

For production deployments, also configure on Railway:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

### Production API Keys

- `CHANGEDETECTION_API_KEY`: API key from changedetection.io
- `GITHUB_TOKEN`: GitHub token for API access (if needed)

## Testing Secrets

For running tests locally with secrets:

```bash
# Create .env.secrets file (never commit!)
echo "RAILWAY_TOKEN=your-token" > .env.secrets
echo "VERCEL_TOKEN=your-token" >> .env.secrets

# Load in shell
export $(cat .env.secrets | xargs)

# Run workflow locally with act
act push -s RAILWAY_TOKEN="your-token" -s VERCEL_TOKEN="your-token"
```

## Security Best Practices

1. **Rotate tokens regularly** - Set reminders to rotate every 3 months
2. **Use least privilege** - Each token should only have needed permissions
3. **Monitor access** - Check GitHub audit logs for secret access
4. **Never log secrets** - Ensure workflow logs don't expose secrets
5. **Use environment protection** - Require approvals for production secrets
6. **Store locally securely** - Use credential managers for local .env files

## Verifying Secrets

To check if secrets are properly configured without seeing their values:

```bash
# GitHub CLI
gh secret list

# Or in GitHub UI
Settings → Secrets and variables → Actions
```

## Troubleshooting

### Secret not found in workflow

- Check secret name matches exactly (case-sensitive)
- Verify secret is in the correct repository (not organization)
- For organization secrets, check Actions settings allow usage

### Deployment fails with auth error

- Verify token hasn't expired
- Check token has necessary permissions
- Try regenerating the token

### Workflow can't access secret

- Ensure workflow file syntax is correct: `${{ secrets.SECRET_NAME }}`
- Check secret is not masked in logs
- Verify branch protection rules don't block secret access

## Reference

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Railway Tokens](https://docs.railway.app/guides/public-api)
- [Vercel Tokens](https://vercel.com/docs/projects/environment-variables-and-secrets)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
