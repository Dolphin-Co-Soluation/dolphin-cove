# 🐬 Dolphin Cove - FREE Deployment Guide
## Vercel + Render + Supabase (100% FREE - No Credit Card Required)

---

## 📋 Overview

This guide will help you deploy Dolphin Cove completely **FREE** using:
- **Vercel** - Frontend hosting (FREE forever)
- **Render** - Backend hosting (FREE tier - 750 hours/month)
- **Supabase** - Database + Storage (FREE tier - 500MB database, 1GB storage)

**Total Cost: $0** 🎉

---

## 🚀 Step 1: Set Up Supabase (Database)

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with **GitHub** (easiest) or email
4. **No credit card required!**

### 1.2 Create a New Project
1. Click **"New Project"**
2. Enter project details:
   - **Name:** `dolphin-cove`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### 1.3 Get Your API Keys
1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

### 1.4 Create Database Tables
1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `api/supabase-schema.sql`
4. Paste into the editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success" messages

### 1.5 Create Storage Bucket
1. Go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Enter:
   - **Name:** `dolphin-cove-files`
   - **Public bucket:** ✅ Enable
4. Click **"Create bucket"**

---

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended)
4. **No credit card required!**

### 2.2 Push Code to GitHub
If you haven't already:
```bash
# Make sure you're on the right branch
git checkout Vercel+render+supabase

# Add all changes
git add .

# Commit
git commit -m "Convert to Vercel + Render + Supabase stack"

# Push to GitHub
git push origin Vercel+render+supabase
```

### 2.3 Create New Web Service
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select `dolphin-cove` repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `dolphin-cove-api` |
| **Region** | Choose closest to Supabase region |
| **Branch** | `Vercel+render+supabase` |
| **Root Directory** | `api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 2.4 Add Environment Variables
In the same page, scroll to **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Leave empty for now (add after Vercel deploy) |

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes first time)
3. Once deployed, copy your **Render URL**: `https://dolphin-cove-api.onrender.com`

### ⚠️ Important: Free Tier Limitation
Render's free tier will **spin down after 15 minutes of inactivity**. First request after sleep takes ~30 seconds to wake up.

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with **GitHub**
4. **No credit card required!**

### 3.2 Import Project
1. Click **"New Project"**
2. Import your GitHub repository `dolphin-cove`
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.3 Add Environment Variables
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://dolphin-cove-api.onrender.com/api` |

**Note:** Replace with YOUR actual Render URL!

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Copy your **Vercel URL**: `https://dolphin-cove.vercel.app`

### 3.5 Update Render CORS
Go back to Render dashboard:
1. Go to your `dolphin-cove-api` service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL
4. Click **"Save Changes"**
5. The service will auto-redeploy

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend
Open your browser and go to:
```
https://dolphin-cove-api.onrender.com/api/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "service": "Dolphin Cove API"
}
```

### 4.2 Test Frontend
Go to your Vercel URL:
```
https://dolphin-cove.vercel.app
```

The website should load! 🎉

### 4.3 Test Database Connection
Try registering a new user or creating a post. If it works, everything is connected!

---

## 🔧 Troubleshooting

### Backend Not Responding
- Check Render logs in dashboard
- Verify environment variables are correct
- Make sure Supabase URL doesn't have trailing slash

### CORS Errors
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check browser console for specific error

### Database Errors
- Check Supabase logs in dashboard
- Verify tables were created (SQL Editor → run the schema again)
- Check RLS policies are enabled

### Images Not Uploading
- Verify storage bucket is public in Supabase
- Check bucket name is exactly `dolphin-cove-files`

---

## 📊 Free Tier Limits

### Supabase (Free Tier)
| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| Edge Functions | 500K invocations |
| Auth Users | 50,000 |

### Render (Free Tier)
| Resource | Limit |
|----------|-------|
| Hours | 750/month |
| Memory | 512 MB |
| CPU | Shared |
| Sleep | After 15 min inactive |

### Vercel (Free Tier)
| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Builds | 6000 min/month |
| Serverless | 100 GB-hours |
| Sites | Unlimited |

---

## 🔄 Auto-Deploy Setup

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin Vercel+render+supabase

# Both services will auto-deploy! ✨
```

---

## 📱 Custom Domain (Optional - Still Free!)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed

---

## 🎉 You're Done!

Your Dolphin Cove platform is now live and 100% FREE:

- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-project.onrender.com`
- **Database:** Hosted on Supabase

### Next Steps
1. Share with friends
2. Customize the design
3. Add more features
4. Consider upgrading when you have more users

---

## 📞 Need Help?

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

---

**Happy Coding! 🚀**
