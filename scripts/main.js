/* ================================================================
   MAIN.JS — Core: Lenis, Preloader, Navigation, Drawer
   ================================================================ */

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

  lenis.on('scroll', function() {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -20 });
        // Close drawer if open (CSS fallback - GSAP version in script.js handles animation)
        var drawer = document.getElementById('siteMenu');
        var overlay = document.getElementById('drawerOverlay');
        var burger = document.getElementById('menuToggle');
        if (drawer && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
          if (burger) {
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Open menu');
          }
          drawer.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          if (lenisInstance) lenisInstance.start();
        }
      }
    });
  });
})();

/* ================================================================
   2. PRELOADER
   ================================================================ */
(function() {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  function hidePreloader() {
    preloader.classList.add('is-hidden');
    setTimeout(function() {
      document.body.classList.add('is-loaded');
      if (typeof initHeroAnimations === 'function') initHeroAnimations();
    }, 400);
  }

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
   3. NAVIGATION SCROLL STATE
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
  if (lenisInstance) {
    lenisInstance.on('scroll', onScroll);
  }
  updateNav();
})();

/* ================================================================
   4. MENU DRAWER TOGGLE (GSAP)
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
