import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(image, 'lingobros/avatars');

    await connectDB();
    
    // Update user in database
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { photoURL: uploadResult.url, lastActiveAt: new Date() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      photoURL: uploadResult.url,
      user 
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
