import { UIMessage } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, format, title } = await req.json()

    if (!messages || !format) {
      return NextResponse.json(
        { error: 'Missing messages or format' },
        { status: 400 }
      )
    }

    let content: string
    let contentType: string
    let filename: string

    if (format === 'json') {
      const exportData = {
        title: title || 'Chat Export',
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages.map((msg: UIMessage) => ({
          role: msg.role,
          content:
            msg.parts?.find((p) => p.type === 'text')?.text || msg.content || '',
          timestamp: new Date().toISOString(),
        })),
      }
      content = JSON.stringify(exportData, null, 2)
      contentType = 'application/json'
      filename = `chat-export-${Date.now()}.json`
    } else if (format === 'csv') {
      const headers = ['Role', 'Message', 'Timestamp']
      const rows = messages.map((msg: UIMessage) => {
        const text =
          msg.parts?.find((p) => p.type === 'text')?.text || msg.content || ''
        return [msg.role, `"${text.replace(/"/g, '""')}"`, new Date().toISOString()]
      })

      content = [headers, ...rows].map((row) => row.join(',')).join('\n')
      contentType = 'text/csv'
      filename = `chat-export-${Date.now()}.csv`
    } else if (format === 'markdown') {
      const lines: string[] = []
      lines.push(`# Chat Export - ${title || 'Conversation'}`)
      lines.push(`\n*Exported at: ${new Date().toISOString()}*\n`)

      messages.forEach((msg: UIMessage, index: number) => {
        const text =
          msg.parts?.find((p) => p.type === 'text')?.text || msg.content || ''
        const role = msg.role === 'user' ? 'You' : 'Assistant'
        lines.push(`## ${role}`)
        lines.push(text)
        lines.push('')
      })

      content = lines.join('\n')
      contentType = 'text/markdown'
      filename = `chat-export-${Date.now()}.md`
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const blob = new Blob([content], { type: contentType })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
