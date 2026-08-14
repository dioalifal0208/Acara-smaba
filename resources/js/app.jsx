import '../css/app.css';
import './bootstrap';
import 'aos/dist/aos.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import AOS from 'aos';
import { ToastProvider } from '@/Components/Toast';
import { ConfirmProvider } from '@/Components/ConfirmDialog';

// Initialize AOS (Animate On Scroll) globally
AOS.init({
    duration: 800,
    once: true,
    easing: 'ease-out-cubic',
});

// Refresh AOS on Inertia page transitions
router.on('navigate', () => {
    AOS.refresh();
});

const appName = import.meta.env.VITE_APP_NAME || 'Acara SMA Negeri 1 Babat';

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
        color: '#4f46e5', // Theme indigo color for progress bar
    },
});
