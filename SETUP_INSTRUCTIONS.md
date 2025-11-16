# 🚀 Complete Setup Instructions

## Quick Setup (5 minutes)

This guide will help you deploy the chat application with full CI/CD from scratch.

---

## Prerequisites

✅ **Required Accounts** (All Free):
- GitHub account: [github.com/join](https://github.com/join)
- Railway account: [railway.app](https://railway.app) (sign in with GitHub)

✅ **Required Tools**:
- Git: [git-scm.com](https://git-scm.com/downloads)
- Node.js 18+: [nodejs.org](https://nodejs.org/)
- A text editor (VS Code recommended)

---

## Step 1: Clone or Fork Repository

```bash
# Option A: Fork on GitHub (recommended)
# Click "Fork" button on GitHub repository page

# Then clone your fork
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Option B: Clone directly
git clone <repository-url>
cd chat-app
```

---

## Step 2: Local Development Setup

### Backend Setup
```bash
cd server
npm install
cp .env.example .env

# Edit .env if needed (defaults are fine for local)
npm run dev
```

Server will start on http://localhost:3001

### Frontend Setup (new terminal)
```bash
cd client
npm install
cp .env.example .env

# Edit .env (should be):
# VITE_SERVER_URL=http://localhost:3001

npm run dev
```

Client will start on http://localhost:5173

### Test Locally
1. Open http://localhost:5173
2. Enter a username
3. Open in another browser/incognito window
4. Test sending messages between windows

---

## Step 3: Deploy Backend to Railway

### A. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway auto-detects it's a Node.js project

### B. Configure Railway

1. **Set Root Directory**:
   - Click on your service
   - Go to **Settings** → **Root Directory**
   - Set to: `server`
   - Click **Save**

2. **Add Environment Variables**:
   - Go to **Variables** tab
   - Click **"Add Variable"**
   - Add these:
   ```
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
   ```
   - Replace YOUR_USERNAME and YOUR_REPO_NAME with actual values
   - Click **Add** for each

3. **Generate Domain**:
   - Go to **Settings** tab
   - Under **Networking**, click **"Generate Domain"**
   - Copy the URL (e.g., `https://your-app.up.railway.app`)
   - **SAVE THIS URL** - you'll need it next!

4. **Wait for Deployment**:
   - Go to **Deployments** tab
   - Wait for green checkmark (~2-3 minutes)

5. **Test Backend**:
   ```bash
   curl https://your-app.up.railway.app/health
   ```
   Should return: `{"status":"healthy",...}`

### C. Get Railway Token (for CI/CD)

1. Go to [railway.app/account/tokens](https://railway.app/account/tokens)
2. Click **"Create Token"**
3. Name it: "GitHub Actions"
4. Copy the token
5. **SAVE THIS TOKEN** - can't see it again!

### D. Get Service ID

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
cd server
railway link

# Get service ID
railway service
```

Copy the service ID.

---

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

### Required Secrets

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `RAILWAY_TOKEN` | Your Railway API token | From Railway account tokens |
| `RAILWAY_SERVICE_ID` | Your service ID | From Railway CLI: `railway service` |
| `RAILWAY_URL` | Your Railway domain | From Railway dashboard networking |
| `VITE_SERVER_URL` | Same as RAILWAY_URL | Your Railway backend URL |

### Optional Secrets (for enhanced monitoring)

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `SENTRY_DSN` | Backend Sentry DSN | Error tracking (backend) |
| `VITE_SENTRY_DSN` | Frontend Sentry DSN | Error tracking (frontend) |
| `SLACK_WEBHOOK` | Slack webhook URL | Deployment notifications |
| `RAILWAY_STAGING_SERVICE_ID` | Staging service ID | Staging environment |

---

## Step 5: Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages**
2. Under **Source**, select: **"GitHub Actions"**
3. Click **Save**

---

## Step 6: Deploy!

```bash
# Make sure you're on main branch
git checkout main

# Push to trigger deployment
git add .
git commit -m "chore: setup CI/CD deployment"
git push origin main
```

---

## Step 7: Monitor Deployments

### Watch GitHub Actions
```bash
# In terminal
gh run watch

# Or go to: https://github.com/USER/REPO/actions
```

You should see two workflows running:
1. ✅ CI - Continuous Integration
2. ✅ CD - Deploy Backend to Railway
3. ✅ CD - Deploy Frontend to GitHub Pages

Wait for all to complete (~5 minutes).

---

## Step 8: Verify Deployment

### Backend Check
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": {...},
  "users": {...},
  "system": {...}
}
```

### Frontend Check

1. Go to: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`
2. Enter a username
3. You should see the chat interface
4. Open in another browser/incognito
5. Test messaging

---

## Step 9: Setup Monitoring (Optional but Recommended)

### A. Uptime Monitoring with UptimeRobot

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Click **"Add New Monitor"**
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Chat App Backend
   - **URL**: `https://your-app.up.railway.app/health`
   - **Monitoring Interval**: 5 minutes
5. Add email alerts
6. Repeat for frontend

### B. Error Tracking with Sentry

1. Go to [sentry.io](https://sentry.io)
2. Sign up (free tier available)
3. Create two projects:
   - `chat-app-backend` (Node.js)
   - `chat-app-frontend` (React)
4. Get DSN for each project
5. Add to GitHub Secrets (see Step 4)
6. Add to Railway environment variables:
   ```
   SENTRY_DSN=<your-backend-dsn>
   ```
7. Redeploy to enable Sentry

---

## Step 10: Test CI/CD Pipeline

### Test Automatic Deployment

```bash
# Make a small change
echo "// Test CI/CD" >> server/server.js

# Commit and push
git add .
git commit -m "test: verify CI/CD pipeline"
git push origin main

# Watch deployment
gh run watch

# Verify backend updated
curl https://your-app.up.railway.app/health
```

### Test Rollback

```bash
# Install Railway CLI if not already
npm install -g @railway/cli

# View deployments
railway status

# Rollback to previous deployment if needed
railway rollback <previous-deployment-id>
```

---

## Troubleshooting

### Backend Deployment Fails

**Check Railway logs**:
```bash
railway logs
```

**Common issues**:
- Missing environment variables → Add in Railway dashboard
- Wrong root directory → Set to `server` in Railway settings
- Port issues → Ensure `PORT=3001` in Railway variables

### Frontend 404 Error

**Solutions**:
1. Verify GitHub Pages is enabled with source "GitHub Actions"
2. Wait 2-3 minutes for DNS propagation
3. Check workflow completed successfully
4. Verify repository name matches URL

### CORS Errors

**Fix**:
1. Check `CLIENT_URL` in Railway matches GitHub Pages URL **exactly**
2. No trailing slash
3. Redeploy backend after changing

### Can't See Deployment in Railway

**Fix**:
1. Ensure you pushed code with `.github/workflows/deploy-backend.yml`
2. Check GitHub Actions secrets are set
3. Verify `RAILWAY_TOKEN` and `RAILWAY_SERVICE_ID` are correct

---

## Success Checklist

✅ **After completing setup, verify**:
- [ ] Backend health check returns 200
- [ ] Frontend loads successfully
- [ ] Can send messages between users
- [ ] GitHub Actions workflows are green
- [ ] Railway deployment is successful
- [ ] Monitoring is configured (optional)
- [ ] All secrets are set in GitHub
- [ ] Documentation is bookmarked

---

## Next Steps

1. **Read Documentation**:
   - [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md) - Complete DevOps guide
   - [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) - How to rollback
   - [MAINTENANCE_PLAN.md](./MAINTENANCE_PLAN.md) - Maintenance schedule

2. **Setup Staging Environment** (Optional):
   - Create another Railway service for staging
   - Add `RAILWAY_STAGING_SERVICE_ID` to GitHub secrets
   - Push to `develop` branch to deploy to staging

3. **Customize**:
   - Add your branding
   - Configure Slack notifications
   - Set up custom domain (Railway + GitHub Pages support this)

---

## Quick Reference

### Important URLs

```markdown
## Production
- Frontend: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
- Backend: https://your-app.up.railway.app
- Health Check: https://your-app.up.railway.app/health
- Metrics: https://your-app.up.railway.app/metrics

## Dashboards
- Railway: https://railway.app/project/YOUR_PROJECT
- GitHub Actions: https://github.com/USER/REPO/actions
- Sentry (if configured): https://sentry.io
```

### Useful Commands

```bash
# Deploy backend manually
railway up

# View Railway logs
railway logs --tail

# Check GitHub Actions status
gh run list

# Watch deployment
gh run watch

# Rollback backend
railway rollback <deployment-id>

# Test health
curl https://your-app.up.railway.app/health
```

---

## Getting Help

**Issues?**
1. Check [Troubleshooting](#troubleshooting) section
2. Review [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md)
3. Check Railway logs: `railway logs`
4. Check GitHub Actions logs
5. Open an issue on GitHub

**Resources**:
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- GitHub Actions: [docs.github.com/actions](https://docs.github.com/actions)
- Socket.io: [socket.io/docs](https://socket.io/docs)

---

## Time Estimates

- **Basic setup (local + Railway)**: 15-20 minutes
- **Complete setup (with CI/CD)**: 30-40 minutes
- **With monitoring setup**: 50-60 minutes

---

🎉 **Congratulations!** Your chat application is now deployed with full CI/CD!

**Last Updated**: November 16, 2025
