# 🐬 Dolphin Cove - Azure Backend Setup Guide

This guide will walk you through setting up a complete backend for Dolphin Cove using Azure services.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Azure Account Setup](#azure-account-setup)
4. [Create Azure Resources](#create-azure-resources)
5. [Project Structure](#project-structure)
6. [Azure Functions API Setup](#azure-functions-api-setup)
7. [Cosmos DB Setup](#cosmos-db-setup)
8. [Azure AD B2C Authentication](#azure-ad-b2c-authentication)
9. [Blob Storage for Images](#blob-storage-for-images)
10. [SignalR for Real-time Features](#signalr-for-real-time-features)
11. [Deployment](#deployment)
12. [Environment Variables](#environment-variables)
13. [Testing](#testing)
14. [Cost Estimation](#cost-estimation)

---

## Prerequisites

Before starting, make sure you have:

- [ ] **Node.js** v18+ installed ([Download](https://nodejs.org/))
- [ ] **Azure CLI** installed ([Download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- [ ] **Azure Functions Core Tools** v4 ([Download](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local))
- [ ] **Visual Studio Code** with extensions:
  - Azure Functions
  - Azure Static Web Apps
  - Azure Databases
- [ ] **Azure Account** (Free tier available)
- [ ] **Git** installed

### Install Azure CLI (Windows)

```powershell
# Using winget
winget install Microsoft.AzureCLI

# Or download MSI from:
# https://aka.ms/installazurecliwindows
```

### Install Azure Functions Core Tools

```powershell
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### Verify Installations

```powershell
az --version
func --version
node --version
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOLPHIN COVE ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│              Azure Static Web Apps (React + Vite)                │
│                    https://dolphin-cove.azurestaticapps.net      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                                │
│                    Azure AD B2C                                  │
│         ┌─────────────────────────────────────────┐             │
│         │ • Email/Password                        │             │
│         │ • Google OAuth                          │             │
│         │ • GitHub OAuth                          │             │
│         │ • LinkedIn OAuth                        │             │
│         └─────────────────────────────────────────┘             │
└─────────────────────────┬───────────────────────────────────────┘
                          │ JWT Token
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│              Azure Functions (Node.js/TypeScript)                │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ /api/users  │ │ /api/posts  │ │ /api/jobs   │ │/api/messages││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└───────┬─────────────────┬─────────────────┬─────────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Cosmos DB    │ │ Blob Storage  │ │ SignalR       │
│  (NoSQL)      │ │ (Images)      │ │ (Real-time)   │
│               │ │               │ │               │
│ • Users       │ │ • Avatars     │ │ • Messages    │
│ • Posts       │ │ • Post images │ │ • Notifications│
│ • Comments    │ │ • Attachments │ │ • Live updates│
│ • Jobs        │ │               │ │               │
│ • Messages    │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Services Summary

| Service | Purpose | Pricing Tier |
|---------|---------|--------------|
| Azure Static Web Apps | Frontend hosting + API | Free |
| Azure Functions | Serverless API | Consumption (pay-per-use) |
| Azure Cosmos DB | NoSQL Database | Free tier (1000 RU/s) |
| Azure Blob Storage | Image storage | Pay-per-GB |
| Azure AD B2C | Authentication | 50,000 MAU free |
| Azure SignalR | Real-time messaging | Free tier (20 connections) |

---

## Azure Account Setup

### Step 1: Create Azure Account

1. Go to [Azure Portal](https://portal.azure.com/)
2. Click **"Start free"** or **"Create a free account"**
3. Sign in with Microsoft account or create new
4. Provide phone verification
5. Enter credit card (won't be charged for free tier)
6. Complete signup

> 💡 **Free Tier Benefits:**
> - $200 credit for 30 days
> - 12 months of free services
> - Always-free services (including what we'll use)

### Step 2: Login via Azure CLI

```powershell
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your Subscription Name"

# Verify login
az account show
```

---

## Create Azure Resources

### Step 1: Create Resource Group

A resource group is a container for all your Azure resources.

```powershell
# Create resource group
az group create \
  --name dolphin-cove-rg \
  --location eastus

# Verify creation
az group show --name dolphin-cove-rg
```

### Step 2: Create Cosmos DB Account

```powershell
# Create Cosmos DB account (takes 5-10 minutes)
az cosmosdb create \
  --name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --kind GlobalDocumentDB \
  --default-consistency-level Session \
  --enable-free-tier true \
  --locations regionName=eastus

# Create database
az cosmosdb sql database create \
  --account-name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --name DolphinCoveDB

# Create containers (collections)
# Users container
az cosmosdb sql container create \
  --account-name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --database-name DolphinCoveDB \
  --name Users \
  --partition-key-path /id \
  --throughput 400

# Posts container
az cosmosdb sql container create \
  --account-name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --database-name DolphinCoveDB \
  --name Posts \
  --partition-key-path /authorId \
  --throughput 400

# Messages container
az cosmosdb sql container create \
  --account-name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --database-name DolphinCoveDB \
  --name Messages \
  --partition-key-path /conversationId \
  --throughput 400

# Jobs container
az cosmosdb sql container create \
  --account-name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --database-name DolphinCoveDB \
  --name Jobs \
  --partition-key-path /employerId \
  --throughput 400
```

### Step 3: Create Storage Account (for images)

```powershell
# Create storage account
az storage account create \
  --name dolphincovestore \
  --resource-group dolphin-cove-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create blob container for images
az storage container create \
  --name images \
  --account-name dolphincovestore \
  --public-access blob
```

### Step 4: Create SignalR Service (for real-time)

```powershell
# Create SignalR service
az signalr create \
  --name dolphin-cove-signalr \
  --resource-group dolphin-cove-rg \
  --sku Free_F1 \
  --service-mode Serverless
```

### Step 5: Get Connection Strings

```powershell
# Get Cosmos DB connection string
az cosmosdb keys list \
  --name dolphin-cove-db \
  --resource-group dolphin-cove-rg \
  --type connection-strings

# Get Storage connection string
az storage account show-connection-string \
  --name dolphincovestore \
  --resource-group dolphin-cove-rg

# Get SignalR connection string
az signalr key list \
  --name dolphin-cove-signalr \
  --resource-group dolphin-cove-rg
```

> ⚠️ **Save these connection strings securely! You'll need them later.**

---

## Project Structure

Update your project to include the API folder:

```
dolphin-cove/
├── src/                          # React frontend (existing)
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── ...
├── api/                          # Azure Functions API (NEW)
│   ├── src/
│   │   └── functions/
│   │       ├── users.ts          # User endpoints
│   │       ├── posts.ts          # Post endpoints
│   │       ├── messages.ts       # Message endpoints
│   │       ├── jobs.ts           # Job endpoints
│   │       ├── upload.ts         # File upload
│   │       └── negotiate.ts      # SignalR negotiate
│   ├── package.json
│   ├── tsconfig.json
│   ├── host.json
│   └── local.settings.json       # Local environment vars
├── shared/                       # Shared types (NEW)
│   └── types.ts
├── package.json
├── staticwebapp.config.json      # Static Web App config (NEW)
└── ...
```

---

## Azure Functions API Setup

### Step 1: Create API Folder Structure

Run these commands in your project root:

```powershell
# Navigate to project
cd c:\Users\HP\dolphin-cove

# Create api folder
mkdir api
cd api

# Initialize Azure Functions project
func init --typescript

# Install dependencies
npm install @azure/cosmos @azure/storage-blob @azure/functions uuid
npm install -D @types/uuid typescript
```

### Step 2: Create host.json

Create `api/host.json`:

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "extensions": {
    "http": {
      "routePrefix": "api"
    }
  }
}
```

### Step 3: Create local.settings.json

Create `api/local.settings.json` (for local development):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONNECTION_STRING": "YOUR_COSMOS_CONNECTION_STRING",
    "COSMOS_DATABASE": "DolphinCoveDB",
    "STORAGE_CONNECTION_STRING": "YOUR_STORAGE_CONNECTION_STRING",
    "SIGNALR_CONNECTION_STRING": "YOUR_SIGNALR_CONNECTION_STRING"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

> ⚠️ **Never commit local.settings.json to git!** Add it to `.gitignore`

### Step 4: Create tsconfig.json

Create `api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 5: Create package.json

Create `api/package.json`:

```json
{
  "name": "dolphin-cove-api",
  "version": "1.0.0",
  "description": "Dolphin Cove API - Azure Functions",
  "main": "dist/functions/*.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "start": "npm run build && func start",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@azure/cosmos": "^4.0.0",
    "@azure/functions": "^4.0.0",
    "@azure/storage-blob": "^12.17.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Step 6: Create Database Client

Create `api/src/lib/database.ts`:

```typescript
import { CosmosClient, Database, Container } from '@azure/cosmos';

const connectionString = process.env.COSMOS_CONNECTION_STRING!;
const databaseName = process.env.COSMOS_DATABASE || 'DolphinCoveDB';

const client = new CosmosClient(connectionString);
const database: Database = client.database(databaseName);

export const containers = {
  users: database.container('Users'),
  posts: database.container('Posts'),
  messages: database.container('Messages'),
  jobs: database.container('Jobs'),
};

export { database, client };
```

### Step 7: Create Shared Types

Create `api/src/types/index.ts`:

```typescript
// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  isFreelancer: boolean;
  hourlyRate?: number;
  location?: string;
  website?: string;
  connections: string[];
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
  isFreelancer?: boolean;
}

// Post Types
export interface Post {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  isFreelancePost: boolean;
  freelanceDetails?: FreelanceDetails;
  likes: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FreelanceDetails {
  title: string;
  budget: string;
  deadline: string;
  skills: string[];
  projectType: 'fixed' | 'hourly';
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  isFreelancePost?: boolean;
  freelanceDetails?: FreelanceDetails;
}

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: string[];
  createdAt: string;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

// Job Types
export interface Job {
  id: string;
  employerId: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  applicants: string[];
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### Step 8: Create Users Function

Create `api/src/functions/users.ts`:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserRequest, ApiResponse } from '../types';

// GET /api/users - Get all users (with pagination)
app.http('getUsers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = parseInt(request.query.get('pageSize') || '20');
      const offset = (page - 1) * pageSize;

      const { resources: users } = await containers.users.items
        .query({
          query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit',
          parameters: [
            { name: '@offset', value: offset },
            { name: '@limit', value: pageSize }
          ]
        })
        .fetchAll();

      // Get total count
      const { resources: countResult } = await containers.users.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      const total = countResult[0] || 0;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: users,
          total,
          page,
          pageSize,
          hasMore: offset + users.length < total
        }
      };
    } catch (error) {
      context.error('Error fetching users:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch users' }
      };
    }
  }
});

// GET /api/users/:id - Get user by ID
app.http('getUserById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;
      
      const { resource: user } = await containers.users.item(id, id).read<User>();
      
      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' }
        };
      }

      return {
        status: 200,
        jsonBody: { success: true, data: user }
      };
    } catch (error) {
      context.error('Error fetching user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch user' }
      };
    }
  }
});

// POST /api/users - Create new user
app.http('createUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = await request.json() as CreateUserRequest;
      
      // Validate required fields
      if (!body.email || !body.username || !body.displayName) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Missing required fields' }
        };
      }

      // Check if email already exists
      const { resources: existingUsers } = await containers.users.items
        .query({
          query: 'SELECT * FROM c WHERE c.email = @email OR c.username = @username',
          parameters: [
            { name: '@email', value: body.email },
            { name: '@username', value: body.username }
          ]
        })
        .fetchAll();

      if (existingUsers.length > 0) {
        return {
          status: 409,
          jsonBody: { success: false, error: 'Email or username already exists' }
        };
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: uuidv4(),
        email: body.email,
        username: body.username,
        displayName: body.displayName,
        skills: [],
        isFreelancer: body.isFreelancer || false,
        connections: [],
        followers: [],
        following: [],
        createdAt: now,
        updatedAt: now
      };

      const { resource: createdUser } = await containers.users.items.create(newUser);

      return {
        status: 201,
        jsonBody: { success: true, data: createdUser, message: 'User created successfully' }
      };
    } catch (error) {
      context.error('Error creating user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create user' }
      };
    }
  }
});

// PUT /api/users/:id - Update user
app.http('updateUser', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;
      const body = await request.json() as Partial<User>;

      // Get existing user
      const { resource: existingUser } = await containers.users.item(id, id).read<User>();
      
      if (!existingUser) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' }
        };
      }

      // Update user
      const updatedUser: User = {
        ...existingUser,
        ...body,
        id: existingUser.id, // Ensure ID doesn't change
        email: existingUser.email, // Ensure email doesn't change
        updatedAt: new Date().toISOString()
      };

      const { resource } = await containers.users.item(id, id).replace(updatedUser);

      return {
        status: 200,
        jsonBody: { success: true, data: resource, message: 'User updated successfully' }
      };
    } catch (error) {
      context.error('Error updating user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update user' }
      };
    }
  }
});

// DELETE /api/users/:id - Delete user
app.http('deleteUser', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;

      await containers.users.item(id, id).delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'User deleted successfully' }
      };
    } catch (error) {
      context.error('Error deleting user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete user' }
      };
    }
  }
});
```

### Step 9: Create Posts Function

Create `api/src/functions/posts.ts`:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { Post, CreatePostRequest } from '../types';

// GET /api/posts - Get all posts (with pagination)
app.http('getPosts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = parseInt(request.query.get('pageSize') || '20');
      const authorId = request.query.get('authorId');
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM c';
      const parameters: any[] = [];

      if (authorId) {
        query += ' WHERE c.authorId = @authorId';
        parameters.push({ name: '@authorId', value: authorId });
      }

      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: pageSize }
      );

      const { resources: posts } = await containers.posts.items
        .query({ query, parameters })
        .fetchAll();

      return {
        status: 200,
        jsonBody: { success: true, data: posts, page, pageSize }
      };
    } catch (error) {
      context.error('Error fetching posts:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch posts' }
      };
    }
  }
});

// GET /api/posts/:id - Get post by ID
app.http('getPostById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;
      
      // Query to find post by ID (since we don't know authorId for partition key)
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id }]
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' }
        };
      }

      return {
        status: 200,
        jsonBody: { success: true, data: posts[0] }
      };
    } catch (error) {
      context.error('Error fetching post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch post' }
      };
    }
  }
});

// POST /api/posts - Create new post
app.http('createPost', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = await request.json() as CreatePostRequest & { authorId: string };
      
      if (!body.content || !body.authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Missing required fields' }
        };
      }

      const now = new Date().toISOString();
      const newPost: Post = {
        id: uuidv4(),
        authorId: body.authorId,
        content: body.content,
        images: body.images || [],
        isFreelancePost: body.isFreelancePost || false,
        freelanceDetails: body.freelanceDetails,
        likes: [],
        commentCount: 0,
        createdAt: now,
        updatedAt: now
      };

      const { resource: createdPost } = await containers.posts.items.create(newPost);

      return {
        status: 201,
        jsonBody: { success: true, data: createdPost, message: 'Post created successfully' }
      };
    } catch (error) {
      context.error('Error creating post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create post' }
      };
    }
  }
});

// POST /api/posts/:id/like - Like/unlike a post
app.http('likePost', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/like',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const body = await request.json() as { userId: string };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID required' }
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }]
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' }
        };
      }

      const post = posts[0] as Post;
      const userIndex = post.likes.indexOf(body.userId);
      
      if (userIndex > -1) {
        // Unlike
        post.likes.splice(userIndex, 1);
      } else {
        // Like
        post.likes.push(body.userId);
      }

      post.updatedAt = new Date().toISOString();

      await containers.posts.item(post.id, post.authorId).replace(post);

      return {
        status: 200,
        jsonBody: { 
          success: true, 
          data: { liked: userIndex === -1, likesCount: post.likes.length },
          message: userIndex === -1 ? 'Post liked' : 'Post unliked'
        }
      };
    } catch (error) {
      context.error('Error liking post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to like post' }
      };
    }
  }
});

// DELETE /api/posts/:id - Delete post
app.http('deletePost', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const authorId = request.query.get('authorId');

      if (!authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID required' }
        };
      }

      await containers.posts.item(postId, authorId).delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'Post deleted successfully' }
      };
    } catch (error) {
      context.error('Error deleting post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete post' }
      };
    }
  }
});
```

### Step 10: Create Jobs Function

Create `api/src/functions/jobs.ts`:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../types';

// GET /api/jobs - Get all jobs
app.http('getJobs', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'jobs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = parseInt(request.query.get('pageSize') || '20');
      const remote = request.query.get('remote');
      const type = request.query.get('type');
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM c WHERE c.status = "open"';
      const parameters: any[] = [];

      if (remote === 'true') {
        query += ' AND c.remote = true';
      }

      if (type) {
        query += ' AND c.type = @type';
        parameters.push({ name: '@type', value: type });
      }

      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: pageSize }
      );

      const { resources: jobs } = await containers.jobs.items
        .query({ query, parameters })
        .fetchAll();

      return {
        status: 200,
        jsonBody: { success: true, data: jobs, page, pageSize }
      };
    } catch (error) {
      context.error('Error fetching jobs:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch jobs' }
      };
    }
  }
});

// POST /api/jobs - Create job
app.http('createJob', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'jobs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = await request.json() as Partial<Job> & { employerId: string };

      if (!body.title || !body.employerId || !body.description) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Missing required fields' }
        };
      }

      const now = new Date().toISOString();
      const newJob: Job = {
        id: uuidv4(),
        employerId: body.employerId,
        title: body.title,
        company: body.company || '',
        description: body.description,
        requirements: body.requirements || [],
        salary: body.salary || { min: 0, max: 0, currency: 'USD' },
        location: body.location || 'Remote',
        remote: body.remote ?? true,
        type: body.type || 'freelance',
        applicants: [],
        status: 'open',
        createdAt: now,
        updatedAt: now
      };

      const { resource: createdJob } = await containers.jobs.items.create(newJob);

      return {
        status: 201,
        jsonBody: { success: true, data: createdJob, message: 'Job created successfully' }
      };
    } catch (error) {
      context.error('Error creating job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create job' }
      };
    }
  }
});

// POST /api/jobs/:id/apply - Apply to job
app.http('applyToJob', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'jobs/{id}/apply',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = await request.json() as { userId: string };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID required' }
        };
      }

      // Find the job
      const { resources: jobs } = await containers.jobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: jobId }]
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' }
        };
      }

      const job = jobs[0] as Job;

      if (job.applicants.includes(body.userId)) {
        return {
          status: 409,
          jsonBody: { success: false, error: 'Already applied to this job' }
        };
      }

      job.applicants.push(body.userId);
      job.updatedAt = new Date().toISOString();

      await containers.jobs.item(job.id, job.employerId).replace(job);

      return {
        status: 200,
        jsonBody: { success: true, message: 'Applied successfully' }
      };
    } catch (error) {
      context.error('Error applying to job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to apply to job' }
      };
    }
  }
});
```

---

## Azure AD B2C Authentication

### Step 1: Create Azure AD B2C Tenant

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for **"Azure AD B2C"**
3. Click **"Create a new Azure AD B2C Tenant"**
4. Fill in:
   - Organization name: `Dolphin Cove`
   - Initial domain name: `dolphincove` (will be dolphincove.onmicrosoft.com)
   - Country/Region: Your region
5. Click **Create**

### Step 2: Register Application

1. In your B2C tenant, go to **App registrations**
2. Click **New registration**
3. Fill in:
   - Name: `Dolphin Cove Web App`
   - Supported account types: **Accounts in any identity provider or organizational directory**
   - Redirect URI: 
     - Type: **Single-page application (SPA)**
     - URI: `http://localhost:5173/auth/callback` (for dev)
4. Click **Register**
5. Note down the **Application (client) ID**

### Step 3: Create User Flows

1. Go to **User flows** in your B2C tenant
2. Create **Sign up and sign in** flow:
   - Click **New user flow**
   - Select **Sign up and sign in**
   - Name: `B2C_1_signupsignin`
   - Identity providers: Email signup, Google, GitHub (optional)
   - User attributes: Email, Display Name
   - Click **Create**

### Step 4: Install MSAL in Frontend

```powershell
cd c:\Users\HP\dolphin-cove
npm install @azure/msal-browser @azure/msal-react
```

### Step 5: Create Auth Configuration

Create `src/config/authConfig.ts`:

```typescript
import { Configuration, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // From App registration
    authority: 'https://dolphincove.b2clogin.com/dolphincove.onmicrosoft.com/B2C_1_signupsignin',
    knownAuthorities: ['dolphincove.b2clogin.com'],
    redirectUri: window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const apiConfig = {
  scopes: ['https://dolphincove.onmicrosoft.com/api/access'],
  uri: '/api',
};
```

---

## Blob Storage for Images

### Create Upload Function

Create `api/src/functions/upload.ts`:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.STORAGE_CONNECTION_STRING!;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient('images');

// POST /api/upload - Upload image
app.http('uploadImage', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'No file provided' }
        };
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'File too large. Max size: 5MB' }
        };
      }

      // Generate unique filename
      const extension = file.name.split('.').pop();
      const blobName = `${uuidv4()}.${extension}`;

      // Upload to blob storage
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const arrayBuffer = await file.arrayBuffer();
      
      await blockBlobClient.uploadData(Buffer.from(arrayBuffer), {
        blobHTTPHeaders: {
          blobContentType: file.type
        }
      });

      const imageUrl = blockBlobClient.url;

      return {
        status: 200,
        jsonBody: { 
          success: true, 
          data: { url: imageUrl, filename: blobName },
          message: 'Image uploaded successfully'
        }
      };
    } catch (error) {
      context.error('Error uploading image:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to upload image' }
      };
    }
  }
});

// DELETE /api/upload/:filename - Delete image
app.http('deleteImage', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'upload/{filename}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const filename = request.params.filename;
      
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'Image deleted successfully' }
      };
    } catch (error) {
      context.error('Error deleting image:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete image' }
      };
    }
  }
});
```

---

## SignalR for Real-time Features

### Step 1: Create SignalR Functions

Create `api/src/functions/negotiate.ts`:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext, input } from '@azure/functions';

const signalRConnection = input.generic({
  type: 'signalRConnectionInfo',
  name: 'connectionInfo',
  hubName: 'dolphincove',
  connectionStringSetting: 'SIGNALR_CONNECTION_STRING',
});

// POST /api/negotiate - Get SignalR connection info
app.http('negotiate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'negotiate',
  extraInputs: [signalRConnection],
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const connectionInfo = context.extraInputs.get(signalRConnection);
    return {
      status: 200,
      jsonBody: connectionInfo
    };
  }
});
```

Create `api/src/functions/messages.ts`:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext, output } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';

const signalROutput = output.generic({
  type: 'signalR',
  name: 'signalRMessages',
  hubName: 'dolphincove',
  connectionStringSetting: 'SIGNALR_CONNECTION_STRING',
});

// POST /api/messages - Send message
app.http('sendMessage', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'messages',
  extraOutputs: [signalROutput],
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = await request.json() as {
        senderId: string;
        receiverId: string;
        content: string;
      };

      if (!body.senderId || !body.receiverId || !body.content) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Missing required fields' }
        };
      }

      // Create conversation ID (sorted to be consistent)
      const participants = [body.senderId, body.receiverId].sort();
      const conversationId = `${participants[0]}_${participants[1]}`;

      const message: Message = {
        id: uuidv4(),
        conversationId,
        senderId: body.senderId,
        receiverId: body.receiverId,
        content: body.content,
        read: false,
        createdAt: new Date().toISOString()
      };

      // Save to database
      await containers.messages.items.create(message);

      // Send real-time notification via SignalR
      context.extraOutputs.set(signalROutput, [{
        target: 'newMessage',
        userId: body.receiverId,
        arguments: [message]
      }]);

      return {
        status: 201,
        jsonBody: { success: true, data: message }
      };
    } catch (error) {
      context.error('Error sending message:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to send message' }
      };
    }
  }
});

// GET /api/messages/:conversationId - Get messages
app.http('getMessages', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'messages/{conversationId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const conversationId = request.params.conversationId;

      const { resources: messages } = await containers.messages.items
        .query({
          query: 'SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.createdAt ASC',
          parameters: [{ name: '@conversationId', value: conversationId }]
        })
        .fetchAll();

      return {
        status: 200,
        jsonBody: { success: true, data: messages }
      };
    } catch (error) {
      context.error('Error fetching messages:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch messages' }
      };
    }
  }
});
```

---

## Deployment

### Step 1: Create Static Web App Config

Create `staticwebapp.config.json` in your project root:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/images/*", "*.{css,js,png,jpg,gif,svg,ico}"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;"
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

### Step 2: Update .gitignore

Add to `.gitignore`:

```
# Azure Functions
api/local.settings.json
api/dist/
api/node_modules/

# Environment files
.env
.env.local
.env.production
```

### Step 3: Deploy via Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for **"Static Web Apps"**
3. Click **"Create"**
4. Fill in:
   - Subscription: Your subscription
   - Resource group: `dolphin-cove-rg`
   - Name: `dolphin-cove`
   - Plan type: **Free**
   - Region: Choose closest to your users
   - Source: **GitHub**
   - Sign in to GitHub and authorize
   - Organization: `Dolphin-Co-Soluation`
   - Repository: `dolphin-cove`
   - Branch: `Front-end-fixing`
5. Build Details:
   - Build Presets: **Custom**
   - App location: `/`
   - Api location: `api`
   - Output location: `dist`
6. Click **Review + Create** → **Create**

### Step 4: Configure Environment Variables

After deployment:

1. Go to your Static Web App in Azure Portal
2. Navigate to **Configuration**
3. Add these Application settings:
   - `COSMOS_CONNECTION_STRING`: Your Cosmos DB connection string
   - `COSMOS_DATABASE`: `DolphinCoveDB`
   - `STORAGE_CONNECTION_STRING`: Your Storage connection string
   - `SIGNALR_CONNECTION_STRING`: Your SignalR connection string
4. Click **Save**

---

## Environment Variables

### Local Development (api/local.settings.json)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONNECTION_STRING": "AccountEndpoint=https://dolphin-cove-db.documents.azure.com:443/;AccountKey=YOUR_KEY",
    "COSMOS_DATABASE": "DolphinCoveDB",
    "STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=dolphincovestore;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net",
    "SIGNALR_CONNECTION_STRING": "Endpoint=https://dolphin-cove-signalr.service.signalr.net;AccessKey=YOUR_KEY;Version=1.0;"
  },
  "Host": {
    "CORS": "http://localhost:5173",
    "CORSCredentials": true
  }
}
```

### Frontend (.env)

Create `.env` file:

```env
VITE_API_URL=/api
VITE_AZURE_AD_CLIENT_ID=your-client-id
VITE_AZURE_AD_AUTHORITY=https://dolphincove.b2clogin.com/dolphincove.onmicrosoft.com/B2C_1_signupsignin
```

---

## Testing

### Test Locally

```powershell
# Terminal 1: Start API
cd c:\Users\HP\dolphin-cove\api
npm run start

# Terminal 2: Start Frontend
cd c:\Users\HP\dolphin-cove
npm run dev
```

### Test API Endpoints

Using PowerShell:

```powershell
# Get users
Invoke-RestMethod -Uri "http://localhost:7071/api/users" -Method GET

# Create user
$body = @{
  email = "test@example.com"
  username = "testuser"
  displayName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7071/api/users" -Method POST -Body $body -ContentType "application/json"

# Get posts
Invoke-RestMethod -Uri "http://localhost:7071/api/posts" -Method GET
```

Or using curl:

```bash
# Get users
curl http://localhost:7071/api/users

# Create user
curl -X POST http://localhost:7071/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","displayName":"Test User"}'
```

---

## Cost Estimation

| Service | Free Tier | Estimated Monthly Cost |
|---------|-----------|----------------------|
| Azure Static Web Apps | ✅ Free | $0 |
| Azure Functions | 1M executions free | $0-5 |
| Azure Cosmos DB | 1000 RU/s free | $0 |
| Azure Blob Storage | 5GB free | $0-2 |
| Azure AD B2C | 50,000 MAU free | $0 |
| Azure SignalR | 20 concurrent free | $0 |

**Total estimated cost: $0-10/month** for a small to medium app

---

## Next Steps

After completing this setup:

1. [ ] **Update frontend contexts** to use real API calls
2. [ ] **Implement authentication** in the frontend
3. [ ] **Add error handling** and loading states
4. [ ] **Set up monitoring** with Application Insights
5. [ ] **Configure custom domain** (optional)
6. [ ] **Set up CI/CD** with GitHub Actions

---

## Helpful Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure AD B2C Documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/)
- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `local.settings.json` has correct CORS settings
- Ensure frontend URL is whitelisted

**2. Cosmos DB Connection Failed**
- Verify connection string is correct
- Check firewall settings in Azure Portal

**3. Functions Not Loading**
- Run `npm install` in api folder
- Run `npm run build` to compile TypeScript
- Check for syntax errors in functions

**4. Authentication Issues**
- Verify B2C tenant configuration
- Check redirect URIs match exactly
- Clear browser cache/cookies

---

**Happy Coding! 🐬**

*Dolphin Cove - Where Freelancers Make Waves*
