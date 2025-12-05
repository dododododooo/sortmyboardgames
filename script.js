let allGames = [];
let selectedTags = new Set();

async function loadGames() {
    const response = await fetch("games.json");
    allGames = await response.json();

    generateTagButtons();
    displayGames(allGames);
}

function generateTagButtons() {
    const tagContainer = document.getElementById("tag-container");
    let allTags = new Set();

    // Extract all unique tags from the games
    allGames.forEach(game => {
        game.tags.forEach(tag => allTags.add(tag));
    });

    // Create clickable tag buttons
    allTags.forEach(tag => {
        let btn = document.createElement("button");
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

function filterGames() {
    const searchText = document.getElementById("search-bar").value.toLowerCase();

    let filtered = allGames.filter(game => {
        // Tag filtering logic
        const matchesTags =
            selectedTags.size === 0 ||
            [...selectedTags].every(tag => game.tags.includes(tag));

        // Search logic (checks name + tags)
        const matchesSearch =
            game.name.toLowerCase().includes(searchText) ||
            game.tags.some(tag => tag.toLowerCase().includes(searchText));

        return matchesTags && matchesSearch;
    });

    displayGames(filtered);
}


function displayGames(games) {
    const list = document.getElementById("game-list");
    list.innerHTML = "";

    games.forEach(game => {
        let li = document.createElement("li");
        li.textContent = game.name;
        list.appendChild(li);
    });
}

loadGames();
