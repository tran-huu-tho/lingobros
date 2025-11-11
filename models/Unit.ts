import { Schema, model, models } from 'mongoose';

const UnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  isLocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

UnitSchema.index({ courseId: 1, order: 1 });

export default models.Unit || model('Unit', UnitSchema);
