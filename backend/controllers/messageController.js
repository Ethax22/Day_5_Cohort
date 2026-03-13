const Message = require('../models/messageModel');

const createMessage = async (req, res) => {
    const { content, type, language } = req.body;
    const { projectId } = req.params;

    try {
        const message = await Message.create(projectId, req.user.id, content, type, language);
        res.status(201).json({ message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending message" });
    }
};

const getMessages = async (req, res) => {
    const { projectId } = req.params;
    try {
        const messages = await Message.findByProject(projectId);
        res.json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching messages" });
    }
};

module.exports = { createMessage, getMessages };
