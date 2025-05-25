const { Pool } = require("pg")
require("dotenv").config()

/**
 * Configure a PostgreSQL connection pool.
 * Uses SSL in development environments for testing,
 * and disables it in production (as handled by hosting platforms like Render).
 */

let pool

const useSSL = process.env.NODE_ENV === "development"

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ...(useSSL && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
}

pool = new Pool(poolConfig)

// Export query helper in development for easier debugging
if (useSSL) {
  module.exports = {
    async query(text, params) {
      try {
        const result = await pool.query(text, params)
        return result
      } catch (err) {
        console.error("Database query error:", text)
        throw err
      }
    },
  }
} else {
  // In production, export the pool directly
  module.exports = pool
}
