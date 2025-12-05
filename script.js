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
    createButtons("genre", "genre-container");
    createButtons("players", "players-container");
    createButtons("time", "time-container");
    createButtons("type", "type-container");
}

function createButtons(category, containerId) {
    const container = document.getElementById(containerId);
    let tags = new Set();

    allGames.forEach(game => {
        game[category].forEach(tag => tags.add(tag));
    });

    tags.forEach(tag => {
        const btn = document.createElement("button");
        btn.className = "tag-btn";
        btn.textContent = tag;

        // Unique identifier: category:tag
        const key = category + ":" + tag;

        btn.onclick = () => {
            if (selectedTags.has(key)) {
                selectedTags.delete(key);
                btn.classList.remove("active");
            } else {
                selectedTags.add(key);
                btn.classList.add("active");
            }
            filterGames();
        };

        container.appendChild(btn);
    });
}


// Filter by selected tags AND search text
function filterGames() {
    const searchText = document.getElementById("search-bar").value.toLowerCase();

    const filtered = allGames.filter(game => {

        // Tag/category filtering
        const matchesTags = [...selectedTags].every(key => {
            const [category, value] = key.split(":");
            return game[category].includes(value);
        });

        // Search filtering
        const matchesSearch =
            game.name.toLowerCase().includes(searchText) ||
            Object.keys(game).some(cat => {
                if (Array.isArray(game[cat])) {
                    return game[cat].some(v =>
                        v.toLowerCase().includes(searchText)
                    );
                }
                return false;
            });

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
