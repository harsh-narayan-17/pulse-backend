const mongoose = require('mongoose');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const RECURRENCE_TYPES = ['daily', 'weekdays', 'weekly', 'custom_days'];

const routineSchema = new mongoose.Schema(
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
    time: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM (24-hour) format'],
    },
    recurrenceType: {
      type: String,
      enum: { values: RECURRENCE_TYPES, message: `Recurrence type must be one of: ${RECURRENCE_TYPES.join(', ')}` },
      required: [true, 'Recurrence type is required'],
    },
    // Used for 'weekly' (one day) and 'custom_days' (multiple days)
    selectedDays: {
      type: [{ type: String, enum: DAYS }],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Fractional ordering enables drag-and-drop without rewriting all sibling orders
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
routineSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Routine', routineSchema);
module.exports.RECURRENCE_TYPES = RECURRENCE_TYPES;
module.exports.DAYS = DAYS;
