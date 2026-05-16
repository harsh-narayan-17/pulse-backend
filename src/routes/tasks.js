const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { createTaskValidator, updateTaskValidator } = require('../validators/taskValidator');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getTasks);
router.post('/', createTaskValidator, validate, createTask);
router.patch('/:id', updateTaskValidator, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
