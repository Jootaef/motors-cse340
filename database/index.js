const { Pool } = require("pg")
require("dotenv").config()


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
  module.exports = pool
}
