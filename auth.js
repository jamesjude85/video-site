// Show login form
function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginTab").classList.add("active");
  document.getElementById("registerTab").classList.remove("active");
}

// Show register form
function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("registerTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");
}

// Register
async function register() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  if (!username || !password) {
    document.getElementById("registerMessage").textContent = "Please fill in all fields";
    return;
  }

  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.id) {
    document.getElementById("registerMessage").textContent = "Registration successful! You can now login.";
    document.getElementById("registerUsername").value = "";
    document.getElementById("registerPassword").value = "";
  } else {
    document.getElementById("registerMessage").textContent = "Error: " + result.error;
  }
}

// Login
async function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    document.getElementById("loginMessage").textContent = "Please fill in all fields";
    return;
  }

  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.id) {
    // Store user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(result));
    document.getElementById("loginMessage").textContent = "Login successful!";
    window.location.href = "index.html";
  } else {
    document.getElementById("loginMessage").textContent = "Error: " + result.error;
  }
}

// Check if user is logged in
function checkLogin() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}