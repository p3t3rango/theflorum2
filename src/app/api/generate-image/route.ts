import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('Starting image generation...')
  
  // Verify environment
  const apiKey = process.env.OPENAI_API_KEY
  const orgId = process.env.OPENAI_ORG_ID
  
  console.log('Environment check:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    hasOrgId: !!orgId,
    nodeEnv: process.env.NODE_ENV
  })
  
  if (!apiKey) {
    console.error('OpenAI API key missing')
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await request.json()
    console.log('Received prompt length:', prompt?.length)
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Initializing OpenAI client...')
    const openai = new OpenAI({
      apiKey: apiKey,
      organization: orgId,
      dangerouslyAllowBrowser: false
    })

    try {
      console.log('Making DALL-E request...')
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
        response_format: "url"
      })

      console.log('DALL-E response status:', {
        hasResponse: !!response,
        hasData: !!response.data,
        hasUrl: !!response.data?.[0]?.url
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
        message: openaiError.message,
        status: openaiError.status,
        response: openaiError.response?.data,
        stack: openaiError.stack
      })
      
      return NextResponse.json({
        success: false,
        error: 'Image generation failed. Please try again.',
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