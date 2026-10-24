const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432
});

app.get("/api/", (req, res) => {
  res.json({
    message: "Welcome to DevOps Winter Arc!",
    day: "Day 12/90",
    topic: "Docker Compose"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

app.get("/api/visits", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query("INSERT INTO visits DEFAULT VALUES");

    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM visits"
    );

    res.json({
      visits: Number(result.rows[0].total)
    });
  } catch (error) {
    res.status(500).json({
      error: "Database operation failed"
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on port ${port}`);
});
