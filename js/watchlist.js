// 🌟 WATCHLIST PAGE LOGIC 🌟

// Get the grid container where cards OR empty state will be shown
const watchlistContainer = document.getElementById("watchlist"); // <div id="watchlist"> in HTML

// Get the subtitle heading "Your saved anime" (or similar)
const watchlistSubtitle = document.querySelector(".watchlist-subtitle"); // <h3 class="watchlist-subtitle">

// 🔐 Load watchlist array from localStorage (same key as in app.js)
function loadWatchlist() {
  const json = localStorage.getItem("watchlist");        // Read saved string from localStorage
  if (!json) return [];                                  // If nothing stored yet → return empty array

  try {
    return JSON.parse(json);                             // Turn JSON string into JS array
  } catch (error) {
    console.error("Could not parse watchlist JSON", error); // Log error if JSON broken
    return [];                                           // Fall back to empty array
  }
}

// 🔐 Save watchlist array back to localStorage
function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list)); // Turn array into JSON string and save
}

// 🎨 Render the watchlist page (shows either cards OR empty state)
function renderWatchlist() {
  const list = loadWatchlist();                         // Get current saved anime list

  // 👉 CASE 1: NO SAVED ANIME
  if (!list || list.length === 0) {
    if (watchlistSubtitle) {
      watchlistSubtitle.textContent = "No saved anime yet";
    }

    watchlistContainer.innerHTML = `
    <div class="watchlist-empty-wrapper">

      <video class="empty-video" autoplay loop muted playsinline>
        <source src="img/tears.mp4" type="video/mp4">
      </video>

      <p class="watchlist-empty">
        Start exploring on the main page and add something to your watchlist
      </p>

    </div>
  `;

    return;
  }


  // 👉 CASE 2: THERE *ARE* SAVED ANIME
  if (watchlistSubtitle) {
    watchlistSubtitle.textContent = "Your saved anime"; // Normal heading text
  }

  let html = "";                                       // Start with empty HTML string

  list.forEach((anime, index) => {                     // Go through each saved anime
    html += `
      <div class="result-card">                        <!-- Reuse your card style -->
        <div class="result-image-wrapper">
          <img src="${anime.image}"                    <!-- Cover image -->
               class="result-image"
               alt="${anime.title}">
        </div>

        <div class="result-title">${anime.title}</div> <!-- Title text -->

        <div class="modal-info" style="margin-top:6px;"> <!-- Short info row -->
          Type: ${anime.type} · Episodes: ${anime.episodes} · Score: ${anime.score}
        </div>

        <button class="modal-favorite-btn remove-btn"  <!-- Remove button -->
          Remove
        </button>
      </div>
    `;
  });

  watchlistContainer.innerHTML = html;                 // Insert all cards into the page

  // Add click listeners to all "Remove" buttons
  const removeButtons = document.querySelectorAll(".remove-btn"); // All remove buttons

  removeButtons.forEach((button) => {                  // For each button
    button.addEventListener("click", () => {           // When user clicks it
      const idx = Number(button.dataset.index);        // Read which card index to remove
      const current = loadWatchlist();                 // Load latest list
      current.splice(idx, 1);                          // Remove 1 item at position idx
      saveWatchlist(current);                          // Save updated list
      renderWatchlist();                               // Re-render list (updates UI)
    });
  });
}

// Run once on page load
renderWatchlist();                                     // Build initial view
