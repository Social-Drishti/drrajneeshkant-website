/* ================================================================
   ANIMATIONS.JS — GSAP Scroll Reveals, Text Splits, Counters
   ================================================================ */

/* --- Hero Entrance --- */
function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    document.querySelectorAll('.hero .eyebrow, .hero h1, .hero p.lead, .hero-ctas, .trust-row').forEach(function(el) {
      el.style.opacity = '1';
    });
    return;
  }

  splitHeadingIntoWords('.hero h1');

  gsap.set('.hero .eyebrow', { opacity: 0, y: 20 });
  gsap.set('.hero h1 .word-inner', { yPercent: 110 });
  gsap.set('.hero h1 .word', { opacity: 0 });
  gsap.set('.hero p.lead', { opacity: 0, y: 20 });
  gsap.set('.hero-ctas', { opacity: 0, y: 20 });
  gsap.set('.trust-row .trust-item', { opacity: 0, y: 15 });

  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.1)
    .to('.hero h1 .word', { opacity: 1, duration: 0.001, stagger: { each: 0.06, from: 'start' } }, 0.2)
    .to('.hero h1 .word-inner', { yPercent: 0, duration: 0.7, stagger: { each: 0.06, from: 'start' } }, 0.2)
    .to('.hero p.lead', { opacity: 1, y: 0, duration: 0.6 }, 0.55)
    .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.6 }, 0.7)
    .to('.trust-row .trust-item', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0.85);

  // Hero background parallax
  gsap.to('.hero', {
    backgroundPositionY: '60%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

/* --- Text Reveal Utilities --- */
function splitHeadingIntoWords(selector) {
  var el = document.querySelector(selector);
  if (!el || el.dataset.split === 'true') return;
  el.dataset.split = 'true';

  var html = el.innerHTML;
  var lines = html.split(/<br\s*\/?>/i);
  var result = '';

  for (var i = 0; i < lines.length; i++) {
    var words = lines[i].trim().split(/\s+/);
    for (var j = 0; j < words.length; j++) {
      var word = words[j];
      if (!word) continue;
      result += '<span class="word"><span class="word-inner">' + word + '</span></span> ';
    }
    if (i < lines.length - 1) result += '<br>';
  }

  el.innerHTML = result;
}

function setupSectionTextReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  var selectors = ['.section-head h2', '.about-hero-content h1', '.page-banner h1'];
  selectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(heading) {
      if (heading.dataset.split === 'true') return;

      var html = heading.innerHTML;
      var lines = html.split(/<br\s*\/?>/i);
      var result = '';
      for (var i = 0; i < lines.length; i++) {
        var words = lines[i].trim().split(/\s+/);
        for (var j = 0; j < words.length; j++) {
          var word = words[j];
          if (!word) continue;
          result += '<span class="word"><span class="word-inner">' + word + '</span></span> ';
        }
        if (i < lines.length - 1) result += '<br>';
      }
      heading.innerHTML = result;
      heading.dataset.split = 'true';

      gsap.set(heading.querySelectorAll('.word-inner'), { yPercent: 110 });
      gsap.set(heading.querySelectorAll('.word'), { opacity: 0 });

      gsap.to(heading.querySelectorAll('.word'), {
        opacity: 1, duration: 0.001,
        stagger: { each: 0.04, from: 'start' },
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true }
      });

      gsap.to(heading.querySelectorAll('.word-inner'), {
        yPercent: 0, duration: 0.6, ease: 'power3.out',
        stagger: { each: 0.04, from: 'start' },
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true }
      });
    });
  });
}

/* ================================================================
   SCROLL REVEAL ANIMATIONS
   ================================================================ */
(function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Generic section reveal: fade-up
  var revealEls = document.querySelectorAll('.reveal-up');
  if (revealEls.length) {
    gsap.set(revealEls, { opacity: 0, y: 40 });
    gsap.to(revealEls, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: { trigger: revealEls[0], start: 'top 82%', once: true }
    });
  }

  // Card grid stagger
  var cardGrids = document.querySelectorAll('[data-animate="stagger"]');
  cardGrids.forEach(function(grid) {
    var cards = grid.children;
    if (!cards.length) return;
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.97 });
    gsap.to(cards, {
      opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: grid, start: 'top 82%', once: true }
    });
  });

  // Stat counters
  var statNums = document.querySelectorAll('[data-count]');
  statNums.forEach(function(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    gsap.from(el, {
      textContent: 0,
      duration: 2,
      ease: 'power1.out',
      snap: { textContent: 1 },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: function() {
        el.textContent = Math.round(parseFloat(el.textContent)).toLocaleString() + suffix;
      }
    });
  });

  // About section parallax
  var aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    var aboutBg = aboutSection.querySelector('.about-bg');
    if (aboutBg) {
      gsap.fromTo(aboutBg,
        { backgroundPositionY: '30%' },
        {
          backgroundPositionY: '60%', ease: 'none',
          scrollTrigger: { trigger: aboutSection, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        }
      );
    }
  }

  // Process timeline steps
  var processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length) {
    gsap.set(processSteps, { opacity: 0, y: 30 });
    gsap.to(processSteps, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: processSteps[0].parentElement, start: 'top 80%', once: true }
    });
  }

  // Footer columns
  var footerCols = document.querySelectorAll('.footer-col, .footer-brand');
  if (footerCols.length) {
    gsap.set(footerCols, { opacity: 0, y: 20 });
    gsap.to(footerCols, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.footer-top', start: 'top 90%', once: true }
    });
  }

  // Section text reveals
  setupSectionTextReveals();
})();
