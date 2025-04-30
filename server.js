const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const answerRoutes = require('./routes/answerRoutes');

const app = express();
const port = 5000;

/* ----------------------------- Middleware ----------------------------- */

// JSON body parser
app.use(bodyParser.json());

// CORS configuration - mobile/IP access friendly
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from Netlify, localhost, Android emulator
    const allowedOrigins = [
      'https://lix-official.netlify.app',
      'https://lix-ai.netlify.app',
      '*'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ----------------------------- Routes ----------------------------- */

// POST route for /ask
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const answer = await getAnswerFromDB(question); // Replace with actual DB call
    res.json({ answer });

  } catch (err) {
    console.error("❌ Error in /ask:", err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Mount chat route
app.use('/api/chat', answerRoutes);

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

/* ----------------------------- Start Server ----------------------------- */
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Connected to Supabase`);
});
