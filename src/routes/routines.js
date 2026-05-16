const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  completeRoutine,
  getTodayRoutinesHandler,
  getRoutineStreak,
} = require('../controllers/routineController');
const { createRoutineValidator, updateRoutineValidator } = require('../validators/routineValidator');
const validate = require('../middleware/validate');

router.use(protect);

// /today must come before /:id so Express doesn't treat "today" as an ObjectId
router.get('/today', getTodayRoutinesHandler);

router.get('/', getRoutines);
router.post('/', createRoutineValidator, validate, createRoutine);

router.patch('/:id', updateRoutineValidator, validate, updateRoutine);
router.delete('/:id', deleteRoutine);

router.post('/:id/complete', completeRoutine);
router.get('/:id/streak', getRoutineStreak);

module.exports = router;
