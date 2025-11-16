# 🚀 Complete DevOps & CI/CD Guide

## Table of Contents
1. [Overview](#overview)
2. [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
3. [Environment Setup](#environment-setup)
4. [Deployment Procedures](#deployment-procedures)
5. [Monitoring & Observability](#monitoring--observability)
6. [Rollback Strategies](#rollback-strategies)
7. [Maintenance Plan](#maintenance-plan)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This project implements a comprehensive DevOps infrastructure for a MERN stack real-time chat application with:
- **Automated CI/CD** using GitHub Actions
- **Backend deployment** on Railway
- **Frontend deployment** on GitHub Pages
- **Comprehensive monitoring** with health checks, metrics, and error tracking
- **Performance monitoring** on both client and server
- **Automated testing** with Jest (backend) and Vitest (frontend)

### Architecture Diagram
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   GitHub    │────────▶│GitHub Actions│────────▶│  Railway    │
│ Repository  │         │   CI/CD      │         │  (Backend)  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │GitHub Pages  │
                        │ (Frontend)   │
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Monitoring  │
                        │   & Alerts   │
                        └──────────────┘
```

---

## CI/CD Pipeline Architecture

### 1. Continuous Integration (CI)

**Workflow File**: `.github/workflows/ci.yml`

#### Triggers
- Push to `main`, `develop`, `staging` branches
- Pull requests to `main`, `develop`

#### Jobs

##### Backend CI
- **Matrix Testing**: Node.js 18.x and 20.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies (`npm ci`)
  4. Run linter
  5. Run tests
  6. Generate coverage reports
  7. Upload to Codecov

##### Frontend CI
- **Matrix Testing**: Node.js 18.x and 20.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Run linter
  5. Run tests
  6. Build application
  7. Generate coverage
  8. Upload build artifacts

##### Code Quality
- ESLint for both frontend and backend
- SonarCloud analysis (optional)
- Code coverage tracking

##### Security Audit
- `npm audit` for dependency vulnerabilities
- Snyk security scanning (optional)
- Severity threshold: moderate

### 2. Continuous Deployment (CD)

#### Backend Deployment (`deploy-backend.yml`)

**Triggers**:
- Push to `main` branch (when `server/**` changes)
- Manual workflow dispatch

**Environments**:
- **Production**: Deploys from `main` branch
- **Staging**: Deploys from `develop` branch

**Steps**:
1. Run all tests
2. Deploy to Railway using Railway CLI
3. Wait for deployment (30s)
4. Health check validation (10 retries)
5. Notify deployment status (Slack)
6. Tag successful deployment

**Required Secrets**:
- `RAILWAY_TOKEN`: Railway API token
- `RAILWAY_SERVICE_ID`: Production service ID
- `RAILWAY_STAGING_SERVICE_ID`: Staging service ID
- `RAILWAY_URL`: Production backend URL
- `RAILWAY_STAGING_URL`: Staging backend URL
- `SLACK_WEBHOOK`: Slack webhook for notifications

#### Frontend Deployment (`deploy-frontend.yml`)

**Triggers**:
- Push to `main` branch (when `client/**` changes)
- Manual workflow dispatch

**Steps**:
1. Build phase:
   - Install dependencies
   - Run linter
   - Run tests
   - Build production bundle
   - Upload artifact
2. Deploy phase:
   - Deploy to GitHub Pages
   - Wait for propagation (20s)
   - Health check
   - Notify status
3. Performance phase:
   - Run Lighthouse CI
   - Check Core Web Vitals

**Required Secrets**:
- `VITE_SERVER_URL`: Backend API URL
- `SLACK_WEBHOOK`: Slack webhook (optional)

---

## Environment Setup

### Required GitHub Secrets

Navigate to: **Settings → Secrets and variables → Actions**

#### Backend Secrets
```
RAILWAY_TOKEN=<your-railway-api-token>
RAILWAY_SERVICE_ID=<production-service-id>
RAILWAY_STAGING_SERVICE_ID=<staging-service-id>
RAILWAY_URL=https://your-app.up.railway.app
RAILWAY_STAGING_URL=https://your-app-staging.up.railway.app
```

#### Frontend Secrets
```
VITE_SERVER_URL=https://your-app.up.railway.app
VITE_SENTRY_DSN=<your-sentry-dsn>  # Optional
```

#### Monitoring Secrets (Optional)
```
SENTRY_DSN=<backend-sentry-dsn>
SENTRY_TOKEN=<sentry-auth-token>
SONAR_TOKEN=<sonarcloud-token>
SNYK_TOKEN=<snyk-api-token>
SLACK_WEBHOOK=<slack-webhook-url>
```

### Railway Environment Variables

Set in Railway dashboard for each service:

#### Production
```bash
NODE_ENV=production
PORT=3001
CLIENT_URL=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
SENTRY_DSN=<backend-sentry-dsn>  # Optional
```

#### Staging
```bash
NODE_ENV=staging
PORT=3001
CLIENT_URL=https://staging-YOUR_USERNAME.github.io/YOUR_REPO_NAME
SENTRY_DSN=<backend-sentry-dsn>
```

### Local Development

#### Backend
```bash
cd server
cp .env.example .env
# Edit .env with your local settings
npm install
npm run dev
```

#### Frontend
```bash
cd client
cp .env.example .env
# Edit .env:
# VITE_SERVER_URL=http://localhost:3001
npm install
npm run dev
```

---

## Deployment Procedures

### Initial Deployment

#### 1. Setup Railway Backend
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd server
railway init

# Deploy
railway up

# Generate domain
railway domain
```

#### 2. Enable GitHub Pages
1. Go to repository **Settings → Pages**
2. Source: **GitHub Actions**
3. Save

#### 3. Configure Secrets
Add all required secrets as documented above

#### 4. Push to Deploy
```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

### Regular Deployments

#### Automatic Deployment
- **Backend**: Automatically deploys when changes are pushed to `server/` on `main`
- **Frontend**: Automatically deploys when changes are pushed to `client/` on `main`

#### Manual Deployment
```bash
# Backend
railway up --service <service-name>

# Frontend (triggers GitHub Actions)
gh workflow run deploy-frontend.yml
```

### Staging Deployments

```bash
# Create staging branch
git checkout -b staging

# Push to staging
git push origin staging

# Backend staging deploys automatically from 'develop' branch
git checkout develop
git merge your-feature-branch
git push origin develop
```

---

## Monitoring & Observability

### Health Check Endpoints

#### Backend Endpoints

##### `/health` - Detailed Health Status
```bash
curl https://your-app.up.railway.app/health
```
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T10:30:00Z",
  "uptime": {
    "seconds": 86400,
    "formatted": "1d 0h"
  },
  "users": {
    "total": 15,
    "connected": 15
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "v20.10.0",
    "memory": {
      "used": 45,
      "total": 128,
      "rss": 67,
      "unit": "MB"
    },
    "cpu": {
      "cores": 2,
      "loadAverage": [0.5, 0.4, 0.3]
    }
  },
  "metrics": {
    "requests": 1543,
    "errors": 5,
    "socketConnections": 156,
    "messagesProcessed": 8234,
    "errorRate": "0.32%"
  }
}
```

##### `/metrics` - Raw Metrics
```bash
curl https://your-app.up.railway.app/metrics
```

##### `/api/performance` - Performance Data
```bash
curl https://your-app.up.railway.app/api/performance
```

##### `/ready` - Kubernetes-style Readiness
```bash
curl https://your-app.up.railway.app/ready
```

##### `/alive` - Kubernetes-style Liveness
```bash
curl https://your-app.up.railway.app/alive
```

### Sentry Error Tracking

#### Setup
1. Create account at [sentry.io](https://sentry.io)
2. Create two projects: `chat-app-backend` and `chat-app-frontend`
3. Get DSN for each project
4. Add to environment variables

#### Backend Integration
```javascript
// Automatic error capture
// Configured in sentry-config.js
// All unhandled errors are sent to Sentry
```

#### Frontend Integration
```javascript
// Automatic error capture with Error Boundary
import { SentryErrorBoundary } from './sentry-client';

<SentryErrorBoundary fallback={<ErrorFallback />}>
  <App />
</SentryErrorBoundary>
```

### Performance Monitoring

#### Frontend Performance Metrics
- **First Contentful Paint (FCP)**
- **Time to Interactive (TTI)**
- **Cumulative Layout Shift (CLS)**
- **Total Blocking Time (TBT)**
- **Page Load Time**

Automatically sent to backend `/api/performance/client` endpoint

#### Backend Performance
- Request latency
- Response times
- Memory usage
- CPU usage
- Socket connection count

### Uptime Monitoring

#### Recommended Services

##### 1. UptimeRobot (Free)
```
Monitor URLs:
- https://your-app.up.railway.app/health
- https://YOUR_USERNAME.github.io/YOUR_REPO_NAME

Interval: 5 minutes
Alert: Email, Slack, SMS
```

##### 2. Better Uptime
```
Monitor:
- Backend health endpoint
- Frontend availability
- SSL certificate expiry

Alerts: Slack integration
```

##### 3. Railway Built-in Monitoring
- View logs in Railway dashboard
- Monitor deployment status
- Resource usage graphs

---

## Rollback Strategies

### 1. Railway Backend Rollback

#### Option A: Railway Dashboard
1. Go to Railway dashboard
2. Select your project
3. Click **Deployments** tab
4. Find previous working deployment
5. Click **⋮** → **Redeploy**

#### Option B: Railway CLI
```bash
# List deployments
railway status

# Rollback to specific deployment
railway rollback <deployment-id>
```

#### Option C: Git Revert
```bash
# Revert last commit
git revert HEAD
git push origin main
# Triggers automatic redeployment

# Revert to specific commit
git revert <commit-hash>
git push origin main
```

### 2. Frontend GitHub Pages Rollback

#### Option A: Git Revert
```bash
# Revert client changes
git revert <commit-hash>
git push origin main
# Triggers automatic rebuild and deploy
```

#### Option B: Re-run Previous Workflow
1. Go to **Actions** tab
2. Find previous successful **Deploy Frontend** workflow
3. Click **Re-run all jobs**

#### Option C: Manual Deploy from Tag
```bash
# Create tag for good deployment
git tag -a v1.0.0 -m "Stable version"
git push origin v1.0.0

# Rollback to tag
git checkout v1.0.0
git push -f origin main
```

### 3. Emergency Rollback Procedure

#### If Backend is Down
```bash
# 1. Immediate rollback via Railway
railway rollback $(railway status | grep "Success" | head -n 1 | awk '{print $1}')

# 2. Or disable auto-deploy and deploy manually
railway service disable-auto-deploy
railway up --detach

# 3. Verify health
curl https://your-app.up.railway.app/health
```

#### If Frontend is Down
```bash
# 1. Check build logs
gh run list --workflow=deploy-frontend.yml

# 2. Revert and force push
git revert HEAD
git push origin main

# 3. Monitor deployment
gh run watch
```

### 4. Database Backup & Restore

Since this app uses in-memory storage, consider implementing:

```bash
# For future Redis/MongoDB integration
# Backup
railway run redis-cli BGSAVE
railway run mongodump --out /backups

# Restore
railway run redis-cli --rdb /backups/dump.rdb
railway run mongorestore /backups
```

---

## Maintenance Plan

### Daily Tasks (Automated)
- ✅ Health check monitoring (every 5 min)
- ✅ Error tracking via Sentry
- ✅ Performance metrics collection
- ✅ Automated security scans

### Weekly Tasks
- 📊 Review error rates in Sentry
- 📈 Check performance trends
- 🔍 Review deployment logs
- 💾 Check disk usage (Railway dashboard)

### Monthly Tasks
- 🔄 **Update Dependencies**
  ```bash
  # Backend
  cd server
  npm outdated
  npm update
  npm audit fix
  
  # Frontend
  cd client
  npm outdated
  npm update
  npm audit fix
  
  # Test and deploy
  git commit -am "chore: update dependencies"
  git push origin main
  ```

- 🔐 **Security Audit**
  ```bash
  npm audit
  npm audit fix --force  # If safe
  ```

- 📊 **Performance Review**
  - Review Lighthouse CI reports
  - Check Core Web Vitals
  - Optimize slow endpoints

### Quarterly Tasks
- 🚀 **Node.js Version Updates**
  ```bash
  # Update in package.json engines
  "engines": {
    "node": ">=20.0.0"
  }
  
  # Update GitHub Actions
  # Edit .github/workflows/*.yml
  node-version: ['20.x', '22.x']
  ```

- 📝 **Documentation Updates**
  - Update this guide
  - Review and update README
  - Update deployment guides

- 🎯 **Capacity Planning**
  - Review Railway usage
  - Check if need to upgrade plan
  - Review user growth trends

### Scheduled Downtime Windows
- **Preferred**: Saturday 2:00-4:00 AM UTC
- **Notification**: 48 hours in advance
- **Procedure**:
  1. Announce in app (if possible)
  2. Deploy updates
  3. Run health checks
  4. Monitor for 1 hour
  5. Announce completion

---

## Troubleshooting

### Common Issues

#### Issue: CI Tests Failing
**Symptoms**: GitHub Actions workflow fails at test step

**Solutions**:
```bash
# Run tests locally first
cd server && npm test
cd client && npm test

# Check test logs in GitHub Actions
gh run view <run-id> --log

# Fix and push
git commit -am "fix: resolve test failures"
git push
```

#### Issue: Railway Deployment Fails
**Symptoms**: Railway build fails or crashes immediately

**Solutions**:
```bash
# Check Railway logs
railway logs

# Common fixes:
# 1. Missing environment variables
railway variables

# 2. Memory issues
# Upgrade Railway plan or optimize code

# 3. Build failures
# Check package.json scripts
# Ensure all dependencies are in dependencies, not devDependencies
```

#### Issue: Health Check Failing
**Symptoms**: `/health` returns 503 or times out

**Solutions**:
```bash
# 1. Check if server is running
railway logs --tail

# 2. Check environment variables
railway variables

# 3. Test locally
cd server
npm start
curl http://localhost:3001/health

# 4. Check CORS settings
# Verify CLIENT_URL is correct
```

#### Issue: Frontend 404 on GitHub Pages
**Symptoms**: GitHub Pages shows 404 error

**Solutions**:
```bash
# 1. Check GitHub Pages settings
# Settings → Pages → Source should be "GitHub Actions"

# 2. Check workflow status
gh run list --workflow=deploy-frontend.yml

# 3. Verify base path in vite.config.js
# Should be: base: './'

# 4. Check repository name in URLs
# Must match: https://USERNAME.github.io/REPO_NAME
```

#### Issue: CORS Errors
**Symptoms**: Browser console shows CORS errors

**Solutions**:
```bash
# 1. Verify CLIENT_URL in Railway matches GitHub Pages URL exactly
railway variables | grep CLIENT_URL

# 2. Update Railway variable
railway variables set CLIENT_URL=https://username.github.io/repo-name

# 3. Redeploy
railway up
```

#### Issue: High Memory Usage
**Symptoms**: Railway crashes with OOM error

**Solutions**:
```javascript
// 1. Monitor memory
console.log(process.memoryUsage());

// 2. Clear intervals/listeners
// Ensure proper cleanup on disconnect

// 3. Implement memory limits
node --max-old-space-size=512 server.js

// 4. Add to Procfile
web: node --max-old-space-size=512 server.js
```

### Debugging Commands

```bash
# Check all workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch active run
gh run watch

# Re-run failed workflow
gh run rerun <run-id>

# Railway status
railway status

# Railway logs (real-time)
railway logs --tail

# Railway environment
railway variables

# Test health endpoints
curl -v https://your-app.up.railway.app/health

# Test with specific headers
curl -H "Origin: https://username.github.io" \
     -v https://your-app.up.railway.app/health
```

### Emergency Contacts

```
DevOps Lead: [Your Contact]
Railway Support: https://railway.app/help
GitHub Support: https://support.github.com
Sentry Support: https://sentry.io/support
```

---

## Continuous Improvement

### Metrics to Track
1. **Deployment Frequency**: Daily/Weekly
2. **Lead Time**: Time from commit to production
3. **Mean Time to Recovery (MTTR)**: Time to restore service
4. **Change Failure Rate**: % of deployments causing failures

### Future Enhancements
- [ ] Add database backup automation
- [ ] Implement blue-green deployments
- [ ] Add load testing in CI
- [ ] Set up automated performance regression tests
- [ ] Implement feature flags
- [ ] Add A/B testing infrastructure
- [ ] Set up log aggregation (e.g., Datadog, Logstash)
- [ ] Implement automated canary deployments

---

## Conclusion

This DevOps setup provides:
- ✅ **Automated CI/CD** with comprehensive testing
- ✅ **Multiple environments** (development, staging, production)
- ✅ **Robust monitoring** with health checks and error tracking
- ✅ **Quick rollback** strategies for disaster recovery
- ✅ **Maintenance procedures** for long-term reliability

For questions or issues, refer to the troubleshooting section or contact the DevOps team.

**Last Updated**: November 16, 2025
