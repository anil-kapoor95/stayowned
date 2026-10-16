/**
 * Generates illustrated placeholder property photos (JPEG) into public/images.
 *
 * The Figma photos could not be exported (view-only file, no image access from
 * the build environment), so these stylised scenes stand in for real photography.
 * Replace any file in public/images/properties/<slug>/ with a real photo of the
 * same name (3:2 ratio recommended) — no code changes needed.
 *
 * Usage: node scripts/generate-placeholder-images.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1600;
const H = 1067;
const OUT = path.resolve("public/images/properties");

/* ------------------------------------------------------------ helpers */
let seed = 7;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const r = (min, max) => min + rand() * (max - min);

const palettes = {
  golden: { sky: ["#f6c58f", "#f9e2c2", "#fdf3e4"], sun: "#fff4d6", hill: "#5d7a5a", hill2: "#7f9c74", sea: ["#3f8fa3", "#7cc0c9"], leaf: "#2f5d3a", leaf2: "#3f7a49", trunk: "#6b4b33" },
  day: { sky: ["#8ec5e8", "#c4e3f4", "#eef7fb"], sun: "#ffffff", hill: "#557e5c", hill2: "#86ad7f", sea: ["#2b7fa0", "#69bccd"], leaf: "#2d6a3e", leaf2: "#4a8a4f", trunk: "#6f4e37" },
  dusk: { sky: ["#3a3f6b", "#9a6f8c", "#f0a982"], sun: "#ffd7a8", hill: "#2f3a4f", hill2: "#4a5068", sea: ["#2f4a6b", "#7d7ea3"], leaf: "#1d2b2a", leaf2: "#2b3d38", trunk: "#2a2420" },
  mist: { sky: ["#b8c7cf", "#dbe4e7", "#f2f5f5"], sun: "#ffffff", hill: "#5f7a73", hill2: "#8fa69e", sea: ["#5d8a8c", "#9cc0bf"], leaf: "#2f4f45", leaf2: "#46695c", trunk: "#5a4636" },
};

const grad = (id, stops, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops
    .map((c, i) => `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${c}"/>`)
    .join("")}</linearGradient>`;

const hills = (y, color, amp, n = 6) => {
  let d = `M0 ${H} L0 ${y}`;
  const step = W / n;
  for (let i = 0; i <= n; i++) {
    const x = i * step;
    d += ` Q ${x - step / 2} ${y - r(0, amp)} ${x} ${y + r(-amp / 3, amp / 3)}`;
  }
  return `<path d="${d} L${W} ${H} Z" fill="${color}"/>`;
};

const palm = (x, baseY, h, p, flip = 1) => {
  const topX = x + flip * h * 0.18;
  const topY = baseY - h;
  let s = `<path d="M${x} ${baseY} Q ${x + flip * h * 0.05} ${baseY - h * 0.55} ${topX} ${topY}" stroke="${p.trunk}" stroke-width="${h * 0.045}" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r(-0.2, 0.2);
    const len = h * r(0.32, 0.42);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + len * 0.25;
    const cx = topX + Math.cos(a) * len * 0.5;
    const cy = topY - len * 0.18;
    s += `<path d="M${topX} ${topY} Q ${cx} ${cy} ${ex} ${ey}" stroke="${i % 2 ? p.leaf : p.leaf2}" stroke-width="${h * 0.035}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
};

const bush = (x, y, size, p) =>
  Array.from({ length: 5 }, (_, i) => `<circle cx="${x + (i - 2) * size * 0.45}" cy="${y - r(0, size * 0.4)}" r="${size * r(0.45, 0.65)}" fill="${i % 2 ? p.leaf : p.leaf2}"/>`).join("");

const flowers = (x, y, count, color) =>
  Array.from({ length: count }, () => `<circle cx="${x + r(-60, 60)}" cy="${y + r(-30, 10)}" r="${r(4, 8)}" fill="${color}" opacity="0.9"/>`).join("");

const windowsGlow = (x, y, w, h, cols, rows, glow) => {
  let s = "";
  const gw = w / cols;
  const gh = h / rows;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      s += `<rect x="${x + i * gw + 6}" y="${y + j * gh + 6}" width="${gw - 12}" height="${gh - 12}" rx="3" fill="${rand() > 0.3 ? glow : "#2a3346"}" opacity="0.92"/>`;
  return s;
};

/* ------------------------------------------------------------- scenes */
function exteriorVilla(p, { wall = "#efe7da", roof = "#3b3631", glow = "#ffd9a0" } = {}) {
  const horizon = H * 0.52;
  return `
  <defs>${grad("sky", p.sky)}${grad("pool", ["#5fc4d6", "#2b8fb0"])}${grad("deck", ["#a77b55", "#7c583b"])}</defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${W * 0.78}" cy="${H * 0.2}" r="70" fill="${p.sun}" opacity="0.85"/>
  ${hills(horizon, p.hill2, 80)}${hills(horizon + 40, p.hill, 60)}
  ${palm(W * 0.08, horizon + 60, 420, p, 1)}${palm(W * 0.9, horizon + 80, 470, p, -1)}${palm(W * 0.76, horizon + 30, 330, p, -1)}
  <rect x="${W * 0.2}" y="${H * 0.33}" width="${W * 0.5}" height="${H * 0.3}" fill="${wall}"/>
  <rect x="${W * 0.17}" y="${H * 0.3}" width="${W * 0.56}" height="${H * 0.04}" fill="${roof}"/>
  <rect x="${W * 0.45}" y="${H * 0.18}" width="${W * 0.3}" height="${H * 0.14}" fill="${wall}"/>
  <rect x="${W * 0.43}" y="${H * 0.16}" width="${W * 0.34}" height="${H * 0.03}" fill="${roof}"/>
  ${windowsGlow(W * 0.23, H * 0.37, W * 0.2, H * 0.22, 3, 1, glow)}
  ${windowsGlow(W * 0.47, H * 0.2, W * 0.26, H * 0.1, 4, 1, glow)}
  <rect x="${W * 0.47}" y="${H * 0.37}" width="${W * 0.2}" height="${H * 0.26}" fill="#2f3b45" opacity="0.85"/>
  ${bush(W * 0.22, H * 0.64, 60, p)}${bush(W * 0.7, H * 0.64, 70, p)}${flowers(W * 0.7, H * 0.6, 14, "#d9468f")}
  <rect x="0" y="${H * 0.63}" width="${W}" height="${H * 0.37}" fill="url(#deck)"/>
  <path d="M${W * 0.12} ${H * 0.7} L${W * 0.95} ${H * 0.7} L${W * 1.05} ${H} L${W * 0.02} ${H} Z" fill="url(#pool)"/>
  ${Array.from({ length: 7 }, (_, i) => `<path d="M${W * 0.15 + i * 180} ${H * 0.78 + (i % 3) * 40} q 40 -12 80 0 t 80 0" stroke="#ffffff" stroke-opacity="0.35" stroke-width="5" fill="none"/>`).join("")}
  <rect x="${W * 0.03}" y="${H * 0.66}" width="190" height="26" rx="8" fill="#f4efe6"/><rect x="${W * 0.03 + 210}" y="${H * 0.66}" width="190" height="26" rx="8" fill="#f4efe6"/>`;
}

function livingRoom(p, { wall = "#efe8de", floor = "#b48a63", sofa = "#d9d2c5", accent = "#ee4d1b" } = {}) {
  return `
  <defs>${grad("out", p.sky)}${grad("floor", [floor, "#8f6a49"])}</defs>
  <rect width="${W}" height="${H}" fill="${wall}"/>
  <rect x="${W * 0.08}" y="${H * 0.1}" width="${W * 0.55}" height="${H * 0.5}" fill="url(#out)"/>
  ${palm(W * 0.2, H * 0.62, 360, p, 1)}${bush(W * 0.45, H * 0.6, 70, p)}${bush(W * 0.15, H * 0.62, 60, p)}
  <rect x="${W * 0.08}" y="${H * 0.1}" width="${W * 0.55}" height="${H * 0.5}" fill="none" stroke="#3d342c" stroke-width="16"/>
  <line x1="${W * 0.355}" y1="${H * 0.1}" x2="${W * 0.355}" y2="${H * 0.6}" stroke="#3d342c" stroke-width="12"/>
  <rect x="0" y="${H * 0.66}" width="${W}" height="${H * 0.34}" fill="url(#floor)"/>
  <ellipse cx="${W * 0.5}" cy="${H * 0.84}" rx="${W * 0.32}" ry="${H * 0.08}" fill="#e9dccb"/>
  <rect x="${W * 0.18}" y="${H * 0.56}" width="${W * 0.5}" height="${H * 0.18}" rx="30" fill="${sofa}"/>
  <rect x="${W * 0.18}" y="${H * 0.5}" width="${W * 0.5}" height="${H * 0.1}" rx="28" fill="${sofa}" opacity="0.92"/>
  <rect x="${W * 0.24}" y="${H * 0.52}" width="120" height="90" rx="18" fill="${accent}" opacity="0.85"/>
  <rect x="${W * 0.52}" y="${H * 0.52}" width="120" height="90" rx="18" fill="#2f5d5a" opacity="0.8"/>
  <rect x="${W * 0.36}" y="${H * 0.78}" width="${W * 0.18}" height="22" rx="10" fill="#5a4330"/>
  <rect x="${W * 0.74}" y="${H * 0.2}" width="10" height="${H * 0.5}" fill="#3d342c"/>
  <path d="M${W * 0.71} ${H * 0.2} h 70 l -20 -70 h -30 Z" fill="#f6e3c0"/>
  <rect x="${W * 0.82}" y="${H * 0.52}" width="110" height="140" rx="12" fill="#c8b39b"/>
  ${bush(W * 0.85, H * 0.5, 70, p)}`;
}

function bedroom(p, { wall = "#f1ebe2", bed = "#fbfaf7", throwColor = "#ee4d1b", wood = "#8a6446" } = {}) {
  return `
  <defs>${grad("out", p.sky)}</defs>
  <rect width="${W}" height="${H}" fill="${wall}"/>
  <rect x="${W * 0.62}" y="${H * 0.12}" width="${W * 0.3}" height="${H * 0.45}" fill="url(#out)"/>
  ${palm(W * 0.75, H * 0.6, 300, p, -1)}
  <rect x="${W * 0.62}" y="${H * 0.12}" width="${W * 0.3}" height="${H * 0.45}" fill="none" stroke="#5a4636" stroke-width="14"/>
  <rect x="0" y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="#c9a983"/>
  <rect x="${W * 0.1}" y="${H * 0.3}" width="${W * 0.46}" height="${H * 0.26}" rx="18" fill="${wood}"/>
  <rect x="${W * 0.08}" y="${H * 0.52}" width="${W * 0.5}" height="${H * 0.26}" rx="20" fill="${bed}"/>
  <rect x="${W * 0.08}" y="${H * 0.66}" width="${W * 0.5}" height="${H * 0.12}" rx="16" fill="${throwColor}" opacity="0.85"/>
  <rect x="${W * 0.13}" y="${H * 0.45}" width="${W * 0.16}" height="${H * 0.1}" rx="26" fill="#ffffff"/>
  <rect x="${W * 0.35}" y="${H * 0.45}" width="${W * 0.16}" height="${H * 0.1}" rx="26" fill="#ffffff"/>
  <rect x="${W * 0.0}" y="${H * 0.56}" width="${W * 0.07}" height="${H * 0.18}" rx="8" fill="${wood}"/>
  <circle cx="${W * 0.035}" cy="${H * 0.5}" r="30" fill="#f6e3c0"/>`;
}

function beach(p) {
  const horizon = H * 0.5;
  return `
  <defs>${grad("sky", p.sky)}${grad("sea", p.sea)}${grad("sand", ["#f0dcb8", "#dcc097"])}</defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${W * 0.3}" cy="${H * 0.28}" r="80" fill="${p.sun}" opacity="0.9"/>
  <rect y="${horizon}" width="${W}" height="${H * 0.2}" fill="url(#sea)"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${r(0, W)} ${horizon + 20 + i * 18} h ${r(80, 220)}" stroke="#ffffff" stroke-opacity="0.4" stroke-width="4"/>`).join("")}
  <path d="M0 ${H * 0.68} Q ${W * 0.5} ${H * 0.62} ${W} ${H * 0.7} L${W} ${H} L0 ${H} Z" fill="url(#sand)"/>
  ${palm(W * 0.82, H * 0.9, 600, p, -1)}${palm(W * 0.92, H * 0.88, 470, p, -1)}${palm(W * 0.1, H * 0.92, 380, p, 1)}
  <path d="M${W * 0.4} ${H * 0.86} l 120 -110 l 120 110 Z" fill="#ee4d1b" opacity="0.9"/>
  <line x1="${W * 0.4 + 120}" y1="${H * 0.75}" x2="${W * 0.4 + 120}" y2="${H * 0.95}" stroke="#5a4636" stroke-width="8"/>
  <rect x="${W * 0.36}" y="${H * 0.9}" width="220" height="24" rx="10" fill="#ffffff"/>`;
}

function mountainCottage(p, { wall = "#c9a77d", roof = "#7a3b2e" } = {}) {
  const pine = (x, y, h) =>
    `<path d="M${x} ${y - h} L${x + h * 0.28} ${y} L${x - h * 0.28} ${y} Z" fill="${p.leaf}"/><path d="M${x} ${y - h * 1.15} L${x + h * 0.2} ${y - h * 0.45} L${x - h * 0.2} ${y - h * 0.45} Z" fill="${p.leaf2}"/>`;
  return `
  <defs>${grad("sky", p.sky)}</defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <path d="M0 ${H * 0.55} L${W * 0.22} ${H * 0.2} L${W * 0.42} ${H * 0.5} L${W * 0.62} ${H * 0.16} L${W} ${H * 0.55} L${W} ${H} L0 ${H} Z" fill="${p.hill2}"/>
  <path d="M${W * 0.18} ${H * 0.26} L${W * 0.22} ${H * 0.2} L${W * 0.26} ${H * 0.26} Z M${W * 0.58} ${H * 0.22} L${W * 0.62} ${H * 0.16} L${W * 0.66} ${H * 0.22} Z" fill="#ffffff" opacity="0.9"/>
  ${hills(H * 0.62, p.hill, 50)}
  ${Array.from({ length: 11 }, (_, i) => pine(i * 160 + r(-30, 30), H * 0.7 + r(-20, 30), r(160, 260))).join("")}
  <rect x="${W * 0.36}" y="${H * 0.55}" width="${W * 0.3}" height="${H * 0.25}" fill="${wall}"/>
  <path d="M${W * 0.33} ${H * 0.56} L${W * 0.51} ${H * 0.36} L${W * 0.69} ${H * 0.56} Z" fill="${roof}"/>
  ${windowsGlow(W * 0.39, H * 0.6, W * 0.24, H * 0.1, 3, 1, "#ffd9a0")}
  <rect x="${W * 0.49}" y="${H * 0.7}" width="${W * 0.05}" height="${H * 0.1}" fill="#5a3a28"/>
  <rect x="0" y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="${p.hill}"/>
  ${pine(W * 0.12, H * 0.98, 320)}${pine(W * 0.9, H * 0.99, 360)}`;
}

function cityLoft(p) {
  return `
  <defs>${grad("sky", p.sky)}</defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${Array.from({ length: 16 }, (_, i) => {
    const bw = r(70, 140);
    const bh = r(H * 0.2, H * 0.55);
    const x = i * 105 + r(-20, 20);
    return `<rect x="${x}" y="${H * 0.72 - bh}" width="${bw}" height="${bh}" fill="${i % 2 ? "#2a3150" : "#363d5e"}"/>${windowsGlow(x, H * 0.72 - bh + 10, bw, bh - 20, 3, Math.max(2, Math.round(bh / 60)), "#ffd27a")}`;
  }).join("")}
  <rect x="0" y="${H * 0.7}" width="${W}" height="${H * 0.3}" fill="#e9e4dc"/>
  <rect x="0" y="${H * 0.58}" width="${W}" height="14" fill="#2b2f3d"/>
  ${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 82}" y="${H * 0.58}" width="8" height="${H * 0.12}" fill="#2b2f3d"/>`).join("")}
  <rect x="${W * 0.1}" y="${H * 0.76}" width="${W * 0.4}" height="${H * 0.12}" rx="24" fill="#4a5578"/>
  <rect x="${W * 0.6}" y="${H * 0.74}" width="160" height="160" rx="80" fill="#c8b39b"/>
  ${bush(W * 0.85, H * 0.72, 60, palettes.day)}`;
}

function kitchen(p, { cabinet = "#e9e2d6", counter = "#3b3631", accent = "#2f5d5a" } = {}) {
  return `
  <defs>${grad("out", p.sky)}</defs>
  <rect width="${W}" height="${H}" fill="#f4efe8"/>
  <rect x="${W * 0.36}" y="${H * 0.12}" width="${W * 0.28}" height="${H * 0.28}" fill="url(#out)"/>${bush(W * 0.5, H * 0.4, 70, p)}
  <rect x="${W * 0.36}" y="${H * 0.12}" width="${W * 0.28}" height="${H * 0.28}" fill="none" stroke="#5a4636" stroke-width="12"/>
  <rect x="0" y="${H * 0.1}" width="${W * 0.3}" height="${H * 0.26}" fill="${cabinet}"/><rect x="${W * 0.7}" y="${H * 0.1}" width="${W * 0.3}" height="${H * 0.26}" fill="${cabinet}"/>
  <rect x="0" y="${H * 0.52}" width="${W}" height="${H * 0.05}" fill="${counter}"/>
  <rect x="0" y="${H * 0.57}" width="${W}" height="${H * 0.3}" fill="${accent}"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 90}" y="${H * 0.66}" width="24" height="6" rx="3" fill="#d9c7a7"/>`).join("")}
  <rect x="0" y="${H * 0.87}" width="${W}" height="${H * 0.13}" fill="#b48a63"/>
  <circle cx="${W * 0.2}" cy="${H * 0.47}" r="40" fill="#f2a541"/><circle cx="${W * 0.25}" cy="${H * 0.48}" r="32" fill="#e85d3c"/>
  <rect x="${W * 0.72}" y="${H * 0.42}" width="90" height="100" rx="10" fill="#c8b39b"/>${bush(W * 0.745, H * 0.4, 50, p)}`;
}

function garden(p) {
  return `
  <defs>${grad("sky", p.sky)}</defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${hills(H * 0.5, p.hill2, 60)}
  <rect x="${W * 0.3}" y="${H * 0.3}" width="${W * 0.42}" height="${H * 0.28}" fill="#f2e6d3"/>
  <path d="M${W * 0.27} ${H * 0.32} L${W * 0.51} ${H * 0.14} L${W * 0.75} ${H * 0.32} Z" fill="#9c4a2f"/>
  ${windowsGlow(W * 0.33, H * 0.36, W * 0.36, H * 0.12, 4, 1, "#ffe1b0")}
  <rect x="0" y="${H * 0.58}" width="${W}" height="${H * 0.42}" fill="${p.hill}"/>
  <path d="M${W * 0.47} ${H * 0.58} L${W * 0.55} ${H * 0.58} L${W * 0.7} ${H} L${W * 0.32} ${H} Z" fill="#d9c2a0"/>
  ${bush(W * 0.15, H * 0.62, 90, p)}${bush(W * 0.85, H * 0.64, 100, p)}${flowers(W * 0.18, H * 0.6, 18, "#f2c94c")}${flowers(W * 0.84, H * 0.62, 18, "#e85d8a")}
  ${palm(W * 0.06, H * 0.8, 520, p, 1)}`;
}

const scenes = { exteriorVilla, livingRoom, bedroom, beach, mountainCottage, cityLoft, kitchen, garden };

/* ------------------------------------------------- per-property manifest */
const manifest = {
  "green-casa": [
    ["exteriorVilla", "golden"],
    ["livingRoom", "day"],
    ["bedroom", "golden"],
    ["beach", "golden"],
    ["kitchen", "day"],
  ],
  "casa-palmeira": [
    ["exteriorVilla", "dusk", { wall: "#e2d8c8", glow: "#ffcf86" }],
    ["livingRoom", "dusk", { sofa: "#cfc3ae", accent: "#c8a97e" }],
    ["bedroom", "dusk", { throwColor: "#c8a97e" }],
    ["garden", "golden"],
  ],
  "tamarind-homestay": [
    ["garden", "day"],
    ["kitchen", "golden", { accent: "#9e734e" }],
    ["bedroom", "day", { throwColor: "#b76735" }],
    ["livingRoom", "golden", { accent: "#b76735" }],
  ],
  "bandra-skyline-loft": [
    ["cityLoft", "dusk"],
    ["livingRoom", "dusk", { accent: "#2b4c7e", sofa: "#c9cfd8" }],
    ["bedroom", "dusk", { throwColor: "#2b4c7e" }],
    ["kitchen", "dusk", { accent: "#2b4c7e" }],
  ],
  "driftwood-cottage": [
    ["beach", "day"],
    ["garden", "day"],
    ["bedroom", "day", { throwColor: "#4e8380" }],
    ["livingRoom", "day", { accent: "#4e8380" }],
  ],
  "mist-valley-retreat": [
    ["mountainCottage", "mist"],
    ["livingRoom", "mist", { accent: "#ee4d1b" }],
    ["bedroom", "mist"],
    ["garden", "mist"],
  ],
  "coral-bay-apartment": [
    ["beach", "golden"],
    ["livingRoom", "golden", { accent: "#4e8380" }],
    ["bedroom", "golden", { throwColor: "#4e8380" }],
    ["kitchen", "golden", { accent: "#1d5451" }],
  ],
  "pine-ridge-cottage": [
    ["mountainCottage", "day", { wall: "#b78b5f" }],
    ["livingRoom", "mist", { accent: "#b76735" }],
    ["bedroom", "mist", { throwColor: "#b76735" }],
    ["kitchen", "mist", { accent: "#9e734e" }],
  ],
  "lotus-pond-villa": [
    ["exteriorVilla", "day", { wall: "#f4f1ea" }],
    ["garden", "golden"],
    ["livingRoom", "day", { accent: "#c8a97e" }],
    ["bedroom", "day", { throwColor: "#c8a97e" }],
  ],
};

for (const [slug, shots] of Object.entries(manifest)) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });
  for (const [index, [scene, paletteName, options]] of shots.entries()) {
    seed = slug.length * 97 + index * 13 + 1;
    const body = scenes[scene](palettes[paletteName], options);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
    const file = path.join(dir, `${index + 1}.jpg`);
    await sharp(Buffer.from(svg)).blur(1.2).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
    console.log("wrote", path.relative(process.cwd(), file));
  }
}
