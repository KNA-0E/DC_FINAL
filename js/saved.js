
"use strict";

// ==========================================
// THE DETECTIVE CORPS
// SAVED CHARACTER SYSTEM
// ==========================================

const SAVED_CHARACTERS_KEY =
    "detectiveCorpsSavedCharacters";

// Correct featured character identities.
const savedCharacterData = {
    batman: {
        name: "Batman",
        realName: "Bruce Wayne",
        comicvineId: 1699,
        description: "Gotham City's legendary Dark Knight.",
        link: "character.html?id=batman"
    },

    "green-lantern": {
        name: "Green Lantern",
        realName: "John Stewart",
        comicvineId: 10451,
        description:
            "An intergalactic peacekeeper powered by willpower.",
        link: "character.html?id=green-lantern"
    },

    superman: {
        name: "Superman",
        realName: "Clark Kent",
        comicvineId: 1807,
        description:
            "The Man of Steel and a symbol of hope.",
        link: "character.html?id=superman"
    },

    flash: {
        name: "The Flash",
        realName: "Wally West",
        comicvineId: 23879,
        description:
            "The Fastest Man Alive.",
        link: "character.html?id=flash"
    }
};

const SAVED_FEATURED_BY_ID = {
    "1699": "batman",
    "10451": "green-lantern",
    "1807": "superman",
    "23879": "flash"
};

// ==========================================
// IDENTIFY CHARACTERS
// ==========================================

function getCharacterId(character) {
    if (
        typeof character === "string" ||
        typeof character === "number"
    ) {
        return String(character);
    }

    if (!character || typeof character !== "object") {
        return "";
    }

    return String(
        character.id ||
        (
            character.comicvineId
                ? `comicvine-${character.comicvineId}`
                : ""
        )
    );
}

function getComicVineId(character) {
    if (!character) return "";

    if (typeof character === "object") {
        const raw = String(
            character.comicvineId ||
            character.id ||
            ""
        );

        return raw
            .replace(/^comicvine-/, "")
            .replace(/^4005-/, "");
    }

    return String(character)
        .replace(/^comicvine-/, "")
        .replace(/^4005-/, "");
}

function canonicalSavedId(value) {
    const id = getCharacterId(value);

    if (savedCharacterData[id]) {
        return id;
    }

    const numeric = getComicVineId(id);

    if (SAVED_FEATURED_BY_ID[numeric]) {
        return SAVED_FEATURED_BY_ID[numeric];
    }

    if (/^\d+$/.test(numeric)) {
        return `comicvine-${numeric}`;
    }

    return id;
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function getSavedCharacters() {
    try {
        const raw = localStorage.getItem(
            SAVED_CHARACTERS_KEY
        );

        if (!raw) return [];

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            entry => Boolean(getCharacterId(entry))
        );

    } catch (error) {
        console.warn(
            "Could not read saved characters:",
            error
        );

        return [];
    }
}

function storeSavedCharacters(characters) {
    try {
        localStorage.setItem(
            SAVED_CHARACTERS_KEY,
            JSON.stringify(characters)
        );

        return true;

    } catch (error) {
        console.error(
            "Could not save characters:",
            error
        );

        return false;
    }
}

// ==========================================
// SAVE CHARACTER
// ==========================================

function saveCharacter(characterId, characterData = null) {
    if (
        characterId &&
        typeof characterId === "object"
    ) {
        characterData = characterId;
        characterId = characterData.id ||
            characterData.comicvineId;
    }

    const id = canonicalSavedId(
        characterId || characterData
    );

    if (!id) return false;

    const characters = getSavedCharacters();

    const existingIndex = characters.findIndex(
        entry =>
            canonicalSavedId(entry) === id
    );

    const record = characterData
        ? {
            ...characterData,
            id
        }
        : id;

    if (existingIndex === -1) {
        characters.push(record);
    } else if (characterData) {
        characters[existingIndex] = record;
    }

    const saved = storeSavedCharacters(characters);

    if (saved) {
        refreshSavedPage();
    }

    return saved;
}

// ==========================================
// REMOVE CHARACTER
// ==========================================

function removeCharacter(characterId) {
    const id = canonicalSavedId(characterId);

    const remaining = getSavedCharacters().filter(
        entry =>
            canonicalSavedId(entry) !== id
    );

    const saved = storeSavedCharacters(remaining);

    if (saved) {
        refreshSavedPage();
    }

    return saved;
}

// ==========================================
// CHECK BOOKMARK
// ==========================================

function isCharacterSaved(characterId) {
    const id = canonicalSavedId(characterId);

    return getSavedCharacters().some(
        entry =>
            canonicalSavedId(entry) === id
    );
}

// ==========================================
// PREPARE CHARACTER DATA
// ==========================================

function getSavedCharacterDetails(saved) {
    const id = canonicalSavedId(saved);

    if (!id) return null;

    const featured = savedCharacterData[id];

    if (featured) {
        return {
            ...(
                typeof saved === "object"
                    ? saved
                    : {}
            ),
            ...featured,
            id
        };
    }

    const source =
        saved &&
        typeof saved === "object"
            ? saved
            : {};

    const comicvineId = getComicVineId(
        source.comicvineId || id
    );

    if (!/^\d+$/.test(comicvineId)) {
        return null;
    }

    return {
        ...source,
        id,
        comicvineId,
        name:
            source.name ||
            `DC Character #${comicvineId}`,
        realName:
            source.realName ||
            source.real_name ||
            "",
        description:
            source.description ||
            source.deck ||
            "Explore this saved DC character.",
        link:
            `character.html?comicvineId=${
                encodeURIComponent(comicvineId)
            }`
    };
}

// ==========================================
// SAFE TEXT
// ==========================================

function cleanSavedText(value) {
    const temporary = document.createElement("div");

    temporary.innerHTML = String(value || "");

    return (
        temporary.textContent ||
        temporary.innerText ||
        ""
    )
        .replace(/\s+/g, " ")
        .trim();
}

// ==========================================
// CREATE SAVED CARD
// ==========================================

function createSavedCharacterCard(character) {
    const card = document.createElement("article");

    card.className =
        "character-card saved-character-card";

    // IMAGE

    const image = document.createElement("img");

    image.className = "character-card-image";
    image.alt = `${character.name} artwork`;
    image.loading = "lazy";

    image.dataset.characterImage =
        character.realName ||
        character.name;

    if (character.comicvineId) {
        image.dataset.characterId =
            String(character.comicvineId)
                .replace(/^4005-/, "");
    }

    if (
        typeof character.image === "string" &&
        /^https?:\/\//i.test(character.image)
    ) {
        image.dataset.imageSource =
            character.image;
    }

    // Show a fallback immediately.
    if (typeof posterImage === "function") {
        image.src = posterImage(
            character.name || "DC Character"
        );
    }

    // CONTENT

    const content = document.createElement("div");

    content.className =
        "character-card-content";

    const heading = document.createElement("h3");

    heading.textContent =
        character.name || "DC Character";

    const subtitle = document.createElement("p");

    subtitle.className =
        "saved-character-real-name";

    subtitle.textContent =
        character.realName ||
        "DC Universe Character";

    const description = document.createElement("p");

    description.className =
        "saved-character-description";

    const descriptionText = cleanSavedText(
        character.description ||
        "Saved case file."
    );

    description.textContent =
        descriptionText.length > 180
            ? `${descriptionText.slice(0, 177)}...`
            : descriptionText;

    // OPEN CASE FILE

    const link = document.createElement("a");

    link.href = character.link;
    link.className = "character-card-link";
    link.textContent = "OPEN CASE FILE";

    // REMOVE BUTTON

    const removeButton =
        document.createElement("button");

    removeButton.type = "button";
    removeButton.className =
        "remove-saved-button";

    removeButton.textContent =
        "REMOVE FROM SAVED";

    removeButton.addEventListener(
        "click",
        () => {
            removeCharacter(character.id);
        }
    );

    content.append(
        heading,
        subtitle,
        description,
        link,
        removeButton
    );

    card.append(
        image,
        content
    );

    return card;
}

// ==========================================
// RENDER SAVED PAGE
// ==========================================

function renderSavedCharacters() {
    const grid = document.getElementById(
        "saved-character-grid"
    );

    if (!grid) return;

    const emptyState = document.getElementById(
        "saved-empty-state"
    );

    const counter = document.getElementById(
        "saved-count"
    );

    const characters = getSavedCharacters()
        .map(getSavedCharacterDetails)
        .filter(Boolean);

    // Clear loading messages and old cards.
    grid.replaceChildren();

    if (counter) {
        counter.textContent =
            `${characters.length} SAVED ${
                characters.length === 1
                    ? "CASE FILE"
                    : "CASE FILES"
            }`;
    }

    if (characters.length === 0) {
        grid.hidden = true;

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    grid.hidden = false;

    if (emptyState) {
        emptyState.hidden = true;
    }

    const fragment =
        document.createDocumentFragment();

    characters.forEach(character => {
        fragment.appendChild(
            createSavedCharacterCard(character)
        );
    });

    grid.appendChild(fragment);

    // Retrieve images after cards exist.
    if (
        typeof hydrateAutomaticImages === "function"
    ) {
        Promise.resolve(
            hydrateAutomaticImages(grid)
        ).catch(error => {
            console.warn(
                "Saved card image loading:",
                error
            );
        });
    }
}

// ==========================================
// REFRESH
// ==========================================

function refreshSavedPage() {
    if (
        document.getElementById(
            "saved-character-grid"
        )
    ) {
        renderSavedCharacters();
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeSavedCharacters() {
    renderSavedCharacters();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeSavedCharacters
    );
} else {
    initializeSavedCharacters();
}

window.addEventListener(
    "pageshow",
    initializeSavedCharacters
);

window.addEventListener(
    "storage",
    event => {
        if (
            event.key === SAVED_CHARACTERS_KEY
        ) {
            refreshSavedPage();
        }
    }
);

