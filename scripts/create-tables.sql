-- Create enum type for connection_status
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');

-- Create agent_preferences table
CREATE TABLE agent_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  target_roles JSONB,
  target_locations JSONB,
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  openness_to_relocation BOOLEAN DEFAULT FALSE,
  openness_to_remote BOOLEAN DEFAULT TRUE,
  job_search_status VARCHAR,
  blocked_recruiter_domains JSONB,
  blocked_keywords JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_memories table
CREATE TABLE agent_memories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  embedding VECTOR(1536),
  conversation_id VARCHAR
);

-- Create ai_chat_messages table
CREATE TABLE ai_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_name TEXT,
  embedding VECTOR(1536),
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  liked BOOLEAN DEFAULT FALSE,
  disliked BOOLEAN DEFAULT FALSE,
  copied BOOLEAN DEFAULT FALSE,
  liked_at TIMESTAMP WITH TIME ZONE,
  disliked_at TIMESTAMP WITH TIME ZONE,
  copied_at TIMESTAMP WITH TIME ZONE
);

-- Create applications table
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  job_id INTEGER,
  status VARCHAR DEFAULT 'applied',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cover_letter TEXT,
  ai_generated BOOLEAN DEFAULT FALSE
);

-- Create application_records table
CREATE TABLE application_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  job_id INTEGER,
  external_job_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  submitted_payload JSONB,
  missing_fields JSONB,
  error_message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  idempotency_key VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_details table
CREATE TABLE application_details (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  encrypted_fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resume_text TEXT,
  resume_embedding VECTOR(1536)
);

-- Create connections table
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER,
  receiver_id INTEGER,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  user_id INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_summaries table
CREATE TABLE conversation_summaries (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  company VARCHAR,
  location VARCHAR,
  description TEXT,
  requirements TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  job_type VARCHAR,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_matches table
CREATE TABLE job_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  match_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs_applied table
CREATE TABLE jobs_applied (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'applied'
);

-- Create issues table
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  title VARCHAR,
  description TEXT,
  status VARCHAR DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alembic_version table
CREATE TABLE alembic_version (
  version_num VARCHAR NOT NULL PRIMARY KEY
);

-- Create indexes for better query performance
CREATE INDEX idx_agent_preferences_user_id ON agent_preferences(user_id);
CREATE INDEX idx_agent_memories_user_id ON agent_memories(user_id);
CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_application_records_user_id ON application_records(user_id);
CREATE INDEX idx_application_details_user_id ON application_details(user_id);
CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_receiver_id ON connections(receiver_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_summaries_conversation_id ON conversation_summaries(conversation_id);
CREATE INDEX idx_jobs_applied_user_id ON jobs_applied(user_id);
CREATE INDEX idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX idx_issues_user_id ON issues(user_id);

-- Table for tracking applied jobs (explicit schema added per request)
CREATE TABLE IF NOT EXISTS public.applied_jobs (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  company_name text null,
  resume_url text null,
  job_title text null,
  job_location text null,
  applied_date date null,
  job_url text null,
  constraint applied_jobs_pkey primary key (id)
) TABLESPACE pg_default;
