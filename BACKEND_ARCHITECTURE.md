# 🐬 Dolphin Cove - Backend Architecture & Code Structure

Complete technical documentation for the Dolphin Cove backend system.

---

## 📊 System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                           DOLPHIN COVE SYSTEM ARCHITECTURE                        ║
╚══════════════════════════════════════════════════════════════════════════════════╝

                                    ┌─────────────────┐
                                    │    USERS        │
                                    │  (Web Browser)  │
                                    └────────┬────────┘
                                             │
                                             │ HTTPS (Port 443)
                                             ▼
╔══════════════════════════════════════════════════════════════════════════════════╗
║                              AZURE STATIC WEB APPS                                ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │                         FRONTEND (React + Vite)                            │  ║
║  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │  ║
║  │  │   Landing    │ │    Home      │ │   Profile    │ │   Messages   │      │  ║
║  │  │    Page      │ │    Feed      │ │    Page      │ │    Page      │      │  ║
║  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │  ║
║  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │  ║
║  │  │    Jobs      │ │   Network    │ │   Settings   │ │ Notifications│      │  ║
║  │  │    Page      │ │    Page      │ │    Page      │ │    Page      │      │  ║
║  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                        │                                          ║
║                                        │ API Calls (/api/*)                       ║
║                                        ▼                                          ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │                      API LAYER (Azure Functions)                           │  ║
║  │                                                                            │  ║
║  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │  ║
║  │  │/api/users   │ │/api/posts   │ │/api/jobs    │ │/api/messages│          │  ║
║  │  │             │ │             │ │             │ │             │          │  ║
║  │  │• GET /      │ │• GET /      │ │• GET /      │ │• GET /:id   │          │  ║
║  │  │• GET /:id   │ │• GET /:id   │ │• GET /:id   │ │• POST /     │          │  ║
║  │  │• POST /     │ │• POST /     │ │• POST /     │ │• PUT /:id   │          │  ║
║  │  │• PUT /:id   │ │• POST /like │ │• POST /apply│ │             │          │  ║
║  │  │• DELETE /:id│ │• DELETE /:id│ │• PUT /:id   │ │             │          │  ║
║  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │  ║
║  │                                                                            │  ║
║  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                          │  ║
║  │  │/api/upload  │ │/api/auth    │ │/api/negotiate│                         │  ║
║  │  │             │ │             │ │ (SignalR)   │                          │  ║
║  │  │• POST /     │ │• POST /login│ │             │                          │  ║
║  │  │• DELETE /:id│ │• POST /reg  │ │• POST /     │                          │  ║
║  │  └─────────────┘ └─────────────┘ └─────────────┘                          │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
                    │                    │                    │
                    │                    │                    │
         ┌──────────┴──────────┐         │         ┌─────────┴──────────┐
         │                     │         │         │                    │
         ▼                     ▼         ▼         ▼                    ▼
╔═══════════════════╗ ╔═══════════════════╗ ╔═══════════════════╗ ╔═══════════════════╗
║   AZURE AD B2C    ║ ║   COSMOS DB       ║ ║  BLOB STORAGE     ║ ║    SIGNALR        ║
║                   ║ ║                   ║ ║                   ║ ║                   ║
║ ┌───────────────┐ ║ ║ ┌───────────────┐ ║ ║ ┌───────────────┐ ║ ║ ┌───────────────┐ ║
║ │ User Flows    │ ║ ║ │   Users       │ ║ ║ │   avatars/    │ ║ ║ │  Real-time    │ ║
║ │               │ ║ ║ │   Container   │ ║ ║ │               │ ║ ║ │  Messages     │ ║
║ │ • Sign Up     │ ║ ║ ├───────────────┤ ║ ║ ├───────────────┤ ║ ║ ├───────────────┤ ║
║ │ • Sign In     │ ║ ║ │   Posts       │ ║ ║ │   posts/      │ ║ ║ │  Live         │ ║
║ │ • Password    │ ║ ║ │   Container   │ ║ ║ │               │ ║ ║ │  Notifications│ ║
║ │   Reset       │ ║ ║ ├───────────────┤ ║ ║ ├───────────────┤ ║ ║ ├───────────────┤ ║
║ │               │ ║ ║ │   Messages    │ ║ ║ │   documents/  │ ║ ║ │  Typing       │ ║
║ │ Social Login: │ ║ ║ │   Container   │ ║ ║ │               │ ║ ║ │  Indicators   │ ║
║ │ • Google      │ ║ ║ ├───────────────┤ ║ ║ └───────────────┘ ║ ║ └───────────────┘ ║
║ │ • GitHub      │ ║ ║ │   Jobs        │ ║ ║                   ║ ║                   ║
║ │ • LinkedIn    │ ║ ║ │   Container   │ ║ ║                   ║ ║                   ║
║ └───────────────┘ ║ ║ └───────────────┘ ║ ║                   ║ ║                   ║
╚═══════════════════╝ ╚═══════════════════╝ ╚═══════════════════╝ ╚═══════════════════╝
```

---

## 📁 Complete Project Structure

```
dolphin-cove/
│
├── 📁 src/                              # Frontend React Application
│   ├── 📁 assets/                       # Static assets
│   │   ├── Dolphin-cove.png
│   │   └── react.svg
│   │
│   ├── 📁 components/                   # Reusable UI components
│   │   ├── 📁 CreatePost/
│   │   │   ├── CreatePost.tsx
│   │   │   ├── CreatePost.css
│   │   │   └── index.ts
│   │   ├── 📁 Feed/
│   │   │   ├── Feed.tsx
│   │   │   ├── Feed.css
│   │   │   └── index.ts
│   │   ├── 📁 Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.css
│   │   │   └── index.ts
│   │   ├── 📁 PostCard/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostCard.css
│   │   │   └── index.ts
│   │   ├── 📁 Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Sidebar.css
│   │   │   └── index.ts
│   │   ├── 📁 RightSidebar/
│   │   │   ├── RightSidebar.tsx
│   │   │   ├── RightSidebar.css
│   │   │   └── index.ts
│   │   ├── 📁 Toast/
│   │   │   ├── Toast.tsx
│   │   │   ├── Toast.css
│   │   │   └── index.ts
│   │   └── index.ts                     # Barrel export
│   │
│   ├── 📁 context/                      # React Context providers
│   │   ├── AuthContext.tsx              # Authentication state
│   │   ├── PostContext.tsx              # Posts state management
│   │   ├── ThemeContext.tsx             # Light/Dark theme
│   │   ├── ToastContext.tsx             # Toast notifications
│   │   └── index.ts
│   │
│   ├── 📁 pages/                        # Page components
│   │   ├── 📁 Auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── Auth.css
│   │   │   └── index.ts
│   │   ├── 📁 Home/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.css
│   │   │   └── index.ts
│   │   ├── 📁 Profile/
│   │   │   ├── Profile.tsx
│   │   │   ├── Profile.css
│   │   │   └── index.ts
│   │   ├── 📁 Jobs/
│   │   │   ├── Jobs.tsx
│   │   │   ├── Jobs.css
│   │   │   └── index.ts
│   │   ├── 📁 Messages/
│   │   │   ├── Messages.tsx
│   │   │   ├── Messages.css
│   │   │   └── index.ts
│   │   ├── 📁 Network/
│   │   │   ├── Network.tsx
│   │   │   ├── Network.css
│   │   │   └── index.ts
│   │   ├── 📁 Settings/
│   │   │   ├── Settings.tsx
│   │   │   ├── Settings.css
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── 📁 services/                     # API service layer (NEW)
│   │   ├── api.ts                       # Base API client
│   │   ├── authService.ts               # Auth API calls
│   │   ├── userService.ts               # User API calls
│   │   ├── postService.ts               # Post API calls
│   │   ├── jobService.ts                # Job API calls
│   │   ├── messageService.ts            # Message API calls
│   │   ├── uploadService.ts             # File upload API
│   │   └── index.ts
│   │
│   ├── 📁 hooks/                        # Custom React hooks (NEW)
│   │   ├── useApi.ts                    # API call hook
│   │   ├── useAuth.ts                   # Auth hook
│   │   ├── useSignalR.ts                # Real-time hook
│   │   └── index.ts
│   │
│   ├── 📁 config/                       # Configuration (NEW)
│   │   ├── authConfig.ts                # Azure AD B2C config
│   │   ├── apiConfig.ts                 # API endpoints config
│   │   └── index.ts
│   │
│   ├── 📁 types/                        # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
│
├── 📁 api/                              # Azure Functions Backend (NEW)
│   ├── 📁 src/
│   │   ├── 📁 functions/                # API endpoints
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   ├── jobs.ts
│   │   │   ├── messages.ts
│   │   │   ├── upload.ts
│   │   │   ├── negotiate.ts
│   │   │   └── auth.ts
│   │   │
│   │   ├── 📁 lib/                      # Shared utilities
│   │   │   ├── database.ts              # Cosmos DB client
│   │   │   ├── storage.ts               # Blob storage client
│   │   │   ├── auth.ts                  # Auth helpers
│   │   │   └── validators.ts            # Input validation
│   │   │
│   │   ├── 📁 types/                    # Backend types
│   │   │   └── index.ts
│   │   │
│   │   └── 📁 middleware/               # Custom middleware
│   │       ├── authMiddleware.ts
│   │       └── errorHandler.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── host.json
│   └── local.settings.json              # ⚠️ Don't commit!
│
├── 📁 shared/                           # Shared between frontend & backend
│   └── types.ts                         # Shared TypeScript types
│
├── 📁 public/                           # Public static files
│   └── vite.svg
│
├── 📁 docs/                             # Documentation (NEW)
│   ├── API.md                           # API documentation
│   ├── DEPLOYMENT.md                    # Deployment guide
│   └── CONTRIBUTING.md                  # Contribution guide
│
├── .env                                 # Environment variables (frontend)
├── .env.example                         # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── staticwebapp.config.json             # Azure Static Web Apps config
├── BACKEND_SETUP_GUIDE.md               # Setup instructions
├── BACKEND_ARCHITECTURE.md              # This file
└── README.md
```

---

## 🔗 Data Flow Diagrams

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐                                              ┌──────────────────┐
    │   User   │                                              │   Azure AD B2C   │
    └────┬─────┘                                              └────────┬─────────┘
         │                                                             │
         │  1. Click "Login" / "Register"                              │
         │ ─────────────────────────────────────────────────────────► │
         │                                                             │
         │  2. Redirect to B2C login page                              │
         │ ◄───────────────────────────────────────────────────────── │
         │                                                             │
         │  3. Enter credentials / Social login                        │
         │ ─────────────────────────────────────────────────────────► │
         │                                                             │
         │  4. Validate credentials                                    │
         │                                              ┌──────────────┤
         │                                              │   Validate   │
         │                                              └──────────────┤
         │                                                             │
         │  5. Return JWT token + ID token                             │
         │ ◄───────────────────────────────────────────────────────── │
         │                                                             │
    ┌────┴─────┐                                                       │
    │ Frontend │                                                       │
    └────┬─────┘                                                       │
         │                                                             │
         │  6. Store token in localStorage                             │
         │  7. Set auth header for API calls                           │
         │                                                             │
         │         ┌─────────────────────────┐                         │
         │ ──────► │   API (Azure Functions) │                         │
         │         └────────────┬────────────┘                         │
         │                      │                                      │
         │         8. Validate JWT token                               │
         │                      │                                      │
         │         9. Return protected data                            │
         │ ◄────────────────────┘                                      │
         │                                                             │
    ┌────┴─────┐                                                       │
    │   User   │                                                       │
    │ (Logged) │                                                       │
    └──────────┘                                                       │
```

### Post Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              POST CREATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

    User                 Frontend              API                 Cosmos DB       Blob Storage
     │                      │                   │                      │                │
     │  1. Write post       │                   │                      │                │
     │ ──────────────────►  │                   │                      │                │
     │                      │                   │                      │                │
     │  2. Attach image     │                   │                      │                │
     │ ──────────────────►  │                   │                      │                │
     │                      │                   │                      │                │
     │  3. Click "Post"     │                   │                      │                │
     │ ──────────────────►  │                   │                      │                │
     │                      │                   │                      │                │
     │                      │  4. Upload image  │                      │                │
     │                      │  POST /api/upload │                      │                │
     │                      │ ────────────────► │                      │                │
     │                      │                   │                      │                │
     │                      │                   │  5. Store image      │                │
     │                      │                   │ ──────────────────────────────────►  │
     │                      │                   │                      │                │
     │                      │                   │  6. Return image URL │                │
     │                      │                   │ ◄──────────────────────────────────  │
     │                      │                   │                      │                │
     │                      │  7. Return URL    │                      │                │
     │                      │ ◄──────────────── │                      │                │
     │                      │                   │                      │                │
     │                      │  8. Create post   │                      │                │
     │                      │  POST /api/posts  │                      │                │
     │                      │  {content, image} │                      │                │
     │                      │ ────────────────► │                      │                │
     │                      │                   │                      │                │
     │                      │                   │  9. Save post        │                │
     │                      │                   │ ──────────────────►  │                │
     │                      │                   │                      │                │
     │                      │                   │  10. Return post     │                │
     │                      │                   │ ◄──────────────────  │                │
     │                      │                   │                      │                │
     │                      │  11. Return post  │                      │                │
     │                      │ ◄──────────────── │                      │                │
     │                      │                   │                      │                │
     │  12. Show success    │                   │                      │                │
     │ ◄──────────────────  │                   │                      │                │
     │                      │                   │                      │                │
```

### Real-time Messaging Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REAL-TIME MESSAGING FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

   User A              Frontend A           SignalR            Frontend B           User B
     │                     │                   │                   │                  │
     │  1. Open Messages   │                   │                   │                  │
     │ ─────────────────►  │                   │                   │                  │
     │                     │                   │                   │                  │
     │                     │  2. Connect       │                   │                  │
     │                     │  POST /negotiate  │                   │                  │
     │                     │ ────────────────► │                   │                  │
     │                     │                   │                   │                  │
     │                     │  3. WebSocket     │                   │                  │
     │                     │     Connected     │                   │                  │
     │                     │ ◄───────────────► │                   │                  │
     │                     │                   │                   │                  │
     │                     │                   │  4. WebSocket     │                  │
     │                     │                   │     Connected     │                  │
     │                     │                   │ ◄───────────────► │                  │
     │                     │                   │                   │                  │
     │  5. Type message    │                   │                   │                  │
     │ ─────────────────►  │                   │                   │                  │
     │                     │                   │                   │                  │
     │                     │  6. Send typing   │                   │                  │
     │                     │     indicator     │                   │                  │
     │                     │ ────────────────► │                   │                  │
     │                     │                   │                   │                  │
     │                     │                   │  7. Broadcast     │                  │
     │                     │                   │     "User typing" │                  │
     │                     │                   │ ────────────────► │                  │
     │                     │                   │                   │                  │
     │                     │                   │                   │  8. Show typing  │
     │                     │                   │                   │ ───────────────► │
     │                     │                   │                   │                  │
     │  9. Send message    │                   │                   │                  │
     │ ─────────────────►  │                   │                   │                  │
     │                     │                   │                   │                  │
     │                     │  10. POST message │                   │                  │
     │                     │ ────────────────► │                   │                  │
     │                     │                   │                   │                  │
     │                     │  ┌────────────────┴────────────────┐  │                  │
     │                     │  │         Save to Cosmos DB       │  │                  │
     │                     │  └────────────────┬────────────────┘  │                  │
     │                     │                   │                   │                  │
     │                     │                   │  11. Broadcast    │                  │
     │                     │                   │      message      │                  │
     │                     │                   │ ────────────────► │                  │
     │                     │                   │                   │                  │
     │                     │                   │                   │  12. Show msg    │
     │                     │                   │                   │ ───────────────► │
     │                     │                   │                   │                  │
```

---

## 💾 Database Schema

### Cosmos DB Container Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              COSMOS DB SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

Database: DolphinCoveDB
├── Container: Users
│   ├── Partition Key: /id
│   └── Documents:
│       {
│         "id": "uuid",
│         "email": "user@example.com",
│         "username": "johndoe",
│         "displayName": "John Doe",
│         "avatar": "https://storage.../avatar.jpg",
│         "bio": "Full-stack developer...",
│         "skills": ["React", "Node.js", "TypeScript"],
│         "isFreelancer": true,
│         "hourlyRate": 75,
│         "location": "New York, USA",
│         "website": "https://johndoe.dev",
│         "connections": ["user-id-1", "user-id-2"],
│         "followers": ["user-id-3"],
│         "following": ["user-id-4"],
│         "createdAt": "2024-01-01T00:00:00Z",
│         "updatedAt": "2024-01-15T00:00:00Z"
│       }
│
├── Container: Posts
│   ├── Partition Key: /authorId
│   └── Documents:
│       {
│         "id": "uuid",
│         "authorId": "user-uuid",
│         "content": "Just launched my new project!",
│         "images": ["https://storage.../image1.jpg"],
│         "isFreelancePost": false,
│         "freelanceDetails": null,
│         "likes": ["user-id-1", "user-id-2"],
│         "commentCount": 5,
│         "createdAt": "2024-01-15T10:30:00Z",
│         "updatedAt": "2024-01-15T10:30:00Z"
│       }
│       
│       // Freelance Post Example:
│       {
│         "id": "uuid",
│         "authorId": "user-uuid",
│         "content": "Looking for a React developer...",
│         "images": [],
│         "isFreelancePost": true,
│         "freelanceDetails": {
│           "title": "React Developer Needed",
│           "budget": "$500-$1000",
│           "deadline": "2024-02-01",
│           "skills": ["React", "TypeScript"],
│           "projectType": "fixed"
│         },
│         "likes": [],
│         "commentCount": 0,
│         "createdAt": "2024-01-15T10:30:00Z",
│         "updatedAt": "2024-01-15T10:30:00Z"
│       }
│
├── Container: Messages
│   ├── Partition Key: /conversationId
│   └── Documents:
│       {
│         "id": "uuid",
│         "conversationId": "user1_user2",
│         "senderId": "user1-uuid",
│         "receiverId": "user2-uuid",
│         "content": "Hey, I'm interested in your project!",
│         "read": false,
│         "createdAt": "2024-01-15T11:00:00Z"
│       }
│
├── Container: Jobs
│   ├── Partition Key: /employerId
│   └── Documents:
│       {
│         "id": "uuid",
│         "employerId": "user-uuid",
│         "title": "Senior React Developer",
│         "company": "TechCorp Inc.",
│         "description": "We are looking for...",
│         "requirements": ["5+ years React", "TypeScript"],
│         "salary": {
│           "min": 80000,
│           "max": 120000,
│           "currency": "USD"
│         },
│         "location": "Remote",
│         "remote": true,
│         "type": "full-time",
│         "applicants": ["user-id-1", "user-id-2"],
│         "status": "open",
│         "createdAt": "2024-01-10T00:00:00Z",
│         "updatedAt": "2024-01-15T00:00:00Z"
│       }
│
└── Container: Comments
    ├── Partition Key: /postId
    └── Documents:
        {
          "id": "uuid",
          "postId": "post-uuid",
          "authorId": "user-uuid",
          "content": "Great work!",
          "likes": ["user-id-1"],
          "createdAt": "2024-01-15T12:00:00Z"
        }
```

---

## 📝 Complete API Code

### 1. Database Client (`api/src/lib/database.ts`)

```typescript
import { CosmosClient, Database, Container } from '@azure/cosmos';

// Get connection string from environment
const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DATABASE || 'DolphinCoveDB';

if (!connectionString) {
  throw new Error('COSMOS_CONNECTION_STRING environment variable is required');
}

// Initialize Cosmos DB client
const client = new CosmosClient(connectionString);
const database: Database = client.database(databaseName);

// Export container references
export const containers = {
  users: database.container('Users'),
  posts: database.container('Posts'),
  messages: database.container('Messages'),
  jobs: database.container('Jobs'),
  comments: database.container('Comments'),
};

// Helper function to generate partition key
export function getPartitionKey(containerId: string, document: any): string {
  switch (containerId) {
    case 'Users':
      return document.id;
    case 'Posts':
      return document.authorId;
    case 'Messages':
      return document.conversationId;
    case 'Jobs':
      return document.employerId;
    case 'Comments':
      return document.postId;
    default:
      return document.id;
  }
}

export { database, client };
```

### 2. Storage Client (`api/src/lib/storage.ts`)

```typescript
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

const connectionString = process.env.STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error('STORAGE_CONNECTION_STRING environment variable is required');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Container clients for different types of uploads
export const storageContainers = {
  avatars: blobServiceClient.getContainerClient('avatars'),
  posts: blobServiceClient.getContainerClient('posts'),
  documents: blobServiceClient.getContainerClient('documents'),
};

// Initialize containers (create if not exists)
export async function initializeStorageContainers(): Promise<void> {
  for (const [name, container] of Object.entries(storageContainers)) {
    await container.createIfNotExists({
      access: 'blob', // Public read access for blobs
    });
    console.log(`Storage container '${name}' initialized`);
  }
}

// Helper to generate blob URL
export function getBlobUrl(containerName: string, blobName: string): string {
  const container = storageContainers[containerName as keyof typeof storageContainers];
  return container.getBlockBlobClient(blobName).url;
}
```

### 3. Shared Types (`api/src/types/index.ts`)

```typescript
// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  title?: string;
  skills: string[];
  isFreelancer: boolean;
  hourlyRate?: number;
  location?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  connections: string[];
  followers: string[];
  following: string[];
  isVerified: boolean;
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

export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  title?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// ============================================================================
// POST TYPES
// ============================================================================

export interface Post {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  isFreelancePost: boolean;
  freelanceDetails?: FreelanceDetails;
  likes: string[];
  commentCount: number;
  shares: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FreelanceDetails {
  title: string;
  budget: string;
  deadline: string;
  skills: string[];
  projectType: 'fixed' | 'hourly';
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  isFreelancePost?: boolean;
  freelanceDetails?: FreelanceDetails;
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: string[];
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string; // For nested replies
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: Attachment[];
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  attachments?: Attachment[];
}

// ============================================================================
// JOB TYPES
// ============================================================================

export interface Job {
  id: string;
  employerId: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  skills: string[];
  applicants: JobApplication[];
  status: 'open' | 'closed' | 'paused';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  userId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  skills: string[];
  deadline?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'job' | 'mention';
  title: string;
  message: string;
  data?: {
    postId?: string;
    userId?: string;
    jobId?: string;
    commentId?: string;
  };
  read: boolean;
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
  isFreelancer?: boolean;
}
```

### 4. Users API (`api/src/functions/users.ts`)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserRequest, UpdateUserRequest, ApiResponse, PaginatedResponse } from '../types';

// ============================================================================
// GET /api/users - Get all users with pagination and filtering
// ============================================================================
app.http('getUsers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      // Parse query parameters
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 100);
      const search = request.query.get('search');
      const isFreelancer = request.query.get('isFreelancer');
      const skills = request.query.get('skills')?.split(',');
      const offset = (page - 1) * pageSize;

      // Build query
      let query = 'SELECT * FROM c WHERE 1=1';
      const parameters: { name: string; value: any }[] = [];

      if (search) {
        query += ' AND (CONTAINS(LOWER(c.displayName), LOWER(@search)) OR CONTAINS(LOWER(c.username), LOWER(@search)))';
        parameters.push({ name: '@search', value: search });
      }

      if (isFreelancer !== null && isFreelancer !== undefined) {
        query += ' AND c.isFreelancer = @isFreelancer';
        parameters.push({ name: '@isFreelancer', value: isFreelancer === 'true' });
      }

      if (skills && skills.length > 0) {
        // Filter users who have at least one of the specified skills
        const skillConditions = skills.map((_, i) => `ARRAY_CONTAINS(c.skills, @skill${i})`).join(' OR ');
        query += ` AND (${skillConditions})`;
        skills.forEach((skill, i) => {
          parameters.push({ name: `@skill${i}`, value: skill.trim() });
        });
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.users.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add pagination
      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      // Execute query
      const { resources: users } = await containers.users.items
        .query({ query, parameters })
        .fetchAll();

      // Remove sensitive data
      const safeUsers = users.map(({ email, ...user }) => user);

      const response: PaginatedResponse<Partial<User>> = {
        success: true,
        data: safeUsers,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + users.length < total,
          hasPrev: page > 1,
        },
      };

      return { status: 200, jsonBody: response };
    } catch (error) {
      context.error('Error fetching users:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch users' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/users/:id - Get user by ID
// ============================================================================
app.http('getUserById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      const { resource: user } = await containers.users.item(id, id).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      // Remove sensitive data
      const { email, ...safeUser } = user;

      return {
        status: 200,
        jsonBody: { success: true, data: safeUser } as ApiResponse<Partial<User>>,
      };
    } catch (error: any) {
      if (error.code === 404) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }
      context.error('Error fetching user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/users/username/:username - Get user by username
// ============================================================================
app.http('getUserByUsername', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/username/{username}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const username = request.params.username;

      if (!username) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Username is required' } as ApiResponse,
        };
      }

      const { resources: users } = await containers.users.items
        .query({
          query: 'SELECT * FROM c WHERE c.username = @username',
          parameters: [{ name: '@username', value: username.toLowerCase() }],
        })
        .fetchAll();

      if (users.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      // Remove sensitive data
      const { email, ...safeUser } = users[0];

      return {
        status: 200,
        jsonBody: { success: true, data: safeUser } as ApiResponse<Partial<User>>,
      };
    } catch (error) {
      context.error('Error fetching user by username:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/users - Create new user
// ============================================================================
app.http('createUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as CreateUserRequest;

      // Validate required fields
      if (!body.email || !body.username || !body.displayName) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: 'Missing required fields: email, username, and displayName are required',
          } as ApiResponse,
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Invalid email format' } as ApiResponse,
        };
      }

      // Validate username (alphanumeric, underscores, 3-30 chars)
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(body.username)) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores',
          } as ApiResponse,
        };
      }

      // Check if email or username already exists
      const { resources: existingUsers } = await containers.users.items
        .query({
          query: 'SELECT * FROM c WHERE LOWER(c.email) = LOWER(@email) OR LOWER(c.username) = LOWER(@username)',
          parameters: [
            { name: '@email', value: body.email },
            { name: '@username', value: body.username },
          ],
        })
        .fetchAll();

      if (existingUsers.length > 0) {
        const existing = existingUsers[0];
        if (existing.email.toLowerCase() === body.email.toLowerCase()) {
          return {
            status: 409,
            jsonBody: { success: false, error: 'Email already exists' } as ApiResponse,
          };
        }
        return {
          status: 409,
          jsonBody: { success: false, error: 'Username already taken' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: uuidv4(),
        email: body.email.toLowerCase(),
        username: body.username.toLowerCase(),
        displayName: body.displayName,
        skills: [],
        isFreelancer: body.isFreelancer || false,
        connections: [],
        followers: [],
        following: [],
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      };

      const { resource: createdUser } = await containers.users.items.create(newUser);

      // Remove sensitive data from response
      const { email, ...safeUser } = createdUser!;

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: safeUser,
          message: 'User created successfully',
        } as ApiResponse<Partial<User>>,
      };
    } catch (error) {
      context.error('Error creating user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/users/:id - Update user
// ============================================================================
app.http('updateUser', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;
      const body = (await request.json()) as UpdateUserRequest;

      // Get existing user
      const { resource: existingUser } = await containers.users.item(id, id).read<User>();

      if (!existingUser) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      // Update user (only allowed fields)
      const updatedUser: User = {
        ...existingUser,
        displayName: body.displayName ?? existingUser.displayName,
        bio: body.bio ?? existingUser.bio,
        title: body.title ?? existingUser.title,
        skills: body.skills ?? existingUser.skills,
        hourlyRate: body.hourlyRate ?? existingUser.hourlyRate,
        location: body.location ?? existingUser.location,
        website: body.website ?? existingUser.website,
        socialLinks: body.socialLinks ?? existingUser.socialLinks,
        updatedAt: new Date().toISOString(),
      };

      const { resource } = await containers.users.item(id, id).replace(updatedUser);

      // Remove sensitive data
      const { email, ...safeUser } = resource!;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: safeUser,
          message: 'User updated successfully',
        } as ApiResponse<Partial<User>>,
      };
    } catch (error: any) {
      if (error.code === 404) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }
      context.error('Error updating user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/users/:id/follow - Follow/Unfollow user
// ============================================================================
app.http('followUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/{id}/follow',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const targetUserId = request.params.id;
      const body = (await request.json()) as { userId: string };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'userId is required' } as ApiResponse,
        };
      }

      if (body.userId === targetUserId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Cannot follow yourself' } as ApiResponse,
        };
      }

      // Get both users
      const [currentUserResult, targetUserResult] = await Promise.all([
        containers.users.item(body.userId, body.userId).read<User>(),
        containers.users.item(targetUserId, targetUserId).read<User>(),
      ]);

      if (!currentUserResult.resource || !targetUserResult.resource) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const currentUser = currentUserResult.resource;
      const targetUser = targetUserResult.resource;

      const isFollowing = currentUser.following.includes(targetUserId);

      if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter((id) => id !== targetUserId);
        targetUser.followers = targetUser.followers.filter((id) => id !== body.userId);
      } else {
        // Follow
        currentUser.following.push(targetUserId);
        targetUser.followers.push(body.userId);
      }

      currentUser.updatedAt = new Date().toISOString();
      targetUser.updatedAt = new Date().toISOString();

      // Update both users
      await Promise.all([
        containers.users.item(body.userId, body.userId).replace(currentUser),
        containers.users.item(targetUserId, targetUserId).replace(targetUser),
      ]);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length,
          },
          message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error following user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to follow/unfollow user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/users/:id - Delete user
// ============================================================================
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
        jsonBody: { success: true, message: 'User deleted successfully' } as ApiResponse,
      };
    } catch (error: any) {
      if (error.code === 404) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }
      context.error('Error deleting user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete user' } as ApiResponse,
      };
    }
  },
});
```

### 5. Posts API (`api/src/functions/posts.ts`)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { Post, CreatePostRequest, ApiResponse, PaginatedResponse, User } from '../types';

// ============================================================================
// GET /api/posts - Get all posts with pagination
// ============================================================================
app.http('getPosts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const authorId = request.query.get('authorId');
      const isFreelance = request.query.get('isFreelance');
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM c WHERE 1=1';
      const parameters: { name: string; value: any }[] = [];

      if (authorId) {
        query += ' AND c.authorId = @authorId';
        parameters.push({ name: '@authorId', value: authorId });
      }

      if (isFreelance !== null && isFreelance !== undefined) {
        query += ' AND c.isFreelancePost = @isFreelance';
        parameters.push({ name: '@isFreelance', value: isFreelance === 'true' });
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.posts.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add pagination
      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: posts } = await containers.posts.items
        .query({ query, parameters })
        .fetchAll();

      // Fetch author details for each post
      const authorIds = [...new Set(posts.map((p: Post) => p.authorId))];
      const authorsMap: Record<string, Partial<User>> = {};

      if (authorIds.length > 0) {
        const authorsQuery = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified FROM c WHERE c.id IN (${authorIds.map((_, i) => `@id${i}`).join(',')})`;
        const authorsParams = authorIds.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: authors } = await containers.users.items
          .query({ query: authorsQuery, parameters: authorsParams })
          .fetchAll();

        authors.forEach((author: any) => {
          authorsMap[author.id] = author;
        });
      }

      // Combine posts with author data
      const postsWithAuthors = posts.map((post: Post) => ({
        ...post,
        author: authorsMap[post.authorId] || null,
      }));

      const response: PaginatedResponse<Post & { author: Partial<User> | null }> = {
        success: true,
        data: postsWithAuthors,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + posts.length < total,
          hasPrev: page > 1,
        },
      };

      return { status: 200, jsonBody: response };
    } catch (error) {
      context.error('Error fetching posts:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch posts' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/posts/:id - Get post by ID
// ============================================================================
app.http('getPostById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;

      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Fetch author details
      const { resource: author } = await containers.users.item(post.authorId, post.authorId).read<User>();

      const postWithAuthor = {
        ...post,
        author: author
          ? {
              id: author.id,
              username: author.username,
              displayName: author.displayName,
              avatar: author.avatar,
              isVerified: author.isVerified,
            }
          : null,
      };

      return {
        status: 200,
        jsonBody: { success: true, data: postWithAuthor } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/posts - Create new post
// ============================================================================
app.http('createPost', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as CreatePostRequest & { authorId: string };

      if (!body.content?.trim()) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Content is required' } as ApiResponse,
        };
      }

      if (!body.authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      // Validate content length
      if (body.content.length > 5000) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Content exceeds maximum length of 5000 characters' } as ApiResponse,
        };
      }

      // Validate freelance details if it's a freelance post
      if (body.isFreelancePost && !body.freelanceDetails?.title) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelance posts require a title' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const newPost: Post = {
        id: uuidv4(),
        authorId: body.authorId,
        content: body.content.trim(),
        images: body.images || [],
        isFreelancePost: body.isFreelancePost || false,
        freelanceDetails: body.freelanceDetails,
        likes: [],
        commentCount: 0,
        shares: 0,
        isEdited: false,
        createdAt: now,
        updatedAt: now,
      };

      const { resource: createdPost } = await containers.posts.items.create(newPost);

      // Fetch author details
      const { resource: author } = await containers.users.item(body.authorId, body.authorId).read<User>();

      const postWithAuthor = {
        ...createdPost,
        author: author
          ? {
              id: author.id,
              username: author.username,
              displayName: author.displayName,
              avatar: author.avatar,
              isVerified: author.isVerified,
            }
          : null,
      };

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: postWithAuthor,
          message: 'Post created successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error creating post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/posts/:id/like - Like/Unlike post
// ============================================================================
app.http('likePost', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/like',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const body = (await request.json()) as { userId: string };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;
      const isLiked = post.likes.includes(body.userId);

      if (isLiked) {
        post.likes = post.likes.filter((id) => id !== body.userId);
      } else {
        post.likes.push(body.userId);
      }

      post.updatedAt = new Date().toISOString();

      await containers.posts.item(post.id, post.authorId).replace(post);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            isLiked: !isLiked,
            likesCount: post.likes.length,
          },
          message: isLiked ? 'Post unliked' : 'Post liked',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error liking post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to like post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/posts/:id - Update post
// ============================================================================
app.http('updatePost', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const body = (await request.json()) as Partial<CreatePostRequest> & { authorId: string };

      if (!body.authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Verify ownership
      if (post.authorId !== body.authorId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Not authorized to edit this post' } as ApiResponse,
        };
      }

      // Update post
      const updatedPost: Post = {
        ...post,
        content: body.content?.trim() ?? post.content,
        images: body.images ?? post.images,
        freelanceDetails: body.freelanceDetails ?? post.freelanceDetails,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      };

      const { resource } = await containers.posts.item(post.id, post.authorId).replace(updatedPost);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: resource,
          message: 'Post updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/posts/:id - Delete post
// ============================================================================
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
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      // Find the post first to verify ownership
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      if (post.authorId !== authorId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Not authorized to delete this post' } as ApiResponse,
        };
      }

      await containers.posts.item(postId, authorId).delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'Post deleted successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error deleting post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete post' } as ApiResponse,
      };
    }
  },
});
```

### 6. File Upload API (`api/src/functions/upload.ts`)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../types';

const connectionString = process.env.STORAGE_CONNECTION_STRING!;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Allowed file types and their MIME types
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Max file sizes (in bytes)
const MAX_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
};

// ============================================================================
// POST /api/upload - Upload file
// ============================================================================
app.http('uploadFile', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const fileType = formData.get('type') as string || 'image';
      const folder = formData.get('folder') as string || 'general';

      if (!file) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'No file provided' } as ApiResponse,
        };
      }

      // Validate file type
      const allowedMimeTypes = ALLOWED_TYPES[fileType] || ALLOWED_TYPES.image;
      if (!allowedMimeTypes.includes(file.type)) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
          } as ApiResponse,
        };
      }

      // Validate file size
      const maxSize = MAX_SIZES[fileType] || MAX_SIZES.image;
      if (file.size > maxSize) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
          } as ApiResponse,
        };
      }

      // Determine container based on file type
      const containerName = fileType === 'document' ? 'documents' : 'images';
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Ensure container exists
      await containerClient.createIfNotExists({ access: 'blob' });

      // Generate unique filename
      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const blobName = `${folder}/${uuidv4()}.${extension}`;

      // Upload file
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const arrayBuffer = await file.arrayBuffer();

      await blockBlobClient.uploadData(Buffer.from(arrayBuffer), {
        blobHTTPHeaders: {
          blobContentType: file.type,
          blobCacheControl: 'max-age=31536000', // Cache for 1 year
        },
      });

      const imageUrl = blockBlobClient.url;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            url: imageUrl,
            filename: blobName,
            originalName: file.name,
            size: file.size,
            type: file.type,
          },
          message: 'File uploaded successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error uploading file:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to upload file' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/upload/:filename - Delete file
// ============================================================================
app.http('deleteFile', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'upload/{*filename}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const filename = request.params.filename;
      const containerName = request.query.get('container') || 'images';

      if (!filename) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Filename is required' } as ApiResponse,
        };
      }

      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      const exists = await blockBlobClient.exists();
      if (!exists) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'File not found' } as ApiResponse,
        };
      }

      await blockBlobClient.delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'File deleted successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error deleting file:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete file' } as ApiResponse,
      };
    }
  },
});
```

---

## 🌐 Frontend Service Layer

### API Client (`src/services/api.ts`)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...init.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }

  async uploadFile(file: File, folder: string = 'general'): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.data;
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
```

### User Service (`src/services/userService.ts`)

```typescript
import api from './api';
import { User, ApiResponse, PaginatedResponse } from '../types';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isFreelancer?: boolean;
  skills?: string[];
}

export const userService = {
  // Get all users with pagination
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<Partial<User>>> {
    return api.get('/users', {
      ...params,
      skills: params.skills?.join(','),
    });
  },

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<Partial<User>>> {
    return api.get(`/users/${id}`);
  },

  // Get user by username
  async getUserByUsername(username: string): Promise<ApiResponse<Partial<User>>> {
    return api.get(`/users/username/${username}`);
  },

  // Update user profile
  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<Partial<User>>> {
    return api.put(`/users/${id}`, data);
  },

  // Follow/Unfollow user
  async toggleFollow(targetUserId: string, currentUserId: string): Promise<ApiResponse<{ isFollowing: boolean; followersCount: number }>> {
    return api.post(`/users/${targetUserId}/follow`, { userId: currentUserId });
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    const result = await api.uploadFile(file, 'avatars');
    return result.url;
  },
};

export default userService;
```

### Post Service (`src/services/postService.ts`)

```typescript
import api from './api';
import { Post, CreatePostRequest, ApiResponse, PaginatedResponse, User } from '../types';

export interface GetPostsParams {
  page?: number;
  pageSize?: number;
  authorId?: string;
  isFreelance?: boolean;
}

export type PostWithAuthor = Post & { author: Partial<User> | null };

export const postService = {
  // Get all posts
  async getPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<PostWithAuthor>> {
    return api.get('/posts', params);
  },

  // Get post by ID
  async getPostById(id: string): Promise<ApiResponse<PostWithAuthor>> {
    return api.get(`/posts/${id}`);
  },

  // Create new post
  async createPost(data: CreatePostRequest & { authorId: string }): Promise<ApiResponse<PostWithAuthor>> {
    return api.post('/posts', data);
  },

  // Update post
  async updatePost(id: string, data: Partial<CreatePostRequest> & { authorId: string }): Promise<ApiResponse<Post>> {
    return api.put(`/posts/${id}`, data);
  },

  // Like/Unlike post
  async toggleLike(postId: string, userId: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
    return api.post(`/posts/${postId}/like`, { userId });
  },

  // Delete post
  async deletePost(postId: string, authorId: string): Promise<ApiResponse> {
    return api.delete(`/posts/${postId}`, { authorId });
  },

  // Upload post image
  async uploadImage(file: File): Promise<string> {
    const result = await api.uploadFile(file, 'posts');
    return result.url;
  },
};

export default postService;
```

---

## 🔐 Environment Configuration

### Frontend `.env`

```env
# API Configuration
VITE_API_URL=/api

# Azure AD B2C Configuration
VITE_AZURE_AD_CLIENT_ID=your-client-id-here
VITE_AZURE_AD_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signupsignin
VITE_AZURE_AD_REDIRECT_URI=http://localhost:5173/auth/callback

# SignalR Configuration
VITE_SIGNALR_HUB_URL=/api/negotiate

# Feature Flags
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_DARK_MODE=true
```

### Backend `api/local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    
    "COSMOS_CONNECTION_STRING": "AccountEndpoint=https://your-account.documents.azure.com:443/;AccountKey=your-key;",
    "COSMOS_DATABASE": "DolphinCoveDB",
    
    "STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;EndpointSuffix=core.windows.net",
    
    "SIGNALR_CONNECTION_STRING": "Endpoint=https://your-signalr.service.signalr.net;AccessKey=your-key;Version=1.0;",
    
    "JWT_SECRET": "your-super-secret-jwt-key-min-32-chars",
    "JWT_ISSUER": "dolphin-cove",
    "JWT_AUDIENCE": "dolphin-cove-api"
  },
  "Host": {
    "CORS": "http://localhost:5173",
    "CORSCredentials": true
  }
}
```

---

## 📚 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Users** | | |
| GET | `/api/users` | Get all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/username/:username` | Get user by username |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| POST | `/api/users/:id/follow` | Follow/Unfollow user |
| DELETE | `/api/users/:id` | Delete user |
| **Posts** | | |
| GET | `/api/posts` | Get all posts (paginated) |
| GET | `/api/posts/:id` | Get post by ID |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update post |
| POST | `/api/posts/:id/like` | Like/Unlike post |
| DELETE | `/api/posts/:id` | Delete post |
| **Jobs** | | |
| GET | `/api/jobs` | Get all jobs (paginated) |
| GET | `/api/jobs/:id` | Get job by ID |
| POST | `/api/jobs` | Create new job |
| PUT | `/api/jobs/:id` | Update job |
| POST | `/api/jobs/:id/apply` | Apply to job |
| DELETE | `/api/jobs/:id` | Delete job |
| **Messages** | | |
| GET | `/api/messages/:conversationId` | Get conversation messages |
| POST | `/api/messages` | Send message |
| PUT | `/api/messages/:id/read` | Mark message as read |
| **Upload** | | |
| POST | `/api/upload` | Upload file |
| DELETE | `/api/upload/:filename` | Delete file |
| **SignalR** | | |
| POST | `/api/negotiate` | Get SignalR connection |

---

## 🎯 Next Steps

1. **Set up Azure Resources** - Follow `BACKEND_SETUP_GUIDE.md`
2. **Create API folder** - Copy code from this document
3. **Install dependencies** - Run `npm install` in api folder
4. **Configure environment** - Add connection strings
5. **Test locally** - Run `npm run start` in api folder
6. **Deploy** - Push to GitHub, Azure Static Web Apps auto-deploys

---

**Happy Coding! 🐬**

*Dolphin Cove - Where Freelancers Make Waves*
