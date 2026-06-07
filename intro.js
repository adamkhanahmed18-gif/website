/* ============================================================
   ARTISAN CAKERY — Cinematic Canvas Intro
   4 hand-drawn animated scenes: mixing → jam → icing → bird's eye
   ============================================================ */
(function () {
  const introEl = document.getElementById('intro-sequence');
  if (!introEl) return;

  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Palette
  const BG    = '#0d0608';
  const PINK  = '#E8457A';
  const GOLD  = '#D4A843';
  const CREAM = '#FFF8F3';

  // Easings
  const eOut   = t => 1 - Math.pow(1 - t, 3);
  const eInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  const eBack  = t => { const c = 1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); };

  /* ─────────────────────────────────────────────────────────────
     SCENE 1 — Mixing bowl with spinning whisk & flour particles
  ───────────────────────────────────────────────────────────── */
  function scene1(t, a) {
    const cx = W/2, cy = H/2 + 20;
    const bw = Math.min(W*0.28, 220);
    const bh = bw * 0.55;

    // Bowl shadow
    ctx.save();
    ctx.globalAlpha = a * 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx, cy + bh*0.48 + 18, bw*0.52, 16, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    const appear = eOut(Math.min(t * 5, 1));

    // Batter filling the bowl
    const batFill = eOut(Math.min(t * 1.8, 1));
    ctx.save();
    ctx.globalAlpha = a * appear;
    // Clip to bowl interior shape
    ctx.beginPath();
    ctx.moveTo(cx - bw*0.47, cy - bh*0.26);
    ctx.bezierCurveTo(cx - bw*0.5, cy + bh*0.42, cx + bw*0.5, cy + bh*0.42, cx + bw*0.47, cy - bh*0.26);
    ctx.closePath();
    ctx.clip();
    const batTop = cy + bh*0.38 - bh*0.78 * batFill;
    const bg = ctx.createLinearGradient(cx, batTop, cx, cy + bh*0.4);
    bg.addColorStop(0, '#D09060');
    bg.addColorStop(1, '#8B4E28');
    ctx.fillStyle = bg;
    ctx.fillRect(cx - bw, batTop - 4, bw*2, bh*1.5);
    ctx.restore();

    // Bowl walls
    ctx.save();
    ctx.globalAlpha = a * appear;
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255,248,243,0.03)';
    ctx.beginPath();
    ctx.moveTo(cx - bw*0.5, cy - bh*0.27);
    ctx.bezierCurveTo(cx - bw*0.52, cy + bh*0.44, cx + bw*0.52, cy + bh*0.44, cx + bw*0.5, cy - bh*0.27);
    ctx.fill();
    ctx.stroke();
    // Rim ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy - bh*0.27, bw*0.5, bh*0.145, 0, 0, Math.PI*2);
    ctx.stroke();
    // Inner rim highlight
    ctx.globalAlpha = a * appear * 0.35;
    ctx.strokeStyle = 'rgba(255,248,243,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy - bh*0.27, bw*0.46, bh*0.12, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Whisk
    const wAppear = eOut(Math.min(t * 6, 1));
    ctx.save();
    ctx.globalAlpha = a * wAppear;
    const wx = cx + bw*0.06;
    const wy = cy - bh*0.08;
    const wlen = bh * 0.72;
    const rot  = t * Math.PI * 10;

    // Handle
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(wx, wy - bh*0.82);
    ctx.lineTo(wx, wy - wlen*0.28);
    ctx.stroke();

    // Wires (8 wires forming whisk teardrop)
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#cccccc';
    for (let i = 0; i < 8; i++) {
      const angle = (i/8)*Math.PI*2 + rot;
      const ox = Math.cos(angle) * 16;
      ctx.beginPath();
      ctx.moveTo(wx + ox*0.15, wy - wlen*0.28);
      ctx.bezierCurveTo(wx+ox, wy+wlen*0.1, wx+ox, wy+wlen*0.55, wx+ox*0.08, wy+wlen*0.72);
      ctx.stroke();
    }
    // Centre tip
    ctx.fillStyle = '#bbb';
    ctx.beginPath();
    ctx.arc(wx, wy + wlen*0.72, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Flour particles floating up
    const pTime = t * 2.8;
    for (let i = 0; i < 22; i++) {
      const s = i * 113.7;
      const ph = ((pTime + i*0.22) % 1);
      const px = cx + Math.sin(s)*bw*0.46 + Math.cos(pTime + s)*18;
      const py = cy - bh*0.15 - ph*70 + Math.sin(s*2)*12;
      const pa = Math.sin(ph * Math.PI) * 0.55;
      ctx.save();
      ctx.globalAlpha = a * pa;
      ctx.fillStyle = CREAM;
      ctx.beginPath();
      ctx.arc(px, py, 1.8 + Math.sin(s*3)*1.5, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    // Ambient warm glow at base
    ctx.save();
    ctx.globalAlpha = a * 0.12 * batFill;
    const glow = ctx.createRadialGradient(cx, cy+bh*0.3, 0, cx, cy+bh*0.3, bw*0.7);
    glow.addColorStop(0, '#D09060');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy+bh*0.3, bw*0.7, bh*0.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     SCENE 2 — Top-down sponge layer, jam spreads with spatula
  ───────────────────────────────────────────────────────────── */
  function scene2(t, a) {
    const cx = W/2, cy = H/2;
    const cr = Math.min(W, H) * 0.27;

    // Plate shadow
    ctx.save();
    ctx.globalAlpha = a * 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx+8, cy+12, cr*1.1, cr*1.1, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Plate rim
    ctx.save();
    ctx.globalAlpha = a * 0.3;
    ctx.strokeStyle = 'rgba(255,248,243,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cr*1.18, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Sponge surface
    const spongeA = eOut(Math.min(t*5, 1));
    ctx.save();
    ctx.globalAlpha = a * spongeA;
    const sg = ctx.createRadialGradient(cx-cr*0.2, cy-cr*0.2, 0, cx, cy, cr);
    sg.addColorStop(0, '#D8A070');
    sg.addColorStop(0.65, '#B07540');
    sg.addColorStop(1, '#8A5020');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI*2);
    ctx.fill();
    // Crumb texture lines
    ctx.globalAlpha = a * spongeA * 0.25;
    ctx.strokeStyle = 'rgba(120,60,20,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const r2 = cr * (i+1)/7;
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();

    // Jam sweeping as a growing arc sector
    const jamP = eInOut(Math.max(0, Math.min((t - 0.18)*1.55, 1)));
    if (jamP > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, cr*0.985, 0, Math.PI*2);
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, cr, -Math.PI/2, -Math.PI/2 + Math.PI*2*jamP);
      ctx.closePath();
      const jg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      jg.addColorStop(0, 'rgba(175,22,42,0.88)');
      jg.addColorStop(0.55, 'rgba(192,28,52,0.85)');
      jg.addColorStop(1, 'rgba(148,10,28,0.82)');
      ctx.fillStyle = jg;
      ctx.globalAlpha = a;
      ctx.fill();
      // Jam sheen
      ctx.globalAlpha = a * 0.3;
      ctx.strokeStyle = 'rgba(255,100,120,0.4)';
      ctx.lineWidth = cr * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, cr*0.5, -Math.PI/2, -Math.PI/2 + Math.PI*2*jamP);
      ctx.stroke();
      ctx.restore();
    }

    // Spatula rotating at jam edge
    if (jamP > 0.02 && jamP < 0.98) {
      const angle = -Math.PI/2 + Math.PI*2*jamP;
      const sx = cx + Math.cos(angle)*cr*0.95;
      const sy = cy + Math.sin(angle)*cr*0.95;
      ctx.save();
      ctx.globalAlpha = a * 0.88;
      ctx.translate(sx, sy);
      ctx.rotate(angle + Math.PI/2);
      // Blade
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -cr*0.42);
      ctx.lineTo(0, cr*0.42);
      ctx.stroke();
      // Handle
      ctx.strokeStyle = '#c0a880';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, cr*0.42);
      ctx.lineTo(0, cr*0.78);
      ctx.stroke();
      ctx.restore();
    }

    // Edge highlight
    ctx.save();
    ctx.globalAlpha = a * 0.22;
    ctx.strokeStyle = 'rgba(255,220,180,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     SCENE 3 — Side-view tiered cake, frosting applied upward
  ───────────────────────────────────────────────────────────── */
  function scene3(t, a) {
    const cx = W/2;
    const u  = Math.min(W, H) * 0.011;
    const tiers = [
      { w: u*22, h: u*11, delay: 0.00 },
      { w: u*15, h: u*9.5, delay: 0.18 },
      { w: u*9.5, h: u*8.5, delay: 0.36 },
    ];
    // Y positions (bottom of each tier, stacked up)
    const baseY = H/2 + tiers.reduce((s,ti)=>s+ti.h,0)*0.5 + 30;
    const tierY = [];
    let yy = baseY;
    for (const ti of tiers) { tierY.push(yy); yy -= ti.h + 2; }

    ctx.save();
    ctx.globalAlpha = a;

    tiers.forEach((ti, i) => {
      const p = eOut(Math.max(0, Math.min((t - ti.delay)*4, 1)));
      if (p <= 0) return;
      const x  = cx, y = tierY[i];
      const tw = ti.w, th = ti.h;

      // Sponge layers (3 alternating)
      ctx.globalAlpha = a * p;
      const nL = 3;
      for (let l = 0; l < nL; l++) {
        const lh = th / nL;
        const ly = y - th + l*lh;
        ctx.fillStyle = l%2===0 ? '#C88050' : '#9A5C30';
        ctx.fillRect(cx - tw/2, ly, tw, lh);
        // Jam/cream stripe between layers
        if (l < nL-1) {
          ctx.fillStyle = l===0 ? 'rgba(165,22,42,0.65)' : 'rgba(255,248,243,0.5)';
          ctx.fillRect(cx - tw/2, ly + lh - 2, tw, 4);
        }
      }

      // Frosting builds up from bottom
      const fp = eInOut(Math.max(0, Math.min((t - ti.delay - 0.08)*3.5, 1)));
      if (fp > 0) {
        const fh = th * fp;
        const fy = y - fh;
        const fg = ctx.createLinearGradient(cx-tw/2, fy, cx+tw/2, y);
        fg.addColorStop(0, '#FFFFFF');
        fg.addColorStop(0.5,'#FFF4EC');
        fg.addColorStop(1, '#EEE0D0');
        ctx.fillStyle = fg;
        ctx.globalAlpha = a * p;
        ctx.fillRect(cx-tw/2, fy, tw, fh);

        // Horizontal brush stroke texture
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let s=1; s<6; s++) {
          const sy2 = fy + fh*(s/6);
          ctx.beginPath();
          ctx.moveTo(cx-tw/2+3, sy2);
          ctx.lineTo(cx+tw/2-3, sy2 + (s%2===0?2:-2));
          ctx.stroke();
        }

        // Piped rosettes at bottom of each tier
        if (fp > 0.7) {
          const rP = eBack(Math.min((fp-0.7)/0.3, 1));
          ctx.globalAlpha = a * p * rP;
          ctx.fillStyle = '#fff';
          const nR = Math.floor(tw / 14);
          for (let ri=0; ri<nR; ri++) {
            const rx = cx - tw/2 + 7 + ri*14;
            // Rosette: 3 overlapping ellipses
            for (let petal=0; petal<5; petal++) {
              const pa = (petal/5)*Math.PI*2;
              ctx.beginPath();
              ctx.ellipse(rx+Math.cos(pa)*4, y-5+Math.sin(pa)*4, 4, 2.5, pa, 0, Math.PI*2);
              ctx.fill();
            }
            ctx.fillStyle = GOLD;
            ctx.beginPath();
            ctx.arc(rx, y-5, 2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#fff';
          }
        }
      }

      // Tier edge outline
      ctx.globalAlpha = a * p * 0.2;
      ctx.strokeStyle = CREAM;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx-tw/2, y-th, tw, th);
    });

    // Flowers blooming on top
    const topY = tierY[2] - tiers[2].h;
    if (t > 0.66) {
      const fp1 = eBack(Math.min((t-0.66)*5, 1));
      flower(cx,     topY-2,  u*3.8, fp1, PINK,  a);
      if (t>0.76) flower(cx+u*5, topY+u*0.5, u*2.8, eBack(Math.min((t-0.76)*5,1)), '#fff',  a);
      if (t>0.83) flower(cx-u*5, topY+u,     u*2.2, eBack(Math.min((t-0.83)*5,1)), GOLD,    a);
    }

    // Palette knife scraping the side (moves upward)
    const kP = Math.min(t * 2.8, 1);
    if (kP < 0.97) {
      const kx  = cx + tiers[0].w/2 + 16;
      const ky  = baseY - tiers[0].h * kP;
      ctx.globalAlpha = a * 0.82;
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(kx, ky+38);
      ctx.lineTo(kx, ky-30);
      ctx.stroke();
      ctx.strokeStyle = '#a0a0a0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(kx+3, ky+38);
      ctx.bezierCurveTo(kx+22, ky+22, kx+24, ky-8, kx+3, ky-30);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     SCENE 4 — Bird's-eye finished decorated cake
  ───────────────────────────────────────────────────────────── */
  function scene4(t, a) {
    const cx = W/2, cy = H/2;
    const R  = Math.min(W, H) * 0.3;

    ctx.save();

    // Subtle glow behind cake
    ctx.globalAlpha = a * 0.18;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R*1.5);
    glow.addColorStop(0, PINK);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R*1.5, 0, Math.PI*2);
    ctx.fill();

    // Frosted top surface
    ctx.globalAlpha = a * eOut(Math.min(t*4, 1));
    const cg = ctx.createRadialGradient(cx-R*0.28, cy-R*0.28, 0, cx, cy, R);
    cg.addColorStop(0, '#FFFFFF');
    cg.addColorStop(0.45,'#FFF4EC');
    cg.addColorStop(1,  '#EDD8C8');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fill();

    // Concentric piped ring texture
    ctx.globalAlpha = a * eOut(Math.min(t*3,1)) * 0.45;
    for (let i=1; i<=5; i++) {
      ctx.strokeStyle = i%2===0 ? `rgba(212,168,67,0.28)` : `rgba(220,190,165,0.28)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R*(i/6), 0, Math.PI*2);
      ctx.stroke();
    }

    // 8 flowers blooming around the edge
    ctx.globalAlpha = a;
    const flColors = [PINK,'#fff',GOLD,PINK,'#FFB6C1',GOLD,'#fff',PINK];
    for (let i=0; i<8; i++) {
      const fd = (i/8)*0.5;
      const fp = eOut(Math.max(0, Math.min((t-fd)*3.2, 1)));
      if (fp <= 0) continue;
      const fa = (i/8)*Math.PI*2 - Math.PI/2;
      const fr = R * 0.69;
      flower(cx+Math.cos(fa)*fr, cy+Math.sin(fa)*fr, R*0.115, fp, flColors[i], a);
    }

    // Centre large rose
    const cp = eOut(Math.max(0, Math.min((t-0.3)*4, 1)));
    flower(cx, cy, R*0.2, cp, PINK, a);

    // Gold dot ring (inner)
    if (t > 0.28) {
      const gp = eOut(Math.min((t-0.28)*4, 1));
      ctx.globalAlpha = a * gp;
      ctx.fillStyle = GOLD;
      for (let i=0; i<16; i++) {
        const ga = (i/16)*Math.PI*2;
        ctx.beginPath();
        ctx.arc(cx+Math.cos(ga)*R*0.4, cy+Math.sin(ga)*R*0.4, 3.2, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // Dashed gold border arc drawing in
    const bp = eOut(Math.min(Math.max(t-0.15,0)*2.2, 1));
    if (bp > 0) {
      ctx.globalAlpha = a * bp * 0.65;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, R*0.93, -Math.PI/2, -Math.PI/2 + Math.PI*2*bp);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Plate rim
    ctx.globalAlpha = a * 0.3;
    ctx.strokeStyle = 'rgba(255,248,243,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R*1.18, 0, Math.PI*2);
    ctx.stroke();

    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     BRAND REVEAL
  ───────────────────────────────────────────────────────────── */
  function brandReveal(t, a) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ✦ mark
    const mp = eBack(Math.min(t*4, 1));
    ctx.globalAlpha = a * mp;
    ctx.fillStyle = GOLD;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 35;
    ctx.font = `${Math.min(W*0.06, 54)*Math.max(mp,0.01)}px serif`;
    ctx.fillText('✦', W/2, H/2 - 88);
    ctx.shadowBlur = 0;

    // Name
    const np = eOut(Math.max(0, Math.min((t-0.22)*3.5, 1)));
    ctx.globalAlpha = a * np;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 22;
    ctx.font = `700 ${Math.min(W*0.074, 76)}px 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText('Artisan Cakery', W/2, H/2 + 8);
    ctx.shadowBlur = 0;

    // Divider line drawing in
    const lp = eOut(Math.max(0, Math.min((t-0.38)*3.5, 1)));
    ctx.globalAlpha = a * lp;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    const lw = 96 * lp;
    ctx.beginPath();
    ctx.moveTo(W/2-lw/2, H/2+44);
    ctx.lineTo(W/2+lw/2, H/2+44);
    ctx.stroke();

    // Tagline
    const tp = eOut(Math.max(0, Math.min((t-0.52)*3.5, 1)));
    ctx.globalAlpha = a * tp * 0.58;
    ctx.fillStyle = '#fff';
    ctx.font = `300 ${Math.min(W*0.017, 14)}px 'DM Sans', system-ui, sans-serif`;
    ctx.fillText('BRADFORD  ·  WEST YORKSHIRE', W/2, H/2+68);

    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     SHARED: Draw a flower (6 petals + gold centre)
  ───────────────────────────────────────────────────────────── */
  function flower(x, y, r, p, color, masterA) {
    if (p <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = masterA * p;
    ctx.fillStyle = color;
    for (let i=0; i<6; i++) {
      const ang = (i/6)*Math.PI*2;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(ang)*r*0.62*p,
        y + Math.sin(ang)*r*0.62*p,
        r*0.48*p, r*0.26*p, ang, 0, Math.PI*2
      );
      ctx.fill();
    }
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(x, y, r*0.26*p, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     CAPTION
  ───────────────────────────────────────────────────────────── */
  function caption(text, a) {
    if (a <= 0.02 || !text) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 28;
    ctx.font = `italic ${Math.min(W*0.034, 32)}px 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText(text, W/2, H*0.83);
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     SEQUENCE DEFINITION
  ───────────────────────────────────────────────────────────── */
  const FADE = 380;
  const SCENES = [
    { dur: 2200, fn: scene1,       cap: 'It starts with the finest ingredients…' },
    { dur: 2200, fn: scene2,       cap: 'Every layer, placed with care.' },
    { dur: 2200, fn: scene3,       cap: 'Finished by hand, down to the last detail.' },
    { dur: 1900, fn: scene4,       cap: 'A masterpiece, made for you.' },
    { dur: 1600, fn: brandReveal,  cap: '' },
  ];
  const TOTAL = SCENES.reduce((s, sc) => s + sc.dur, 0);

  let startTime = null;
  let ended = false;
  const bar = document.getElementById('intro-bar');
  if (bar) {
    bar.style.transition = `width ${TOTAL}ms linear`;
  }

  function endIntro() {
    if (ended) return;
    ended = true;
    introEl.classList.add('is-done');
    document.body.classList.remove('intro-active');
    setTimeout(() => {
      introEl.remove();
      const veil = document.querySelector('.page-veil');
      if (veil) requestAnimationFrame(() => setTimeout(() => veil.classList.add('lift'), 80));
    }, 940);
  }

  introEl.addEventListener('click', endIntro, { once: true });

  function tick(ts) {
    if (ended) return;
    if (!startTime) {
      startTime = ts;
      if (bar) requestAnimationFrame(() => { bar.style.width = '100%'; });
    }
    const elapsed = ts - startTime;

    // Which scene?
    let rem = elapsed;
    let si = 0;
    while (si < SCENES.length - 1 && rem >= SCENES[si].dur) {
      rem -= SCENES[si].dur;
      si++;
    }
    const sc = SCENES[si];
    const scT = Math.min(rem / sc.dur, 1);

    // Master alpha: fade in at scene start, fade out at end
    const mA = Math.min(rem / FADE, 1) * Math.min((sc.dur - rem) / FADE, 1);

    // Clear to background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Draw scene
    sc.fn(scT, Math.max(mA, 0));

    // Caption fade (slightly delayed)
    const capIn  = Math.min(Math.max(rem - 300, 0) / 380, 1);
    const capOut = Math.min((sc.dur - rem) / 380, 1);
    caption(sc.cap, Math.min(capIn, capOut));

    if (elapsed >= TOTAL) { endIntro(); return; }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
