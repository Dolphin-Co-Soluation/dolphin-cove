# 🐬 Dolphin Cove - Free Deployment Guide

Deploy your app for **100% FREE** using Vercel + Render + Supabase.

---

## 📋 What You'll Use

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Vercel** | Frontend hosting | Unlimited |
| **Render** | Backend hosting | 750 hrs/month |
| **Supabase** | Database + Storage | 500MB database |

---

## Step 1: Set Up Supabase (Database)

### 1.1 Create Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended)

### 1.2 Create Project
1. Click **"New Project"**
2. Fill in:
   - **Name:** `dolphin-cove`
   - **Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
3. Click **"Create new project"**
4. Wait 2 minutes for setup

### 1.3 Get Your Keys
1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGci...` (long string)

### 1.4 Create Database Tables
1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy ALL the SQL from `api/supabase-schema.sql`
4. Paste it in the editor
5. Click **"Run"**
6. You should see "Success" ✅

---

## Step 2: Deploy Backend to Render

### 2.1 Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2.2 Connect Your Repository
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub account
3. Select the `dolphin-cove` repository

### 2.3 Configure Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `dolphin-cove-api` |
| **Region** | Choose closest to users |
| **Branch** | `Vercel+render+supabase` |
| **Root Directory** | `api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### 2.4 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these 3 variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `PORT` | `3001` |

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Copy your backend URL: `https://dolphin-cove-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New"** → **"Project"**
2. Import your `dolphin-cove` repository

### 3.3 Configure Build
Vercel auto-detects Vite. Just verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (leave empty) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.4 Add Environment Variable
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://dolphin-cove-api.onrender.com/api` |

⚠️ **Important:** Replace with YOUR Render backend URL!

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Your site is live! 🎉

---

## ✅ Final Checklist

- [ ] Supabase project created
- [ ] Database tables created (ran SQL)
- [ ] Backend deployed to Render
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Frontend `VITE_API_URL` points to Render backend

---

## 🔧 Test Your Deployment

1. Visit your Vercel URL
2. Try to register a new account
3. Create a post
4. If everything works, you're done! 🐬

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check Supabase URL and Key in Render environment variables
- Make sure you ran the SQL schema in Supabase

### "API not responding"
- Check Render deployment logs
- Make sure `PORT` environment variable is set to `3001`

### "CORS errors"
- The backend already has CORS configured
- Make sure `VITE_API_URL` includes `/api` at the end

### Backend goes to sleep (Render free tier)
- First request after sleep takes ~30 seconds
- This is normal for free tier
- Consider upgrading if you need always-on

---

## 📁 Project Structure

```
dolphin-cove/
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   ├── pages/
│   └── services/api.ts     # API calls
├── api/                    # Backend (Express)
│   ├── src/
│   │   ├── server.ts       # Main server
│   │   ├── routes/         # API endpoints
│   │   └── lib/database.ts # Supabase connection
│   └── supabase-schema.sql # Database schema
└── DEPLOY_GUIDE.md         # This file
```

---

## 🔗 Your URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://dolphin-cove.vercel.app` |
| Backend | `https://dolphin-cove-api.onrender.com` |
| Database | `https://xxxxx.supabase.co` |

---

**Happy Deploying! 🐬**
