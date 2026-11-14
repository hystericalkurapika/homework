/* THE COMPUTER ARCHIVE — script.js
   Interaksi ringan: progress bar, navigasi aktif, menu mobile, animasi masuk,
   lightbox foto, tombol kembali ke atas, fallback gambar. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- progress bar, tombol atas, nav aktif ---------- */
  var bar = $('.progress i');
  var totop = $('.totop');
  var navLinks = $$('[data-nav]').map(function (a) { return { a: a, el: document.getElementById(a.dataset.nav) }; });
  var genLinks = $$('[data-gen]').map(function (a) { return { a: a, el: document.getElementById(a.dataset.gen) }; });
  var gensSection = document.getElementById('generations');
  var ticking = false;

  function absTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  function updateActive() {
    var probe = window.scrollY + 58 + 120;
    var current = null;
    navLinks.forEach(function (t) { if (t.el && absTop(t.el) <= probe) current = t; });
    navLinks.forEach(function (t) {
      var on = current && current === t;
      t.a.classList.toggle('active', !!on);
      if (on) t.a.setAttribute('aria-current', 'true'); else t.a.removeAttribute('aria-current');
    });
    var insideGens = gensSection && absTop(gensSection) <= probe && gensSection.getBoundingClientRect().bottom > 160;
    var activeGen = null;
    if (insideGens) genLinks.forEach(function (t) { if (t.el && absTop(t.el) <= probe) activeGen = t; });
    genLinks.forEach(function (t) { t.a.classList.toggle('active', !!activeGen && activeGen === t); });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.setProperty('--p', (max > 0 ? h.scrollTop / max : 0).toFixed(4));
      totop.classList.toggle('show', h.scrollTop > 600);
      updateActive();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  totop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    var home = document.getElementById('home');
    if (home) { home.setAttribute('tabindex', '-1'); home.focus({ preventScroll: true }); }
  });

  /* ---------- menu hamburger ---------- */
  var toggle = $('.nav-toggle');
  var nav = $('#nav');
  function setNav(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  }
  toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false); });

  /* ---------- animasi masuk yang lembut ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- fallback gambar (tidak ada gambar rusak) ---------- */
  function disableZoom(img) {
    var btn = img.closest('[data-zoom]');
    if (btn) { btn.removeAttribute('data-zoom'); btn.style.cursor = 'default'; btn.removeAttribute('aria-haspopup'); }
  }
  function showFallback(img) {
    var d = document.createElement('div');
    d.className = 'img-fallback';
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', img.alt || 'Foto tidak dapat dimuat');
    var s = document.createElement('strong'); s.textContent = 'Foto tidak dapat dimuat';
    var p = document.createElement('span'); p.textContent = img.alt || '';
    d.appendChild(s); d.appendChild(p);
    if (img.dataset.page) {
      var a = document.createElement('a');
      a.href = img.dataset.page; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Buka di Wikimedia Commons';
      d.appendChild(a);
    }
    disableZoom(img);
    img.replaceWith(d);
  }
  function watchImg(img) {
    function fail() {
      if (!img.dataset.retry && /\?width=\d+/.test(img.src)) {
        img.dataset.retry = '1';
        img.src = img.src.replace(/\?width=\d+/, '');
        return;
      }
      showFallback(img);
    }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy' && img.currentSrc) fail();
  }
  $$('img[data-page]').forEach(watchImg);

  /* ---------- lightbox ---------- */
  var dlg = $('#lightbox');
  var lbImg = $('img', dlg);
  var lbCap = $('figcaption', dlg);
  var lbCount = $('.lb-count', dlg);
  var items = [];
  var idx = 0;

  function collect() { items = $$('[data-zoom]').filter(function (b) { return $('img', b); }); }

  function captionFor(btn) {
    var fig = btn.closest('figure');
    if (fig) { var c = $('figcaption', fig); return c ? c.innerHTML : ''; }
    var tool = btn.closest('.tool');
    if (tool) {
      var h = $('h3', tool); var cr = $('.credit', tool);
      return '<b>' + (h ? h.textContent : '') + '</b> ' + (cr ? cr.innerHTML : '');
    }
    return '';
  }

  function show(i) {
    collect();
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    var btn = items[idx];
    var img = $('img', btn);
    lbImg.onerror = function () {
      lbImg.onerror = null;
      lbImg.src = img.currentSrc || img.src;
    };
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.innerHTML = captionFor(btn);
    lbCount.textContent = 'Foto ' + (idx + 1) + ' dari ' + items.length;
  }

  function open(btn) {
    collect();
    var i = items.indexOf(btn);
    if (i < 0) return;
    show(i);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-zoom]');
    if (btn && $('img', btn)) { e.preventDefault(); open(btn); }
  });
  $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
  $('.lb-prev', dlg).addEventListener('click', function () { show(idx - 1); });
  $('.lb-next', dlg).addEventListener('click', function () { show(idx + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
  });

  /* ---------- carousel screenshot ---------- */
  (function () {
    var track = $('.track'); if (!track) return;
    var cards = $$('.photo', track);
    var prev = $('.deck-btn.prev'), next = $('.deck-btn.next'), count = $('.deck-count');
    function current() {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, d = 1e9;
      cards.forEach(function (c, i) { var m = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (m < d) { d = m; best = i; } });
      return best;
    }
    function update() {
      count.textContent = (current() + 1) + ' / ' + cards.length;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }
    function go(i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      var c = cards[i];
      track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { go(current() - 1); });
    next.addEventListener('click', function () { go(current() + 1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('drag'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) { track.classList.remove('drag'); go(current()); }
    });
    track.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    update();
  })();
})();
