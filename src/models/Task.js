const mongoose = require('mongoose');
const { BUCKETS } = require('../shared/utils/const/routine');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    bucket: {
      type: String,
      enum: { values: BUCKETS, message: `Bucket must be one of: ${BUCKETS.join(', ')}` },
      required: [true, 'Bucket is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Filter out soft-deleted documents on every find query
taskSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

// Full-text search index on title
taskSchema.index({ title: 'text' });

module.exports = mongoose.model('Task', taskSchema);
