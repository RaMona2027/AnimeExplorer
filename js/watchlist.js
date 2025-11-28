// 🌟 WATCHLIST PAGE SCRIPT 🌟

// Get the container where cards will be rendered
const watchlistContainer = document.getElementById("watchlist"); // The grid for saved anime

// Get the paragraph where we show "empty" message
const emptyMessage = document.getElementById("emptyMessage");    // Text if watchlist has no items


// Load watchlist array from localStorage
function loadWatchlist() {                                       // Function to read saved list
  const json = localStorage.getItem("watchlist");                // Get string from localStorage
  if (!json) return [];                                          // If nothing saved yet → empty array

  try {
    return JSON.parse(json);                                     // Convert JSON string to JS array
  } catch {
    return [];                                                   // If something is broken → empty array
  }
}

// Save watchlist array back to localStorage
function saveWatchlist(list) {                                   // Function to save list
  localStorage.setItem("watchlist", JSON.stringify(list));       // Turn array into JSON and save
}


// Build and show all cards in the watchlist grid
function renderWatchlist() {                                     // Function to draw the page
  const list = loadWatchlist();                                  // Get current saved anime

  if (list.length === 0) {                                       // If there are no items
    watchlistContainer.innerHTML = "";                           // Clear grid
    emptyMessage.textContent = "Your watchlist is empty.";       // Show info message
    return;                                                      // Stop here
  }

  // If we have items, clear the empty message
  emptyMessage.textContent = "";                                 // Remove empty message text

  let html = "";                                                 // Start building HTML for cards

  list.forEach((anime, index) => {                               // Loop over each saved anime
    html += `
      <div class="result-card">                                  <!-- Reuse your card style -->
        <div class="result-image-wrapper">                       <!-- Image frame -->
          <img src="${anime.image}"                              <!-- Cover image -->
               class="result-image"
               alt="${anime.title}">
        </div>

        <div class="result-title">${anime.title}</div>           <!-- Title text -->

        <div class="modal-info" style="margin-top:6px;">         <!-- Type / episodes / score -->
          Type: ${anime.type} · Episodes: ${anime.episodes} · Score: ${anime.score}
        </div>

        <button class="modal-favorite-btn remove-btn"            <!-- Remove button -->
                data-index="${index}">
          Remove from Watchlist
        </button>
      </div>
    `;                                                           // Close card markup
  });

  watchlistContainer.innerHTML = html;                           // Insert cards in the grid

  // Add click handlers for all "Remove" buttons after cards are added
  const removeButtons = document.querySelectorAll(".remove-btn");// All buttons with class remove-btn

  removeButtons.forEach(button => {                              // For each button
    button.addEventListener("click", () => {                     // When clicked
      const idx = Number(button.dataset.index);                  // Get index from data-index
      const current = loadWatchlist();                           // Load latest watchlist
      current.splice(idx, 1);                                    // Remove 1 item at position idx
      saveWatchlist(current);                                    // Save updated list
      renderWatchlist();                                         // Re-render the grid
    });
  });
}

// Run once when the watchlist page loads
renderWatchlist();                                               // Build the initial watchlist view
