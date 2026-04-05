const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let priceChartInstance = null;

async function loadDetail() {
  const container = document.getElementById("detail");

  if (!container) return;

  if (!id) {
    container.innerHTML = "<p>No subscription ID provided.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/subscriptions/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch subscription detail");
    }

    const sub = await res.json();
    const iconText = sub.icon ? sub.icon : sub.name.charAt(0);

    container.innerHTML = `
      <div class="detail-content">
        <div class="subscription-icon large-icon">${iconText}</div>
        <h2>${sub.name}</h2>
        <p>${sub.description || "No description available."}</p>
        <p class="price"><strong>$${parseFloat(sub.price).toFixed(2)}</strong> / month</p>
      </div>
    `;

    loadPriceChart(sub.name);
  } catch (err) {
    console.error("Error loading detail:", err);
    container.innerHTML = "<p>Error loading subscription detail.</p>";
  }
}

async function loadPriceChart(serviceName = "Subscription") {
  try {
    const res = await fetch(`/api/subscriptions/${id}/prices`);
    if (!res.ok) {
      throw new Error("Failed to fetch price history");
    }

    const data = await res.json();

    const labels = data.map(item =>
      new Date(item.effective_date).toLocaleDateString()
    );

    const prices = data.map(item => parseFloat(item.price));

    const canvas = document.getElementById("priceChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (priceChartInstance) {
      priceChartInstance.destroy();
    }

    priceChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${serviceName} Price History`,
            data: prices,
            borderWidth: 2,
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `$${parseFloat(context.raw).toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return `$${value}`;
              }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Error loading chart:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDetail);