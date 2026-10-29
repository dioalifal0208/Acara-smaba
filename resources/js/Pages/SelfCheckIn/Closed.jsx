import PublicShell from '@/Layouts/PublicShell';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { Card, cx } from '@/ui';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, Hourglass, IdCard, Lock, PauseCircle, QrCode } from 'lucide-react';
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

/** Isi per alasan dari server: ikon, warna ikon, judul, dan langkah yang perlu dilakukan. */
const CONTENT = {
    invalid: {
        icon: QrCode,
        tone: 'text-status-telat',
        title: 'QR sudah tidak berlaku',
        steps: [
            'Pindai ulang QR terbaru yang sedang ditampilkan panitia di lokasi acara.',
            'Jangan memakai foto, tangkapan layar, atau tautan QR yang dibagikan sebelumnya. QR bisa diperbarui panitia kapan saja.',
        ],
    },
    ended: {
        icon: Hourglass,
        tone: 'text-status-alpha',
        title: 'Presensi sudah ditutup',
        steps: [
            'Waktu presensi acara ini sudah selesai, jadi QR dan tautannya tidak berlaku lagi.',
            'Jika Anda hadir tetapi belum sempat presensi, segera hubungi panitia atau admin untuk dicatat.',
        ],
    },
    not_started: {
        icon: Clock,
        tone: 'text-status-izin',
        title: 'Presensi belum dibuka',
        steps: ['Biarkan halaman ini terbuka. Form presensi muncul sendiri saat waktunya tiba.'],
    },
    inactive: {
        icon: PauseCircle,
        tone: 'text-status-telat',
        title: 'Presensi dihentikan sementara',
        steps: [
            'Panitia sedang menghentikan presensi acara ini.',
            'Biarkan halaman ini terbuka. Form presensi muncul sendiri saat dibuka kembali.',
        ],
    },
    closed_by_selection: {
        icon: Lock,
        tone: 'text-status-telat',
        title: 'Presensi ditutup sementara',
        steps: [
            'Sedang berlangsung acara lain yang hanya untuk peserta terpilih.',
            'Jika Anda termasuk peserta terpilih, pindai QR acara tersebut yang ditampilkan panitia.',
        ],
    },
    harian: {
        icon: IdCard,
        tone: 'text-status-izin',
        title: 'Gunakan presensi Work From Office',
        steps: [
            'Presensi Work From Office tidak memakai QR presensi mandiri.',
            'Presensi lewat aplikasi PRESENSI SMABA di HP, atau tunjukkan QR pribadi Anda kepada petugas.',
        ],
    },
};

function formatTime(time) {
    return time ? time.slice(0, 5) : null;
}

function formatDate(date) {
    if (!date) return null;
    const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);
    return Number.isNaN(parsed.getTime())
        ? date
        : parsed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Closed({ reason, message, temporary = false, workcode = null, hasOtherActiveWorkcode = false, serverTime = null }) {
    const content = CONTENT[reason] || CONTENT.invalid;
    const Icon = content.icon;
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
        <PublicShell>
            <Head title={content.title} />

            <div className="space-y-6">
                <div className="pt-4 text-center">
                    <Icon className={cx('mx-auto h-14 w-14', content.tone)} strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{content.title}</h1>
                    {message && <p className="mt-2 text-sm text-ink-2">{message}</p>}
                </div>

                {localLock && (
                    <Card className="flex gap-3 p-4" role="status">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-status-hadir" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-ink">Presensi Anda sudah tercatat</p>
                            <p className="mt-1 text-base font-semibold text-ink">{localLock.participant?.nama}</p>
                            <p className="text-sm tabular-nums text-ink-2">
                                {localLock.participant?.nis_nip || localLock.participant?.status || 'Tanpa NIP'}
                                {localLock.timestamp ? ` · pukul ${localLock.timestamp}` : ''}
                            </p>
                            <p className="mt-2 text-sm text-ink-2">Tidak perlu presensi ulang.</p>
                        </div>
                    </Card>
                )}

                {workcode && (
                    <Card className="p-4">
                        <p className="text-sm text-ink-2">Acara</p>
                        <p className="mt-0.5 text-base font-semibold text-ink">{workcode.nama_workcode}</p>
                        {(workcode.tanggal || (start && end)) && (
                            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
                                {workcode.tanggal && (
                                    <div className="col-span-2">
                                        <dt className="text-ink-2">Tanggal</dt>
                                        <dd className="font-medium text-ink">{formatDate(workcode.tanggal)}</dd>
                                    </div>
                                )}
                                {start && end && (
                                    <>
                                        <div>
                                            <dt className="text-ink-2">Dibuka</dt>
                                            <dd className="font-medium tabular-nums text-ink">{start} WIB</dd>
                                        </div>
                                        <div>
                                            <dt className="text-ink-2">Ditutup</dt>
                                            <dd className="font-medium tabular-nums text-ink">{end} WIB</dd>
                                        </div>
                                    </>
                                )}
                            </dl>
                        )}
                    </Card>
                )}

                {!localLock && (
                    <section aria-labelledby="next-steps">
                        <h2 id="next-steps" className="text-sm font-medium text-ink">Yang perlu dilakukan</h2>
                        <ul className="mt-2 space-y-2">
                            {content.steps.map((step) => (
                                <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {hasOtherActiveWorkcode && reason !== 'harian' && (
                    <p className="rounded-xl border border-line bg-surface-2 p-4 text-sm text-ink">
                        Ada presensi acara lain yang sedang dibuka. Pindai QR terbaru yang ditampilkan panitia untuk acara itu.
                    </p>
                )}

                {(temporary && !localLock) || checkedAt ? (
                    <p className="text-center text-xs text-ink-2" role="status">
                        {temporary && !localLock && 'Halaman memeriksa ulang secara otomatis. '}
                        {checkedAt && `Diperiksa pukul ${checkedAt} WIB.`}
                    </p>
                ) : null}
            </div>
        </PublicShell>
    );
}
