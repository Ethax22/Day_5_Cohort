const express = require('express');
// mergeParams ensures we can capture :projectId from the parent projectRoutes file
const router = express.Router({ mergeParams: true });
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.put('/:taskId/status', protect, updateTaskStatus);

module.exports = router;