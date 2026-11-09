// Procedural textures drawn on <canvas> — no image files needed.
import * as THREE from 'three';

function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(canvas, { srgb = true, repeat = [1, 1], wrap = true } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
}

/** Polerat betonggolv med stora plattor. Returnerar färg- och roughness-karta. */
export function makeFloorTextures(repeatX, repeatY) {
  const S = 1024, tiles = 4, ts = S / tiles;
  const [c, g] = makeCanvas(S, S);
  const [rc, rg] = makeCanvas(S, S);
  const r = rng(7);

  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      const v = 92 + r() * 18;
      g.fillStyle = `rgb(${v},${v},${v + 5})`;
      g.fillRect(i * ts, j * ts, ts, ts);
      const rv = 60 + r() * 40;
      rg.fillStyle = `rgb(${rv},${rv},${rv})`;
      rg.fillRect(i * ts, j * ts, ts, ts);
    }
  }
  // Fläckar och mikrovariation
  for (let k = 0; k < 60000; k++) {
    const x = r() * S, y = r() * S, a = r() * 0.07;
    g.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    g.fillRect(x, y, 1.5, 1.5);
  }
  for (let k = 0; k < 300; k++) {
    const x = r() * S, y = r() * S, rad = 10 + r() * 50;
    const grad = rg.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    rg.fillStyle = grad;
    rg.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // Fogar
  g.strokeStyle = 'rgba(45,45,50,0.9)';
  rg.strokeStyle = 'rgb(235,235,235)';
  g.lineWidth = rg.lineWidth = 3;
  for (let i = 0; i <= tiles; i++) {
    for (const [ctx] of [[g], [rg]]) {
      ctx.beginPath();
      ctx.moveTo(i * ts, 0); ctx.lineTo(i * ts, S);
      ctx.moveTo(0, i * ts); ctx.lineTo(S, i * ts);
      ctx.stroke();
    }
  }
  return {
    map: toTexture(c, { repeat: [repeatX, repeatY] }),
    roughnessMap: toTexture(rc, { srgb: false, repeat: [repeatX, repeatY] }),
  };
}

function wrapText(g, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y);
      line = w;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line) g.fillText(line, x, y);
  return y + lineH;
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Informationsskylt vid ett föremål. */
export function makePlaqueTexture({ title, subtitle, body, accent = '#FFB838', danger = false }) {
  const W = 1024, H = 640;
  const [c, g] = makeCanvas(W, H);
  g.fillStyle = danger ? '#1c0b0b' : '#12161c';
  g.fillRect(0, 0, W, H);
  g.fillStyle = accent;
  g.fillRect(0, 0, 18, H);
  g.fillRect(60, 210, 120, 6);

  g.fillStyle = '#ffffff';
  g.font = `700 84px ${FONT}`;
  g.fillText(title, 60, 120);
  g.fillStyle = accent;
  g.font = `600 36px ${FONT}`;
  g.fillText(subtitle, 60, 180);
  g.fillStyle = '#d6dbe2';
  g.font = `400 36px ${FONT}`;
  wrapText(g, body, 60, 290, W - 120, 50);
  return toTexture(c, { wrap: false });
}

/** Splinter camouflage pattern. */
export function makeCamoTexture(repeat = 1) {
  const S = 512;
  const [c, g] = makeCanvas(S, S);
  const r = rng(39);
  const colors = ['#5d6b45', '#3f4a2e', '#7c6b4a', '#2a2c25', '#8a8f72'];
  g.fillStyle = colors[0];
  g.fillRect(0, 0, S, S);
  for (let k = 0; k < 70; k++) {
    g.fillStyle = colors[1 + Math.floor(r() * (colors.length - 1))];
    const cx = r() * S, cy = r() * S, n = 4 + Math.floor(r() * 3), rad = 30 + r() * 90;
    const p = new Path2D();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.8;
      const rr = rad * (0.5 + r() * 0.7);
      const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
      i ? p.lineTo(px, py) : p.moveTo(px, py);
    }
    p.closePath();
    // Rita varje fläck på alla sidor så att mönstret går att upprepa sömlöst
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
      g.save(); g.translate(dx, dy); g.fill(p); g.restore();
    }
  }
  return toTexture(c, { repeat: [repeat, repeat] });
}

/** Fictional wing insignia: concentric rings. */
export function makeRoundelTexture() {
  const S = 256;
  const [c, g] = makeCanvas(S, S);
  [[S / 2 - 2, '#f2f2f2'], [S / 2 - 18, '#20324f'], [S / 2 - 52, '#f2f2f2'], [S / 2 - 70, '#c8a23a']].forEach(([r, col]) => {
    g.fillStyle = col;
    g.beginPath(); g.arc(S / 2, S / 2, r, 0, Math.PI * 2); g.fill();
  });
  return toTexture(c, { wrap: false });
}

/** Gul/svart varningsrand. */
export function makeHazardTexture() {
  const S = 256;
  const [c, g] = makeCanvas(S, S);
  g.fillStyle = '#ffc21a';
  g.fillRect(0, 0, S, S);
  g.fillStyle = '#111';
  for (let i = -S; i < S * 2; i += 64) {
    g.beginPath();
    g.moveTo(i, 0); g.lineTo(i + 32, 0); g.lineTo(i + 32 - S, S); g.lineTo(i - S, S);
    g.closePath(); g.fill();
  }
  return toTexture(c, { repeat: [2, 0.5] });
}
