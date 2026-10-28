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

// Halaman admin bergulir di dalam <main id="konten">, bukan window, sedangkan AOS hanya mendengar
// scroll window: tanpa ini elemen di bawah layar pertama tidak pernah muncul. Posisi dihitung ulang
// (offset AOS sudah memperhitungkan scrollTop wadah) paling banyak sekali per frame.
let aosFrame = 0;
document.addEventListener('scroll', (event) => {
    if (aosFrame || event.target?.id !== 'konten') return;
    aosFrame = window.requestAnimationFrame(() => {
        aosFrame = 0;
        AOS.refresh();
    });
}, { capture: true, passive: true });

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
        color: 'rgb(var(--accent))', // token accent: ikut mode terang/gelap
    },
});
