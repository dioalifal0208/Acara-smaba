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

export function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;

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
