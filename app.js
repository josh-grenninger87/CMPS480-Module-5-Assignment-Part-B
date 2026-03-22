let allSubscriptions = [];

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
// Initialize Everything
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadSubscriptions();
  loadSavedSubscriptions();
  loadNews();
  loadOtherPlans();
  setupSearch();
});