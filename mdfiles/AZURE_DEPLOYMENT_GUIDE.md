# 🐬 Dolphin Cove - Azure Deployment Guide

A simple step-by-step guide to deploy Dolphin Cove (frontend + backend) to Microsoft Azure using the Azure Portal.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step 1: Create Resource Group](#step-1-create-resource-group)
4. [Step 2: Set Up Cosmos DB](#step-2-set-up-cosmos-db)
5. [Step 3: Create Storage Account](#step-3-create-storage-account)
6. [Step 4: Deploy Backend (Azure Functions)](#step-4-deploy-backend-azure-functions)
7. [Step 5: Deploy Frontend (Static Web Apps)](#step-5-deploy-frontend-static-web-apps)
8. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
9. [Step 7: Test Your Deployment](#step-7-test-your-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ An **Azure account** (free tier works!) - [Create one here](https://azure.microsoft.com/free/)
- ✅ A **GitHub account** with this project pushed to a repository
- ✅ **Node.js 18+** installed locally
- ✅ **VS Code** with Azure extensions (optional but helpful)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────┐      ┌──────────────────┐               │
│   │  Static Web Apps │      │  Azure Functions │               │
│   │   (Frontend)     │ ───► │    (Backend)     │               │
│   │   React + Vite   │      │   Node.js API    │               │
│   └──────────────────┘      └────────┬─────────┘               │
│                                      │                          │
│              ┌───────────────────────┼───────────────┐         │
│              │                       │               │         │
│              ▼                       ▼               ▼         │
│   ┌──────────────────┐   ┌──────────────────┐   ┌──────────┐  │
│   │    Cosmos DB     │   │  Blob Storage    │   │   CORS   │  │
│   │    (Database)    │   │   (Files)        │   │ Settings │  │
│   └──────────────────┘   └──────────────────┘   └──────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create Resource Group

A resource group is a container that holds all your Azure resources.

### Instructions:

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** (+ button at top left)
3. Search for **"Resource group"** and click **Create**
4. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource group name**: `dolphin-cove-rg`
   - **Region**: Choose one close to you (e.g., `East US`, `West Europe`)
5. Click **"Review + create"** → **"Create"**

✅ **Done!** You now have a container for all your resources.

---

## Step 2: Set Up Cosmos DB

Cosmos DB is our NoSQL database for storing users, posts, messages, jobs, and tasks.

### Instructions:

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Azure Cosmos DB"** and click **Create**
3. Select **"Azure Cosmos DB for NoSQL"** → **Create**
4. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: `dolphin-cove-rg`
   - **Account name**: `dolphin-cove-db` (must be unique globally, add numbers if needed)
   - **Location**: Same as your resource group
   - **Capacity mode**: **Serverless** (cheaper for development)
5. Click **"Review + create"** → **"Create"**
6. Wait for deployment (2-5 minutes)

### Create Database and Containers:

1. Once deployed, click **"Go to resource"**
2. In the left menu, click **"Data Explorer"**
3. Click **"New Database"**:
   - **Database id**: `DolphinCove`
   - Click **OK**
4. Click the **"..."** next to `DolphinCove` → **"New Container"** for each:

| Container Name   | Partition Key   |
|------------------|-----------------|
| `Users`          | `/id`           |
| `Posts`          | `/authorId`     |
| `Messages`       | `/conversationId` |
| `FreelanceJobs`  | `/clientId`     |
| `Tasks`          | `/participantId` |

### Get Connection String:

1. In the left menu, click **"Keys"**
2. Copy the **"PRIMARY CONNECTION STRING"**
3. Save it somewhere safe - you'll need it later!

### 📝 NoSQL Queries for Data Explorer

After creating containers, you can run these queries in **Data Explorer** to test and manage your data.

#### 🔍 Basic Queries

**Select container → Click "New SQL Query" → Paste query → Click "Execute Query"**

```sql
-- Get all documents in a container
SELECT * FROM c

-- Get first 10 documents
SELECT TOP 10 * FROM c

-- Count total documents
SELECT VALUE COUNT(1) FROM c
```

#### 👥 Users Container Queries

```sql
-- Find user by email
SELECT * FROM c WHERE c.email = "user@example.com"

-- Find user by username
SELECT * FROM c WHERE c.username = "johndoe"

-- Get all freelancers
SELECT * FROM c WHERE c.isFreelancer = true

-- Get users registered in last 7 days
SELECT * FROM c WHERE c.createdAt >= DateTimeAdd("day", -7, GetCurrentDateTime())

-- Count total users
SELECT VALUE COUNT(1) FROM c

-- Search users by name (case-insensitive)
SELECT * FROM c WHERE CONTAINS(LOWER(c.displayName), "john")
```

#### 📝 Posts Container Queries

```sql
-- Get all posts ordered by date (newest first)
SELECT * FROM c ORDER BY c.createdAt DESC

-- Get posts by specific author
SELECT * FROM c WHERE c.authorId = "user-id-here"

-- Get posts with more than 10 likes
SELECT * FROM c WHERE ARRAY_LENGTH(c.likes) > 10

-- Search posts by content
SELECT * FROM c WHERE CONTAINS(LOWER(c.content), "javascript")

-- Get trending posts (most likes in last 24 hours)
SELECT * FROM c 
WHERE c.createdAt >= DateTimeAdd("hour", -24, GetCurrentDateTime())
ORDER BY ARRAY_LENGTH(c.likes) DESC
```

#### 💼 FreelanceJobs Container Queries

```sql
-- Get all open jobs
SELECT * FROM c WHERE c.status = "open"

-- Get jobs by client
SELECT * FROM c WHERE c.clientId = "client-id-here"

-- Get jobs by budget range
SELECT * FROM c WHERE c.budget >= 500 AND c.budget <= 2000

-- Get jobs with specific skills
SELECT * FROM c WHERE ARRAY_CONTAINS(c.skills, "React")

-- Get jobs ordered by budget (highest first)
SELECT * FROM c WHERE c.status = "open" ORDER BY c.budget DESC

-- Count jobs by status
SELECT c.status, COUNT(1) as count FROM c GROUP BY c.status

-- Get jobs with applications
SELECT * FROM c WHERE ARRAY_LENGTH(c.applications) > 0
```

#### ✅ Tasks Container Queries

```sql
-- Get tasks by freelancer
SELECT * FROM c WHERE c.freelancerId = "freelancer-id-here"

-- Get tasks by client
SELECT * FROM c WHERE c.clientId = "client-id-here"

-- Get tasks by status
SELECT * FROM c WHERE c.status = "in_progress"

-- Get overdue tasks
SELECT * FROM c WHERE c.dueDate < GetCurrentDateTime() AND c.status != "completed"

-- Get completed tasks
SELECT * FROM c WHERE c.status = "completed"
```

#### 💬 Messages Container Queries

```sql
-- Get messages in a conversation
SELECT * FROM c WHERE c.conversationId = "conv-id-here" ORDER BY c.createdAt ASC

-- Get unread messages for user
SELECT * FROM c WHERE ARRAY_CONTAINS(c.unreadBy, "user-id-here")

-- Get recent conversations (last message)
SELECT * FROM c ORDER BY c.createdAt DESC
```

#### 🧹 Admin/Maintenance Queries

```sql
-- Find documents without required fields
SELECT * FROM c WHERE NOT IS_DEFINED(c.createdAt)

-- Find duplicate emails (run in Users container)
SELECT c.email, COUNT(1) as count 
FROM c 
GROUP BY c.email 
HAVING COUNT(1) > 1

-- Get storage size estimate (document count)
SELECT VALUE COUNT(1) FROM c
```

#### 📊 Analytics Queries

```sql
-- Platform statistics (run separately in each container)
-- Users: Total registered users
SELECT VALUE COUNT(1) FROM c

-- FreelanceJobs: Total projects posted
SELECT VALUE COUNT(1) FROM c

-- Jobs by category
SELECT c.category, COUNT(1) as count FROM c GROUP BY c.category

-- Average job budget
SELECT VALUE AVG(c.budget) FROM c WHERE c.status = "open"

-- Most active users (by post count) - run in Posts container
SELECT c.authorId, COUNT(1) as postCount 
FROM c 
GROUP BY c.authorId 
ORDER BY COUNT(1) DESC
```

> 💡 **Tip**: In Data Explorer, select your container first, then click **"New SQL Query"** to run these queries.

> ⚠️ **Note**: Cross-partition queries (queries without partition key filter) may be slower and cost more RUs. For production, always try to include the partition key in your WHERE clause.

✅ **Done!** Your database is ready.

---

## Step 3: Create Storage Account

Azure Blob Storage is for storing uploaded files (images, documents, etc.).

### Instructions:

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Storage account"** and click **Create**
3. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: `dolphin-cove-rg`
   - **Storage account name**: `dolphincovefiles` (must be unique, lowercase, no special characters)
   - **Region**: Same as resource group
   - **Performance**: **Standard**
   - **Redundancy**: **LRS** (Locally redundant - cheapest option)
4. Click **"Review + create"** → **"Create"**
5. Wait for deployment

### Create Blob Container:

1. Go to your storage account
2. In the left menu, click **"Containers"**
3. Click **"+ Container"**:
   - **Name**: `uploads`
   - **Public access level**: **Blob** (anonymous read access for blobs only)
4. Click **Create**

### Get Connection String:

1. In the left menu, click **"Access keys"**
2. Click **"Show"** next to the first connection string
3. Copy the **Connection string**
4. Save it - you'll need it later!

✅ **Done!** Your file storage is ready.

---

## Step 4: Deploy Backend (Azure Functions)

Azure Functions will host our Node.js API.

### Instructions:

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Function App"** and click **Create**
3. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: `dolphin-cove-rg`
   - **Function App name**: `dolphin-cove-api` (must be unique globally)
   - **Runtime stack**: **Node.js**
   - **Version**: **18 LTS** or **20 LTS**
   - **Region**: Same as resource group
   - **Operating System**: **Windows** or **Linux**
   - **Hosting options**: **Consumption (Serverless)** - pay only when functions run
4. Click **"Review + create"** → **"Create"**
5. Wait for deployment (2-3 minutes)

### Deploy Your Code:

**Option A: Deploy from VS Code (Recommended)**

1. Install **Azure Functions extension** in VS Code
2. Sign in to Azure in VS Code
3. Open the `api` folder in VS Code
4. Press `F1` → type **"Azure Functions: Deploy to Function App"**
5. Select your subscription and function app
6. Confirm deployment

**Option B: Deploy from GitHub Actions**

1. In Azure Portal, go to your Function App
2. Click **"Deployment Center"** in the left menu
3. **Source**: GitHub
4. Sign in and authorize
5. Select your repository and branch
6. Azure will create a workflow file automatically
7. Click **Save**

### Configure Environment Variables:

1. In your Function App, click **"Configuration"** in the left menu
2. Click **"+ New application setting"** and add these:

| Name | Value |
|------|-------|
| `COSMOS_CONNECTION_STRING` | Your Cosmos DB connection string |
| `COSMOS_DATABASE` | `DolphinCove` |
| `AZURE_STORAGE_CONNECTION_STRING` | Your Storage account connection string |
| `AZURE_STORAGE_CONTAINER` | `uploads` |

3. Click **Save** at the top

### Enable CORS:

1. In your Function App, click **"CORS"** in the left menu
2. Add your frontend URL (we'll add this after deploying frontend)
3. For now, add: `http://localhost:5173` (for local development)
4. Click **Save**

✅ **Done!** Your backend API is deployed.

---

## Step 5: Deploy Frontend (Static Web Apps)

Azure Static Web Apps is perfect for React apps - free tier available!

### Instructions:

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Static Web App"** and click **Create**
3. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: `dolphin-cove-rg`
   - **Name**: `dolphin-cove-frontend`
   - **Plan type**: **Free** (great for testing!)
   - **Region**: Choose closest to your users
   - **Source**: **GitHub**
4. Click **"Sign in with GitHub"** and authorize
5. Select:
   - **Organization**: Your GitHub username
   - **Repository**: Your dolphin-cove repo
   - **Branch**: `main` (or your main branch)
6. **Build Details**:
   - **Build Presets**: **Custom**
   - **App location**: `/` (root)
   - **Api location**: `api` (leave empty if using separate Function App)
   - **Output location**: `dist`
7. Click **"Review + create"** → **"Create"**

Azure will automatically:
- Create a GitHub Actions workflow
- Build and deploy your app on every push
- Give you a free URL like: `https://happy-river-12345.azurestaticapps.net`

### Get Your Frontend URL:

1. Go to your Static Web App resource
2. Copy the **URL** from the overview page

✅ **Done!** Your frontend is deployed.

---

## Step 6: Configure Environment Variables

### Update Frontend Environment:

Create a `.env.production` file in your project root:

```env
VITE_API_URL=https://dolphin-cove-api.azurewebsites.net/api
```

Replace `dolphin-cove-api` with your actual Function App name.

### Update CORS in Function App:

1. Go to your Function App → **CORS**
2. Add your Static Web App URL: `https://happy-river-12345.azurestaticapps.net`
3. Click **Save**

### Configure Static Web App Environment:

1. Go to your Static Web App
2. Click **"Configuration"** in the left menu
3. Add application setting:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-function-app.azurewebsites.net/api`
4. Click **Save**

✅ **Done!** Frontend and backend are connected.

---

## Step 7: Test Your Deployment

### Quick Tests:

1. **Test Backend API**:
   - Open browser: `https://your-function-app.azurewebsites.net/api/posts`
   - You should see a JSON response

2. **Test Frontend**:
   - Open your Static Web App URL
   - Try to register a new user
   - Create a post
   - Browse freelance jobs

### Monitor Your App:

1. **Function App Logs**:
   - Go to Function App → **Log stream**
   - See real-time logs

2. **Application Insights** (Optional):
   - Enable in Function App → **Application Insights**
   - Get detailed performance metrics

---

## Troubleshooting

### Common Issues:

#### ❌ "CORS error" in browser console
**Solution**: Add your frontend URL to Function App CORS settings

#### ❌ "Database connection failed"
**Solution**: Check `COSMOS_CONNECTION_STRING` in Function App settings

#### ❌ "Cannot read properties of undefined"
**Solution**: Make sure all environment variables are set correctly

#### ❌ Build fails in GitHub Actions
**Solution**: 
- Check Node.js version matches (18+)
- Run `npm run build` locally first to catch errors

#### ❌ Static Web App shows blank page
**Solution**:
- Check `Output location` is set to `dist`
- Verify `VITE_API_URL` is correct

### Useful Commands (Local Testing):

```bash
# Test backend locally
cd api
npm install
npm start

# Test frontend locally  
npm install
npm run dev
```

---

## 💰 Cost Estimation (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| Static Web Apps | Free | **$0** |
| Azure Functions | Consumption | **~$0-5** (first 1M requests free) |
| Cosmos DB | Serverless | **~$1-10** (based on usage) |
| Blob Storage | Standard | **~$0.02/GB** |

**Total for small app**: ~$5-15/month

---

## 🎉 Congratulations!

You've successfully deployed Dolphin Cove to Azure! 

### Your URLs:
- **Frontend**: `https://your-app.azurestaticapps.net`
- **Backend API**: `https://your-function-app.azurewebsites.net/api`

### Next Steps:
- [ ] Add custom domain
- [ ] Set up SSL certificate (free with Static Web Apps)
- [ ] Configure authentication (Azure AD B2C)
- [ ] Set up monitoring alerts
- [ ] Enable auto-scaling for production

---

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure Blob Storage Documentation](https://docs.microsoft.com/azure/storage/blobs/)

---

**Happy Deploying! 🚀**
