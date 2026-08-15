// Add a new show
async function addShow() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const thumbnail = document.getElementById("thumbnail").value;

  if (!title) {
    document.getElementById("message").textContent = "Please enter a title";
    return;
  }

  const response = await fetch("/api/shows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: title,
      description: description,
      thumbnail: thumbnail || "https://picsum.photos/640/360?random=" + Math.floor(Math.random() * 1000)
    })
  });

  const result = await response.json();

  if (result.id) {
    document.getElementById("message").textContent = "Show added successfully!";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("thumbnail").value = "";
    loadShows();
  } else {
    document.getElementById("message").textContent = "Error: " + result.error;
  }
}

// Delete a show
async function deleteShow(id) {
  if (confirm("Are you sure you want to delete this show and all its episodes?")) {
    const response = await fetch("/api/shows/" + id, {
      method: "DELETE"
    });

    const result = await response.json();
    loadShows();
  }
}

// Edit a show (fills the form with current data)
async function editShow(id) {
  const response = await fetch("/api/shows/" + id);
  const show = await response.json();

  document.getElementById("title").value = show.title;
  document.getElementById("description").value = show.description || "";
  document.getElementById("thumbnail").value = show.thumbnail || "";

  // Change button to update mode
  const button = document.querySelector(".admin-form button");
  button.textContent = "Update Show";
  button.onclick = function() { updateShow(id); };
}

// Update a show
async function updateShow(id) {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const thumbnail = document.getElementById("thumbnail").value;

  if (!title) {
    document.getElementById("message").textContent = "Please enter a title";
    return;
  }

  const response = await fetch("/api/shows/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: title,
      description: description,
      thumbnail: thumbnail
    })
  });

  const result = await response.json();

  if (result.message) {
    document.getElementById("message").textContent = "Show updated successfully!";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("thumbnail").value = "";

    // Reset button back to add mode
    const button = document.querySelector(".admin-form button");
    button.textContent = "Add Show";
    button.onclick = function() { addShow(); };

    loadShows();
  }
}

// Load all shows in the manage list
async function loadShows() {
  const response = await fetch("/api/shows");
  const shows = await response.json();

  const listContainer = document.getElementById("showsList");
  listContainer.innerHTML = "";

  shows.forEach(show => {
    const item = document.createElement("div");
    item.className = "admin-show-item";

    item.innerHTML = `
      <div class="admin-show-info">
        <strong>${show.title}</strong>
        <span>ID: ${show.id}</span>
      </div>
      <div class="admin-show-actions">
        <button class="edit-btn" onclick="editShow(${show.id})">Edit</button>
        <button class="delete-btn" onclick="deleteShow(${show.id})">Delete</button>
      </div>
    `;

    listContainer.appendChild(item);
  });
}

// Load shows when page starts
loadShows();
// Upload a video file
async function uploadVideo() {
  const fileInput = document.getElementById("videoFile");
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById("uploadMessage").textContent = "Please select a video file";
    return;
  }

  const formData = new FormData();
  formData.append("video", file);

  document.getElementById("uploadMessage").textContent = "Uploading...";

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (result.filename) {
    document.getElementById("uploadMessage").textContent = "Uploaded! File: " + result.path;
    document.getElementById("episodeFile").value = result.path;
  } else {
    document.getElementById("uploadMessage").textContent = "Error: " + result.error;
  }
}

// Add an episode to a show
async function addEpisode() {
  const showId = document.getElementById("showId").value;
  const title = document.getElementById("episodeTitle").value;
  const file = document.getElementById("episodeFile").value;

  if (!showId || !title || !file) {
    document.getElementById("episodeMessage").textContent = "Please fill in all fields";
    return;
  }

  const response = await fetch("/api/shows/" + showId + "/episodes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: title,
      file: file
    })
  });

  const result = await response.json();

  if (result.id) {
    document.getElementById("episodeMessage").textContent = "Episode added successfully!";
    document.getElementById("episodeTitle").value = "";
    document.getElementById("episodeFile").value = "";
  } else {
    document.getElementById("episodeMessage").textContent = "Error: " + result.error;
  }
}