-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat_exports table for data export functionality
CREATE TABLE IF NOT EXISTS chat_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('csv', 'json', 'pdf')),
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_conversation_id ON uploaded_files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_exports_user_id ON chat_exports(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_exports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations" 
  ON chat_conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" 
  ON chat_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON chat_conversations FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON chat_conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" 
  ON chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = chat_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations" 
  ON chat_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = chat_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for uploaded_files
CREATE POLICY "Users can view files in their conversations" 
  ON uploaded_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = uploaded_files.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files in their conversations" 
  ON uploaded_files FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = uploaded_files.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for chat_exports
CREATE POLICY "Users can view their exports" 
  ON chat_exports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports" 
  ON chat_exports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
