'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useRef } from 'react'
import { MessageDisplay } from './message-display'
import { FileUpload } from './file-upload'
import { Download, Send, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatPanelProps {
  conversationId?: string
  onConversationChange?: (id: string) => void
}

export function ChatPanel({ conversationId, onConversationChange }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      headers: conversationId ? { 'X-Conversation-ID': conversationId } : {},
    }),
  })

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const text =
      inputValue +
      (uploadedFiles.length > 0 ? `\n\nAnalyze these files: ${uploadedFiles.join(', ')}` : '')

    await sendMessage({ text })
    setInputValue('')
    setUploadedFiles([])
    setIsFileUploadOpen(false)
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (data.url) {
      setUploadedFiles((prev) => [...prev, data.filename])
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    let content: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2)
      mimeType = 'application/json'
    } else {
      // CSV format
      const headers = ['Role', 'Content', 'Timestamp']
      const rows = messages.map((msg) => {
        const text =
          msg.parts?.find((p) => p.type === 'text')?.text || msg.content || ''
        return [msg.role, `"${text.replace(/"/g, '""')}"`, new Date().toISOString()]
      })
      content = [headers, ...rows].map((row) => row.join(',')).join('\n')
      mimeType = 'text/csv'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chat-export-${Date.now()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Career Assistant
            </h1>
          </div>
          <button
            onClick={() => setInputValue('')}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to AI Career Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask me anything about job search, resume optimization, interview prep, or career growth.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageDisplay key={index} message={message} />
            ))
          )}
          {status === 'streaming' && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                <div className="flex gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File Upload Section */}
      {isFileUploadOpen && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
          <FileUpload onFileUpload={handleFileUpload} isLoading={status === 'streaming'} />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-3">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((filename, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded bg-blue-100 px-3 py-1 text-sm text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                >
                  <span>{filename}</span>
                  <button
                    onClick={() =>
                      setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask me about your career..."
                disabled={status === 'streaming'}
                className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600"
              />
            </div>
            <button
              onClick={() => setIsFileUploadOpen(!isFileUploadOpen)}
              className="rounded bg-gray-200 p-3 text-gray-600 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              📎
            </button>
            <Button
              onClick={handleSendMessage}
              disabled={status === 'streaming' || !inputValue.trim()}
              className="rounded bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('json')}
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Export as JSON
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Export as CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
