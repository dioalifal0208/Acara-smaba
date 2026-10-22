import { useEffect } from 'react';
import { backgroundReload } from '@/lib/backgroundReload';

const POLL_INTERVAL_MS = 5000;

/**
 * Sinkronisasi Android → web: pantau sinyal yang dinaikkan aplikasi Android (tarik ke bawah, atau setiap
 * perubahan data dari API) dan muat ulang data halaman ini di latar belakang begitu sinyalnya berubah.
 * GET /sync/signal tanpa session/database, jadi aman dipanggil tiap beberapa detik.
 */
export function useWebSyncSignal() {
    useEffect(() => {
        let lastVersion = null;
        let stopped = false;
        let timer;

        const check = async () => {
            if (document.visibilityState !== 'hidden') {
                try {
                    const response = await fetch(`${route('sync.signal')}?t=${Date.now()}`, { cache: 'no-store', credentials: 'omit' });
                    if (response.ok) {
                        const { v } = await response.json();
                        if (lastVersion !== null && v !== lastVersion) {
                            backgroundReload({ preserveScroll: true, preserveState: true });
                        }
                        lastVersion = v;
                    }
                } catch {
                    // Jaringan putus: coba lagi pada putaran berikutnya.
                }
            }
            if (!stopped) timer = window.setTimeout(check, POLL_INTERVAL_MS);
        };

        check();

        return () => {
            stopped = true;
            window.clearTimeout(timer);
        };
    }, []);
}
