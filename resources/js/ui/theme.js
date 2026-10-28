import { useState } from 'react';

/**
 * Pilihan tampilan per browser: 'system' (bawaan, ikut pengaturan perangkat), 'light', 'dark'.
 * Disimpan di localStorage dan dipasang sebagai <html data-theme>; skrip kecil di app.blade.php
 * memasangnya sebelum halaman tampil agar tidak berkedip.
 */
const KEY = 'ui-theme';

export function readTheme() {
    try {
        const value = window.localStorage.getItem(KEY);
        return value === 'light' || value === 'dark' ? value : 'system';
    } catch {
        return 'system';
    }
}

// Warna bilah status browser HP (token --app); sama dengan meta theme-color di app.blade.php.
const THEME_COLORS = { light: '#f6f7f5', dark: '#121513' };

/** Meta theme-color ikut pilihan tampilan; 'system' kembali ke pasangan terang/gelap per media query. */
export function syncThemeColor(theme) {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        const own = (meta.getAttribute('media') || '').includes('dark') ? 'dark' : 'light';
        meta.setAttribute('content', THEME_COLORS[theme === 'system' ? own : theme]);
    });
}

export function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    syncThemeColor(theme);

    try {
        if (theme === 'system') window.localStorage.removeItem(KEY);
        else window.localStorage.setItem(KEY, theme);
    } catch {
        // Penyimpanan browser tidak tersedia (mode privat): pilihan berlaku sampai halaman dimuat ulang.
    }
}

export function useTheme() {
    const [theme, setTheme] = useState(readTheme);

    const change = (next) => {
        applyTheme(next);
        setTheme(next);
    };

    return [theme, change];
}
