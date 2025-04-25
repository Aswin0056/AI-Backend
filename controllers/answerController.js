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
    // Check command triggers
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

    // Search exact match in database
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

    // Fallback: Try SerpAPI (Google)
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

    // Final creative fallback
    const fallbackIdeas = [
      "That's a great question! Maybe try rewording it?",
      "I'm not sure yet, but I'm learning more every day!",
      "Hmm... I don’t know, but I love your curiosity!",
      "I couldn’t find an answer. Maybe ask it a bit differently?"
    ];

    const randomFallback = fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
    return res.json({ answer: randomFallback, fallback: true });

  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { getChatResponse };
