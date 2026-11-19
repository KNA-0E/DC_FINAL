// The Detective Corps — personal artwork interactions.
// Add to index.html and start-here.html AFTER existing scripts.
(() => {
  'use strict';
  const init = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined';
    const hero = document.querySelector('main .hero') || document.querySelector('.hero');
    // Move the PNG out of the left text column. The slot is centred
    // across the entire hero and is safe from GSAP transforms on the image.
    if (hero) {
      const logo = hero.querySelector('.hero-logo');
      if (logo && !logo.closest('.dc-hero-logo-slot')) {
        const slot = document.createElement('div');
        slot.className = 'dc-hero-logo-slot';
        hero.insertBefore(slot, hero.firstChild);
        slot.appendChild(logo);
      }
    }
    if (hero && !document.querySelector('.dc-john-art')) {
      const content = hero.querySelector('.hero-content');
      const search = document.querySelector('.character-section');
      if (content && search) {
        const description = content.querySelector('.hero-description');
        if (description) description.insertAdjacentElement('afterend', search);
        else content.append(search);
        search.classList.add('dc-search-top');
      }
      const art = document.createElement('div');
      art.className = 'dc-john-art';
      art.innerHTML = `<div class="dc-john-halo" aria-hidden="true"></div><img src="assests/images/john-stewart-art.png" alt="Original John Stewart illustration" class="dc-john-img"><div class="dc-john-caption">BY KOENA MATHIBELI <span>Aaron Pierre // LANTERNS(2026)</span></div>`;
      hero.append(art);
      if (hasGSAP && !reduce) {
        gsap.fromTo(art, {autoAlpha:0,y:70,rotate:-4}, {autoAlpha:1,y:0,rotate:0,duration:1.1,ease:'power3.out',delay:.15});
        gsap.to(art.querySelector('.dc-john-halo'), {scale:1.13,opacity:.9,repeat:-1,yoyo:true,duration:2.4,ease:'sine.inOut'});
      }
      if (!reduce) {
        art.addEventListener('pointermove', e => {
          if (e.pointerType === 'touch') return;
          const r=art.getBoundingClientRect();
          const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
          if(hasGSAP) gsap.to(art.querySelector('.dc-john-img'),{x:x*17,y:y*12,rotate:y*2,duration:.45,overwrite:true});
          else art.querySelector('.dc-john-img').style.transform=`translate(${x*17}px,${y*12}px)`;
        });
        art.addEventListener('pointerleave',()=>{
          if(hasGSAP) gsap.to(art.querySelector('.dc-john-img'),{x:0,y:0,rotate:0,duration:.5,overwrite:true});
          else art.querySelector('.dc-john-img').style.transform='';
        });
      }
    }
    const startHero = document.querySelector('.start-hero');
    if (startHero && !document.querySelector('.dc-guy-art')) {
      const art = document.createElement('div');
      art.className = 'dc-guy-art';
      art.innerHTML = `<div class="dc-guy-burst" aria-hidden="true"></div><img src="assests/images/guy-gardner-art.png" alt="Original Guy Gardner comic illustration with speech bubble: Yes, Mr. Guardian, sir!" class="dc-guy-img"><div class="dc-guy-tag">GUY GARDNER <span>UNSOLICITED ADVICE DEPARTMENT</span></div>`;
      startHero.append(art);
      if (hasGSAP && !reduce) {
        gsap.fromTo(art,{autoAlpha:0,x:90,rotate:8,scale:.85},{autoAlpha:1,x:0,rotate:0,scale:1,duration:1,ease:'back.out(1.4)',delay:.2});
      }
      art.addEventListener('pointerenter',()=>{
        if(hasGSAP && !reduce) gsap.fromTo(art.querySelector('.dc-guy-img'),{rotate:-2},{rotate:2,repeat:3,yoyo:true,duration:.095,ease:'power1.inOut'});
        art.classList.add('dc-guy-active');
      });
      art.addEventListener('pointerleave',()=>art.classList.remove('dc-guy-active'));
    }
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
