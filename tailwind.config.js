import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

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
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Map indigo to harmonious SMABA school green (vibrant logo green & rich shades)
                indigo: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },
                smaba: {
                    50: '#f2fbf2',
                    100: '#e1f7e2',
                    200: '#c3efc6',
                    300: '#94e199',
                    400: '#6bcc72',
                    500: '#4db855', // Base SMABA Logo Green (#4db855 - #56c25e)
                    600: '#2f9338',
                    700: '#26742e',
                    800: '#225d28',
                    900: '#1d4d23',
                    950: '#0b2b10',
                },
            },
        },
    },

    plugins: [forms],
};

