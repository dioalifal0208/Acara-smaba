import '../css/app.css';
import './bootstrap';
import 'aos/dist/aos.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import AOS from 'aos';
import { ConfirmProvider, ToastProvider } from '@/ui';

// AOS (Animate On Scroll): animasi masuk ringan di setiap halaman. Diputar sekali, singkat,
// dan nonaktif bila pengguna memilih "kurangi gerakan" di sistemnya (aksesibilitas).
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
AOS.init({
    duration: 400,
    easing: 'ease-out-cubic',
    once: true,
    offset: 24,
    disable: reduceMotion,
});

// Halaman Inertia berganti tanpa muat ulang: daftarkan ulang elemen data-aos yang baru.
router.on('navigate', () => {
    window.requestAnimationFrame(() => AOS.refreshHard());
});

const appName = import.meta.env.VITE_APP_NAME || 'E-Presensi SMABA';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ToastProvider>
                <ConfirmProvider>
                    <App {...props} />
                </ConfirmProvider>
            </ToastProvider>
        );
    },
    progress: {
        color: '#26742e', // Hijau aksi utama (token accent)
    },
});
