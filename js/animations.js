
// ==========================================
// THE DETECTIVE CORPS - SITE ANIMATIONS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (typeof gsap === "undefined") return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

    if (hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }


    // ======================================
    // HERO ANIMATIONS
    // ======================================

    document.querySelectorAll(".page-hero").forEach(hero => {

        if (hero.classList.contains("start-hero")) return;

        const items = hero.querySelectorAll(
            ".eyebrow, h1, .hero-description"
        );

        if (items.length) {
            gsap.from(items, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out"
            });
        }

    });


    // ======================================
    // HOMEPAGE HERO
    // ======================================

    const homepageHero = document.querySelector(".hero");

    if (homepageHero) {
        gsap.from(homepageHero.children, {
            opacity: 0,
            y: 30,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out"
        });
    }


    // ======================================
    // START HERE HERO
    // ======================================

    const startHero = document.querySelector(".start-hero");

    if (startHero) {

        const items = startHero.querySelectorAll(
            ".eyebrow, h1, .hero-description"
        );

        gsap.from(items, {
            opacity: 0,
            y: 40,
            filter: "blur(8px)",
            duration: 1,
            stagger: 0.15,
            ease: "power3.out"
        });

    }


    // ======================================
    // START HERE PATH CARDS
    // ======================================

    const pathCards = document.querySelectorAll(".path-card");

    if (pathCards.length && hasScrollTrigger) {

        pathCards.forEach(card => {

            gsap.fromTo(card, {
                opacity: 0.25,
                y: 45,
                scale: 0.97
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                ease: "none",

                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    end: "top 55%",
                    scrub: 0.6
                }
            });

        });

    }


    // ======================================
    // STATIC SECTION REVEALS
    // ======================================

    const sections = document.querySelectorAll(
        ".beginner-note, .founder-note, .paths-heading, .page-section"
    );

    sections.forEach(section => {

        if (hasScrollTrigger) {

            gsap.from(section, {
                opacity: 0,
                y: 35,
                duration: 0.8,
                ease: "power3.out",

                scrollTrigger: {
                    trigger: section,
                    start: "top 88%",
                    toggleActions: "play none none reverse"
                }
            });

        }

    });


    // ======================================
    // CASE FILE HEADER
    // ======================================

    const caseHeader = document.querySelector(
        ".case-file-header, .generated-case-header"
    );

    if (caseHeader) {

        gsap.from(caseHeader, {
            opacity: 0,
            y: 35,
            duration: 0.9,
            ease: "power3.out"
        });

    }


    // ======================================
    // CASE FILE CONTENT SECTIONS
    // ======================================

    const caseSections = document.querySelectorAll(
        ".generated-case-section"
    );

    caseSections.forEach(section => {

        if (hasScrollTrigger) {

            gsap.from(section, {
                opacity: 0,
                y: 30,
                duration: 0.7,
                ease: "power2.out",

                scrollTrigger: {
                    trigger: section,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });

        }

    });


    // ======================================
    // IMPORTANT:
    // NO GSAP ANIMATIONS ON:
    // - #search-results
    // - #saved-character-grid
    // - .saved-character-card
    //
    // These are dynamic elements and must
    // remain visible at all times.
    // ======================================

    if (hasScrollTrigger) {
        ScrollTrigger.refresh();
    }

});
