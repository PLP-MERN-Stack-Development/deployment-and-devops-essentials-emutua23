# 🔄 Rollback Procedures & Disaster Recovery

## Quick Reference

### Emergency Rollback Commands
```bash
# Backend (Railway)
railway rollback $(railway status | grep "Success" | head -n 1 | awk '{print $1}')

# Frontend (Git revert)
git revert HEAD && git push origin main
```

---

## Table of Contents
1. [When to Rollback](#when-to-rollback)
2. [Pre-Rollback Checklist](#pre-rollback-checklist)
3. [Backend Rollback Procedures](#backend-rollback-procedures)
4. [Frontend Rollback Procedures](#frontend-rollback-procedures)
5. [Database Rollback](#database-rollback)
6. [Post-Rollback Verification](#post-rollback-verification)
7. [Incident Documentation](#incident-documentation)

---

## When to Rollback

### Critical Issues (Immediate Rollback Required)
- ❌ Application completely down (5xx errors)
- ❌ Data corruption detected
- ❌ Security vulnerability exploited
- ❌ Major feature completely broken
- ❌ High error rate (>10% of requests failing)

### Major Issues (Rollback within 30 minutes)
- ⚠️ Performance degradation (>2x slower)
- ⚠️ Memory leaks detected
- ⚠️ Partial feature failures
- ⚠️ Authentication issues

### Minor Issues (Fix forward or scheduled rollback)
- ℹ️ UI glitches
- ℹ️ Minor bugs
- ℹ️ Performance issues <20%

---

## Pre-Rollback Checklist

Before executing rollback:

```markdown
- [ ] Confirm the issue is not transient (check 5-10 minutes of logs)
- [ ] Identify last known good deployment
- [ ] Notify team/stakeholders
- [ ] Document current error state (screenshots, logs)
- [ ] Check if data migrations were run
- [ ] Backup current state if possible
- [ ] Verify rollback target is stable
```

---

## Backend Rollback Procedures

### Method 1: Railway Dashboard (Easiest)

**Time**: ~2 minutes

**Steps**:
1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click **Deployments** tab
4. Identify last successful deployment (green checkmark)
5. Click **⋮** (three dots) next to that deployment
6. Click **Redeploy**
7. Wait for deployment to complete (~2 min)
8. Verify health check

**Visual Guide**:
```
Railway Dashboard → Project → Deployments → Select Good Deployment → Redeploy
```

### Method 2: Railway CLI (Fastest)

**Time**: ~30 seconds

**Prerequisites**:
```bash
npm install -g @railway/cli
railway login
```

**Steps**:
```bash
# 1. Check deployment status
railway status

# Output:
# ID       STATUS    CREATED              COMMIT
# abc123   Success   2 hours ago          Fix: bug xyz
# def456   Failed    1 hour ago           Add: new feature
# ghi789   Success   3 hours ago          Update: dependencies

# 2. Rollback to last successful deployment
railway rollback abc123

# 3. Verify
curl https://your-app.up.railway.app/health
```

**One-liner for emergency**:
```bash
railway rollback $(railway status | grep "Success" | head -n 1 | awk '{print $1}')
```

### Method 3: Git Revert + Auto-Deploy

**Time**: ~3-5 minutes

**Steps**:
```bash
# 1. Identify bad commit
git log --oneline -n 10

# 2. Revert the commit (creates new commit that undoes changes)
git revert <commit-hash>

# 3. Push to trigger auto-deploy
git push origin main

# 4. Monitor deployment
gh run watch
# or
railway logs --tail

# 5. Verify
curl https://your-app.up.railway.app/health
```

**Revert multiple commits**:
```bash
# Revert last 3 commits
git revert HEAD~2..HEAD
git push origin main
```

### Method 4: Force Deploy Previous Version

**Time**: ~1 minute

**Steps**:
```bash
# 1. Find good commit
git log --oneline

# 2. Checkout that commit
git checkout <good-commit-hash>

# 3. Force deploy
railway up --detach

# 4. Return to main (optional)
git checkout main
```

---

## Frontend Rollback Procedures

### Method 1: Re-run Previous Workflow

**Time**: ~2-3 minutes

**Steps via GitHub UI**:
1. Go to repository → **Actions** tab
2. Find **"Deploy Frontend to GitHub Pages"** workflow
3. Locate last successful run (green checkmark)
4. Click on the run
5. Click **Re-run all jobs** button
6. Wait for completion
7. Clear browser cache and verify

**Steps via GitHub CLI**:
```bash
# 1. List recent runs
gh run list --workflow=deploy-frontend.yml --limit 10

# 2. Re-run successful deployment
gh run rerun <run-id>

# 3. Watch progress
gh run watch <run-id>

# 4. Verify
curl https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

### Method 2: Git Revert

**Time**: ~3-5 minutes

**Steps**:
```bash
# 1. Identify bad commit affecting client/
git log --oneline -- client/

# 2. Revert the commit
git revert <commit-hash>

# 3. Push to trigger auto-deploy
git push origin main

# 4. Monitor
gh run watch

# 5. Verify (wait 1-2 min for CDN propagation)
# Clear browser cache (Ctrl+Shift+R)
# Check: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

### Method 3: Deploy from Tag/Release

**Time**: ~5 minutes

**Steps**:
```bash
# 1. List tags
git tag -l

# 2. Checkout stable tag
git checkout v1.0.0

# 3. Create new branch
git checkout -b rollback-to-v1.0.0

# 4. Force push to main (use with caution!)
git push origin rollback-to-v1.0.0:main --force

# 5. Monitor deployment
gh run watch
```

**Safer alternative** (recommended):
```bash
# 1. Checkout tag
git checkout v1.0.0

# 2. Create new commit on main
git checkout main
git revert $(git rev-list v1.0.0..HEAD)
git push origin main
```

---

## Database Rollback

Currently, the app uses in-memory storage. For future database implementations:

### Redis Rollback
```bash
# 1. List backups
railway run redis-cli CONFIG GET dir

# 2. Restore from backup
railway run redis-cli --rdb /backups/dump.rdb

# 3. Verify
railway run redis-cli PING
```

### MongoDB Rollback
```bash
# 1. Stop application
railway service stop

# 2. Restore from backup
railway run mongorestore --drop /backups/backup_2024_11_15

# 3. Restart application
railway service start

# 4. Verify
curl https://your-app.up.railway.app/health
```

---

## Post-Rollback Verification

### Backend Verification Checklist
```bash
# 1. Health check
curl https://your-app.up.railway.app/health

# Expected: {"status":"healthy",...}

# 2. Metrics check
curl https://your-app.up.railway.app/metrics

# 3. Test WebSocket connection
# Open browser console on frontend
# Check for: "✅ Connected to server"

# 4. Monitor logs for 10 minutes
railway logs --tail

# 5. Check error rate in Sentry
# Should drop to <1% immediately
```

### Frontend Verification Checklist
```markdown
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Homepage loads correctly
- [ ] Can enter username and join chat
- [ ] Messages send and receive
- [ ] No console errors (F12 → Console)
- [ ] Assets loading correctly (images, sounds)
- [ ] Test in incognito window
- [ ] Test on mobile device
- [ ] Check multiple browsers (Chrome, Firefox, Safari)
```

### Load Testing After Rollback
```bash
# Install artillery
npm install -g artillery

# Create quick load test
cat > loadtest.yml << EOF
config:
  target: "https://your-app.up.railway.app"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/health"
EOF

# Run load test
artillery run loadtest.yml

# Check results: Should handle 10 req/sec without errors
```

---

## Incident Documentation

### Incident Report Template

After every rollback, document the incident:

```markdown
# Incident Report: [Date]

## Summary
- **Date/Time**: 2025-11-16 14:30 UTC
- **Duration**: 15 minutes
- **Severity**: Critical / Major / Minor
- **Affected Users**: ~50 active users

## Timeline
- 14:25 - Deployment started (commit: abc123)
- 14:27 - First error reports in Sentry
- 14:30 - Incident identified
- 14:32 - Rollback initiated
- 14:35 - Rollback completed
- 14:45 - Service verified stable

## Root Cause
[Describe what went wrong]
- Example: Uncaught exception in message handler
- Example: Missing environment variable
- Example: CORS misconfiguration

## Detection
- How was the issue discovered?
  - Monitoring alert
  - User report
  - Manual testing

## Resolution
- Method used: Railway dashboard rollback
- Rolled back to: deployment abc123 (commit: xyz789)
- Verification steps taken: [list]

## Prevention
What will we do to prevent this in the future?
- [ ] Add test coverage for X
- [ ] Add monitoring for Y
- [ ] Update deployment checklist
- [ ] Add pre-deployment validation

## Lessons Learned
1. [Lesson 1]
2. [Lesson 2]

## Action Items
- [ ] Fix root cause (assigned: @username, due: date)
- [ ] Add tests (assigned: @username, due: date)
- [ ] Update documentation (assigned: @username, due: date)
```

### Save Incident Reports
```bash
# Create incidents directory
mkdir -p docs/incidents

# Save report
cat > docs/incidents/2025-11-16-deployment-failure.md << EOF
[Paste template above]
EOF

# Commit to repository
git add docs/incidents/
git commit -m "docs: add incident report for 2025-11-16"
git push
```

---

## Rollback Decision Matrix

| Issue Severity | Detection Time | Response Time | Rollback Method | Post-Rollback |
|---------------|----------------|---------------|-----------------|---------------|
| **Critical** | <1 min | Immediate | Railway Dashboard (fastest) | Full verification + incident report |
| **Major** | <5 min | <30 min | Railway CLI or Git revert | Standard verification |
| **Minor** | <30 min | <2 hours | Git revert or fix forward | Quick check |

---

## Emergency Contacts

```yaml
On-Call Engineer: [Your Contact]
Backup: [Backup Contact]
Railway Support: https://railway.app/help
GitHub Support: https://support.github.com

Emergency Hotline: [If applicable]
Slack Channel: #incidents
```

---

## Rollback Drills

**Practice rollbacks quarterly**:

```bash
# 1. Deploy a test change
git checkout -b rollback-drill
echo "// Test change" >> server/server.js
git commit -am "test: rollback drill"
git push origin main

# 2. Wait for deployment

# 3. Practice rollback
railway rollback $(railway status | grep "Success" | head -n 2 | tail -n 1 | awk '{print $1}')

# 4. Time the process
# Target: <3 minutes from decision to verified

# 5. Document results
# Update procedures based on learnings
```

---

## Quick Reference Card

**Print and keep accessible**:

```
┌─────────────────────────────────────────────┐
│     EMERGENCY ROLLBACK PROCEDURES           │
├─────────────────────────────────────────────┤
│ BACKEND (Railway):                          │
│ 1. railway rollback <deployment-id>        │
│ 2. curl your-app.up.railway.app/health     │
│                                              │
│ FRONTEND (GitHub Pages):                    │
│ 1. git revert HEAD                          │
│ 2. git push origin main                     │
│ 3. gh run watch                             │
│                                              │
│ VERIFY:                                      │
│ - Check /health endpoint                    │
│ - Monitor logs for 10 min                   │
│ - Test core functionality                   │
│ - Document incident                         │
└─────────────────────────────────────────────┘
```

---

**Remember**: 
- Document everything
- Communicate with team
- Learn from incidents
- Practice regularly

**Last Updated**: November 16, 2025
