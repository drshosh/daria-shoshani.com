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

  // --- HERO HEIGHT ---
  // Desktop: match GIF natural proportions (no crop).
  // Mobile: fill the full viewport height so the GIF covers the screen portrait-style.
  const heroEl2 = document.getElementById('hero');
  const GIF_RATIO = 1029 / 1456; // height / width
  const setHeroHeight = () => {
    if (!heroEl2) return;
    if (window.matchMedia('(max-width: 768px)').matches) {
      heroEl2.style.height = ''; // CSS handles height via natural video dimensions
    } else {
      heroEl2.style.height = (window.innerWidth * GIF_RATIO) + 'px';
    }
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
  const drawEraser = document.getElementById('draw-eraser');
  const drawWidthInput = document.getElementById('draw-width');
  const svgNS = 'http://www.w3.org/2000/svg';

  // Mobile draw toolbar elements
  const mdtToolbar     = document.getElementById('mobile-draw-toolbar');
  const mdtControlsBar = document.getElementById('mdt-controls-bar');
  const mdtEraserBtn   = document.getElementById('mdt-eraser');
  const mdtClearBtn    = document.getElementById('mdt-clear');
  const mdtSendBtn     = document.getElementById('mdt-send');
  const mdtCloseBtn    = document.getElementById('mdt-close');
  const mdtWidthInput  = document.getElementById('mdt-width');

  const showMobileDrawUI = (on) => {
    const hidden = on ? 'false' : 'true';
    if (mdtToolbar)     { mdtToolbar.classList.toggle('open', on);     mdtToolbar.setAttribute('aria-hidden', hidden); }
    if (mdtControlsBar) { mdtControlsBar.classList.toggle('open', on); mdtControlsBar.setAttribute('aria-hidden', hidden); }
  };

  let drawMode   = false;
  let eraserMode = false;
  let drawing    = false;
  let drawColor  = '#f5f0e8';
  let drawWidth  = 8;
  let lastPt     = { x: null, y: null };

  const drawGroup = document.createElementNS(svgNS, 'g');
  drawSvg.appendChild(drawGroup);

  // Spatial eraser: find lines whose segment passes within radius of a point and remove them
  const distToSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  const eraseAt = (x, y) => {
    const radius = drawWidth;
    Array.from(drawGroup.querySelectorAll('line')).forEach(line => {
      if (distToSegment(x, y,
        +line.getAttribute('x1'), +line.getAttribute('y1'),
        +line.getAttribute('x2'), +line.getAttribute('y2')
      ) < radius) drawGroup.removeChild(line);
    });
  };

  const setEraserMode = (on) => {
    eraserMode = on;
    drawEraser.classList.toggle('active', on);
    if (mdtEraserBtn) mdtEraserBtn.classList.toggle('active', on);
    document.body.classList.toggle('eraser-mode', on);
    document.body.classList.toggle('draw-mode', !on);
  };

  const exitDraw = () => {
    drawMode   = false;
    eraserMode = false;
    drawing    = false;
    lastPt     = { x: null, y: null };
    drawToggle.classList.remove('active');
    drawEraser.classList.remove('active');
    drawPanel.classList.remove('open');
    document.body.classList.remove('draw-mode', 'eraser-mode');
    showMobileDrawUI(false);
    if (mdtEraserBtn) mdtEraserBtn.classList.remove('active');
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
      if (window.matchMedia('(max-width: 768px)').matches) showMobileDrawUI(true);
    }
  });

  // Exit on Escape
  document.addEventListener('keydown', (e) => {
    if (drawMode && e.key === 'Escape') {
      e.preventDefault();
      exitDraw();
    }
  });

  drawEraser.addEventListener('click', () => {
    if (!eraserMode) {
      setEraserMode(true);
      document.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
    } else {
      setEraserMode(false);
      document.querySelector('.swatch.active') || document.querySelector('.swatch').classList.add('active');
    }
  });

  document.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      // Sync active state across both desktop and mobile palettes
      document.querySelectorAll('.swatch').forEach(b => b.classList.toggle('active', b.dataset.color === color));
      drawColor = color;
      if (eraserMode) setEraserMode(false);
    });
  });

  drawWidthInput.addEventListener('input', () => { drawWidth = +drawWidthInput.value; });

  drawClear.addEventListener('click', () => {
    while (drawGroup.firstChild) drawGroup.removeChild(drawGroup.firstChild);
  });

  // --- DRAWING: SEND VIA EMAILJS ---
  // To enable sending, create a free account at https://emailjs.com then:
  //   1. Add an email service (e.g. Gmail) and note the Service ID
  //   2. Create a template — subject: "New drawing", body: <img src="{{drawing}}"> — note the Template ID
  //   3. Copy your Public Key from Account > API Keys
  //   4. Paste all three values below
  const EMAILJS_PUBLIC_KEY  = '3d4DIAcuJXfWIj9G4';
  const EMAILJS_SERVICE_ID  = 'service_jkxfbys';
  const EMAILJS_TEMPLATE_ID = 'template_k0zrdkw';

  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const drawSend  = document.getElementById('draw-send');
  const drawToast = document.getElementById('draw-toast');

  let toastTimer = null;
  const showToast = (msg, duration) => {
    drawToast.textContent = msg;
    drawToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => drawToast.classList.remove('show'), duration || 5000);
  };

  const exportDrawingAsPng = () => new Promise((resolve, reject) => {
    if (!drawGroup.querySelector('line')) { reject('empty'); return; }
    if (typeof html2canvas === 'undefined') { reject('no-lib'); return; }

    drawPanel.style.visibility = 'hidden';
    if (mdtToolbar)     mdtToolbar.style.visibility     = 'hidden';
    if (mdtControlsBar) mdtControlsBar.style.visibility = 'hidden';

    const restoreToolbars = () => {
      drawPanel.style.visibility = '';
      if (mdtToolbar)     mdtToolbar.style.visibility     = '';
      if (mdtControlsBar) mdtControlsBar.style.visibility = '';
    };

    const fallbackSvgExport = () => {
      const lines = drawGroup.querySelectorAll('line');
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      lines.forEach(line => {
        const sw = (+line.getAttribute('stroke-width') || 8) / 2;
        const x1 = +line.getAttribute('x1'), y1 = +line.getAttribute('y1');
        const x2 = +line.getAttribute('x2'), y2 = +line.getAttribute('y2');
        minX = Math.min(minX, x1 - sw, x2 - sw); maxX = Math.max(maxX, x1 + sw, x2 + sw);
        minY = Math.min(minY, y1 - sw, y2 - sw); maxY = Math.max(maxY, y1 + sw, y2 + sw);
      });
      const pad = 28;
      const vx = Math.max(0, minX - pad), vy = Math.max(0, minY - pad);
      const vw = Math.min(window.innerWidth,  maxX + pad) - vx;
      const vh = Math.min(window.innerHeight, maxY + pad) - vy;
      const scale = Math.min(1, 400 / Math.max(vw, vh));
      const cw = Math.round(vw * scale), ch = Math.round(vh * scale);
      const c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      lines.forEach(line => {
        const x1 = (+line.getAttribute('x1') - vx) * scale;
        const y1 = (+line.getAttribute('y1') - vy) * scale;
        const x2 = (+line.getAttribute('x2') - vx) * scale;
        const y2 = (+line.getAttribute('y2') - vy) * scale;
        ctx.strokeStyle = line.getAttribute('stroke') || '#000';
        ctx.lineWidth   = (+line.getAttribute('stroke-width') || 8) * scale;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });
      return Promise.resolve(c.toDataURL('image/jpeg', 0.65));
    };

    const stampStrokes = (ctx, cw, ch) => new Promise((res) => {
      const svgEl = document.createElementNS(svgNS, 'svg');
      svgEl.setAttribute('xmlns', svgNS);
      svgEl.setAttribute('width',   String(cw));
      svgEl.setAttribute('height',  String(ch));
      svgEl.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
      svgEl.appendChild(drawGroup.cloneNode(true));
      const str  = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([str], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const img  = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, cw, ch); URL.revokeObjectURL(url); res(); };
      img.onerror = () => { URL.revokeObjectURL(url); res(); };
      img.src = url;
    });

    html2canvas(document.body, {
      useCORS:     true,
      logging:     false,
      scale:       0.35,
      x:           window.scrollX,
      y:           window.scrollY,
      width:       window.innerWidth,
      height:      window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight:window.innerHeight,
    }).then(async canvas => {
      restoreToolbars();
      await stampStrokes(canvas.getContext('2d'), canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    }).catch(() => {
      restoreToolbars();
      fallbackSvgExport().then(resolve).catch(() => reject('export-failed'));
    });
  });

  const allSendBtns = () => [drawSend, mdtSendBtn].filter(Boolean);

  const doSend = async () => {
    if (!drawGroup.querySelector('line')) {
      showToast('Draw something first!');
      return;
    }
    allSendBtns().forEach(b => { b.textContent = 'Sending\u2026'; b.disabled = true; });
    try {
      const dataUrl = await exportDrawingAsPng();
      if (typeof emailjs === 'undefined') throw new Error('emailjs not loaded');
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        drawing:   dataUrl,
        timestamp: new Date().toLocaleString()
      });
      showToast('Sent anonymously!', 6000);
    } catch (err) {
      if (err === 'empty') {
        showToast('Draw something first!');
      } else {
        showToast('Could not send — try again.');
        console.error('[draw-send]', err);
      }
    } finally {
      allSendBtns().forEach(b => { b.textContent = 'Send'; b.disabled = false; });
    }
  };

  drawSend.addEventListener('click', doSend);

  drawSvg.addEventListener('mousedown', (e) => {
    if ((!drawMode && !eraserMode) || e.button !== 0) return;
    drawing = true;
    lastPt = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  });

  drawSvg.addEventListener('mousemove', (e) => {
    if ((!drawMode && !eraserMode) || !drawing || lastPt.x === null) return;
    if (eraserMode) {
      eraseAt(e.clientX, e.clientY);
    } else {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', lastPt.x);
      line.setAttribute('y1', lastPt.y);
      line.setAttribute('x2', e.clientX);
      line.setAttribute('y2', e.clientY);
      line.setAttribute('stroke', drawColor);
      line.setAttribute('stroke-width', drawWidth);
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-linejoin', 'round');
      drawGroup.appendChild(line);
    }
    lastPt = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    drawing = false;
    lastPt = { x: null, y: null };
  });

  // --- TOUCH DRAWING (mobile) ---
  const drawLine = (x1, y1, x2, y2) => {
    if (eraserMode) {
      eraseAt(x2, y2);
      return;
    }
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', drawColor);
    line.setAttribute('stroke-width', drawWidth);
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    drawGroup.appendChild(line);
  };

  drawSvg.addEventListener('touchstart', (e) => {
    if (!drawMode && !eraserMode) return;
    e.preventDefault();
    const t = e.touches[0];
    drawing = true;
    lastPt = { x: t.clientX, y: t.clientY };
  }, { passive: false });

  drawSvg.addEventListener('touchmove', (e) => {
    if ((!drawMode && !eraserMode) || !drawing || lastPt.x === null) return;
    e.preventDefault();
    const t = e.touches[0];
    drawLine(lastPt.x, lastPt.y, t.clientX, t.clientY);
    lastPt = { x: t.clientX, y: t.clientY };
  }, { passive: false });

  drawSvg.addEventListener('touchend', () => {
    drawing = false;
    lastPt = { x: null, y: null };
  });

  // --- MOBILE DRAW TOOLBAR WIRING ---
  if (mdtCloseBtn)   mdtCloseBtn.addEventListener('click', exitDraw);
  if (mdtClearBtn)   mdtClearBtn.addEventListener('click', () => drawClear.click());
  if (mdtSendBtn)    mdtSendBtn.addEventListener('click', doSend);
  if (mdtEraserBtn)  mdtEraserBtn.addEventListener('click', () => drawEraser.click());
  if (mdtWidthInput) {
    mdtWidthInput.addEventListener('input', () => {
      drawWidth = +mdtWidthInput.value;
      drawWidthInput.value = mdtWidthInput.value;
    });
  }

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

  if (!window.matchMedia('(max-width: 768px)').matches) {
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
  }

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

  // --- BACK TO TOP ---
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  // --- ABOUT BUTTON: scroll to #about ---
  const aboutBtn = document.getElementById('about-btn');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }

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
  // --- COUNTDOWN OVERLAY ---
  // Hide only after the video finishes AND the page is fully loaded — never cut it short.
  const countdownOverlay = document.getElementById('countdown-overlay');
  if (countdownOverlay) {
    const countdownVideo = document.getElementById('countdown-video');
    let videoEnded  = false;
    let pageLoaded  = false;

    const tryHide = () => {
      if (videoEnded && pageLoaded) countdownOverlay.classList.add('hidden');
    };

    if (countdownVideo) {
      countdownVideo.play().catch(() => {});
      countdownVideo.addEventListener('ended',  () => { videoEnded = true;  tryHide(); });
      countdownVideo.addEventListener('error',  () => { videoEnded = true;  tryHide(); }); // fallback
    } else {
      videoEnded = true;
    }

    if (document.readyState === 'complete') {
      pageLoaded = true; tryHide();
    } else {
      window.addEventListener('load', () => { pageLoaded = true; tryHide(); });
    }
  }

  // Explicitly play mobile hero video — reinforces the HTML autoplay attribute
  // in browsers that require a JS-initiated play() call for inline muted video.
  const heroMobileVideo = document.querySelector('.hero-mobile-video');
  if (heroMobileVideo) heroMobileVideo.play().catch(() => {});

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
      v.src = src; v.preload = 'metadata'; v.muted = true; v.loop = true;
      v.controls = false; v.disablePictureInPicture = true;
      v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
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
        v.src = src; v.muted = true; v.loop = true;
        v.controls = false; v.disablePictureInPicture = true;
        v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
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
        images.forEach(src => preloadMedia(src));
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

    hamburger.addEventListener('click', () => {
      // Cancel any in-progress drawing stroke before opening the menu
      drawing = false;
      lastPt  = { x: null, y: null };
      openMenu();
    });
    mobileClose.addEventListener('click', closeMenu);

    mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-nav-sublink').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    const mobileDrawTrigger = document.getElementById('mobile-draw-trigger');
    if (mobileDrawTrigger) {
      mobileDrawTrigger.addEventListener('click', () => {
        closeMenu();
        drawToggle.click(); // toggles draw mode on/off
      });
    }
  }

})();
