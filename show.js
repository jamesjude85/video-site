// Get the show ID from the URL
const params = new URLSearchParams(window.location.search);
const showId = parseInt(params.get("id"));

// Fetch the show from API
async function loadShow() {
  const response = await fetch("/api/shows/" + showId);
  const show = await response.json();

  if (show) {
    document.getElementById("showThumbnail").src = show.thumbnail;
    document.getElementById("showTitle").textContent = show.title;
    document.getElementById("showDescription").textContent = show.description;

    // Build episode list
    const episodeList = document.getElementById("episodeList");

    show.episodes.forEach(episode => {
      const episodeItem = document.createElement("a");
      episodeItem.href = "watch.html?showId=" + show.id + "&episodeId=" + episode.id;
      episodeItem.className = "episode-item";
      episodeItem.textContent = episode.title;
      episodeList.appendChild(episodeItem);
    });
  } else {
    document.getElementById("showTitle").textContent = "Show not found";
  }

  // Load comments
  loadComments();
}

// Load comments
async function loadComments() {
  const response = await fetch("/api/shows/" + showId + "/comments");
  const comments = await response.json();

  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";

  if (comments.length === 0) {
    commentsList.innerHTML = "<p class='no-comments'>No comments yet. Be the first!</p>";
    return;
  }

  comments.forEach(comment => {
    const commentItem = document.createElement("div");
    commentItem.className = "comment-item";

    commentItem.innerHTML = `
      <div class="comment-header">
        <strong>${comment.username}</strong>
        <span>${new Date(comment.created_at).toLocaleDateString()}</span>
      </div>
      <p>${comment.comment}</p>
    `;

    commentsList.appendChild(commentItem);
  });
}

// Add a comment
async function addComment() {
  const user = localStorage.getItem("currentUser");

  if (!user) {
    document.getElementById("commentMessage").textContent = "Please login to comment";
    return;
  }

  const userData = JSON.parse(user);
  const commentText = document.getElementById("commentText").value;

  if (!commentText) {
    document.getElementById("commentMessage").textContent = "Please write a comment";
    return;
  }

  const response = await fetch("/api/shows/" + showId + "/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: userData.id,
      comment: commentText
    })
  });

  const result = await response.json();

  if (result.id) {
    document.getElementById("commentText").value = "";
    document.getElementById("commentMessage").textContent = "Comment posted!";
    loadComments();
  } else {
    document.getElementById("commentMessage").textContent = "Error: " + result.error;
  }
}

loadShow();