// Get parameters from URL
const params = new URLSearchParams(window.location.search);
const showId = parseInt(params.get("showId"));
const episodeId = parseInt(params.get("episodeId"));

// Fetch the show from API
async function loadEpisode() {
  const response = await fetch("/api/shows/" + showId);
  const show = await response.json();

  if (show) {
    const selectedEpisode = show.episodes.find(e => e.id === episodeId);

    if (selectedEpisode) {
      document.getElementById("mainPlayer").src = selectedEpisode.file;
      document.getElementById("episodeTitle").textContent = selectedEpisode.title;
      document.getElementById("showName").textContent = show.title;

      // Build other episodes list
      const otherEpisodes = document.getElementById("otherEpisodes");

      show.episodes.forEach(episode => {
        const item = document.createElement("a");
        item.href = "watch.html?showId=" + show.id + "&episodeId=" + episode.id;
        item.className = "episode-item";
        item.textContent = episode.title;

        if (episode.id === episodeId) {
          item.classList.add("current-episode");
        }

        otherEpisodes.appendChild(item);
      });
    }
  }
}

loadEpisode();// Save to watch history
async function saveHistory() {
  const user = localStorage.getItem("currentUser");

  if (!user) return; // Only save if logged in

  const userData = JSON.parse(user);

  await fetch("/api/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: userData.id,
      episodeId: episodeId,
      showId: showId
    })
  });
}

// Call saveHistory when video starts playing
document.getElementById("mainPlayer").addEventListener("play", function() {
  saveHistory();
});