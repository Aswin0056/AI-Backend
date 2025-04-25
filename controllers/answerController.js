const pool = require("../db");
const axios = require("axios");
const natural = require("natural");

const getChatResponse = async (req, res) => {
  let { message, history = [] } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Empty message" });
  }

  message = message.trim().toLowerCase();

  try {
    // Predefined Commands
    if (message.includes("open youtube")) {
      return res.json({ answer: "Opening YouTube...", redirect: "https://www.youtube.com" });
    }

    if (message.includes("play") && message.includes("youtube")) {
      const searchQuery = message.replace("play", "").replace("on youtube", "").trim();
      return res.json({
        answer: `Searching for "${searchQuery}" on YouTube...`,
        redirect: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      });
    }

    if (message.includes("open spotify")) {
      return res.json({ answer: "Opening Spotify...", redirect: "https://open.spotify.com" });
    }

    if (message.includes("play") && message.includes("spotify")) {
      const searchQuery = message.replace("play", "").replace("on spotify", "").trim();
      return res.json({
        answer: `Searching for "${searchQuery}" on Spotify...`,
        redirect: `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`
      });
    }

    if (message.includes("open whatsapp")) {
      return res.json({ answer: "Opening WhatsApp...", redirect: "https://www.whatsapp.com" });
    }

    // Check database
    const dbResult = await pool.query("SELECT question, answer FROM chat_pairs");
    const allQA = dbResult.rows;

    const exactMatch = allQA.find(row => row.question.toLowerCase() === message);
    if (exactMatch) {
      return res.json({ answer: exactMatch.answer });
    }

    // Fuzzy match
    let bestMatch = null;
    let lowestDistance = Infinity;

    for (const row of allQA) {
      const distance = natural.LevenshteinDistance(message, row.question.toLowerCase());
      if (distance < lowestDistance && distance <= 3) {
        lowestDistance = distance;
        bestMatch = row;
      }
    }

    if (bestMatch) {
      return res.json({ answer: bestMatch.answer });
    }

    // If not found — try SerpAPI (Google fallback)
    const searchRes = await axios.get("https://serpapi.com/search", {
      params: {
        q: message,
        api_key: process.env.SERPAPI_KEY,
      },
    });

    const snippet = searchRes.data?.organic_results?.[0]?.snippet;

    if (snippet) {
      return res.json({ answer: snippet, fallback: true });
    }

    // 🔥 Self-generated fallback response if nothing is found
    const selfResponse = `I'm not sure about that, but here's a thought: sometimes exploring unknown questions leads to interesting discoveries. Try asking in a different way or give me more details!`;

    return res.json({ answer: selfResponse, fallback: true });

  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { getChatResponse };
