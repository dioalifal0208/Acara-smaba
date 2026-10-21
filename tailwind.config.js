import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

/**
 * Tema dashboard putih dengan warna utama hijau logo SMA Negeri 1 Babat (#2F9338).
 * `brand` (dan `indigo`, yang masih dipakai di beberapa halaman) dipetakan ke skala hijau ini.
 */
const smaba = {
    50: '#f2fbf2',
    100: '#e1f7e2',
    200: '#c3efc6',
    300: '#94e199',
    400: '#6bcc72',
    500: '#4db855',
    600: '#2f9338',
    700: '#26742e',
    800: '#225d28',
    900: '#1d4d23',
    950: '#0b2b10',
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Abu-abu netral seperti referensi (Material Dashboard), bukan abu kebiruan.
                slate: colors.neutral,
                indigo: smaba,
                brand: {
                    ...smaba,
                    violet: '#6bcc72',
                    soft: '#f2fbf2',
                },
                canvas: '#f5f5f5',
                smaba,
            },
            backgroundImage: {
                // Gradien hijau utama (tombol utama, menu aktif, ikon KPI)
                'brand-gradient': 'linear-gradient(195deg, #4db855 0%, #2f9338 100%)',
                'brand-gradient-x': 'linear-gradient(90deg, #2f9338 0%, #4db855 100%)',
            },
            boxShadow: {
                soft: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                // Bayangan ikon & tombol utama (pola shadow-success pada referensi, diwarnai hijau)
                dark: '0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(47, 147, 56, 0.4)',
                'dark-sm': '0 2px 2px 0 rgba(47, 147, 56, 0.14), 0 3px 1px -2px rgba(47, 147, 56, 0.2), 0 1px 5px 0 rgba(47, 147, 56, 0.15)',
                'dark-hover': '0 14px 26px -12px rgba(47, 147, 56, 0.4), 0 4px 23px 0 rgba(0, 0, 0, 0.15), 0 8px 10px -5px rgba(47, 147, 56, 0.2)',
            },
            borderRadius: {
                '4xl': '2rem',
            },
        },
    },

    plugins: [forms],
};
