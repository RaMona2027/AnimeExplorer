// ======================================================
// GET IMPORTANT HTML ELEMENTS
// ======================================================

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");

// Filters
const genreFilter = document.getElementById("genreFilter");

// Modal elements
const modal = document.getElementById("mangaModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalInfo = document.getElementById("modalInfo");
const modalSynopsis = document.getElementById("modalSynopsis");
const modalClose = document.getElementById("modalClose");
const favoriteButton = document.getElementById("favoriteButton");

// Stores the anime currently opened in the modal
let currentAnime = null;

// Stores all anime results from the API (for filtering)
let currentResults = [];


// ======================================================
// SEARCH BUTTON CLICK
// ======================================================

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const selectedGenre = genreFilter ? genreFilter.value : "";

  // Only block if BOTH are empty
  if (query === "" && !selectedGenre) {
    alert("Type a title or pick a vibe before searching.");
    return;
  }

  searchAnime();
});


// ======================================================
// ENTER KEY TRIGGERS SEARCH
// ======================================================

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});


// ======================================================
// MAIN SEARCH FUNCTION (FETCHES API)
// ======================================================

async function searchAnime() {
  const query = searchInput.value.trim();

  resultsContainer.innerHTML = `
    <div class="result-card">
      <div class="result-title">Searching...</div>
    </div>
  `;

  try {
    // Build URL so that query is optional
    let url = "https://api.jikan.moe/v4/anime?limit=24";
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url);

    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    currentResults = data.data || [];

    if (currentResults.length === 0) {
      resultsContainer.innerHTML = `
        <div class="result-card">
          <div class="result-title">No results found</div>
        </div>
      `;
      return;
    }

    // Always apply the vibe filter after fetching
    applyGenreFilter();

  } catch (error) {
    console.error(error);
    resultsContainer.innerHTML = `
      <div class="result-card">
        <div class="result-title">Error loading results</div>
      </div>
    `;
  }
}



// ======================================================
// GENRE FILTER ("Pick a Vibe")
// ======================================================

if (genreFilter) {
  genreFilter.addEventListener("change", applyGenreFilter);
}

function applyGenreFilter() {
  if (!Array.isArray(currentResults) || currentResults.length === 0) {
    renderResults([]);
    return;
  }

  const selectedGenre = genreFilter ? genreFilter.value : "";

  // If no vibe selected → show all current results
  if (!selectedGenre) {
    renderResults(currentResults);
    return;
  }

  // Filter by genre name (from Jikan API)
  const filtered = currentResults.filter(anime =>
    Array.isArray(anime.genres) &&
    anime.genres.some(g => g.name === selectedGenre)
  );

  renderResults(filtered);
}



// ======================================================
// RENDER RESULTS FUNCTION
// ======================================================

function renderResults(list) {
  if (!list || list.length === 0) {
    resultsContainer.innerHTML = `
      <div class="result-card">
        <div class="result-title">No results found</div>
      </div>
    `;
    return;
  }

  let html = "";

  list.forEach(anime => {
    const title = anime.title;
    const type = anime.type || "Unknown";
    const episodes = anime.episodes || "Unknown";
    const score = anime.score || "N/A";
    const image = anime.images?.jpg?.image_url || "";
    const synopsis = anime.synopsis || "No description available.";

    html += `
      <div class="result-card"
        data-title="${escapeHtml(title)}"
        data-image="${escapeHtml(image)}"
        data-type="${escapeHtml(type)}"
        data-episodes="${escapeHtml(String(episodes))}"
        data-score="${escapeHtml(String(score))}"
        data-synopsis="${escapeHtml(synopsis)}">

        <div class="result-image-wrapper">
          <img src="${image}" class="result-image" alt="${escapeHtml(title)}">
        </div>

        <div class="result-title">${escapeHtml(title)}</div>
      </div>
    `;
  });

  resultsContainer.innerHTML = html;
}



// ======================================================
// CLICKING ANY CARD OPENS MODAL
// ======================================================

resultsContainer.addEventListener("click", (event) => {
  const card = event.target.closest(".result-card");
  if (!card) return;

  currentAnime = {
    title: card.dataset.title,
    image: card.dataset.image,
    type: card.dataset.type,
    episodes: card.dataset.episodes,
    score: card.dataset.score,
    synopsis: card.dataset.synopsis,
  };

  modalTitle.textContent = currentAnime.title;
  modalImage.src = currentAnime.image;
  modalInfo.textContent = `Type: ${currentAnime.type} · Episodes: ${currentAnime.episodes} · Score: ${currentAnime.score}`;
  modalSynopsis.textContent = currentAnime.synopsis;

  modal.classList.add("is-open");
});



// ======================================================
// CLOSE MODAL
// ======================================================

if (modalClose) {
  modalClose.addEventListener("click", () => {
    modal.classList.remove("is-open");
  });
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.classList.remove("is-open");
  }
});



// ======================================================
// WATCHLIST LOGIC
// ======================================================

function loadWatchlist() {
  try {
    return JSON.parse(localStorage.getItem("watchlist") || "[]");
  } catch {
    return [];
  }
}

function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

function isInWatchlist(title) {
  return loadWatchlist().some(item => item.title === title);
}

if (favoriteButton) {
  favoriteButton.addEventListener("click", () => {
    if (!currentAnime) {
      alert("Open an anime card first.");
      return;
    }

    const list = loadWatchlist();

    if (isInWatchlist(currentAnime.title)) {
      alert(`"${currentAnime.title}" is already in your watchlist.`);
      return;
    }

    list.push(currentAnime);
    saveWatchlist(list);

    alert(`"${currentAnime.title}" was added to your watchlist.`);
  });
}



// ======================================================
// ESCAPE HTML UTILS
// ======================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
