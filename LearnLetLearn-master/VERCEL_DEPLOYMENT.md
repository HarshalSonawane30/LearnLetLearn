# Vercel Deployment Guide for LearnLetLearn

## Prerequisites
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository connected to Vercel
- MongoDB Atlas account (for production database)
- Node.js v18 or higher

## Deployment Strategy

This project uses a **monorepo structure** with separate frontend and backend. For Vercel deployment:

### Option 1: Frontend on Vercel + Backend on Separate Service (Recommended)
- **Frontend**: Deploy React frontend to Vercel
- **Backend**: Deploy Express.js to Railway, Render, or similar service

### Option 2: Full-Stack on Vercel
- Convert backend to Vercel Serverless Functions
- Deploy frontend and API together

## Quick Start - Frontend Only

### Step 1: Prepare Frontend Build
```bash
cd frontend
npm install
npm run build
```

### Step 2: Deploy to Vercel
```bash
vercel
```

When prompted:
- Set project name: `learn-let-learn`
- Root directory: `./`
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Install dependencies: Yes

### Step 3: Configure Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)

## Backend Deployment (Separate Service)

### Deploy to Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize Railway project
railway create

# Deploy
railway up
```

### Deploy to Render
1. Create account at render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables (MONGODB_URI, JWT_SECRET)

## Environment Variables to Set

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-backend-service.com
```

### Backend
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/learn
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

## Post-Deployment Checklist
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to hosting service
- [ ] MongoDB Atlas database connected
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] CORS configured for frontend domain
- [ ] Test login flow

## Troubleshooting

### Frontend Build Fails
- Check `frontend/package.json` exists
- Ensure all dependencies installed: `npm install`
- Check for TypeScript errors: `npm run build`

### API Calls Not Working
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS configuration on backend
- Ensure backend service is running
- Check network tab in DevTools for exact error

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes your backend service IP
- Test connection string locally first
- Check JWT_SECRET environment variable is set

## Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
