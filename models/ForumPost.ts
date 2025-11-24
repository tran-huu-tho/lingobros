import { Schema, model, models } from 'mongoose';

const ReplySchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  author: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  replyingTo: {
    userId: { type: String },
    name: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  author: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now }
});

const MediaSchema = new Schema({
  type: { type: String, enum: ['image', 'video', 'file', 'link'], required: true },
  url: { type: String, required: true },
  publicId: { type: String },
  name: { type: String },
  thumbnail: { type: String }
});

const ForumPostSchema = new Schema({
  content: { type: String, required: true },
  author: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  tags: [{ type: String }],
  media: [MediaSchema],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.ForumPost || model('ForumPost', ForumPostSchema);
