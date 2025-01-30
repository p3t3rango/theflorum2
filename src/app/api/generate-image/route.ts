import { NextResponse } from 'next/server'

export const runtime = "edge"

export const maxDuration = 60 // Set max duration to 60 seconds

export async function POST(request: Request) {
  console.log('Starting image generation...')
  
  // Log environment check
  console.log('Environment check:', {
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  })

  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Making DALL-E request:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 50)
    })

    // Add timeout to fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 50000) // 50 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Organization': process.env.OPENAI_ORG_ID || ''
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          style: "vivid",
          response_format: "url",
          quality: "standard"
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId) // Clear timeout if request succeeds

      const data = await response.json()
      
      console.log('OpenAI Response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${JSON.stringify(data)}`)
      }

      if (!data.data?.[0]?.url) {
        throw new Error('No image URL in response')
      }

      return NextResponse.json({ 
        success: true,
        imageUrl: data.data[0].url 
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId) // Clear timeout on error
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Request timed out after 50 seconds'
        }, { status: 504 })
      }
      throw fetchError // Re-throw other errors
    }

  } catch (error: any) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack?.split('\n').slice(0, 3)
    })

    return NextResponse.json({
      success: false,
      error: 'Failed to generate image: ' + error.message
    }, { status: 500 })
  }
} 