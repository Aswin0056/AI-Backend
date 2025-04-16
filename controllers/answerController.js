const pool = require('../db');  // PostgreSQL connection

const getChatResponse = async (req, res) => {
  const { message } = req.body;

  try {
    const result = await pool.query(
      "SELECT answer FROM chat_pairs WHERE LOWER(question) = LOWER($1)",  // SQL query for case-insensitive match
      [message.trim()]  // Sanitize input by trimming any spaces
    );

    if (result.rows.length > 0) {
      res.json({ answer: result.rows[0].answer });  // Return answer from database
    } else {
      res.json({ answer: "Sorry, I don't have an answer for that yet." });  // Default response
    }
  } catch (error) {
    console.error("DB error:", error.message);
    res.status(500).json({ error: "Database query failed" });  // Handle DB errors
  }
};

module.exports = { getChatResponse };
