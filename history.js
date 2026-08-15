// Load watch history
async function loadHistory() {
  const user = localStorage.getItem("currentUser");

  if (!user) {
    document.getElementById("historyList").innerHTML = "<p class='no-comments'>Please login to see your watch history</p>";
    return;
  }

  const userData = JSON.parse(user);

  const response = await fetch("/api/history/" + userData.id);
  const history = await response.json();

  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = "<p class='no-comments'>No watch history yet</p>";
    return;
  }

  history.forEach(item => {
    const card = document.createElement("a");
    card.href = "watch.html?showId=" + item.show_id + "&episodeId=" + item.episode_id;
    card.className = "video-link";

    card.innerHTML = `
      <div class="video-card history-card">
        <div class="thumbnail">
          <img src="${item.thumbnail}" alt="${item.show_title}">
          <div class="play-overlay">▶</div>
        </div>
        <h3>${item.show_title}</h3>
        <p>${item.episode_title}</p>
        <p class="history-date">Watched: ${new Date(item.watched_at).toLocaleDateString()}</p>
      </div>
    `;

    historyList.appendChild(card);
  });
}

loadHistory();