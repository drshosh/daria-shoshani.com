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

  // --- DRAWING EXPORT HELPERS ---

  const isBlankCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const step = Math.max(1, Math.floor(Math.min(W, H) / 7));
    let whiteCount = 0, total = 0;
    for (let y = step; y < H - step; y += step) {
      for (let x = step; x < W - step; x += step) {
        const d = ctx.getImageData(x, y, 1, 1).data;
        if (d[0] > 250 && d[1] > 250 && d[2] > 250) whiteCount++;
        total++;
      }
    }
    return total === 0 || (whiteCount / total) > 0.95;
  };

  const loadImg = (src, ms = 2000) => new Promise(res => {
    if (!src) return res(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const t = setTimeout(() => res(null), ms);
    img.onload  = () => { clearTimeout(t); res(img); };
    img.onerror = () => { clearTimeout(t); res(null); };
    img.src = src;
  });

  const drawCover = (ctx, img, r, sc) => {
    if (!img || r.width <= 0 || r.height <= 0) return;
    const ir = img.naturalWidth / img.naturalHeight;
    const br = r.width / r.height;
    let sw, sh;
    if (ir > br) { sh = r.height; sw = r.height * ir; }
    else         { sw = r.width;  sh = r.width  / ir; }
    const sx = (r.width - sw) / 2, sy = (r.height - sh) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.left * sc, r.top * sc, r.width * sc, r.height * sc);
    ctx.clip();
    ctx.drawImage(img, (r.left + sx) * sc, (r.top + sy) * sc, sw * sc, sh * sc);
    ctx.restore();
  };

  const domImageCapture = async (VW, VH, sc) => {
    const c = document.createElement('canvas');
    c.width = Math.round(VW * sc); c.height = Math.round(VH * sc);
    const ctx = c.getContext('2d');
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    const SKIP = '#draw-svg,#draw-panel,#mobile-draw-toolbar,#mdt-controls-bar,#site-nav,#countdown-overlay,#draw-toast,script,style,link';
    const inVP  = r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < VH && r.right > 0 && r.left < VW;
    const clamp = r => ({ left: Math.max(0, r.left), top: Math.max(0, r.top),
                          width: Math.min(VW, r.right) - Math.max(0, r.left),
                          height: Math.min(VH, r.bottom) - Math.max(0, r.top) });
    for (const el of document.querySelectorAll('*')) {
      if (el.matches(SKIP) || el.closest(SKIP)) continue;
      const rect = el.getBoundingClientRect();
      if (!inVP(rect)) continue;
      const r = clamp(rect);
      try {
        if (el.tagName === 'IMG' && el.complete && el.naturalWidth > 0) {
          const img = await loadImg(el.currentSrc || el.src);
          if (img) ctx.drawImage(img, r.left * sc, r.top * sc, r.width * sc, r.height * sc);
        } else if (el.tagName === 'VIDEO') {
          try { ctx.drawImage(el, r.left * sc, r.top * sc, r.width * sc, r.height * sc); } catch (e) {}
        } else {
          const bgImg = getComputedStyle(el).backgroundImage;
          if (bgImg && bgImg !== 'none') {
            const m = bgImg.match(/url\(["']?([^"')]+)["']?\)/);
            if (m) {
              const img = await loadImg(m[1]);
              if (getComputedStyle(el).backgroundSize.includes('cover')) drawCover(ctx, img, r, sc);
              else if (img) ctx.drawImage(img, r.left * sc, r.top * sc, r.width * sc, r.height * sc);
            }
          }
        }
      } catch (e) {}
    }
    return c;
  };

  const stampStrokes = (canvas, sc) => {
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawGroup.querySelectorAll('line').forEach(line => {
      ctx.strokeStyle = line.getAttribute('stroke') || '#000';
      ctx.lineWidth   = (+line.getAttribute('stroke-width') || 8) * sc;
      ctx.beginPath();
      ctx.moveTo(+line.getAttribute('x1') * sc, +line.getAttribute('y1') * sc);
      ctx.lineTo(+line.getAttribute('x2') * sc, +line.getAttribute('y2') * sc);
      ctx.stroke();
    });
  };

  const strokesOnlyExport = () => {
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
    const sc = Math.min(1, 1200 / Math.max(vw, vh));
    const c = document.createElement('canvas');
    c.width = Math.round(vw * sc); c.height = Math.round(vh * sc);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    lines.forEach(line => {
      ctx.strokeStyle = line.getAttribute('stroke') || '#000';
      ctx.lineWidth   = (+line.getAttribute('stroke-width') || 8) * sc;
      ctx.beginPath();
      ctx.moveTo((+line.getAttribute('x1') - vx) * sc, (+line.getAttribute('y1') - vy) * sc);
      ctx.lineTo((+line.getAttribute('x2') - vx) * sc, (+line.getAttribute('y2') - vy) * sc);
      ctx.stroke();
    });
    return c.toDataURL('image/jpeg', 0.80);
  };

  const adaptiveCompress = (canvas) => {
    for (const q of [0.85, 0.72, 0.58, 0.45, 0.35]) {
      try {
        const url = canvas.toDataURL('image/jpeg', q);
        if ((url.length - 22) * 0.75 < 46000) return url;
      } catch (e) { break; }
    }
    return strokesOnlyExport();
  };

  const exportDrawingAsPng = async () => {
    if (!drawGroup.querySelector('line')) throw 'empty';

    const VW = window.innerWidth, VH = window.innerHeight;
    const sc = Math.min(1, 900 / Math.max(VW, VH));

    const toHide = [drawPanel, mdtToolbar, mdtControlsBar].filter(Boolean);
    toHide.forEach(el => el.style.visibility = 'hidden');

    let bgCanvas = null;
    try {
      if (typeof htmlToImage !== 'undefined') {
        const FILTER_IDS = new Set(['draw-panel', 'mobile-draw-toolbar', 'mdt-controls-bar', 'draw-svg', 'draw-toast', 'countdown-overlay', 'site-nav']);
        const filter = node => !(node.id && FILTER_IDS.has(node.id)) &&
                               !(node.classList && node.classList.contains('draw-panel'));
        bgCanvas = await Promise.race([
          htmlToImage.toCanvas(document.body, { filter, useCORS: true, cacheBust: true, width: VW, height: VH }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
        ]);
        if (isBlankCanvas(bgCanvas)) bgCanvas = null;
      }
    } catch (e) { bgCanvas = null; }

    if (!bgCanvas) {
      bgCanvas = await domImageCapture(VW, VH, sc);
    } else if (sc < 1) {
      const scaled = document.createElement('canvas');
      scaled.width  = Math.round(VW * sc);
      scaled.height = Math.round(VH * sc);
      scaled.getContext('2d').drawImage(bgCanvas, 0, 0, scaled.width, scaled.height);
      bgCanvas = scaled;
    }

    toHide.forEach(el => el.style.visibility = '');
    stampStrokes(bgCanvas, sc);
    return adaptiveCompress(bgCanvas);
  };

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
      countdownVideo.muted = true;
      countdownVideo.setAttribute('playsinline', '');
      countdownVideo.setAttribute('webkit-playsinline', '');
      countdownVideo.play().catch(() => {
        countdownOverlay.style.cursor = 'pointer';
        countdownOverlay.addEventListener('click', () => {
          countdownOverlay.style.cursor = '';
          countdownVideo.play();
        }, { once: true });
      });
      countdownVideo.addEventListener('ended', () => { videoEnded = true; tryHide(); });
      countdownVideo.addEventListener('error', () => { videoEnded = true; tryHide(); });
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
      v.controls = true;
      v.autoplay = false;
      lbMedia.appendChild(v);
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
        const isMobile = window.innerWidth <= 768;
        const bgRaw = (isMobile && card.dataset.bgMobile) ? card.dataset.bgMobile : card.dataset.bg;
        const bgList = bgRaw ? JSON.parse(bgRaw) : [];
        bgList.forEach(src => preloadBgVideo(src));
        const raw = (isMobile && card.dataset.imagesMobile) ? card.dataset.imagesMobile : card.dataset.images;
        JSON.parse(raw).forEach(src => preloadMedia(src));
      } catch(e) {}
    }, { once: true });

    card.querySelector('.work-img-wrap').addEventListener('click', () => {
      try {
        const isMobile = window.innerWidth <= 768;
        const raw = (isMobile && card.dataset.imagesMobile) ? card.dataset.imagesMobile : card.dataset.images;
        const images = JSON.parse(raw);
        const bgRaw = (isMobile && card.dataset.bgMobile) ? card.dataset.bgMobile : card.dataset.bg;
        const bgList = bgRaw ? JSON.parse(bgRaw) : [];
        if (images.length) openLb(images, 0, bgList);
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

// ── ARCHIVE LOTTERY ──
(function () {
  const FLICKER_INTERVAL = 50;
  const FLICKER_DURATION = 1200;

    const ARCHIVE_IMAGES = [
    "Images/random%20image/01F904CF-3D5E-4202-BB6F-BC02CAC18324.jpg",
    "Images/random%20image/040644B0-F134-4C9E-8FC9-B4D6EECFDF79.jpg",
    "Images/random%20image/084B03A6-4E59-4113-B6CD-6C59B5A03CD0.jpg",
    "Images/random%20image/0E8EB3B5-420A-47B0-A554-D29165BEAEBF.jpg",
    "Images/random%20image/0RFmovJA.jpg",
    "Images/random%20image/1.jpg",
    "Images/random%20image/10.jpg",
    "Images/random%20image/10.png",
    "Images/random%20image/1000029999.jpg",
    "Images/random%20image/1000030003.jpg",
    "Images/random%20image/11.png",
    "Images/random%20image/12.png",
    "Images/random%20image/13.png",
    "Images/random%20image/14.png",
    "Images/random%20image/144440.jpg",
    "Images/random%20image/15.png",
    "Images/random%20image/155555555550%202.jpg",
    "Images/random%20image/15ABC8E7-1BB5-48E3-B29F-4BF86566CFCE.jpg",
    "Images/random%20image/16.jpg",
    "Images/random%20image/16.png",
    "Images/random%20image/17FB4BAB-A5B3-47B6-B1AF-2E9D5591E7D5.jpg",
    "Images/random%20image/189822941_4757410577608361_5863556167050073642_n.jpg",
    "Images/random%20image/2.JPG",
    "Images/random%20image/2.png",
    "Images/random%20image/20220517-DSC03723.JPG",
    "Images/random%20image/20240619_171155.jpg",
    "Images/random%20image/20240621_105336.jpg",
    "Images/random%20image/217217.JPG",
    "Images/random%20image/220220.JPG",
    "Images/random%20image/222.JPG",
    "Images/random%20image/2222.jpg",
    "Images/random%20image/22222.jpg",
    "Images/random%20image/25.jpg",
    "Images/random%20image/2E864A13-C652-43BB-BDEA-5D69941427C2.jpg",
    "Images/random%20image/2FA7AF9C-7C97-4872-A7DC-D1CECC65686C.png",
    "Images/random%20image/2FA7AF9C-7C97-4872-A7DC-D1CECC65686C11.png",
    "Images/random%20image/2FA7AF9C-7C97-4872-A7DC-D1CECC65686C1111.png",
    "Images/random%20image/2FA7AF9C-7C97-4872-A7DC-D1CECC65686C2.png",
    "Images/random%20image/2b72d435-98de-4783-ac96-668db4f59f94.jpeg",
    "Images/random%20image/3.png",
    "Images/random%20image/305013753_5123716904406951_8486950662285550207_n.jpg",
    "Images/random%20image/31A200F3-8D11-4D97-AB2C-2B4031928025.jpg",
    "Images/random%20image/335b6f0d-7e18-401a-a568-441303e61b7b.jpg",
    "Images/random%20image/34.jpg",
    "Images/random%20image/371E1BCB-F8B8-4995-BFCA-CA700D15CA4B.JPG",
    "Images/random%20image/3FFED338-D726-402E-A40F-551D65127C01.jpg",
    "Images/random%20image/4%202.png",
    "Images/random%20image/4.jpeg",
    "Images/random%20image/4.jpg",
    "Images/random%20image/4306535D-AE31-462F-975F-05E625B5FB95.jpg",
    "Images/random%20image/444F2A51-A8DF-40D3-B1C5-6ADBD7B8F9E2.jpg",
    "Images/random%20image/445AF8F4-46FF-4CEE-B329-A52EB3DD38FB.jpg",
    "Images/random%20image/471D62E3-3ECF-4A3E-993F-29CE50746D36_Original.jpg",
    "Images/random%20image/473229339_910826921135776_4401412123490169757_n.jpg",
    "Images/random%20image/5.jpg",
    "Images/random%20image/5.png",
    "Images/random%20image/5DDC52E8-DFF2-48A3-B3AE-59B2A8CD34DB.jpg",
    "Images/random%20image/5EE85452-15D9-4A9A-AC56-F596EF28C09A.jpg",
    "Images/random%20image/5FA36EAC-B447-4184-BCCB-176582AB20C0.jpg",
    "Images/random%20image/6%202.jpg",
    "Images/random%20image/6%202.png",
    "Images/random%20image/6.png",
    "Images/random%20image/7.png",
    "Images/random%20image/768ADB34-5F9F-4724-9075-EB86E06267C8.jpg",
    "Images/random%20image/79E18ADB-D673-4638-B0B7-C1F8C561FCEA.jpeg",
    "Images/random%20image/8.D4_image_50806529.JPG",
    "Images/random%20image/8.png",
    "Images/random%20image/83145837_2720512984710392_3205651920584704_o.jpg",
    "Images/random%20image/8E8CA807-B0B1-4912-A114-6C9CE840646B.jpg",
    "Images/random%20image/9.png",
    "Images/random%20image/915B585C-F8C5-412F-B978-04896D1002D1.jpg",
    "Images/random%20image/9C8952E0-8C7D-4632-B499-4AB857540A56.jpg",
    "Images/random%20image/A%20MAP.png",
    "Images/random%20image/A6D9FC15-947B-4DED-A1D3-5BF8007BE3C5.jpg",
    "Images/random%20image/A7A99BFC-1CFE-41AF-83E7-5030F2ED8907.jpg",
    "Images/random%20image/B0BE8E22-2ECB-47C7-BA55-E5734CF82215.jpeg",
    "Images/random%20image/B65A2E5D-DE5F-4D95-96EC-AAFB50133E46.jpg",
    "Images/random%20image/B7835D69-1545-465A-A4E6-9374B5710EA7.jpg",
    "Images/random%20image/C76F3F07-50C3-44AF-9F38-8BB976EBF85A.jpg",
    "Images/random%20image/C7933753-A82E-4201-A622-7D250087E504.png",
    "Images/random%20image/CCA931A5-EF7C-4247-9D76-AEA2A67C7192.jpg",
    "Images/random%20image/CamScanner%2011-18-2023%2017.17_page-0001.jpg",
    "Images/random%20image/Cf9SyTAg.jpg",
    "Images/random%20image/D2B7D0C5-D85A-4A4D-BE92-FAD4656E8DD1.jpg",
    "Images/random%20image/D2C956C6-5460-450D-8FA0-294FFF7B1363.jpg",
    "Images/random%20image/D9D28B29-7D66-4551-8EA1-3B47CE543168.jpg",
    "Images/random%20image/DARIA%20SHOSHANI.jpg",
    "Images/random%20image/DARIA.SHOSHANI.STANDING.jpg",
    "Images/random%20image/DARIA.SHOSHANI.STANDING1.jpg",
    "Images/random%20image/DBE98B2F-AA3C-4005-BE3D-92E3C2EC2019.jpg",
    "Images/random%20image/DCDD80E9-6C46-48CD-A445-4FADE116DE0C.jpg",
    "Images/random%20image/DE9E6168-CBBA-4D40-BFAF-53CAF80F8E17.jpg",
    "Images/random%20image/DSC03088.jpg",
    "Images/random%20image/DSC03090.jpg",
    "Images/random%20image/DSC03185-Enhanced-NR.jpg",
    "Images/random%20image/DSC03238.jpg",
    "Images/random%20image/DSC03547.jpg",
    "Images/random%20image/DSC03550.jpg",
    "Images/random%20image/DSC03555.jpg",
    "Images/random%20image/DSC03556.jpg",
    "Images/random%20image/DSC03562.jpg",
    "Images/random%20image/DSC03565.jpg",
    "Images/random%20image/DSC06626.jpg",
    "Images/random%20image/DSC_0082.jpeg",
    "Images/random%20image/EutGvc1w.jpg",
    "Images/random%20image/F19437F7-E2A2-4EEC-8D0B-BA056717139F.jpg",
    "Images/random%20image/F62B1DCF-4100-4BA2-838E-F0CA841CF959.jpg",
    "Images/random%20image/F9F6DE19-A163-4DDC-A7D4-AC7C3F58FC4E.jpg",
    "Images/random%20image/HUGE.jpeg",
    "Images/random%20image/IMG_0115.jpg",
    "Images/random%20image/IMG_0121.jpg",
    "Images/random%20image/IMG_0123.JPG",
    "Images/random%20image/IMG_0154.JPG",
    "Images/random%20image/IMG_0257.jpg",
    "Images/random%20image/IMG_0258.JPG",
    "Images/random%20image/IMG_0298.JPG",
    "Images/random%20image/IMG_0300.JPG",
    "Images/random%20image/IMG_0310.jpg",
    "Images/random%20image/IMG_0316.jpg",
    "Images/random%20image/IMG_0362.jpeg",
    "Images/random%20image/IMG_0363.jpg",
    "Images/random%20image/IMG_0382.jpg",
    "Images/random%20image/IMG_0511.jpeg",
    "Images/random%20image/IMG_0601.jpg",
    "Images/random%20image/IMG_0676.jpg",
    "Images/random%20image/IMG_0834.jpeg",
    "Images/random%20image/IMG_0851.JPG",
    "Images/random%20image/IMG_0852%281%29.JPG",
    "Images/random%20image/IMG_1425.jpg",
    "Images/random%20image/IMG_1426.jpg",
    "Images/random%20image/IMG_1427.jpg",
    "Images/random%20image/IMG_1500.jpeg",
    "Images/random%20image/IMG_1501.jpeg",
    "Images/random%20image/IMG_1539.jpeg",
    "Images/random%20image/IMG_1738.JPG",
    "Images/random%20image/IMG_1783.png",
    "Images/random%20image/IMG_20211215_103312_586.jpg",
    "Images/random%20image/IMG_20211231_182439_353.jpg",
    "Images/random%20image/IMG_20220211_120710_258.jpg",
    "Images/random%20image/IMG_20220315_131508.jpg",
    "Images/random%20image/IMG_20220325_215534_937.jpg",
    "Images/random%20image/IMG_20220417_114142_109.jpg",
    "Images/random%20image/IMG_20220526_212749_729.jpg",
    "Images/random%20image/IMG_20220526_212749_815.jpg",
    "Images/random%20image/IMG_2045.JPG",
    "Images/random%20image/IMG_2100.jpg",
    "Images/random%20image/IMG_2102.jpg",
    "Images/random%20image/IMG_2103.jpg",
    "Images/random%20image/IMG_2105.jpg",
    "Images/random%20image/IMG_2106.jpg",
    "Images/random%20image/IMG_2107.jpg",
    "Images/random%20image/IMG_2202.jpeg",
    "Images/random%20image/IMG_2207.jpg",
    "Images/random%20image/IMG_2214.jpg",
    "Images/random%20image/IMG_2218.jpg",
    "Images/random%20image/IMG_2221.jpg",
    "Images/random%20image/IMG_2271.jpg",
    "Images/random%20image/IMG_2375.jpeg",
    "Images/random%20image/IMG_2652.jpg",
    "Images/random%20image/IMG_2872.jpg",
    "Images/random%20image/IMG_2874.jpg",
    "Images/random%20image/IMG_2922.jpeg",
    "Images/random%20image/IMG_3105.jpg",
    "Images/random%20image/IMG_3139.JPG",
    "Images/random%20image/IMG_3332.jpg",
    "Images/random%20image/IMG_3854.jpg",
    "Images/random%20image/IMG_4064.jpg",
    "Images/random%20image/IMG_4089.jpg",
    "Images/random%20image/IMG_4095.jpg",
    "Images/random%20image/IMG_4104.jpg",
    "Images/random%20image/IMG_4503.jpeg",
    "Images/random%20image/IMG_5252.jpg",
    "Images/random%20image/IMG_5254.jpeg",
    "Images/random%20image/IMG_5958.JPG",
    "Images/random%20image/IMG_6032.jpg",
    "Images/random%20image/IMG_6033.jpg",
    "Images/random%20image/IMG_6034.jpg",
    "Images/random%20image/IMG_6036.jpg",
    "Images/random%20image/IMG_6037.jpg",
    "Images/random%20image/IMG_6038.jpg",
    "Images/random%20image/IMG_6200.jpg",
    "Images/random%20image/IMG_6548.JPG",
    "Images/random%20image/IMG_6605%20%282%29.JPG",
    "Images/random%20image/IMG_6611.JPG",
    "Images/random%20image/IMG_6735.jpg",
    "Images/random%20image/IMG_6775.JPG",
    "Images/random%20image/IMG_6951.PNG",
    "Images/random%20image/IMG_7072.JPG",
    "Images/random%20image/IMG_7110.JPG",
    "Images/random%20image/IMG_7642.PNG",
    "Images/random%20image/IMG_7886.jpg",
    "Images/random%20image/IMG_7898.jpg",
    "Images/random%20image/IMG_8220.png",
    "Images/random%20image/IMG_9057.JPG",
    "Images/random%20image/IMG_9205.JPG",
    "Images/random%20image/Image%20%2811%29.jpg",
    "Images/random%20image/Image%20%2813%29.jpg",
    "Images/random%20image/Image%20%285%29.jpg",
    "Images/random%20image/Jerusalem%20I%20love%20you%20but%20youre%20bringing%20me%20down.jpg",
    "Images/random%20image/JyXhVe2g.jpg",
    "Images/random%20image/Kp6ExrFw.jpg",
    "Images/random%20image/LongTimeNoSee-wasserwasser-InstallationView-HighRes-20.jpg",
    "Images/random%20image/LongTimeNoSee-wasserwasser-Works-HighRes-20.jpg",
    "Images/random%20image/STARS.jpg",
    "Images/random%20image/Sad%20Cats.png",
    "Images/random%20image/Schermata%202024-01-18%20alle%2018.25.21.png",
    "Images/random%20image/Schermata%202024-01-18%20alle%2018.26.29.png",
    "Images/random%20image/Schermata%202024-01-18%20alle%2018.30.06.png",
    "Images/random%20image/Screen%20Shot%202021-12-12%20at%2014.42.49.png",
    "Images/random%20image/Screensho3.png",
    "Images/random%20image/Teaser%20Dancing.mp4",
    "Images/random%20image/Teaser%20Shakehand.mp4",
    "Images/random%20image/Teaser%20Split.mp4",
    "Images/random%20image/Teaser%20scared.mp4",
    "Images/random%20image/Unbenanntes_Projekt%2811%29.png",
    "Images/random%20image/Unstable%20Realities_Maxxi_26.06.2024_Marta%20Ferro_200.jpg",
    "Images/random%20image/Unstable%20Realities_Maxxi_26.06.2024_Marta%20Ferro_208.jpg",
    "Images/random%20image/Untitled_Artwork.JPG",
    "Images/random%20image/Untitled_Page_01.png",
    "Images/random%20image/Untitled_Page_02.png",
    "Images/random%20image/Untitled_Page_03.png",
    "Images/random%20image/Untitled_Page_04.png",
    "Images/random%20image/Untitled_Page_05.png",
    "Images/random%20image/Untitled_Page_06.png",
    "Images/random%20image/Untitled_Page_07.png",
    "Images/random%20image/Untitled_Page_08.png",
    "Images/random%20image/Untitled_Page_09.png",
    "Images/random%20image/Untitled_Page_10.png",
    "Images/random%20image/VINYL_MOCKUP_FRONT.jpg",
    "Images/random%20image/VINYL_MOCKUP_back.jpg",
    "Images/random%20image/_MG_0006-HDR.JPG",
    "Images/random%20image/adam.png",
    "Images/random%20image/bN1c8bjQ.jpg",
    "Images/random%20image/carborundum.png",
    "Images/random%20image/choose%20a%20door.jpg",
    "Images/random%20image/crop%20crop.jpeg",
    "Images/random%20image/dance%20better%20q.mp4",
    "Images/random%20image/daria%20L2S_1.2.jpg",
    "Images/random%20image/daria%20LS_1.2.jpg",
    "Images/random%20image/daria%20LS_1.4.jpg",
    "Images/random%20image/daria%20for%20cinema%20spigel_.jpg",
    "Images/random%20image/daria_centanni_31.jpg",
    "Images/random%20image/daria_centanni_32.jpg",
    "Images/random%20image/edited.png",
    "Images/random%20image/family.jpg",
    "Images/random%20image/image_67193345.JPG",
    "Images/random%20image/image_67239169.JPG.jpg",
    "Images/random%20image/kiss%20kiss%20back.png",
    "Images/random%20image/kiss%20kiss%20front.png",
    "Images/random%20image/longtimenosee_announcement-wasserwasser.jpg",
    "Images/random%20image/paperpaintings-2.jpg",
    "Images/random%20image/screenshot.png",
    "Images/random%20image/screenshot2.png",
    "Images/random%20image/talented%20back.png",
    "Images/random%20image/%D7%90%D7%94%D7%91%D7%94%D7%90%D7%94%D7%91%D7%94.jpeg",
    "Images/random%20image/%D7%90%D7%A8%D7%99%D7%94.jpg",
    "Images/random%20image/%D7%92%D7%93%D7%A8%D7%94.jpg",
    "Images/random%20image/%D7%92%D7%99%D7%93%D7%99.png",
    "Images/random%20image/%D7%94%D7%93%D7%A4%D7%A1%20%D7%A2%D7%98%D7%9C%D7%A3.jpg",
    "Images/random%20image/%D7%99%D7%94%D7%9C%D7%99%20%D7%91%D7%9B%D7%97%D7%95%D7%9C.jpeg",
    "Images/random%20image/%D7%99%D7%94%D7%9C%D7%99%20%D7%99%D7%A9%D7%9F_.jpg",
    "Images/random%20image/%D7%99%D7%A0%D7%A9%D7%95%D7%9C%202.jpg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%201.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%2017.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%203.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%2031.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%2045.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%2047.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%2048.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%95%D7%A7%2058.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20220203%20%282%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20240802%20%282%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20240803%20%283%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20240803%20%284%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20240803%20%288%29.jpg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%28130%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2822%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2827%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2828%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2833%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2834%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2841%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2843%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2845%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2846%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2847%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%285%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2853%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2859%29.jpeg",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2862%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2863%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2864%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2865%29.png",
    "Images/random%20image/%D7%A1%D7%A8%D7%99%D7%A7%D7%94_20260324%20%2875%29.png",
    "Images/random%20image/%D7%A2%D7%95%D7%AA%D7%A7%20%D7%A9%D7%9C%20IMG_6459.jpg",
    "Images/random%20image/%D7%A2%D7%95%D7%AA%D7%A7%20%D7%A9%D7%9C%20%D7%A6%D7%99%D7%9C%D7%95%D7%9D%20%D7%9E%D7%A1%D7%9A%202020_.04_.25%20%D7%91_.16.25.17%20%282%29.png",
    "Images/random%20image/%D7%A2%D7%95%D7%AA%D7%A7%20%D7%A9%D7%9C%20%D7%A6%D7%99%D7%9C%D7%95%D7%9D%20%D7%9E%D7%A1%D7%9A%202020_.04_.25%20%D7%91_.16.27.33.png",
    "Images/random%20image/%D7%A2%D7%95%D7%AA%D7%A7%20%D7%A9%D7%9C%20%D7%A6%D7%99%D7%9C%D7%95%D7%9D%20%D7%9E%D7%A1%D7%9A%202020_.04_.25%20%D7%91_.16.27.43%20%282%29.png",
    "Images/random%20image/%D7%A2%D7%95%D7%AA%D7%A7%20%D7%A9%D7%9C%20%D7%A6%D7%99%D7%9C%D7%95%D7%9D%20%D7%9E%D7%A1%D7%9A%202020_.04_.25%20%D7%91_.16.31.46%20%282%29.png",
    "Images/random%20image/%D7%A2%D7%9B%D7%91%D7%A8%D7%99%D7%9D%20%D7%91%D7%AA%D7%A7%D7%A8%D7%94%20%D7%A9%D7%9C%D7%99.jpg",
    "Images/random%20image/%D7%A2%D7%A8%D7%95%D7%9A.jpg",
    "Images/random%20image/%D7%A4%D7%97%D7%95%D7%AA%20%D7%9B%D7%91%D7%93.jpg",
    "Images/random%20image/%D7%A5.jpg",
    "Images/random%20image/%D7%AA.jpg",
    "Images/random%20image/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%A9%D7%9C%20WhatsApp%202023-12-17%20%D7%91%D7%A9%D7%A2%D7%94%2021.42.44_806c6bca.jpg",
    "Images/random%20image/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%A9%D7%9C%20WhatsApp%202025-06-19%20%D7%91%D7%A9%D7%A2%D7%94%2017.04.06_48ba1629.jpg",
    "Images/random%20image/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%A9%D7%9C%20WhatsApp%202025-09-24%20%D7%91%D7%A9%D7%A2%D7%94%2015.40.53_33f817a8.jpg",
    "Images/random%20image/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%A9%D7%9C%20WhatsApp%202025-09-24%20%D7%91%D7%A9%D7%A2%D7%94%2015.40.53_95380b24.jpg",
    "Images/random%20image/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%A9%D7%9C%20WhatsApp%202025-09-24%20%D7%91%D7%A9%D7%A2%D7%94%2015.40.57_a696bf18.jpg",
    "Images/random%20image/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%A9%D7%9C%20WhatsApp%202025-09-24%20%D7%91%D7%A9%D7%A2%D7%94%2015.40.58_2b6095d6.jpg"
  ];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let deck = shuffle([...ARCHIVE_IMAGES]);
  let pointer = 0;

  function nextImage() {
    if (pointer >= deck.length) {
      deck = shuffle([...ARCHIVE_IMAGES]);
      pointer = 0;
    }
    return deck[pointer++];
  }

  const FLICKER_POOL_SIZE = 14;

  function isVideo(src) {
    return /\.mp4$/i.test(src);
  }

  // Images-only pool for the flicker animation
  function pickPoolSrcs() {
    const images = ARCHIVE_IMAGES.filter(s => !isVideo(s));
    return shuffle([...images]).slice(0, FLICKER_POOL_SIZE);
  }

  // Preloads image srcs; resolves with src on success, null on failure (skips videos)
  function preload(srcs) {
    return Promise.all(srcs.map(src => new Promise(resolve => {
      if (isVideo(src)) { resolve(src); return; }
      const i = new Image();
      i.onload  = () => resolve(src);
      i.onerror = () => resolve(null);
      i.src = src;
    })));
  }

  // Show image or video in the archive frame
  function showMedia(img, video, src) {
    if (isVideo(src)) {
      img.style.display = 'none';
      video.style.display = 'block';
      video.src = src;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.removeAttribute('src');
      video.style.display = 'none';
      img.style.display = 'block';
      img.src = src;
    }
  }

  function runFlicker(img, video, btn, pool, chosen) {
    let frame = 0;
    const start = Date.now();
    const timer = setInterval(() => {
      img.src = pool[frame % pool.length];
      frame++;
      if (Date.now() - start >= FLICKER_DURATION) {
        clearInterval(timer);
        showMedia(img, video, chosen);
        btn.disabled = false;
      }
    }, FLICKER_INTERVAL);
  }

  function bgPreload(srcs) {
    let i = 0;
    const next = () => { if (i < srcs.length) { new Image().src = srcs[i++]; setTimeout(next, 30); } };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(next);
    } else {
      setTimeout(next, 1500);
    }
  }

  function initArchive() {
    const img   = document.getElementById('archive-img');
    const video = document.getElementById('archive-video');
    const btn   = document.getElementById('archive-btn');
    if (!img || !btn || !ARCHIVE_IMAGES.length) return;

    showMedia(img, video, nextImage());

    // Warm image cache in background (videos excluded)
    bgPreload(shuffle([...ARCHIVE_IMAGES.filter(s => !isVideo(s))]).slice(0, 60));

    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      btn.disabled = true;
      const chosen = nextImage();
      const pool = pickPoolSrcs();

      preload([...pool, chosen]).then(results => {
        const loaded = new Set(results.filter(Boolean));
        const validPool = pool.filter(s => loaded.has(s));
        const validChosen = loaded.has(chosen) ? chosen : (validPool[0] || null);
        if (!validPool.length || !validChosen) { btn.disabled = false; return; }
        runFlicker(img, video, btn, validPool, validChosen);
      });
    });
  }

  initArchive();
})();
