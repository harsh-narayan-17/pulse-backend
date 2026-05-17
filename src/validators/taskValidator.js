const { body } = require('express-validator');
const { BUCKETS } = require('../shared/utils/const/routine');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('bucket')
    .isIn(BUCKETS).withMessage(`Bucket must be one of: ${BUCKETS.join(', ')}`),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),

  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('bucket')
    .optional()
    .isIn(BUCKETS).withMessage(`Bucket must be one of: ${BUCKETS.join(', ')}`),

  body('completed')
    .optional()
    .isBoolean().withMessage('Completed must be a boolean'),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),

  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number'),
];

module.exports = { createTaskValidator, updateTaskValidator };
