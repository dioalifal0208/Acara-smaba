import { Head } from '@inertiajs/react';
import { appUrl } from '@/lib/appUrl';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { useEffect, useState } from 'react';

// Halaman yang ditutup sementara memeriksa ulang ke server, lalu otomatis kembali ke form bila workcode aktif lagi.
// Interval longgar + acak agar banyak HP di belakang satu IP Wi-Fi sekolah tidak terkena batas permintaan.
const RECHECK_INTERVAL_MS = 45000;
const MAX_TIMEOUT_MS = 2147483647;

// Kunci lokal yang sama dengan Form: perangkat ini sudah berhasil presensi untuk workcode tersebut.
function getLocalLock(workcodeId) {
    try {
        const raw = localStorage.getItem(`smaba_locked_workcode_${workcodeId}`);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

const CONTENT = {
    invalid: {
        icon: '⌛',
        tone: 'amber',
        title: 'QR / Tautan Presensi Kadaluarsa',
        steps: [
            'QR presensi berganti otomatis setiap hari, dan panitia dapat memperbaruinya kapan saja.',
            'Pindai ulang QR terbaru yang sedang ditampilkan panitia di lokasi kegiatan.',
            'Jangan memakai foto/tangkapan layar QR atau tautan yang dibagikan sebelumnya.',
        ],
    },
    ended: {
        icon: '⏰',
        tone: 'rose',
        title: 'Sesi Presensi Telah Berakhir',
        steps: [
            'Waktu presensi untuk workcode ini sudah selesai, sehingga QR/tautannya tidak berlaku lagi.',
            'Jika Anda hadir tetapi belum sempat presensi, segera hubungi panitia/admin untuk pencatatan.',
        ],
    },
    not_started: {
        icon: '🕒',
        tone: 'sky',
        title: 'Sesi Presensi Belum Dimulai',
        steps: [
            'Tetap buka halaman ini. Form presensi akan terbuka otomatis ketika sesi dimulai.',
        ],
    },
    inactive: {
        icon: '⏸️',
        tone: 'amber',
        title: 'Presensi Dinonaktifkan Sementara',
        steps: [
            'Panitia sedang menonaktifkan sesi presensi workcode ini.',
            'Tetap buka halaman ini. Form presensi akan terbuka otomatis ketika diaktifkan kembali.',
        ],
    },
    closed_by_selection: {
        icon: '🔒',
        tone: 'amber',
        title: 'Presensi Ditutup Sementara',
        steps: [
            'Saat ini sedang berlangsung workcode lain yang hanya untuk peserta terpilih.',
            'Jika Anda termasuk peserta terpilih, pindai QR workcode tersebut yang ditampilkan panitia.',
        ],
    },
    harian: {
        icon: '🪪',
        tone: 'sky',
        title: 'Gunakan QR Pribadi',
        steps: [
            'Presensi harian tidak memakai QR presensi mandiri.',
            'Tunjukkan QR Code Pribadi Anda kepada petugas/admin, atau gunakan aplikasi E-Presensi.',
        ],
    },
};

const TONES = {
    amber: { ring: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', title: 'text-amber-900' },
    rose: { ring: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', title: 'text-rose-900' },
    sky: { ring: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', title: 'text-sky-900' },
};

function formatTime(time) {
    return time ? time.slice(0, 5) : null;
}

function formatDate(date) {
    if (!date) {
        return null;
    }

    const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);

    return Number.isNaN(parsed.getTime())
        ? date
        : parsed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Closed({ reason, message, temporary = false, workcode = null, hasOtherActiveWorkcode = false, serverTime = null }) {
    const content = CONTENT[reason] || CONTENT.invalid;
    const tone = TONES[content.tone];
    const start = formatTime(workcode?.jam_aktif_mulai);
    const end = formatTime(workcode?.jam_aktif_selesai);
    const checkedAt = serverTime
        ? new Date(serverTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
        : null;

    const [localLock, setLocalLock] = useState(null);

    useEffect(() => {
        setLocalLock(workcode?.id ? getLocalLock(workcode.id) : null);
    }, [workcode?.id]);

    useEffect(() => {
        if (!temporary || localLock) {
            return;
        }

        const recheck = () => backgroundReload({ preserveScroll: true });
        const interval = window.setInterval(recheck, jitteredInterval(RECHECK_INTERVAL_MS));

        // Sesi yang belum dimulai: muat ulang tepat saat jadwal mulai (dihitung dari jam server).
        let timeout = null;
        if (reason === 'not_started' && workcode?.starts_at && serverTime) {
            const delay = new Date(workcode.starts_at).getTime() - new Date(serverTime).getTime() + jitteredInterval(1000, 4000);
            if (delay > 0 && delay < MAX_TIMEOUT_MS) {
                timeout = window.setTimeout(recheck, delay);
            }
        }

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                recheck();
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
    }, [temporary, localLock, reason, workcode?.starts_at, serverTime]);

    return (
        <>
            <Head title={`${content.title} - E-Presensi SMABA`} />

            <div className="relative flex min-h-[100dvh] flex-col justify-between overflow-y-auto bg-canvas p-4 text-slate-800 sm:p-6">
                <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-brand-violet/10 blur-3xl" />

                <header data-aos="fade-down" className="relative z-10 mx-auto flex h-[76px] flex-none items-center justify-center gap-3 text-left">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft ring-1 ring-brand-100">
                        <img src={appUrl('images/logo.png')} alt="Logo E-Presensi SMABA" className="h-full w-full object-contain" />
                    </div>
                    <div>
                        <span className="block text-sm font-extrabold leading-tight tracking-tight text-slate-800">E-Presensi SMABA</span>
                        <span className="block text-[10px] font-bold text-brand-600">SCAN WORKCODE · PRESENSI DIGITAL</span>
                    </div>
                </header>

                <main className="relative z-10 my-6 flex w-full flex-1 items-center justify-center">
                    <div className={`w-full max-w-md rounded-xl border ${tone.ring} bg-white p-6 text-center shadow-soft-lg`} data-aos="zoom-in">
                        <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${tone.badge}`} aria-hidden="true">
                            {content.icon}
                        </div>
                        <h1 className={`text-lg font-extrabold ${tone.title}`}>{content.title}</h1>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{message}</p>

                        {localLock && (
                            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left" role="status">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">✓ Perangkat ini sudah presensi</span>
                                <p className="mt-1 text-sm font-extrabold text-slate-900">{localLock.participant?.nama}</p>
                                <p className="text-xs font-semibold text-emerald-800">
                                    {localLock.participant?.nis_nip || localLock.participant?.status || 'Tanpa NIP'}
                                    {localLock.timestamp ? ` · tercatat pukul ${localLock.timestamp}` : ''}
                                </p>
                                <p className="mt-2 text-[11px] font-semibold text-slate-600">Presensi Anda untuk workcode ini sudah tersimpan. Tidak perlu presensi ulang.</p>
                            </div>
                        )}

                        {workcode && (
                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Workcode</span>
                                <p className="mt-0.5 text-sm font-extrabold text-slate-800">{workcode.nama_workcode}</p>
                                {(workcode.tanggal || (start && end)) && (
                                    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                        {workcode.tanggal && (
                                            <div className="col-span-2">
                                                <dt className="font-bold text-slate-500">Tanggal</dt>
                                                <dd className="font-extrabold text-slate-700">{formatDate(workcode.tanggal)}</dd>
                                            </div>
                                        )}
                                        {start && end && (
                                            <>
                                                <div>
                                                    <dt className="font-bold text-slate-500">Dibuka</dt>
                                                    <dd className="font-extrabold text-slate-700">{start} WIB</dd>
                                                </div>
                                                <div>
                                                    <dt className="font-bold text-slate-500">{reason === 'ended' ? 'Ditutup' : 'Ditutup pukul'}</dt>
                                                    <dd className="font-extrabold text-slate-700">{end} WIB</dd>
                                                </div>
                                            </>
                                        )}
                                    </dl>
                                )}
                            </div>
                        )}

                        {!localLock && (
                            <div className="mt-5 text-left">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Apa yang harus dilakukan?</span>
                                <ul className="mt-2 space-y-2">
                                    {content.steps.map((step) => (
                                        <li key={step} className="flex gap-2 text-xs font-semibold leading-relaxed text-slate-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {hasOtherActiveWorkcode && reason !== 'harian' && (
                            <p className="mt-5 rounded-2xl border border-brand-100 bg-brand-soft p-3 text-left text-[11px] font-bold leading-relaxed text-brand-700">
                                Saat ini ada sesi presensi lain yang sedang berlangsung. Pindai QR terbaru yang ditampilkan panitia untuk sesi tersebut.
                            </p>
                        )}

                        {temporary && !localLock && (
                            <p className="mt-5 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500" role="status">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
                                Memeriksa status presensi secara otomatis…
                            </p>
                        )}

                        {checkedAt && (
                            <p className="mt-3 text-[10px] font-semibold text-slate-400">Diperiksa pukul {checkedAt} WIB</p>
                        )}
                    </div>
                </main>

                <footer className="relative z-10 flex h-12 flex-none items-center justify-center text-center text-[10px] text-slate-500">
                    <p>&copy; {new Date().getFullYear()} E-Presensi SMABA.</p>
                </footer>
            </div>
        </>
    );
}
