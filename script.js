let allGames = [];
let selectedTags = new Set();

/* ============================================================
   NORMALIZE NAME → MATCHING .webp FILE
============================================================ */
function normalizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "_") + ".webp";
}

/* ============================================================
   FIXED TAG VALUES
============================================================ */
const TAG_OPTIONS = {
    genre: [
        "deck builder", "area control", "deduction",
        "worker placement", "strategy", "bluffing", "luck based",
        "wordy", "party", "family", "role-playing", "legacy"
    ],
    players: ["2", "3", "4", "5", "6", "7+"],
    weight: ["1-2", "2-3", "3-4", "4-5"],
    time: ["15-30", "30-45", "45-60", "60-120", "120+"],
    type: ["competitive", "co-op", "teams"]
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
   CREATE TAG CHECKBOXES
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
        const matchesTags = (() => {
            if (selectedTags.size === 0) return true;

            const groups = {};
            selectedTags.forEach(key => {
                const [category, value] = key.split(":");
                if (!groups[category]) groups[category] = [];
                groups[category].push(value);
            });

            return Object.entries(groups).every(([category, values]) => {
                return values.some(v => {
                    return Array.isArray(game[category]) && game[category].includes(v);
                });
            });
        })();

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
   CLEAR ALL FILTERS
============================================================ */
function clearAllFilters() {
    // wipe selected tags
    selectedTags.clear();

    // uncheck all checkboxes in sidebar
    document.querySelectorAll(".sidebar input[type='checkbox']").forEach(cb => {
        cb.checked = false;
    });

    // reset search text
    const searchInput = document.getElementById("search-bar");
    if (searchInput) {
        searchInput.value = "";
    }

    // re-run filtering (will show all games)
    filterGames();
}

/* ============================================================
   COLLAPSIBLE CATEGORY SECTIONS
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
   DISPLAY GAME LIST
============================================================ */
function displayGames(games) {
    const list = document.getElementById("game-list");
    list.innerHTML = "";

    games.forEach(game => {
        const li = document.createElement("li");
        li.textContent = game.name;
        li.classList.add("game-item");

        li.onclick = () => showGameDetails(game);

        list.appendChild(li);
    });
}

/* ============================================================
   SHOW GAME DETAILS
============================================================ */
function showGameDetails(game) {
    const panel = document.getElementById("game-details");

    const fileName = normalizeFileName(game.name);
    const imagePath = "thumbnails/" + fileName;

    panel.innerHTML = `
        <div class="game-detail-card">
            <div class="detail-header">

                <img 
                    src="${imagePath}" 
                    alt="${game.name} cover" 
                    class="detail-thumb"
                    onerror="this.src='thumbnails/no_image.webp'"
                >

                <div>
                    <h2>${game.name}</h2>

                    <p class="description-text">
                        <strong>Description:</strong> ${game.description || "No description available."}
                    </p>

                    <div class="detail-stats">
                        <p><strong>Players:</strong> ${game.players_bgg || "N/A"}</p>
                        <p><strong>Play Time:</strong> ${game.time_bgg || "N/A"}</p>
                        <p><strong>Weight:</strong> ${game.weight_bgg || "N/A"}</p>
                        <p><strong>Type:</strong> ${game.type.join(", ")}</p>
                    </div>
                </div>
            </div>

            <div class="detail-tags">
                ${game.genre.map(g => `<span class="detail-tag">${g}</span>`).join("")}
            </div>
        </div>
    `;
}

/* ============================================================
   ON PAGE LOAD
============================================================ */
window.addEventListener("DOMContentLoaded", () => {
    loadGames();

    const searchInput = document.getElementById("search-bar");
    if (searchInput) {
        searchInput.addEventListener("input", filterGames);
    }

    const clearBtn = document.getElementById("clear-filters-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearAllFilters);
    }
});
