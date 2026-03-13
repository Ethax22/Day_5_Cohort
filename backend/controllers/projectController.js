const Project = require('../models/projectModel');

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


const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching project" });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.findByUser(req.user.id);
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching projects" });
    }
};

module.exports = { createProject, getProjects, getProjectById };