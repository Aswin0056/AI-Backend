const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const answerRoutes = require('./routes/answerRoutes'); // Importing the router

const app = express();
const port = 5000;

const redis = require('redis');
const redisClient = redis.createClient();

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  redisClient.get(question, async (err, cachedAnswer) => {
    if (cachedAnswer) {
      return res.json({ answer: cachedAnswer });
    }
    
    const answer = await getAnswerFromDB(question);
    redisClient.set(question, answer);
    res.json({ answer });
  });
});



// Middleware
app.use(cors());
app.use(bodyParser.json());  // For parsing JSON request bodies

// Mount the router
app.use('/api/chat', answerRoutes);  // All requests to /api/chat will use answerRoutes

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Connected to SupaBase_db`);
});

