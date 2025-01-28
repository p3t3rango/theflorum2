import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { character } = await request.json()
    
    const prompt = `Create a detailed DALL-E 3 portrait prompt for this character:

Character Profile:
- Name: ${character.name}
- Role: ${character.role}
- Physical Features: ${character.appearance?.features || 'Not specified'}
- Age: ${character.appearance?.age || 'Not specified'}
- Height: ${character.appearance?.height || 'Not specified'}
- Talents: ${character.talents || 'Not specified'}
- Flaws: ${character.flaws || 'Not specified'}
- Motivations: ${character.motivations || 'Not specified'}

Instructions:
1. Create a SINGLE, concise paragraph (max 100 words)
2. Focus on visual elements only
3. Include key physical features and magical attributes
4. Describe lighting and atmosphere briefly
5. Use DALL-E 3 compatible language
6. Avoid elaborate storytelling or background lore
7. End with ", Unreal Engine 8k render"

Format as: "A [style] portrait of [character description], [key visual elements], [atmosphere/lighting], Unreal Engine 8k render"`

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    })

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating concise, effective DALL-E 3 prompts. Keep responses focused, visual, and under 100 words. Do not include storytelling or non-visual elements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const generatedPrompt = completion.choices[0].message.content
      console.log('Generated prompt:', generatedPrompt)

      return NextResponse.json({ prompt: generatedPrompt })
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      return NextResponse.json(
        { 
          error: openaiError instanceof Error ? openaiError.message : 'OpenAI API error',
          details: JSON.stringify(openaiError)
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process request',
        details: JSON.stringify(error)
      },
      { status: 400 }
    )
  }
} 