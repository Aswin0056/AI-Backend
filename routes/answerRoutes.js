const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../controllers/answerController');

// Handle POST requests to /api/chat
router.post('/', getChatResponse);

module.exports = router;
