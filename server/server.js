
"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.resolve(__dirname, "..");

const CACHE_MS = 30 * 60 * 1000;
const cache = new Map();

// Specific DC comic-book identities.
// Prevents Barry Allen, Hal Jordan, and alternate versions
// from replacing the featured characters.

const FEATURED = {
    batman: {
        id: 1699,
        name: "Batman",
        realName: "Bruce Wayne"
    },
    "bruce wayne": {
        id: 1699,
        name: "Batman",
        realName: "Bruce Wayne"
    },
    superman: {
        id: 1807,
        name: "Superman",
        realName: "Clark Kent"
    },
    "clark kent": {
        id: 1807,
        name: "Superman",
        realName: "Clark Kent"
    },
    "clark joseph kent": {
        id: 1807,
        name: "Superman",
        realName: "Clark Kent"
    },
    "green lantern": {
        id: 10451,
        name: "John Stewart",
        realName: "John Stewart"
    },
    "john stewart": {
        id: 10451,
        name: "John Stewart",
        realName: "John Stewart"
    },
    "green lantern john stewart": {
        id: 10451,
        name: "John Stewart",
        realName: "John Stewart"
    },
    flash: {
        id: 23879,
        name: "Wally West",
        realName: "Wally West"
    },
    "wally west": {
        id: 23879,
        name: "Wally West",
        realName: "Wally West"
    },
    "flash wally west": {
        id: 23879,
        name: "Wally West",
        realName: "Wally West"
    }
};

function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function numericId(value) {
    return String(value || "").replace(/^4005-/, "");
}

function validId(value) {
    return /^\d{1,10}$/.test(numericId(value));
}

function imageFrom(item) {
    return (
        item?.image?.super_url ||
        item?.image?.medium_url ||
        item?.image?.small_url ||
        item?.image?.original_url ||
        item?.image?.icon_url ||
        ""
    );
}

function dcPublisher(character) {
    const publisher = character?.publisher;

    const name = normalize(
        typeof publisher === "string"
            ? publisher
            : publisher?.name
    );

    if (!name) return null;

    return (
        name === "dc" ||
        name === "dc comics" ||
        name.startsWith("dc comics ")
    );
}

// ==========================================
// CACHE
// ==========================================

function cacheResult(key, load, lifetime = CACHE_MS) {
    const hit = cache.get(key);

    if (hit && hit.until > Date.now()) {
        return hit.promise;
    }

    const promise = Promise.resolve().then(load);

    cache.set(key, {
        promise,
        until: Date.now() + lifetime
    });

    promise.catch(() => {
        if (cache.get(key)?.promise === promise) {
            cache.delete(key);
        }
    });

    return promise;
}

// ==========================================
// COMIC VINE API
// ==========================================

function buildUrl(resource) {
    const url = new URL(
        `https://comicvine.gamespot.com/api/${resource}/`
    );

    url.searchParams.set(
        "api_key",
        process.env.COMICVINE_API_KEY || ""
    );

    url.searchParams.set("format", "json");

    return url;
}

async function comicVineRequest(url, timeout = 16000) {
    if (!process.env.COMICVINE_API_KEY) {
        const error = new Error(
            "Comic Vine API key missing. Check server/.env."
        );

        error.code = "MISSING_KEY";
        throw error;
    }

    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "TheDetectiveCorps/1.0 (student fan project)",
            Accept: "application/json"
        },
        signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) {
        throw new Error(
            `Comic Vine HTTP ${response.status}`
        );
    }

    const body = await response.json();

    if (Number(body.status_code) !== 1) {
        throw new Error(
            body.error ||
            "Comic Vine returned an unsuccessful response."
        );
    }

    return body.results;
}

// ==========================================
// CHARACTER DETAILS
// ==========================================

const CHARACTER_FIELDS = [
    "id",
    "name",
    "real_name",
    "aliases",
    "deck",
    "description",
    "image",
    "publisher",
    "site_detail_url",
    "first_appeared_in_issue",
    "origin",
    "powers",
    "teams"
].join(",");

function getCharacterDetails(id) {
    const clean = numericId(id);

    if (!validId(clean)) {
        throw new Error("Invalid character ID.");
    }

    return cacheResult(
        `character:${clean}`,
        async () => {
            const url = buildUrl(
                `character/4005-${clean}`
            );

            url.searchParams.set(
                "field_list",
                CHARACTER_FIELDS
            );

            const character = await comicVineRequest(url);

            if (!character?.id) {
                throw new Error("Character not found.");
            }

            return character;
        }
    );
}

// ==========================================
// CHARACTER SEARCH
// ==========================================

async function searchCharacters(query) {
    const term = normalize(query);

    if (term === "justice league") {
        const members = [
            FEATURED.batman,
            FEATURED.superman,
            FEATURED["john stewart"],
            FEATURED["wally west"]
        ];

        return members.map(member => ({
            id: member.id,
            name: member.name,
            real_name: member.realName,
            deck: "A featured Justice League character.",
            publisher: {
                name: "DC Comics"
            }
        }));
    }

    return cacheResult(
        `search:v3:${term}`,
        async () => {
            async function performSearch(value) {
                const url = buildUrl("search");

                url.searchParams.set("query", value);
                url.searchParams.set(
                    "resources",
                    "character"
                );
                url.searchParams.set("limit", "40");
                url.searchParams.set(
                    "field_list",
                    [
                        "id",
                        "name",
                        "real_name",
                        "deck",
                        "image",
                        "publisher",
                        "site_detail_url"
                    ].join(",")
                );

                const results = await comicVineRequest(url);

                return Array.isArray(results)
                    ? results.filter(item => item?.id)
                    : [];
            }

            const aliases = {
                shazam: "Captain Marvel",
                "billy batson": "Captain Marvel",
                "hal jordan": "Green Lantern",
                "dick grayson": "Nightwing",
                "green arrow": "Oliver Queen",
                "barry allen": "Flash"
            };

            let found = await performSearch(query);

            if (
                aliases[term] &&
                !found.some(item =>
                    normalize(item.name) === term ||
                    normalize(item.real_name).includes(term)
                )
            ) {
                try {
                    const extra = await performSearch(
                        aliases[term]
                    );

                    found = [...found, ...extra];
                } catch {
                    // Keep the original results.
                }
            }

            const canonical = FEATURED[term];

            if (
                canonical &&
                !found.some(item =>
                    Number(item.id) === canonical.id
                )
            ) {
                found.unshift({
                    id: canonical.id,
                    name: canonical.name,
                    real_name: canonical.realName,
                    publisher: {
                        name: "DC Comics"
                    },
                    deck: "Featured character case file."
                });
            }

            const seen = new Set();

            found = found.filter(item => {
                const id = Number(item.id);

                if (
                    !Number.isInteger(id) ||
                    seen.has(id)
                ) {
                    return false;
                }

                seen.add(id);
                return true;
            });

            function relevance(item) {
                const name = normalize(item.name);
                const real = normalize(item.real_name);

                return (
                    (Number(item.id) === canonical?.id
                        ? 30 : 0) +
                    (name === term ? 20 : 0) +
                    (real === term ? 15 : 0) +
                    (name.includes(term) ? 7 : 0) +
                    (real.includes(term) ? 6 : 0) +
                    (
                        term.includes(name) &&
                        name.length >= 4 ? 4 : 0
                    ) +
                    (dcPublisher(item) === true ? 3 : 0)
                );
            }

            found.sort(
                (a, b) => relevance(b) - relevance(a)
            );

            const ready = found.filter(
                item => dcPublisher(item) === true
            );

            const uncertain = found
                .filter(
                    item => dcPublisher(item) === null
                )
                .slice(0, 16);

            for (
                let i = 0;
                i < uncertain.length;
                i += 4
            ) {
                const batch = await Promise.all(
                    uncertain
                        .slice(i, i + 4)
                        .map(async item => {
                            try {
                                const detail =
                                    await getCharacterDetails(
                                        item.id
                                    );

                                if (
                                    dcPublisher(detail) === false
                                ) {
                                    return null;
                                }

                                if (
                                    dcPublisher(detail) === null &&
                                    relevance(item) < 7
                                ) {
                                    return null;
                                }

                                return {
                                    ...item,
                                    ...detail,
                                    image:
                                        detail.image ||
                                        item.image
                                };
                            } catch {
                                return null;
                            }
                        })
                );

                ready.push(
                    ...batch.filter(Boolean)
                );
            }

            return [
                ...new Map(
                    ready.map(item => [
                        Number(item.id),
                        item
                    ])
                ).values()
            ]
                .sort(
                    (a, b) =>
                        relevance(b) - relevance(a)
                )
                .slice(0, 24);
        },
        10 * 60 * 1000
    );
}

// ==========================================
// CHARACTER IMAGES
// ==========================================

async function findCharacterImage(term) {
    const canonical = FEATURED[normalize(term)];

    if (canonical) {
        const character = await getCharacterDetails(
            canonical.id
        );

        return {
            image: imageFrom(character),
            character
        };
    }

    const results = await searchCharacters(term);

    const match = results.find(item =>
        normalize(item.name) === normalize(term) ||
        normalize(item.real_name) === normalize(term)
    );

    if (!match) {
        return {
            image: "",
            character: null
        };
    }

    if (imageFrom(match)) {
        return {
            image: imageFrom(match),
            character: match
        };
    }

    const detail = await getCharacterDetails(match.id);

    return {
        image: imageFrom(detail),
        character: detail
    };
}

// ==========================================
// SAFE IMAGE PROXY
// ==========================================

const allowedImageHosts = new Set([
    "comicvine.gamespot.com",
    "comicvine1.cbsistatic.com",
    "www.comicvine.com",
    "comicvine.com",
    "static.comicvine.com",
    "gamespot.com",
    "www.gamespot.com"
]);

function validatedImageURL(value) {
    try {
        const url = new URL(String(value));

        if (
            !["https:", "http:"].includes(url.protocol) ||
            !allowedImageHosts.has(
                url.hostname.toLowerCase()
            )
        ) {
            return null;
        }

        if (
            !/(?:\.(?:jpg|jpeg|png|webp|gif)(?:$|\?)|\/uploads\/)/i
                .test(url.pathname)
        ) {
            return null;
        }

        url.protocol = "https:";

        return url;
    } catch {
        return null;
    }
}

function imageCandidates(raw) {
    const initial = validatedImageURL(raw);

    if (!initial) return [];

    const options = [];

    if (
        initial.hostname ===
        "comicvine1.cbsistatic.com"
    ) {
        options.push(
            new URL(
                `https://comicvine.gamespot.com/a${
                    initial.pathname
                }${initial.search}`
            )
        );
    }

    options.push(initial);

    return options;
}

async function imageBytes(url) {
    let current = url;
    let response;

    for (let attempt = 0; attempt < 4; attempt++) {
        response = await fetch(current, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; TheDetectiveCorps/1.0)",
                Accept:
                    "image/avif,image/webp,image/*,*/*;q=0.8"
            },
            redirect: "manual",
            signal: AbortSignal.timeout(7500)
        });

        if (
            ![301, 302, 303, 307, 308]
                .includes(response.status)
        ) {
            break;
        }

        const target = response.headers.get(
            "location"
        );

        if (!target) {
            throw new Error(
                "Image redirect has no destination."
            );
        }

        const next = validatedImageURL(
            new URL(target, current).href
        );

        if (!next) {
            throw new Error(
                "Image redirect is outside allowed hosts."
            );
        }

        current = next;
    }

    if (!response?.ok) {
        throw new Error(
            `Remote image HTTP ${response?.status}`
        );
    }

    const contentType = (
        response.headers.get("content-type") || ""
    )
        .split(";")[0]
        .toLowerCase();

    if (
        !/^image\/(jpeg|png|webp|gif|avif)$/
            .test(contentType)
    ) {
        throw new Error(
            "Remote response is not an image."
        );
    }

    if (
        Number(
            response.headers.get(
                "content-length"
            ) || 0
        ) > 8000000
    ) {
        throw new Error(
            "Remote image is too large."
        );
    }

    const data = Buffer.from(
        await response.arrayBuffer()
    );

    if (data.length > 8000000) {
        throw new Error(
            "Remote image is too large."
        );
    }

    return {
        data,
        contentType
    };
}

// ==========================================
// AUTOMATIC FALLBACK POSTER
// ==========================================

function svgPoster(label, kind = "character") {
    const safe = String(
        label || "DC ARCHIVE"
    )
        .slice(0, 40)
        .replace(/[<>&"']/g, "");

    const words = safe
        .toUpperCase()
        .split(/\s+/);

    const split =
        words.length > 2
            ? Math.ceil(words.length / 2)
            : words.length;

    const lines = [
        words.slice(0, split).join(" "),
        words.slice(split).join(" ")
    ].filter(Boolean);

    const y = lines.length === 1 ? 330 : 300;

    const text = lines.map(
        (line, index) =>
            `<text x="50%" y="${y + index * 55}"
            text-anchor="middle"
            font-family="monospace"
            font-size="${
                Math.max(
                    22,
                    40 -
                    Math.max(
                        0,
                        line.length - 12
                    ) * 1.5
                )
            }"
            font-weight="bold"
            fill="#F0F5EF">${line}</text>`
    ).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg"
        width="500" height="700"
        viewBox="0 0 500 700">
        <rect width="500" height="700"
        fill="#14241A"/>
        <rect x="24" y="24"
        width="452" height="652"
        fill="none"
        stroke="#20C45A"
        stroke-width="4"/>
        <text x="50%" y="115"
        text-anchor="middle"
        font-size="23"
        font-family="monospace"
        fill="#20C45A">
        THE DETECTIVE CORPS
        </text>
        ${text}
        <text x="50%" y="600"
        text-anchor="middle"
        font-size="19"
        font-family="monospace"
        fill="#A1BDAC">
        ${
            kind === "comic"
                ? "COMIC ARCHIVE"
                : "DC CHARACTER FILE"
        }
        </text>
    </svg>`;
}

// ==========================================
// COMIC COVER SEARCH
// ==========================================

async function getComicCover(title) {
    const key = normalize(title);

    return cacheResult(
        `cover:v3:${key}`,
        async () => {
            const url = buildUrl("search");

            url.searchParams.set(
                "resources",
                "volume"
            );
            url.searchParams.set(
                "query",
                title
            );
            url.searchParams.set(
                "limit",
                "40"
            );
            url.searchParams.set(
                "field_list",
                [
                    "id",
                    "name",
                    "image",
                    "site_detail_url",
                    "start_year",
                    "first_issue"
                ].join(",")
            );

            const results =
                await comicVineRequest(url);

            const volumes = (
                Array.isArray(results)
                    ? results
                    : []
            ).filter(item => item?.id);

            const matches = volumes
                .map(item => {
                    const candidate =
                        normalize(item.name);

                    const score =
                        candidate === key
                            ? 100
                            : candidate.startsWith(
                                key + " "
                            )
                                ? 80
                                : key.startsWith(
                                    candidate + " "
                                ) &&
                                candidate.length >=
                                key.length * 0.75
                                    ? 35
                                    : 0;

                    return {
                        volume: item,
                        score
                    };
                })
                .filter(item => item.score >= 35)
                .sort(
                    (a, b) => b.score - a.score
                );

            for (
                const { volume } of matches.slice(0, 6)
            ) {
                let image = imageFrom(volume);

                if (
                    !image &&
                    volume.first_issue?.id
                ) {
                    try {
                        const issue = await getIssue(
                            volume.first_issue.id
                        );

                        image = imageFrom(issue);
                    } catch {
                        // Try the next matching volume.
                    }
                }

                if (image) {
                    return {
                        title: volume.name,
                        image,
                        url:
                            volume.site_detail_url ||
                            ""
                    };
                }
            }

            return null;
        }
    );
}

// ==========================================
// COMIC ISSUES
// ==========================================

const ISSUE_FIELDS = [
    "id",
    "name",
    "issue_number",
    "cover_date",
    "image",
    "deck",
    "description",
    "volume",
    "site_detail_url",
    "character_credits"
].join(",");

function getIssue(id) {
    if (!/^\d+$/.test(String(id))) {
        throw new Error("Invalid issue ID.");
    }

    return cacheResult(
        `issue:${id}`,
        async () => {
            const url = buildUrl(
                `issue/4000-${id}`
            );

            url.searchParams.set(
                "field_list",
                ISSUE_FIELDS
            );

            return comicVineRequest(url);
        }
    );
}

// ==========================================
// CHARACTER-SPECIFIC COMICS
// ==========================================

// Every selected issue must be in the
// requested character's issue credits.

async function getReadingForCharacter(id) {
    const clean = numericId(id);

    return cacheResult(
        `reading:v4:${clean}`,
        async () => {
            const character =
                await getCharacterDetails(clean);

            const url = buildUrl(
                `character/4005-${clean}`
            );

            url.searchParams.set(
                "field_list",
                "id,issue_credits"
            );

            const creditResponse =
                await comicVineRequest(
                    url,
                    22000
                );

            const credits = Array.isArray(
                creditResponse?.issue_credits
            )
                ? creditResponse.issue_credits.filter(
                    item => item?.id
                )
                : [];

            const first = Number(
                character
                    .first_appeared_in_issue?.id || 0
            );

            const creditIds = new Set(
                credits.map(
                    item => Number(item.id)
                )
            );

            if (first) {
                creditIds.add(first);
            }

            if (!creditIds.size) {
                return [];
            }

            const tokens = [
                normalize(character.name),
                normalize(character.real_name)
            ].filter(
                value =>
                    value.length >= 4 &&
                    ![
                        "the flash",
                        "flash",
                        "green lantern"
                    ].includes(value)
            );

            let matchingVolumeIssues = [];

            if (
                normalize(character.name).length > 3
            ) {
                try {
                    const search = buildUrl(
                        "search"
                    );

                    search.searchParams.set(
                        "query",
                        character.name
                    );

                    search.searchParams.set(
                        "resources",
                        "volume"
                    );

                    search.searchParams.set(
                        "limit",
                        "40"
                    );

                    search.searchParams.set(
                        "field_list",
                        "id,name,first_issue,start_year"
                    );

                    const raw =
                        await comicVineRequest(
                            search
                        );

                    matchingVolumeIssues = (
                        Array.isArray(raw)
                            ? raw
                            : []
                    )
                        .filter(volume =>
                            volume.first_issue?.id &&
                            creditIds.has(
                                Number(
                                    volume.first_issue.id
                                )
                            ) &&
                            (
                                tokens.some(token =>
                                    normalize(
                                        volume.name
                                    ).includes(token)
                                ) ||
                                normalize(
                                    volume.name
                                ).includes(
                                    normalize(
                                        character.name
                                    )
                                )
                            )
                        )
                        .sort(
                            (a, b) =>
                                Number(
                                    b.start_year || 0
                                ) -
                                Number(
                                    a.start_year || 0
                                )
                        )
                        .map(
                            volume =>
                                Number(
                                    volume.first_issue.id
                                )
                        )
                        .slice(0, 8);
                } catch {
                    // Use the verified issue credits.
                }
            }

            function scoreCredit(item) {
                const name = normalize(
                    item.name
                );

                return (
                    (
                        tokens.some(token =>
                            name.includes(token)
                        )
                            ? 15
                            : 0
                    ) +
                    (
                        /\b(?:1|one|rebirth|origin|beginning)\b/
                            .test(name)
                            ? 4
                            : 0
                    )
                );
            }

            const ranked = [...credits].sort(
                (a, b) =>
                    scoreCredit(b) -
                    scoreCredit(a)
            );

            const picks = [
                first,
                ...matchingVolumeIssues,
                ...ranked
                    .slice(0, 12)
                    .map(
                        item => Number(item.id)
                    )
            ];

            const stride = Math.max(
                1,
                Math.floor(
                    credits.length / 24
                )
            );

            for (
                let i = 0;
                i < credits.length &&
                picks.length < 38;
                i += stride
            ) {
                picks.push(
                    Number(credits[i].id)
                );
            }

            const candidateIds = [
                ...new Set(picks)
            ]
                .filter(
                    number =>
                        number &&
                        creditIds.has(number)
                )
                .slice(0, 22);

            const issues = [];

            for (
                let i = 0;
                i < candidateIds.length;
                i += 4
            ) {
                const batch =
                    await Promise.all(
                        candidateIds
                            .slice(i, i + 4)
                            .map(async number => {
                                try {
                                    return await getIssue(
                                        number
                                    );
                                } catch {
                                    return null;
                                }
                            })
                    );

                issues.push(
                    ...batch.filter(
                        item =>
                            item?.id &&
                            creditIds.has(
                                Number(item.id)
                            )
                    )
                );
            }

            const series = new Map();

            for (const issue of issues) {
                const title =
                    issue.volume?.name ||
                    issue.name ||
                    "Comic issue";

                const number = String(
                    issue.issue_number || ""
                );

                const record = {
                    id: issue.id,
                    title,
                    issueNumber: number,
                    isFirstIssue:
                        /^#?0*1$/.test(number),
                    isFirstAppearance:
                        Number(issue.id) === first,
                    date:
                        issue.cover_date || "",
                    image:
                        imageFrom(issue),
                    url:
                        issue.site_detail_url || "",
                    description:
                        Number(issue.id) === first
                            ? `Comic Vine identifies this as ${character.name}'s first appearance.`
                            : `A recorded appearance of ${character.name}, verified against this character's Comic Vine issue credits.`
                };

                function relevance(item) {
                    return (
                        (
                            tokens.some(token =>
                                normalize(
                                    item.title
                                ).includes(token)
                            )
                                ? 24
                                : 0
                        ) +
                        (
                            normalize(
                                item.title
                            ).includes(
                                normalize(
                                    character.name
                                )
                            )
                                ? 18
                                : 0
                        ) +
                        (
                            item.isFirstIssue
                                ? 12
                                : 0
                        ) +
                        (
                            item.isFirstAppearance
                                ? 3
                                : 0
                        ) +
                        (
                            item.image
                                ? 4
                                : 0
                        ) +
                        (
                            matchingVolumeIssues.includes(
                                Number(item.id)
                            )
                                ? 10
                                : 0
                        )
                    );
                }

                const seriesId = String(
                    issue.volume?.id ||
                    normalize(title)
                );

                const old = series.get(
                    seriesId
                );

                if (
                    !old ||
                    relevance(record) >
                    relevance(old)
                ) {
                    series.set(
                        seriesId,
                        record
                    );
                }
            }

            function scoreResult(item) {
                return (
                    (
                        tokens.some(token =>
                            normalize(
                                item.title
                            ).includes(token)
                        )
                            ? 24
                            : 0
                    ) +
                    (
                        normalize(
                            item.title
                        ).includes(
                            normalize(
                                character.name
                            )
                        )
                            ? 18
                            : 0
                    ) +
                    (
                        item.isFirstIssue
                            ? 12
                            : 0
                    ) +
                    (
                        item.isFirstAppearance
                            ? 3
                            : 0
                    ) +
                    (
                        item.image
                            ? 4
                            : 0
                    ) +
                    (
                        matchingVolumeIssues.includes(
                            Number(item.id)
                        )
                            ? 10
                            : 0
                    )
                );
            }

            return [...series.values()]
                .sort(
                    (a, b) =>
                        scoreResult(b) -
                        scoreResult(a)
                )
                .slice(0, 8);
        },
        60 * 60 * 1000
    );
}

// ==========================================
// EXPRESS CONFIGURATION
// ==========================================

app.use(cors({
    origin(origin, callback) {
        if (
            !origin ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
                .test(origin) ||
            (
                process.env.ALLOWED_ORIGIN &&
                origin === process.env.ALLOWED_ORIGIN
            )
        ) {
            return callback(null, true);
        }

        return callback(
            new Error("Origin not allowed.")
        );
    }
}));

app.use(express.json({
    limit: "32kb"
}));

function apiError(res, error, label) {
    console.error(
        `${label}:`,
        error.message
    );

    const status =
        error.code === "MISSING_KEY"
            ? 503
            : 502;

    return res.status(status).json({
        error:
            error.code === "MISSING_KEY"
                ? "Comic Vine API key missing. Check server/.env and restart."
                : `${label} failed. Check the server terminal.`
    });
}

// ==========================================
// API HEALTH
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        comicVineKeyConfigured:
            Boolean(
                process.env.COMICVINE_API_KEY
            ),
        message:
            process.env.COMICVINE_API_KEY
                ? "Backend ready."
                : "Add your Comic Vine API key to server/.env."
    });
});

// ==========================================
// SEARCH API
// ==========================================

app.get("/api/characters", async (req, res) => {
    const search = String(
        req.query.search || ""
    ).trim();

    if (
        !search ||
        search.length > 100
    ) {
        return res.status(400).json({
            error:
                "Enter a character name."
        });
    }

    try {
        const results =
            await searchCharacters(search);

        res.json({
            results,
            totalResults:
                results.length
        });
    } catch (error) {
        apiError(
            res,
            error,
            "Character search"
        );
    }
});

// ==========================================
// CHARACTER IMAGE API
// ==========================================

app.get(
    "/api/character-image",
    async (req, res) => {
        const search = String(
            req.query.search || ""
        ).trim();

        const id = String(
            req.query.id || ""
        ).trim();

        if (
            !id &&
            (
                !search ||
                search.length > 100
            )
        ) {
            return res.status(400).json({
                error:
                    "Provide a character name or ID."
            });
        }

        if (id && !validId(id)) {
            return res.status(400).json({
                error:
                    "Invalid character ID."
            });
        }

        try {
            const result = id
                ? {
                    character:
                        await getCharacterDetails(
                            id
                        )
                }
                : await findCharacterImage(
                    search
                );

            const character =
                result.character;

            if (
                !character ||
                dcPublisher(character) === false
            ) {
                return res.json({
                    image: "",
                    character: null
                });
            }

            res.json({
                image:
                    imageFrom(character),
                character: {
                    id:
                        character.id,
                    name:
                        character.name,
                    real_name:
                        character.real_name
                }
            });
        } catch (error) {
            apiError(
                res,
                error,
                "Character image"
            );
        }
    }
);

// ==========================================
// COMIC COVER API
// ==========================================

app.get(
    "/api/comic-covers",
    async (req, res) => {
        const title = String(
            req.query.search || ""
        ).trim();

        if (
            !title ||
            title.length > 150
        ) {
            return res.status(400).json({
                error:
                    "Invalid comic title."
            });
        }

        try {
            res.json({
                cover:
                    await getComicCover(
                        title
                    )
            });
        } catch (error) {
            apiError(
                res,
                error,
                "Comic cover"
            );
        }
    }
);

// ==========================================
// CHARACTER COMICS API
// ==========================================

app.get(
    "/api/characters/:id/recommendations",
    async (req, res) => {
        if (
            !validId(req.params.id)
        ) {
            return res.status(400).json({
                error:
                    "Invalid character ID."
            });
        }

        try {
            const character =
                await getCharacterDetails(
                    req.params.id
                );

            if (
                dcPublisher(character) === false
            ) {
                return res.status(404).json({
                    error:
                        "Not a DC character."
                });
            }

            const recommendations =
                await getReadingForCharacter(
                    req.params.id
                );

            res.json({
                character:
                    character.name,
                recommendations,
                source:
                    "Comic Vine character issue credits"
            });
        } catch (error) {
            apiError(
                res,
                error,
                "Character comics"
            );
        }
    }
);

// ==========================================
// CHARACTER PROFILE API
// ==========================================

app.get(
    "/api/characters/:id",
    async (req, res) => {
        if (
            !validId(req.params.id)
        ) {
            return res.status(400).json({
                error:
                    "Invalid character ID."
            });
        }

        try {
            const character =
                await getCharacterDetails(
                    req.params.id
                );

            if (
                dcPublisher(character) === false
            ) {
                return res.status(404).json({
                    error:
                        "Not a DC character."
                });
            }

            res.json({
                character
            });
        } catch (error) {
            apiError(
                res,
                error,
                "Character profile"
            );
        }
    }
);

// ==========================================
// IMAGE PROXY API
// ==========================================

app.get(
    "/api/image",
    async (req, res) => {
        const urls = imageCandidates(
            req.query.url
        );

        if (!urls.length) {
            return res.status(400).json({
                error:
                    "Image URL not allowed."
            });
        }

        for (const url of urls) {
            try {
                const {
                    data,
                    contentType
                } = await cacheResult(
                    `image:${url}`,
                    () => imageBytes(url),
                    12 * 60 * 60 * 1000
                );

                res.set({
                    "Content-Type":
                        contentType,
                    "Cache-Control":
                        "public, max-age=86400",
                    "X-Content-Type-Options":
                        "nosniff"
                });

                return res.end(data);
            } catch {
                // Try another image host.
            }
        }

        return res.status(502).json({
            error:
                "Remote image could not be reached."
        });
    }
);

// ==========================================
// FALLBACK POSTER API
// ==========================================

app.get(
    "/api/poster",
    (req, res) => {
        res.set(
            "Cache-Control",
            "public, max-age=86400"
        );

        res.type(
            "image/svg+xml"
        ).send(
            svgPoster(
                req.query.title,
                req.query.kind
            )
        );
    }
);

// ==========================================
// SERVE WEBSITE
// ==========================================

for (
    const directory of [
        "css",
        "js",
        "assets",
        "images",
        "assests"
    ]
) {
    app.use(
        `/${directory}`,
        express.static(
            path.join(
                ROOT,
                directory
            ),
            {
                dotfiles: "deny"
            }
        )
    );
}

for (
    const file of [
        "index.html",
        "start-here.html",
        "character.html",
        "saved.html"
    ]
) {
    app.get(
        `/${file}`,
        (req, res) => {
            res.sendFile(
                path.join(
                    ROOT,
                    file
                )
            );
        }
    );
}

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            ROOT,
            "index.html"
        )
    );
});

// ==========================================
// START SERVER
// ==========================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `The Detective Corps: http://localhost:${PORT}`
        );

        console.log(
            process.env.COMICVINE_API_KEY
                ? "Comic Vine API key configured."
                : "Comic Vine API key missing."
        );
    });
}

module.exports = {
    app,
    getCharacterDetails,
    getReadingForCharacter,
    FEATURED
};
