const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

// Dummy DB
const dummyAnswers = {
  "hello": "Hi there! How can I help you today?",
  "how are you": "I'm doing great, thank you! How about you?",
  "what is your name": "I'm LIX, your personal assistant powered by Azh Studio."
};

const getAIResponse = async (message) => {
  const lowerMsg = message.toLowerCase().trim();
  for (let key in dummyAnswers) {
    if (lowerMsg.includes(key)) return dummyAnswers[key];
  }

  // Fallback with a simulated "thinking" response
  return "Hmm... that's an interesting question. Let me think about that a bit.";
};

app.use(cors());
app.use(bodyParser.json());

// Main AI route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ answer: "I didn't receive any question." });
  }

  const answer = await getAIResponse(message);
  res.json({ answer });
});

// Ping route
app.get('/api/ping', (req, res) => {
  res.json({ message: "pong" });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
