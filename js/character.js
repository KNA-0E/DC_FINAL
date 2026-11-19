
"use strict";

// ==========================================
// THE DETECTIVE CORPS
// CHARACTER CASE FILES
// ==========================================

const CHARACTER_API_URL =
    (typeof DETECTIVE_CORPS_API !== "undefined"
        ? DETECTIVE_CORPS_API
        : "http://localhost:3000/api") + "/characters";

// ==========================================
// FEATURED CASE FILES
// ==========================================

const caseFiles = {
    batman: {
        name: "Batman",
        realName: "Bruce Wayne",
        alias: "The Dark Knight",
        comicvineId: 1699,
        status: "CASE FILE COMPLETE",
        affiliation: "The Bat-Family and Justice League",

        introduction: `Gotham City's legendary vigilante detective. Batman uses intelligence, preparation and determination to protect a city plagued by crime and corruption.`,

        origin: `Bruce Wayne witnessed the murder of his parents as a child. Their deaths inspired him to dedicate his life to preventing others from experiencing the same tragedy. After years of training, he returned to Gotham and became Batman.`,

        personality: `Intelligent, disciplined, strategic and determined. Batman is driven by justice, although his obsession with his mission can sometimes isolate him.`,

        abilities: `Batman has no superhuman powers. His strengths include detective work, martial arts, physical conditioning, strategy, technology and preparation.`,

        firstStory: "Batman: Year One",
        firstStoryDescription: `A grounded retelling of Bruce Wayne's early days as Batman. It introduces Gotham, his mission and his developing relationship with Commissioner Gordon.`,

        readingRecommendations: [
            {
                title: "Batman: Year One",
                writer: "Frank Miller",
                description: "Bruce Wayne begins his career as Batman while Jim Gordon fights corruption in Gotham.",
                reason: "Our recommended starting point for understanding Batman.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "Batman: The Long Halloween",
                writer: "Jeph Loeb",
                description: "Batman investigates murders committed around major holidays.",
                reason: "Ideal for readers who enjoy detective mysteries.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "Batman: Hush",
                writer: "Jeph Loeb",
                description: "A mysterious enemy manipulates Batman's life and his relationships.",
                reason: "Introduces Batman's wider supporting cast.",
                level: "SOME BACKGROUND HELPFUL"
            }
        ],

        funFact: `Batman is frequently called the World's Greatest Detective. His investigative skills are just as important as his fighting abilities.`,

        dossier: {
            history: `Bruce Wayne grew up in Gotham City. After his parents' murder, he travelled and trained extensively before returning home as Batman. His mission eventually expanded through the Bat-Family and the Justice League.`,
            equipment: `Batman uses the Batsuit, Batarangs, grappling equipment, forensic tools, vehicles and surveillance technology. His greatest resource is preparation.`,
            themes: `Batman's stories explore justice, trauma, fear, obsession and personal responsibility.`
        }
    },

    "green-lantern": {
        name: "Green Lantern",
        realName: "John Stewart",
        alias: "Green Lantern of Sector 2814",
        comicvineId: 10451,
        status: "CASE FILE COMPLETE",
        affiliation: "Green Lantern Corps and Justice League",

        introduction: `John Stewart is a Green Lantern, an intergalactic peacekeeper whose power ring transforms willpower into energy constructs. He protects Earth and the wider universe.`,

        origin: `John Stewart was an architect and former Marine before becoming a Green Lantern. His discipline, courage and sense of responsibility helped make him a suitable candidate for the Corps.`,

        personality: `Disciplined, courageous, principled and thoughtful. John's architectural background influences his approach to problem-solving.`,

        abilities: `His power ring allows him to create energy constructs, fly, generate protective shields, communicate across space and survive in hostile environments. Its effectiveness depends on willpower.`,

        firstStory: "Green Lantern: Mosaic",
        firstStoryDescription: `A character-focused story exploring John Stewart's responsibilities, identity and leadership as a Green Lantern.`,

        readingRecommendations: [
            {
                title: "Green Lantern: Mosaic",
                writer: "Gerard Jones",
                description: "John Stewart takes responsibility for a diverse community of alien civilizations.",
                reason: "Explores John's identity and leadership.",
                level: "SOME BACKGROUND HELPFUL"
            },
            {
                title: "Green Lantern Corps: Recharge",
                writer: "Geoff Johns and Dave Gibbons",
                description: "The Green Lantern Corps is rebuilt as a major intergalactic peacekeeping force.",
                reason: "Introduces the wider Corps and its responsibilities.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "Green Lantern: War Journal",
                writer: "Phillip Kennedy Johnson",
                description: "A modern John Stewart-focused Green Lantern story.",
                reason: "A more contemporary entry point.",
                level: "BEGINNER FRIENDLY"
            }
        ],

        funFact: `John Stewart's background as an architect often influences the precise and detailed constructs he creates with his ring.`,

        dossier: {
            history: `John Stewart became one of Earth's Green Lanterns and developed into an important member of the Corps and the Justice League.`,
            equipment: `His Green Lantern power ring is his main tool. It channels willpower into constructs, shields and other energy-based abilities.`,
            themes: `His stories explore responsibility, leadership, identity, courage and the burden of protecting others.`
        }
    },

    superman: {
        name: "Superman",
        realName: "Clark Kent",
        alias: "The Man of Steel",
        comicvineId: 1807,
        status: "CASE FILE COMPLETE",
        affiliation: "Justice League and the Superman Family",

        introduction: `Superman is one of Earth's greatest heroes. Raised as Clark Kent in Smallville, he uses his extraordinary abilities to protect others and inspire hope.`,

        origin: `Born Kal-El on Krypton, Clark was sent to Earth before his home planet's destruction. Jonathan and Martha Kent raised him in Smallville, teaching him compassion and responsibility.`,

        personality: `Compassionate, hopeful, humble and principled. Superman believes that his greatest strength is his ability to help people.`,

        abilities: `Superman possesses immense strength, flight, speed, durability, heat vision, enhanced senses and freeze breath. His powers are generally fuelled by Earth's yellow sun.`,

        firstStory: "Superman: Birthright",
        firstStoryDescription: `A modern retelling of Clark Kent's beginnings and his journey toward becoming Superman.`,

        readingRecommendations: [
            {
                title: "Superman: Birthright",
                writer: "Mark Waid",
                description: "Clark Kent discovers how he can use his abilities to make a difference.",
                reason: "A strong introduction to Superman's origins and values.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "Superman: For All Seasons",
                writer: "Jeph Loeb",
                description: "An intimate look at Clark Kent's life and the people who shaped him.",
                reason: "Shows the human side of Superman.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "All-Star Superman",
                writer: "Grant Morrison",
                description: "A celebration of Superman's mythology and heroic ideals.",
                reason: "Explores what makes Superman an enduring hero.",
                level: "BEGINNER FRIENDLY"
            }
        ],

        funFact: `Superman's identity as Clark Kent is central to his character. His upbringing on Earth shapes the values that guide his powers.`,

        dossier: {
            history: `Clark Kent grew up in Smallville before moving to Metropolis, becoming a journalist at the Daily Planet and taking on the role of Superman.`,
            equipment: `Superman rarely needs conventional equipment. His Kryptonian heritage and Earth's yellow sun provide most of his abilities.`,
            themes: `Superman's stories explore hope, belonging, compassion, identity and the responsibility that comes with power.`
        }
    },

    flash: {
        name: "The Flash",
        realName: "Wally West",
        alias: "The Fastest Man Alive",
        comicvineId: 23879,
        status: "CASE FILE COMPLETE",
        affiliation: "The Flash Family, Teen Titans and Justice League",

        introduction: `Wally West is one of DC's greatest speedsters. Once known as Kid Flash, he grew into the role of the Flash and became a hero in his own right.`,

        origin: `Wally West gained super-speed through an accident similar to the one that gave Barry Allen his powers. He began his career as Kid Flash before eventually taking on the Flash mantle.`,

        personality: `Energetic, loyal, compassionate and occasionally impulsive. Wally's relationships with friends and family are central to his character.`,

        abilities: `Wally can move at extraordinary speeds, access the Speed Force, react almost instantly, vibrate through matter and perform remarkable feats of speed.`,

        firstStory: "The Flash by Mark Waid",
        firstStoryDescription: `A defining run that develops Wally West into a confident and independent Flash.`,

        readingRecommendations: [
            {
                title: "The Flash: Born to Run",
                writer: "Mark Waid",
                description: "A retelling of Wally West's beginnings as Kid Flash.",
                reason: "Introduces Wally's early development.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "The Flash: The Return of Barry Allen",
                writer: "Mark Waid",
                description: "Wally faces a challenge connected to the legacy of his predecessor.",
                reason: "Explores Wally's growth into the Flash.",
                level: "BEGINNER FRIENDLY"
            },
            {
                title: "The Flash: Terminal Velocity",
                writer: "Mark Waid",
                description: "Wally's connection to the Speed Force becomes increasingly important.",
                reason: "Develops the mythology of Wally's powers.",
                level: "SOME BACKGROUND HELPFUL"
            }
        ],

        funFact: `Wally West was originally Kid Flash before becoming the Flash, making his journey one of DC's best-known legacy-hero stories.`,

        dossier: {
            history: `Wally began as Kid Flash and became an important member of the Teen Titans. He later inherited the Flash mantle and built his own legacy.`,
            equipment: `Wally relies primarily on his connection to the Speed Force rather than technology.`,
            themes: `His stories explore legacy, family, identity, responsibility and growing into a role once held by someone else.`
        }
    }
};

// ==========================================
// SAFE TEXT AND FORMATTING
// ==========================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function cleanComicVineText(value) {
    if (!value) return "";

    const element = document.createElement("div");
    element.innerHTML = String(value);

    element.querySelectorAll(
        "script,style,iframe,object,embed"
    ).forEach(node => node.remove());

    return (element.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
}

function formatParagraphs(value) {
    const text = String(value || "").trim();

    if (!text) return "<p>Information not available.</p>";

    return text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map(part => `<p>${escapeHTML(part.trim())}</p>`)
        .join("");
}

function formatComicVineList(items) {
    if (!Array.isArray(items) || !items.length) {
        return "<p>Not recorded in the archive.</p>";
    }

    return `<ul class="case-file-data-list">
        ${items.slice(0, 8).map(item =>
            `<li>${escapeHTML(item.name || "")}</li>`
        ).join("")}
    </ul>`;
}

function safeExternalURL(value) {
    try {
        const url = new URL(value);

        return url.protocol === "https:"
            ? url.href
            : "";
    } catch {
        return "";
    }
}

// ==========================================
// FEATURED READING CARDS
// ==========================================

function createReadingRecommendations(character) {
    return (character.readingRecommendations || [])
        .map((book, index) => `
            <article class="reading-recommendation">
                <div class="reading-cover">
                    <img
                        data-comic-cover="${escapeHTML(book.title)}"
                        alt="${escapeHTML(book.title)} cover"
                        loading="lazy"
                    >
                </div>

                <div class="reading-details">
                    <p class="reading-number">
                        READING PICK ${index + 1}
                    </p>

                    <h3>${escapeHTML(book.title)}</h3>

                    <p class="reading-writer">
                        Written by ${escapeHTML(book.writer)}
                    </p>

                    ${formatParagraphs(book.description)}

                    <p>
                        <strong>Why read it?</strong>
                        ${escapeHTML(book.reason)}
                    </p>

                    <p class="reading-level">
                        ${escapeHTML(book.level)}
                    </p>
                </div>
            </article>
        `).join("");
}

// ==========================================
// DOSSIER
// ==========================================

function createDossier(character) {
    if (!character.dossier) return "";

    return `
        <section class="case-file-section dossier-section">
            <details class="dossier-details">
                <summary class="dossier-summary">
                    <span>WANT TO KNOW MORE?</span>
                    <span class="dossier-open-label">
                        OPEN FULL DOSSIER +
                    </span>
                </summary>

                <div class="dossier-content">
                    <p class="dossier-intro">
                        ADDITIONAL INTELLIGENCE //
                        EXTENDED CHARACTER PROFILE
                    </p>

                    <section class="dossier-entry">
                        <h3>Character History</h3>
                        ${formatParagraphs(character.dossier.history)}
                    </section>

                    <section class="dossier-entry">
                        <h3>Equipment and Resources</h3>
                        ${formatParagraphs(character.dossier.equipment)}
                    </section>

                    <section class="dossier-entry">
                        <h3>Themes and Significance</h3>
                        ${formatParagraphs(character.dossier.themes)}
                    </section>
                </div>
            </details>
        </section>
    `;
}

// ==========================================
// FEATURED CASE FILE
// ==========================================

function createCaseFile(character) {
    return `
        <article class="case-file">
            <header class="case-file-header">
                <p class="case-file-status">
                    ${escapeHTML(character.status)}
                </p>
                <h1>${escapeHTML(character.name)}</h1>
                <h2>${escapeHTML(character.alias)}</h2>
            </header>

            <section class="case-file-introduction">
                <div class="case-file-image">
                    <img
                        data-character-image="${escapeHTML(character.realName)}"
                        data-character-id="${character.comicvineId}"
                        alt="${escapeHTML(character.name)}"
                    >
                </div>

                <div class="case-file-intro-content">
                    <h2>Meet ${escapeHTML(character.name)}</h2>

                    ${formatParagraphs(character.introduction)}

                    <p>
                        <strong>Real Name:</strong>
                        ${escapeHTML(character.realName)}
                    </p>

                    <p>
                        <strong>Affiliation:</strong>
                        ${escapeHTML(character.affiliation)}
                    </p>
                </div>
            </section>

            <section class="case-file-section">
                <h2>The Essentials</h2>

                <h3>Origin</h3>
                ${formatParagraphs(character.origin)}

                <h3>Personality</h3>
                ${formatParagraphs(character.personality)}

                <h3>Abilities</h3>
                ${formatParagraphs(character.abilities)}
            </section>

            <section class="case-file-section">
                <h2>Where to Start Reading</h2>

                <h3>Our Recommended Starting Point</h3>
                <h4>${escapeHTML(character.firstStory)}</h4>

                ${formatParagraphs(character.firstStoryDescription)}

                <h3>Suggested Reading Path</h3>

                <div class="reading-recommendations">
                    ${createReadingRecommendations(character)}
                </div>
            </section>

            ${createDossier(character)}

            <section class="case-file-section">
                <h2>Detective's Notes</h2>
                ${formatParagraphs(character.funFact)}
            </section>

            <section class="case-file-bookmark">
                <button
                    id="bookmark-button"
                    class="bookmark-button"
                    type="button"
                >
                    Save Case File
                </button>
            </section>
        </article>
    `;
}

// ==========================================
// AUTOMATIC CASE FILE
// ==========================================

function createDynamicCaseFile(data) {
    const name = data.name || "Unknown Character";

    const realName =
        data.real_name || "Not recorded in Comic Vine";

    const introduction = cleanComicVineText(
        data.deck || data.description
    ).slice(0, 1100) ||
        "This character has limited information in the archive.";

    const origin =
        data.origin?.name ||
        "Origin information is not recorded.";

    const powers = Array.isArray(data.powers)
        ? data.powers
        : [];

    const teams = Array.isArray(data.teams)
        ? data.teams
        : [];

    const extended = cleanComicVineText(
        data.description
    ).slice(0, 2000);

    const image =
        data.image?.super_url ||
        data.image?.medium_url ||
        data.image?.small_url ||
        "";

    const comicVineURL = safeExternalURL(
        data.site_detail_url
    );

    const dossier = {
        history: extended && extended !== introduction
            ? extended
            : "No additional character history is recorded.",
        equipment: powers.length
            ? powers.slice(0, 12)
                .map(power => power.name)
                .filter(Boolean)
                .join(", ")
            : "No further abilities are recorded.",
        themes:
            "Character information may vary between different comic continuities."
    };

    return `
        <article class="case-file">
            <header class="case-file-header">
                <p class="case-file-status">
                    AUTOMATICALLY GENERATED CASE FILE
                </p>

                <h1>${escapeHTML(name)}</h1>
                <h2>DC UNIVERSE // CHARACTER ARCHIVE</h2>
            </header>

            <section class="case-file-introduction">
                <div class="case-file-image">
                    <img
                        data-character-id="${escapeHTML(data.id)}"
                        data-character-image="${escapeHTML(name)}"
                        data-image-source="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                    >
                </div>

                <div class="case-file-intro-content">
                    <h2>Meet ${escapeHTML(name)}</h2>

                    ${formatParagraphs(introduction)}

                    <p>
                        <strong>Real Name:</strong>
                        ${escapeHTML(realName)}
                    </p>

                    <p>
                        <strong>Publisher:</strong>
                        ${escapeHTML(data.publisher?.name || "DC Comics")}
                    </p>
                </div>
            </section>

            <section class="case-file-section">
                <h2>The Essentials</h2>

                <h3>Origin</h3>
                <p>${escapeHTML(origin)}</p>

                <h3>Abilities</h3>
                ${formatComicVineList(powers)}

                <h3>Team Affiliations</h3>
                ${formatComicVineList(teams)}
            </section>

            <section class="case-file-section">
                <h2>Explore Their Comics</h2>

                <p class="reading-note">
                    These comics are selected from this
                    character's recorded appearances in Comic Vine.
                    Issue #1 is prioritised when available.
                    These are archive-based suggestions,
                    not individually reviewed recommendations.
                </p>

                <div id="automatic-comic-explorer">
                    <p class="reading-note">
                        SEARCHING CHARACTER COMICS...
                    </p>
                </div>
            </section>

            ${createDossier({ dossier })}

            <section class="case-file-section">
                <h2>Detective's Notes</h2>

                <p>
                    This case file uses information supplied
                    by Comic Vine. Some fields may be incomplete,
                    and comic continuity may vary.
                </p>

                ${comicVineURL ? `
                    <p>
                        <a
                            class="text-link"
                            href="${escapeHTML(comicVineURL)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            VIEW ORIGINAL COMIC VINE PROFILE
                        </a>
                    </p>
                ` : ""}
            </section>

            <section class="case-file-bookmark">
                <button
                    id="bookmark-button"
                    class="bookmark-button"
                    type="button"
                >
                    Save Case File
                </button>
            </section>
        </article>
    `;
}

// ==========================================
// LOADING / ERROR STATES
// ==========================================

function showLoadingState(container) {
    container.innerHTML = `
        <section class="case-file-loading" role="status">
            <p class="case-file-status">ACCESSING ARCHIVES</p>
            <h1>OPENING CASE FILE...</h1>
            <p>Retrieving character information.</p>
        </section>
    `;
}

function showNotFoundState(container) {
    container.innerHTML = `
        <section class="case-file-not-found">
            <p class="case-file-status">ARCHIVE SEARCH COMPLETE</p>
            <h1>CASE FILE NOT FOUND</h1>
            <p>We couldn't locate this character.</p>
            <a class="text-link" href="index.html">
                RETURN TO HEADQUARTERS
            </a>
        </section>
    `;
}

function showErrorState(container, message) {
    container.innerHTML = `
        <section class="case-file-error">
            <p class="case-file-status">ARCHIVE SYSTEM ERROR</p>
            <h1>UNABLE TO OPEN CASE FILE</h1>

            <p>${escapeHTML(message)}</p>

            <button
                type="button"
                id="retry-case-file"
                class="bookmark-button"
            >
                TRY AGAIN
            </button>

            <p>
                <a class="text-link" href="index.html">
                    RETURN TO HEADQUARTERS
                </a>
            </p>
        </section>
    `;

    document.getElementById("retry-case-file")
        ?.addEventListener(
            "click",
            loadCharacterPage
        );
}

// ==========================================
// BOOKMARKS
// ==========================================

function setupBookmark(characterId, savedData = null) {
    const button = document.getElementById(
        "bookmark-button"
    );

    if (!button) return;

    function update() {
        if (
            typeof isCharacterSaved === "function" &&
            isCharacterSaved(characterId)
        ) {
            button.textContent = "Remove Saved Case File";
            button.classList.add("saved");
        } else {
            button.textContent = "Save Case File";
            button.classList.remove("saved");
        }
    }

    update();

    button.addEventListener("click", () => {
        if (
            typeof saveCharacter !== "function" ||
            typeof removeCharacter !== "function" ||
            typeof isCharacterSaved !== "function"
        ) {
            console.error(
                "Saved character system is unavailable."
            );

            return;
        }

        if (isCharacterSaved(characterId)) {
            removeCharacter(characterId);
        } else {
            saveCharacter(characterId, savedData);
        }

        update();
    });
}

// ==========================================
// DYNAMIC CHARACTER LOADER
// ==========================================

async function loadDynamicCharacter(id, container) {
    const normalizedId = String(id)
        .replace(/^4005-/, "");

    if (!/^\d+$/.test(normalizedId)) {
        showNotFoundState(container);
        return;
    }

    try {
        const response = await fetch(
            `${CHARACTER_API_URL}/${encodeURIComponent(normalizedId)}`,
            {
                signal: AbortSignal.timeout(20000)
            }
        );

        if (response.status === 404) {
            showNotFoundState(container);
            return;
        }

        if (!response.ok) {
            throw new Error(
                `Comic Vine returned HTTP ${response.status}.`
            );
        }

        const result = await response.json();
        const character = result.character;

        if (!character?.id) {
            throw new Error(
                "The character record was incomplete."
            );
        }

        container.innerHTML =
            createDynamicCaseFile(character);

        const savedId = `comicvine-${character.id}`;

        setupBookmark(savedId, {
            id: savedId,
            comicvineId: character.id,
            name: character.name,
            realName: character.real_name || "",
            description:
                cleanComicVineText(character.deck)
                    .slice(0, 200),
            image:
                character.image?.super_url ||
                character.image?.medium_url ||
                character.image?.small_url ||
                "",
            link:
                `character.html?comicvineId=${character.id}`
        });

        if (typeof hydrateAutomaticImages === "function") {
            hydrateAutomaticImages(container).catch(
                console.warn
            );
        }

        if (
            typeof window.loadAutomaticComics === "function"
        ) {
            window.loadAutomaticComics(character.id);
        } else {
            const explorer = document.getElementById(
                "automatic-comic-explorer"
            );

            if (explorer) {
                explorer.textContent =
                    "The comic explorer is unavailable. Check automatic-content.js.";
            }
        }

        document.title =
            `${character.name} | The Detective Corps`;

    } catch (error) {
        console.error(
            "Character loading error:",
            error
        );

        showErrorState(
            container,
            "The archive could not retrieve this character. Check your server connection and try again."
        );
    }
}

// ==========================================
// PAGE INITIALIZATION
// ==========================================

async function loadCharacterPage() {
    const container = document.getElementById(
        "case-file-content"
    );

    if (!container) return;

    const params = new URLSearchParams(
        window.location.search
    );

    const comicVineId = params.get("comicvineId");
    const featuredId = params.get("id");

    showLoadingState(container);

    if (comicVineId) {
        await loadDynamicCharacter(
            comicVineId,
            container
        );

        return;
    }

    if (featuredId && caseFiles[featuredId]) {
        const character = caseFiles[featuredId];

        container.innerHTML =
            createCaseFile(character);

        setupBookmark(featuredId);

        if (
            typeof hydrateAutomaticImages === "function"
        ) {
            hydrateAutomaticImages(container).catch(
                console.warn
            );
        }

        document.title =
            `${character.name} | The Detective Corps`;

        return;
    }

    showNotFoundState(container);
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        loadCharacterPage
    );
} else {
    loadCharacterPage();
}
