// Video database
const videos = [
  {
    id: 1,
    title: "Big Buck Bunny",
    description: "A fun animated short film about a giant rabbit.",
    file: "myvideo.mp4"
  },
  {
    id: 2,
    title: "Your Second Video",
    description: "Description of second video",
    file: "video2.mp4"
  },
  {
    id: 3,
    title: "Your Third Video",
    description: "Description of third video",
    file: "video3.mp4"
  }
];

// Get the ID from the URL
const params = new URLSearchParams(window.location.search);
const videoId = parseInt(params.get("id"));

// Function to display a video
function playVideo(id) {
  const selectedVideo = videos.find(v => v.id === id);

  if (selectedVideo) {
    document.getElementById("mainPlayer").src = selectedVideo.file;
    document.getElementById("videoTitle").textContent = selectedVideo.title;
    document.getElementById("videoDescription").textContent = selectedVideo.description;
  }
}

// Function to build episode list
function buildEpisodeList() {
  const listContainer = document.getElementById("episodeList");

  videos.forEach(video => {
    const episodeItem = document.createElement("div");
    episodeItem.className = "episode-item";
    episodeItem.textContent = video.title;
    episodeItem.onclick = function() {
      playVideo(video.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    listContainer.appendChild(episodeItem);
  });
}

// Load the selected video
playVideo(videoId);

// Build the episode list
buildEpisodeList();