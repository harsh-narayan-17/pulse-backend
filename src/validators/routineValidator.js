const { body } = require('express-validator');
const { RECURRENCE_TYPE } = require('../shared/utils/const/routine');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const createRoutineValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('time')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM (24-hour) format'),

  body('recurrenceType')
    .isIn(Object.values(RECURRENCE_TYPE)).withMessage(`Recurrence type must be one of: ${Object.values(RECURRENCE_TYPE).join(', ')}`),

  body('selectedDays')
    .optional()
    .isArray().withMessage('selectedDays must be an array'),

  body('selectedDays.*')
    .isIn(DAYS).withMessage(`Each day must be one of: ${DAYS.join(', ')}`),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number'),
];

const updateRoutineValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('time')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM (24-hour) format'),

  body('recurrenceType')
    .optional()
    .isIn(RECURRENCE_TYPE).withMessage(`Recurrence type must be one of: ${Object.values(RECURRENCE_TYPE).join(', ')}`),

  body('selectedDays')
    .optional()
    .isArray().withMessage('selectedDays must be an array'),

  body('selectedDays.*')
    .isIn(DAYS).withMessage(`Each day must be one of: ${DAYS.join(', ')}`),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('active')
    .optional()
    .isBoolean().withMessage('Active must be a boolean'),

  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number'),
];

module.exports = { createRoutineValidator, updateRoutineValidator };
