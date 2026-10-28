import { appUrl } from '@/lib/appUrl';

/**
 * Kerangka halaman publik/mandiri (self check-in, verifikasi, daftar wajah, konfirmasi akun): logo, satu kolom
 * sempit di tengah, dan catatan kaki. Ikut mode gelap perangkat.
 */
export default function PublicShell({ children, footer = 'Presensi mandiri' }) {

    return (
        <div className="flex min-h-dvh flex-col bg-app text-ink">
            <header className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pb-2 pt-5">
                <img src={appUrl('images/logo-96.png')} alt="" width="36" height="36" className="h-9 w-9 shrink-0 object-contain" />
                <span className="leading-tight">
                    <span className="block text-sm font-semibold text-ink">E-Presensi</span>
                    <span className="block text-xs text-ink-2">SMA Negeri 1 Babat</span>
                </span>
            </header>

            <main className="mx-auto w-full max-w-md flex-1 px-4 pb-8 pt-4">{children}</main>

            <footer className="px-4 pb-6 text-center text-xs text-ink-2">
                &copy; {new Date().getFullYear()} E-Presensi SMABA · {footer}
            </footer>
        </div>
    );
}
