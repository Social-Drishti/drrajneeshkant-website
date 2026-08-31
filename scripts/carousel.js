/* ================================================================
   CAROUSEL.JS — Testimonial & Video carousels
   ================================================================ */

/* --- Testimonial Carousel --- */
(function() {
  var track = document.getElementById('testimonialTrack');
  var prevBtn = document.getElementById('testPrev');
  var nextBtn = document.getElementById('testNext');
  var dotsContainer = document.getElementById('testDots');
  if (!track || !prevBtn || !nextBtn) return;

  var cards = track.querySelectorAll('.testimonial-card');
  var count = cards.length;
  if (count < 2) return;

  var current = 0;
  var autoplayTimer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getVisibleCount() {
    var w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 920) return 1;
    return 2;
  }

  function goTo(index) {
    if (index < 0) index = count - 1;
    if (index >= count) index = 0;
    current = index;

    var visibleCount = getVisibleCount();
    var maxIndex = Math.max(0, count - visibleCount);
    if (current > maxIndex) current = maxIndex;

    var cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = 'translateX(' + (-current * cardWidth) + 'px)';

    if (dotsContainer) {
      var dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach(function(d, i) {
        d.classList.toggle('is-active', i === current);
      });
    }
    resetAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    if (reduced.matches) return;
    stopAutoplay();
    autoplayTimer = setTimeout(function tick() {
      next();
      autoplayTimer = setTimeout(tick, 5000);
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }

  function resetAutoplay() { stopAutoplay(); startAutoplay(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  if (dotsContainer) {
    dotsContainer.querySelectorAll('.slider-dot').forEach(function(d, i) {
      d.addEventListener('click', function() { goTo(i); });
    });
  }

  // Touch swipe
  var touchStartX = 0;
  var touchActive = false;

  track.addEventListener('touchstart', function(e) {
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', function(e) {
    if (!touchActive) return;
    touchActive = false;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  });

  startAutoplay();

  window.addEventListener('resize', function() { goTo(current); });
})();

/* --- Video Play Modal --- */
(function() {
  var modal = document.getElementById('videoModal');
  if (!modal) return;
  var iframe = modal.querySelector('iframe');
  var closeBtn = modal.querySelector('.modal-close');

  document.querySelectorAll('[data-video]').forEach(function(card) {
    card.addEventListener('click', function() {
      var videoId = this.getAttribute('data-video');
      if (iframe && videoId) {
        iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      }
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (iframe) iframe.src = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
