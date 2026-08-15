// Fetch shows from API
async function fetchShows() {
  const response = await fetch("/api/shows");
  const shows = await response.json();
  return shows;
}

// Function to display all shows on home page
function displayShows(showsToDisplay) {
  const grid = document.getElementById("showGrid");
  grid.innerHTML = "";

  showsToDisplay.forEach(show => {
    const card = document.createElement("a");
    card.href = "show.html?id=" + show.id;
    card.className = "video-link";

    card.innerHTML = `
      <div class="video-card">
        <div class="thumbnail">
          <img src="${show.thumbnail}" alt="${show.title}">
          <div class="play-overlay">▶</div>
        </div>
        <h3>${show.title}</h3>
        <p>${show.description}</p>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Search function
let allShows = [];

async function searchShows() {
  const input = document.getElementById("searchBox");
  const filter = input.value.toLowerCase();

  const filteredShows = allShows.filter(show => {
    return show.title.toLowerCase().includes(filter) || 
           show.description.toLowerCase().includes(filter);
  });

  displayShows(filteredShows);
}

// Load shows when page starts
async function init() {
  allShows = await fetchShows();
  displayShows(allShows);
}

init();