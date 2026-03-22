const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// =========================
// MySQL Connection
// =========================
const db = mysql.createConnection({
  host: "db.it.pointpark.edu",
  user: "subscriptionprices",
  password: "zgZRxOybiaepQIwL",
  database: "subscriptionprices",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// =========================
// Popular Services
// =========================
app.get("/api/subscriptions", (req, res) => {
  const sql = `
    SELECT 
      id AS service_id,
      name,
      category AS description,
      cost AS price,
      icon
    FROM popular_services
    ORDER BY id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching popular services:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// One Popular Service by ID
// =========================
app.get("/api/subscriptions/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id AS service_id,
      name,
      category AS description,
      cost AS price,
      icon
    FROM popular_services
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching subscription detail:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json(results[0]);
  });
});

// =========================
// News / Recent Updates
// =========================
app.get("/api/news-updates", (req, res) => {
  const sql = `
    SELECT
      id,
      title,
      tag,
      tag_class,
      price_change,
      created_at
    FROM news
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching news:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// Other Plans
// =========================
app.get("/api/plans", (req, res) => {
  const sql = `
    SELECT
      name,
      category AS description,
      cost AS price
    FROM popular_services
    ORDER BY name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching plans:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// Saved Subscriptions
// =========================
app.get("/api/saved-subscriptions", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      cost,
      category,
      renewal_date,
      notes,
      status,
      created_at
    FROM subscriptions
    ORDER BY renewal_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching saved subscriptions:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// Price History for Chart
// Temporary mock history based on current cost
// since this professor schema does not show a
// dedicated price history table
// =========================
app.get("/api/subscriptions/:id/prices", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id AS service_id,
      name,
      cost
    FROM popular_services
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching price history:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const currentPrice = parseFloat(results[0].cost);

    const history = [
      { price: Math.max(currentPrice - 2, 0.99), effective_date: "2024-01-01" },
      { price: Math.max(currentPrice - 1, 0.99), effective_date: "2024-06-01" },
      { price: currentPrice, effective_date: "2025-01-01" }
    ];

    res.json(history);
  });
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});