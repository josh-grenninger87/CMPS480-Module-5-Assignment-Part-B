let allSubscriptions = [];
let categoryChartInstance = null;

// =========================
// Load Popular Subscriptions
// =========================
async function loadSubscriptions() {
  try {
    const res = await fetch("/api/subscriptions");

    if (!res.ok) {
      throw new Error("Failed to fetch subscriptions");
    }

    allSubscriptions = await res.json();
    renderSubscriptions(allSubscriptions);
  } catch (err) {
    console.error("Error loading subscriptions:", err);
  }
}

// =========================
// Render Popular Subscriptions
// =========================
function renderSubscriptions(data) {
  const container = document.getElementById("subscriptions");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(sub => {
    const div = document.createElement("div");
    div.className = "subscription-card";

    const iconText = sub.icon ? sub.icon : sub.name.charAt(0);

    div.innerHTML = `
      <div class="subscription-icon">${iconText}</div>
      <h3>${sub.name}</h3>
      <p>${sub.description}</p>
      <p class="price">$${parseFloat(sub.price).toFixed(2)}/mo</p>
      <button class="view-btn">View Details</button>
    `;

    div.querySelector(".view-btn").addEventListener("click", () => {
      window.location.href = `detail.html?id=${sub.service_id}`;
    });

    container.appendChild(div);
  });
}

// =========================
// Search Filter
// =========================
function setupSearch() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();

    const filtered = allSubscriptions.filter(sub =>
      sub.name.toLowerCase().includes(value)
    );

    renderSubscriptions(filtered);
  });
}

// =========================
// Load News Feed
// =========================
async function loadNews() {
  try {
    const res = await fetch("/api/news-updates");

    if (!res.ok) {
      throw new Error("Failed to fetch news updates");
    }

    const news = await res.json();

    const container = document.getElementById("news-container");
    if (!container) return;

    container.innerHTML = "";

    news.forEach(item => {
      const div = document.createElement("div");
      div.className = "news-item";

      div.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.tag || ""}</p>
        <p>${item.price_change || ""}</p>
        <small>${new Date(item.created_at).toLocaleDateString()}</small>
      `;

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading news:", err);
  }
}

// =========================
// Load Other Plans
// =========================
async function loadOtherPlans() {
  try {
    const res = await fetch("/api/plans");

    if (!res.ok) {
      throw new Error("Failed to fetch plans");
    }

    const plans = await res.json();

    const tableBody = document.querySelector("#plans-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    plans.forEach(plan => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${plan.name}</td>
        <td>${plan.description}</td>
        <td>$${parseFloat(plan.price).toFixed(2)}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading plans:", err);
  }
}

// =========================
// Load Saved Subscriptions
// =========================
async function loadSavedSubscriptions() {
  try {
    const res = await fetch("/api/saved-subscriptions");

    if (!res.ok) {
      throw new Error("Failed to fetch saved subscriptions");
    }

    const saved = await res.json();
    renderSavedSubscriptions(saved);
  } catch (err) {
    console.error("Error loading saved subscriptions:", err);
  }
}

// =========================
// Render Saved Subscriptions
// =========================
function renderSavedSubscriptions(data) {
  const container = document.getElementById("saved-subscriptions");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(sub => {
    const item = document.createElement("div");
    item.className = "saved-subscription-item";

    const renewalText = sub.renewal_date
      ? new Date(sub.renewal_date).toLocaleDateString()
      : "N/A";

    item.innerHTML = `
      <div class="saved-subscription-left">
        <h3>${sub.name}</h3>
        <p>${sub.category || ""} • Next bill: ${renewalText}</p>
        <small>${sub.notes || ""}</small>
      </div>
      <div class="saved-subscription-right">
        <span class="saved-price">$${parseFloat(sub.cost).toFixed(2)}</span>
      </div>
    `;

    container.appendChild(item);
  });
}

// =========================
// Analytics Summary
// =========================
async function loadAnalyticsSummary() {
  try {
    const res = await fetch("/api/analytics/summary");

    if (!res.ok) {
      throw new Error("Failed to fetch analytics summary");
    }

    const data = await res.json();

    document.getElementById("total-monthly-cost").textContent = `$${data.totalMonthlyCost.toFixed(2)}`;
    document.getElementById("average-monthly-cost").textContent = `$${data.averageMonthlyCost.toFixed(2)}`;
    document.getElementById("active-count").textContent = data.activeCount;

    const highestEl = document.getElementById("highest-subscription");
    if (data.highestSubscription) {
      highestEl.textContent = `${data.highestSubscription.name} ($${data.highestSubscription.cost.toFixed(2)})`;
    } else {
      highestEl.textContent = "N/A";
    }
  } catch (err) {
    console.error("Error loading analytics summary:", err);
  }
}

// =========================
// Analytics Category Chart
// =========================
async function loadCategoryBreakdown() {
  try {
    const res = await fetch("/api/analytics/category-breakdown");

    if (!res.ok) {
      throw new Error("Failed to fetch category breakdown");
    }

    const data = await res.json();
    renderCategoryChart(data);
  } catch (err) {
    console.error("Error loading category breakdown:", err);
  }
}

function renderCategoryChart(data) {
  const canvas = document.getElementById("categoryChart");
  if (!canvas) return;

  const labels = data.map(item => item.category || "Uncategorized");
  const totals = data.map(item => parseFloat(item.total_cost));

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Monthly Spend by Category",
          data: totals,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// =========================
// Analytics Top Expensive
// =========================
async function loadTopExpensiveSubscriptions() {
  try {
    const res = await fetch("/api/analytics/top-expensive");

    if (!res.ok) {
      throw new Error("Failed to fetch top expensive subscriptions");
    }

    const data = await res.json();
    const list = document.getElementById("top-expensive-list");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${item.name}</strong> - $${parseFloat(item.cost).toFixed(2)}
        <br />
        <small>${item.category || "Uncategorized"}</small>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading top expensive subscriptions:", err);
  }
}

// =========================
// Analytics Upcoming Renewals
// =========================
async function loadUpcomingRenewals() {
  try {
    const res = await fetch("/api/analytics/upcoming-renewals");

    if (!res.ok) {
      throw new Error("Failed to fetch upcoming renewals");
    }

    const data = await res.json();
    const list = document.getElementById("upcoming-renewals-list");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(item => {
      const renewalText = item.renewal_date
        ? new Date(item.renewal_date).toLocaleDateString()
        : "N/A";

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${item.name}</strong> - ${renewalText}
        <br />
        <small>$${parseFloat(item.cost).toFixed(2)} • ${item.category || "Uncategorized"}</small>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading upcoming renewals:", err);
  }
}

// =========================
// Initialize Everything
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadSubscriptions();
  loadSavedSubscriptions();
  loadNews();
  loadOtherPlans();
  loadAnalyticsSummary();
  loadCategoryBreakdown();
  loadTopExpensiveSubscriptions();
  loadUpcomingRenewals();
  setupSearch();
});