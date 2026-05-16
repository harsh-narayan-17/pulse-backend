const Routine = require('../models/Routine');
const RoutineLog = require('../models/RoutineLog');

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// All date operations use UTC so stored YYYY-MM-DD strings stay consistent
const getDayName = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getUTCDay()];
};

const getDateString = (date) => date.toISOString().split('T')[0];

const isRoutineScheduledForDay = (routine, dayName) => {
  switch (routine.recurrenceType) {
    case 'daily':
      return true;
    case 'weekdays':
      return WEEKDAYS.includes(dayName);
    case 'weekly':
    case 'custom_days':
      return routine.selectedDays.includes(dayName);
    default:
      return false;
  }
};

/**
 * Returns all active routines scheduled for today, each annotated with
 * whether the user has already completed it today.
 */
const getTodayRoutines = async (userId) => {
  const today = new Date();
  const dayName = getDayName(today);
  const dateString = getDateString(today);

  const allRoutines = await Routine.find({ userId, active: true }).sort({ order: 1, createdAt: 1 });
  const scheduled = allRoutines.filter((r) => isRoutineScheduledForDay(r, dayName));

  const routineIds = scheduled.map((r) => r._id);
  const logs = await RoutineLog.find({
    userId,
    routineId: { $in: routineIds },
    date: dateString,
  });

  const completedSet = new Set(logs.filter((l) => l.completed).map((l) => l.routineId.toString()));

  return scheduled.map((routine) => ({
    ...routine.toObject(),
    completedToday: completedSet.has(routine._id.toString()),
  }));
};

/**
 * Calculates how many consecutive scheduled days a routine has been completed,
 * counting backwards from today. Today is given a grace period — if it hasn't
 * been completed yet, the streak continues from yesterday.
 */
const calculateStreak = async (userId, routineId) => {
  const routine = await Routine.findOne({ _id: routineId, userId });
  if (!routine) return 0;

  const logs = await RoutineLog.find({ userId, routineId, completed: true });
  if (!logs.length) return 0;

  const completedDates = new Set(logs.map((l) => l.date));

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setUTCDate(today.getUTCDate() - i);

    const dayName = getDayName(checkDate);
    const dateString = getDateString(checkDate);

    if (!isRoutineScheduledForDay(routine, dayName)) continue;

    if (completedDates.has(dateString)) {
      streak++;
    } else if (i === 0) {
      // Today hasn't been completed yet — don't break the streak, just skip
      continue;
    } else {
      break;
    }
  }

  return streak;
};

module.exports = { getTodayRoutines, calculateStreak, isRoutineScheduledForDay, getDateString };
