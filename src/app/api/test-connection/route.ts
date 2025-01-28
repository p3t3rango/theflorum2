import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  // Add more detailed environment logging
  console.log('All env variables:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.env.PWD,  // This will show us the current working directory
  })

  return NextResponse.json({ 
    status: 'checking',
    env: {
      hasKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      pwd: process.env.PWD
    }
  })
} 