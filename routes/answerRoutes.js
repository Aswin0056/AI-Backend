const express = require('express');
const router = express.Router();

// Example dummy response
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const answer = `Echo from LIX: ${message}`;
  res.json({ answer });
});

module.exports = router;
