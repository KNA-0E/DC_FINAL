"use strict";

/* The Detective Corps — scroll-triggered terminal typewriter.
   Add-on only: does not replace existing site scripts. */
(() => {
    const SELECTOR = "h1, h2, h3, h4, p, li, blockquote, .eyebrow";
    const EXCLUDED = [
        ".site-header", ".navigation", "footer .navigation",
        ".character-card", ".saved-character-card", ".path-card",
        ".reading-recommendation", ".automatic-reading-card",
        ".search-result", ".search-results", "#search-results",
        ".featured-card-content", ".dc-john-art", ".dc-guy-art",
        ".loading-state", ".error-state", ".empty-state",
        "[aria-live]", "[contenteditable]", "[class*='card']",
        "button", "label", "input", "textarea", "select", "pre", "code"
    ].join(", ");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const prepared = new WeakSet();
    const active = new WeakSet();
    const pending = new Set();
    let scanScheduled = false;

    const observer = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                observer.unobserve(entry.target);
                animate(entry.target);
            }
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
        : null;

    function eligible(element) {
        if (prepared.has(element) || element.closest(EXCLUDED)) return false;
        if (element.hasAttribute("data-no-type")) return false;
        if (element.closest("[hidden], [aria-hidden='true']")) return false;
        if (element.querySelector(SELECTOR)) return false; // No nested duplicate animation.
        if (!element.textContent || !element.textContent.trim()) return false;
        if (element.closest("a")) return false;
        return true;
    }

    function prepare(element) {
        if (!eligible(element)) return;

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                const parent = node.parentElement;
                if (!parent || parent.closest("a, button, script, style, .terminal-letter")) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        if (!nodes.length) return;

        prepared.add(element);
        const letters = [];
        for (const node of nodes) {
            const fragment = document.createDocumentFragment();
            for (const character of Array.from(node.nodeValue)) {
                if (/\s/.test(character)) {
                    fragment.appendChild(document.createTextNode(character));
                } else {
                    const span = document.createElement("span");
                    span.className = "terminal-letter";
                    span.textContent = character;
                    fragment.appendChild(span);
                    letters.push(span);
                }
            }
            node.replaceWith(fragment);
        }
        if (!letters.length) return;
        pending.add(element);
        element._terminalLetters = letters;
        element.classList.add("terminal-typing-ready");
        if (observer) observer.observe(element);
        else animate(element);
    }

    function animate(element) {
        if (active.has(element) || !pending.has(element)) return;
        active.add(element);
        pending.delete(element);
        const letters = element._terminalLetters;
        if (!letters || !letters.length) return;

        const heading = /^H[1-4]$/.test(element.tagName);
        const speed = heading ? 54 : 82; // visible characters per second
        const startDelay = heading ? 100 : 160;
        let start = null;
        let shown = 0;
        let cursor = null;

        function frame(now) {
            if (!element.isConnected) return;
            if (start === null) start = now + startDelay;
            const target = Math.min(
                letters.length,
                Math.max(0, Math.floor((now - start) * speed / 1000))
            );

            while (shown < target) {
                if (cursor) cursor.classList.remove("terminal-cursor");
                cursor = letters[shown];
                cursor.classList.add("terminal-visible", "terminal-cursor");
                shown++;
            }

            if (shown < letters.length) {
                requestAnimationFrame(frame);
            } else {
                element.classList.add("terminal-typing-complete");
                if (cursor) {
                    setTimeout(() => cursor.classList.remove("terminal-cursor"), 650);
                }
                delete element._terminalLetters;
            }
        }
        requestAnimationFrame(frame);
    }

    function scan() {
        scanScheduled = false;
        document.querySelectorAll(SELECTOR).forEach(prepare);
    }

    function scheduleScan() {
        if (scanScheduled) return;
        scanScheduled = true;
        requestAnimationFrame(scan);
    }

    function start() {
        scan();
        // Case-file/API content can arrive after initial page load.
        const changes = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if ([...mutation.addedNodes].some(node =>
                    node.nodeType === 1 &&
                    !node.classList.contains("terminal-letter") &&
                    (node.matches?.(SELECTOR) || node.querySelector?.(SELECTOR))
                )) {
                    scheduleScan();
                    return;
                }
            }
        });
        changes.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
