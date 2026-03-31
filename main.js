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

  // --- TOUCH DRAWING (mobile) ---
  const drawLine = (x1, y1, x2, y2) => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', drawColor);
    line.setAttribute('stroke-width', drawWidth);
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    drawSvg.appendChild(line);
  };

  drawSvg.addEventListener('touchstart', (e) => {
    if (!drawMode) return;
    e.preventDefault();
    const t = e.touches[0];
    drawing = true;
    lastPt = { x: t.clientX, y: t.clientY };
  }, { passive: false });

  drawSvg.addEventListener('touchmove', (e) => {
    if (!drawMode || !drawing || lastPt.x === null) return;
    e.preventDefault();
    const t = e.touches[0];
    drawLine(lastPt.x, lastPt.y, t.clientX, t.clientY);
    lastPt = { x: t.clientX, y: t.clientY };
  }, { passive: false });

  drawSvg.addEventListener('touchend', () => {
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

  const previewLinks = Array.from(
    document.querySelectorAll('#cv a[href]:not([href="#"]), .contact-email, .contact-instagram')
  ).filter(link => {
    const raw = link.getAttribute('href');
    return raw && !raw.startsWith('#') && !raw.startsWith('mailto');
  });

  // Prefetch all screenshots after load so hover shows instantly
  window.addEventListener('load', () => {
    setTimeout(() => {
      previewLinks.forEach(link => {
        const raw = link.getAttribute('href');
        if (cache.has(raw)) return;
        const url = screenshotOf(raw);
        cache.set(raw, url);
        const img = new Image();
        img.src = url;
      });
    }, 3000); // wait 3s so critical assets load first
  });

  previewLinks.forEach(link => {
      const raw = link.getAttribute('href');

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
      if (window.matchMedia('(max-width: 768px)').matches) {
        heroNameEl.style.opacity = 1;
      } else {
        const opacity = Math.max(0, Math.min(1, heroBottom / FADE_PX));
        heroNameEl.style.opacity = opacity;
      }
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

  // Cache of preloaded media elements — images via HTTP cache, videos kept alive as elements
  const mediaCache = new Map();

  const preloadMedia = (src) => {
    if (mediaCache.has(src)) return;
    if (isVideo(src)) {
      const v = document.createElement('video');
      v.src = src; v.preload = 'auto';
      mediaCache.set(src, v);
    } else {
      const img = new Image();
      img.src = src;
      mediaCache.set(src, img);
    }
  };

  const renderLb = () => {
    // Detach existing video without destroying it (preserves buffer)
    const existingVideo = lbMedia.querySelector('video');
    if (existingVideo) lbMedia.removeChild(existingVideo);
    else lbMedia.innerHTML = '';

    const src = lbImages[lbIndex];
    if (isVideo(src)) {
      const v = mediaCache.get(src) || document.createElement('video');
      if (!mediaCache.has(src)) { v.src = src; mediaCache.set(src, v); }
      v.controls = true; v.autoplay = true;
      lbMedia.appendChild(v);
      v.play().catch(() => {});
    } else {
      const img = document.createElement('img');
      img.src = src; // hits HTTP cache if preloaded
      lbMedia.appendChild(img);
    }
    lbCounter.textContent = lbImages.length > 1 ? (lbIndex + 1) + ' / ' + lbImages.length : '';
    lbPrev.style.visibility = lbImages.length > 1 ? 'visible' : 'hidden';
    lbNext.style.visibility = lbImages.length > 1 ? 'visible' : 'hidden';

    // Preload prev and next items so navigation feels instant
    [-1, 1].forEach(offset => {
      const ni = (lbIndex + offset + lbImages.length) % lbImages.length;
      if (ni !== lbIndex) preloadMedia(lbImages[ni]);
    });
  };

  const lbBg = document.getElementById('lb-bg');

  // Cache of preloaded background video elements keyed by src
  const bgVideoCache = new Map();

  const preloadBgVideo = (src) => {
    if (bgVideoCache.has(src)) return;
    if (/\.(mp4|mov|webm)$/i.test(src)) {
      const v = document.createElement('video');
      v.src = src; v.preload = 'auto'; v.muted = true; v.loop = true; v.playsinline = true;
      bgVideoCache.set(src, v);
    }
  };

  const setLbBg = (bgList) => {
    // Detach any existing video back to cache instead of destroying it
    const existing = lbBg.querySelector('video');
    if (existing) lbBg.removeChild(existing);
    lbBg.style.backgroundImage = '';
    lbBg.style.backgroundColor = '';
    if (!bgList || !bgList.length) return;
    const src = bgList[Math.floor(Math.random() * bgList.length)];
    if (/\.(mp4|mov|webm)$/i.test(src)) {
      // Use preloaded element if available, otherwise create fresh
      const v = bgVideoCache.get(src) || document.createElement('video');
      if (!bgVideoCache.has(src)) {
        v.src = src; v.muted = true; v.loop = true; v.playsinline = true;
      }
      v.autoplay = true;
      lbBg.appendChild(v);
      v.play().catch(() => {});
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
    // Detach without destroying so cached videos keep their buffer
    const mediaVideo = lbMedia.querySelector('video');
    if (mediaVideo) lbMedia.removeChild(mediaVideo);
    else lbMedia.innerHTML = '';
    if (lbBg) {
      const bgVideo = lbBg.querySelector('video');
      if (bgVideo) lbBg.removeChild(bgVideo);
      lbBg.style.backgroundImage = ''; lbBg.style.backgroundColor = '';
    }
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
    card.addEventListener('mouseenter', () => {
      try {
        const bgList = card.dataset.bg ? JSON.parse(card.dataset.bg) : [];
        bgList.forEach(src => preloadBgVideo(src));
        const images = JSON.parse(card.dataset.images);
        if (images.length) preloadMedia(images[0]);
      } catch(e) {}
    }, { once: true });

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

  // --- LIGHTBOX SWIPE (mobile) ---
  let lbTouchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    lbTouchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lbTouchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) {
        lbIndex = (lbIndex + 1) % lbImages.length;
      } else {
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
      }
      renderLb();
    }
  }, { passive: true });

  // --- MOBILE HAMBURGER MENU ---
  const hamburger   = document.getElementById('nav-hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-menu-close');

  if (hamburger && mobileMenu) {
    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    };

    hamburger.addEventListener('click', openMenu);
    mobileClose.addEventListener('click', closeMenu);

    mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-nav-sublink').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    const mobileDrawTrigger = document.getElementById('mobile-draw-trigger');
    if (mobileDrawTrigger) {
      mobileDrawTrigger.addEventListener('click', () => {
        closeMenu();
        if (!drawMode) drawToggle.click();
      });
    }
  }

})();
