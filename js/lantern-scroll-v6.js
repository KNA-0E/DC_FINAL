/* THE DETECTIVE CORPS — Lantern scroll decorations V6
   CSS controls all positioning, size, entrance and float effects.
   JS only adds artwork and updates scroll-distance transparency.
   Start Here: Koena upper LEFT, Kagiso lower RIGHT.
   Saved: Thato upper RIGHT, Tshiamo lower LEFT.
*/
(() => {
    'use strict';

    const page = window.location.pathname.split('/').pop().toLowerCase();
    const pages = {
        'start-here.html': [
            { name: 'Koena', file: 'koena_GL.png', position: 'top-left' },
            { name: 'Kagiso', file: 'kagiso_GL.png', position: 'bottom-right' }
        ],
        'saved.html': [
            { name: 'Thato', file: 'thato_GL.png', position: 'top-right' },
            { name: 'Tshiamo', file: 'tshiamo_GL.png', position: 'bottom-left' }
        ]
    };

    const characters = pages[page];
    if (!characters) return;

    function init() {
        const main = document.querySelector('main.subpage-main');
        if (!main) {
            console.error('[DC Lantern V6] Missing main.subpage-main');
            return;
        }

        // Clean up artwork from V1–V5 if any older script has already run.
        document.querySelectorAll(
            '.dc-scroll-art, .dc-scroll-art-v3, .dc-scroll-art-v4, .dc-lantern-v5, .dc-lantern-decor'
        ).forEach(element => element.remove());
        ['dc-scroll-art-v3-styles', 'dc-scroll-art-v4-styles', 'dc-lantern-v5-styles']
            .forEach(id => document.getElementById(id)?.remove());

        document.body.classList.remove(
            'dc-has-scroll-art', 'dc-page-start', 'dc-page-saved',
            'dc-v3-start', 'dc-v3-saved', 'dc-figure-page',
            'dc-art-v4-page', 'dc-art-v4-saved', 'dc-lantern-v5-page'
        );
        document.body.classList.add('dc-lantern-v6-page');
        document.body.classList.add(page === 'saved.html' ? 'dc-lantern-v6-saved' : 'dc-lantern-v6-start');

        const figures = characters.map(character => {
            const figure = document.createElement('figure');
            figure.className = 'dc-lantern-decor';
            figure.dataset.character = character.name.toLowerCase();
            figure.dataset.position = character.position;
            figure.setAttribute('aria-hidden', 'true');

            const inner = document.createElement('span');
            inner.className = 'dc-lantern-decor__float';

            const img = document.createElement('img');
            img.className = 'dc-lantern-decor__image';
            img.src = `assests/images/${character.file}`;
            img.alt = '';
            img.loading = character.position.startsWith('top') ? 'eager' : 'lazy';
            img.decoding = 'async';
            img.addEventListener('error', () => {
                console.error(`[DC Lantern V6] Image not found: ${img.src}`);
            });

            inner.appendChild(img);
            figure.appendChild(inner);
            main.appendChild(figure);
            return figure;
        });

        // Keep animation optional for reduced-motion visitors.
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !('IntersectionObserver' in window)) {
            figures.forEach(figure => figure.classList.add('is-visible'));
        } else {
            const observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            }, { threshold: 0.01, rootMargin: '0px 0px -3% 0px' });
            figures.forEach(figure => observer.observe(figure));
        }

        // Fade the art according to its distance from the center of the viewport.
        // CSS owns the actual opacity, so this never fights the entrance transition.
        let queued = false;
        function updateDistanceOpacity() {
            queued = false;
            const center = window.innerHeight / 2;
            const range = Math.max(window.innerHeight * 1.05, 450);
            const maximum = window.innerWidth <= 600 ? 0.66 : 0.91;
            figures.forEach(figure => {
                const rect = figure.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - center);
                const proximity = Math.max(0, 1 - distance / range);
                const eased = proximity * proximity * (3 - 2 * proximity);
                const opacity = 0.055 + (maximum - 0.055) * eased;
                figure.style.setProperty('--dc-lantern-proximity', opacity.toFixed(3));
            });
        }
        function scheduleUpdate() {
            if (queued) return;
            queued = true;
            window.requestAnimationFrame(updateDistanceOpacity);
        }
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        figures.forEach(figure => {
            figure.querySelector('img').addEventListener('load', scheduleUpdate);
        });
        scheduleUpdate();

        // This warning makes a missing CSS link easy to diagnose.
        window.requestAnimationFrame(() => {
            if (getComputedStyle(figures[0]).position !== 'absolute') {
                console.error('[DC Lantern V6] lantern-scroll-v6.css is NOT loading. Check the CSS link in <head>.');
            }
        });

        console.log('[DC Lantern V6] CSS version active:',
            characters.map(c => `${c.name} ${c.position}`).join(' | '));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
