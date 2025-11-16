# ✅ Deployment Checklist

Use this checklist to ensure successful deployment of the chat application with full CI/CD.

---

## Pre-Deployment Checklist

### 1. Prerequisites ✓
- [ ] GitHub account created
- [ ] Railway account created (logged in with GitHub)
- [ ] Git installed locally
- [ ] Node.js 18+ installed locally
- [ ] Repository forked/cloned

### 2. Local Testing ✓
- [ ] Backend runs locally (`cd server && npm run dev`)
- [ ] Frontend runs locally (`cd client && npm run dev`)
- [ ] Can send messages between two browser windows
- [ ] No console errors in browser
- [ ] All tests pass (`npm test` in both server and client)

### 3. Code Review ✓
- [ ] All workflows exist in `.github/workflows/`
- [ ] Environment files exist (`.env.example`)
- [ ] Monitoring code present (`server/monitoring.js`)
- [ ] Tests configured (`jest.config.js`, `vitest.config.js`)
- [ ] Documentation complete (all *.md files)

---

## Railway Backend Setup

### 4. Railway Project Creation ✓
- [ ] Created new Railway project
- [ ] Connected GitHub repository
- [ ] Railway detected Node.js project
- [ ] Set root directory to `server`
- [ ] Generated domain/URL

### 5. Railway Configuration ✓
Environment variables set:
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `CLIENT_URL=https://USERNAME.github.io/REPO_NAME`
- [ ] (Optional) `SENTRY_DSN=<backend-sentry-dsn>`

### 6. Railway Tokens ✓
- [ ] Generated Railway API token
- [ ] Copied service ID (`railway service`)
- [ ] Saved both securely

### 7. Railway Deployment Test ✓
- [ ] Initial deployment successful
- [ ] Green checkmark in Railway dashboard
- [ ] Health check responds: `curl <railway-url>/health`
- [ ] Returns valid JSON with status "healthy"

---

## GitHub Configuration

### 8. GitHub Secrets ✓
Navigate to: Settings → Secrets and variables → Actions

Required secrets added:
- [ ] `RAILWAY_TOKEN` - Railway API token
- [ ] `RAILWAY_SERVICE_ID` - Production service ID
- [ ] `RAILWAY_URL` - Railway backend URL
- [ ] `VITE_SERVER_URL` - Same as RAILWAY_URL

Optional secrets added:
- [ ] `SENTRY_DSN` - Backend Sentry DSN
- [ ] `VITE_SENTRY_DSN` - Frontend Sentry DSN
- [ ] `SLACK_WEBHOOK` - Slack notification webhook
- [ ] `RAILWAY_STAGING_SERVICE_ID` - Staging service ID

### 9. GitHub Pages Setup ✓
- [ ] Settings → Pages opened
- [ ] Source set to: **GitHub Actions** (not "Deploy from a branch")
- [ ] Saved

### 10. Workflows Check ✓
- [ ] `.github/workflows/ci.yml` exists
- [ ] `.github/workflows/deploy-backend.yml` exists
- [ ] `.github/workflows/deploy-frontend.yml` exists
- [ ] All YAML syntax valid (no errors)

---

## Initial Deployment

### 11. Push to Deploy ✓
```bash
git add .
git commit -m "feat: complete DevOps CI/CD setup"
git push origin main
```

- [ ] Pushed to main branch
- [ ] GitHub Actions triggered

### 12. Monitor CI/CD ✓
Check GitHub Actions tab:

**CI Workflow**:
- [ ] Backend CI job passed (tests, lint, build)
- [ ] Frontend CI job passed (tests, lint, build)
- [ ] Code quality checks passed
- [ ] Security audit completed

**Backend Deployment**:
- [ ] Deployment initiated
- [ ] Deployed to Railway
- [ ] Health check passed
- [ ] Deployment tagged

**Frontend Deployment**:
- [ ] Build completed
- [ ] Deployed to GitHub Pages
- [ ] Lighthouse CI ran
- [ ] No errors

### 13. Verify Deployments ✓

**Backend**:
```bash
curl https://your-app.up.railway.app/health
```
- [ ] Returns 200 OK
- [ ] JSON contains "status": "healthy"
- [ ] Shows uptime and system info

**Frontend**:
- [ ] Navigate to `https://USERNAME.github.io/REPO_NAME`
- [ ] Page loads without errors
- [ ] Can enter username
- [ ] Can join chat room
- [ ] No 404 errors
- [ ] Assets load correctly (CSS, JS, images)

### 14. End-to-End Test ✓
- [ ] Open frontend in browser
- [ ] Enter username (e.g., "User1")
- [ ] Join chat
- [ ] Open frontend in incognito/another browser
- [ ] Enter different username (e.g., "User2")
- [ ] Send message from User1
- [ ] Message appears for User2
- [ ] Send message from User2
- [ ] Message appears for User1
- [ ] Check browser console - no errors

---

## Monitoring Setup (Optional but Recommended)

### 15. Sentry Setup ✓
- [ ] Created Sentry account at sentry.io
- [ ] Created backend project
- [ ] Created frontend project
- [ ] Added DSNs to GitHub Secrets
- [ ] Added backend DSN to Railway variables
- [ ] Redeployed backend
- [ ] Test error tracking (trigger an error intentionally)
- [ ] Verify error appears in Sentry dashboard

### 16. Uptime Monitoring ✓
- [ ] Created UptimeRobot account
- [ ] Added monitor for backend health endpoint
- [ ] Set interval to 5 minutes
- [ ] Added alert emails
- [ ] (Optional) Added monitor for frontend
- [ ] Test alert by temporarily breaking something

### 17. Slack Notifications (Optional) ✓
- [ ] Created Slack workspace
- [ ] Created #deployments channel
- [ ] Generated incoming webhook
- [ ] Added webhook to GitHub Secrets
- [ ] Test by making a deployment

---

## Testing & Validation

### 18. Test CI/CD Pipeline ✓
Make a test change:
```bash
echo "// Test CI/CD" >> server/server.js
git add .
git commit -m "test: CI/CD pipeline"
git push origin main
```

- [ ] CI workflow runs
- [ ] All tests pass
- [ ] Backend deploys automatically
- [ ] Health check passes
- [ ] No downtime during deployment

### 19. Test Rollback ✓
```bash
# View deployments
railway status

# Rollback to previous
railway rollback <previous-deployment-id>
```

- [ ] Rollback successful
- [ ] Health check passes
- [ ] Application still working

### 20. Load Testing (Optional) ✓
```bash
# Simple load test with curl
for i in {1..100}; do
  curl -s https://your-app.up.railway.app/health > /dev/null &
done
wait
```

- [ ] All requests succeed
- [ ] Response time acceptable (<500ms)
- [ ] No errors in Railway logs

---

## Documentation & Handoff

### 21. Documentation Review ✓
- [ ] `README.md` updated with project info
- [ ] `README_DEVOPS.md` reviewed
- [ ] `SETUP_INSTRUCTIONS.md` accurate
- [ ] `DEVOPS_GUIDE.md` complete
- [ ] `ROLLBACK_PROCEDURES.md` bookmarked
- [ ] `MAINTENANCE_PLAN.md` understood

### 22. Team Handoff ✓
- [ ] Shared Railway project access with team
- [ ] Shared Sentry project access
- [ ] Documented credentials in team password manager
- [ ] Briefed team on rollback procedures
- [ ] Scheduled first maintenance session

### 23. Monitoring Dashboards ✓
Bookmarked:
- [ ] Railway dashboard
- [ ] GitHub Actions
- [ ] Sentry dashboard (if setup)
- [ ] UptimeRobot dashboard (if setup)
- [ ] Backend health endpoint
- [ ] Frontend URL

---

## Post-Deployment

### 24. First 24 Hours ✓
- [ ] Monitor error rates in Sentry
- [ ] Check Railway resource usage
- [ ] Review GitHub Actions success rate
- [ ] Verify uptime monitoring working
- [ ] Check for any user reports

### 25. First Week ✓
- [ ] Review deployment frequency
- [ ] Check error trends
- [ ] Monitor performance metrics
- [ ] Review and close any issues
- [ ] Update documentation based on findings

### 26. Setup Maintenance Schedule ✓
- [ ] Calendar reminder: Daily health check (5 min)
- [ ] Calendar reminder: Weekly review (15 min)
- [ ] Calendar reminder: Monthly maintenance (1-2 hours)
- [ ] Calendar reminder: Quarterly review (4-6 hours)

---

## Success Criteria

### All Green? ✅
- ✅ Backend deployed and healthy
- ✅ Frontend deployed and accessible
- ✅ CI/CD pipeline working
- ✅ Monitoring setup
- ✅ Documentation complete
- ✅ Team trained
- ✅ Rollback tested

### Metrics to Track
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uptime | >99.9% | ___ | ⬜ |
| Error Rate | <1% | ___ | ⬜ |
| Deployment Success | >95% | ___ | ⬜ |
| Response Time | <200ms | ___ | ⬜ |

---

## Troubleshooting Quick Links

**Issue?** Check these:
1. [DEVOPS_GUIDE.md - Troubleshooting](./DEVOPS_GUIDE.md#troubleshooting)
2. [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md)
3. Railway logs: `railway logs`
4. GitHub Actions logs: Check Actions tab
5. Sentry dashboard: Check for errors

---

## Sign-Off

### Deployment Lead
- Name: _______________
- Date: _______________
- Signature: _______________

### Verification
- Name: _______________
- Date: _______________
- Signature: _______________

---

## Notes

**Deployment Date**: _______________  
**Deployment Time**: _______________  
**Version Deployed**: _______________  
**Issues Encountered**: _______________  
**Resolution**: _______________  

---

**🎉 Congratulations! Your application is deployed with full CI/CD!**

**Next Steps**:
1. Monitor for 24 hours
2. Schedule first maintenance
3. Review documentation
4. Train team on operations

**Last Updated**: November 16, 2025
