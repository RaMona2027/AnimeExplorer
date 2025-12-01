// WATCHLIST PAGE LOGIC

// Grid container where cards OR empty state will be shown
const watchlistContainer = document.getElementById("watchlist");

// Subtitle heading ("Your saved anime" / empty when none)
const watchlistSubtitle = document.querySelector(".watchlist-subtitle");

// Load watchlist array from localStorage
function loadWatchlist() {
  const json = localStorage.getItem("watchlist");
  if (!json) return [];

  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("Could not parse watchlist JSON", error);
    return [];
  }
}

// Save watchlist array back to localStorage
function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

// Render the watchlist page (shows either cards OR empty state)
function renderWatchlist() {
  const list = loadWatchlist();

  // Curved text on the sphere: <text class="curved-no-saved"><textPath>...</textPath></text>
  const curvedTextPath = document.querySelector(".curved-no-saved textPath");

  // CASE 1: NO SAVED ANIME
  if (!list || list.length === 0) {
    // Subtitle under WATCHLIST – keep as it was
    if (watchlistSubtitle) {
      watchlistSubtitle.textContent = "No saved anime yet";
    }

    // Curved text should say "No saved anime!"
    if (curvedTextPath) {
      curvedTextPath.textContent = "No saved anime!";
    }

    // Turn off grid layout for empty state
    watchlistContainer.classList.remove("watchlist-grid");

    // Empty state: video + button
    watchlistContainer.innerHTML = `
      <div class="watchlist-empty-wrapper">
        <video class="empty-video" autoplay loop muted playsinline>
          <source src="img/tears.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>

        <a href="index.html" class="watchlist-link watchlist-start-btn">
          Save anime to watch dattebayo!!!
        </a>
      </div>
    `;

    // Hover interaction: video controls curved text
    const curvedText = document.querySelector(".curved-no-saved");
    const emptyVideo = watchlistContainer.querySelector(".empty-video");

    if (curvedText && emptyVideo) {
      emptyVideo.addEventListener("mouseenter", () => {
        curvedText.classList.add("is-hovered");   // or is-pulsing if that's what your CSS uses
      });

      emptyVideo.addEventListener("mouseleave", () => {
        curvedText.classList.remove("is-hovered");
      });
    }

    return; // stop here, do not render cards
  }

  // CASE 2: THERE ARE SAVED ANIME

  // Subtitle under WATCHLIST
  if (watchlistSubtitle) {
    watchlistSubtitle.textContent = "Your saved anime";
  }

  // Curved text should say "Your saved anime"
  if (curvedTextPath) {
    curvedTextPath.textContent = "Your saved anime";
  }

  // Use grid layout when we have cards
  watchlistContainer.classList.add("watchlist-grid");

  // Build all cards
  const cardsHtml = list
    .map(
      (anime, index) => `
      <div class="result-card">
        <div class="result-image-wrapper">
          <img
            src="${anime.image}"
            class="result-image"
            alt="${anime.title}"
          >
        </div>

        <div class="result-title">${anime.title}</div>

        <div class="modal-info" style="margin-top:6px;">
          Type: ${anime.type} · Episodes: ${anime.episodes} · Score: ${anime.score}
        </div>

        <button
          class="modal-favorite-btn remove-btn"
          data-index="${index}"
        >
          Remove
        </button>
      </div>
    `
    )
    .join("");

  watchlistContainer.innerHTML = cardsHtml;

  // Hook up "Remove" buttons
  const removeButtons = document.querySelectorAll(".remove-btn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.dataset.index);
      const current = loadWatchlist();
      current.splice(idx, 1);
      saveWatchlist(current);
      renderWatchlist(); // re-render UI
    });
  });
}


// Run once on page load
renderWatchlist();
