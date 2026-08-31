/* ================================================================
   Dr Rajneesh Kant — Animation & Interaction System
   ================================================================
   Libraries: Lenis (smooth scroll), GSAP 3, ScrollTrigger
   ================================================================ */

/* ---- Global scroll position helper ---- */
function scrollY() {
  return window.pageYOffset || document.documentElement.scrollTop || 0;
}

/* ================================================================
   1. LENIS SMOOTH SCROLLING
   ================================================================ */
var lenisInstance = null;

(function() {
  if (typeof Lenis === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  var lenis = new Lenis({
    duration: 1.15,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });

  lenisInstance = lenis;

  // Connect Lenis scroll to GSAP ScrollTrigger
  lenis.on('scroll', function() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.update();
    }
  });

  // RAF loop for Lenis
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* ================================================================
   2. PRELOADER
   ================================================================ */
(function() {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  function hidePreloader() {
    preloader.classList.add('is-hidden');
    // Trigger hero animations after preloader fades
    setTimeout(function() {
      document.body.classList.add('is-loaded');
      initHeroAnimations();
    }, 400);
  }

  // Wait for fonts and a minimum display time
  var minTime = 900;
  var startTime = Date.now();

  function checkReady() {
    var elapsed = Date.now() - startTime;
    if (elapsed >= minTime) {
      hidePreloader();
    } else {
      setTimeout(hidePreloader, minTime - elapsed);
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(checkReady);
  } else {
    window.addEventListener('load', checkReady);
  }
})();

/* ================================================================
   3. HERO ENTRANCE ANIMATIONS
   ================================================================ */
function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    // Just show everything immediately
    document.querySelectorAll('.hero .eyebrow, .hero h1, .hero p.lead, .hero-ctas, .trust-row').forEach(function(el) {
      el.style.opacity = '1';
    });
    return;
  }

  // Split hero heading into words for line-by-line reveal
  splitHeadingIntoWords('.hero h1');

  // Set initial states
  gsap.set('.hero .eyebrow', { opacity: 0, y: 20 });
  gsap.set('.hero h1 .word-inner', { yPercent: 110 });
  gsap.set('.hero h1 .word', { opacity: 0 });
  gsap.set('.hero p.lead', { opacity: 0, y: 20 });
  gsap.set('.hero-ctas', { opacity: 0, y: 20 });
  gsap.set('.trust-row .trust-item', { opacity: 0, y: 15 });

  // Build timeline
  var heroTl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  heroTl
    .to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.1)
    .to('.hero h1 .word', {
      opacity: 1,
      duration: 0.001,
      stagger: { each: 0.06, from: 'start' }
    }, 0.2)
    .to('.hero h1 .word-inner', {
      yPercent: 0,
      duration: 0.7,
      stagger: { each: 0.06, from: 'start' }
    }, 0.2)
    .to('.hero p.lead', { opacity: 1, y: 0, duration: 0.6 }, 0.55)
    .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.6 }, 0.7)
    .to('.trust-row .trust-item', {
      opacity: 1, y: 0, duration: 0.5,
      stagger: 0.1
    }, 0.85);

  // Hero background parallax on scroll
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

/* ================================================================
   4. TEXT REVEAL UTILITIES
   ================================================================ */

// Split a heading element into individual word spans
function splitHeadingIntoWords(selector) {
  var el = document.querySelector(selector);
  if (!el || el.dataset.split === 'true') return;
  el.dataset.split = 'true';

  var html = el.innerHTML;
  // Preserve <br> tags as separate line breaks
  var lines = html.split(/<br\s*\/?>/i);
  var result = '';

  for (var i = 0; i < lines.length; i++) {
    var words = lines[i].trim().split(/\s+/);
    for (var j = 0; j < words.length; j++) {
      var word = words[j];
      if (!word) continue;
      result += '<span class="word"><span class="word-inner">' + word + '</span></span> ';
    }
    if (i < lines.length - 1) {
      result += '<br>';
    }
  }

  el.innerHTML = result;
}

// Animate section headings with word-by-word reveal
function setupSectionTextReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  var headings = document.querySelectorAll('.section-head h2, .about-copy h2, .download h2');
  headings.forEach(function(heading) {
    if (heading.dataset.split === 'true') return;

    // Split heading into word spans
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
      if (i < lines.length - 1) {
        result += '<br>';
      }
    }
    heading.innerHTML = result;
    heading.dataset.split = 'true';

    // Set initial state
    gsap.set(heading.querySelectorAll('.word-inner'), { yPercent: 110 });
    gsap.set(heading.querySelectorAll('.word'), { opacity: 0 });

    // Animate on scroll
    gsap.to(heading.querySelectorAll('.word'), {
      opacity: 1,
      duration: 0.001,
      stagger: { each: 0.04, from: 'start' },
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        once: true
      }
    });

    gsap.to(heading.querySelectorAll('.word-inner'), {
      yPercent: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: { each: 0.04, from: 'start' },
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        once: true
      }
    });
  });
}

/* ================================================================
   5. NAVIGATION SCROLL STATE
   ================================================================ */
(function() {
  var header = document.getElementById('siteHeader');
  if (!header) return;

  var scrollThreshold = 80;
  var ticking = false;

  function updateNav() {
    var y = scrollY();
    if (y > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Also listen to Lenis scroll events for reliable detection
  if (typeof lenisInstance !== 'undefined' && lenisInstance) {
    lenisInstance.on('scroll', onScroll);
  }

  // Initial check
  updateNav();
})();

/* ================================================================
   6. SECTION REVEAL ANIMATIONS (ScrollTrigger)
   ================================================================ */
(function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // About copy slide in
  var aboutCopy = document.querySelector('.about-copy');
  if (aboutCopy) {
    gsap.set(aboutCopy, { opacity: 0, y: 40 });
    gsap.to(aboutCopy, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: aboutCopy, start: 'top 82%', once: true }
    });
  }

  // About section parallax on background
  var aboutSection = document.querySelector('.about');
  if (aboutSection) {
    gsap.fromTo(aboutSection,
      { backgroundPositionY: '30%' },
      {
        backgroundPositionY: '60%',
        ease: 'none',
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      }
    );
  }

  // Download section — text slides from left
  var downloadCopy = document.querySelector('.download-copy');
  if (downloadCopy) {
    gsap.set(downloadCopy, { opacity: 0, x: -40 });
    gsap.to(downloadCopy, {
      opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: downloadCopy, start: 'top 82%', once: true }
    });
  }

  // Download section — phone rises from below
  var phoneTarget = document.querySelector('.phone-mockup');
  if (phoneTarget) {
    gsap.set(phoneTarget, { opacity: 0, y: 60, scale: 0.94 });
    gsap.to(phoneTarget, {
      opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: phoneTarget, start: 'top 88%', once: true }
    });
  }

  // Download feature list items stagger
  var featureItems = document.querySelectorAll('.feature-list li');
  if (featureItems.length) {
    gsap.set(featureItems, { opacity: 0, x: -20 });
    gsap.to(featureItems, {
      opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.feature-list', start: 'top 85%', once: true }
    });
  }

  // Products — section head reveal
  var productsHead = document.querySelector('.products .section-head');
  if (productsHead) {
    gsap.set(productsHead, { opacity: 0, y: 30 });
    gsap.to(productsHead, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: productsHead, start: 'top 85%', once: true }
    });
  }

  // Products — cards stagger
  var productCards = document.querySelectorAll('.product-card');
  if (productCards.length) {
    gsap.set(productCards, { opacity: 0, y: 40, scale: 0.97 });
    gsap.to(productCards, {
      opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: '.product-grid', start: 'top 82%', once: true }
    });
  }

  // Footer columns stagger
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

/* ================================================================
   9. SPINE STORYTELLING ENGINE (Original — Enhanced with Lenis)
   ================================================================ */
var spineRegions = { cervical:[], thoracic:[], lumbar:[], sacrum:[] };
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var path = document.getElementById('spine-path');
  var group = document.getElementById('vertebra-group');
  if (!path || !group) return;
  var len = path.getTotalLength();
  var count = 26;
  for(var i=0;i<count;i++){
    var t = (i+0.5)/count;
    var p = path.getPointAtLength(t*len);
    var p2 = path.getPointAtLength(Math.min(len,(t*len)+2));
    var angle = Math.atan2(p2.y-p.y, p2.x-p.x) * 180/Math.PI + 90;
    var region = i<7 ? 'cervical' : i<19 ? 'thoracic' : i<24 ? 'lumbar' : 'sacrum';
    var pos = document.createElementNS(NS,'g');
    pos.setAttribute('class','vertebra-pos');
    pos.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+angle+')');
    var rect = document.createElementNS(NS,'rect');
    rect.setAttribute('class','vertebra');
    rect.setAttribute('data-region', region);
    rect.setAttribute('x','-9');
    rect.setAttribute('y','-3.5');
    rect.setAttribute('width','18');
    rect.setAttribute('height','7');
    rect.setAttribute('rx','1.5');
    rect.setAttribute('fill', i % 2 === 0 ? '#ede9e0' : '#c1502e');
    rect.setAttribute('opacity', i % 2 === 0 ? '0.9' : '0.85');
    rect.style.transitionDelay = (t*0.9)+'s';
    pos.appendChild(rect);
    group.appendChild(pos);
    spineRegions[region].push(rect);
  }
})();

// Scroll-driven spine storytelling engine
(function(){
  var section = document.querySelector('.xray');
  var story = document.querySelector('.spine-story');
  var stickyBox = document.querySelector('.spine-stage-sticky');
  var svg = document.getElementById('spine-svg');
  if(!section || !story || !stickyBox || !svg) return;

  var STAGES = [
    { region:'cervical', callout:'callout-1', connector:'connector-1', label:'CERVICAL · C1–C7' },
    { region:'thoracic', callout:'callout-2', connector:'connector-2', label:'THORACIC · T1–T12' },
    { region:'lumbar',   callout:'callout-3', connector:'connector-3', label:'LUMBAR · L1–L5' },
    { region:'sacrum',   callout:'callout-4', connector:'connector-4', label:'SACRUM & PELVIS' }
  ];
  var DRIFT = [-24,-8,10,26];
  var ZOOM  = [0.985,1,1.015,1.03];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clamp = function(v,a,b){return Math.max(a,Math.min(b,v));};
  var lerp = function(a,b,t){return a+(b-a)*t;};
  var smooth = function(t){return t*t*(3-2*t);};

  var callouts = STAGES.map(function(s){return document.getElementById(s.callout);});
  var paths = STAGES.map(function(s){return document.getElementById(s.connector);});
  var numEl = document.getElementById('progressNum');
  var fillEl = document.getElementById('progressFill');
  var labelEl = document.getElementById('progressRegion');

  var m = { top:0, travel:1 };
  var stage = -1, near = false;
  var curDrift = DRIFT[0], curZoom = ZOOM[0], lastP = -1, labelTimer = null;

  function getScrollPos() {
    // Use Lenis scroll position if available, otherwise native
    return (typeof lenisInstance !== 'undefined' && lenisInstance)
      ? lenisInstance.scroll
      : scrollY();
  }

  function measure(){
    var vh = window.innerHeight || 1;
    var r = story.getBoundingClientRect();
    m.top = r.top + getScrollPos();
    m.travel = Math.max(1, r.height - vh);
    layoutConnectors();
  }

  function origin(){
    var b = stickyBox.getBoundingClientRect();
    return { left:b.left, top:b.top };
  }

  function anchorPoint(regionName){
    var list = spineRegions[regionName];
    if(!list || !list.length) return { x:120, y:400 };
    var o = origin();
    var x=0, y=0;
    list.forEach(function(rc){
      var r = rc.getBoundingClientRect();
      x += r.left + r.width/2 - o.left;
      y += r.top + r.height/2 - o.top;
    });
    return { x:x/list.length, y:y/list.length };
  }

  function layoutConnectors(){
    if(!paths[0] || getComputedStyle(paths[0]).display === 'none') return;
    var o = origin();
    STAGES.forEach(function(s,i){
      var card = callouts[i], pathEl = paths[i];
      if(!card || !pathEl) return;
      var cr = card.getBoundingClientRect();
      var a = anchorPoint(s.region);
      var cx = (cr.left + cr.right)/2 - o.left;
      var dir = cx < a.x ? -1 : 1;
      var sx = a.x + dir*18;
      var ex = dir === 1 ? cr.left - o.left - 12 : cr.right - o.left + 12;
      var ey = cr.top - o.top + cr.height*0.45;
      var mx = sx + (ex-sx)*0.55;
      pathEl.setAttribute('d',
        'M'+sx.toFixed(1)+' '+a.y.toFixed(1)+
        ' H'+mx.toFixed(1)+
        ' V'+ey.toFixed(1)+
        ' H'+ex.toFixed(1));
      try{
        var L = pathEl.getTotalLength();
        pathEl.style.setProperty('--clen', String(Math.ceil(L+2)));
      }catch(e){}
    });
  }

  function applyStage(i){
    stage = i;
    var cfg = STAGES[i];
    callouts.forEach(function(c,k){
      if(!c) return;
      c.classList.toggle('active', k===i);
      c.classList.toggle('inactive', k!==i);
    });
    Object.keys(spineRegions).forEach(function(name){
      var on = name === cfg.region;
      spineRegions[name].forEach(function(r){
        r.classList.toggle('is-active', on);
        r.classList.toggle('is-dim', !on);
      });
    });
    paths.forEach(function(p,k){ if(p) p.classList.toggle('active', k===i); });
    if(numEl) numEl.textContent = ('0'+(i+1)).slice(-2);
    if(labelEl){
      clearTimeout(labelTimer);
      labelEl.style.opacity = '0';
      labelTimer = setTimeout(function(){
        labelEl.textContent = cfg.label;
        labelEl.style.opacity = '';
      },180);
    }
    section.dataset.stage = String(i);
  }

  function frame(){
    if(near && !document.hidden){
      var y = getScrollPos();
      var p = clamp((y-m.top)/m.travel, 0, 1);
      var idx = clamp(Math.round(p*3), 0, 3);
      if(idx !== stage) applyStage(idx);
      if(!reduced.matches){
        var sf = p*3;
        var seg = Math.min(Math.floor(sf), 2);
        var t = smooth(clamp(sf-seg, 0, 1));
        var tgtD = lerp(DRIFT[seg], DRIFT[seg+1], t);
        var tgtZ = lerp(ZOOM[seg], ZOOM[seg+1], t);
        curDrift += (tgtD-curDrift)*0.14;
        curZoom += (tgtZ-curZoom)*0.14;
        if(Math.abs(curDrift-tgtD) < 0.02) curDrift = tgtD;
        if(Math.abs(curZoom-tgtZ) < 0.0002) curZoom = tgtZ;
        svg.style.transform = 'translateY('+curDrift.toFixed(2)+'px) scale('+curZoom.toFixed(4)+')';
        if(Math.abs(p-lastP) > 0.0015){
          if(fillEl) fillEl.style.transform = 'scaleX('+p.toFixed(4)+')';
          lastP = p;
        }
      }
    }
    requestAnimationFrame(frame);
  }

  var rzT;
  window.addEventListener('resize', function(){
    clearTimeout(rzT);
    rzT = setTimeout(measure, 140);
  });
  window.addEventListener('load', measure);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // Intro reveal: path draw + vertebra fade when the story approaches
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      near = entry.isIntersecting;
      if(entry.isIntersecting){
        section.classList.add('in-view');
        setTimeout(function(){
          document.querySelectorAll('#vertebra-group .vertebra').forEach(function(v){
            v.style.transitionDelay = '';
          });
        }, 2000);
      }
    });
  }, { rootMargin:'20% 0px 20% 0px' });
  io.observe(story);

  if(reduced.addEventListener){
    reduced.addEventListener('change', function(){
      if(reduced.matches) svg.style.transform = '';
    });
  }

  measure();
  applyStage(clamp(Math.round(clamp((getScrollPos()-m.top)/m.travel,0,1)*3),0,3));
  requestAnimationFrame(frame);
})();

/* ================================================================
   10. MENU DRAWER TOGGLE (GSAP)
   ================================================================ */
(function(){
  var burger = document.getElementById('menuToggle');
  var drawer = document.getElementById('siteMenu');
  var overlay = document.getElementById('drawerOverlay');
  var closeBtn = document.getElementById('drawerClose');
  var drawerLinks = drawer ? drawer.querySelectorAll('.drawer-link, .drawer-book') : [];
  if (!burger || !drawer || !overlay || !closeBtn) return;

  // Reduced motion check
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // GSAP timeline for drawer animation
  var drawerTl = null;
  var focusTrapEnabled = false;
  var lastFocusedElement = null;

  function initDrawerAnimation() {
    if (typeof gsap === 'undefined') return;
    
    // Set initial states for stagger animation
    gsap.set(drawerLinks, { opacity: 0, x: 30 });
    gsap.set('.drawer-book', { opacity: 0, y: 20 });
    gsap.set(closeBtn, { opacity: 0, scale: 0.8 });

    drawerTl = gsap.timeline({ paused: true, reversed: true });

    drawerTl
      .to(overlay, { opacity: 1, visibility: 'visible', duration: 0.4, ease: 'power2.out' }, 0)
      .to(drawer, { x: 0, duration: 0.6, ease: 'expo.out' }, 0.05)
      .to(closeBtn, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }, 0.15)
      .to(drawerLinks, { 
        opacity: 1, 
        x: 0, 
        duration: 0.5, 
        ease: 'power2.out', 
        stagger: 0.06 
      }, 0.2)
      .to('.drawer-book', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.35);
  }

  // Focus trap implementation
  function trapFocus(element) {
    var focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements.length) return;

    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    element.addEventListener('keydown', handleTab);
    element._focusTrapHandler = handleTab;
    
    // Focus first element
    setTimeout(function() {
      firstElement.focus();
    }, 100);
  }

  function releaseFocusTrap(element) {
    if (element._focusTrapHandler) {
      element.removeEventListener('keydown', element._focusTrapHandler);
      element._focusTrapHandler = null;
    }
  }

  function setMenu(open) {
    if (open) {
      // Store last focused element
      lastFocusedElement = document.activeElement;
      
      // Add open class for CSS fallback (reduced motion)
      drawer.classList.add('open');
      overlay.classList.add('open');
      burger.classList.add('open');
      
      // Play GSAP animation
      if (drawerTl && !reduced.matches) {
        drawerTl.play();
      } else if (reduced.matches) {
        // Immediate show for reduced motion
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        drawer.style.transform = 'translateX(0)';
        drawerLinks.forEach(function(link) { link.style.opacity = '1'; link.style.transform = 'none'; });
        closeBtn.style.opacity = '1'; closeBtn.style.transform = 'none';
      }
      
      // Body scroll lock
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';
      
      // Pause Lenis
      if (typeof lenisInstance !== 'undefined' && lenisInstance) {
        lenisInstance.stop();
      }

      // Focus trap
      trapFocus(drawer);
      focusTrapEnabled = true;
    } else {
      // Reverse GSAP animation
      if (drawerTl && !reduced.matches) {
        drawerTl.reverse();
      } else if (reduced.matches) {
        // Immediate hide for reduced motion
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        drawer.style.transform = 'translateX(100%)';
      }
      
      // Remove open class after animation (for CSS fallback)
      setTimeout(function() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        burger.classList.remove('open');
      }, reduced.matches ? 0 : 600);
      
      // Body scroll unlock
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Resume Lenis
      if (typeof lenisInstance !== 'undefined' && lenisInstance) {
        lenisInstance.start();
      }

      // Release focus trap
      releaseFocusTrap(drawer);
      focusTrapEnabled = false;
      
      // Return focus to burger
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      } else {
        burger.focus();
      }
    }

    // Update ARIA
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('aria-hidden', String(!open));
  }

  // Initialize GSAP animation
  initDrawerAnimation();

  burger.addEventListener('click', function(){
    var isOpen = drawer.classList.contains('open');
    setMenu(!isOpen);
  });
  
  overlay.addEventListener('click', function(){ setMenu(false); });
  closeBtn.addEventListener('click', function(){ setMenu(false); });
  
  drawerLinks.forEach(function(link){
    link.addEventListener('click', function(){ setMenu(false); });
  });
  
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && drawer.classList.contains('open')) {
      setMenu(false);
    }
  });

  // Handle resize - close drawer on desktop resize if needed
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1200 && drawer.classList.contains('open')) {
      // Keep open on desktop, but could close if desired
    }
  });
})();

/* ================================================================
   11. APP SCREENSHOT CAROUSEL (Track-based)
   ================================================================ */
(function(){
  var slider = document.getElementById('appSlider');
  var track  = document.getElementById('appTrack');
  var dots   = document.getElementById('sliderDots');
  var prevBtn = document.getElementById('slidePrev');
  var nextBtn = document.getElementById('slideNext');
  if(!slider || !track || !dots || !prevBtn || !nextBtn) return;

  var slides = track.querySelectorAll('.app-slide');
  var dotBtns = dots.querySelectorAll('.slider-dot');
  var count  = slides.length;
  if(count < 2) return;

  var current = 0;
  var autoplayTimer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function goTo(index){
    if(index < 0) index = count - 1;
    if(index >= count) index = 0;
    if(index === current) return;

    track.classList.remove('no-transition');
    track.style.transform = 'translateX(' + (-index * 100) + '%)';

    slides[current].setAttribute('aria-hidden', 'true');
    slides[index].setAttribute('aria-hidden', 'false');

    dotBtns.forEach(function(d, i){
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    current = index;
    resetAutoplay();
  }

  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  function startAutoplay(){
    if(reduced.matches) return;
    stopAutoplay();
    autoplayTimer = setTimeout(function tick(){
      next();
      autoplayTimer = setTimeout(tick, 5000);
    }, 5000);
  }

  function stopAutoplay(){
    if(autoplayTimer) clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }

  function resetAutoplay(){
    stopAutoplay();
    startAutoplay();
  }

  /* pointer (mouse) drag */
  var dragging = false;
  var dragBase = 0;
  var dragStartX = 0;
  var directionLocked = false;
  var isHorizontalDrag = false;

  slider.addEventListener('pointerdown', function(e){
    if(e.button && e.button !== 0) return;
    if(e.target.closest('.slider-arrow')) return;
    dragging = true;
    directionLocked = false;
    isHorizontalDrag = false;
    dragStartX = e.clientX;
    dragBase = -current * slider.clientWidth;
    slider.classList.add('is-dragging');
    track.classList.add('no-transition');
    track.style.transform = 'translateX(' + dragBase + 'px)';
    stopAutoplay();
  });

  slider.addEventListener('pointermove', function(e){
    if(!dragging) return;
    var dx = e.clientX - dragStartX;
    var dy = Math.abs(e.clientY - (e._startY || e.clientY));
    if(!directionLocked){
      if(Math.abs(dx) < 10 && dy < 10) return;
      directionLocked = true;
      isHorizontalDrag = Math.abs(dx) >= dy;
    }
    if(!isHorizontalDrag){ dragging = false; return; }
    if(e.cancelable) e.preventDefault();
    track.style.transform = 'translateX(' + (dragBase + dx) + 'px)';
  });

  function endPointer(e){
    if(!dragging) return;
    dragging = false;
    slider.classList.remove('is-dragging');
    track.classList.remove('no-transition');
    var endX = e.clientX;
    var dx = endX - dragStartX;
    if(Math.abs(dx) > 50){
      if(dx < 0) next(); else prev();
    } else {
      track.style.transform = 'translateX(' + (-current * slider.clientWidth) + '%)';
    }
  }

  slider.addEventListener('pointerup', endPointer);
  slider.addEventListener('pointercancel', function(){
    if(!dragging) return;
    dragging = false;
    slider.classList.remove('is-dragging');
    track.classList.remove('no-transition');
    track.style.transform = 'translateX(' + (-current * slider.clientWidth) + '%)';
  });

  /* touch swipe (mobile) */
  var touchActive = false;
  var touchStartX = 0;
  var touchStartY = 0;
  var touchDirLocked = false;
  var touchHorizontal = false;

  slider.addEventListener('touchstart', function(e){
    var t = e.touches[0];
    touchActive = true;
    touchDirLocked = false;
    touchHorizontal = false;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    dragBase = -current * slider.clientWidth;
    track.classList.add('no-transition');
    track.style.transform = 'translateX(' + dragBase + 'px)';
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchmove', function(e){
    if(!touchActive) return;
    var t = e.touches[0];
    var dx = t.clientX - touchStartX;
    var dy = Math.abs(t.clientY - touchStartY);
    if(!touchDirLocked){
      if(Math.abs(dx) < 10 && dy < 10) return;
      touchDirLocked = true;
      touchHorizontal = Math.abs(dx) >= dy;
    }
    if(!touchHorizontal){ touchActive = false; return; }
    if(e.cancelable) e.preventDefault();
    track.style.transform = 'translateX(' + (dragBase + dx) + 'px)';
  }, { passive: false });

  slider.addEventListener('touchend', function(e){
    if(!touchActive) return;
    touchActive = false;
    track.classList.remove('no-transition');
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStartX;
    if(Math.abs(dx) > 50){
      if(dx < 0) next(); else prev();
    } else {
      track.style.transform = 'translateX(' + (-current * slider.clientWidth) + '%)';
    }
  });

  slider.addEventListener('touchcancel', function(){
    if(!touchActive) return;
    touchActive = false;
    track.classList.remove('no-transition');
    track.style.transform = 'translateX(' + (-current * slider.clientWidth) + '%)';
  });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  dotBtns.forEach(function(d, i){
    d.addEventListener('click', function(){ goTo(i); });
  });

  slider.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ prev(); e.preventDefault(); }
    else if(e.key === 'ArrowRight'){ next(); e.preventDefault(); }
  });

  slider.addEventListener('pointerenter', stopAutoplay);
  slider.addEventListener('pointerleave', startAutoplay);

  var downloadSection = document.querySelector('.download');
  if(downloadSection){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && !document.hidden) startAutoplay();
        else stopAutoplay();
      });
    }, { rootMargin: '100px' });
    io.observe(downloadSection);
  }

  document.addEventListener('visibilitychange', function(){
    if(document.hidden) stopAutoplay();
    else if(downloadSection && downloadSection.getBoundingClientRect().top < window.innerHeight) startAutoplay();
  });

  if(reduced.addEventListener){
    reduced.addEventListener('change', function(){
      if(reduced.matches) stopAutoplay();
      else startAutoplay();
    });
  }

  track.style.transform = 'translateX(0%)';
  startAutoplay();
})();
