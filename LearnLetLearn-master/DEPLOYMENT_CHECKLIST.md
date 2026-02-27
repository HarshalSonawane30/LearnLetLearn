# Vercel Deployment Checklist

## Pre-Deployment (Local)
- [ ] Frontend builds successfully: `npm run build`
- [ ] No build warnings or errors
- [ ] Environment variables configured
- [ ] Git repository is clean and up to date
- [ ] All code committed to GitHub

## Vercel Setup
- [ ] Create Vercel account (vercel.com)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Connect GitHub repository to Vercel

## Deployment Steps

### 1. Push Configuration to GitHub
```bash
git add vercel.json VERCEL_DEPLOYMENT.md
git commit -m "feat: Add Vercel deployment configuration"
git push
```

### 2. Frontend Deployment to Vercel
```bash
# Option A: Using Vercel Dashboard
# - Go to https://vercel.com/new
# - Import your GitHub repository
# - Configure project settings (root directory, build command)
# - Deploy

# Option B: Using Vercel CLI
vercel
```

### 3. Configure Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `VITE_API_BASE_URL` = `https://your-backend-url.com`

### 4. Backend Deployment (Choose One)

#### Railway
```bash
npm install -g @railway/cli
railway login
railway create
railway up
```

#### Render
- Visit https://dashboard.render.com
- Create new Web Service
- Connect GitHub repo
- Set Environment: Node
- Set Build: `npm install`
- Set Start: `npm start`
- Add Environment Variables

## Post-Deployment Verification
- [ ] Frontend loads at Vercel URL
- [ ] API base URL is correct
- [ ] Login page accessible
- [ ] Can navigate to different pages
- [ ] API calls complete successfully
- [ ] WebSocket connections work (Chat/Video)

## Troubleshooting

### Vercel Build Fails
Check these in Vercel Dashboard:
1. Build Logs: Look for specific errors
2. Environment: Verify all env vars are set
3. Source: Ensure correct branch is deployed

### API Calls Return 404
- Verify `VITE_API_BASE_URL` is set
- Check backend service is running
- Ensure CORS is configured on backend

### Blank Page on Load
- Check browser console for errors
- Verify `index.html` is serving correctly
- Check Network tab for failed requests

## Rollback
```bash
# Revert to previous deployment in Vercel Dashboard
# Or redeploy: git revert <commit> && git push
```

## Next Steps
1. Set up database backups
2. Configure analytics (Vercel Analytics)
3. Set up uptime monitoring
4. Configure custom domain
5. Enable automatic deployments on push

## Resources
- [Vercel Docs](https://vercel.com/docs)
- [React + Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Express.js on Railway](https://docs.railway.app/)
- [Express.js on Render](https://render.com/docs/deploy-node-express-app)
