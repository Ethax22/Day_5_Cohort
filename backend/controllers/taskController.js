const Task = require('../models/taskModel');

const createTask = async (req, res) => {
    const { title, description, priority, assigneeId } = req.body;
    const { projectId } = req.params;

    try {
        const taskId = await Task.create(projectId, title, description, 'todo', priority, assigneeId);
        res.status(201).json({ 
            id: taskId, 
            title, 
            description, 
            status: 'todo', 
            priority: priority || 'medium',
            assignee_id: assigneeId 
        });
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