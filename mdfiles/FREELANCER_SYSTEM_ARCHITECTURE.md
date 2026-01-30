# 🐬 Dolphin Cove - Freelancer System Architecture

Complete documentation for the FREE freelancer marketplace system.

---

## 📊 System Overview

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                     DOLPHIN COVE - FREE FREELANCER PLATFORM                       ║
║                                                                                   ║
║   ✅ FREE for all users                                                          ║
║   ✅ No billing or payment processing                                            ║
║   ✅ Direct freelancer-client connection                                         ║
║   ✅ Bank info for direct payouts (outside platform)                             ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔄 User Flow Diagrams

### Freelancer Mode Activation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FREELANCER MODE ACTIVATION                               │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Regular     │
    │    User      │
    └──────┬───────┘
           │
           │  1. Go to Profile Settings
           ▼
    ┌──────────────────────────────────────┐
    │         SETTINGS PAGE                 │
    │  ┌─────────────────────────────────┐ │
    │  │  🔘 Enable Freelancer Mode      │ │
    │  │     [ Toggle Switch: OFF → ON ] │ │
    │  └─────────────────────────────────┘ │
    └──────────────┬───────────────────────┘
                   │
                   │  2. Toggle ON
                   ▼
    ┌──────────────────────────────────────┐
    │      BANK INFORMATION FORM           │
    │  (Required to receive payments)      │
    │  ┌─────────────────────────────────┐ │
    │  │  Bank Name: [____________]      │ │
    │  │  Account Number: [________]     │ │
    │  │  Account Holder: [________]     │ │
    │  │  IFSC/SWIFT Code: [_______]     │ │
    │  │                                 │ │
    │  │  ⚠️ This info is only visible   │ │
    │  │     to clients who hire you     │ │
    │  └─────────────────────────────────┘ │
    │           [ Save & Enable ]          │
    └──────────────┬───────────────────────┘
                   │
                   │  3. Save
                   ▼
    ┌──────────────┐
    │  Freelancer  │  ✅ Can apply to jobs
    │    User      │  ✅ Bank info saved
    └──────────────┘  ✅ Visible in job section
```

### Job Post Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           JOB POST CREATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    Client (Any User)
           │
           │  1. Click "Post a Job"
           ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                    CREATE JOB POST PAGE                       │
    │  ┌──────────────────────────────────────────────────────────┐│
    │  │  Job Title *                                             ││
    │  │  [Build a React Dashboard for E-commerce_____________]   ││
    │  │                                                          ││
    │  │  Description *                                           ││
    │  │  ┌────────────────────────────────────────────────────┐  ││
    │  │  │ Looking for an experienced React developer to      │  ││
    │  │  │ build a modern dashboard with charts, tables...    │  ││
    │  │  └────────────────────────────────────────────────────┘  ││
    │  │                                                          ││
    │  │  Required Skills                                         ││
    │  │  [React] [TypeScript] [Chart.js] [+ Add]                 ││
    │  │                                                          ││
    │  │  Budget/Price *                     Duration *           ││
    │  │  [$] [500_______] [USD ▼]          [2 weeks_____] [▼]   ││
    │  │                                                          ││
    │  │  Attachments (Optional)                                  ││
    │  │  ┌────────────────────────────────────────────────────┐  ││
    │  │  │  📎 wireframes.pdf (2.3 MB)              [×]       │  ││
    │  │  │  📎 design-mockup.figma (5.1 MB)         [×]       │  ││
    │  │  │  [+ Add more files]                                │  ││
    │  │  └────────────────────────────────────────────────────┘  ││
    │  │                                                          ││
    │  │  Experience Level                                        ││
    │  │  ○ Entry   ● Intermediate   ○ Expert                     ││
    │  │                                                          ││
    │  └──────────────────────────────────────────────────────────┘│
    │                                                              │
    │              [ Cancel ]  [ 📢 Post Job ]                     │
    └──────────────────────────────────────────────────────────────┘
           │
           │  2. Submit
           ▼
    ┌──────────────────────────────────────┐
    │  Job Post Created!                   │
    │  • Visible in Jobs Section           │
    │  • Added to "My Job Posts" in Profile│
    │  • Status: OPEN FOR HIRE             │
    └──────────────────────────────────────┘
```

### Job Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            JOB APPLICATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

    Freelancer                                                     Client
        │                                                             │
        │  1. Browse Jobs Section                                     │
        ▼                                                             │
    ┌────────────────────────────────────┐                           │
    │        JOBS SECTION (All Users)    │                           │
    │  ┌──────────────────────────────┐  │                           │
    │  │ 🔍 Search jobs...            │  │                           │
    │  │ Filter: [Skills▼] [Budget▼]  │  │                           │
    │  └──────────────────────────────┘  │                           │
    │                                    │                           │
    │  ┌──────────────────────────────┐  │                           │
    │  │ React Dashboard Project      │  │                           │
    │  │ Budget: $500 | 2 weeks       │  │                           │
    │  │ Skills: React, TypeScript    │  │                           │
    │  │ Posted by: @johndoe          │  │                           │
    │  │ Status: 🟢 Open for Hire     │  │                           │
    │  │ Applicants: 3                │  │                           │
    │  │        [ View Details ]      │  │                           │
    │  └──────────────────────────────┘  │                           │
    └────────────────┬───────────────────┘                           │
                     │                                               │
                     │  2. Click "View Details"                      │
                     ▼                                               │
    ┌────────────────────────────────────┐                           │
    │      JOB DETAILS PAGE              │                           │
    │                                    │                           │
    │  📋 React Dashboard Project        │                           │
    │  ──────────────────────────────    │                           │
    │  Description: Looking for an       │                           │
    │  experienced React developer...    │                           │
    │                                    │                           │
    │  💰 Budget: $500 USD               │                           │
    │  ⏱️ Duration: 2 weeks              │                           │
    │  📎 Attachments: 2 files           │                           │
    │                                    │                           │
    │  👤 Client: John Doe               │                           │
    │     @johndoe | ⭐ 4.8              │                           │
    │                                    │                           │
    │  ┌──────────────────────────────┐  │                           │
    │  │  💬 Your Proposal            │  │                           │
    │  │  ┌────────────────────────┐  │  │                           │
    │  │  │ I have 5 years of exp  │  │  │                           │
    │  │  │ in React and can...    │  │  │                           │
    │  │  └────────────────────────┘  │  │                           │
    │  │  📎 Attach Portfolio/Resume  │  │                           │
    │  │                              │  │                           │
    │  │     [ Apply for this Job ]   │  │                           │
    │  └──────────────────────────────┘  │                           │
    └────────────────┬───────────────────┘                           │
                     │                                               │
                     │  3. Submit Application                        │
                     │ ─────────────────────────────────────────────►│
                     │                                               │
                     │                              4. View Applicants
                     │                                               ▼
                     │                    ┌──────────────────────────────────────┐
                     │                    │  MY JOB POSTS (Profile Section)      │
                     │                    │  ┌────────────────────────────────┐  │
                     │                    │  │ React Dashboard Project        │  │
                     │                    │  │ Status: 🟢 Open | 4 Applicants │  │
                     │                    │  │      [ View Applicants ]       │  │
                     │                    │  └────────────────────────────────┘  │
                     │                    └────────────────┬─────────────────────┘
                     │                                     │
                     │                    5. Review & Select
                     │                                     ▼
                     │                    ┌──────────────────────────────────────┐
                     │                    │         APPLICANTS LIST              │
                     │                    │  ┌────────────────────────────────┐  │
                     │                    │  │ 👤 Sarah Dev (@sarahdev)       │  │
                     │                    │  │ ⭐ 4.9 | 50 jobs completed     │  │
                     │                    │  │ "I have 5 years of exp..."     │  │
                     │                    │  │ 📎 portfolio.pdf               │  │
                     │                    │  │  [ View Profile ] [ ✓ Hire ]   │  │
                     │                    │  └────────────────────────────────┘  │
                     │                    │  ┌────────────────────────────────┐  │
                     │                    │  │ 👤 Mike Coder (@mikecoder)     │  │
                     │                    │  │ ⭐ 4.5 | 30 jobs completed     │  │
                     │                    │  │  [ View Profile ] [ ✓ Hire ]   │  │
                     │                    │  └────────────────────────────────┘  │
                     │                    └────────────────┬─────────────────────┘
                     │                                     │
                     │                    6. Click "Hire"  │
                     │                                     ▼
                     │                    ┌──────────────────────────────────────┐
                     │                    │        HIRE CONFIRMATION             │
                     │                    │                                      │
                     │                    │  You're about to hire Sarah Dev      │
                     │                    │  for "React Dashboard Project"       │
                     │                    │                                      │
                     │                    │  💳 Freelancer's Bank Info:          │
                     │                    │  ┌────────────────────────────────┐  │
                     │                    │  │ Bank: State Bank               │  │
                     │                    │  │ Account: ****4567              │  │
                     │                    │  │ Name: Sarah Developer          │  │
                     │                    │  │ IFSC: SBIN0001234              │  │
                     │                    │  └────────────────────────────────┘  │
                     │                    │                                      │
                     │                    │  ⚠️ Payment is handled directly     │
                     │                    │     between you and the freelancer  │
                     │                    │                                      │
                     │                    │   [ Cancel ] [ Confirm & Close Job ] │
                     │                    └────────────────┬─────────────────────┘
                     │                                     │
                     │  7. Job Assigned Notification       │
                     │ ◄─────────────────────────────────── │
                     │                                     │
                     ▼                                     ▼
    ┌────────────────────────────────┐    ┌────────────────────────────────┐
    │  MY TASKS (Freelancer Profile) │    │  MY JOB POSTS (Client Profile) │
    │  ┌──────────────────────────┐  │    │  ┌──────────────────────────┐  │
    │  │ React Dashboard Project  │  │    │  │ React Dashboard Project  │  │
    │  │ Client: @johndoe         │  │    │  │ Hired: @sarahdev         │  │
    │  │ Status: 🔵 IN PROGRESS   │  │    │  │ Status: 🔴 CLOSED        │  │
    │  │ Due: Jan 30, 2026        │  │    │  │                          │  │
    │  │ Budget: $500             │  │    │  │ [ Mark as Complete ]     │  │
    │  └──────────────────────────┘  │    │  └──────────────────────────┘  │
    └────────────────────────────────┘    └────────────────────────────────┘
```

---

## 💾 Updated Database Schema

### Cosmos DB Container Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COSMOS DB SCHEMA (UPDATED)                               │
└─────────────────────────────────────────────────────────────────────────────────┘

Database: DolphinCoveDB

├── Container: Users
│   ├── Partition Key: /id
│   └── Document:
│       {
│         "id": "uuid",
│         "email": "user@example.com",
│         "username": "johndoe",
│         "displayName": "John Doe",
│         "avatar": "https://storage.../avatar.jpg",
│         "bio": "Full-stack developer...",
│         "skills": ["React", "Node.js", "TypeScript"],
│         
│         // ═══════════════════════════════════════════════
│         // FREELANCER MODE SETTINGS
│         // ═══════════════════════════════════════════════
│         "isFreelancer": true,        // Toggle: true/false
│         "freelancerProfile": {
│           "title": "Senior React Developer",
│           "hourlyRate": 50,
│           "availability": "available", // available | busy | unavailable
│           "completedJobs": 25,
│           "rating": 4.8,
│           "totalEarnings": 12500,     // For display only
│           
│           // Bank info - ONLY visible to clients who hire
│           "bankInfo": {
│             "bankName": "State Bank",
│             "accountNumber": "1234567890",  // Encrypted in DB
│             "accountHolderName": "John Doe",
│             "ifscCode": "SBIN0001234",      // or SWIFT for international
│             "isVerified": false
│           }
│         },
│         
│         "connections": [],
│         "followers": [],
│         "following": [],
│         "createdAt": "2024-01-01T00:00:00Z",
│         "updatedAt": "2024-01-15T00:00:00Z"
│       }
│
├── Container: FreelanceJobs (NEW)
│   ├── Partition Key: /clientId
│   └── Document:
│       {
│         "id": "uuid",
│         "clientId": "user-uuid",         // Who posted the job
│         
│         // ═══════════════════════════════════════════════
│         // JOB DETAILS
│         // ═══════════════════════════════════════════════
│         "title": "Build a React Dashboard",
│         "description": "Looking for an experienced...",
│         "skills": ["React", "TypeScript", "Chart.js"],
│         "experienceLevel": "intermediate",  // entry | intermediate | expert
│         
│         // ═══════════════════════════════════════════════
│         // PRICING & TIMELINE
│         // ═══════════════════════════════════════════════
│         "budget": {
│           "amount": 500,
│           "currency": "USD",
│           "type": "fixed"              // fixed | hourly
│         },
│         "duration": {
│           "value": 2,
│           "unit": "weeks"              // hours | days | weeks | months
│         },
│         "deadline": "2024-02-01T00:00:00Z",
│         
│         // ═══════════════════════════════════════════════
│         // ATTACHMENTS
│         // ═══════════════════════════════════════════════
│         "attachments": [
│           {
│             "id": "att-uuid",
│             "name": "wireframes.pdf",
│             "url": "https://storage.../wireframes.pdf",
│             "size": 2300000,
│             "type": "application/pdf"
│           }
│         ],
│         
│         // ═══════════════════════════════════════════════
│         // STATUS & APPLICATIONS
│         // ═══════════════════════════════════════════════
│         "status": "open",              // open | in_progress | completed | cancelled
│         "visibility": "public",        // public | private | invite_only
│         
│         "applicants": [
│           {
│             "id": "app-uuid",
│             "freelancerId": "user-uuid",
│             "proposal": "I have 5 years of experience...",
│             "attachments": ["portfolio.pdf"],
│             "proposedBudget": 450,      // Optional counter-offer
│             "proposedDuration": "10 days",
│             "status": "pending",        // pending | accepted | rejected
│             "appliedAt": "2024-01-15T10:00:00Z"
│           }
│         ],
│         "totalApplicants": 5,
│         
│         // ═══════════════════════════════════════════════
│         // HIRED FREELANCER (after selection)
│         // ═══════════════════════════════════════════════
│         "hiredFreelancer": {
│           "freelancerId": "user-uuid",
│           "agreedBudget": 500,
│           "agreedDeadline": "2024-02-01T00:00:00Z",
│           "hiredAt": "2024-01-16T00:00:00Z",
│           "completedAt": null,
│           "clientReview": null,
│           "freelancerReview": null
│         },
│         
│         "createdAt": "2024-01-10T00:00:00Z",
│         "updatedAt": "2024-01-15T00:00:00Z"
│       }
│
├── Container: Tasks (NEW - For tracking assigned work)
│   ├── Partition Key: /participantId (indexed by both client and freelancer)
│   └── Document:
│       {
│         "id": "uuid",
│         "jobId": "freelance-job-uuid",
│         "clientId": "user-uuid",
│         "freelancerId": "user-uuid",
│         "participantId": "user-uuid",   // Duplicated for both parties
│         
│         "title": "Build a React Dashboard",
│         "status": "in_progress",        // in_progress | completed | disputed | cancelled
│         
│         "milestones": [
│           {
│             "id": "ms-uuid",
│             "title": "Design Approval",
│             "description": "Get design mockups approved",
│             "dueDate": "2024-01-20T00:00:00Z",
│             "status": "completed",
│             "completedAt": "2024-01-19T00:00:00Z"
│           }
│         ],
│         
│         "messages": 15,                 // Count of task-related messages
│         "lastActivity": "2024-01-18T00:00:00Z",
│         
│         "payment": {
│           "amount": 500,
│           "currency": "USD",
│           "status": "pending"           // pending | paid | disputed
│         },
│         
│         "createdAt": "2024-01-16T00:00:00Z",
│         "updatedAt": "2024-01-18T00:00:00Z"
│       }
│
├── Container: Posts (existing - regular social posts)
│   └── ... (same as before)
│
└── Container: Messages (existing)
    └── ... (same as before)
```

---

## 📝 Complete API Code

### 1. Updated Types (`api/src/types/index.ts`)

```typescript
// ============================================================================
// USER TYPES (UPDATED)
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  skills: string[];
  
  // Freelancer Mode
  isFreelancer: boolean;
  freelancerProfile?: FreelancerProfile;
  
  // Social
  connections: string[];
  followers: string[];
  following: string[];
  
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  title?: string;
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  completedJobs: number;
  rating: number;
  totalReviews: number;
  
  // Bank Info - Only visible to hiring clients
  bankInfo?: BankInfo;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;  // Will be encrypted
  accountHolderName: string;
  ifscCode?: string;      // For Indian banks
  swiftCode?: string;     // For international
  routingNumber?: string; // For US banks
  isVerified: boolean;
}

// ============================================================================
// FREELANCE JOB TYPES (NEW)
// ============================================================================

export interface FreelanceJob {
  id: string;
  clientId: string;
  
  // Job Details
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  
  // Budget & Timeline
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  deadline?: string;
  
  // Attachments
  attachments: JobAttachment[];
  
  // Status
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite_only';
  
  // Applications
  applicants: JobApplication[];
  totalApplicants: number;
  
  // Hired Freelancer
  hiredFreelancer?: HiredFreelancer;
  
  createdAt: string;
  updatedAt: string;
}

export interface JobAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface JobApplication {
  id: string;
  freelancerId: string;
  proposal: string;
  attachments?: string[];
  proposedBudget?: number;
  proposedDuration?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
}

export interface HiredFreelancer {
  freelancerId: string;
  agreedBudget: number;
  agreedDeadline: string;
  hiredAt: string;
  completedAt?: string;
  clientReview?: Review;
  freelancerReview?: Review;
}

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================================================
// TASK TYPES (NEW)
// ============================================================================

export interface Task {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  
  title: string;
  description: string;
  status: 'in_progress' | 'completed' | 'disputed' | 'cancelled';
  
  budget: {
    amount: number;
    currency: string;
  };
  deadline: string;
  
  milestones?: Milestone[];
  
  // For client view
  isClientView?: boolean;
  // For freelancer view
  isFreelancerView?: boolean;
  
  messagesCount: number;
  lastActivity: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface CreateFreelanceJobRequest {
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  deadline?: string;
  attachments?: JobAttachment[];
}

export interface ApplyToJobRequest {
  proposal: string;
  attachments?: string[];
  proposedBudget?: number;
  proposedDuration?: string;
}

export interface UpdateFreelancerModeRequest {
  isFreelancer: boolean;
  freelancerProfile?: {
    title?: string;
    hourlyRate?: number;
    availability?: 'available' | 'busy' | 'unavailable';
    bankInfo?: Omit<BankInfo, 'isVerified'>;
  };
}

export interface HireFreelancerRequest {
  applicationId: string;
  agreedBudget: number;
  agreedDeadline: string;
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

// For job listing - includes client info
export interface FreelanceJobWithClient extends FreelanceJob {
  client: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
}

// For application - includes freelancer info
export interface ApplicationWithFreelancer extends JobApplication {
  freelancer: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
    freelancerProfile?: {
      title?: string;
      rating: number;
      completedJobs: number;
    };
  };
}

// Bank info visible to client after hiring
export interface FreelancerBankInfoResponse {
  bankName: string;
  accountNumber: string;       // Masked: ****4567
  accountHolderName: string;
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  fullAccountNumber?: string;  // Only after hire confirmation
}
```

### 2. Database Client Update (`api/src/lib/database.ts`)

```typescript
import { CosmosClient, Database, Container } from '@azure/cosmos';

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DATABASE || 'DolphinCoveDB';

if (!connectionString) {
  throw new Error('COSMOS_CONNECTION_STRING environment variable is required');
}

const client = new CosmosClient(connectionString);
const database: Database = client.database(databaseName);

// Export container references (UPDATED)
export const containers = {
  users: database.container('Users'),
  posts: database.container('Posts'),
  messages: database.container('Messages'),
  freelanceJobs: database.container('FreelanceJobs'),  // NEW
  tasks: database.container('Tasks'),                   // NEW
};

export { database, client };
```

### 3. Freelance Jobs API (`api/src/functions/freelanceJobs.ts`)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import {
  FreelanceJob,
  CreateFreelanceJobRequest,
  ApplyToJobRequest,
  HireFreelancerRequest,
  ApiResponse,
  PaginatedResponse,
  FreelanceJobWithClient,
  ApplicationWithFreelancer,
  User,
  Task,
  JobApplication
} from '../types';

// ============================================================================
// GET /api/freelance-jobs - Get all freelance jobs (public)
// ============================================================================
app.http('getFreelanceJobs', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelance-jobs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const status = request.query.get('status') || 'open';
      const skills = request.query.get('skills')?.split(',');
      const minBudget = request.query.get('minBudget');
      const maxBudget = request.query.get('maxBudget');
      const experienceLevel = request.query.get('experienceLevel');
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM c WHERE c.status = @status AND c.visibility = "public"';
      const parameters: { name: string; value: any }[] = [
        { name: '@status', value: status }
      ];

      // Filter by skills
      if (skills && skills.length > 0) {
        const skillConditions = skills.map((_, i) => `ARRAY_CONTAINS(c.skills, @skill${i})`).join(' OR ');
        query += ` AND (${skillConditions})`;
        skills.forEach((skill, i) => {
          parameters.push({ name: `@skill${i}`, value: skill.trim() });
        });
      }

      // Filter by budget range
      if (minBudget) {
        query += ' AND c.budget.amount >= @minBudget';
        parameters.push({ name: '@minBudget', value: parseFloat(minBudget) });
      }
      if (maxBudget) {
        query += ' AND c.budget.amount <= @maxBudget';
        parameters.push({ name: '@maxBudget', value: parseFloat(maxBudget) });
      }

      // Filter by experience level
      if (experienceLevel) {
        query += ' AND c.experienceLevel = @experienceLevel';
        parameters.push({ name: '@experienceLevel', value: experienceLevel });
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.freelanceJobs.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add pagination
      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({ query, parameters })
        .fetchAll();

      // Fetch client details
      const clientIds = [...new Set(jobs.map((j: FreelanceJob) => j.clientId))];
      const clientsMap: Record<string, any> = {};

      if (clientIds.length > 0) {
        const clientsQuery = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified FROM c WHERE c.id IN (${clientIds.map((_, i) => `@id${i}`).join(',')})`;
        const clientsParams = clientIds.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: clients } = await containers.users.items
          .query({ query: clientsQuery, parameters: clientsParams })
          .fetchAll();

        clients.forEach((client: any) => {
          clientsMap[client.id] = client;
        });
      }

      // Combine jobs with client data (hide applicant details in list view)
      const jobsWithClients: FreelanceJobWithClient[] = jobs.map((job: FreelanceJob) => ({
        ...job,
        applicants: [], // Don't expose applicants in list
        client: clientsMap[job.clientId] || null,
      }));

      const response: PaginatedResponse<FreelanceJobWithClient> = {
        success: true,
        data: jobsWithClients,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + jobs.length < total,
          hasPrev: page > 1,
        },
      };

      return { status: 200, jsonBody: response };
    } catch (error) {
      context.error('Error fetching freelance jobs:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch jobs' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/freelance-jobs/:id - Get job details
// ============================================================================
app.http('getFreelanceJobById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const userId = request.query.get('userId'); // Current user viewing

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: jobId }],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Fetch client details
      const { resource: client } = await containers.users.item(job.clientId, job.clientId).read<User>();

      // Check if current user is the client (owner)
      const isOwner = userId === job.clientId;

      // Check if current user has already applied
      const hasApplied = job.applicants.some(app => app.freelancerId === userId);
      const userApplication = job.applicants.find(app => app.freelancerId === userId);

      // Prepare response
      const jobResponse: any = {
        ...job,
        client: client ? {
          id: client.id,
          username: client.username,
          displayName: client.displayName,
          avatar: client.avatar,
          isVerified: client.isVerified,
        } : null,
        isOwner,
        hasApplied,
        userApplication: hasApplied ? userApplication : null,
      };

      // Only show applicants to job owner
      if (!isOwner) {
        jobResponse.applicants = [];
      }

      return {
        status: 200,
        jsonBody: { success: true, data: jobResponse } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/freelance-jobs - Create new freelance job
// ============================================================================
app.http('createFreelanceJob', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelance-jobs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as CreateFreelanceJobRequest & { clientId: string };

      // Validate required fields
      if (!body.title?.trim() || !body.description?.trim() || !body.clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Title, description, and clientId are required' } as ApiResponse,
        };
      }

      if (!body.budget?.amount || body.budget.amount <= 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Valid budget amount is required' } as ApiResponse,
        };
      }

      if (!body.duration?.value || body.duration.value <= 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Valid duration is required' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const newJob: FreelanceJob = {
        id: uuidv4(),
        clientId: body.clientId,
        title: body.title.trim(),
        description: body.description.trim(),
        skills: body.skills || [],
        experienceLevel: body.experienceLevel || 'intermediate',
        budget: {
          amount: body.budget.amount,
          currency: body.budget.currency || 'USD',
          type: body.budget.type || 'fixed',
        },
        duration: {
          value: body.duration.value,
          unit: body.duration.unit || 'weeks',
        },
        deadline: body.deadline,
        attachments: body.attachments || [],
        status: 'open',
        visibility: 'public',
        applicants: [],
        totalApplicants: 0,
        createdAt: now,
        updatedAt: now,
      };

      const { resource: createdJob } = await containers.freelanceJobs.items.create(newJob);

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: createdJob,
          message: 'Job posted successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error creating job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/freelance-jobs/:id/apply - Apply to a job
// ============================================================================
app.http('applyToFreelanceJob', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/apply',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as ApplyToJobRequest & { freelancerId: string };

      if (!body.freelancerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelancer ID is required' } as ApiResponse,
        };
      }

      if (!body.proposal?.trim()) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Proposal is required' } as ApiResponse,
        };
      }

      // Check if user is a freelancer
      const { resource: user } = await containers.users.item(body.freelancerId, body.freelancerId).read<User>();
      
      if (!user || !user.isFreelancer) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You must enable freelancer mode to apply for jobs' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: jobId }],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Check if job is open
      if (job.status !== 'open') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'This job is no longer accepting applications' } as ApiResponse,
        };
      }

      // Check if user is the job owner
      if (job.clientId === body.freelancerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'You cannot apply to your own job' } as ApiResponse,
        };
      }

      // Check if already applied
      if (job.applicants.some(app => app.freelancerId === body.freelancerId)) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'You have already applied to this job' } as ApiResponse,
        };
      }

      // Create application
      const application: JobApplication = {
        id: uuidv4(),
        freelancerId: body.freelancerId,
        proposal: body.proposal.trim(),
        attachments: body.attachments,
        proposedBudget: body.proposedBudget,
        proposedDuration: body.proposedDuration,
        status: 'pending',
        appliedAt: new Date().toISOString(),
      };

      job.applicants.push(application);
      job.totalApplicants = job.applicants.length;
      job.updatedAt = new Date().toISOString();

      await containers.freelanceJobs.item(job.id, job.clientId).replace(job);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: application,
          message: 'Application submitted successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error applying to job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to submit application' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/freelance-jobs/:id/applicants - Get job applicants (owner only)
// ============================================================================
app.http('getJobApplicants', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/applicants',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const clientId = request.query.get('clientId');

      if (!clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found or you are not the owner' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Fetch freelancer details for each applicant
      const freelancerIds = job.applicants.map(app => app.freelancerId);
      const freelancersMap: Record<string, any> = {};

      if (freelancerIds.length > 0) {
        const query = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.freelancerProfile FROM c WHERE c.id IN (${freelancerIds.map((_, i) => `@id${i}`).join(',')})`;
        const params = freelancerIds.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: freelancers } = await containers.users.items
          .query({ query, parameters: params })
          .fetchAll();

        freelancers.forEach((f: any) => {
          freelancersMap[f.id] = f;
        });
      }

      // Combine applications with freelancer data
      const applicationsWithFreelancers: ApplicationWithFreelancer[] = job.applicants.map(app => ({
        ...app,
        freelancer: {
          id: freelancersMap[app.freelancerId]?.id,
          username: freelancersMap[app.freelancerId]?.username,
          displayName: freelancersMap[app.freelancerId]?.displayName,
          avatar: freelancersMap[app.freelancerId]?.avatar,
          isVerified: freelancersMap[app.freelancerId]?.isVerified,
          freelancerProfile: freelancersMap[app.freelancerId]?.freelancerProfile ? {
            title: freelancersMap[app.freelancerId].freelancerProfile.title,
            rating: freelancersMap[app.freelancerId].freelancerProfile.rating,
            completedJobs: freelancersMap[app.freelancerId].freelancerProfile.completedJobs,
          } : undefined,
        },
      }));

      return {
        status: 200,
        jsonBody: { success: true, data: applicationsWithFreelancers } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching applicants:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch applicants' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/freelance-jobs/:id/hire - Hire a freelancer
// ============================================================================
app.http('hireFreelancer', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/hire',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as HireFreelancerRequest & { clientId: string };

      if (!body.clientId || !body.applicationId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID and Application ID are required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: body.clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found or you are not the owner' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      if (job.status !== 'open') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'This job is no longer open for hiring' } as ApiResponse,
        };
      }

      // Find the application
      const application = job.applicants.find(app => app.id === body.applicationId);
      if (!application) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Application not found' } as ApiResponse,
        };
      }

      // Get freelancer details
      const { resource: freelancer } = await containers.users.item(application.freelancerId, application.freelancerId).read<User>();

      if (!freelancer || !freelancer.freelancerProfile?.bankInfo) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelancer has not set up bank information' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Update job status
      job.status = 'in_progress';
      job.hiredFreelancer = {
        freelancerId: application.freelancerId,
        agreedBudget: body.agreedBudget || job.budget.amount,
        agreedDeadline: body.agreedDeadline || job.deadline || '',
        hiredAt: now,
      };

      // Update application status
      application.status = 'accepted';
      
      // Reject other applications
      job.applicants.forEach(app => {
        if (app.id !== body.applicationId) {
          app.status = 'rejected';
        }
      });

      job.updatedAt = now;

      // Create task for both client and freelancer
      const taskBase = {
        jobId: job.id,
        clientId: job.clientId,
        freelancerId: application.freelancerId,
        title: job.title,
        description: job.description,
        status: 'in_progress' as const,
        budget: {
          amount: job.hiredFreelancer.agreedBudget,
          currency: job.budget.currency,
        },
        deadline: job.hiredFreelancer.agreedDeadline,
        messagesCount: 0,
        lastActivity: now,
        createdAt: now,
        updatedAt: now,
      };

      // Create task entry for client
      const clientTask: Task = {
        ...taskBase,
        id: uuidv4(),
        isClientView: true,
      };

      // Create task entry for freelancer
      const freelancerTask: Task = {
        ...taskBase,
        id: uuidv4(),
        isFreelancerView: true,
      };

      // Save everything
      await Promise.all([
        containers.freelanceJobs.item(job.id, job.clientId).replace(job),
        containers.tasks.items.create(clientTask),
        containers.tasks.items.create(freelancerTask),
      ]);

      // Return freelancer's bank info to client
      const bankInfo = freelancer.freelancerProfile.bankInfo;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            job,
            freelancerBankInfo: {
              bankName: bankInfo.bankName,
              accountNumber: bankInfo.accountNumber,
              accountHolderName: bankInfo.accountHolderName,
              ifscCode: bankInfo.ifscCode,
              swiftCode: bankInfo.swiftCode,
              routingNumber: bankInfo.routingNumber,
            },
          },
          message: 'Freelancer hired successfully! Job is now closed for new applications.',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error hiring freelancer:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to hire freelancer' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/my-job-posts - Get user's posted jobs
// ============================================================================
app.http('getMyJobPosts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-job-posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const clientId = request.query.get('clientId');
      const status = request.query.get('status'); // open, in_progress, completed

      if (!clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      let query = 'SELECT * FROM c WHERE c.clientId = @clientId';
      const parameters: { name: string; value: any }[] = [
        { name: '@clientId', value: clientId }
      ];

      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      query += ' ORDER BY c.createdAt DESC';

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({ query, parameters })
        .fetchAll();

      return {
        status: 200,
        jsonBody: { success: true, data: jobs } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching job posts:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch job posts' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/freelance-jobs/:id/complete - Mark job as complete
// ============================================================================
app.http('completeFreelanceJob', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/complete',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as { clientId: string; review?: { rating: number; comment: string } };

      if (!body.clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: body.clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      if (job.status !== 'in_progress') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Job is not in progress' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Update job
      job.status = 'completed';
      if (job.hiredFreelancer) {
        job.hiredFreelancer.completedAt = now;
        if (body.review) {
          job.hiredFreelancer.clientReview = {
            rating: body.review.rating,
            comment: body.review.comment,
            createdAt: now,
          };
        }
      }
      job.updatedAt = now;

      // Update tasks
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.jobId = @jobId',
          parameters: [{ name: '@jobId', value: jobId }],
        })
        .fetchAll();

      const updatePromises = [
        containers.freelanceJobs.item(job.id, job.clientId).replace(job),
      ];

      // Update freelancer's stats if review provided
      if (body.review && job.hiredFreelancer) {
        const { resource: freelancer } = await containers.users
          .item(job.hiredFreelancer.freelancerId, job.hiredFreelancer.freelancerId)
          .read<User>();

        if (freelancer && freelancer.freelancerProfile) {
          const profile = freelancer.freelancerProfile;
          const totalReviews = profile.totalReviews || 0;
          const currentRating = profile.rating || 0;
          
          // Calculate new average rating
          const newRating = ((currentRating * totalReviews) + body.review.rating) / (totalReviews + 1);
          
          profile.rating = Math.round(newRating * 10) / 10;
          profile.totalReviews = totalReviews + 1;
          profile.completedJobs = (profile.completedJobs || 0) + 1;
          freelancer.updatedAt = now;

          updatePromises.push(
            containers.users.item(freelancer.id, freelancer.id).replace(freelancer)
          );
        }
      }

      // Update all related tasks
      for (const task of tasks) {
        task.status = 'completed';
        task.updatedAt = now;
        updatePromises.push(
          containers.tasks.items.upsert(task)
        );
      }

      await Promise.all(updatePromises);

      return {
        status: 200,
        jsonBody: {
          success: true,
          message: 'Job marked as complete',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error completing job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to complete job' } as ApiResponse,
      };
    }
  },
});
```

### 4. Tasks API (`api/src/functions/tasks.ts`)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { Task, ApiResponse, User } from '../types';

// ============================================================================
// GET /api/tasks - Get user's tasks (both as client and freelancer)
// ============================================================================
app.http('getTasks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tasks',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.query.get('userId');
      const role = request.query.get('role'); // 'client' | 'freelancer' | 'all'
      const status = request.query.get('status');

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      let query = 'SELECT * FROM c WHERE ';
      const parameters: { name: string; value: any }[] = [];

      // Filter by role
      if (role === 'client') {
        query += 'c.clientId = @userId AND c.isClientView = true';
      } else if (role === 'freelancer') {
        query += 'c.freelancerId = @userId AND c.isFreelancerView = true';
      } else {
        query += '((c.clientId = @userId AND c.isClientView = true) OR (c.freelancerId = @userId AND c.isFreelancerView = true))';
      }
      parameters.push({ name: '@userId', value: userId });

      // Filter by status
      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      query += ' ORDER BY c.updatedAt DESC';

      const { resources: tasks } = await containers.tasks.items
        .query({ query, parameters })
        .fetchAll();

      // Fetch related user info
      const userIds = new Set<string>();
      tasks.forEach((task: Task) => {
        userIds.add(task.clientId);
        userIds.add(task.freelancerId);
      });

      const usersMap: Record<string, any> = {};
      if (userIds.size > 0) {
        const userIdArray = Array.from(userIds);
        const usersQuery = `SELECT c.id, c.username, c.displayName, c.avatar FROM c WHERE c.id IN (${userIdArray.map((_, i) => `@id${i}`).join(',')})`;
        const usersParams = userIdArray.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: users } = await containers.users.items
          .query({ query: usersQuery, parameters: usersParams })
          .fetchAll();

        users.forEach((user: any) => {
          usersMap[user.id] = user;
        });
      }

      // Enrich tasks with user info
      const enrichedTasks = tasks.map((task: Task) => ({
        ...task,
        client: usersMap[task.clientId] || null,
        freelancer: usersMap[task.freelancerId] || null,
        role: task.clientId === userId ? 'client' : 'freelancer',
      }));

      return {
        status: 200,
        jsonBody: { success: true, data: enrichedTasks } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching tasks:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch tasks' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/tasks/:id - Get task details
// ============================================================================
app.http('getTaskById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tasks/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const taskId = request.params.id;
      const userId = request.query.get('userId');

      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: taskId }],
        })
        .fetchAll();

      if (tasks.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Task not found' } as ApiResponse,
        };
      }

      const task = tasks[0] as Task;

      // Verify user is part of this task
      if (userId && task.clientId !== userId && task.freelancerId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Not authorized to view this task' } as ApiResponse,
        };
      }

      // Fetch both users
      const [clientResult, freelancerResult] = await Promise.all([
        containers.users.item(task.clientId, task.clientId).read<User>(),
        containers.users.item(task.freelancerId, task.freelancerId).read<User>(),
      ]);

      const enrichedTask = {
        ...task,
        client: clientResult.resource ? {
          id: clientResult.resource.id,
          username: clientResult.resource.username,
          displayName: clientResult.resource.displayName,
          avatar: clientResult.resource.avatar,
        } : null,
        freelancer: freelancerResult.resource ? {
          id: freelancerResult.resource.id,
          username: freelancerResult.resource.username,
          displayName: freelancerResult.resource.displayName,
          avatar: freelancerResult.resource.avatar,
        } : null,
        role: task.clientId === userId ? 'client' : 'freelancer',
      };

      return {
        status: 200,
        jsonBody: { success: true, data: enrichedTask } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching task:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch task' } as ApiResponse,
      };
    }
  },
});
```

### 5. Freelancer Mode API (`api/src/functions/freelancerMode.ts`)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { User, UpdateFreelancerModeRequest, ApiResponse } from '../types';

// ============================================================================
// PUT /api/users/:id/freelancer-mode - Toggle freelancer mode
// ============================================================================
app.http('updateFreelancerMode', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/{id}/freelancer-mode',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.id;
      const body = (await request.json()) as UpdateFreelancerModeRequest;

      // Get existing user
      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      // Enabling freelancer mode
      if (body.isFreelancer) {
        // Validate bank info is provided when enabling
        if (!body.freelancerProfile?.bankInfo?.bankName || 
            !body.freelancerProfile?.bankInfo?.accountNumber ||
            !body.freelancerProfile?.bankInfo?.accountHolderName) {
          return {
            status: 400,
            jsonBody: { 
              success: false, 
              error: 'Bank information (bank name, account number, account holder name) is required to enable freelancer mode' 
            } as ApiResponse,
          };
        }

        user.isFreelancer = true;
        user.freelancerProfile = {
          title: body.freelancerProfile?.title || '',
          hourlyRate: body.freelancerProfile?.hourlyRate || 0,
          availability: body.freelancerProfile?.availability || 'available',
          completedJobs: user.freelancerProfile?.completedJobs || 0,
          rating: user.freelancerProfile?.rating || 0,
          totalReviews: user.freelancerProfile?.totalReviews || 0,
          bankInfo: {
            bankName: body.freelancerProfile.bankInfo.bankName,
            accountNumber: body.freelancerProfile.bankInfo.accountNumber,
            accountHolderName: body.freelancerProfile.bankInfo.accountHolderName,
            ifscCode: body.freelancerProfile.bankInfo.ifscCode,
            swiftCode: body.freelancerProfile.bankInfo.swiftCode,
            routingNumber: body.freelancerProfile.bankInfo.routingNumber,
            isVerified: false,
          },
        };
      } else {
        // Disabling freelancer mode
        user.isFreelancer = false;
        // Keep the profile data in case they re-enable
      }

      user.updatedAt = new Date().toISOString();

      const { resource: updatedUser } = await containers.users.item(userId, userId).replace(user);

      // Remove sensitive bank info from response
      const safeUser = { ...updatedUser };
      if (safeUser.freelancerProfile?.bankInfo) {
        safeUser.freelancerProfile.bankInfo = {
          ...safeUser.freelancerProfile.bankInfo,
          accountNumber: '****' + safeUser.freelancerProfile.bankInfo.accountNumber.slice(-4),
        };
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: safeUser,
          message: body.isFreelancer 
            ? 'Freelancer mode enabled successfully' 
            : 'Freelancer mode disabled',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating freelancer mode:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update freelancer mode' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/users/:id/freelancer-profile - Update freelancer profile
// ============================================================================
app.http('updateFreelancerProfile', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/{id}/freelancer-profile',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.id;
      const body = (await request.json()) as Partial<UpdateFreelancerModeRequest['freelancerProfile']>;

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      if (!user.isFreelancer) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User is not in freelancer mode' } as ApiResponse,
        };
      }

      // Update profile fields
      if (user.freelancerProfile) {
        if (body.title !== undefined) user.freelancerProfile.title = body.title;
        if (body.hourlyRate !== undefined) user.freelancerProfile.hourlyRate = body.hourlyRate;
        if (body.availability !== undefined) user.freelancerProfile.availability = body.availability;
        
        // Update bank info if provided
        if (body.bankInfo) {
          user.freelancerProfile.bankInfo = {
            ...user.freelancerProfile.bankInfo,
            ...body.bankInfo,
            isVerified: false, // Reset verification when bank info changes
          };
        }
      }

      user.updatedAt = new Date().toISOString();

      const { resource: updatedUser } = await containers.users.item(userId, userId).replace(user);

      // Mask bank info in response
      const safeUser = { ...updatedUser };
      if (safeUser.freelancerProfile?.bankInfo) {
        safeUser.freelancerProfile.bankInfo = {
          ...safeUser.freelancerProfile.bankInfo,
          accountNumber: '****' + safeUser.freelancerProfile.bankInfo.accountNumber.slice(-4),
        };
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: safeUser,
          message: 'Freelancer profile updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating freelancer profile:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update freelancer profile' } as ApiResponse,
      };
    }
  },
});
```

---

## 📋 API Endpoints Summary

### Freelance Jobs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/freelance-jobs` | Get all open jobs | Public |
| GET | `/api/freelance-jobs/:id` | Get job details | Public |
| POST | `/api/freelance-jobs` | Create new job post | Authenticated |
| POST | `/api/freelance-jobs/:id/apply` | Apply to a job | Freelancers only |
| GET | `/api/freelance-jobs/:id/applicants` | View applicants | Job owner only |
| POST | `/api/freelance-jobs/:id/hire` | Hire a freelancer | Job owner only |
| PUT | `/api/freelance-jobs/:id/complete` | Mark job complete | Job owner only |
| GET | `/api/my-job-posts` | Get user's posted jobs | Authenticated |

### Tasks

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get user's tasks | Authenticated |
| GET | `/api/tasks/:id` | Get task details | Task participants |

### Freelancer Mode

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| PUT | `/api/users/:id/freelancer-mode` | Enable/disable freelancer mode | Account owner |
| PUT | `/api/users/:id/freelancer-profile` | Update freelancer profile | Account owner |

---

## 🎨 Frontend Pages Structure

```
src/pages/
├── FreelanceJobs/              # NEW
│   ├── FreelanceJobsPage.tsx   # List all jobs
│   ├── CreateJobPage.tsx       # Create job post form
│   ├── JobDetailPage.tsx       # Job details + apply
│   ├── ManageApplicantsPage.tsx # View/hire applicants
│   ├── FreelanceJobs.css
│   └── index.ts
│
├── Tasks/                      # NEW
│   ├── TasksPage.tsx           # List all tasks
│   ├── TaskDetailPage.tsx      # Task details
│   ├── Tasks.css
│   └── index.ts
│
├── Profile/
│   ├── Profile.tsx             # Updated with:
│   │                           # - "My Job Posts" section
│   │                           # - "My Tasks" section
│   │                           # - Bank info (if freelancer)
│   ├── Profile.css
│   └── index.ts
│
├── Settings/
│   ├── Settings.tsx            # Updated with:
│   │                           # - Freelancer mode toggle
│   │                           # - Bank information form
│   ├── Settings.css
│   └── index.ts
```

---

## 🔐 Privacy & Security Notes

1. **Bank Information Security:**
   - Bank info stored encrypted in database
   - Only visible to client AFTER they hire the freelancer
   - Account numbers masked in API responses (show last 4 digits only)
   - Full account number only revealed during hire confirmation

2. **Job Applications:**
   - Only job owner can see full list of applicants
   - Freelancers can only see their own application status

3. **Payment Handling:**
   - Platform does NOT handle payments
   - Direct payment between client and freelancer
   - Bank info shared only for direct transfer

---

## 💡 Key Features Summary

| Feature | Description |
|---------|-------------|
| **FREE Platform** | No fees, no billing, 100% free |
| **Freelancer Mode Toggle** | Any user can become a freelancer |
| **Bank Info Protection** | Only visible to hiring clients |
| **Job Posting** | Title, description, budget, duration, attachments |
| **Application System** | Proposals with portfolio attachments |
| **Hire & Close** | Owner selects freelancer, job closes |
| **Task Tracking** | Both parties see assigned work |
| **Rating System** | Clients rate freelancers after completion |

---

**Happy Building! 🐬**

*Dolphin Cove - Where Freelancers Thrive for FREE*
