import { Link } from '@inertiajs/react';

/** Halaman tamu (masuk, lupa/reset password): sama seperti layar login aplikasi Android. */
export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-canvas">
            <div className="relative overflow-hidden rounded-b-2xl bg-brand-gradient px-6 pb-24 pt-10 text-center text-white">
                <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/[0.07]" />
                <Link href="/" className="relative inline-flex flex-col items-center" data-aos="zoom-in">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-soft-lg">
                        <img src="/images/logo.png" alt="Logo SMA Negeri 1 Babat" className="h-16 w-16 object-contain" />
                    </span>
                    <span className="mt-4 text-2xl font-extrabold tracking-tight">Presensi SMABA</span>
                    <span className="text-sm font-medium text-white/80">SMA Negeri 1 Babat</span>
                </Link>
            </div>

            <div className="relative -mt-14 flex flex-1 justify-center px-4 pb-10">
                <div className="card-soft h-fit w-full max-w-md p-6 sm:p-8" data-aos="fade-up" data-aos-delay="100">
                    {children}
                </div>
            </div>
        </div>
    );
}
