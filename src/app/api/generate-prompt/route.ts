import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('Environment variables:', {
    hasKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10),
    nodeEnv: process.env.NODE_ENV
  })
  
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    baseURL: "https://api.openai.com/v1"
  })

  try {
    const { character } = await request.json()
    
    const prompt = `Analyze this character profile and create a detailed DALL-E 3 portrait prompt:

Name: ${character.name}
Role: ${character.role}
Key Features: ${character.appearance?.features}
Age: ${character.appearance?.age}
Height: ${character.appearance?.height}
Talents: ${character.talents}
Flaws: ${character.flaws}
Motivations: ${character.motivations}

Consider their role as ${character.role} and how their talents (${character.talents}) and flaws (${character.flaws}) might manifest in their appearance.
Create a single, focused portrait description that captures their essence in the mystical Eternal Garden setting.
Focus on the most striking visual elements, atmosphere, and how their inner nature manifests in their appearance.
Format as a clear, direct DALL-E prompt that will create a high-quality character portrait.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating detailed, atmospheric image prompts for DALL-E 3. You specialize in fantasy character portraits that blend realism with ethereal elements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({ prompt: completion.choices[0].message.content })
  } catch (error) {
    console.error('Error generating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    )
  }
} 