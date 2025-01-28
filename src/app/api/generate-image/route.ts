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
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Generating image with prompt:', prompt)

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    })

    try {
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

      return NextResponse.json({ 
        success: true,
        imageUrl: response.data[0].url 
      })
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError)
      
      // Handle OpenAI API errors specifically
      if (openaiError.response) {
        return NextResponse.json({
          success: false,
          error: openaiError.response.data.error.message || 'OpenAI API error',
          details: JSON.stringify(openaiError.response.data)
        }, { status: openaiError.response.status })
      }
      
      return NextResponse.json({
        success: false,
        error: openaiError.message || 'OpenAI API error',
        details: JSON.stringify(openaiError)
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
} 