import { router } from '@inertiajs/react';

/**
 * Muat ulang data halaman di latar belakang (polling).
 * - Dilewati saat tab tersembunyi; halaman memuat ulang lagi saat terlihat kembali.
 * - Respons non-Inertia (mis. 429 karena banyak perangkat berbagi satu IP Wi-Fi sekolah)
 *   tidak memunculkan modal error; percobaan berikutnya akan memperbarui halaman.
 */
export function backgroundReload(options = {}) {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
    }

    const stopSuppressing = router.on('invalid', (event) => event.preventDefault());

    router.reload({
        ...options,
        onFinish: (visit) => {
            stopSuppressing();
            options.onFinish?.(visit);
        },
    });
}

/** Interval polling dengan sedikit acak agar banyak perangkat tidak memuat ulang bersamaan. */
export function jitteredInterval(baseMs, jitterMs = baseMs / 2) {
    return baseMs + Math.floor(Math.random() * jitterMs);
}
