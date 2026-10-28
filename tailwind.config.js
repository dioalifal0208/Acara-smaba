import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** Token desain baru (resources/css/tokens.css): nilai RGB di CSS variable agar ikut mode gelap. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
    // `dark:` ikut sistem, kecuali pengguna memilih Terang/Gelap di tombol tampilan (<html data-theme>).
    darkMode: ['variant', [
        '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) & }',
        ':root[data-theme="dark"] &',
    ]],

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                // SF Pro bawaan sistem di perangkat Apple (tidak boleh di-host di web), Inter di lainnya.
                sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', '"Segoe UI"', 'Roboto', ...defaultTheme.fontFamily.sans],
                display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', '"Segoe UI"', 'Roboto', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                app: token('app'),
                surface: { DEFAULT: token('surface'), 2: token('surface-2') },
                ink: { DEFAULT: token('ink'), 2: token('ink-2'), 3: token('ink-3') },
                line: { DEFAULT: token('line'), strong: token('line-strong') },
                accent: { DEFAULT: token('accent'), ink: token('accent-ink'), soft: token('accent-soft') },
                status: {
                    hadir: token('hadir'),
                    'hadir-soft': token('hadir-soft'),
                    telat: token('telat'),
                    'telat-soft': token('telat-soft'),
                    izin: token('izin'),
                    'izin-soft': token('izin-soft'),
                    alpha: token('alpha'),
                    'alpha-soft': token('alpha-soft'),
                },
                danger: { DEFAULT: token('alpha'), soft: token('alpha-soft') },
                chart: { hadir: token('chart-hadir'), telat: token('chart-telat'), izin: token('chart-izin'), belum: token('chart-belum') },
            },
            keyframes: {
                'toast-in': {
                    from: { opacity: '0', transform: 'translateY(-8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'toast-in': 'toast-in 200ms ease-out',
            },
        },
    },

    plugins: [forms],
};
