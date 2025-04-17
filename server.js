const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const answerRoutes = require('./routes/answerRoutes'); // Importing the router

const app = express();
const port = 5000;

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

