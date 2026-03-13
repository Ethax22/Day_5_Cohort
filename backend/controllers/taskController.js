const Task = require('../models/taskModel');

const createTask = async (req, res) => {
    const { title } = req.body;
    const { projectId } = req.params; // Expects ID attached in URL e.g. /projects/1/tasks

    try {
        const taskId = await Task.create(projectId, title);
        res.status(201).json({ id: taskId, title, status: 'todo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating task" });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.findByProject(req.params.projectId);
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
};

const updateTaskStatus = async (req, res) => {
    const { status } = req.body;
    const { taskId } = req.params;

    try {
        await Task.updateStatus(taskId, status);
        res.json({ message: "Task status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating task" });
    }
}

module.exports = { createTask, getTasks, updateTaskStatus };