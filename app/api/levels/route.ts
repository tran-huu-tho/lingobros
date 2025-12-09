import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Level from '@/models/Level';

export async function GET() {
  try {
    await connectDB();
    
    const levels = await Level.find({ isActive: true })
      .select('name displayName description color')
      .sort({ createdAt: 1 }); // Sắp xếp từ cơ bản đến nâng cao
    
    return NextResponse.json({ levels });
  } catch (error) {
    console.error('Get levels error:', error);
    return NextResponse.json(
      { error: 'Failed to get levels' },
      { status: 500 }
    );
  }
}
