import ForumPost from '@/models/ForumPost';
import connectDB from '@/lib/mongodb';
import { Types } from 'mongoose';

// GET - Lấy chi tiết bài viết
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const post = await ForumPost.findById(id);
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }
    return Response.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return Response.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT - Like/Unlike bài viết, comment, reply hoặc edit bài viết
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId, action, commentId, replyId, visibility, title, content, tags } = await req.json();

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    // Edit post (content, tags, media)
    if (content || tags || media !== undefined) {
      if (post.author.userId !== userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (content) post.content = content;
      if (tags && Array.isArray(tags)) post.tags = tags;
      if (media !== undefined) post.media = media;
      post.updatedAt = new Date();

      await post.save();
      return Response.json(post);
    }

    if (commentId && replyId) {
      // Like/Unlike reply
      const comment = post.comments.id(commentId);
      if (!comment) {
        return Response.json({ error: 'Comment not found' }, { status: 404 });
      }

      const reply = comment.replies?.id(replyId);
      if (!reply) {
        return Response.json({ error: 'Reply not found' }, { status: 404 });
      }

      if (action === 'like') {
        if (!reply.likedBy || !Array.isArray(reply.likedBy)) {
          reply.likedBy = [];
        }
        if (!reply.likedBy.includes(userId)) {
          reply.likedBy.push(userId);
          reply.likes = (reply.likes || 0) + 1;
        }
      } else if (action === 'unlike') {
        if (reply.likedBy && Array.isArray(reply.likedBy)) {
          const index = reply.likedBy.indexOf(userId);
          if (index > -1) {
            reply.likedBy.splice(index, 1);
            reply.likes = Math.max(0, (reply.likes || 0) - 1);
          }
        }
      }
    } else if (commentId) {
      // Like/Unlike comment
      const comment = post.comments.id(commentId);
      if (!comment) {
        return Response.json({ error: 'Comment not found' }, { status: 404 });
      }

      if (action === 'like') {
        if (!comment.likedBy || !Array.isArray(comment.likedBy)) {
          comment.likedBy = [];
        }
        if (!comment.likedBy.includes(userId)) {
          comment.likedBy.push(userId);
          comment.likes = (comment.likes || 0) + 1;
        }
      } else if (action === 'unlike') {
        if (comment.likedBy && Array.isArray(comment.likedBy)) {
          const index = comment.likedBy.indexOf(userId);
          if (index > -1) {
            comment.likedBy.splice(index, 1);
            comment.likes = Math.max(0, (comment.likes || 0) - 1);
          }
        }
      }
    } else {
      // Like/Unlike post
      if (action === 'like') {
        if (!post.likedBy || !Array.isArray(post.likedBy)) {
          post.likedBy = [];
        }
        if (!post.likedBy.includes(userId)) {
          post.likedBy.push(userId);
          post.likes = (post.likes || 0) + 1;
        }
      } else if (action === 'unlike') {
        if (post.likedBy && Array.isArray(post.likedBy)) {
          const index = post.likedBy.indexOf(userId);
          if (index > -1) {
            post.likedBy.splice(index, 1);
            post.likes = Math.max(0, (post.likes || 0) - 1);
          }
        }
      }
    }

    await post.save();
    return Response.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return Response.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// POST - Thêm comment vào bài viết hoặc reply vào comment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId, userName, userAvatar, content, commentId, replyingToUserId, replyingToName } = await req.json();

    if (!userId || !content?.trim()) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (commentId) {
      // Thêm reply vào comment
      const comment = post.comments.id(commentId);
      if (!comment) {
        return Response.json({ error: 'Comment not found' }, { status: 404 });
      }

      const newReply = {
        _id: new Types.ObjectId(),
        author: {
          userId,
          name: userName || 'Anonymous',
          avatar: userAvatar || ''
        },
        content: content.trim(),
        likes: 0,
        likedBy: [],
        replyingTo: replyingToUserId && replyingToName ? {
          userId: replyingToUserId,
          name: replyingToName
        } : undefined,
        createdAt: new Date()
      };

      if (!comment.replies) {
        comment.replies = [];
      }
      comment.replies.push(newReply as any);
    } else {
      // Thêm comment mới vào bài viết
      const newComment = {
        _id: new Types.ObjectId(),
        author: {
          userId,
          name: userName || 'Anonymous',
          avatar: userAvatar || ''
        },
        content: content.trim(),
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: new Date()
      };

      post.comments.push(newComment as any);
    }

    await post.save();
    return Response.json(post);
  } catch (error) {
    console.error('Error adding comment/reply:', error);
    return Response.json({ error: 'Failed to add comment/reply' }, { status: 500 });
  }
}

// DELETE - Xóa bài viết, comment hoặc reply
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId, commentId, replyId } = await req.json();

    const post = await ForumPost.findById(id);
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (commentId && replyId) {
      // Xóa reply trong comment
      const comment = post.comments.id(commentId);
      if (!comment) {
        return Response.json({ error: 'Comment not found' }, { status: 404 });
      }

      const reply = comment.replies?.id(replyId);
      if (!reply) {
        return Response.json({ error: 'Reply not found' }, { status: 404 });
      }

      if (reply.author.userId !== userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      comment.replies?.id(replyId)?.deleteOne();
    } else if (commentId) {
      // Xóa comment
      const comment = post.comments.id(commentId);
      if (!comment) {
        return Response.json({ error: 'Comment not found' }, { status: 404 });
      }

      if (comment.author.userId !== userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      post.comments.id(commentId).deleteOne();
    } else {
      // Xóa bài viết
      if (post.author.userId !== userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      await ForumPost.findByIdAndDelete(id);
      return Response.json({ message: 'Post deleted' });
    }

    await post.save();
    return Response.json(post);
  } catch (error) {
    console.error('Error deleting:', error);
    return Response.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
