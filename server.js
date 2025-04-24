const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const answerRoutes = require('./routes/answerRoutes'); // Importing the router

const app = express();
const port = 5000;

const redis = require('redis');
const redisClient = redis.createClient();

// CORS configuration
app.use(cors({
  origin: '*', // Change this to your frontend's domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true  // Allow cookies to be sent with requests
}));

// POST route for /ask
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  redisClient.get(question, async (err, cachedAnswer) => {
    if (cachedAnswer) {
      return res.json({ answer: cachedAnswer });
    }
    
    const answer = await getAnswerFromDB(question); // Assuming this function fetches the answer from DB
    redisClient.set(question, answer);
    res.json({ answer });
  });
});



// Middleware for JSON parsing
app.use(bodyParser.json());

// Mount the answerRoutes
app.use('/api/chat', answerRoutes);  // All requests to /api/chat will use answerRoutes

// Simple ping route
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Connected to SupaBase_db`);
});
