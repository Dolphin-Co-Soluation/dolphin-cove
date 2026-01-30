# 🐬 Dolphin Cove - Freelancer Marketplace

A modern, full-stack freelancer marketplace built with React, Express, and Supabase.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **CSS** for styling

### Backend
- **Express.js** with TypeScript
- **Supabase** for PostgreSQL database
- **Supabase Storage** for file uploads

### Deployment (100% FREE)
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Supabase** - Database & Storage

## 📁 Project Structure

```
dolphin-cove/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── context/           # React contexts
│   └── types/             # TypeScript types
├── api/                   # Backend Express API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── lib/           # Database & utilities
│   │   └── types/         # TypeScript types
│   └── supabase-schema.sql # Database schema
└── mdfiles/               # Documentation
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/dolphin-cove.git
cd dolphin-cove

# Install frontend dependencies
npm install

# Install backend dependencies
cd api && npm install
cd ..
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `api/supabase-schema.sql` in the SQL Editor
3. Create a storage bucket named `dolphin-cove-files`

### 3. Configure Environment Variables

**Backend (`api/.env`):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd api && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Deployment

See [FREE_DEPLOYMENT_GUIDE.md](./mdfiles/FREE_DEPLOYMENT_GUIDE.md) for step-by-step instructions to deploy for free using Vercel + Render + Supabase.

## 🌟 Features

- **User Authentication** - Register, login, profile management
- **Social Features** - Follow users, connections, posts
- **Freelance Jobs** - Post jobs, apply, hire freelancers
- **Task Management** - Create and track project tasks
- **File Uploads** - Avatar, attachments via Supabase Storage
- **Real-time Stats** - Live platform statistics

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Platform statistics |
| POST | `/api/users/register` | Register user |
| POST | `/api/users/login` | Login user |
| GET | `/api/posts` | Get posts feed |
| POST | `/api/posts` | Create post |
| GET | `/api/freelance-jobs` | Get job listings |
| POST | `/api/freelance-jobs` | Create job |
| GET | `/api/tasks` | Get tasks |

## 📄 License

MIT License

## 🤝 Contributing

Pull requests welcome! Please open an issue first for major changes.
