const Project = require('../models/projectModel');

// @desc    Create a new project
// @route   POST /api/projects
const createProject = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Project name is required" });
    }

    try {
        const projectId = await Project.create(name, description, req.user.id);
        res.status(201).json({ message: "Project created", projectId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating project" });
    }
};

// @desc    Get all projects for the logged in user
// @route   GET /api/projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.findByUser(req.user.id);
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching projects" });
    }
};

module.exports = { createProject, getProjects };