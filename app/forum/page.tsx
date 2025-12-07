'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, Plus, ThumbsUp, MessageCircle, Search, Filter, X, Heart } from 'lucide-react';
import Link from 'next/link';

interface Media {
  type: 'image' | 'video' | 'file' | 'link';
  url: string;
  publicId?: string;
  name?: string;
  thumbnail?: string;
}

interface Reply {
  _id: string;
  author: {
    name: string;
    userId: string;
    avatar: string;
  };
  content: string;
  likes: number;
  likedBy: string[];
  replyingTo?: {
    userId: string;
    name: string;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  author: {
    name: string;
    userId: string;
    avatar: string;
  };
  content: string;
  likes: number;
  likedBy: string[];
  replies?: Reply[];
  createdAt: string;
}

interface Post {
  _id: string;
  author: {
    name: string;
    userId: string;
    avatar: string;
  };
  content: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  media?: Media[];
  createdAt: string;
  tags: string[];
}

export default function Forum() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', tags: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Media[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [searchHashtag, setSearchHashtag] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [trendingHashtags, setTrendingHashtags] = useState<Array<{ tag: string; count: number }>>([]);
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'oldest' | 'mostComments'>('trending');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Danh sách tag có sẵn
  const availableTags = ['Ngữ pháp', 'IELTS', 'Tips', 'Từ vựng', 'Phát âm', 'Đọc hiểu', 'Nghe', 'Viết', 'Nói'];
  
  // Detail view states
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToReplyId, setReplyingToReplyId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Post menu dropdown state
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [listMenuOpenId, setListMenuOpenId] = useState<string | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState({ content: '', tags: '' });
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([]);
  const [editMediaFiles, setEditMediaFiles] = useState<Media[]>([]);
  const [showCommentsLimit, setShowCommentsLimit] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch(`/api/forum/posts?page=1&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      const postsData = data.posts || [];
      setPosts(postsData);
      
      // Tính toán hashtag trending
      calculateTrendingHashtags(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const calculateTrendingHashtags = (postsData: Post[]) => {
    const hashtagCount: { [key: string]: number } = {};
    
    // Đếm số lần xuất hiện của mỗi hashtag
    postsData.forEach((post) => {
      post.tags?.forEach((tag) => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });
    
    // Chuyển đổi thành array và sắp xếp theo số lượng giảm dần
    const trending = Object.entries(hashtagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Lấy 5 hashtag nổi bật nhất
    
    setTrendingHashtags(trending);
  };

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setSelectedPostId(post._id);
  };

  const handleUploadMedia = async (file: File, type: 'image' | 'video' | 'file', isEdit = false) => {
    setUploadingMedia(true);
    try {
      const token = await user?.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/forum/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const media = await response.json();
        if (isEdit) {
          setEditMediaFiles([...editMediaFiles, media]);
        } else {
          setMediaFiles([...mediaFiles, media]);
        }
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Lỗi khi tải file lên');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleLikePost = async () => {
    if (!selectedPost || !user?.uid) return;
    
    const isLiked = selectedPost.likedBy?.includes(user.uid);
    try {
      const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          action: isLiked ? 'unlike' : 'like'
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !user?.uid || !newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: userData?.displayName || user.displayName,
          userAvatar: userData?.photoURL || user.photoURL,
          content: newComment
        })
      });

      if (response.ok) {
        const updatedPost = await fetch(`/api/forum/posts/${selectedPost._id}`).then(r => r.json());
        setSelectedPost(updatedPost);
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!selectedPost || !user?.uid) return;

    const comment = selectedPost.comments?.find(c => c._id === commentId);
    if (!comment) return;

    const isLiked = comment.likedBy?.includes(user.uid);
    try {
      const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          action: isLiked ? 'unlike' : 'like',
          commentId
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost || !user?.uid) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa bình luận',
      message: 'Bạn chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid,
              commentId
            })
          });

          if (response.ok) {
            const updatedPost = await response.json();
            setSelectedPost(updatedPost);
            setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
          }
        } catch (error) {
          console.error('Error deleting comment:', error);
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleAddReply = async (commentId: string, replyingToUserId?: string, replyingToName?: string) => {
    if (!selectedPost || !user?.uid || !newReply.trim()) return;

    setReplySubmitting(true);
    try {
      const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: userData?.displayName || user.displayName,
          userAvatar: userData?.photoURL || user.photoURL,
          content: newReply,
          commentId,
          replyingToUserId,
          replyingToName
        })
      });

      if (response.ok) {
        const updatedPost = await fetch(`/api/forum/posts/${selectedPost._id}`).then(r => r.json());
        setSelectedPost(updatedPost);
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
        setNewReply('');
        setReplyingToCommentId(null);
        setReplyingToReplyId(null);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!selectedPost || !user?.uid) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa trả lời',
      message: 'Bạn chắc chắn muốn xóa trả lời này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid,
              commentId,
              replyId
            })
          });

          if (response.ok) {
            const updatedPost = await response.json();
            setSelectedPost(updatedPost);
            setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
          }
        } catch (error) {
          console.error('Error deleting reply:', error);
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!selectedPost || !user?.uid) return;

    const comment = selectedPost.comments?.find(c => c._id === commentId);
    if (!comment) return;

    const reply = comment.replies?.find(r => r._id === replyId);
    if (!reply) return;

    const isLiked = reply.likedBy?.includes(user.uid);
    try {
      const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          action: isLiked ? 'unlike' : 'like',
          commentId,
          replyId
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
      }
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost || !user?.uid) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa bài viết',
      message: 'Bạn chắc chắn muốn xóa bài viết này? Tất cả bình luận và trả lời sẽ bị xóa. Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid
            })
          });

          if (response.ok) {
            const updatedPosts = posts.filter(p => p._id !== selectedPost._id);
            setPosts(updatedPosts);
            calculateTrendingHashtags(updatedPosts);
            setSelectedPost(null);
            setSelectedPostId(null);
            setPostMenuOpen(false);
            setListMenuOpenId(null);
          }
        } catch (error) {
          console.error('Error deleting post:', error);
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleUpdateVisibility = async (visibility: 'public' | 'private') => {
    // Removed - no longer needed
  };

  const handleEditPost = async () => {
    if (!selectedPost || !user?.uid) return;
    if (!editPostData.content.trim() && editSelectedTags.length === 0) return;

    try {
      const response = await fetch(`/api/forum/posts/${selectedPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          content: editPostData.content,
          tags: editSelectedTags,
          media: editMediaFiles
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        const updatedPosts = posts.map(p => p._id === updatedPost._id ? updatedPost : p);
        setSelectedPost(updatedPost);
        setPosts(updatedPosts);
        calculateTrendingHashtags(updatedPosts);
        setIsEditingPost(false);
        setPostMenuOpen(false);
        setListMenuOpenId(null);
      }
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      alert('Vui lòng điền nội dung');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPost.content,
          tags: selectedTags,
          media: mediaFiles,
          userId: user?.uid,
          userName: userData?.displayName || user?.displayName,
          userAvatar: userData?.photoURL || user?.photoURL || ''
        })
      });

      if (response.ok) {
        const createdPost = await response.json();
        const updatedPosts = [createdPost, ...posts];
        setPosts(updatedPosts);
        calculateTrendingHashtags(updatedPosts);
        setNewPost({ content: '', tags: '' });
        setSelectedTags([]);
        setMediaFiles([]);
        setShowNewPostModal(false);
      } else {
        alert('Lỗi khi đăng bài');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Lỗi: Không thể đăng bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    xp: 0,
    streak: 0,
    level: 'beginner'
  };

  const userPhoto = userData?.photoURL || user?.photoURL;
  const optimizedPhoto = userPhoto?.includes('googleusercontent.com') && userPhoto?.includes('=s96-c')
    ? userPhoto.replace('=s96-c', '=s400-c')
    : userPhoto;

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={userData?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
              <div className="text-4xl">☃️</div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href={userData?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <Home className="w-5 h-5" />
                Trang chủ
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <BarChart3 className="w-5 h-5" />
                Bảng xếp hạng
              </Link>
              <Link href="/translate" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <Languages className="w-5 h-5" />
                Dịch thuật
              </Link>
              <Link href="/ipa" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <Volume2 className="w-5 h-5" />
                IPA
              </Link>
              <Link href="/forum" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
                <MessageSquare className="w-5 h-5" />
                Hỏi đáp
              </Link>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition group"
              >
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName}
                    className="w-9 h-9 rounded-full object-cover shadow-lg group-hover:shadow-blue-500/50 transition-shadow"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-100 font-semibold text-sm leading-tight">{displayData.displayName}</span>
                  <span className={`text-xs ${userData?.isAdmin ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {userData?.isAdmin ? 'Admin' : 'Học viên'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 bg-linear-to-br from-blue-600/20 to-purple-600/20 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      {optimizedPhoto ? (
                        <img 
                          src={optimizedPhoto} 
                          alt={displayData.displayName}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {displayData.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{displayData.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-5 h-5" />
                    Hồ sơ người dùng
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">Hỏi Đáp Cộng Đồng</h1>
            <p className="text-xl text-gray-400">Chia sẻ kiến thức và học hỏi từ cộng đồng</p>
          </div>

          {/* New Post Button */}
          <div className="mb-6 flex justify-center">
            <button 
              onClick={() => setShowNewPostModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Đăng bài mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl transition"
                >
                  <Filter className="w-5 h-5" />
                  Lọc
                </button>
                
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-40">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSortBy('trending');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center gap-2 ${
                          sortBy === 'trending'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        🔥 Nổi bật
                      </button>
                      
                      <button
                        onClick={() => {
                          setSortBy('newest');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center gap-2 ${
                          sortBy === 'newest'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        ⏰ Mới nhất
                      </button>
                      
                      <button
                        onClick={() => {
                          setSortBy('oldest');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center gap-2 ${
                          sortBy === 'oldest'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        📅 Cũ nhất
                      </button>
                      
                      <button
                        onClick={() => {
                          setSortBy('mostComments');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center gap-2 ${
                          sortBy === 'mostComments'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        💬 Bình luận nhiều
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Trending Hashtags */}
          <div className="mb-6 py-4 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">🔥 Hashtag Nổi Bật</h3>
              <div className="flex gap-2 flex-wrap">
                {trendingHashtags.map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => {
                      setSearchHashtag(item.tag);
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-linear-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/50 hover:border-blue-400 rounded-full text-sm text-gray-300 hover:text-blue-300 transition flex items-center gap-1.5"
                  >
                    <span>#{item.tag}</span>
                    <span className="text-xs text-gray-500 font-medium">({item.count})</span>
                  </button>
                ))}
              </div>
            </div>

          {/* Active Filter Display */}
          {searchHashtag && (
            <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-300">
                Đang xem bài viết có hashtag: <strong>#{searchHashtag}</strong>
              </span>
              <button
                onClick={() => setSearchHashtag(null)}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Xóa lọc
              </button>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</p>
              </div>
            ) : (
              posts
                .filter((post) => {
                  // Lọc theo hashtag nếu đang tìm kiếm hashtag
                  if (searchHashtag) {
                    return post.tags.some(tag => tag.toLowerCase() === searchHashtag.toLowerCase());
                  }
                  
                  // Lọc theo tìm kiếm (nội dung hoặc hashtag)
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    // Tìm theo nội dung
                    const matchesContent = 
                      post.content.toLowerCase().includes(query);
                    
                    // Tìm theo hashtag (chỉ cần chứa một phần của hashtag)
                    const matchesHashtag = post.tags?.some(tag => 
                      tag.toLowerCase().includes(query)
                    );
                    
                    return matchesContent || matchesHashtag;
                  }
                  
                  return true;
                })
                .sort((a, b) => {
                  // Sắp xếp theo điều kiện được chọn
                  if (sortBy === 'trending') {
                    // Nổi bật: theo likes và bình luận
                    const scoreA = a.likes + (a.comments?.length || 0) * 2;
                    const scoreB = b.likes + (b.comments?.length || 0) * 2;
                    return scoreB - scoreA;
                  } else if (sortBy === 'newest') {
                    // Mới nhất
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  } else if (sortBy === 'oldest') {
                    // Cũ nhất
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  } else if (sortBy === 'mostComments') {
                    // Bình luận nhiều
                    return (b.comments?.length || 0) - (a.comments?.length || 0);
                  }
                  return 0;
                })
                .map((post) => (
                <div
                  key={post._id}
                  onClick={() => handleSelectPost(post)}
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition cursor-pointer"
                >
                  {/* Author Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {post.author.avatar ? (
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextEl) nextEl.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold ${post.author.avatar ? 'hidden' : ''}`}>
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white font-semibold block">{post.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Menu ba chấm - chỉ hiển thị cho chủ bài viết */}
                    {post.author.userId === user?.uid && (
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setListMenuOpenId(listMenuOpenId === post._id ? null : post._id)}
                          className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-lg"
                        >
                          <span className="text-xl">⋮</span>
                        </button>
                        
                        {listMenuOpenId === post._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-40">
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setIsEditingPost(true);
                                setEditPostData({
                                  content: post.content,
                                  tags: post.tags.join(', ')
                                });
                                setEditSelectedTags(post.tags);
                                setEditMediaFiles(post.media || []);
                                setListMenuOpenId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 transition"
                            >
                              Chỉnh sửa
                            </button>
                            
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Xóa bài viết',
                                  message: 'Bạn chắc chắn muốn xóa bài viết này? Tất cả bình luận và trả lời sẽ bị xóa. Hành động này không thể hoàn tác.',
                                  onConfirm: async () => {
                                    try {
                                      const response = await fetch(`/api/forum/posts/${post._id}`, {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: user.uid })
                                      });
                                      if (response.ok) {
                                        const updatedPosts = posts.filter(p => p._id !== post._id);
                                        setPosts(updatedPosts);
                                        calculateTrendingHashtags(updatedPosts);
                                      }
                                    } catch (error) {
                                      console.error('Error deleting post:', error);
                                    }
                                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                                  }
                                });
                                setListMenuOpenId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20 transition border-t border-gray-600"
                            >
                              Xóa bài viết
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-gray-300 line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  {/* Media Preview */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-4">
                      {post.media.length === 1 ? (
                        <div className="rounded-lg overflow-hidden bg-gray-900">
                          {post.media[0].type === 'image' ? (
                            <img src={post.media[0].url} alt="" className="w-full max-h-64 object-cover rounded-lg cursor-pointer" />
                          ) : post.media[0].type === 'video' ? (
                            <video src={post.media[0].url} className="w-full max-h-64 object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm p-2">
                              📎 {post.media[0].name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {post.media.slice(0, 4).map((media, idx) => (
                            <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-900 h-48">
                              {media.type === 'image' ? (
                                <img src={media.url} alt="" className="w-full h-full object-cover" />
                              ) : media.type === 'video' ? (
                                <video src={media.url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-2">
                                  📎 {media.name}
                                </div>
                              )}
                              {idx === 3 && post.media.length > 4 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-xl">
                                  +{post.media.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center gap-6 text-gray-400 text-sm border-t border-gray-700 pt-4">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const isLiked = Array.isArray(post.likedBy) && post.likedBy.includes(user?.uid || '');
                        try {
                          const response = await fetch(`/api/forum/posts/${post._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: user?.uid,
                              action: isLiked ? 'unlike' : 'like'
                            })
                          });
                          if (response.ok) {
                            const updatedPost = await response.json();
                            setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
                          }
                        } catch (error) {
                          console.error('Error liking post:', error);
                        }
                      }}
                      className={`flex items-center gap-2 transition ${
                        Array.isArray(post.likedBy) && post.likedBy.includes(user?.uid || '')
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${Array.isArray(post.likedBy) && post.likedBy.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPost(post);
                      }}
                      className="flex items-center gap-2 hover:text-blue-400 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {(post.comments?.length || 0) + 
                         (post.comments?.reduce((total, comment) => total + (comment.replies?.length || 0), 0) || 0)}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => { 
              setShowNewPostModal(false); 
              setMediaFiles([]); 
            }}
          ></div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Đăng Bài Mới</h2>
              <button 
                onClick={() => { 
                  setShowNewPostModal(false); 
                  setMediaFiles([]); 
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Nội dung</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="Bạn đang nghĩ gì?"
                rows={4}
              />
            </div>

            {/* Media Upload */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Đính kèm (Ảnh/Video/File)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*,application/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
                      await handleUploadMedia(file, type);
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  disabled={uploadingMedia}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingMedia ? '⏳ Đang tải...' : '📎 Thêm file'}
                </button>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {mediaFiles.map((media, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-700">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full h-32 object-cover" />
                      ) : media.type === 'video' ? (
                        <video src={media.url} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm p-2">
                          📎 {media.name}
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Hashtag - Chọn một hoặc nhiều</label>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">#</span>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                      setNewPost({ ...newPost, tags: value });
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newPost.tags.trim()) {
                        setSelectedTags([...selectedTags, newPost.tags]);
                        setNewPost({ ...newPost, tags: '' });
                      }
                    }}
                    placeholder="Nhập hashtag..."
                    className="w-full pl-7 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    if (newPost.tags.trim() && !selectedTags.includes(newPost.tags.trim())) {
                      setSelectedTags([...selectedTags, newPost.tags.trim()]);
                      setNewPost({ ...newPost, tags: '' });
                    }
                  }}
                  disabled={!newPost.tags.trim() || selectedTags.includes(newPost.tags.trim())}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
                >
                  Thêm
                </button>
              </div>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="text-xs px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-full border border-blue-500/50 flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                        className="text-blue-300 hover:text-blue-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowNewPostModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting}
                className={`px-4 py-2 ${isSubmitting ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl transition`}
              >
                {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && !isEditingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setSelectedPost(null); setSelectedPostId(null); setPostMenuOpen(false); }}></div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
            {/* Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Chi tiết bài viết</h2>
              <div className="flex items-center gap-2">
                {selectedPost.author.userId === user?.uid && (
                  <div className="relative">
                    <button 
                      onClick={() => setPostMenuOpen(!postMenuOpen)}
                      className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-lg"
                    >
                      <span className="text-xl">⋮</span>
                    </button>
                    
                    {postMenuOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-50">
                        <button
                          onClick={() => {
                            setIsEditingPost(true);
                            setEditPostData({
                              content: selectedPost.content,
                              tags: selectedPost.tags.join(', ')
                            });
                            setEditSelectedTags(selectedPost.tags);
                            setEditMediaFiles(selectedPost.media || []);
                            setPostMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 transition"
                        >
                          Chỉnh sửa
                        </button>
                        
                        <button
                          onClick={handleDeletePost}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20 transition border-t border-gray-600"
                        >
                          Xóa bài viết
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button 
                  onClick={() => { setSelectedPost(null); setSelectedPostId(null); setPostMenuOpen(false); }}
                  className="text-gray-400 hover:text-white transition p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                {selectedPost.author.avatar ? (
                  <img 
                    src={selectedPost.author.avatar} 
                    alt={selectedPost.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextEl) nextEl.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold ${selectedPost.author.avatar ? 'hidden' : ''}`}>
                  {selectedPost.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-white font-semibold block">{selectedPost.author.name}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(selectedPost.createdAt)}</span>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">{selectedPost.content}</p>
                
                {/* Media Display */}
                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="mb-4">
                    {selectedPost.media.length === 1 ? (
                      <div className="rounded-lg overflow-hidden bg-gray-900">
                        {selectedPost.media[0].type === 'image' ? (
                          <img src={selectedPost.media[0].url} alt="" className="w-full h-auto object-cover cursor-pointer rounded-lg" onClick={() => window.open(selectedPost.media[0].url, '_blank')} />
                        ) : selectedPost.media[0].type === 'video' ? (
                          <video src={selectedPost.media[0].url} controls className="w-full h-auto rounded-lg" />
                        ) : (
                          <a href={selectedPost.media[0].url} target="_blank" rel="noopener noreferrer" className="w-full h-32 flex items-center justify-center text-blue-400 hover:text-blue-300 text-sm p-2">
                            📎 {selectedPost.media[0].name}
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedPost.media.map((media, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-900">
                            {media.type === 'image' ? (
                              <img src={media.url} alt="" className="w-full h-auto object-cover cursor-pointer" onClick={() => window.open(media.url, '_blank')} />
                            ) : media.type === 'video' ? (
                              <video src={media.url} controls className="w-full h-auto" />
                            ) : (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="w-full h-32 flex items-center justify-center text-blue-400 hover:text-blue-300 text-sm p-2">
                                📎 {media.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {selectedPost.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Like Button */}
              <div className="flex items-center gap-6 text-gray-400 text-sm mb-6 pb-6 border-b border-gray-700">
                <button 
                  onClick={handleLikePost}
                  className={`flex items-center gap-2 transition ${
                    Array.isArray(selectedPost.likedBy) && selectedPost.likedBy.includes(user?.uid || '') 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'hover:text-blue-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${Array.isArray(selectedPost.likedBy) && selectedPost.likedBy.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                  <span>{selectedPost.likes || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Bình luận ({(selectedPost.comments?.length || 0) + 
                   (selectedPost.comments?.reduce((total, comment) => total + (comment.replies?.length || 0), 0) || 0)})
                </h3>

                {/* Comment Input */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <div className="flex gap-3">
                    {userData?.photoURL || user?.photoURL ? (
                      <img 
                        src={userData?.photoURL || user?.photoURL || ''} 
                        alt={userData?.displayName || user?.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextEl) nextEl.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 ${userData?.photoURL || user?.photoURL ? 'hidden' : ''}`}>
                      {userData?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Để lại bình luận của bạn..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                        rows={2}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={commentSubmitting || !newComment.trim()}
                        className={`mt-2 px-4 py-2 ${commentSubmitting || !newComment.trim() ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition text-sm`}
                      >
                        {commentSubmitting ? 'Đang gửi...' : 'Gửi'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                    <>
                      {selectedPost.comments.slice(0, showCommentsLimit[selectedPost._id] ? undefined : 3).map((comment, idx) => {
                        // Safe checks
                        if (!comment || !comment.author) return null;
                        const isOwnComment = comment.author.userId === user?.uid;
                        return (
                        <div key={comment._id || `comment-${idx}`} className="bg-gray-700/30 rounded-lg p-4">
                          {/* Comment Header */}
                          <div className="flex items-start gap-3 mb-3">
                            {comment.author.avatar ? (
                              <img 
                                src={comment.author.avatar} 
                                alt={comment.author.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextEl) nextEl.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ${comment.author.avatar ? 'hidden' : ''}`}>
                              {(comment.author?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 justify-between">
                                <span className="text-white font-semibold text-sm">{comment.author?.name || 'Anonymous'}</span>
                                {isOwnComment && (
                                  <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition"
                                    title="Xóa bình luận"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</span>
                            </div>
                          </div>

                        {/* Comment Content */}
                        <p className="text-gray-300 text-sm mb-3">{comment.content}</p>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-3 text-xs mb-3">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className={`flex items-center gap-1 transition ${
                              comment.likedBy?.includes(user?.uid || '')
                                ? 'text-red-400 hover:text-red-300'
                                : 'text-gray-400 hover:text-blue-400'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${comment.likedBy?.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button
                            onClick={() => setReplyingToCommentId(replyingToCommentId === comment._id ? null : comment._id)}
                            className="text-gray-400 hover:text-blue-400 transition flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Trả lời
                          </button>
                        </div>

                        {/* Reply Form for Comment */}
                        {replyingToCommentId === comment._id && replyingToReplyId === null && (
                          <div className="mb-3 pb-3 border-t border-gray-600 pt-3">
                            <div className="flex gap-2">
                              <textarea
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                placeholder="Trả lời bình luận này..."
                                className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition text-xs"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddReply(comment._id)}
                                disabled={replySubmitting || !newReply.trim()}
                                className={`px-3 py-1 text-xs rounded transition ${
                                  replySubmitting || !newReply.trim()
                                    ? 'bg-blue-500/50 cursor-not-allowed text-gray-300'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {replySubmitting ? 'Đang gửi...' : 'Gửi'}
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingToCommentId(null);
                                  setNewReply('');
                                }}
                                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-gray-600 space-y-3">
                            {comment.replies.slice(0, expandedReplies.has(comment._id) ? undefined : 2).map((reply, replyIdx) => {
                              if (!reply || !reply.author) return null;
                              const isOwnReply = reply.author.userId === user?.uid;
                              return (
                              <div key={reply._id || `reply-${replyIdx}`} className="bg-gray-600/20 rounded p-3">
                                {/* Reply Header */}
                                <div className="flex items-start gap-2 mb-2">
                                  {reply.author.avatar ? (
                                    <img 
                                      src={reply.author.avatar} 
                                      alt={reply.author.name}
                                      className="w-6 h-6 rounded-full object-cover shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextEl) nextEl.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 ${reply.author.avatar ? 'hidden' : ''}`}>
                                    {(reply.author?.name || 'A').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 justify-between">
                                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                        <span className="text-white font-semibold text-xs truncate">{reply.author?.name || 'Anonymous'}</span>
                                        {reply.replyingTo && (
                                          <span className="text-blue-400 text-xs">@{reply.replyingTo.name}</span>
                                        )}
                                      </div>
                                      {isOwnReply && (
                                        <button
                                          onClick={() => handleDeleteReply(comment._id, reply._id)}
                                          className="text-xs text-red-400 hover:text-red-300 transition shrink-0"
                                          title="Xóa trả lời"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">{formatTimestamp(reply.createdAt)}</span>
                                  </div>
                                </div>

                                {/* Reply Content */}
                                <p className="text-gray-300 text-xs mb-2">{reply.content}</p>

                                {/* Reply Actions */}
                                <div className="flex items-center gap-3 text-xs">
                                  <button
                                    onClick={() => handleLikeReply(comment._id, reply._id)}
                                    className={`flex items-center gap-1 transition ${
                                      reply.likedBy?.includes(user?.uid || '')
                                        ? 'text-red-400 hover:text-red-300'
                                        : 'text-gray-400 hover:text-blue-400'
                                    }`}
                                  >
                                    <Heart className={`w-2.5 h-2.5 ${reply.likedBy?.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                                    <span>{reply.likes || 0}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingToReplyId(replyingToReplyId === reply._id ? null : reply._id);
                                      if (replyingToReplyId !== reply._id) {
                                        setNewReply(`@${reply.author.name} `);
                                      }
                                    }}
                                    className="text-gray-400 hover:text-blue-400 transition"
                                  >
                                    Trả lời
                                  </button>
                                </div>

                                {/* Nested Reply Form */}
                                {replyingToReplyId === reply._id && (
                                  <div className="mt-3 pt-3 border-t border-gray-500">
                                    <div className="flex gap-2 mb-2">
                                      <textarea
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        placeholder={`Trả lời @${reply.author.name}...`}
                                        className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition text-xs"
                                        rows={2}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAddReply(comment._id, reply.author.userId, reply.author.name)}
                                        disabled={replySubmitting || !newReply.trim()}
                                        className={`px-3 py-1 text-xs rounded transition ${
                                          replySubmitting || !newReply.trim()
                                            ? 'bg-blue-500/50 cursor-not-allowed text-gray-300'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                      >
                                        {replySubmitting ? 'Đang gửi...' : 'Gửi'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReplyingToReplyId(null);
                                          setNewReply('');
                                        }}
                                        className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              );
                            })}
                            
                            {/* Show more replies button */}
                            {comment.replies.length > 2 && !expandedReplies.has(comment._id) && (
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedReplies);
                                  newExpanded.add(comment._id);
                                  setExpandedReplies(newExpanded);
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 transition"
                              >
                                Xem thêm {comment.replies.length - 2} trả lời khác
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                    
                    {/* Show more comments button */}
                    {selectedPost.comments.length > 3 && !showCommentsLimit[selectedPost._id] && (
                      <button
                        onClick={() => {
                          setShowCommentsLimit({ ...showCommentsLimit, [selectedPost._id]: true });
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 transition font-semibold"
                      >
                        Xem thêm {selectedPost.comments.length - 3} bình luận khác
                      </button>
                    )}
                  </>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditingPost(false)}></div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Chỉnh sửa bài viết</h2>
              <button 
                onClick={() => setIsEditingPost(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Nội dung</label>
              <textarea
                value={editPostData.content}
                onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="Bạn đang nghĩ gì?"
                rows={4}
              />
            </div>

            {/* Media Edit */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Đính kèm</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="file"
                  id="edit-media-upload"
                  accept="image/*,video/*,application/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
                      await handleUploadMedia(file, type, true);
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => document.getElementById('edit-media-upload')?.click()}
                  disabled={uploadingMedia}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingMedia ? '⏳ Đang tải...' : '📎 Thêm file'}
                </button>
              </div>
              {editMediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {editMediaFiles.map((media, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-700">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full h-32 object-cover" />
                      ) : media.type === 'video' ? (
                        <video src={media.url} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm p-2">
                          📎 {media.name}
                        </div>
                      )}
                      <button
                        onClick={() => setEditMediaFiles(editMediaFiles.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Hashtag - Chọn một hoặc nhiều</label>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">#</span>
                  <input
                    type="text"
                    value={editPostData.tags}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                      setEditPostData({ ...editPostData, tags: value });
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && editPostData.tags.trim()) {
                        setEditSelectedTags([...editSelectedTags, editPostData.tags]);
                        setEditPostData({ ...editPostData, tags: '' });
                      }
                    }}
                    placeholder="Nhập hashtag..."
                    className="w-full pl-7 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    if (editPostData.tags.trim() && !editSelectedTags.includes(editPostData.tags.trim())) {
                      setEditSelectedTags([...editSelectedTags, editPostData.tags.trim()]);
                      setEditPostData({ ...editPostData, tags: '' });
                    }
                  }}
                  disabled={!editPostData.tags.trim() || editSelectedTags.includes(editPostData.tags.trim())}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
                >
                  Thêm
                </button>
              </div>
              
              {editSelectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editSelectedTags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="text-xs px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-full border border-blue-500/50 flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => setEditSelectedTags(editSelectedTags.filter(t => t !== tag))}
                        className="text-blue-300 hover:text-blue-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsEditingPost(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
              >
                Hủy
              </button>
              <button
                onClick={handleEditPost}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}></div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-sm w-full p-6 z-10">
            <h2 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h2>
            <p className="text-gray-300 mb-6">{confirmDialog.message}</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
