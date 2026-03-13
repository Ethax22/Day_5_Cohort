const express = require('express');
const router = express.Router({ mergeParams: true });
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTask)
    .get(protect, getTasks);

router.put('/:taskId/status', protect, updateTaskStatus);

module.exports = router;