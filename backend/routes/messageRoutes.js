const express = require('express');
const router = express.Router({ mergeParams: true });
const { createMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createMessage)
    .get(protect, getMessages);

module.exports = router;
