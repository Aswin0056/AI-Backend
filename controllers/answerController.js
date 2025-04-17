const pool = require("../db");
const axios = require("axios");
const natural = require("natural");

const getChatResponse = async (req, res) => {
  let { message } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Empty message" });
  }

  message = message.trim().toLowerCase();

  try {
    // Check for YouTube commands first
    if (message.includes("open youtube")) {
      return res.json({ answer: "Opening YouTube...", redirect: "https://www.youtube.com" });
    }

    if (message.includes("play") && message.includes("youtube")) {
      const searchQuery = message.replace("play", "").replace("on youtube", "").trim();
      const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      return res.json({ answer: `Searching for "${searchQuery}" on YouTube...`, redirect: youtubeUrl });
    }

      // Check for YouTube commands first
      if (message.includes("open spotify")) {
        return res.json({ answer: "Opening spotify...", redirect: "https://open.spotify.com/" });
      }
  
      if (message.includes("play") && message.includes("spotify")) {
        const searchQuery = message.replace("play", "").replace("on spotify", "").trim();
        const youtubeUrl = `https://open.spotify.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        return res.json({ answer: `Searching for "${searchQuery}" on spotify...`, redirect: youtubeUrl });
      }

    // Search DB for matching or fuzzy matched answer
    const dbResult = await pool.query("SELECT question, answer FROM chat_pairs");
    const allQA = dbResult.rows;

    const exactMatch = allQA.find((row) => row.question.toLowerCase() === message);
    if (exactMatch) {
      return res.json({ answer: exactMatch.answer });
    }

    // Fuzzy match (spelling errors)
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

    // Google fallback using SerpAPI
    const searchRes = await axios.get("https://serpapi.com/search", {
      params: {
        q: message,
        api_key: process.env.SERPAPI_KEY,
      },
    });

    const snippet = searchRes.data?.organic_results?.[0]?.snippet;
    const fallbackAnswer = snippet || "Sorry, I couldn't find an answer.";
    return res.json({ answer: fallbackAnswer });

  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { getChatResponse };
