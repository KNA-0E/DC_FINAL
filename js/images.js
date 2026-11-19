
"use strict";

// ==========================================
// THE DETECTIVE CORPS
// AUTOMATIC IMAGE SYSTEM
// ==========================================

const DETECTIVE_CORPS_API = (
    window.location.port === "3000"
        ? ""
        : `http://${["localhost", "127.0.0.1"].includes(
            window.location.hostname
        ) ? window.location.hostname : "localhost"}:3000`
) + "/api";

// ==========================================
// FEATURED CHARACTER IDENTITIES
// ==========================================

// Use the exact Comic Vine character IDs.
// Local SVG graphics are FALLBACKS ONLY.

const FEATURED_CHARACTER_IMAGES = Object.freeze({
    batman: {
        id: "1699",
        fallback: "assets/images/featured/batman.svg"
    },
    "bruce wayne": {
        id: "1699",
        fallback: "assets/images/featured/batman.svg"
    },
    superman: {
        id: "1807",
        fallback: "assets/images/featured/superman.svg"
    },
    "clark kent": {
        id: "1807",
        fallback: "assets/images/featured/superman.svg"
    },
    "clark joseph kent": {
        id: "1807",
        fallback: "assets/images/featured/superman.svg"
    },
    "green lantern": {
        id: "10451",
        fallback: "assets/images/featured/green-lantern.svg"
    },
    "john stewart": {
        id: "10451",
        fallback: "assets/images/featured/green-lantern.svg"
    },
    flash: {
        id: "23879",
        fallback: "assets/images/featured/flash.svg"
    },
    "the flash": {
        id: "23879",
        fallback: "assets/images/featured/flash.svg"
    },
    "wally west": {
        id: "23879",
        fallback: "assets/images/featured/flash.svg"
    }
});

const FEATURED_BY_ID = Object.freeze({
    "1699": FEATURED_CHARACTER_IMAGES.batman,
    "1807": FEATURED_CHARACTER_IMAGES.superman,
    "10451": FEATURED_CHARACTER_IMAGES["john stewart"],
    "23879": FEATURED_CHARACTER_IMAGES["wally west"]
});

const LOCAL_PATH_ART = Object.freeze({
    "wonder woman": "assets/images/featured/wonder-woman.svg",
    nightwing: "assets/images/featured/nightwing.svg",
    joker: "assets/images/featured/joker.svg",
    "swamp thing": "assets/images/featured/swamp-thing.svg",
    "justice league": "assets/images/featured/justice-league.svg",
    flashpoint: "assets/images/featured/flashpoint.svg"
});

// ==========================================
// CACHE
// ==========================================

const characterImageCache = new Map();
const comicCoverCache = new Map();

const imageQueue = [];
let activeImageRequests = 0;

// ==========================================
// HELPERS
// ==========================================

function normalizeImageTerm(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function getFeaturedImageData(term, id = "") {
    const cleanId = String(id || "")
        .replace(/^4005-/, "")
        .replace(/^comicvine-/, "");

    return (
        FEATURED_BY_ID[cleanId] ||
        FEATURED_CHARACTER_IMAGES[
            normalizeImageTerm(term)
        ] ||
        null
    );
}

function featuredImageFile(term, id = "") {
    return getFeaturedImageData(term, id)?.fallback || "";
}

// ==========================================
// POSTER FALLBACK
// ==========================================

function posterImage(text, kind = "character") {
    const clean = String(text || "DC ARCHIVE")
        .slice(0, 45)
        .toUpperCase()
        .replace(/[&<>"']/g, "");

    const parts = clean.split(/\s+/);

    const mid = parts.length >= 3
        ? Math.ceil(parts.length / 2)
        : parts.length;

    const lines = [
        parts.slice(0, mid).join(" "),
        parts.slice(mid).join(" ")
    ].filter(Boolean);

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 600 800">
            <defs>
                <linearGradient id="bg"
                    x1="0" x2="1" y1="0" y2="1">
                    <stop stop-color="#152f22"/>
                    <stop offset="1" stop-color="#0c1812"/>
                </linearGradient>
            </defs>

            <rect width="600" height="800"
                fill="url(#bg)"/>

            <circle cx="300" cy="345" r="205"
                fill="none"
                stroke="#20c45a"
                stroke-opacity=".2"
                stroke-width="6"/>

            <path d="M-70 600L680 60M-40 750L680 210"
                stroke="#20c45a"
                stroke-opacity=".16"
                stroke-width="48"/>

            <rect x="22" y="22"
                width="556" height="756"
                stroke="#20c45a"
                stroke-opacity=".7"
                stroke-width="3"
                fill="none"/>

            <text x="300" y="116"
                text-anchor="middle"
                fill="#20c45a"
                font-size="26"
                font-family="monospace">
                THE DETECTIVE CORPS
            </text>

            ${lines.map((line, i) => `
                <text x="300"
                    y="${lines.length === 1 ? 395 : 350 + i * 58}"
                    text-anchor="middle"
                    fill="#ecf8f0"
                    font-size="${Math.max(
                        24,
                        44 - Math.max(0, line.length - 13) * 1.3
                    )}"
                    font-family="monospace"
                    font-weight="bold">
                    ${line}
                </text>
            `).join("")}

            <text x="300" y="687"
                text-anchor="middle"
                fill="#afc5b3"
                font-size="22"
                font-family="monospace">
                ${kind === "comic"
                    ? "COMIC ARCHIVE"
                    : "CHARACTER CASE FILE"}
            </text>
        </svg>
    `;

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg);
}

function localFallbackArt(label, kind = "character") {
    if (kind === "comic") {
        return posterImage(label, kind);
    }

    return (
        featuredImageFile(label) ||
        LOCAL_PATH_ART[normalizeImageTerm(label)] ||
        posterImage(label, kind)
    );
}

// ==========================================
// IMAGE PROXY
// ==========================================

function proxyImage(url, title, kind = "character") {
    if (
        typeof url !== "string" ||
        !/^https?:\/\//i.test(url)
    ) {
        return "";
    }

    return `${DETECTIVE_CORPS_API}/image?url=${
        encodeURIComponent(url)
    }&title=${encodeURIComponent(title)}&kind=${
        encodeURIComponent(kind)
    }`;
}

// ==========================================
// API REQUEST
// ==========================================

async function requestJSON(url) {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

// ==========================================
// REQUEST QUEUE
// ==========================================

function queued(task) {
    return new Promise((resolve, reject) => {
        imageQueue.push({
            task,
            resolve,
            reject
        });

        pump();
    });
}

function pump() {
    while (
        activeImageRequests < 3 &&
        imageQueue.length
    ) {
        const item = imageQueue.shift();

        activeImageRequests++;

        Promise.resolve()
            .then(item.task)
            .then(item.resolve, item.reject)
            .finally(() => {
                activeImageRequests--;
                pump();
            });
    }
}

// ==========================================
// CHARACTER IMAGE LOOKUP
// ==========================================

async function findComicVineCharacterImage(term, id = "") {
    const featured = getFeaturedImageData(term, id);

    // Featured characters use their exact identities.
    const correctId = featured
        ? featured.id
        : String(id || "")
            .replace(/^4005-/, "")
            .replace(/^comicvine-/, "");

    const key = correctId
        ? `id:${correctId}`
        : `name:${normalizeImageTerm(term)}`;

    if (!characterImageCache.has(key)) {
        const promise = queued(async () => {
            const params = new URLSearchParams();

            if (correctId) {
                params.set("id", correctId);
            } else {
                params.set("search", term);
            }

            const result = await requestJSON(
                `${DETECTIVE_CORPS_API}/character-image?${params}`
            );

            return result.image || "";
        }).catch(error => {
            console.warn(
                "Character image lookup:",
                term || correctId,
                error.message
            );

            return "";
        });

        characterImageCache.set(key, promise);
    }

    return characterImageCache.get(key);
}

// ==========================================
// COMIC COVER LOOKUP
// ==========================================

async function findComicVineCover(title) {
    const key = normalizeImageTerm(title);

    if (!comicCoverCache.has(key)) {
        const promise = queued(async () => {
            const data = await requestJSON(
                `${DETECTIVE_CORPS_API}/comic-covers?search=${
                    encodeURIComponent(title)
                }`
            );

            return data.cover?.image || "";
        }).catch(error => {
            console.warn(
                "Comic cover lookup:",
                title,
                error.message
            );

            return "";
        });

        comicCoverCache.set(key, promise);
    }

    return comicCoverCache.get(key);
}

// ==========================================
// DISPLAY IMAGE
// ==========================================

function showAutomaticImage(
    img,
    source,
    label,
    kind = "character"
) {
    const fallback = kind === "comic"
        ? posterImage(label, "comic")
        : (
            featuredImageFile(
                label,
                img.dataset.characterId
            ) ||
            localFallbackArt(label, kind)
        );

    if (!source) {
        img.onerror = () => {
            img.onerror = null;
            img.src = posterImage(label, kind);
        };

        img.src = fallback;
        return;
    }

    const isRemote = /^https?:\/\//i.test(source);

    const proxied = isRemote
        ? proxyImage(source, label, kind)
        : source;

    let directAttempted = false;

    img.onerror = () => {
        if (isRemote && !directAttempted) {
            // Try the original Comic Vine image if
            // the backend image proxy fails.
            directAttempted = true;
            img.src = source;
        } else {
            img.onerror = null;
            img.src = fallback;
        }
    };

    img.src = proxied || fallback;
}

// ==========================================
// FEATURED COMIC COVERS
// ==========================================

function prepareFeaturedReadingCovers(
    scope = document
) {
    const cards = [
        ...(scope.matches?.(".reading-recommendation")
            ? [scope]
            : []),
        ...scope.querySelectorAll(
            ".reading-recommendation"
        )
    ];

    cards.forEach(card => {
        if (
            card.classList.contains(
                "automatic-reading-card"
            )
        ) {
            return;
        }

        const box = card.querySelector(
            ".reading-cover"
        );

        const title = card.querySelector(
            ".reading-details h3"
        )?.textContent?.trim();

        if (!box || !title) return;

        let img = box.querySelector("img");

        if (!img) {
            img = document.createElement("img");
            box.prepend(img);
        }

        img.alt = `${title} comic cover`;
        img.dataset.comicCover = title;
        img.loading = "lazy";

        box.querySelectorAll("span").forEach(
            element => {
                element.style.display = "none";
            }
        );
    });
}

// ==========================================
// HYDRATE ALL AUTOMATIC IMAGES
// ==========================================

async function hydrateAutomaticImages(
    scope = document
) {
    if (!scope?.querySelectorAll) return;

    prepareFeaturedReadingCovers(scope);

    const selector = [
        "img[data-character-image]",
        "img[data-character-id]",
        "img[data-comic-cover]",
        "img[data-image-source]"
    ].join(",");

    const images = [
        ...(scope.matches?.(selector)
            ? [scope]
            : []),
        ...scope.querySelectorAll(selector)
    ];

    await Promise.all(
        images.map(async img => {
            if (
                img.dataset.imageHydrated === "true"
            ) {
                return;
            }

            img.dataset.imageHydrated = "true";
            img.style.display = "block";

            const isComic = Boolean(
                img.dataset.comicCover ||
                img.dataset.imageKind === "comic"
            );

            const kind = isComic
                ? "comic"
                : "character";

            const label = (
                isComic
                    ? img.dataset.comicCover
                    : img.dataset.characterImage
            ) ||
                img.dataset.imageLabel ||
                img.alt ||
                "DC ARCHIVE";

            // Display a fallback immediately
            // while the real image loads.
            const fallback = isComic
                ? posterImage(label, "comic")
                : (
                    featuredImageFile(
                        label,
                        img.dataset.characterId
                    ) ||
                    localFallbackArt(label, kind)
                );

            img.onerror = () => {
                img.onerror = null;
                img.src = posterImage(label, kind);
            };

            img.src = fallback;

            // IMPORTANT:
            // Never stop at the local SVG for
            // featured characters.
            // Always attempt Comic Vine artwork.

            const featured = !isComic
                ? getFeaturedImageData(
                    label,
                    img.dataset.characterId
                )
                : null;

            let raw = "";

            try {
                if (featured) {
                    // Exact Comic Vine identity takes
                    // priority over any stored image.
                    raw =
                        await findComicVineCharacterImage(
                            label,
                            featured.id
                        );

                } else if (
                    img.dataset.imageSource
                ) {
                    raw = img.dataset.imageSource;

                } else if (isComic) {
                    raw = await findComicVineCover(
                        label
                    );

                } else {
                    raw =
                        await findComicVineCharacterImage(
                            label,
                            img.dataset.characterId || ""
                        );
                }

            } catch (error) {
                console.warn(
                    "Automatic image:",
                    label,
                    error
                );
            }

            if (img.isConnected && raw) {
                showAutomaticImage(
                    img,
                    raw,
                    label,
                    kind
                );
            }

            const sibling =
                img.nextElementSibling;

            if (
                sibling?.classList.contains(
                    "image-auto-fallback"
                ) ||
                sibling?.classList.contains(
                    "image-fallback"
                )
            ) {
                sibling.hidden = true;
            }
        })
    );
}

// ==========================================
// INITIALIZATION
// ==========================================

function startImageHydration() {
    hydrateAutomaticImages(document).catch(
        error => {
            console.error(
                "Image hydration:",
                error
            );
        }
    );
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        startImageHydration
    );
} else {
    startImageHydration();
}

