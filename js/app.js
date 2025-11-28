// 🌟 GET IMPORTANT HTML ELEMENTS 🌟
// These connect your JavaScript to the elements in index.html

const searchInput = document.getElementById("searchInput");     // Text field
const searchButton = document.getElementById("searchButton");   // Search button
const resultsContainer = document.getElementById("results");    // Card grid

// Modal elements (popup window)
const modal = document.getElementById("mangaModal");            // Dark overlay + popup wrapper
const modalImage = document.getElementById("modalImage");       // Big cover image in popup
const modalTitle = document.getElementById("modalTitle");       // Title in popup
const modalInfo = document.getElementById("modalInfo");         // Type / episodes / score line
const modalSynopsis = document.getElementById("modalSynopsis"); // Description text in popup
const modalClose = document.getElementById("modalClose");       // "X" close button
const favoriteButton = document.getElementById("favoriteButton"); // "Add to Watchlist" button

let currentAnime = null;                                        // Stores data for the currently open anime


// 🌟 WHEN USER CLICKS SEARCH BUTTON
searchButton.addEventListener("click", function () {
  const query = searchInput.value.trim();                       // Remove extra spaces

  if (query === "") {                                           // If field is empty
    alert("Please type an anime title before searching.");      // Show message
    return;                                                     // Stop here
  }

  searchAnime(query);                                           // Call API with the search text
});


// 🌟 PRESSING ENTER SHOULD ALSO SEARCH
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {                                  // When user presses Enter
    searchButton.click();                                       // Pretend they clicked the button
  }
});


// 🌟 MAIN SEARCH FUNCTION 🌟
async function searchAnime(query) {

  // Temporary “searching” card while we wait for the API
  resultsContainer.innerHTML = `
    <div class="result-card">
      <div class="result-title">Searching...</div>
    </div>
  `;

  try {
    // Fetch from Jikan API (anime search)
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`
    );

    if (!response.ok) {                                         // If HTTP error
      throw new Error("Network error");
    }

    const data = await response.json();                         // Convert to JS object
    const animeList = data.data;                                // Actual list of anime

    // If nothing found
    if (!animeList || animeList.length === 0) {
      resultsContainer.innerHTML = `
        <div class="result-card">
          <div class="result-title">No results found</div>
        </div>
      `;
      return;
    }

    // Build card HTML
    let html = "";

    animeList.forEach((anime) => {

      const title = anime.title;
      const type = anime.type || "Unknown";
      const episodes = anime.episodes || "Unknown";
      const score = anime.score || "N/A";
      const image = anime.images?.jpg?.image_url || "";
      const synopsis = anime.synopsis || "No description available.";

      // Each card stores its data in data-* attributes.
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

    resultsContainer.innerHTML = html;                          // Show all cards

  } catch (error) {
    console.error("Error:", error);
    resultsContainer.innerHTML = `
      <div class="result-card">
        <div class="result-title">Error loading results</div>
      </div>
    `;
  }
}


// 🌟 CLICKING A CARD OPENS THE POPUP 🌟
resultsContainer.addEventListener("click", function (event) {

  const card = event.target.closest(".result-card");            // Find the card that was clicked
  if (!card) return;                                            // If click was not on a card, do nothing

  // Save data for the currently open anime (used for watchlist)
  currentAnime = {                                              // Create an object with this anime's data
    title: card.dataset.title,                                  // Title of anime
    image: card.dataset.image,                                  // Image URL
    type: card.dataset.type,                                    // Anime type (TV, Movie, etc.)
    episodes: card.dataset.episodes,                            // Number of episodes
    score: card.dataset.score,                                  // MAL score
    synopsis: card.dataset.synopsis                             // Description text
  };

  // Fill popup with this data
  modalTitle.textContent = currentAnime.title;                  // Set title text
  modalImage.src = currentAnime.image;                          // Show image
  modalInfo.textContent = `Type: ${currentAnime.type} · Episodes: ${currentAnime.episodes} · Score: ${currentAnime.score}`;
  modalSynopsis.textContent = currentAnime.synopsis;            // Set description

  // Show the popup
  modal.classList.add("is-open");
});


// 🌟 CLOSE POPUP BY CLICKING X
if (modalClose) {                                               // Only if element exists
  modalClose.addEventListener("click", function () {
    modal.classList.remove("is-open");                          // Hide popup
  });
}


// 🌟 CLOSE POPUP BY CLICKING OUTSIDE THE BOX
modal.addEventListener("click", function (event) {
  if (event.target === modal) {                                 // Clicked on dark overlay
    modal.classList.remove("is-open");                          // Hide popup
  }
});


// 🌟 CLOSE POPUP WITH ESCAPE KEY
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {                                 // When user presses Esc
    modal.classList.remove("is-open");                          // Hide popup
  }
});


// 🌟 WATCHLIST: LOAD FROM LOCALSTORAGE
function loadWatchlist() {
  const json = localStorage.getItem("watchlist");               // Read saved JSON string
  if (!json) return [];                                         // If nothing saved yet → empty array
  try {
    return JSON.parse(json);                                    // Convert back to array
  } catch {
    return [];                                                  // If broken data → empty array
  }
}


// 🌟 WATCHLIST: SAVE TO LOCALSTORAGE
function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));      // Save array as JSON string
}


// 🌟 WATCHLIST: CHECK IF ANIME IS ALREADY SAVED (by title)
function isInWatchlist(title) {
  const list = loadWatchlist();                                 // Get current watchlist
  return list.some(item => item.title === title);               // true if same title exists
}


// 🌟 FAVORITES / WATCHLIST BUTTON
if (favoriteButton) {                                           // Only if button exists
  favoriteButton.addEventListener("click", function () {

    if (!currentAnime) {                                        // If no anime is open
      alert("Open an anime card first.");                       // Friendly message
      return;
    }

    const list = loadWatchlist();                               // Get current watchlist

    if (isInWatchlist(currentAnime.title)) {                    // Already in list?
      alert(`"${currentAnime.title}" is already in your watchlist.`);
      return;
    }

    list.push(currentAnime);                                    // Add current anime to list
    saveWatchlist(list);                                        // Save updated watchlist

    alert(`"${currentAnime.title}" was added to your watchlist.`); // Confirmation
  });
}


// Utility function that makes special characters safe for HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
