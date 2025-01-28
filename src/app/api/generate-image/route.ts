import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const orgId = process.env.OPENAI_ORG_ID

export async function POST(request: Request) {
  console.log('Starting image generation...')
  console.log('API Key length:', apiKey?.length)
  console.log('Organization ID length:', orgId?.length)
  
  if (!apiKey) {
    console.error('OpenAI API key missing')
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await request.json()
    console.log('Received prompt:', prompt)
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Initializing OpenAI client...')

    const configuration = {
      apiKey: apiKey,
      organization: orgId,
      dangerouslyAllowBrowser: true
    }

    const openai = new OpenAI(configuration)

    try {
      console.log('Calling OpenAI API with configuration:', {
        hasApiKey: !!configuration.apiKey,
        hasOrgId: !!configuration.organization
      })
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      })

      console.log('OpenAI response received:', !!response.data)

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