import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatHistory from '@/models/ChatHistory';

export async function POST(req: NextRequest) {
  try {
    const { userId, sourceText, translatedText, sourceLang, targetLang } = await req.json();

    if (!userId || !sourceText || !translatedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const translation = await ChatHistory.create({
      userId,
      type: 'translation',
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: translation._id.toString() });
  } catch (error) {
    console.error('Error saving translation:', error);
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    // Delete all translation history for this user
    await ChatHistory.deleteMany({ 
      userId,
      type: 'translation'
    });

    return NextResponse.json({ message: 'Translation history deleted successfully' });
  } catch (error) {
    console.error('Error deleting translation history:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation history' },
      { status: 500 }
    );
  }
}
