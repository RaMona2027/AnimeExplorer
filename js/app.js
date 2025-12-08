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

if (searchButton && searchInput) {
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    const selectedGenre = genreFilter ? genreFilter.value : "";

    // Allow search if there is EITHER text OR a vibe selected
    if (query === "" && !selectedGenre) {
      alert("Type a title or pick a vibe before searching.");
      return;
    }

    searchAnime();
  });

  // ENTER KEY TRIGGERS SEARCH
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchButton.click();
    }
  });
}

// ======================================================
// MAIN SEARCH FUNCTION (AniList GraphQL)
// ======================================================

async function searchAnime() {
  const query = searchInput ? searchInput.value.trim() : "";

  // Show loading state
  resultsContainer.innerHTML = `
    <div class="result-card">
      <div class="result-title">Searching...</div>
    </div>
  `;

  const url = "https://graphql.anilist.co";

  const graphQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 30) {
        media(type: ANIME, search: $search) {
          id
          title {
            romaji
            english
          }
          episodes
          genres
          averageScore
          description(asHtml: false)
          coverImage {
            large
          }
          format
        }
      }
    }
  `;

  const variables = {
    search: query || null, // null = no text filter, just general list
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: graphQuery,
        variables: variables,
      }),
    });

    if (!response.ok) {
      throw new Error("Network error");
    }

    const json = await response.json();
    const page = json.data?.Page;
    currentResults = page?.media || [];

    if (!currentResults.length) {
      resultsContainer.innerHTML = `
        <div class="result-card">
          <div class="result-title">No results found</div>
        </div>
      `;
      return;
    }

    // Apply vibe filter after fetch
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
  if (!currentResults || !currentResults.length) {
    renderResults([]);
    return;
  }

  const selectedGenre = genreFilter ? genreFilter.value : "";

  if (!selectedGenre) {
    renderResults(currentResults);
    return;
  }

  const filtered = currentResults.filter((anime) =>
    Array.isArray(anime.genres) &&
    anime.genres.some((g) => g === selectedGenre)
  );

  renderResults(filtered);
}

// ======================================================
// RENDER RESULTS FUNCTION
// ======================================================

function renderResults(list) {
  if (!list || !list.length) {
    resultsContainer.innerHTML = `
      <div class="result-card">
        <div class="result-title">No results found</div>
      </div>
    `;
    return;
  }

  let html = "";

  list.forEach((anime) => {
    const title =
      anime.title?.english ||
      anime.title?.romaji ||
      "Untitled";

    const type = anime.format || "Unknown";
    const episodes = anime.episodes ?? "Unknown";
    const score = anime.averageScore ?? "N/A";
    const image = anime.coverImage?.large || "";
    const rawSynopsis = anime.description || "No description available.";

    // STEP 1: keep <br> etc. but make it safe for a data-attribute
    const synopsisForAttr = encodeForDataAttr(
      rawSynopsis.replace(/\n/g, " ")
    );

    html += `
      <div class="result-card"
        data-title="${escapeHtml(title)}"
        data-image="${escapeHtml(image)}"
        data-type="${escapeHtml(type)}"
        data-episodes="${escapeHtml(String(episodes))}"
        data-score="${escapeHtml(String(score))}"
        data-synopsis="${synopsisForAttr}">

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

if (resultsContainer && modal) {
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

    // STEP 2: use innerHTML so <br> etc. become real line breaks
    modalSynopsis.innerHTML = currentAnime.synopsis;

    modal.classList.add("is-open");

    // make sure the add button is visible on the main page modal
    if (favoriteButton) {
      favoriteButton.style.display = "inline-block";
    }
  });
}

// ======================================================
// CLOSE MODAL
// ======================================================

if (modal && modalClose) {
  modalClose.addEventListener("click", () => {
    modal.classList.remove("is-open");
  });

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
}

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
  return loadWatchlist().some((item) => item.title === title);
}

if (favoriteButton) {
  favoriteButton.addEventListener("click", () => {
    if (!currentAnime) {
      // was: alert("Open an anime card first.");
      showToast("Open a card first.");
      return;
    }

    const list = loadWatchlist();

    if (isInWatchlist(currentAnime.title)) {
      // was: alert(`"${currentAnime.title}" is already in your watchlist.`);
      showToast("Already in watchlist.");
      return;
    }

    list.push(currentAnime);
    saveWatchlist(list);

    // custom comic-style popup instead of browser alert
    showToast("Added to watchlist.");
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

/**
 * Encode text so it is safe inside a data-* attribute
 * but still allows HTML tags like <br> to work later.
 */
function encodeForDataAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ======================================================
// TOAST POPUP HELPER
// ======================================================

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  // clear previous timeout if user clicks very fast
  if (showToast._timeoutId) {
    clearTimeout(showToast._timeoutId);
  }

  showToast._timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
