// WATCHLIST PAGE LOGIC

// Grid container where cards OR empty state will be shown
const watchlistContainer = document.getElementById("watchlist");

// Subtitle heading
const watchlistSubtitle = document.querySelector(".watchlist-subtitle");

// Curved text on the sphere: <text class="curved-no-saved"><textPath>...</textPath></text>
const curvedTextPath = document.querySelector(".curved-no-saved textPath");

// Modal elements - same IDs as on index.html
const modal = document.getElementById("mangaModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalInfo = document.getElementById("modalInfo");
const modalSynopsis = document.getElementById("modalSynopsis");
const modalClose = document.getElementById("modalClose");

// ---------------------------
// LOAD / SAVE WATCHLIST
// ---------------------------

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

function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

// ---------------------------
// RENDER WATCHLIST
// ---------------------------

function renderWatchlist() {
  const list = loadWatchlist();

  // CASE 1: NO SAVED ANIME
  if (!list || list.length === 0) {
    if (watchlistSubtitle) {
      watchlistSubtitle.textContent = "";
    }

    if (curvedTextPath) {
      curvedTextPath.textContent = "No saved anime!";
    }

    watchlistContainer.classList.remove("watchlist-grid");

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

    const curvedText = document.querySelector(".curved-no-saved");
    const emptyVideo = watchlistContainer.querySelector(".empty-video");

    if (curvedText && emptyVideo) {
      emptyVideo.addEventListener("mouseenter", () => {
        curvedText.classList.add("is-hovered");
      });

      emptyVideo.addEventListener("mouseleave", () => {
        curvedText.classList.remove("is-hovered");
      });
    }

    return;
  }

  //  WE HAVE SAVED ANIME

  if (watchlistSubtitle) {
    watchlistSubtitle.textContent = "";
  }

// Remove curved text entirely when list is not empty
  if (curvedTextPath) {
    curvedTextPath.textContent = "";
  }


  watchlistContainer.classList.add("watchlist-grid");

  const cardsHtml = list
    .map(
      (anime, index) => `
      <div class="result-card" data-index="${index}">
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
}

// Initial render on page load
renderWatchlist();

// ======================================================
// CLICK HANDLING - remove button and open card modal
// ======================================================

watchlistContainer.addEventListener("click", (event) => {
  const list = loadWatchlist();

  // 1) Remove button
  const removeBtn = event.target.closest(".remove-btn");
  if (removeBtn) {
    const idx = Number(removeBtn.dataset.index);
    if (!Number.isNaN(idx)) {
      const current = loadWatchlist();
      current.splice(idx, 1);
      saveWatchlist(current);
      renderWatchlist();
    }
    return; // stop here so we don't also open modal
  }

  // 2) Card click → open modal
  const card = event.target.closest(".result-card");
  if (!card || !modal) return;

  const idx = Number(card.dataset.index);
  const anime = list[idx];
  if (!anime) return;

  modalTitle.textContent = anime.title;
  modalImage.src = anime.image;
  modalInfo.textContent = `Type: ${anime.type} · Episodes: ${anime.episodes} · Score: ${anime.score}`;

  // IMPORTANT: use innerHTML here so stored <br> renders correctly
  modalSynopsis.innerHTML = anime.synopsis || "No description available.";
// Hide Add-to-Watchlist button on the watchlist page
  if (favoriteButton) {
    favoriteButton.style.display = "none";
  }

  modal.classList.add("is-open");
});

// ======================================================
// CLOSE MODAL
// ======================================================

if (modal) {
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
}
