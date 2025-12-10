import { NextRequest, NextResponse } from 'next/server';
import { getEnglishTutorResponse } from '@/lib/gemini';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import ChatHistory from '@/models/ChatHistory';
import { buildChatbotContext, getFAQAnswer } from '@/lib/chatbot-knowledge-base';

export async function POST(req: NextRequest) {
  try {
    const { message, context, contextType, contextData } = await req.json();

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
        console.log('Guest chat request');
      }
    }

    // Check if this is a FAQ question - respond instantly
    const faqAnswer = getFAQAnswer(message);
    if (faqAnswer) {
      const response = faqAnswer;
      
      // Save to history if logged in
      if (userId) {
        try {
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
        } catch (dbError) {
          console.error('Database error (non-critical):', dbError);
        }
      }

      return NextResponse.json({ 
        message: response,
        timestamp: new Date(),
        isGuest: !userId,
        isFAQ: true
      });
    }

    // Build enhanced context with system knowledge
    const enhancedContext = context || buildChatbotContext(contextType, contextData);

    // Get AI response with appropriate context
    let response: string;
    try {
      response = await getEnglishTutorResponse(message, enhancedContext, !userId);
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      // Fallback response if Gemini fails
      response = 'Xin lỗi, Frosty gặp chút vấn đề nhỏ với não tuyết. 🤖❄️ Hãy thử lại câu hỏi khác nhé!';
    }

    // Save chat history if user is logged in
    if (userId) {
      try {
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
      } catch (dbError) {
        console.error('Database error (non-critical):', dbError);
        // Continue - we still have the AI response for guest
      }
    }

    return NextResponse.json({ 
      message: response,
      timestamp: new Date(),
      isGuest: !userId
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: String(error) },
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
        { messages: [] }, // Return empty for guests
        { status: 200 }
      );
    }

    const token = authHeader.substring(7);
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const userId = decodedToken.uid;

      await connectDB();
      const chatHistory = await ChatHistory.findOne({ userId });

      return NextResponse.json({
        messages: chatHistory?.messages || []
      });
    } catch (authError) {
      return NextResponse.json(
        { messages: [] },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { messages: [] },
      { status: 200 }
    );
  }
}
