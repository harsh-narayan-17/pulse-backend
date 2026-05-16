const mongoose = require('mongoose');

const routineLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true,
    },
    // Stored as YYYY-MM-DD (UTC) so date comparisons are simple string equality
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Guarantees at most one log per user × routine × date
routineLogSchema.index({ userId: 1, routineId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RoutineLog', routineLogSchema);
