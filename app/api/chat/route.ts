import { NextRequest, NextResponse } from 'next/server';
import { getEnglishTutorResponse } from '@/lib/gemini';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import ChatHistory from '@/models/ChatHistory';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        // User not authenticated, continue as guest
      }
    }

    // Get AI response with appropriate context
    const response = await getEnglishTutorResponse(message, context, !userId);

    // Save chat history if user is logged in
    if (userId) {
      await connectDB();
      await ChatHistory.findOneAndUpdate(
        { userId },
        {
          $push: {
            messages: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: response, timestamp: new Date() }
            ]
          }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      message: response,
      timestamp: new Date(),
      isGuest: !userId
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}

// Get chat history for logged in user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    await connectDB();
    const chatHistory = await ChatHistory.findOne({ userId });

    return NextResponse.json({
      messages: chatHistory?.messages || []
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat history' },
      { status: 500 }
    );
  }
}
