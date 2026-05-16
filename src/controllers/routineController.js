const Routine = require('../models/Routine');
const RoutineLog = require('../models/RoutineLog');
const asyncWrapper = require('../utils/asyncWrapper');
const pick = require('../utils/pick');
const { success } = require('../utils/apiResponse');
const { getTodayRoutines, calculateStreak, getDateString } = require('../services/routineService');

const getRoutines = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [routines, total] = await Promise.all([
    Routine.find({ userId: req.user.id })
      .sort({ order: 1, createdAt: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Routine.countDocuments({ userId: req.user.id }),
  ]);

  success(res, {
    routines,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

const createRoutine = asyncWrapper(async (req, res) => {
  const { title, time, recurrenceType, selectedDays, order } = req.body;

  const resolvedDays =
    recurrenceType === 'weekly' && (!selectedDays || selectedDays.length === 0)
      ? ['sunday']
      : selectedDays || [];

  const routine = await Routine.create({
    userId: req.user.id,
    title,
    time,
    recurrenceType,
    selectedDays: resolvedDays,
    order: order ?? 0,
  });

  success(res, { routine }, 'Routine created', 201);
});

const updateRoutine = asyncWrapper(async (req, res) => {
  const allowed = pick(req.body, ['title', 'time', 'recurrenceType', 'selectedDays', 'active', 'order']);

  const routine = await Routine.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: allowed },
    { new: true, runValidators: true }
  );

  if (!routine) {
    return res.status(404).json({ success: false, message: 'Routine not found' });
  }

  success(res, { routine }, 'Routine updated');
});

const deleteRoutine = asyncWrapper(async (req, res) => {
  const routine = await Routine.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!routine) {
    return res.status(404).json({ success: false, message: 'Routine not found' });
  }

  success(res, null, 'Routine deleted');
});

const completeRoutine = asyncWrapper(async (req, res) => {
  const routine = await Routine.findOne({ _id: req.params.id, userId: req.user.id });
  if (!routine) {
    return res.status(404).json({ success: false, message: 'Routine not found' });
  }

  // Accept explicit date from client (local date); defaults to today (UTC)
  const date = req.body.date || getDateString(new Date());
  // completed defaults to true; pass false to un-complete
  const completed = req.body.completed !== false;

  const log = await RoutineLog.findOneAndUpdate(
    { userId: req.user.id, routineId: req.params.id, date },
    { completed },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  success(res, { log }, `Routine marked as ${completed ? 'complete' : 'incomplete'}`);
});

const getTodayRoutinesHandler = asyncWrapper(async (req, res) => {
  const routines = await getTodayRoutines(req.user.id);
  success(res, { routines, date: getDateString(new Date()) });
});

const getRoutineStreak = asyncWrapper(async (req, res) => {
  const streak = await calculateStreak(req.user.id, req.params.id);
  success(res, { streak });
});

module.exports = {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  completeRoutine,
  getTodayRoutinesHandler,
  getRoutineStreak,
};
