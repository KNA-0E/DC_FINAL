
"use strict";

// ==========================================
// THE DETECTIVE CORPS
// AUTOMATIC CHARACTER COMIC EXPLORER
// ==========================================

(function () {

    const API_BASE =
        typeof DETECTIVE_CORPS_API !== "undefined"
            ? DETECTIVE_CORPS_API
            : "http://localhost:3000/api";

    let activeRequest = null;
    let activeCharacterId = null;

    // ======================================
    // SAFE TEXT
    // ======================================

    function safeText(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function safeURL(value) {
        try {
            const url = new URL(value);

            return url.protocol === "https:"
                ? url.href
                : "";
        } catch {
            return "";
        }
    }

    function getImageURL(comic) {
        if (typeof comic.image === "string") {
            return comic.image;
        }

        return (
            comic.image?.super_url ||
            comic.image?.medium_url ||
            comic.image?.small_url ||
            ""
        );
    }

    // ======================================
    // CREATE COMIC CARD
    // ======================================

    function createComicCard(comic, index) {
        const title = comic.title || "Comic issue";
        const number = comic.issueNumber || "";
        const image = getImageURL(comic);
        const url = safeURL(comic.url);

        const issueLabel = number
            ? `ISSUE #${number.replace(/^#/, "")}`
            : "COMIC APPEARANCE";

        const description = comic.description ||
            "A recorded appearance of this character.";

        const card = document.createElement("article");

        card.className =
            "reading-recommendation automatic-reading-card";

        // COVER

        const cover = document.createElement("div");
        cover.className = "reading-cover";

        const img = document.createElement("img");

        img.alt = `${title} ${issueLabel} cover`;
        img.loading = "lazy";
        img.dataset.imageKind = "comic";
        img.dataset.imageLabel =
            `${title} ${issueLabel}`;

        if (image) {
            img.dataset.imageSource = image;
        } else {
            img.dataset.comicCover = title;
        }

        if (typeof posterImage === "function") {
            img.src = posterImage(title, "comic");
        }

        cover.appendChild(img);

        // DETAILS

        const details = document.createElement("div");
        details.className = "reading-details";

        const label = document.createElement("p");
        label.className = "reading-number";
        label.textContent = `ARCHIVE FIND ${index + 1}`;

        const heading = document.createElement("h3");
        heading.textContent = title;

        const issue = document.createElement("p");
        issue.className = "reading-level";
        issue.textContent = issueLabel;

        const summary = document.createElement("p");
        summary.textContent = description;

        details.append(
            label,
            heading,
            issue,
            summary
        );

        if (comic.date) {
            const date = document.createElement("p");
            date.className = "reading-date";
            date.textContent =
                `COVER DATE: ${comic.date}`;

            details.appendChild(date);
        }

        if (comic.isFirstAppearance) {
            const first = document.createElement("p");
            first.className = "reading-level";
            first.textContent =
                "FIRST RECORDED APPEARANCE";

            details.appendChild(first);
        } else if (comic.isFirstIssue) {
            const firstIssue = document.createElement("p");
            firstIssue.className = "reading-level";
            firstIssue.textContent =
                "SERIES STARTING ISSUE";

            details.appendChild(firstIssue);
        }

        if (url) {
            const link = document.createElement("a");

            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "text-link";
            link.textContent =
                "VIEW COMIC IN ARCHIVE";

            details.appendChild(link);
        }

        card.append(cover, details);

        return card;
    }

    // ======================================
    // RENDER RESULTS
    // ======================================

    function renderComics(comics, explorer) {
        explorer.replaceChildren();

        if (!Array.isArray(comics) || !comics.length) {
            const empty = document.createElement("p");

            empty.className = "reading-note";
            empty.textContent =
                "No verified comic appearances could be retrieved for this character.";

            explorer.appendChild(empty);
            return;
        }

        const grid = document.createElement("div");
        grid.className = "reading-recommendations";

        const fragment =
            document.createDocumentFragment();

        comics.slice(0, 8).forEach((comic, index) => {
            fragment.appendChild(
                createComicCard(comic, index)
            );
        });

        grid.appendChild(fragment);
        explorer.appendChild(grid);

        if (typeof hydrateAutomaticImages === "function") {
            Promise.resolve(
                hydrateAutomaticImages(grid)
            ).catch(error => {
                console.warn(
                    "Comic image loading:",
                    error
                );
            });
        }
    }

    // ======================================
    // LOAD CHARACTER-SPECIFIC COMICS
    // ======================================

    async function loadAutomaticComics(characterId) {
        const id = String(characterId || "")
            .replace(/^4005-/, "");

        const explorer = document.getElementById(
            "automatic-comic-explorer"
        );

        if (!explorer) return;

        if (!/^\d+$/.test(id)) {
            explorer.textContent =
                "Invalid character archive reference.";
            return;
        }

        if (activeRequest) {
            activeRequest.abort();
        }

        activeCharacterId = id;

        const controller = new AbortController();
        activeRequest = controller;

        explorer.replaceChildren();

        const loading = document.createElement("p");
        loading.className = "reading-note";
        loading.textContent =
            "SEARCHING THIS CHARACTER'S COMIC APPEARANCES...";

        explorer.appendChild(loading);

        try {
            const response = await fetch(
                `${API_BASE}/characters/${encodeURIComponent(id)}/recommendations`,
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
                    `Archive request failed: ${response.status}`
                );
            }

            const data = await response.json();

            // Don't render results from an older character.
            if (
                activeCharacterId !== id ||
                controller.signal.aborted ||
                !explorer.isConnected
            ) {
                return;
            }

            const comics = Array.isArray(
                data.recommendations
            )
                ? data.recommendations
                : [];

            renderComics(comics, explorer);

        } catch (error) {
            if (error.name === "AbortError") return;

            console.error(
                "Character comics:",
                error
            );

            if (activeCharacterId === id) {
                explorer.replaceChildren();

                const message =
                    document.createElement("p");

                message.className = "reading-note";
                message.textContent =
                    "This character's comic records could not be retrieved. Please try again.";

                explorer.appendChild(message);

                const retry =
                    document.createElement("button");

                retry.type = "button";
                retry.className = "bookmark-button";
                retry.textContent = "RETRY COMIC SEARCH";

                retry.addEventListener("click", () => {
                    loadAutomaticComics(id);
                });

                explorer.appendChild(retry);
            }

        } finally {
            if (activeRequest === controller) {
                activeRequest = null;
            }
        }
    }

    // Expose only the function needed by character.js.
    window.loadAutomaticComics = loadAutomaticComics;

})();
