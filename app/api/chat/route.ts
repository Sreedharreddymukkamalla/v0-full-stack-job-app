import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json()
  const messages = Array.isArray(body.messages) ? body.messages : []
  const model = body.model || 'openai/gpt-4o'
  const webSearch = body.webSearch || false

  try {
    const systemPrompt = `You are an AI Career Assistant for a job search platform. You help users with:
- Job recommendations based on their skills and experience
- Resume optimization advice
- Interview preparation tips
- Career guidance and development
- Salary negotiation strategies
- LinkedIn profile optimization
- Cover letter writing assistance

Be friendly, professional, and provide actionable advice. When discussing code or technical topics, format it clearly with syntax highlighting where appropriate.${webSearch ? '\nYou have access to web search capabilities and should use them when relevant.' : ''}`

    const result = streamText({
      model: openai(model === 'openai/gpt-4o' ? 'gpt-4o' : 'gpt-4-turbo'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
