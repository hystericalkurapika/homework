/* THE COMPUTER ARCHIVE — script.js
   Interaksi ringan: progress bar, navigasi aktif, menu mobile, animasi masuk,
   lightbox foto, tombol kembali ke atas, tampilan kartu untuk tabel, fallback gambar. */
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

  /* ---------- tabel: tampilan kartu per aspek ---------- */
  var cmp = $('#comparison');
  var vt = $('#viewTable');
  var vc = $('#viewCards');
  var sel = $('#aspectSelect');
  var grid = $('#cvGrid');
  var rows = $$('#cmpTable tbody tr[data-aspect]');
  var genNames = ['Generasi 1 · Vacuum Tubes', 'Generasi 2 · Transistors', 'Generasi 3 · Integrated Circuits', 'Generasi 4 · Microprocessors', 'Generasi 5 · Artificial Intelligence'];

  rows.forEach(function (r, i) { sel.add(new Option(r.dataset.aspect, String(i))); });

  function renderCards() {
    var r = rows[parseInt(sel.value, 10) || 0];
    grid.innerHTML = '';
    Array.prototype.slice.call(r.cells, 1).forEach(function (td, i) {
      var c = document.createElement('div'); c.className = 'card';
      var h = document.createElement('h4'); h.textContent = genNames[i];
      var b = document.createElement('div'); b.innerHTML = td.innerHTML;
      c.appendChild(h); c.appendChild(b); grid.appendChild(c);
    });
  }
  function setView(v) {
    cmp.dataset.view = v;
    vt.setAttribute('aria-pressed', String(v === 'table'));
    vc.setAttribute('aria-pressed', String(v === 'cards'));
    if (v === 'cards') renderCards();
  }
  vt.addEventListener('click', function () { setView('table'); });
  vc.addEventListener('click', function () { setView('cards'); });
  sel.addEventListener('change', renderCards);
})();
