import { NextRequest, NextResponse } from 'next/server'

type Provider = 'openai' | 'claude' | 'gemini' | 'deepseek'

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  provider: Provider
}

// Provider configurations
const providerConfigs = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash',
    apiKeyEnv: 'GOOGLE_API_KEY',
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
  },
}

async function callOpenAI(
  messages: ChatRequest['messages'],
  apiKey: string,
  config: typeof providerConfigs.openai
) {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callClaude(
  messages: ChatRequest['messages'],
  apiKey: string,
  config: typeof providerConfigs.claude
) {
  // Convert messages format for Claude
  const systemMessage = messages.find((m) => m.role === 'assistant' && messages.indexOf(m) === 0)
  const chatMessages = messages.filter(
    (m) => !(m.role === 'assistant' && messages.indexOf(m) === 0)
  )

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      system: systemMessage?.content || 'You are a helpful assistant.',
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function callGemini(
  messages: ChatRequest['messages'],
  apiKey: string,
  config: typeof providerConfigs.gemini
) {
  const url = `${config.url}?key=${apiKey}`

  // Convert messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callDeepSeek(
  messages: ChatRequest['messages'],
  apiKey: string,
  config: typeof providerConfigs.deepseek
) {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function POST(request: NextRequest) {
  try {
    const { messages, provider }: ChatRequest = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const config = providerConfigs[provider]
    if (!config) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const apiKey = process.env[config.apiKeyEnv]
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured. Please set ${config.apiKeyEnv} in your .env file.` },
        { status: 500 }
      )
    }

    let content: string

    switch (provider) {
      case 'openai':
        content = await callOpenAI(messages, apiKey, config)
        break
      case 'claude':
        content = await callClaude(messages, apiKey, config)
        break
      case 'gemini':
        content = await callGemini(messages, apiKey, config)
        break
      case 'deepseek':
        content = await callDeepSeek(messages, apiKey, config)
        break
      default:
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}
