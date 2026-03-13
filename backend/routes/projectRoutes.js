const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware'); // Require valid JWT to access
const taskRoutes = require('./taskRoutes');

// Apply protect middleware to both routes
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

// Link task routes to projects
router.use('/:projectId/tasks', taskRoutes);

module.exports = router;