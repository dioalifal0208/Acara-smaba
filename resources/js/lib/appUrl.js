// URL dasar aplikasi dari <meta name="app-url">. Di produksi aplikasi berjalan di subfolder
// (mis. https://domain/presensi), jadi path absolut seperti '/api/...' atau '/models' akan
// mengarah ke domain utama dan gagal (404). Selalu bangun URL lewat helper ini.
const meta = typeof document !== 'undefined' ? document.querySelector('meta[name="app-url"]') : null;

export const APP_URL = (meta?.content || '').replace(/\/+$/, '');

export function appUrl(path = '') {
    return `${APP_URL}/${String(path).replace(/^\/+/, '')}`;
}

export const MODEL_URL = appUrl('models');
