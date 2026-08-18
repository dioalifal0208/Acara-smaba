import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '@/Components/ConfirmDialog';

export default function MasterQr({ checkInUrl, qrCodeSvg, token, activeWorkcode: propActiveWorkcode }) {
    const { post, processing } = useForm();
    const confirm = useConfirm();
    const { activeWorkcode: globalActiveWorkcode } = usePage().props;
    const activeWorkcode = propActiveWorkcode || globalActiveWorkcode;
    const [isFullscreenQrOpen, setIsFullscreenQrOpen] = useState(false);

    const handleRegenerate = async (e) => {
        e.preventDefault();
        const confirmed = await confirm({
            title: 'Regenerasi Token URL',
            message: 'Apakah Anda yakin ingin memutar (regenerasi) token workcode? URL absen lama akan segera dinonaktifkan.',
            type: 'warning',
            confirmText: 'Ya, Regenerasi',
            cancelText: 'Batal',
        });
        if (confirmed) {
            post(route('admin.master-qr.regenerate'));
        }
    };

    useEffect(() => {
        if (!isFullscreenQrOpen) {
            return;
        }

        const handleKeyDown = (workcode) => {
            if (workcode.key === 'Escape') {
                setIsFullscreenQrOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreenQrOpen]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between" data-aos="fade-down">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                                Mode Mandiri / Self Check-In
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                activeWorkcode ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                                <span className={`h-2 w-2 rounded-full ${activeWorkcode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                {activeWorkcode ? `Workcode: ${activeWorkcode.nama_workcode}` : 'Belum Ada Workcode Aktif'}
                            </span>
                        </div>
                        <h2 className="text-xl font-extrabold leading-tight text-slate-800 mt-2">
                            Master QR Code Presensi
                        </h2>
                    </div>
                    <form onSubmit={handleRegenerate}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 shadow-sm disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                            </svg>
                            Regenerasi Token URL
                        </button>
                    </form>
                </div>
            }
        >
            <Head title="Master QR Code" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center overflow-y-auto max-h-[580px]">
                <div className="mx-auto max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Column: QR Code Box */}
                    <div
                        className="md:col-span-7 overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 shadow-xl flex flex-col justify-between cursor-pointer transition-all hover:border-indigo-300 hover:shadow-2xl focus-within:border-indigo-400"
                        data-aos="zoom-in"
                        onClick={() => setIsFullscreenQrOpen(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(workcode) => {
                            if (workcode.key === 'Enter' || workcode.key === ' ') {
                                e.preventDefault();
                                setIsFullscreenQrOpen(true);
                            }
                        }}
                        aria-label="Buka Master QR Code layar penuh"
                    >
                        <div className="text-center">
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">
                                {activeWorkcode ? activeWorkcode.nama_workcode : 'Perhatian'}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-800 mb-1">Master QR Code E-Presensi</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-semibold">
                                {activeWorkcode
                                    ? `Minta peserta memindai QR Code ini untuk melakukan presensi mandiri pada workcode "${activeWorkcode.nama_workcode}".`
                                    : 'Belum ada workcode aktif. Aktifkan workcode terlebih dahulu agar hasil scan tercatat.'}
                            </p>
                        </div>

                        <div className="mx-auto my-4 flex items-center justify-center rounded-2xl bg-white p-4 shadow-lg max-w-[200px] border border-slate-200">
                            <div 
                                className="w-full h-full text-indigo-950 qr-svg-container" 
                                dangerouslySetInnerHTML={{ __html: qrCodeSvg }} 
                            />
                        </div>

                        {/* URL Check In */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Link Presensi Mandiri</span>
                            <a
                                href={checkInUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(workcode) => workcode.stopPropagation()}
                                className="text-xs font-mono text-indigo-700 hover:text-indigo-800 break-all select-all font-bold"
                            >
                                {checkInUrl}
                            </a>
                        </div>

                        {/* Token display */}
                        <p className="mt-2 text-center text-[9px] font-mono text-slate-400 font-semibold">Active Workcode Token: {token}</p>
                    </div>

                    {/* Right Column: Guidelines */}
                    <div
                        className="md:col-span-5 flex flex-col justify-center rounded-3xl bg-white border border-slate-200 p-6 shadow-md cursor-pointer transition-all hover:border-indigo-300 hover:shadow-lg"
                        data-aos="fade-left"
                        data-aos-delay="100"
                        onClick={() => setIsFullscreenQrOpen(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(workcode) => {
                            if (workcode.key === 'Enter' || workcode.key === ' ') {
                                e.preventDefault();
                                setIsFullscreenQrOpen(true);
                            }
                        }}
                        aria-label="Buka petunjuk Master QR layar penuh"
                    >
                        <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-100 pb-2">Petunjuk Penggunaan:</h4>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-3 font-medium">
                            <li>
                                <strong className="text-slate-800">Tampilkan di Layar Utama:</strong> Proyeksikan halaman ini di depan aula sekolah agar dapat dipindai bersama.
                            </li>
                            <li>
                                <strong className="text-slate-800">Scan via Kamera HP:</strong> Peserta cukup membuka kamera smartphone untuk memindai tautan presensi.
                            </li>
                            <li>
                                <strong className="text-slate-800">Tanpa Perlu Akun:</strong> Peserta langsung diarahkan ke form pengisian kehadiran yang praktis.
                            </li>
                            <li>
                                <strong className="text-slate-800">Keamanan Token:</strong> Klik tombol <strong className="text-indigo-600">"Regenerasi Token"</strong> jika link lama sudah usang atau ingin dinonaktifkan.
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {isFullscreenQrOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-white text-slate-950"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Master QR Code layar penuh"
                >
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
                        <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-700">
                                Master QR Code Presensi
                            </p>
                            <h3 className="truncate text-lg font-black text-slate-950 sm:text-2xl">
                                {activeWorkcode ? activeWorkcode.nama_workcode : 'Belum Ada Workcode Aktif'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFullscreenQrOpen(false)}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Tutup layar penuh"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-4 text-center sm:px-8">
                        <div className="w-full max-w-[min(58vh,720px,86vw)] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
                            <div
                                className="mx-auto w-full text-indigo-950 qr-svg-container qr-svg-fullscreen"
                                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                            />
                        </div>

                        <div className="w-full max-w-4xl shrink-0 space-y-3">
                            <p className="text-base font-extrabold text-slate-900 sm:text-xl">
                                {activeWorkcode
                                    ? `Scan QR ini untuk presensi mandiri pada workcode "${activeWorkcode.nama_workcode}".`
                                    : 'Aktifkan workcode terlebih dahulu agar hasil scan tercatat.'}
                            </p>
                            <p className="mx-auto max-w-3xl break-all rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-bold text-indigo-800 sm:text-base">
                                {checkInUrl}
                            </p>
                            <p className="text-xs font-semibold text-slate-600">
                                Tekan Escape atau tombol X untuk keluar dari tampilan layar penuh.
                            </p>
                        </div>
                    </div>
                </div>
                , document.body
            )}

            <style>{`
                .qr-svg-container svg {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 100% !important;
                    display: block;
                }
                .qr-svg-fullscreen svg {
                    max-height: min(58vh, 720px, 86vw) !important;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
