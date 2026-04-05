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
  password: "Enter Password Here",
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
// Mock Price History for Detail Page
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
// Analytics Summary
// =========================
app.get("/api/analytics/summary", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      category,
      cost,
      renewal_date,
      status
    FROM subscriptions
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching analytics summary:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!results.length) {
      return res.json({
        totalMonthlyCost: 0,
        averageMonthlyCost: 0,
        highestSubscription: null,
        activeCount: 0
      });
    }

    const totalMonthlyCost = results.reduce((sum, sub) => sum + parseFloat(sub.cost || 0), 0);
    const averageMonthlyCost = totalMonthlyCost / results.length;

    const highestSubscription = results.reduce((max, sub) => {
      return parseFloat(sub.cost || 0) > parseFloat(max.cost || 0) ? sub : max;
    }, results[0]);

    const activeCount = results.filter(sub => {
      const status = (sub.status || "").toLowerCase();
      return status === "active" || status === "";
    }).length;

    res.json({
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      averageMonthlyCost: Number(averageMonthlyCost.toFixed(2)),
      highestSubscription: {
        name: highestSubscription.name,
        cost: Number(parseFloat(highestSubscription.cost || 0).toFixed(2))
      },
      activeCount
    });
  });
});

// =========================
// Analytics Category Breakdown
// =========================
app.get("/api/analytics/category-breakdown", (req, res) => {
  const sql = `
    SELECT
      COALESCE(category, 'Uncategorized') AS category,
      ROUND(SUM(cost), 2) AS total_cost,
      COUNT(*) AS subscription_count
    FROM subscriptions
    GROUP BY category
    ORDER BY total_cost DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching category breakdown:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// Analytics Top Expensive
// =========================
app.get("/api/analytics/top-expensive", (req, res) => {
  const sql = `
    SELECT
      name,
      category,
      cost,
      renewal_date
    FROM subscriptions
    ORDER BY cost DESC
    LIMIT 5
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching top expensive subscriptions:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// Analytics Upcoming Renewals
// =========================
app.get("/api/analytics/upcoming-renewals", (req, res) => {
  const sql = `
    SELECT
      name,
      category,
      cost,
      renewal_date
    FROM subscriptions
    WHERE renewal_date IS NOT NULL
    ORDER BY renewal_date ASC
    LIMIT 5
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching upcoming renewals:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});