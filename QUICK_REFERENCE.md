# 🚀 Quick Reference Card

## Railway Backend Deployment (3 Steps)

### 1️⃣ Setup Railway
```bash
# Login to Railway: https://railway.app
# Click "Start a New Project" → "Deploy from GitHub repo"
# Select your repository
```

### 2️⃣ Configure Environment
**In Railway Dashboard → Variables:**
```
PORT=3001
CLIENT_URL=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
NODE_ENV=production
```

### 3️⃣ Generate Domain
**Settings → Networking → Generate Domain**
- Copy your URL: `https://your-app.up.railway.app`
- **Save this URL!** You need it for the frontend

✅ **Test Backend:**
```bash
curl https://your-app.up.railway.app/health
```

---

## GitHub Pages Frontend Deployment (4 Steps)

### 1️⃣ Set GitHub Secret
**Repo → Settings → Secrets → Actions → New secret**
```
Name: VITE_SERVER_URL
Value: https://your-app.up.railway.app
```

### 2️⃣ Enable GitHub Pages
**Repo → Settings → Pages**
- Source: **GitHub Actions** (NOT "Deploy from a branch")
- Save

### 3️⃣ Push Code
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 4️⃣ Update Backend CORS
**Railway → Variables → Update:**
```
CLIENT_URL=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

✅ **Your app is live at:**
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

---

## Common Commands

### Development
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

### Build & Test
```bash
# Frontend build
cd client && npm run build && npm run preview
```

### Check Status
```bash
# Backend health
curl https://your-app.up.railway.app/health

# Frontend (open in browser)
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

---

## Environment Files

### server/.env
```env
PORT=3001
CLIENT_URL=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

### client/.env
```env
VITE_SERVER_URL=https://your-app.up.railway.app
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Update `CLIENT_URL` in Railway to match GitHub Pages URL |
| 404 on GitHub Pages | Wait 2-3 minutes, check Actions tab for deployment status |
| Can't connect | Verify `VITE_SERVER_URL` secret in GitHub matches Railway URL |
| Sound not playing | Fixed! Clear cache and reload |

---

## URLs to Remember

```
🚂 Railway Backend:  https://your-app.up.railway.app
🌐 GitHub Frontend:  https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
📖 Full Guide:       See DEPLOYMENT_GUIDE.md
```

---

**Need help?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
