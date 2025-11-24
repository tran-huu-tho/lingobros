import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' | 'video' | 'file'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (type === 'video' || file.type.startsWith('video/')) {
      resourceType = 'video';
    } else if (type === 'file' || !file.type.startsWith('image/')) {
      resourceType = 'raw';
    }

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'lingobros/forum',
      resource_type: resourceType,
    });

    return NextResponse.json({
      type: resourceType === 'video' ? 'video' : resourceType === 'image' ? 'image' : 'file',
      url: result.secure_url,
      publicId: result.public_id,
      name: file.name,
      thumbnail: result.thumbnail_url || result.secure_url
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
