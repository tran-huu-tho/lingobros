import { NextRequest, NextResponse } from 'next/server';
import { getEnglishTutorResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await getEnglishTutorResponse(message, context);

    return NextResponse.json({ 
      message: response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
