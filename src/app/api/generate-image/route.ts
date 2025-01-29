import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('Starting image generation...')
  
  // Log API key status (safely)
  const apiKey = process.env.OPENAI_API_KEY
  console.log('API Key length:', apiKey?.length)
  console.log('API Key starts with:', apiKey?.substring(0, 4))
  
  if (!apiKey) {
    console.error('OpenAI API key missing')
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
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

    console.log('Creating OpenAI client...')
    const openai = new OpenAI({
      apiKey: apiKey,
      organization: process.env.OPENAI_ORG_ID
    })

    try {
      console.log('Calling DALL-E API...')
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      })

      console.log('DALL-E response received:', !!response)
      console.log('Response data exists:', !!response.data)
      console.log('URL exists:', !!response.data?.[0]?.url)

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL in response')
      }

      return NextResponse.json({ 
        success: true,
        imageUrl: response.data[0].url 
      })
    } catch (openaiError: any) {
      console.error('DALL-E API error:', openaiError)
      console.error('Error details:', JSON.stringify(openaiError, null, 2))
      
      return NextResponse.json({
        success: false,
        error: openaiError.message || 'DALL-E API error',
        details: JSON.stringify(openaiError)
      }, { status: 500 })
    }
  } catch (error) {
    console.error('General error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
} 