import ForumPost from '@/models/ForumPost';
import connectDB from '@/lib/mongodb';

// GET - Lấy danh sách bài viết
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    await connectDB();
    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [
          { content: { $regex: search, $options: 'i' } },
          { 'tags': { $regex: search, $options: 'i' } }
        ]}
      : {};

    const posts = await ForumPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForumPost.countDocuments(query);

    return Response.json({ 
      posts, 
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST - Tạo bài viết mới
export async function POST(req: Request) {
  try {
    await connectDB();
    const { content, tags, userId, userName, userAvatar, media } = await req.json();

    if (!content?.trim() || !userId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await ForumPost.create({
      content: content.trim(),
      tags: tags && tags.length > 0 ? tags : [],
      media: media || [],
      author: {
        userId,
        name: userName || 'Anonymous',
        avatar: userAvatar || ''
      }
    });

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return Response.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
