const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const answerRoutes = require('./routes/answerRoutes'); // Importing the router

const app = express();
const port = 5000;

const redis = require('redis');
const redisClient = redis.createClient();

// Error handling for Redis connection
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware setup
app.use(bodyParser.json());  // For parsing JSON request bodies

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

// Mount the answerRoutes
app.use('/api/chat', answerRoutes);  // All requests to /api/chat will use answerRoutes

// Simple ping route
app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend is alive!" });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  // Add connection messages for DB or other services if required
  console.log(`🚀 Connected to SupaBase_db (if applicable)`);
});
