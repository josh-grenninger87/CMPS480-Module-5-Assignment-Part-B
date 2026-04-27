document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signin-form");
  const message = document.getElementById("signin-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    localStorage.setItem("subtrackerUser", email);

    message.textContent = "Sign in successful! Redirecting to dashboard...";
    message.className = "success-message";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
});