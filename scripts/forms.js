/* ================================================================
   FORMS.JS — FAQ Accordion, Contact Form, Appointment Form
   ================================================================ */

/* --- FAQ Accordion --- */
(function() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.closest('.faq-item');
      var isActive = item.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item.active').forEach(function(active) {
        if (active !== item) active.classList.remove('active');
      });

      item.classList.toggle('active', !isActive);
    });
  });
})();

/* --- Contact Form --- */
(function() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(form);
    var data = {};
    formData.forEach(function(val, key) { data[key] = val; });

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      alert('Please fill in all required fields.');
      return;
    }

    // Simulate send
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(function() {
      btn.textContent = 'Message Sent!';
      btn.style.background = '#5c7b67';
      form.reset();
      setTimeout(function() {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
})();

/* --- Appointment Form --- */
(function() {
  var form = document.getElementById('appointmentForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(form);
    var data = {};
    formData.forEach(function(val, key) { data[key] = val; });

    if (!data.name || !data.phone || !data.date) {
      alert('Please fill in all required fields.');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn.textContent;
    btn.textContent = 'Booking...';
    btn.disabled = true;

    setTimeout(function() {
      btn.textContent = 'Appointment Requested!';
      btn.style.background = '#5c7b67';
      form.reset();
      setTimeout(function() {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
})();

/* --- Smooth scroll for anchor links (fallback for non-Lenis) --- */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (target) {
      // If Lenis is handling it, skip
      if (lenisInstance) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
