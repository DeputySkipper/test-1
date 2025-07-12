# 🚀 ReWear Deployment Guide

## Quick Start: Host Your ReWear Project

Since your ReWear project is a **full-stack Node.js application**, you have several hosting options. Here's the easiest approach:

## 🌐 **Option 1: GitHub Pages + Render (Recommended - FREE)**

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it `rewear`
   - Make it public
   - Don't initialize with README (you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/rewear.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render (FREE)

1. **Sign up for Render**:
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `rewear-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**:
   - Click on your service → "Environment"
   - Add these variables:
     ```
     MONGODB_URI=mongodb+srv://your-mongodb-atlas-uri
     JWT_SECRET=your-super-secret-jwt-key
     NODE_ENV=production
     ```

4. **Get Your Backend URL**:
   - After deployment, copy your Render URL (e.g., `https://rewear-backend.onrender.com`)

### Step 3: Deploy Frontend to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to your GitHub repository
   - Click "Settings" → "Pages"
   - Source: "Deploy from a branch"
   - Branch: "gh-pages"
   - Click "Save"

2. **Update Configuration**:
   - Edit `public/js/config.js`
   - Replace the URLs:
     ```javascript
     production: {
       API_BASE_URL: 'https://your-render-backend-url.onrender.com/api',
       FRONTEND_URL: 'https://yourusername.github.io/rewear'
     }
     ```

3. **Push Changes**:
   ```bash
   git add .
   git commit -m "Update config for deployment"
   git push origin main
   ```

4. **Wait for Deployment**:
   - GitHub Actions will automatically deploy your frontend
   - Check the "Actions" tab in your repository

### Step 4: Access Your Website

- **Frontend**: `https://yourusername.github.io/rewear`
- **Backend API**: `https://your-render-backend-url.onrender.com`

## 🌐 **Option 2: Vercel (Full Stack - FREE)**

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
vercel
```

### Step 3: Configure
- Follow the prompts
- Add environment variables in Vercel dashboard:
  - `MONGODB_URI`
  - `JWT_SECRET`

## 🌐 **Option 3: Netlify (Frontend) + Railway (Backend)**

### Frontend (Netlify)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `public` folder
3. Get your Netlify URL

### Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically

## 🗄️ **Database Setup (MongoDB Atlas)**

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

### Step 3: Use in Deployment
- Add the connection string as `MONGODB_URI` environment variable

## 🔧 **Local Development vs Production**

### Local Development
```bash
npm install
npm run dev
# Access at http://localhost:3000
```

### Production
- Frontend: GitHub Pages (static files)
- Backend: Render/Railway/Vercel (Node.js server)
- Database: MongoDB Atlas (cloud database)

## 🚨 **Common Issues & Solutions**

### Issue 1: CORS Errors
**Solution**: Update your backend CORS settings:
```javascript
app.use(cors({
  origin: ['https://yourusername.github.io', 'http://localhost:3000'],
  credentials: true
}));
```

### Issue 2: Environment Variables Not Working
**Solution**: Make sure to set them in your hosting platform's dashboard

### Issue 3: Build Failures
**Solution**: Check that all dependencies are in `package.json`

### Issue 4: Database Connection Issues
**Solution**: 
- Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
- Check connection string format
- Ensure database user has correct permissions

## 📊 **Monitoring Your Deployment**

### GitHub Pages
- Check repository → Settings → Pages
- View deployment status

### Render/Railway
- Monitor logs in dashboard
- Check service health

### MongoDB Atlas
- Monitor database performance
- Check connection status

## 🎯 **Next Steps After Deployment**

1. **Test All Features**:
   - User registration/login
   - Item creation/browsing
   - Swap functionality

2. **Set Up Custom Domain** (Optional):
   - Buy domain (e.g., `rewear.com`)
   - Configure DNS settings
   - Update hosting platform settings

3. **Add Analytics**:
   - Google Analytics
   - Error tracking (Sentry)

4. **Set Up Monitoring**:
   - Uptime monitoring
   - Performance monitoring

## 💰 **Cost Breakdown**

### Free Tier (Recommended)
- **GitHub Pages**: Free
- **Render/Railway**: Free (with limitations)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

### Paid Options (For Growth)
- **Vercel Pro**: $20/month
- **Render Paid**: $7/month
- **MongoDB Atlas**: $9/month
- **Custom Domain**: $10-15/year

---

## 🎉 **You're Ready to Deploy!**

Choose **Option 1 (GitHub Pages + Render)** for the easiest, free deployment. Your ReWear platform will be live and accessible to users worldwide!

Need help? Check the troubleshooting section or create an issue in your GitHub repository. 