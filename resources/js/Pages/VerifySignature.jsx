import { Head, Link } from '@inertiajs/react';

export default function VerifySignature({ workcode, kepalaSekolahNama, kepalaSekolahNip, waktuCetak }) {
    return (
        <div className="flex min-h-screen flex-col bg-canvas">
            <Head title="Verifikasi Tanda Tangan" />

            <div className="relative overflow-hidden rounded-b-2xl bg-brand-gradient px-6 pb-24 pt-10 text-center text-white">
                <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/[0.07]" />
                <div className="relative inline-flex flex-col items-center" data-aos="zoom-in">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-soft-lg">
                        <img src="/images/logo.png" alt="Logo SMA Negeri 1 Babat" className="h-16 w-16 object-contain" />
                    </span>
                    <span className="mt-4 text-2xl font-extrabold tracking-tight">Verifikasi Dokumen</span>
                    <span className="text-sm font-medium text-white/80">SMA Negeri 1 Babat</span>
                </div>
            </div>

            <div className="relative -mt-14 flex flex-1 justify-center px-4 pb-10">
                <div className="card-soft h-fit w-full max-w-md p-6 sm:p-8" data-aos="fade-up" data-aos-delay="100">
                    <div className="mb-6 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dokumen Sah</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">Telah terverifikasi oleh sistem</p>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <h2 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Informasi Dokumen</h2>
                            <p className="font-semibold text-slate-800">Rekap Presensi - {workcode.nama_workcode}</p>
                            <p className="text-sm text-slate-600">Dicetak pada: {waktuCetak}</p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <h2 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ditandatangani Oleh</h2>
                            <p className="font-semibold text-slate-800">{kepalaSekolahNama}</p>
                            <p className="font-mono text-sm text-slate-600">NIP. {kepalaSekolahNip}</p>
                            <p className="mt-2 text-xs font-medium text-slate-500">Kepala Sekolah SMA Negeri 1 Babat</p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        Dokumen ini dihasilkan secara elektronik dan sah tanpa memerlukan stempel basah.
                    </p>
                    <Link href="/" className="btn-soft mt-4 w-full">Kembali ke Beranda</Link>
                </div>
            </div>
        </div>
    );
}
