
"use strict";

// ==========================================
// THE DETECTIVE CORPS
// HOMEPAGE SEARCH SYSTEM
// ==========================================

const SEARCH_API_BASE =
    typeof DETECTIVE_CORPS_API !== "undefined"
        ? DETECTIVE_CORPS_API
        : "http://localhost:3000/api";

const SEARCH_ENDPOINT =
    `${SEARCH_API_BASE}/characters`;

const characterSearchInput =
    document.getElementById("character-search");

const characterSearchResults =
    document.getElementById("search-results");

const SEARCH_DEBOUNCE = 350;

let characterSearchTimer = null;
let activeSearchController = null;
let currentSearchNumber = 0;

// ==========================================
// FEATURED CHARACTER IDENTITIES
// ==========================================

const FEATURED_SEARCH_CHARACTERS = {
    "1699": "batman",
    "10451": "green-lantern",
    "1807": "superman",
    "23879": "flash"
};

function getFeaturedCharacter(character) {
    if (!character || !character.id) {
        return null;
    }

    return FEATURED_SEARCH_CHARACTERS[
        String(character.id).replace(/^4005-/, "")
    ] || null;
}

// ==========================================
// TEXT HELPERS
// ==========================================

function cleanSearchText(value) {
    const element = document.createElement("div");

    element.innerHTML = String(value || "");

    return (
        element.textContent ||
        element.innerText ||
        ""
    )
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeSearchText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function getCharacterDescription(character) {
    const description = cleanSearchText(
        character.deck ||
        character.description ||
        ""
    );

    if (!description) {
        return "Explore this character's DC Comics case file.";
    }

    return description.length > 160
        ? `${description.slice(0, 157).trim()}...`
        : description;
}

function getCharacterImageURL(character) {
    const image = character.image || {};

    return (
        image.super_url ||
        image.medium_url ||
        image.small_url ||
        image.original_url ||
        image.icon_url ||
        ""
    );
}

// ==========================================
// STATUS MESSAGES
// ==========================================

function showSearchMessage(message, isError = false) {
    if (!characterSearchResults) {
        return;
    }

    characterSearchResults.replaceChildren();

    const paragraph = document.createElement("p");

    paragraph.className = "search-message";
    paragraph.textContent = message;
    paragraph.setAttribute(
        "role",
        isError ? "alert" : "status"
    );

    characterSearchResults.appendChild(paragraph);
}

// ==========================================
// CHARACTER LINKS
// ==========================================

function getCharacterLink(character) {
    const featured = getFeaturedCharacter(character);

    if (featured) {
        return `character.html?id=${encodeURIComponent(featured)}`;
    }

    const id = String(character.id || "")
        .replace(/^4005-/, "");

    return `character.html?comicvineId=${encodeURIComponent(id)}`;
}

// ==========================================
// SEARCH RESULT CARDS
// ==========================================

function createCharacterResultCard(character) {
    const name = cleanSearchText(
        character.name || "Unknown Character"
    );

    const card = document.createElement("article");

    card.className =
        "character-card search-result-card";

    const image = document.createElement("img");

    image.className = "character-card-image";
    image.alt = `${name} character artwork`;
    image.loading = "lazy";

    image.dataset.characterImage =
        character.real_name &&
        getFeaturedCharacter(character)
            ? character.real_name
            : name;

    image.dataset.characterId = String(character.id);

    const imageURL = getCharacterImageURL(character);

    if (imageURL) {
        image.dataset.imageSource = imageURL;
    }

    const content = document.createElement("div");

    content.className = "character-card-content";

    const heading = document.createElement("h3");

    heading.textContent = name;

    const description = document.createElement("p");

    description.textContent =
        getCharacterDescription(character);

    const status = document.createElement("p");

    status.className = "character-status";
    status.textContent = "CASE FILE AVAILABLE";

    const link = document.createElement("a");

    link.className = "character-card-link";
    link.href = getCharacterLink(character);
    link.textContent = "OPEN CASE FILE";

    content.append(
        heading,
        description,
        status,
        link
    );

    card.append(image, content);

    return card;
}

// ==========================================
// SORT RESULTS BY RELEVANCE
// ==========================================

function rankSearchResult(character, searchTerm) {
    const query = normalizeSearchText(searchTerm);
    const name = normalizeSearchText(character.name);
    const realName = normalizeSearchText(
        character.real_name
    );

    let score = 0;

    if (name === query) score += 100;
    if (realName === query) score += 90;

    if (name.startsWith(query)) score += 40;
    if (realName.startsWith(query)) score += 35;

    if (name.includes(query)) score += 20;
    if (realName.includes(query)) score += 15;

    const featured = getFeaturedCharacter(character);

    if (featured) score += 5;

    return score;
}

// ==========================================
// DISPLAY SEARCH RESULTS
// ==========================================

function displayCharacters(characters, searchTerm = "") {
    if (!characterSearchResults) {
        return;
    }

    characterSearchResults.replaceChildren();

    if (!Array.isArray(characters) || !characters.length) {
        showSearchMessage(
            "NO LEADS FOUND. TRY ANOTHER HERO'S NAME."
        );

        return;
    }

    const unique = new Map();

    characters.forEach(character => {
        if (!character?.id || !character.name) {
            return;
        }

        const id = String(character.id)
            .replace(/^4005-/, "");

        if (!unique.has(id)) {
            unique.set(id, character);
        }
    });

    const sorted = [...unique.values()]
        .sort(
            (a, b) =>
                rankSearchResult(b, searchTerm) -
                rankSearchResult(a, searchTerm)
        )
        .slice(0, 24);

    const fragment = document.createDocumentFragment();

    sorted.forEach(character => {
        fragment.appendChild(
            createCharacterResultCard(character)
        );
    });

    characterSearchResults.appendChild(fragment);

    // Hydrate only the new result cards.
    if (typeof hydrateAutomaticImages === "function") {
        hydrateAutomaticImages(
            characterSearchResults
        ).catch(error => {
            console.warn(
                "Search result images:",
                error
            );
        });
    }
}

// ==========================================
// API SEARCH
// ==========================================

async function searchCharacters(searchTerm) {
    if (!characterSearchResults) {
        return;
    }

    const query = String(searchTerm || "").trim();

    currentSearchNumber++;

    const requestNumber = currentSearchNumber;

    if (activeSearchController) {
        activeSearchController.abort();
    }

    if (!query) {
        characterSearchResults.replaceChildren();
        return;
    }

    const controller = new AbortController();

    activeSearchController = controller;

    showSearchMessage("SEARCHING THE ARCHIVES...");

    try {
        const response = await fetch(
            `${SEARCH_ENDPOINT}?search=${encodeURIComponent(query)}`,
            {
                signal: controller.signal,
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errorData.error ||
                `Archive error ${response.status}`
            );
        }

        const data = await response.json();

        if (requestNumber !== currentSearchNumber) {
            return;
        }

        const characters = Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.characters)
                ? data.characters
                : [];

        displayCharacters(characters, query);

    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        if (requestNumber !== currentSearchNumber) {
            return;
        }

        console.error("Character search failed:", error);

        showSearchMessage(
            "THE ARCHIVES COULD NOT BE REACHED. CHECK THAT YOUR SERVER IS RUNNING.",
            true
        );

    } finally {
        if (activeSearchController === controller) {
            activeSearchController = null;
        }
    }
}

// ==========================================
// SEARCH INPUT
// ==========================================

if (characterSearchInput && characterSearchResults) {

    characterSearchInput.setAttribute(
        "autocomplete",
        "off"
    );

    characterSearchInput.addEventListener(
        "input",
        () => {
            clearTimeout(characterSearchTimer);

            const query =
                characterSearchInput.value.trim();

            // Immediately invalidate older requests.
            currentSearchNumber++;

            if (activeSearchController) {
                activeSearchController.abort();
            }

            if (!query) {
                characterSearchResults.replaceChildren();
                return;
            }

            characterSearchTimer = setTimeout(() => {
                searchCharacters(query);
            }, SEARCH_DEBOUNCE);
        }
    );

    // Support direct links such as:
    // index.html?search=Nightwing

    const parameters = new URLSearchParams(
        window.location.search
    );

    const initialSearch = parameters.get("search");

    if (initialSearch) {
        characterSearchInput.value = initialSearch;
        searchCharacters(initialSearch);
    }
}

// ==========================================
// END OF HOMEPAGE SEARCH SYSTEM
// ==========================================
