'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content?: string
  parts?: Array<{ type: string; text?: string }>
}

interface MessageDisplayProps {
  message: Message
}

export function MessageDisplay({ message }: MessageDisplayProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const getText = (msg: Message): string => {
    // Try parts first
    if (msg.parts && Array.isArray(msg.parts)) {
      const textParts = msg.parts
        .filter((p) => p.type === 'text' && p.text)
        .map((p) => p.text || '')
      if (textParts.length > 0) return textParts.join('')
    }
    // Fall back to content
    return msg.content || ''
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const text = getText(message)

  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl rounded-lg px-4 py-3 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
        }`}
      >
        {message.role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : 'text'
                const code = String(children).replace(/\n$/, '')

                if (!inline) {
                  return (
                    <div className="relative my-4 rounded-lg bg-gray-900 p-4">
                      <button
                        onClick={() => handleCopyCode(code)}
                        className="absolute right-2 top-2 flex items-center gap-2 rounded bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-600"
                      >
                        {copiedCode === code ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                      <SyntaxHighlighter
                        language={language}
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                        }}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  )
                }

                return (
                  <code className="rounded bg-gray-200 px-2 py-1 dark:bg-gray-700" {...props}>
                    {children}
                  </code>
                )
              },
              a({ node, ...props }: any) {
                return (
                  <a
                    className="text-blue-600 underline dark:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                )
              },
              p({ node, ...props }: any) {
                return <p className="mb-3 last:mb-0" {...props} />
              },
              ul({ node, ...props }: any) {
                return <ul className="mb-3 list-inside list-disc space-y-1" {...props} />
              },
              ol({ node, ...props }: any) {
                return <ol className="mb-3 list-inside list-decimal space-y-1" {...props} />
              },
            }}
          >
            {text}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  )
}

  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl rounded-lg px-4 py-3 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
        }`}
      >
        {message.role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : 'text'
                const code = String(children).replace(/\n$/, '')

                if (!inline) {
                  return (
                    <div className="relative my-4 rounded-lg bg-gray-900 p-4">
                      <button
                        onClick={() => handleCopyCode(code)}
                        className="absolute right-2 top-2 flex items-center gap-2 rounded bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-600"
                      >
                        {copiedCode === code ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                      <SyntaxHighlighter
                        language={language}
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                        }}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  )
                }

                return (
                  <code className="rounded bg-gray-200 px-2 py-1 dark:bg-gray-700" {...props}>
                    {children}
                  </code>
                )
              },
              a({ node, ...props }: any) {
                return (
                  <a
                    className="text-blue-600 underline dark:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                )
              },
              p({ node, ...props }: any) {
                return <p className="mb-3 last:mb-0" {...props} />
              },
              ul({ node, ...props }: any) {
                return <ul className="mb-3 list-inside list-disc space-y-1" {...props} />
              },
              ol({ node, ...props }: any) {
                return <ol className="mb-3 list-inside list-decimal space-y-1" {...props} />
              },
            }}
          >
            {text}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  )
}
