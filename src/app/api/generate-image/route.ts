import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('API Key available:', !!process.env.OPENAI_API_KEY)
  
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      throw new Error('No prompt provided')
    }

    console.log('Generating image with prompt:', prompt)

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    })

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    })

    console.log('DALL-E response:', response)

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in response')
    }

    return NextResponse.json({ imageUrl: response.data[0].url })
  } catch (error) {
    console.error('Error in generate-image:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      },
      { status: 500 }
    )
  }
} 