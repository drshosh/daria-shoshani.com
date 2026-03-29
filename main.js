/* =========================================
   DARIA SHOSHANI — PORTFOLIO
   main.js
   ========================================= */

(function () {
  'use strict';

  // --- MOUSE DOT: follows cursor across entire page ---
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);

  const moveDot = (x, y) => {
    dot.style.left = (x - 8) + 'px';
    dot.style.top  = (y - 8) + 'px';
  };

  window.addEventListener('mousemove', (ev) => {
    moveDot(ev.clientX, ev.clientY);
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const hoverable = el && el.closest('a, button, img, p, h1, h2, h3, li, .work-row, .work-img');
    dot.classList.toggle('hover', !!hoverable);
  }, { passive: true });

  window.addEventListener('touchmove', (ev) => {
    const t = ev.touches[0];
    moveDot(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener('mousedown', () => { dot.classList.remove('hover'); dot.classList.add('press'); });
  window.addEventListener('mouseup',   () => dot.classList.remove('press'));

  // --- HERO HEIGHT: match GIF natural proportions at full width (no top/bottom crop) ---
  const heroEl2 = document.getElementById('hero');
  const GIF_RATIO = 1029 / 1456; // height / width
  const setHeroHeight = () => {
    if (heroEl2) heroEl2.style.height = (window.innerWidth * GIF_RATIO) + 'px';
  };
  setHeroHeight();
  window.addEventListener('resize', setHeroHeight);

  // --- HERO CLICK: jump to content ---
  const heroBg = document.getElementById('hero-click');
  if (heroBg) {
    heroBg.addEventListener('click', () => {
      document.getElementById('site-nav').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }

  // --- DRAWING ---
  const drawSvg    = document.getElementById('draw-svg');
  const drawToggle = document.getElementById('draw-toggle');
  const drawPanel  = document.getElementById('draw-panel');
  const drawClear  = document.getElementById('draw-clear');
  const drawWidthInput = document.getElementById('draw-width');
  const svgNS = 'http://www.w3.org/2000/svg';

  let drawMode  = false;
  let drawing   = false;
  let drawColor = '#111111';
  let drawWidth = 8;
  let lastPt    = { x: null, y: null };

  const exitDraw = () => {
    drawMode = false;
    drawing  = false;
    lastPt   = { x: null, y: null };
    drawToggle.classList.remove('active');
    drawPanel.classList.remove('open');
    document.body.classList.remove('draw-mode');
  };

  // Click toggles draw mode on/off
  drawToggle.addEventListener('click', () => {
    if (drawMode) {
      exitDraw();
    } else {
      drawMode = true;
      drawToggle.classList.add('active');
      drawPanel.classList.add('open');
      document.body.classList.add('draw-mode');
    }
  });

  // Exit on Escape
  document.addEventListener('keydown', (e) => {
    if (drawMode && e.key === 'Escape') {
      e.preventDefault();
      exitDraw();
    }
  });

  document.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawColor = btn.dataset.color;
    });
  });

  drawWidthInput.addEventListener('input', () => { drawWidth = +drawWidthInput.value; });

  drawClear.addEventListener('click', () => {
    while (drawSvg.firstChild) drawSvg.removeChild(drawSvg.firstChild);
  });

  drawSvg.addEventListener('mousedown', (e) => {
    if (!drawMode || e.button !== 0) return;
    drawing = true;
    lastPt = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  });

  drawSvg.addEventListener('mousemove', (e) => {
    if (!drawMode || !drawing || lastPt.x === null) return;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', lastPt.x);
    line.setAttribute('y1', lastPt.y);
    line.setAttribute('x2', e.clientX);
    line.setAttribute('y2', e.clientY);
    line.setAttribute('stroke', drawColor);
    line.setAttribute('stroke-width', drawWidth);
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    drawSvg.appendChild(line);
    lastPt = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    drawing = false;
    lastPt = { x: null, y: null };
  });

  // --- HOVER LINK PREVIEW ---
  const preview = document.createElement('div');
  preview.id = 'link-preview';
  const previewImg = document.createElement('img');
  preview.appendChild(previewImg);
  document.body.appendChild(preview);

  const cache = new Map();

  const screenshotOf = (url) =>
    'https://api.microlink.io/?url=' + encodeURIComponent(url) +
    '&screenshot=true&meta=false&embed=screenshot.url' +
    '&colorScheme=light&viewport.width=1280&viewport.height=800';

  document.querySelectorAll('#cv a[href]:not([href="#"]), .contact-email, .contact-instagram')
    .forEach(link => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto')) return;

      link.addEventListener('mouseenter', () => {
        if (!cache.has(raw)) cache.set(raw, screenshotOf(raw));
        previewImg.src = cache.get(raw);
        preview.classList.add('show');
        prevLinkX = null;
      });

      link.addEventListener('mousemove', (e) => {
        preview.style.left = (e.clientX - 100) + 'px';
        preview.style.top  = (e.clientY - 175) + 'px';
      });

      link.addEventListener('mouseleave', () => {
        preview.classList.remove('show');
      });
    });

  // --- NAV: white text when dark content is behind it ---
  const siteNavBar = document.getElementById('site-nav');
  const heroNameEl = document.querySelector('.hero-name');
  const heroEl     = document.getElementById('hero');
  const FADE_PX = 250; // px over which hero-name melts into nav-brand
  const updateNavColor = () => {
    if (!siteNavBar) return;
    // Fade hero-name (white, fixed) into nav-brand (dark, sticky) as hero exits
    const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
    if (heroNameEl) {
      const opacity = Math.max(0, Math.min(1, heroBottom / FADE_PX));
      heroNameEl.style.opacity = opacity;
    }
  };
  window.addEventListener('scroll', updateNavColor, { passive: true });
  updateNavColor();

  // --- FLOATING WORK TOOLTIP ---
  const tooltip = document.createElement('div');
  tooltip.id = 'work-tooltip';
  tooltip.innerHTML = '<p class="tt-sub"></p><p class="tt-medium"></p><p class="tt-text"></p>';
  document.body.appendChild(tooltip);

  document.querySelectorAll('.work-img-wrap').forEach(wrap => {
    const overlay = wrap.querySelector('.work-overlay');
    if (!overlay) return;
    const sub    = overlay.querySelector('.work-sub');
    const medium = overlay.querySelector('.work-medium');
    const text   = overlay.querySelector('.work-text');
    wrap.addEventListener('mouseenter', () => {
      tooltip.querySelector('.tt-sub').textContent    = sub    ? sub.textContent    : '';
      tooltip.querySelector('.tt-medium').textContent = medium ? medium.textContent : '';
      tooltip.querySelector('.tt-text').textContent   = text   ? text.textContent   : '';
      tooltip.classList.add('visible');
    });
    wrap.addEventListener('mousemove', (e) => {
      const tx = Math.min(e.clientX + 24, window.innerWidth  - tooltip.offsetWidth  - 16);
      const ty = Math.min(e.clientY + 24, window.innerHeight - tooltip.offsetHeight - 16);
      tooltip.style.left = tx + 'px';
      tooltip.style.top  = ty + 'px';
    });
    wrap.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });

  // --- SMOOTH SCROLL ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
  });

  // --- COUNTDOWN OVERLAY ---
  const countdownOverlay = document.getElementById('countdown-overlay');
  if (countdownOverlay) {
    const startTime = Date.now();
    const hideCountdown = () => {
      const elapsed = Date.now() - startTime;
      const wait = Math.max(0, 3500 - elapsed);
      setTimeout(() => countdownOverlay.classList.add('hidden'), wait);
    };
    if (document.readyState === 'complete') {
      hideCountdown();
    } else {
      window.addEventListener('load', hideCountdown);
    }
  }

  // --- LIGHTBOX ---
  const lightbox  = document.getElementById('lightbox');
  const lbMedia   = document.getElementById('lb-media');
  const lbCounter = document.getElementById('lb-counter');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  let lbImages = [];
  let lbIndex  = 0;

  const isVideo = src => /\.(mp4|mov|webm|ogg)$/i.test(src);

  const renderLb = () => {
    lbMedia.innerHTML = '';
    const src = lbImages[lbIndex];
    if (isVideo(src)) {
      const v = document.createElement('video');
      v.src = src; v.controls = true; v.autoplay = true;
      lbMedia.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = src;
      lbMedia.appendChild(img);
    }
    lbCounter.textContent = lbImages.length > 1 ? (lbIndex + 1) + ' / ' + lbImages.length : '';
    lbPrev.style.visibility = lbImages.length > 1 ? 'visible' : 'hidden';
    lbNext.style.visibility = lbImages.length > 1 ? 'visible' : 'hidden';
  };

  const lbBg = document.getElementById('lb-bg');

  const setLbBg = (bgList) => {
    lbBg.innerHTML = '';
    lbBg.style.backgroundImage = '';
    lbBg.style.backgroundColor = '';
    if (!bgList || !bgList.length) return;
    const src = bgList[Math.floor(Math.random() * bgList.length)];
    if (/\.(mp4|mov|webm)$/i.test(src)) {
      const v = document.createElement('video');
      v.src = src; v.autoplay = true; v.loop = true; v.muted = true; v.playsinline = true;
      lbBg.appendChild(v);
    } else if (!/\./.test(src)) {
      lbBg.style.backgroundColor = src;
    } else {
      lbBg.style.backgroundImage = 'url("' + src + '")';
    }
  };

  const openLb = (images, index, bgList) => {
    lbImages = images; lbIndex = index;
    renderLb();
    setLbBg(bgList);
    const isLight = bgList && bgList.length === 1 && !/\./.test(bgList[0]) && bgList[0] === 'white';
    lightbox.classList.toggle('light-bg', !!isLight);
    lightbox.classList.add('open');
  };

  const closeLb = () => {
    lightbox.classList.remove('open', 'light-bg');
    lbMedia.innerHTML = '';
    if (lbBg) { lbBg.innerHTML = ''; lbBg.style.backgroundImage = ''; lbBg.style.backgroundColor = ''; }
  };

  lbClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  lbPrev.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLb(); });
  lbNext.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex + 1) % lbImages.length; renderLb(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLb(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; renderLb(); }
  });

  document.querySelectorAll('.work-card[data-images]').forEach(card => {
    card.querySelector('.work-img-wrap').addEventListener('click', () => {
      try {
        const images = JSON.parse(card.dataset.images);
        const bgList = card.dataset.bg ? JSON.parse(card.dataset.bg) : [];
        if (images.length) {
          const cover = card.querySelector('.work-cover');
          const thumbSrc = cover ? cover.getAttribute('src') : null;
          const startIndex = thumbSrc ? Math.max(0, images.indexOf(thumbSrc)) : 0;
          openLb(images, startIndex, bgList);
        }
      } catch(err) {}
    });
  });

})();
