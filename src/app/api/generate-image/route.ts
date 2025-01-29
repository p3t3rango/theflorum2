import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('Starting image generation...')
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
  })

  try {
    const { prompt } = await request.json()
    console.log('Received prompt length:', prompt?.length)
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    try {
      console.log('Making DALL-E request with prompt length:', prompt.length)
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        style: "vivid",
        response_format: "url",
        quality: "standard"
      })

      console.log('DALL-E response received:', {
        hasResponse: !!response,
        hasData: !!response.data,
        hasUrl: !!response.data?.[0]?.url,
        revised_prompt: response.data?.[0]?.revised_prompt
      })

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL in response')
      }

      return NextResponse.json({ 
        success: true,
        imageUrl: response.data[0].url 
      })

    } catch (openaiError: any) {
      console.error('DALL-E API error:', {
        name: openaiError.name,
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type
      })
      
      return NextResponse.json({
        success: false,
        error: 'Failed to generate image',
        details: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 