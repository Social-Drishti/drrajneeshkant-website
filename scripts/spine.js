/* ================================================================
   SPINE.JS — Scroll-driven spine visualization engine
   ================================================================ */

var spineRegions = { cervical: [], thoracic: [], lumbar: [], sacrum: [] };

(function() {
  var NS = 'http://www.w3.org/2000/svg';
  var path = document.getElementById('spine-path');
  var group = document.getElementById('vertebra-group');
  if (!path || !group) return;
  var len = path.getTotalLength();
  var count = 26;

  for (var i = 0; i < count; i++) {
    var t = (i + 0.5) / count;
    var p = path.getPointAtLength(t * len);
    var p2 = path.getPointAtLength(Math.min(len, (t * len) + 2));
    var angle = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI + 90;
    var region = i < 7 ? 'cervical' : i < 19 ? 'thoracic' : i < 24 ? 'lumbar' : 'sacrum';

    var pos = document.createElementNS(NS, 'g');
    pos.setAttribute('class', 'vertebra-pos');
    pos.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + angle + ')');

    var rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('class', 'vertebra');
    rect.setAttribute('data-region', region);
    rect.setAttribute('x', '-9');
    rect.setAttribute('y', '-3.5');
    rect.setAttribute('width', '18');
    rect.setAttribute('height', '7');
    rect.setAttribute('rx', '1.5');
    rect.setAttribute('fill', i % 2 === 0 ? '#ede9e0' : '#c1502e');
    rect.setAttribute('opacity', i % 2 === 0 ? '0.9' : '0.85');
    rect.style.transitionDelay = (t * 0.9) + 's';

    pos.appendChild(rect);
    group.appendChild(pos);
    spineRegions[region].push(rect);
  }
})();

// Scroll-driven spine storytelling engine
(function() {
  var section = document.querySelector('.xray');
  var story = document.querySelector('.spine-story');
  var stickyBox = document.querySelector('.spine-stage-sticky');
  var svg = document.getElementById('spine-svg');
  if (!section || !story || !stickyBox || !svg) return;

  var STAGES = [
    { region: 'cervical', callout: 'callout-1', connector: 'connector-1', label: 'CERVICAL \u00b7 C1\u2013C7' },
    { region: 'thoracic', callout: 'callout-2', connector: 'connector-2', label: 'THORACIC \u00b7 T1\u2013T12' },
    { region: 'lumbar', callout: 'callout-3', connector: 'connector-3', label: 'LUMBAR \u00b7 L1\u2013L5' },
    { region: 'sacrum', callout: 'callout-4', connector: 'connector-4', label: 'SACRUM & PELVIS' }
  ];
  var DRIFT = [-24, -8, 10, 26];
  var ZOOM = [0.985, 1, 1.015, 1.03];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clamp = function(v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function(a, b, t) { return a + (b - a) * t; };
  var smooth = function(t) { return t * t * (3 - 2 * t); };

  var callouts = STAGES.map(function(s) { return document.getElementById(s.callout); });
  var paths = STAGES.map(function(s) { return document.getElementById(s.connector); });
  var numEl = document.getElementById('progressNum');
  var fillEl = document.getElementById('progressFill');
  var labelEl = document.getElementById('progressRegion');

  var m = { top: 0, travel: 1 };
  var stage = -1;
  var curDrift = DRIFT[0], curZoom = ZOOM[0], lastP = -1, labelTimer = null;

  function getScrollPos() {
    return (lenisInstance) ? lenisInstance.scroll : scrollY();
  }

  function measure() {
    var vh = window.innerHeight || 1;
    var r = story.getBoundingClientRect();
    m.top = r.top + getScrollPos();
    m.travel = Math.max(1, r.height - vh);
    layoutConnectors();
  }

  function origin() {
    var b = stickyBox.getBoundingClientRect();
    return { left: b.left, top: b.top };
  }

  function anchorPoint(regionName) {
    var list = spineRegions[regionName];
    if (!list || !list.length) return { x: 120, y: 400 };
    var o = origin();
    var x = 0, y = 0;
    list.forEach(function(rc) {
      var r = rc.getBoundingClientRect();
      x += r.left + r.width / 2 - o.left;
      y += r.top + r.height / 2 - o.top;
    });
    return { x: x / list.length, y: y / list.length };
  }

  function layoutConnectors() {
    if (!paths[0] || getComputedStyle(paths[0]).display === 'none') return;
    var o = origin();
    STAGES.forEach(function(s, i) {
      var card = callouts[i], pathEl = paths[i];
      if (!card || !pathEl) return;
      var cr = card.getBoundingClientRect();
      var a = anchorPoint(s.region);
      var cx = (cr.left + cr.right) / 2 - o.left;
      var dir = cx < a.x ? -1 : 1;
      var sx = a.x + dir * 18;
      var ex = dir === 1 ? cr.left - o.left - 12 : cr.right - o.left + 12;
      var ey = cr.top - o.top + cr.height * 0.45;
      var mx = sx + (ex - sx) * 0.55;
      pathEl.setAttribute('d',
        'M' + sx.toFixed(1) + ' ' + a.y.toFixed(1) +
        ' H' + mx.toFixed(1) +
        ' V' + ey.toFixed(1) +
        ' H' + ex.toFixed(1));
      try {
        var L = pathEl.getTotalLength();
        pathEl.style.setProperty('--clen', String(Math.ceil(L + 2)));
      } catch (e) {}
    });
  }

  function applyStage(i) {
    stage = i;
    var cfg = STAGES[i];
    callouts.forEach(function(c, k) {
      if (!c) return;
      c.classList.toggle('active', k === i);
      c.classList.toggle('inactive', k !== i);
    });
    Object.keys(spineRegions).forEach(function(name) {
      var on = name === cfg.region;
      spineRegions[name].forEach(function(r) {
        r.classList.toggle('is-active', on);
        r.classList.toggle('is-dim', !on);
      });
    });
    paths.forEach(function(p, k) { if (p) p.classList.toggle('active', k === i); });
    if (numEl) numEl.textContent = ('0' + (i + 1)).slice(-2);
    if (labelEl) {
      clearTimeout(labelTimer);
      labelEl.style.opacity = '0';
      labelTimer = setTimeout(function() {
        labelEl.textContent = cfg.label;
        labelEl.style.opacity = '';
      }, 180);
    }
    section.dataset.stage = String(i);
  }

  function frame() {
    if (!document.hidden) {
      var y = getScrollPos();
      var p = clamp((y - m.top) / m.travel, 0, 1);
      var idx = clamp(Math.round(p * 3), 0, 3);
      if (idx !== stage) applyStage(idx);
      if (!reduced.matches) {
        var sf = p * 3;
        var seg = Math.min(Math.floor(sf), 2);
        var t = smooth(clamp(sf - seg, 0, 1));
        var tgtD = lerp(DRIFT[seg], DRIFT[seg + 1], t);
        var tgtZ = lerp(ZOOM[seg], ZOOM[seg + 1], t);
        curDrift += (tgtD - curDrift) * 0.14;
        curZoom += (tgtZ - curZoom) * 0.14;
        if (Math.abs(curDrift - tgtD) < 0.02) curDrift = tgtD;
        if (Math.abs(curZoom - tgtZ) < 0.0002) curZoom = tgtZ;
        svg.style.transform = 'translateY(' + curDrift.toFixed(2) + 'px) scale(' + curZoom.toFixed(4) + ')';
        if (Math.abs(p - lastP) > 0.0015) {
          if (fillEl) fillEl.style.transform = 'scaleX(' + p.toFixed(4) + ')';
          lastP = p;
        }
      }
    }
    requestAnimationFrame(frame);
  }

  var rzT;
  window.addEventListener('resize', function() {
    clearTimeout(rzT);
    rzT = setTimeout(measure, 140);
  });
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        section.classList.add('in-view');
        setTimeout(function() {
          document.querySelectorAll('#vertebra-group .vertebra').forEach(function(v) {
            v.style.transitionDelay = '';
          });
        }, 2000);
      }
    });
  }, { rootMargin: '20% 0px 20% 0px' });
  io.observe(story);

  if (reduced.addEventListener) {
    reduced.addEventListener('change', function() {
      if (reduced.matches) svg.style.transform = '';
    });
  }

  measure();
  applyStage(clamp(Math.round(clamp((getScrollPos() - m.top) / m.travel, 0, 1) * 3), 0, 3));
  requestAnimationFrame(frame);
})();
