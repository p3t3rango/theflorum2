import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    })

    // Try a simple DALL-E request
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A simple test image of a blue circle",
      n: 1,
      size: "1024x1024"
    })

    return NextResponse.json({ 
      success: true,
      hasAccess: true,
      url: response.data[0].url
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      type: error.type,
      status: error.status
    })
  }
} 