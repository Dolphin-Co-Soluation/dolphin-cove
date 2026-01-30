-- ============================================================================
-- DOLPHIN COVE - SUPABASE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor to create all tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar TEXT,
  cover_photo TEXT,
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  
  -- Freelancer Mode
  is_freelancer BOOLEAN DEFAULT FALSE,
  freelancer_profile JSONB DEFAULT NULL,
  
  -- Social
  connections TEXT[] DEFAULT '{}',
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_freelancer ON users(is_freelancer);

-- ============================================================================
-- POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media JSONB DEFAULT '[]',
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  likes TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- ============================================================================
-- FREELANCE JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS freelance_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Job Details
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_level VARCHAR(20) DEFAULT 'intermediate' CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  
  -- Budget
  budget_amount DECIMAL(10, 2) NOT NULL,
  budget_currency VARCHAR(3) DEFAULT 'USD',
  budget_type VARCHAR(10) DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
  
  -- Duration
  duration_value INTEGER DEFAULT 1,
  duration_unit VARCHAR(10) DEFAULT 'weeks' CHECK (duration_unit IN ('hours', 'days', 'weeks', 'months')),
  deadline TIMESTAMPTZ,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite_only')),
  
  -- Applications & Hiring
  applications JSONB DEFAULT '[]',
  hired_freelancer_id UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for freelance_jobs
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_client_id ON freelance_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_status ON freelance_jobs(status);
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_visibility ON freelance_jobs(visibility);
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_created_at ON freelance_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_hired_freelancer ON freelance_jobs(hired_freelancer_id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES freelance_jobs(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES users(id),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================================================
-- MESSAGES TABLE (Optional - for direct messaging feature)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id VARCHAR(100) NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS for all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can add stricter policies later)
-- Users table policies
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Posts table policies
CREATE POLICY "Allow all operations on posts" ON posts
  FOR ALL USING (true) WITH CHECK (true);

-- Freelance jobs table policies
CREATE POLICY "Allow all operations on freelance_jobs" ON freelance_jobs
  FOR ALL USING (true) WITH CHECK (true);

-- Tasks table policies
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Messages table policies
CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS FOR AUTO-UPDATING updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freelance_jobs_updated_at
  BEFORE UPDATE ON freelance_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - uncomment to add test data)
-- ============================================================================

/*
-- Insert a test user
INSERT INTO users (email, username, password_hash, display_name, skills, is_freelancer)
VALUES (
  'test@dolphincove.com',
  'testuser',
  'password123',
  'Test User',
  ARRAY['JavaScript', 'React', 'Node.js'],
  true
);

-- Insert a test job
INSERT INTO freelance_jobs (client_id, title, description, skills, budget_amount, budget_currency)
SELECT id, 'Build a React Website', 'Looking for a skilled developer to build a modern React website', 
       ARRAY['React', 'JavaScript', 'CSS'], 500.00, 'USD'
FROM users WHERE username = 'testuser';
*/

-- ============================================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard > Storage)
-- Create a bucket named 'dolphin-cove-files' with public access
-- ============================================================================

-- Note: Storage buckets are created via the Supabase Dashboard, not SQL
-- Go to Storage > Create a new bucket > Name it 'dolphin-cove-files' > Make it public
