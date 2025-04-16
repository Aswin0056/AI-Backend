const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance to handle PostgreSQL connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Make sure this URL is in your .env file
  ssl: {
    rejectUnauthorized: false  // Set SSL options for production
  }
});

module.exports = pool;
