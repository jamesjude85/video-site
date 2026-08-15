// Check if user is logged in and update header
function updateHeader() {
  const user = localStorage.getItem("currentUser");
  
  if (user) {
    const userData = JSON.parse(user);
    
    // Find all login links and replace with username
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    
    loginLinks.forEach(link => {
      link.textContent = "👤 " + userData.username;
      link.href = "#";
      link.onclick = function(e) {
        e.preventDefault();
        if (confirm("Do you want to logout?")) {
          localStorage.removeItem("currentUser");
          window.location.reload();
        }
      };
    });
  }
}

// Run when page loads
updateHeader();