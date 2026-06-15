/* ============================================================
   JPS PLASTERING — Cinematic intro
   A trowel sweeps across the screen, smoothing fresh plaster to
   reveal the brand. Pure canvas, no assets.
   ============================================================ */
(() => {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = () => {
    intro.classList.add('done');
    document.body.style.overflow = '';
    setTimeout(() => intro.remove(), 1000);
  };

  // session: only show intro once per tab
  if (reduce || sessionStorage.getItem('jps_intro')) { intro.remove(); return; }
  sessionStorage.setItem('jps_intro', '1');
  document.body.style.overflow = 'hidden';

  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize(); addEventListener('resize', resize);

  const skip = document.getElementById('intro-skip');
  if (skip) skip.addEventListener('click', finish);

  const CHAR = '#0e0c0b';
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eOut = t => 1 - Math.pow(1 - t, 3);

  const DURATION = 3200;
  let t0;

  // pre-rendered swirl noise for the wet-plaster band
  function noiseDab(x, y, r, hue) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hue);
    g.addColorStop(1, 'rgba(185,142,114,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function frame(t) {
    t0 = t0 || t;
    const k = Math.min((t - t0) / DURATION, 1);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = CHAR;
    ctx.fillRect(0, 0, W, H);

    // diagonal sweep progress of the trowel (left->right, slight rise)
    const sweep = easeInOut(Math.min(k / 0.72, 1));
    const edgeX = -0.15 * W + sweep * 1.3 * W;

    // ---- smoothed plaster already laid down (left of trowel) ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, edgeX, H);
    ctx.clip();
    // base wet plaster gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#caa98e');
    grad.addColorStop(0.5, '#b98e72');
    grad.addColorStop(1, '#8a6f5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // tooled streaks
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = i % 2 ? '#efe7d9' : '#5a4636';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      const yy = (i / 26) * H + Math.sin(i) * 8 * dpr;
      ctx.moveTo(0, yy);
      ctx.bezierCurveTo(W * .3, yy - 14 * dpr, W * .6, yy + 14 * dpr, edgeX, yy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ---- raw rough plaster ahead of trowel (right) ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(edgeX, 0, W - edgeX, H);
    ctx.clip();
    for (let i = 0; i < 60; i++) {
      const x = edgeX + Math.random() * (W - edgeX);
      const y = Math.random() * H;
      noiseDab(x, y, (Math.random() * 60 + 20) * dpr, 'rgba(140,111,90,0.18)');
    }
    ctx.restore();

    // ---- the trowel ----
    if (k < 0.78) {
      const tw = 34 * dpr, th = H * 0.62;
      ctx.save();
      ctx.translate(edgeX, H / 2);
      ctx.rotate(-0.06);
      // blade
      const bg = ctx.createLinearGradient(-tw, 0, tw, 0);
      bg.addColorStop(0, '#e9e4dc');
      bg.addColorStop(.5, '#b9b3a8');
      bg.addColorStop(1, '#76706613');
      ctx.fillStyle = bg;
      ctx.fillRect(-4 * dpr, -th / 2, tw, th);
      // leading bright edge
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillRect(tw - 4 * dpr, -th / 2, 4 * dpr, th);
      // handle nub
      ctx.fillStyle = '#2a211b';
      ctx.fillRect(-22 * dpr, -34 * dpr, 18 * dpr, 68 * dpr);
      ctx.restore();
      // dust kicked up at the edge
      for (let i = 0; i < 10; i++) {
        noiseDab(edgeX + (Math.random() - .2) * 60 * dpr, H / 2 + (Math.random() - .5) * th,
          (Math.random() * 8 + 2) * dpr, 'rgba(231,200,120,0.10)');
      }
    }

    // ---- brand reveal carved into the smoothed plaster ----
    const reveal = eOut(Math.max(0, (k - 0.32) / 0.5));
    if (reveal > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(reveal, 1);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cx = W / 2, cy = H / 2;

      ctx.font = `700 ${Math.min(W * 0.13, 150 * dpr)}px "Bricolage Grotesque", sans-serif`;
      // emboss shadow
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillText('JPS', cx + 3 * dpr, cy - 26 * dpr + 3 * dpr);
      ctx.fillStyle = '#1f1813';
      ctx.fillText('JPS', cx, cy - 26 * dpr);

      ctx.font = `600 ${Math.min(W * 0.035, 34 * dpr)}px "Bricolage Grotesque", sans-serif`;
      ctx.fillStyle = 'rgba(20,17,15,.85)';
      ctx.fillText('P L A S T E R I N G', cx, cy + 64 * dpr);

      ctx.font = `500 ${Math.min(W * 0.018, 16 * dpr)}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(20,17,15,.6)';
      ctx.fillText('LEEDS  ·  EST. 2015', cx, cy + 104 * dpr);
      ctx.restore();
    }

    if (k < 1) requestAnimationFrame(frame);
    else setTimeout(finish, 420);
  }
  requestAnimationFrame(frame);
})();
