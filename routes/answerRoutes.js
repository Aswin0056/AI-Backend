const express = require("express");
const router = express.Router();
const { getChatResponse } = require("../controllers/answerController");

// 🔗 Connect route to smart controller
router.post("/", getChatResponse);

module.exports = router;
