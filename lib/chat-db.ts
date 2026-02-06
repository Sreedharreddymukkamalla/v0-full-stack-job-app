import { createClient } from '@supabase/supabase-js'
import { UIMessage } from 'ai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client only if environment variables are available
let supabase: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export interface ChatConversation {
  id: string
  userId: string
  title: string
  messages: UIMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatFile {
  id: string
  conversationId: string
  userId: string
  filename: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

// Save conversation
export async function saveConversation(
  userId: string,
  title: string,
  messages: UIMessage[]
): Promise<string> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title,
      messages,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

// Update conversation
export async function updateConversation(
  conversationId: string,
  messages: UIMessage[]
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (error) throw error
}

// Get conversation
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<ChatConversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Get all conversations for user
export async function getUserConversations(
  userId: string
): Promise<ChatConversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

// Save file reference
export async function saveFileReference(
  conversationId: string,
  userId: string,
  filename: string,
  url: string,
  size: number,
  type: string
): Promise<string> {
  const { data, error } = await supabase
    .from('files')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      filename,
      url,
      size,
      type,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

// Get conversation files
export async function getConversationFiles(
  conversationId: string
): Promise<ChatFile[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data
}

// Save export
export async function saveExport(
  conversationId: string,
  userId: string,
  format: 'csv' | 'json',
  data: string
): Promise<string> {
  const filename = `chat-export-${Date.now()}.${format}`

  const { data: blob, error } = await supabase.storage
    .from('exports')
    .upload(`${userId}/${filename}`, new Blob([data]), {
      contentType: format === 'json' ? 'application/json' : 'text/csv',
    })

  if (error) throw error

  const { error: dbError } = await supabase
    .from('exports')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      format,
      filename,
      data_url: blob.path,
    })

  if (dbError) throw dbError
  return filename
}
