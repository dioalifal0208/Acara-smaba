import { Spinner, cx } from '@/ui';
import { lazy, Suspense } from 'react';

// face-api.js (±160 kB gzip) baru diunduh saat kamera wajah benar-benar dibuka,
// bukan setiap kali halaman yang memuat tombolnya dibuka.
const FaceEnrollmentCamera = lazy(() => import('./FaceEnrollmentCamera'));

/** FaceEnrollmentCamera yang dimuat saat dibutuhkan; props diteruskan apa adanya. */
export default function LazyFaceEnrollmentCamera(props) {
    return (
        <Suspense
            fallback={
                <div className={cx('flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 bg-black text-sm text-white', props.className)} role="status">
                    <Spinner className="h-6 w-6" />
                    Menyiapkan kamera wajah…
                </div>
            }
        >
            <FaceEnrollmentCamera {...props} />
        </Suspense>
    );
}
