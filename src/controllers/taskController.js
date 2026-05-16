const Task = require('../models/Task');
const asyncWrapper = require('../utils/asyncWrapper');
const pick = require('../utils/pick');
const { success } = require('../utils/apiResponse');

const getTasks = asyncWrapper(async (req, res) => {
  const { bucket, completed, search, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = { userId: req.user.id };

  if (bucket) query.bucket = bucket;
  if (completed !== undefined) query.completed = completed === 'true';

  // $text search requires the text index on Task.title
  if (search) {
    query.$text = { $search: search };
  }

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { order: 1, createdAt: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  success(res, {
    tasks,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

const createTask = asyncWrapper(async (req, res) => {
  const { title, bucket, dueDate, order } = req.body;

  const task = await Task.create({
    userId: req.user.id,
    title,
    bucket,
    dueDate: dueDate || null,
    order: order ?? 0,
  });

  success(res, { task }, 'Task created', 201);
});

const updateTask = asyncWrapper(async (req, res) => {
  const allowed = pick(req.body, ['title', 'bucket', 'completed', 'dueDate', 'order']);

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: allowed },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  success(res, { task }, 'Task updated');
});

const deleteTask = asyncWrapper(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  success(res, null, 'Task deleted');
});

module.exports = { getTasks, createTask, updateTask, deleteTask };
