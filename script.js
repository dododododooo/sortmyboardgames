let allGames = [];
let selectedTags = new Set();

/* ============================================================
   FIXED TAG VALUES (your list)
============================================================ */
const TAG_OPTIONS = {
    genre: [
        "deck-builder", "area control", "deduction", 
        "worker placement", "strategy", "bluffing", "luck based", 
        "wordy", "party", "family", "role-playing", "legacy"
    ],
    players: ["2", "3", "4", "5", "6", "7+"],
    weight: ["1-2", "2-3", "3-4", "4-5"],
    time: ["15-30", "30-45", "45-60", "60-120", "120+"],
    type: ["co-op", "competitive"]
};

/* ============================================================
   LOAD GAME DATA
============================================================ */
async function loadGames() {
    try {
        const response = await fetch("games.json");
        allGames = await response.json();
        console.log("Loaded games:", allGames);

        generateTagButtons();
        displayGames(allGames);
    } catch (err) {
        console.error("Error loading games.json:", err);
    }
}

/* ============================================================
   CREATE CHECKBOXES FOR EACH CATEGORY
============================================================ */
function generateTagButtons() {
    createButtonsFromList("genre", "genre-container");
    createButtonsFromList("players", "players-container");
    createButtonsFromList("weight", "weight-container");
    createButtonsFromList("time", "time-container");
    createButtonsFromList("type", "type-container");
}

function createButtonsFromList(category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    TAG_OPTIONS[category].forEach(tag => {
        const wrapper = document.createElement("div");
        wrapper.className = "check-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const key = category + ":" + tag;

        checkbox.onchange = () => {
            if (checkbox.checked) {
                selectedTags.add(key);
            } else {
                selectedTags.delete(key);
            }
            filterGames();
        };

        const label = document.createElement("label");
        label.textContent = tag;
        label.style.marginLeft = "8px";

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        container.appendChild(wrapper);
    });
}

/* ============================================================
   FILTER GAME LIST
============================================================ */
function filterGames() {
    const searchText = document.getElementById("search-bar").value.toLowerCase();

    const filtered = allGames.filter(game => {
        // Match tags
        const matchesTags = (() => {
             if (selectedTags.size === 0) return true;
         
             // Group selected tags by category
             const groups = {};
             selectedTags.forEach(key => {
                 const [category, value] = key.split(":");
                 if (!groups[category]) groups[category] = [];
                 groups[category].push(value);
             });
         
             // For each category, game must match AT LEAST one selected tag (OR logic)
             return Object.entries(groups).every(([category, values]) => {
                 return values.some(v => {
                     return Array.isArray(game[category]) && game[category].includes(v);
                 });
             });
         })();


        // Match text search
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

/* ============================================================
   COLLAPSIBLE CATEGORY HEADERS
============================================================ */
function toggleCategory(containerId) {
    const content = document.getElementById(containerId);
    const header = content.previousElementSibling;
    const arrow = header.querySelector(".arrow");

    if (content.classList.contains("collapsed")) {
        content.classList.remove("collapsed");
        arrow.classList.remove("collapsed-arrow");
    } else {
        content.classList.add("collapsed");
        arrow.classList.add("collapsed-arrow");
    }
}

/* ============================================================
   DISPLAY GAMES
============================================================ */
function displayGames(games) {
    const list = document.getElementById("game-list");
    list.innerHTML = "";

    games.forEach(game => {
        const li = document.createElement("li");
        li.textContent = game.name;
        list.appendChild(li);
    });
}

/* ============================================================
   INITIALIZE ON PAGE LOAD
============================================================ */
window.addEventListener("DOMContentLoaded", () => {
    loadGames();

    const searchInput = document.getElementById("search-bar");
    if (searchInput) {
        searchInput.addEventListener("input", filterGames);
    }
});
