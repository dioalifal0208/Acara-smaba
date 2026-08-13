import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/Components/Toast';

// ─── Main Scanner Component ───
export default function ScannerIndex({ initialStats, activeEvent: propActiveEvent }) {
    const { toast, addToast } = useToast();
    const { activeEvent: globalActiveEvent } = usePage().props;
    const activeEvent = propActiveEvent || globalActiveEvent;
    const [stats, setStats] = useState(initialStats);
    const [isScanning, setIsScanning] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [cooldownActive, setCooldownActive] = useState(false);
    const [scanCount, setScanCount] = useState(0);
    const [scanLock, setScanLock] = useState({ active: false, style: null });

    const html5QrCodeRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastScannedRef = useRef('');
    const cooldownTimerRef = useRef(null);
    const lockTimerRef = useRef(null);

    const getLockStyleFromResult = useCallback((decodedResult) => {
        const bounds = decodedResult?.result?.bounds;
        const video = document.querySelector('#qr-reader video');

        if (!bounds || !video) {
            return null;
        }

        const sourceWidth = video.videoWidth || video.clientWidth;
        const sourceHeight = video.videoHeight || video.clientHeight;

        if (!sourceWidth || !sourceHeight) {
            return null;
        }

        const widthPercent = Math.min(Math.max((bounds.width / sourceWidth) * 100, 26), 62);
        const leftPercent = Math.min(Math.max(((bounds.x + bounds.width / 2) / sourceWidth) * 100, 18), 82);
        const topPercent = Math.min(Math.max(((bounds.y + bounds.height / 2) / sourceHeight) * 100, 18), 82);

        return {
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: `${widthPercent}%`,
        };
    }, []);

    const showScanLock = useCallback((decodedResult) => {
        if (lockTimerRef.current) {
            clearTimeout(lockTimerRef.current);
        }

        setScanLock({
            active: true,
            style: getLockStyleFromResult(decodedResult),
        });

        lockTimerRef.current = setTimeout(() => {
            setScanLock({ active: false, style: null });
        }, 1200);
    }, [getLockStyleFromResult]);

    // ─── Audio Feedback ───
    const playSound = useCallback((type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            } else if (type === 'already') {
                osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
                osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15); // A4
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
            } else {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) { /* silent */ }
    }, []);

    // ─── Scan Handler ───
    const handleScan = useCallback(async (decodedText, decodedResult = null) => {
        if (isProcessingRef.current) return;
        if (!activeEvent) {
            toast.error('Belum ada Event yang aktif! Pilih event terlebih dahulu.');
            return;
        }

        const now = Date.now();
        if (decodedText === lastScannedRef.current && now - lastScannedRef.currentTimestamp < 3000) {
            return;
        }

        isProcessingRef.current = true;
        setCooldownActive(true);
        showScanLock(decodedResult);
        lastScannedRef.current = decodedText;
        lastScannedRef.currentTimestamp = now;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const scanUrl = typeof route === 'function' ? route('scan', undefined, false) : '/scan';
            const response = await fetch(scanUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ qr_token: decodedText }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && (data.status === 'success' || data.status === 'already')) {
                playSound(data.status);
                setScanCount(prev => prev + 1);

                if (data.stats) {
                    setStats(data.stats);
                }

                const timestamp = data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                addToast({
                    status: data.status,
                    message: data.message,
                    participantName: data.participant?.nama,
                    timestamp,
                });

                setScanHistory(prev => [{
                    id: Date.now(),
                    nama: data.participant?.nama || 'Peserta',
                    nis_nip: data.participant?.nis_nip || '-',
                    status: data.status,
                    timestamp,
                }, ...prev.slice(0, 49)]);

            } else {
                playSound('error');
                const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                addToast({
                    status: 'error',
                    message: response.status === 419
                        ? 'Sesi scanner kedaluwarsa. Refresh halaman lalu login kembali jika diminta.'
                        : data.message || 'Gagal memproses QR Code.',
                    timestamp,
                });
            }
        } catch (err) {
            playSound('error');
            addToast({
                status: 'error',
                message: 'Terjadi kesalahan jaringan. Coba lagi.',
            });
        } finally {
            cooldownTimerRef.current = setTimeout(() => {
                isProcessingRef.current = false;
                setCooldownActive(false);
            }, 1500);
        }
    }, [playSound, addToast, activeEvent, toast, showScanLock]);

    // ─── Auto-start Scanner ───
    const startScanner = async () => {
        if (!activeEvent) {
            toast.error('Gagal memulai scanner: Belum ada event yang aktif!');
            return;
        }
        setError(null);
        setIsCameraLoading(true);
        setIsScanning(true);

        try {
            const Html5QrcodeModule = await import('html5-qrcode');
            const Html5Qrcode = Html5QrcodeModule.Html5Qrcode;

            await new Promise(resolve => setTimeout(resolve, 300));

            const scanner = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    aspectRatio: 1.0,
                },
                (decodedText, decodedResult) => {
                    handleScan(decodedText, decodedResult);
                },
                () => {}
            );

            setIsCameraLoading(false);
        } catch (err) {
            console.error('Camera Error:', err);
            setIsCameraLoading(false);
            setIsScanning(false);
            setError('Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.');
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (e) {}
            html5QrCodeRef.current = null;
        }
        setIsScanning(false);
        setIsCameraLoading(false);
    };

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                try {
                    html5QrCodeRef.current.stop();
                } catch (e) {}
            }
            if (cooldownTimerRef.current) {
                clearTimeout(cooldownTimerRef.current);
            }
            if (lockTimerRef.current) {
                clearTimeout(lockTimerRef.current);
            }
        };
    }, []);

    // ─── Status Badge ───
    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">✓ HADIR</span>;
            case 'already':
                return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">⚠ DUPLIKAT</span>;
            default:
                return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">✕ ERROR</span>;
        }
    };

    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Scanner Presensi
                        </h2>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">
                            {activeEvent ? `Event: ${activeEvent.nama_event}` : '⚠️ Event Tidak Aktif'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isScanning && (
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                                Kamera Aktif
                            </span>
                        )}
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {scanCount} scan
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Scanner Presensi" />

            <div className="py-6 flex-1 overflow-y-auto w-full">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 h-full space-y-4">

                    {!activeEvent && (
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="text-xs font-bold">Presensi terkunci karena belum ada Event Aktif.</p>
                                    <p className="text-[11px] text-amber-700">Admin harus memilih atau mengaktifkan event terlebih dahulu.</p>
                                </div>
                            </div>
                            <a
                                href={route('events.index')}
                                className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-700 shrink-0"
                            >
                                Kelola Event
                            </a>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* ── Left: Scanner + Stats ── */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Live Stats Bar */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <p className="text-xs font-medium text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <p className="text-xs font-medium text-gray-500">Hadir</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.hadir}</p>
                                </div>
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Progress</p>
                                            <p className="text-2xl font-bold text-indigo-600">{attendancePercentage}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                                            style={{ width: `${attendancePercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Scanner Card */}
                            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            <span className="text-sm font-semibold">
                                                {cooldownActive ? 'Memproses...' : 'Arahkan ke QR Code'}
                                            </span>
                                        </div>
                                        {cooldownActive && (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4">
                                    {/* Camera View Wrapper */}
                                    <div className="relative overflow-hidden rounded-xl bg-gray-950 w-full flex items-center justify-center" style={{ minHeight: isScanning ? '320px' : '0px' }}>
                                        {/* Target container for Html5Qrcode scanner. Must be mounted when isScanning is true */}
                                        {isScanning && (
                                            <div
                                                id="qr-reader"
                                                className="w-full text-center"
                                            />
                                        )}

                                        {isScanning && !isCameraLoading && (
                                            <div className={`scanner-search-overlay ${scanLock.active ? 'is-locked' : 'is-searching'}`} aria-hidden="true">
                                                <div className="scanner-search-box" style={scanLock.style || undefined}>
                                                    <span className="scanner-search-corner scanner-search-corner-tl"></span>
                                                    <span className="scanner-search-corner scanner-search-corner-tr"></span>
                                                    <span className="scanner-search-corner scanner-search-corner-bl"></span>
                                                    <span className="scanner-search-corner scanner-search-corner-br"></span>
                                                    <span className="scanner-search-line"></span>
                                                    <span className="scanner-lock-pulse"></span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Loading overlay inside the camera block */}
                                        {isScanning && isCameraLoading && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white z-10">
                                                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-3 border-white/20 border-t-indigo-500"></div>
                                                <p className="text-sm text-gray-400">Menghubungkan ke kamera...</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Inactive State Display */}
                                    {!isScanning && (
                                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-sm text-gray-500">Kamera belum aktif</p>
                                            <p className="text-xs text-gray-600">Tekan tombol di bawah untuk mulai scan</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mt-4 rounded-xl bg-red-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                                    <button
                                                        onClick={startScanner}
                                                        className="mt-2 text-sm font-semibold text-red-600 underline hover:text-red-700"
                                                    >
                                                        Coba lagi
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Control Button */}
                                    <div className="mt-4">
                                        {isScanning ? (
                                            <button
                                                onClick={stopScanner}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-200"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                                </svg>
                                                Hentikan Kamera
                                            </button>
                                        ) : (
                                            <button
                                                onClick={startScanner}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Mulai Scan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Scan History ── */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 overflow-hidden rounded-2xl bg-white shadow-lg">
                                <div className="border-b border-gray-100 px-5 py-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900">Riwayat Scan</h3>
                                        {scanHistory.length > 0 && (
                                            <button
                                                onClick={() => setScanHistory([])}
                                                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                                            >
                                                Bersihkan
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {scanHistory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-xs text-gray-600">Belum ada scan</p>
                                            <p className="text-[10px] text-gray-500">Scan QR untuk memulai</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {scanHistory.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 ${index === 0 ? 'bg-indigo-50/50' : ''}`}
                                                >
                                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                        item.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                                        item.status === 'already' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                        {item.nama?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900">{item.nama}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">{item.nis_nip}</span>
                                                            {getStatusBadge(item.status)}
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 text-[10px] font-semibold text-gray-500">{item.timestamp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Panduan Mini */}
                                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Panduan</p>
                                    <div className="mt-1 space-y-1">
                                        <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                            Hijau = Berhasil dicatat
                                        </p>
                                        <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                            Kuning = Sudah hadir sebelumnya
                                        </p>
                                        <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                            Merah = QR tidak valid
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                #qr-reader video {
                    border-radius: 12px !important;
                    width: 100% !important;
                    height: auto !important;
                    object-fit: cover !important;
                }
                #qr-reader__scan_region {
                    min-height: 280px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                #qr-reader__dashboard_section_swaplink,
                #qr-reader__status_span,
                #qr-reader__header_message {
                    display: none !important;
                }
                #qr-reader__dashboard_section {
                    padding: 0 !important;
                    display: none !important;
                }
                .scanner-search-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 5;
                    pointer-events: none;
                    overflow: hidden;
                    background:
                        radial-gradient(circle at center, transparent 0 34%, rgba(3, 7, 18, 0.18) 35% 100%);
                }
                .scanner-search-box {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: clamp(150px, 42%, 250px);
                    aspect-ratio: 1 / 1;
                    border: 2px solid rgba(99, 102, 241, 0.95);
                    border-radius: 18px;
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.12), 0 0 28px rgba(99, 102, 241, 0.45);
                    transform: translate(-50%, -50%);
                    transition: left 180ms ease, top 180ms ease, width 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
                    animation: qr-search-focus 2.4s ease-in-out infinite;
                }
                .scanner-search-line {
                    position: absolute;
                    left: 12%;
                    right: 12%;
                    top: 14%;
                    height: 3px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, transparent, #22c55e, #a7f3d0, transparent);
                    box-shadow: 0 0 18px rgba(34, 197, 94, 0.9);
                    animation: qr-search-line 1.6s ease-in-out infinite;
                }
                .scanner-lock-pulse {
                    position: absolute;
                    inset: -8px;
                    border: 2px solid rgba(34, 197, 94, 0);
                    border-radius: 22px;
                    opacity: 0;
                }
                .scanner-search-overlay.is-locked .scanner-search-box {
                    width: clamp(130px, 34%, 230px);
                    border-color: rgba(34, 197, 94, 1);
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.24), 0 0 36px rgba(34, 197, 94, 0.75);
                    animation: qr-lock-box 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
                }
                .scanner-search-overlay.is-locked .scanner-search-line {
                    opacity: 0;
                    animation: none;
                }
                .scanner-search-overlay.is-locked .scanner-lock-pulse {
                    animation: qr-lock-pulse 700ms ease-out both;
                }
                .scanner-search-overlay.is-locked .scanner-search-corner {
                    border-color: #22c55e;
                    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.9));
                }
                .scanner-search-corner {
                    position: absolute;
                    width: 28px;
                    height: 28px;
                    border-color: #ffffff;
                    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.85));
                }
                .scanner-search-corner-tl {
                    left: -2px;
                    top: -2px;
                    border-left: 4px solid;
                    border-top: 4px solid;
                    border-top-left-radius: 18px;
                }
                .scanner-search-corner-tr {
                    right: -2px;
                    top: -2px;
                    border-right: 4px solid;
                    border-top: 4px solid;
                    border-top-right-radius: 18px;
                }
                .scanner-search-corner-bl {
                    left: -2px;
                    bottom: -2px;
                    border-left: 4px solid;
                    border-bottom: 4px solid;
                    border-bottom-left-radius: 18px;
                }
                .scanner-search-corner-br {
                    right: -2px;
                    bottom: -2px;
                    border-right: 4px solid;
                    border-bottom: 4px solid;
                    border-bottom-right-radius: 18px;
                }
                @keyframes qr-search-focus {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
                    50% { transform: translate(-50%, -50%) scale(0.96); opacity: 1; }
                }
                @keyframes qr-lock-box {
                    0% { transform: translate(-50%, -50%) scale(1.18); opacity: 0.45; }
                    70% { transform: translate(-50%, -50%) scale(0.92); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes qr-search-line {
                    0%, 100% { top: 14%; opacity: 0.45; }
                    50% { top: 84%; opacity: 1; }
                }
                @keyframes qr-lock-pulse {
                    0% { transform: scale(0.9); border-color: rgba(34, 197, 94, 0.75); opacity: 1; }
                    100% { transform: scale(1.18); border-color: rgba(34, 197, 94, 0); opacity: 0; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
