import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '@/Components/ConfirmDialog';
import { backgroundReload } from '@/lib/backgroundReload';
import { icons } from '@/lib/adminMenu';

// Muat ulang daftar QR tiap 30 detik, dan juga tepat saat jadwal workcode berganti.
const REFRESH_INTERVAL_MS = 30000;
const MAX_TIMEOUT_MS = 2147483647;
// Mode layar penuh yang menampilkan semua QR workcode aktif berdampingan.
const ALL = 'all';

const UNAVAILABLE_MESSAGES = {
    harian: 'Presensi harian dilakukan lewat QR pribadi peserta / aplikasi, bukan QR presensi mandiri.',
    closed_by_selection: 'Ditutup: ada workcode aktif lain yang pesertanya sudah dipilih. Atur peserta workcode ini agar QR-nya dapat dipakai.',
};

function formatTime(time) {
    return time ? time.slice(0, 5) : '';
}

function formatSchedule(workcode) {
    if (!workcode.jam_aktif_mulai || !workcode.jam_aktif_selesai) {
        return workcode.kategori === 'harian' ? 'Presensi harian' : 'Aktif manual';
    }

    return `${formatTime(workcode.jam_aktif_mulai)} – ${formatTime(workcode.jam_aktif_selesai)}`;
}

function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, '0');

    return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

function QrSvg({ svg, className = '' }) {
    return (
        <div
            className={`w-full h-full text-neutral-950 qr-svg-container ${className}`}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

// Waktu server saat ini, berdetak tiap detik selama ada jadwal berikutnya (untuk hitung mundur).
function useServerNow(serverTime, enabled) {
    const offset = useMemo(
        () => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0),
        [serverTime],
    );
    const [now, setNow] = useState(() => Date.now() + offset);

    useEffect(() => {
        setNow(Date.now() + offset);
        if (!enabled) {
            return;
        }

        const tick = window.setInterval(() => setNow(Date.now() + offset), 1000);

        return () => window.clearInterval(tick);
    }, [offset, enabled]);

    return now;
}

function NextUp({ upcoming, now, large = false }) {
    if (!upcoming) {
        return null;
    }

    const remaining = new Date(upcoming.starts_at).getTime() - now;

    return (
        <p className={`font-bold text-slate-600 ${large ? 'text-base sm:text-xl' : 'text-xs'}`}>
            Berikutnya: <span className="font-bold text-neutral-800">{upcoming.nama_workcode}</span>
            {` pukul ${formatTime(upcoming.jam_aktif_mulai)}`}
            {remaining > 0 && <span className="font-mono"> · dalam {formatCountdown(remaining)}</span>}
        </p>
    );
}

export default function MasterQr({ workcodeQrs = [], upcomingWorkcodes = [], nextChangeAt = null, serverTime = null }) {
    const confirm = useConfirm();
    const [processingId, setProcessingId] = useState(null);
    const [fullscreenId, setFullscreenId] = useState(null);
    const now = useServerNow(serverTime, upcomingWorkcodes.length > 0);

    const usableQrs = workcodeQrs.filter((item) => item.qrCodeSvg);
    const nextUpcoming = upcomingWorkcodes[0] || null;
    const isFullscreenOpen = fullscreenId !== null;
    // Saat layar penuh dibiarkan terbuka dan workcode-nya berakhir, pindah ke QR workcode aktif berikutnya.
    const fullscreenItems = !isFullscreenOpen
        ? []
        : fullscreenId === ALL
            ? usableQrs
            : [usableQrs.find((item) => item.workcode.id === fullscreenId) || usableQrs[0]].filter(Boolean);
    const isSplit = fullscreenItems.length > 1;

    useEffect(() => {
        const reload = () => backgroundReload({
            only: ['workcodeQrs', 'upcomingWorkcodes', 'nextChangeAt', 'serverTime'],
            preserveScroll: true,
            preserveState: true,
        });

        const interval = window.setInterval(reload, REFRESH_INTERVAL_MS);

        let timeout = null;
        if (nextChangeAt && serverTime) {
            // Hitung dari jam server agar jam perangkat yang tidak sinkron tidak berpengaruh.
            const delay = new Date(nextChangeAt).getTime() - new Date(serverTime).getTime() + 1000;
            if (delay > 0 && delay < MAX_TIMEOUT_MS) {
                timeout = window.setTimeout(reload, delay);
            }
        }

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                reload();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.clearInterval(interval);
            if (timeout) {
                window.clearTimeout(timeout);
            }
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [nextChangeAt, serverTime]);

    useEffect(() => {
        if (!isFullscreenOpen) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setFullscreenId(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreenOpen]);

    const handleRegenerate = async (workcode) => {
        const confirmed = await confirm({
            title: 'Regenerasi Token URL',
            message: `Regenerasi token QR workcode "${workcode.nama_workcode}"? URL absen lama workcode ini akan segera dinonaktifkan.`,
            type: 'warning',
            confirmText: 'Ya, Regenerasi',
            cancelText: 'Batal',
        });
        if (!confirmed) {
            return;
        }

        router.post(route('admin.master-qr.regenerate'), { workcode_id: workcode.id }, {
            preserveScroll: true,
            onStart: () => setProcessingId(workcode.id),
            onFinish: () => setProcessingId(null),
        });
    };

    const openFullscreen = (item) => {
        if (item.qrCodeSvg) {
            setFullscreenId(item.workcode.id);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master QR Code" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                <div className="mb-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-aos="fade-up">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-neutral-800">Master QR</h3>
                        <p className="mt-0.5 flex items-center gap-2 text-sm text-neutral-500">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${workcodeQrs.length ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                            {workcodeQrs.length
                                ? `${workcodeQrs.length} workcode aktif · QR diperbarui otomatis`
                                : 'Belum ada workcode aktif · QR muncul otomatis saat jadwal dimulai'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFullscreenId(ALL)}
                        className="btn-brand self-start sm:self-auto"
                        title="Tampilkan QR aktif di layar penuh (untuk proyektor)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                        </svg>
                        {usableQrs.length > 1 ? 'Proyeksikan semua QR' : 'Mode proyektor'}
                    </button>
                </div>

                {usableQrs.length > 1 && (
                    <div className="mb-4 shrink-0 rounded-lg bg-brand-gradient p-4 text-sm text-white shadow-soft" role="status" data-aos="fade-up">
                        <strong className="font-semibold">{usableQrs.length} QR aktif bersamaan.</strong> Setiap QR hanya mencatat presensi ke workcode-nya.
                        Gunakan "Proyeksikan semua QR" untuk menampilkannya berdampingan, atau klik salah satu kartu untuk menampilkan QR itu saja.
                    </div>
                )}

                <section className="grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-3">
                    <div data-aos="fade-up" className="xl:col-span-2 xl:-mx-1 xl:min-h-0 xl:overflow-y-auto xl:px-1 xl:pb-1">
                        {workcodeQrs.length === 0 ? (
                            <div className="card-soft px-6 py-14 text-center" data-aos="fade-up">
                                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-dark">
                                    <span className="h-6 w-6">{icons.qr}</span>
                                </span>
                                <h4 className="text-base font-semibold text-neutral-800">Belum ada workcode aktif</h4>
                                <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
                                    QR muncul otomatis di halaman ini ketika jadwal workcode dimulai atau workcode diaktifkan.
                                </p>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 gap-4 ${workcodeQrs.length > 1 ? 'md:grid-cols-2' : ''}`}>
                                {workcodeQrs.map((item) => {
                                    const { workcode } = item;
                                    const usable = Boolean(item.qrCodeSvg);

                                    return (
                                        <div
                                            key={workcode.id}
                                            className={`card-soft group flex flex-col transition-shadow duration-200 ${usable ? 'cursor-pointer hover:shadow-soft-lg' : 'opacity-90'}`}
                                            onClick={() => openFullscreen(item)}
                                            role={usable ? 'button' : undefined}
                                            tabIndex={usable ? 0 : undefined}
                                            onKeyDown={(event) => {
                                                if (usable && (event.key === 'Enter' || event.key === ' ')) {
                                                    event.preventDefault();
                                                    openFullscreen(item);
                                                }
                                            }}
                                            aria-label={usable ? `Buka QR ${workcode.nama_workcode} layar penuh` : undefined}
                                        >
                                            <div className="flex items-start justify-between gap-3 p-4 pb-3">
                                                <div className="min-w-0">
                                                    <h6 className="truncate text-base font-semibold text-neutral-800">{workcode.nama_workcode}</h6>
                                                    <p className="truncate text-sm text-neutral-500">
                                                        {formatSchedule(workcode)}
                                                        {workcode.participants_count > 0 ? ` · ${workcode.participants_count} peserta dipilih` : ' · semua peserta'}
                                                    </p>
                                                </div>
                                                {usable && (
                                                    <button
                                                        type="button"
                                                        disabled={processingId === workcode.id}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleRegenerate(workcode);
                                                        }}
                                                        title="Buat ulang token link"
                                                        aria-label={`Buat ulang token link ${workcode.nama_workcode}`}
                                                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${processingId === workcode.id ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {usable ? (
                                                <>
                                                    <div className="mx-auto mb-4 w-full max-w-[220px] px-4 transition-transform duration-300 group-hover:scale-[1.03]">
                                                        <QrSvg svg={item.qrCodeSvg} />
                                                    </div>
                                                    <hr className="hr-fade mt-auto" />
                                                    <div className="p-4 py-3">
                                                        <p className="text-xs text-neutral-500">Link presensi mandiri</p>
                                                        <a
                                                            href={item.checkInUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(event) => event.stopPropagation()}
                                                            className="mt-0.5 block select-all break-all font-mono text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
                                                        >
                                                            {item.checkInUrl}
                                                        </a>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="mx-4 mb-4 rounded-md bg-gradient-to-b from-amber-400 to-orange-500 p-3 text-xs text-white">
                                                    {UNAVAILABLE_MESSAGES[item.unavailable_reason]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div data-aos="fade-up" data-aos-delay="100" className="space-y-4 xl:-mx-1 xl:min-h-0 xl:overflow-y-auto xl:px-1 xl:pb-1">
                        {upcomingWorkcodes.length > 0 && (
                            <div className="card-soft p-4">
                                <h6 className="text-base font-semibold text-neutral-800">Jadwal Berikutnya</h6>
                                <div className="mt-0.5 text-sm text-neutral-500"><NextUp upcoming={nextUpcoming} now={now} /></div>
                                <ol className="relative mt-4 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-neutral-200">
                                    {upcomingWorkcodes.map((workcode) => (
                                        <li key={workcode.id} className="relative flex items-start gap-3 pl-0">
                                            <span className="relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-white bg-brand-600" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-neutral-800">{workcode.nama_workcode}</p>
                                                <p className="text-xs font-medium tabular-nums text-neutral-500">
                                                    {formatTime(workcode.jam_aktif_mulai)} – {formatTime(workcode.jam_aktif_selesai)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="card-soft p-4">
                            <h6 className="text-base font-semibold text-neutral-800">Petunjuk</h6>
                            <p className="mt-0.5 text-sm text-neutral-500">Cara kerja QR presensi mandiri</p>
                            <hr className="hr-fade my-3" />
                            <dl className="space-y-3 text-sm">
                                {[
                                    ['Satu QR per workcode', 'Hasil scan selalu tercatat ke workcode milik QR yang dipindai, selama workcode itu aktif.'],
                                    ['Beberapa workcode', 'Pakai "Proyeksikan semua QR" agar semua QR aktif tampil berdampingan.'],
                                    ['Workcode berurutan', 'Biarkan mode proyektor terbuka; QR berganti otomatis mengikuti jadwal.'],
                                    ['Peserta terpilih', 'Peserta hanya bisa presensi pada workcode yang memilihnya.'],
                                    ['Keamanan token', 'Tombol putar pada kartu QR membuat link lama tidak berlaku lagi.'],
                                ].map(([title, body]) => (
                                    <div key={title}>
                                        <dt className="font-semibold text-neutral-800">{title}</dt>
                                        <dd className="text-neutral-500">{body}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </section>
            </div>

            {isFullscreenOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-white text-slate-950"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Master QR Code layar penuh"
                >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-800">
                                Master QR Code Presensi
                            </p>
                            <h3 className="truncate text-lg font-bold text-slate-950 sm:text-2xl">
                                {fullscreenItems.length === 0
                                    ? 'Belum Ada Workcode Aktif'
                                    : isSplit
                                        ? `${fullscreenItems.length} Workcode Aktif`
                                        : fullscreenItems[0].workcode.nama_workcode}
                            </h3>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {usableQrs.length > 1 && (
                                <div className="hidden items-center gap-2 sm:flex">
                                    <button
                                        type="button"
                                        onClick={() => setFullscreenId(ALL)}
                                        className={`rounded-full border px-3 py-2 text-xs font-bold ${fullscreenId === ALL ? 'border-neutral-600 bg-brand-gradient text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                                    >
                                        Semua
                                    </button>
                                    {usableQrs.map((item) => (
                                        <button
                                            key={item.workcode.id}
                                            type="button"
                                            onClick={() => setFullscreenId(item.workcode.id)}
                                            className={`max-w-[12rem] truncate rounded-full border px-3 py-2 text-xs font-bold ${fullscreenId !== ALL && fullscreenItems[0]?.workcode.id === item.workcode.id ? 'border-neutral-600 bg-brand-gradient text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                                        >
                                            {item.workcode.nama_workcode}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setFullscreenId(null)}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                aria-label="Tutup layar penuh"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-4 text-center sm:px-8">
                        {fullscreenItems.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-base font-bold text-slate-700 sm:text-2xl">
                                    Belum ada workcode aktif.
                                </p>
                                {nextUpcoming
                                    ? <NextUp upcoming={nextUpcoming} now={now} large />
                                    : <p className="text-sm font-semibold text-slate-500">QR akan tampil otomatis saat workcode berikutnya dimulai.</p>}
                            </div>
                        )}

                        {fullscreenItems.length === 1 && (
                            <>
                                <div className="w-full max-w-[min(58vh,720px,86vw)] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft-lg sm:p-5">
                                    <QrSvg svg={fullscreenItems[0].qrCodeSvg} className="qr-svg-fullscreen mx-auto" />
                                </div>
                                <div className="w-full max-w-4xl shrink-0 space-y-3">
                                    <p className="text-base font-bold text-slate-900 sm:text-xl">
                                        {`Scan QR ini untuk presensi mandiri pada workcode "${fullscreenItems[0].workcode.nama_workcode}".`}
                                    </p>
                                    <p className="mx-auto max-w-3xl break-all rounded-md border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-bold text-neutral-800 sm:text-base">
                                        {fullscreenItems[0].checkInUrl}
                                    </p>
                                </div>
                            </>
                        )}

                        {isSplit && (
                            <>
                                <p className="text-sm font-bold text-slate-900 sm:text-lg">
                                    Pindai QR sesuai workcode Anda. Setiap QR hanya mencatat presensi ke workcode di atasnya.
                                </p>
                                <div className={`grid w-full max-w-7xl gap-4 sm:gap-6 ${fullscreenItems.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
                                    {fullscreenItems.map((item) => (
                                        <div key={item.workcode.id} className="flex min-w-0 flex-col items-center gap-3 rounded-[2rem] border-2 border-neutral-200 bg-white p-4 shadow-soft-lg">
                                            <div className="w-full min-w-0">
                                                <p className="truncate text-lg font-bold text-neutral-800 sm:text-2xl">{item.workcode.nama_workcode}</p>
                                                <p className="text-xs font-bold text-slate-500 sm:text-sm">
                                                    {formatSchedule(item.workcode)}
                                                    {item.workcode.participants_count > 0 ? ' · khusus peserta terpilih' : ' · semua peserta'}
                                                </p>
                                            </div>
                                            <QrSvg svg={item.qrCodeSvg} className="qr-svg-split mx-auto" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {fullscreenItems.length > 0 && nextUpcoming && <NextUp upcoming={nextUpcoming} now={now} />}
                        <p className="text-xs font-semibold text-slate-600">
                            QR berganti otomatis mengikuti jadwal workcode. Tekan Escape atau tombol X untuk keluar.
                        </p>
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
                .qr-svg-split {
                    max-width: min(52vh, 560px);
                }
                .qr-svg-split svg {
                    max-height: min(52vh, 560px) !important;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
