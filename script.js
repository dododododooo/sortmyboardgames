let allGames = [];
let selectedTags = new Set();

// Load games from games.json
async function loadGames() {
  try {
    const response = await fetch("games.json");
    allGames = await response.json();

    generateTagButtons();
    displayGames(allGames);
  } catch (err) {
    console.error("Error loading games.json:", err);
  }
}

// Create tag buttons based on all tags in the data
function generateTagButtons() {
  const tagContainer = document.getElementById("tag-container");
  tagContainer.innerHTML = ""; // clear if re-run

  let allTags = new Set();

  allGames.forEach(game => {
    game.tags.forEach(tag => allTags.add(tag));
  });

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-btn";
    btn.textContent = tag;

    btn.onclick = () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn.classList.remove("active");
      } else {
        selectedTags.add(tag);
        btn.classList.add("active");
      }
      filterGames();
    };

    tagContainer.appendChild(btn);
  });
}

// Filter by selected tags AND search text
function filterGames() {
  const searchInput = document.getElementById("search-bar");
  const searchText = searchInput ? searchInput.value.toLowerCase() : "";

  const filtered = allGames.filter(game => {
    // Tag logic
    const matchesTags =
      selectedTags.size === 0 ||
      [...selectedTags].every(tag => game.tags.includes(tag));

    // Search logic (name + tags)
    const matchesSearch =
      game.name.toLowerCase().includes(searchText) ||
      game.tags.some(tag => tag.toLowerCase().includes(searchText));

    return matchesTags && matchesSearch;
  });

  displayGames(filtered);
}

// Render the list of games
function displayGames(games) {
  const list = document.getElementById("game-list");
  list.innerHTML = "";

  games.forEach(game => {
    const li = document.createElement("li");
    li.textContent = game.name;
    list.appendChild(li);
  });
}

// Wait until HTML is ready, then wire everything up
window.addEventListener("DOMContentLoaded", () => {
  // Start by loading game data
  loadGames();

  // Hook up search bar
  const searchInput = document.getElementById("search-bar");
  if (searchInput) {
    searchInput.addEventListener("input", filterGames);
  }
});
