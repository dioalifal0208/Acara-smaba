import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AttendanceBoard, Button, Card, EmptyState, IconButton, PageHeader, Section, StatusPill, cx } from '@/ui';
import { Head, usePage } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    AlertCircle, Camera, CameraOff, CheckCircle2, Clock, Copy, History, Lock, Maximize, Minimize, QrCode, Volume2, VolumeX, XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const SOUND_KEY = 'scanner-sound';
const HISTORY_LIMIT = 30;

/**
 * Arti tiap hasil scan dari server (success | warning = terlambat | already | error):
 * ikon besar, warna, label, dan bunyi. Warna selalu ditemani ikon dan teks.
 */
const RESULT = {
    success: { icon: CheckCircle2, color: 'text-status-hadir', soft: 'bg-status-hadir-soft', pill: { status: 'hadir' }, sound: 'success' },
    late: { icon: Clock, color: 'text-status-telat', soft: 'bg-status-telat-soft', pill: { status: 'terlambat' }, sound: 'late' },
    already: { icon: Copy, color: 'text-ink-2', soft: 'bg-surface-2', pill: { tone: 'netral', icon: Copy, label: 'Sudah presensi' }, sound: 'already' },
    error: { icon: XCircle, color: 'text-status-alpha', soft: 'bg-status-alpha-soft', pill: { tone: 'alpha', icon: XCircle, label: 'Gagal' }, sound: 'error' },
};

const kindOf = (status, isLate) => (status === 'warning' || isLate ? 'late' : RESULT[status] ? status : 'error');

const nowTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Pesan galat kamera yang menjelaskan cara memperbaikinya. */
function cameraErrorMessage(err) {
    const name = err.name || '';
    const msg = (err.message || '').toLowerCase();

    if (err.message === 'InsecureContext') return 'Kamera hanya bisa dipakai lewat HTTPS. Buka halaman ini dengan alamat https://.';
    if (err.message === 'UnsupportedBrowser') return 'Browser ini tidak mendukung kamera. Pakai Chrome atau Safari versi terbaru.';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || msg.includes('permission') || msg.includes('denied')) {
        return 'Izin kamera ditolak. Izinkan kamera untuk situs ini di pengaturan browser, lalu muat ulang halaman.';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || msg.includes('not found') || msg.includes('no camera')) {
        return 'Kamera tidak ditemukan di perangkat ini.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError' || msg.includes('in use') || msg.includes('busy') || msg.includes('could not start')) {
        return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.';
    }
    if (name === 'OverconstrainedError') return 'Kamera belakang tidak tersedia di perangkat ini.';
    return 'Kamera gagal dinyalakan. Muat ulang halaman lalu coba lagi.';
}

export default function ScannerIndex({ initialStats, activeWorkcode: propActiveWorkcode }) {
    const { activeWorkcode: globalActiveWorkcode } = usePage().props;
    const activeWorkcode = propActiveWorkcode || globalActiveWorkcode;

    const [stats, setStats] = useState(initialStats);
    const [isScanning, setIsScanning] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [scanLock, setScanLock] = useState({ active: false, style: null });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [soundOn, setSoundOn] = useState(() => {
        try { return window.localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; }
    });

    const html5QrCodeRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastScanRef = useRef({ text: '', at: 0 });
    const cooldownTimerRef = useRef(null);
    const lockTimerRef = useRef(null);
    const gpsDataRef = useRef(null);
    const soundRef = useRef(soundOn);
    soundRef.current = soundOn;

    // Workcode dengan lokasi: posisi perangkat scanner ikut dikirim untuk cek radius.
    useEffect(() => {
        if (!activeWorkcode?.latitude || !activeWorkcode?.longitude) return undefined;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => { gpsDataRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }; },
            () => { gpsDataRef.current = null; },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [activeWorkcode]);

    useEffect(() => {
        const sync = () => setIsFullscreen(document.fullscreenElement != null);
        document.addEventListener('fullscreenchange', sync);
        return () => document.removeEventListener('fullscreenchange', sync);
    }, []);

    // Lepaskan kamera dan timer saat meninggalkan halaman.
    useEffect(() => () => {
        try { html5QrCodeRef.current?.stop(); } catch { /* sudah berhenti */ }
        html5QrCodeRef.current = null;
        clearTimeout(cooldownTimerRef.current);
        clearTimeout(lockTimerRef.current);
    }, []);

    const toggleSound = () => {
        const next = !soundOn;
        setSoundOn(next);
        try { window.localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); } catch { /* tidak tersimpan */ }
    };

    const playSound = useCallback((type) => {
        if (!soundRef.current) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const t = ctx.currentTime;
            const tones = {
                success: [[587.33, 0], [880, 0.1], 0.3],
                late: [[523.25, 0], [659.25, 0.12], 0.35],
                already: [[440, 0], [440, 0.15], 0.35],
            }[type];

            if (tones) {
                osc.frequency.setValueAtTime(tones[0][0], t);
                osc.frequency.setValueAtTime(tones[1][0], t + tones[1][1]);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + tones[2]);
                osc.start(t);
                osc.stop(t + tones[2]);
            } else {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, t);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
            }
        } catch { /* audio tidak tersedia */ }
    }, []);

    // Kotak bidik mengunci ke posisi QR yang terbaca.
    const showScanLock = useCallback((decodedResult) => {
        const bounds = decodedResult?.result?.bounds;
        const video = document.querySelector('#qr-reader video');
        let style = null;
        const w = video?.videoWidth || video?.clientWidth;
        const h = video?.videoHeight || video?.clientHeight;
        if (bounds && w && h) {
            const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
            style = {
                left: `${clamp(((bounds.x + bounds.width / 2) / w) * 100, 18, 82)}%`,
                top: `${clamp(((bounds.y + bounds.height / 2) / h) * 100, 18, 82)}%`,
                width: `${clamp((bounds.width / w) * 100, 26, 62)}%`,
            };
        }
        clearTimeout(lockTimerRef.current);
        setScanLock({ active: true, style });
        lockTimerRef.current = setTimeout(() => setScanLock({ active: false, style: null }), 1200);
    }, []);

    const record = useCallback((entry) => {
        const result = { id: Date.now(), ...entry };
        setLastResult(result);
        setHistory((prev) => [result, ...prev].slice(0, HISTORY_LIMIT));
        playSound(RESULT[entry.kind].sound);
    }, [playSound]);

    const handleScan = useCallback(async (decodedText, decodedResult = null) => {
        if (isProcessingRef.current || !activeWorkcode) return;

        // QR yang sama dalam 3 detik dianggap pindaian ganda dari kamera.
        const now = Date.now();
        if (decodedText === lastScanRef.current.text && now - lastScanRef.current.at < 3000) return;

        isProcessingRef.current = true;
        setProcessing(true);
        showScanLock(decodedResult);
        lastScanRef.current = { text: decodedText, at: now };

        try {
            let body = { qr_token: decodedText };
            if (activeWorkcode.latitude && activeWorkcode.longitude) {
                if (!gpsDataRef.current) throw new Error('Lokasi perangkat belum didapat. Izinkan akses lokasi, tunggu sebentar, lalu scan lagi.');
                body = { ...body, ...gpsDataRef.current };
            }

            const response = await fetch(route('scan', undefined, false), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok && ['success', 'warning', 'already'].includes(data.status)) {
                if (data.stats) setStats(data.stats);
                record({
                    kind: kindOf(data.status, data.is_late),
                    nama: data.participant?.nama || 'Peserta',
                    nis_nip: data.participant?.nis_nip || '',
                    message: data.message,
                    late: data.late_formatted || '',
                    time: data.timestamp || nowTime(),
                });
            } else {
                record({
                    kind: 'error',
                    nama: data.participant?.nama || 'QR tidak dikenali',
                    nis_nip: data.participant?.nis_nip || '',
                    message: response.status === 419
                        ? 'Sesi scanner kedaluwarsa. Muat ulang halaman, lalu login lagi bila diminta.'
                        : data.message || 'QR tidak bisa diproses.',
                    time: nowTime(),
                });
            }
        } catch (err) {
            record({ kind: 'error', nama: 'Scan gagal', nis_nip: '', message: err.message || 'Koneksi bermasalah. Coba scan lagi.', time: nowTime() });
        } finally {
            cooldownTimerRef.current = setTimeout(() => {
                isProcessingRef.current = false;
                setProcessing(false);
            }, 1500);
        }
    }, [activeWorkcode, record, showScanLock]);

    // Dipanggil langsung dari klik agar izin kamera tetap dalam gestur pengguna.
    const startScanner = async () => {
        if (!activeWorkcode) return;
        setCameraError(null);
        setIsCameraLoading(true);
        setIsScanning(true);

        try {
            if (!window.isSecureContext) throw new Error('InsecureContext');
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('UnsupportedBrowser');

            const scanner = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = scanner;
            await scanner.start({ facingMode: 'environment' }, { fps: 10 }, (text, result) => handleScan(text, result), () => {});
            setIsCameraLoading(false);
        } catch (err) {
            setIsCameraLoading(false);
            setIsScanning(false);
            setCameraError(cameraErrorMessage(err));
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch { /* sudah berhenti */ }
            html5QrCodeRef.current = null;
        }
        setIsScanning(false);
        setIsCameraLoading(false);
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else document.documentElement.requestFullscreen?.().catch(() => {});
    };

    const fullscreenSupported = typeof document !== 'undefined' && document.fullscreenEnabled;

    return (
        <AuthenticatedLayout>
            <Head title="Scanner" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Scanner"
                    description={activeWorkcode ? `Presensi QR untuk ${activeWorkcode.nama_workcode}` : 'Presensi terkunci sampai ada workcode aktif.'}
                    actions={
                        <>
                            <IconButton icon={soundOn ? Volume2 : VolumeX} label={soundOn ? 'Matikan suara' : 'Nyalakan suara'} variant="secondary" onClick={toggleSound} aria-pressed={soundOn} />
                            {fullscreenSupported && (
                                <IconButton icon={isFullscreen ? Minimize : Maximize} label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'} variant="secondary" onClick={toggleFullscreen} />
                            )}
                            {isScanning ? (
                                <Button icon={CameraOff} onClick={stopScanner}>Matikan kamera</Button>
                            ) : (
                                <Button variant="primary" icon={Camera} onClick={startScanner} disabled={!activeWorkcode}>
                                    {cameraError ? 'Coba lagi' : 'Nyalakan kamera'}
                                </Button>
                            )}
                        </>
                    }
                />

                {!activeWorkcode && (
                    <Card>
                        <EmptyState
                            icon={Lock}
                            title="Presensi terkunci"
                            description="Scan baru bisa diproses setelah ada workcode yang aktif."
                            action={<Button variant="primary" href={route('workcodes.index')}>Atur workcode</Button>}
                        />
                    </Card>
                )}

                {activeWorkcode && (
                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Kamera */}
                        <div className="space-y-3 lg:col-span-3">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black lg:aspect-video">
                                <div
                                    id="qr-reader"
                                    className="absolute inset-0"
                                    style={{ opacity: isScanning ? 1 : 0, pointerEvents: isScanning ? 'auto' : 'none', zIndex: isScanning ? 1 : -1 }}
                                />

                                {isCameraLoading && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-white">
                                        <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
                                        <p className="text-sm font-medium">Menyalakan kamera…</p>
                                        <p className="mt-1 px-4 text-center text-sm text-white/70">Izinkan akses kamera bila browser bertanya.</p>
                                    </div>
                                )}

                                {isScanning && !isCameraLoading && (
                                    <div className={cx('scanner-overlay', scanLock.active ? 'is-locked' : 'is-searching')} aria-hidden="true">
                                        <div className="scanner-box" style={scanLock.style || undefined}>
                                            <span className="scanner-line" />
                                        </div>
                                    </div>
                                )}

                                {!isScanning && !isCameraLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                                        <QrCode className="mb-3 h-10 w-10 text-white/60" aria-hidden="true" />
                                        <p className="text-base font-medium">Kamera mati</p>
                                        <p className="mt-1 text-sm text-white/70">Tekan Nyalakan kamera, lalu arahkan QR peserta ke kamera.</p>
                                    </div>
                                )}

                                {processing && (
                                    <span className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white">Memproses…</span>
                                )}
                            </div>

                            {cameraError && (
                                <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-ink" role="alert">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                                    <p>{cameraError}</p>
                                </div>
                            )}

                            <AttendanceBoard compact counts={{ hadir: stats.hadir, terlambat: 0, izin: 0, belum: stats.belum }} className="rounded-xl border border-line bg-surface p-4" />
                        </div>

                        {/* Hasil */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Wilayah live tetap ada agar pembaca layar mengumumkan setiap hasil baru. */}
                            <div role="status" aria-live="polite">
                                <LastResult result={lastResult} />
                            </div>

                            <Section
                                title="Riwayat sesi ini"
                                description={history.length ? `${history.length} scan, terbaru di atas` : undefined}
                                actions={history.length > 0 && <Button size="sm" variant="ghost" onClick={() => setHistory([])}>Bersihkan</Button>}
                                flush
                            >
                                {history.length === 0 ? (
                                    <EmptyState icon={History} title="Belum ada scan" description="Setiap hasil scan tercatat di sini sampai halaman ditutup." />
                                ) : (
                                    <ol className="max-h-[22rem] divide-y divide-line overflow-y-auto border-t border-line">
                                        {history.map((item) => (
                                            <li key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-ink">{item.nama}</p>
                                                    <p className="truncate text-xs tabular-nums text-ink-2">{item.time}{item.nis_nip ? ` · ${item.nis_nip}` : ''}</p>
                                                </div>
                                                <ResultPill item={item} />
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </Section>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                #qr-reader { position: absolute !important; inset: 0; border: none !important; width: 100% !important; height: 100% !important; }
                #qr-reader__scan_region { width: 100% !important; height: 100% !important; min-height: unset !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; }
                #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 0 !important; margin: 0 !important; }
                #qr-reader__dashboard_section, #qr-reader__dashboard_section_swaplink, #qr-reader__status_span, #qr-reader__header_message { display: none !important; }

                /* Kotak bidik di atas video (selalu gelap, tidak ikut tema) */
                .scanner-overlay { position: absolute; inset: 0; z-index: 5; pointer-events: none; overflow: hidden; }
                .scanner-box {
                    position: absolute; left: 50%; top: 50%; width: min(280px, 60%); aspect-ratio: 1; max-height: 80%;
                    border: 3px solid rgba(255, 255, 255, 0.9); border-radius: 20px; transform: translate(-50%, -50%);
                    box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.35); transition: all 180ms ease;
                }
                .scanner-line {
                    position: absolute; left: 10%; right: 10%; top: 14%; height: 2px; border-radius: 999px;
                    background: rgba(255, 255, 255, 0.9); animation: scanner-line 1.6s ease-in-out infinite;
                }
                .scanner-overlay.is-locked .scanner-box { border-color: #5cc466; box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.45); }
                .scanner-overlay.is-locked .scanner-line { opacity: 0; animation: none; }
                @keyframes scanner-line { 0%, 100% { top: 14%; opacity: 0.4; } 50% { top: 84%; opacity: 1; } }
                @media (prefers-reduced-motion: reduce) {
                    .scanner-line { animation: none; top: 50%; }
                    .scanner-box { transition: none; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

/** Hasil scan terakhir dibuat besar agar terbaca dari jauh oleh petugas dan peserta. */
function LastResult({ result }) {
    if (!result) {
        return (
            <Card className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
                <QrCode className="mb-3 h-8 w-8 text-ink-3" aria-hidden="true" />
                <p className="text-sm font-medium text-ink">Menunggu scan pertama</p>
                <p className="mt-1 text-sm text-ink-2">Hasilnya tampil besar di sini.</p>
            </Card>
        );
    }

    const meta = RESULT[result.kind];
    const Icon = meta.icon;

    return (
        <Card key={result.id} className={cx('flex min-h-48 animate-toast-in flex-col justify-center p-6 motion-reduce:animate-none', meta.soft)}>
            <div className="flex items-start gap-4">
                <Icon className={cx('h-10 w-10 shrink-0', meta.color)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <ResultPill item={result} />
                    <p className="mt-2 break-words font-display text-2xl font-semibold leading-tight text-ink">{result.nama}</p>
                    {result.nis_nip && <p className="mt-1 text-sm tabular-nums text-ink-2">{result.nis_nip}</p>}
                    <p className="mt-3 text-sm text-ink">{result.message}</p>
                    <p className="mt-1 text-xs tabular-nums text-ink-2">{result.time}</p>
                </div>
            </div>
        </Card>
    );
}

function ResultPill({ item }) {
    const pill = RESULT[item.kind].pill;
    return item.kind === 'late'
        ? <StatusPill status="terlambat" label={item.late ? `Terlambat ${item.late}` : 'Terlambat'} />
        : <StatusPill {...pill} />;
}
