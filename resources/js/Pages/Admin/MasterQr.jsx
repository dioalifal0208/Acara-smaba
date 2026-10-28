import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { backgroundReload } from '@/lib/backgroundReload';
import { Button, Card, EmptyState, IconButton, PageHeader, Section, useConfirm } from '@/ui';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, Maximize, QrCode, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

// Muat ulang daftar QR tiap 30 detik, dan juga tepat saat jadwal workcode berganti.
const REFRESH_INTERVAL_MS = 30000;
const MAX_TIMEOUT_MS = 2147483647;
// Mode layar penuh yang menampilkan semua QR workcode aktif berdampingan.
const ALL = 'all';

const UNAVAILABLE_MESSAGES = {
    harian: 'Presensi harian dilakukan lewat QR pribadi peserta atau aplikasi, bukan QR presensi mandiri.',
    closed_by_selection: 'Ditutup karena ada workcode aktif lain yang pesertanya sudah dipilih. Atur peserta workcode ini agar QR-nya bisa dipakai.',
};

function formatTime(time) {
    return time ? time.slice(0, 5) : '';
}

function formatSchedule(workcode) {
    if (!workcode.jam_aktif_mulai || !workcode.jam_aktif_selesai) {
        return workcode.kategori === 'harian' ? 'Presensi harian' : 'Aktif manual';
    }

    return `${formatTime(workcode.jam_aktif_mulai)}–${formatTime(workcode.jam_aktif_selesai)}`;
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
    return <div className={`qr-svg-container h-full w-full text-neutral-950 ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// Waktu server saat ini, berdetak tiap detik selama ada jadwal berikutnya (untuk hitung mundur).
function useServerNow(serverTime, enabled) {
    const offset = useMemo(() => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0), [serverTime]);
    const [now, setNow] = useState(() => Date.now() + offset);

    useEffect(() => {
        setNow(Date.now() + offset);
        if (!enabled) return undefined;
        const tick = window.setInterval(() => setNow(Date.now() + offset), 1000);
        return () => window.clearInterval(tick);
    }, [offset, enabled]);

    return now;
}

function NextUp({ upcoming, now, large = false }) {
    if (!upcoming) return null;
    const remaining = new Date(upcoming.starts_at).getTime() - now;

    return (
        <span className={large ? 'block text-base text-neutral-700 sm:text-xl' : undefined}>
            Berikutnya: <span className="font-semibold">{upcoming.nama_workcode}</span>
            {` pukul ${formatTime(upcoming.jam_aktif_mulai)}`}
            {remaining > 0 && <span className="tabular-nums"> · dalam {formatCountdown(remaining)}</span>}
        </span>
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
            if (delay > 0 && delay < MAX_TIMEOUT_MS) timeout = window.setTimeout(reload, delay);
        }

        const handleVisibility = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.clearInterval(interval);
            if (timeout) window.clearTimeout(timeout);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [nextChangeAt, serverTime]);

    useEffect(() => {
        if (!isFullscreenOpen) return undefined;
        const handleKeyDown = (event) => event.key === 'Escape' && setFullscreenId(null);
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreenOpen]);

    const handleRegenerate = async (workcode) => {
        const confirmed = await confirm({
            title: 'Buat QR baru?',
            message: `QR dan link presensi mandiri lama untuk ${workcode.nama_workcode} langsung tidak berlaku. QR yang sudah dicetak atau dibagikan harus diganti.`,
            type: 'warning',
            confirmText: 'Buat QR baru',
        });
        if (!confirmed) return;

        router.post(route('admin.master-qr.regenerate'), { workcode_id: workcode.id }, {
            preserveScroll: true,
            onStart: () => setProcessingId(workcode.id),
            onFinish: () => setProcessingId(null),
        });
    };

    const openFullscreen = (item) => item.qrCodeSvg && setFullscreenId(item.workcode.id);

    return (
        <AuthenticatedLayout>
            <Head title="Master QR" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Master QR"
                    description={workcodeQrs.length
                        ? `${workcodeQrs.length} workcode aktif. QR presensi mandiri berganti otomatis mengikuti jadwal.`
                        : 'QR presensi mandiri muncul otomatis saat jadwal workcode dimulai.'}
                    actions={
                        <Button variant="primary" icon={Maximize} onClick={() => setFullscreenId(ALL)}>
                            {usableQrs.length > 1 ? 'Proyeksikan semua QR' : 'Mode proyektor'}
                        </Button>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        {workcodeQrs.length === 0 ? (
                            <Card>
                                <EmptyState
                                    icon={QrCode}
                                    title="Belum ada workcode aktif"
                                    description="QR muncul otomatis di sini ketika jadwal workcode kegiatan dimulai atau workcode diaktifkan."
                                />
                            </Card>
                        ) : (
                            <ul className={`grid gap-4 ${workcodeQrs.length > 1 ? 'md:grid-cols-2' : ''}`}>
                                {workcodeQrs.map((item) => {
                                    const { workcode } = item;
                                    const usable = Boolean(item.qrCodeSvg);

                                    return (
                                        <li key={workcode.id}>
                                            <Card className="flex h-full flex-col">
                                                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                                                    <div className="min-w-0">
                                                        <h2 className="truncate text-base font-semibold text-ink">{workcode.nama_workcode}</h2>
                                                        <p className="truncate text-sm text-ink-2">
                                                            {formatSchedule(workcode)}
                                                            {workcode.participants_count > 0 ? ` · ${workcode.participants_count} peserta dipilih` : ' · semua peserta'}
                                                        </p>
                                                    </div>
                                                    {usable && (
                                                        <IconButton
                                                            icon={RefreshCw}
                                                            label={`Buat QR baru untuk ${workcode.nama_workcode}`}
                                                            onClick={() => handleRegenerate(workcode)}
                                                            disabled={processingId === workcode.id}
                                                            className="-mr-2 -mt-1"
                                                        />
                                                    )}
                                                </div>

                                                {usable ? (
                                                    <>
                                                        {/* QR selalu di atas putih agar terbaca kamera di mode gelap. */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openFullscreen(item)}
                                                            aria-label={`Tampilkan QR ${workcode.nama_workcode} layar penuh`}
                                                            className="mx-auto mb-4 w-full max-w-[220px] rounded-xl bg-white p-3"
                                                        >
                                                            <QrSvg svg={item.qrCodeSvg} />
                                                        </button>
                                                        <div className="mt-auto space-y-3 border-t border-line px-5 py-4">
                                                            <div>
                                                                <p className="text-xs text-ink-2">Link presensi mandiri</p>
                                                                <a href={item.checkInUrl} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex max-w-full items-start gap-1 break-all text-sm text-accent hover:underline">
                                                                    {item.checkInUrl}
                                                                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                                </a>
                                                            </div>
                                                            <Button size="sm" icon={Maximize} onClick={() => openFullscreen(item)}>Tampilkan layar penuh</Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="mx-5 mb-5 flex items-start gap-2 rounded-lg border border-status-telat/30 bg-status-telat-soft p-3 text-sm text-ink">
                                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-telat" aria-hidden="true" />
                                                        {UNAVAILABLE_MESSAGES[item.unavailable_reason]}
                                                    </p>
                                                )}
                                            </Card>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-6">
                        {upcomingWorkcodes.length > 0 && (
                            <Section title="Jadwal berikutnya" description={<NextUp upcoming={nextUpcoming} now={now} />}>
                                <ol className="space-y-3">
                                    {upcomingWorkcodes.map((workcode) => (
                                        <li key={workcode.id} className="flex items-baseline justify-between gap-3 text-sm">
                                            <span className="min-w-0 truncate font-medium text-ink">{workcode.nama_workcode}</span>
                                            <span className="shrink-0 tabular-nums text-ink-2">{formatTime(workcode.jam_aktif_mulai)}–{formatTime(workcode.jam_aktif_selesai)}</span>
                                        </li>
                                    ))}
                                </ol>
                            </Section>
                        )}

                        <Section title="Cara kerja">
                            <dl className="space-y-3 text-sm">
                                {[
                                    ['Satu QR per workcode', 'Hasil scan selalu tercatat ke workcode milik QR yang dipindai, selama workcode itu aktif.'],
                                    ['Beberapa workcode', 'Pakai "Proyeksikan semua QR" agar semua QR aktif tampil berdampingan.'],
                                    ['Workcode berurutan', 'Biarkan mode proyektor terbuka; QR berganti otomatis mengikuti jadwal.'],
                                    ['Peserta terpilih', 'Peserta hanya bisa presensi pada workcode yang memilihnya.'],
                                    ['Keamanan', 'Tombol putar di kartu QR membuat QR dan link lama tidak berlaku lagi.'],
                                ].map(([title, body]) => (
                                    <div key={title}>
                                        <dt className="font-medium text-ink">{title}</dt>
                                        <dd className="text-ink-2">{body}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Section>
                    </div>
                </div>
            </div>

            {/* Mode proyektor: selalu putih (tidak ikut tema) agar QR terbaca dari jauh. */}
            {isFullscreenOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-white text-neutral-950" role="dialog" aria-modal="true" aria-label="QR presensi mandiri layar penuh">
                    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 sm:px-6">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-600">QR presensi mandiri</p>
                            <h2 className="truncate text-lg font-semibold text-neutral-950 sm:text-2xl">
                                {fullscreenItems.length === 0
                                    ? 'Belum ada workcode aktif'
                                    : isSplit
                                        ? `${fullscreenItems.length} workcode aktif`
                                        : fullscreenItems[0].workcode.nama_workcode}
                            </h2>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {usableQrs.length > 1 && (
                                <div className="hidden items-center gap-2 sm:flex">
                                    <ChipButton active={fullscreenId === ALL} onClick={() => setFullscreenId(ALL)}>Semua</ChipButton>
                                    {usableQrs.map((item) => (
                                        <ChipButton
                                            key={item.workcode.id}
                                            active={fullscreenId !== ALL && fullscreenItems[0]?.workcode.id === item.workcode.id}
                                            onClick={() => setFullscreenId(item.workcode.id)}
                                        >
                                            {item.workcode.nama_workcode}
                                        </ChipButton>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setFullscreenId(null)}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
                                aria-label="Tutup layar penuh"
                                autoFocus
                            >
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-4 text-center sm:px-8">
                        {fullscreenItems.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-base font-semibold text-neutral-700 sm:text-2xl">Belum ada workcode aktif.</p>
                                {nextUpcoming
                                    ? <NextUp upcoming={nextUpcoming} now={now} large />
                                    : <p className="text-sm text-neutral-600">QR tampil otomatis saat workcode berikutnya dimulai.</p>}
                            </div>
                        )}

                        {fullscreenItems.length === 1 && (
                            <>
                                <div className="w-full max-w-[min(58vh,720px,86vw)] rounded-3xl border border-neutral-200 bg-white p-4 sm:p-5">
                                    <QrSvg svg={fullscreenItems[0].qrCodeSvg} className="qr-svg-fullscreen mx-auto" />
                                </div>
                                <div className="w-full max-w-4xl shrink-0 space-y-3">
                                    <p className="text-base font-semibold text-neutral-900 sm:text-xl">
                                        {`Scan QR ini untuk presensi mandiri di "${fullscreenItems[0].workcode.nama_workcode}".`}
                                    </p>
                                    <p className="mx-auto max-w-3xl break-all rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 sm:text-base">
                                        {fullscreenItems[0].checkInUrl}
                                    </p>
                                </div>
                            </>
                        )}

                        {isSplit && (
                            <>
                                <p className="text-sm font-semibold text-neutral-900 sm:text-lg">
                                    Pindai QR sesuai workcode Anda. Setiap QR hanya mencatat presensi ke workcode di atasnya.
                                </p>
                                <div className={`grid w-full max-w-7xl gap-4 sm:gap-6 ${fullscreenItems.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
                                    {fullscreenItems.map((item) => (
                                        <div key={item.workcode.id} className="flex min-w-0 flex-col items-center gap-3 rounded-3xl border-2 border-neutral-200 bg-white p-4">
                                            <div className="w-full min-w-0">
                                                <p className="truncate text-lg font-semibold text-neutral-900 sm:text-2xl">{item.workcode.nama_workcode}</p>
                                                <p className="text-sm text-neutral-600">
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

                        {fullscreenItems.length > 0 && nextUpcoming && (
                            <p className="text-sm text-neutral-700"><NextUp upcoming={nextUpcoming} now={now} /></p>
                        )}
                        <p className="text-sm text-neutral-600">QR berganti otomatis mengikuti jadwal workcode. Tekan Esc atau tombol X untuk keluar.</p>
                    </div>
                </div>,
                document.body,
            )}

            <style>{`
                .qr-svg-container svg { width: 100% !important; height: auto !important; max-width: 100% !important; display: block; }
                .qr-svg-fullscreen svg { max-height: min(58vh, 720px, 86vw) !important; }
                .qr-svg-split { max-width: min(52vh, 560px); }
                .qr-svg-split svg { max-height: min(52vh, 560px) !important; }
            `}</style>
        </AuthenticatedLayout>
    );
}

function ChipButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`h-10 max-w-[12rem] truncate rounded-full border px-4 text-sm font-medium ${active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'}`}
        >
            {children}
        </button>
    );
}
