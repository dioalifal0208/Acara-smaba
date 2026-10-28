// Cek kontras token warna (resources/css/tokens.css) di mode terang dan gelap.
// Jalankan: node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../resources/css/tokens.css', import.meta.url), 'utf8');
const [light, dark] = css.split('@media (prefers-color-scheme: dark)');
const parse = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(\d+) (\d+) (\d+)/g)].map(([, n, r, g, b]) => [n, [+r, +g, +b]]));
const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [teks/elemen, latar, minimum]
const pairs = [
    ['ink', 'app', 4.5], ['ink', 'surface', 4.5], ['ink-2', 'app', 4.5], ['ink-2', 'surface', 4.5], ['ink-2', 'surface-2', 4.5],
    ['ink-3', 'app', 4.5], ['ink-3', 'surface', 4.5], ['ink-3', 'surface-2', 4.5], ['accent-ink', 'accent', 4.5], ['accent', 'surface', 4.5], ['accent', 'accent-soft', 4.5],
    ['hadir', 'hadir-soft', 4.5], ['telat', 'telat-soft', 4.5], ['izin', 'izin-soft', 4.5], ['alpha', 'alpha-soft', 4.5],
    ['hadir', 'surface', 4.5], ['telat', 'surface', 4.5], ['izin', 'surface', 4.5], ['alpha', 'surface', 4.5],
    ['line-strong', 'surface', 3], ['line-strong', 'app', 3],
];

let failed = 0;
for (const [mode, block] of [['terang', parse(light)], ['gelap', { ...parse(light), ...parse(dark) }]]) {
    for (const [fg, bg, min] of pairs) {
        const r = ratio(block[fg], block[bg]);
        const ok = r >= min;
        if (!ok) failed++;
        console.log(`${ok ? 'OK  ' : 'GAGAL'} ${mode.padEnd(6)} ${fg.padEnd(12)} di ${bg.padEnd(12)} ${r.toFixed(2)}:1 (min ${min})`);
    }
}
process.exit(failed ? 1 : 0);
