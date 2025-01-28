import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    console.log('Full API Key:', process.env.OPENAI_API_KEY) // This will help debug the format
    console.log('Environment check:', {
      apiKey: process.env.OPENAI_API_KEY?.substring(0, 15) + '...',
      orgId: process.env.OPENAI_ORG_ID,
      nodeEnv: process.env.NODE_ENV
    })
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    })

    // Test with a simple completion
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello!" }]
    })

    return NextResponse.json({ 
      success: true,
      message: response.choices[0].message.content,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyFull: process.env.OPENAI_API_KEY // Show the full key format in the response
    })
  } catch (error) {
    console.error('Full error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyFull: process.env.OPENAI_API_KEY // Show the full key format in the error
    })
  }
} 