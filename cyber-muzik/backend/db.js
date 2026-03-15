const { Pool } = require('pg'); // FIX 1: Import the Pool class from pg
require('dotenv').config();

// FIX 2: Check if DATABASE_URL exists to prevent crashing on an empty string
if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL: DATABASE_URL is missing in environment variables.");
  process.exit(1); 
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // FIX 3: Render and most cloud DBs (like Neon/Supabase) require SSL
  ssl: {
    rejectUnauthorized: false
  }
});

// FIX 4: Add an error listener to the pool to prevent the app from dying 
// if the DB connection drops unexpectedly
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Exporting the pool itself is helpful for debugging
};
