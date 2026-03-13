const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const taskRoutes = require('./taskRoutes');


router.route('/')
    .post(protect, createProject)
    .get(protect, getProjects);

router.route('/:projectId')
    .get(protect, getProjectById);

router.use('/:projectId/tasks', taskRoutes);

module.exports = router;