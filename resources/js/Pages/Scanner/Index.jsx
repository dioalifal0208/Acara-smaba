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
    const [showFullscreenWarning, setShowFullscreenWarning] = useState(true);

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

    // ─── Fullscreen Logic ───
    useEffect(() => {
        const checkFullscreen = () => {
            // Check HTML5 fullscreen API or window inner height vs screen height (F11 detection)
            const isFull = document.fullscreenElement != null || Math.abs(window.innerHeight - window.screen.height) < 5;
            setShowFullscreenWarning(!isFull);
        };
        
        checkFullscreen();
        window.addEventListener('resize', checkFullscreen);
        document.addEventListener('fullscreenchange', checkFullscreen);
        
        return () => {
            window.removeEventListener('resize', checkFullscreen);
            document.removeEventListener('fullscreenchange', checkFullscreen);
        };
    }, []);

    const handleEnterFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`Fullscreen error: ${err.message}`);
                setShowFullscreenWarning(false); // Allow bypass if browser blocks it
            });
        } else {
            setShowFullscreenWarning(false); // Allow bypass if not supported
        }
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
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm border border-emerald-200">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]"></span>
                                Kamera Aktif
                            </span>
                        )}
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm border border-indigo-100">
                            {scanCount} scan
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Scanner Presensi" />

            {/* ─── Fullscreen Overlay Warning ─── */}
            {showFullscreenWarning && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md p-6">
                    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center transform transition-all">
                        <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-3">Mode Fullscreen</h2>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Demi kenyamanan dan agar seluruh antarmuka scanner terlihat sempurna tanpa terpotong, silakan masuk ke mode layar penuh (Fullscreen) atau tekan tombol <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-gray-700">F11</kbd>.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleEnterFullscreen}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                Masuk Fullscreen Sekarang
                            </button>
                            <button
                                onClick={() => setShowFullscreenWarning(false)}
                                className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-3 px-6 rounded-xl transition-all text-xs"
                            >
                                Lanjutkan tanpa Fullscreen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main container: Allow scroll if screen is too small, but aim for full screen */}
            <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6 min-h-[calc(100vh-100px)]">
                
                {!activeEvent && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-center justify-between gap-4 shadow-sm shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-sm font-bold">Presensi terkunci karena belum ada Event Aktif.</p>
                                <p className="text-xs text-amber-700 mt-0.5">Admin harus memilih atau mengaktifkan event terlebih dahulu.</p>
                            </div>
                        </div>
                        <a
                            href={route('events.index')}
                            className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 shrink-0 transition-colors"
                        >
                            Kelola Event
                        </a>
                    </div>
                )}
                
                {/* Compact Stats Bar (1 row) - Shrinks if needed */}
                <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100 gap-4 sm:gap-6">
                    <div className="flex items-center gap-6 px-2 w-full sm:w-auto justify-around sm:justify-start">
                        <div className="text-center sm:text-left">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Peserta</p>
                            <p className="text-2xl font-black text-gray-800 leading-none mt-1">{stats.total}</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                        <div className="text-center sm:text-left">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Telah Hadir</p>
                            <p className="text-2xl font-black text-emerald-600 leading-none mt-1">{stats.hadir}</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                    <div className="flex-1 px-2 w-full sm:w-auto">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Progress Presensi</p>
                            <p className="text-sm font-black text-indigo-600">{attendancePercentage}%</p>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                                style={{ width: `${attendancePercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Golden Ratio Grid (~61.8% / 38.2% -> 7.4/4.6 -> 7.5/4.5 -> Col 8 / Col 4 is 66%/33% close enough) */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-4 lg:gap-6 items-stretch">
                    
                    {/* ── Left: Scanner Card (Golden Ratio: Larger Part) ── */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-bold tracking-wide">
                                    {cooldownActive ? 'Memproses QR...' : 'Kamera Scanner'}
                                </span>
                            </div>
                            {cooldownActive && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col gap-4">
                            {/* Camera View Wrapper - Predictable height using aspect ratio */}
                            <div className="relative overflow-hidden rounded-xl bg-gray-950 w-full aspect-[4/3] lg:aspect-video flex items-center justify-center transition-all duration-300 shadow-inner">
                                {/* Target container for Html5Qrcode scanner. */}
                                {isScanning && (
                                    <div
                                        id="qr-reader"
                                        className="w-full h-full absolute inset-0 flex items-center justify-center"
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

                                {/* Loading overlay */}
                                {isScanning && isCameraLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 text-white z-10 backdrop-blur-sm">
                                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-white/20 border-t-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                        <p className="text-sm text-gray-200 font-medium tracking-wide animate-pulse">Menghubungkan ke kamera...</p>
                                    </div>
                                )}

                                {/* Inactive State */}
                                {!isScanning && (
                                    <div className="flex flex-col items-center justify-center py-6 text-gray-500 absolute inset-0">
                                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-400">Kamera Offline</p>
                                        <p className="text-xs text-gray-500 mt-1">Klik tombol di bawah untuk memulai</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="shrink-0 rounded-lg bg-red-50 p-3 border border-red-100">
                                    <div className="flex items-start gap-3">
                                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs font-medium text-red-800">{error}</p>
                                            <button
                                                onClick={startScanner}
                                                className="mt-1 text-xs font-bold text-red-600 hover:text-red-700 underline"
                                            >
                                                Coba akses lagi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Control Button */}
                            <div className="shrink-0">
                                {isScanning ? (
                                    <button
                                        onClick={stopScanner}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 border border-red-100 shadow-sm"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                        </svg>
                                        Hentikan Kamera
                                    </button>
                                ) : (
                                    <button
                                        onClick={startScanner}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.99]"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Mulai Scan QR Code
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Scan History (Golden Ratio: Smaller Part) ── */}
                    {/* Flex column taking full height of grid cell */}
                    <div className="flex flex-col h-[450px] lg:h-full rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-white border-b border-gray-100 px-5 py-3.5 shrink-0 flex items-center justify-between z-10">
                            <h3 className="text-sm font-bold text-gray-800">Riwayat Scan</h3>
                            {scanHistory.length > 0 && (
                                <button
                                    onClick={() => setScanHistory([])}
                                    className="text-[11px] font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Bersihkan
                                </button>
                            )}
                        </div>

                        {/* This area flex-grows to take all remaining vertical space inside the history card */}
                        <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-0 h-0">
                            {scanHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-600">Belum ada riwayat</p>
                                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Hasil scan presensi akan muncul di sini.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {scanHistory.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white ${index === 0 ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                                                item.status === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                item.status === 'already' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {item.nama?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[13px] font-bold text-gray-900">{item.nama}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] text-gray-500 font-medium">{item.nis_nip}</span>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-1.5 py-1 rounded shadow-sm">
                                                    {item.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mini Legend */}
                        <div className="bg-white border-t border-gray-100 px-5 py-3 shrink-0 z-10">
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]"></span>
                                    Berhasil
                                </p>
                                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]"></span>
                                    Duplikat
                                </p>
                                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"></span>
                                    Gagal
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Ensure Html5Qrcode video respects wrapper height and avoids scroll */
                #qr-reader {
                    position: absolute !important;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: transparent;
                    border: none !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader__scan_region {
                    width: 100% !important;
                    height: 100% !important;
                    min-height: unset !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    overflow: hidden !important;
                }
                #qr-reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
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

                /* Scanner Overlays */
                .scanner-search-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 5;
                    pointer-events: none;
                    overflow: hidden;
                    background: radial-gradient(circle at center, transparent 0 32%, rgba(3, 7, 18, 0.3) 33% 100%);
                }
                .scanner-search-box {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: min(280px, 60%);
                    aspect-ratio: 1 / 1;
                    max-height: 80%;
                    border: 2px solid rgba(99, 102, 241, 0.95);
                    border-radius: 16px;
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.15), 0 0 24px rgba(99, 102, 241, 0.45);
                    transform: translate(-50%, -50%);
                    transition: all 180ms ease;
                    animation: qr-search-focus 2.4s ease-in-out infinite;
                }
                .scanner-search-line {
                    position: absolute;
                    left: 12%;
                    right: 12%;
                    top: 14%;
                    height: 2px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, transparent, #22c55e, #a7f3d0, transparent);
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);
                    animation: qr-search-line 1.6s ease-in-out infinite;
                }
                .scanner-lock-pulse {
                    position: absolute;
                    inset: -6px;
                    border: 2px solid rgba(34, 197, 94, 0);
                    border-radius: 20px;
                    opacity: 0;
                }
                .scanner-search-overlay.is-locked .scanner-search-box {
                    width: min(260px, 55%);
                    border-color: rgba(34, 197, 94, 1);
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.25), 0 0 28px rgba(34, 197, 94, 0.75);
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
                    filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.9));
                }
                .scanner-search-corner {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    border-color: #ffffff;
                    filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.85));
                }
                .scanner-search-corner-tl {
                    left: -2px;
                    top: -2px;
                    border-left: 3px solid;
                    border-top: 3px solid;
                    border-top-left-radius: 16px;
                }
                .scanner-search-corner-tr {
                    right: -2px;
                    top: -2px;
                    border-right: 3px solid;
                    border-top: 3px solid;
                    border-top-right-radius: 16px;
                }
                .scanner-search-corner-bl {
                    left: -2px;
                    bottom: -2px;
                    border-left: 3px solid;
                    border-bottom: 3px solid;
                    border-bottom-left-radius: 16px;
                }
                .scanner-search-corner-br {
                    right: -2px;
                    bottom: -2px;
                    border-right: 3px solid;
                    border-bottom: 3px solid;
                    border-bottom-right-radius: 16px;
                }
                @keyframes qr-search-focus {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
                    50% { transform: translate(-50%, -50%) scale(0.97); opacity: 1; }
                }
                @keyframes qr-lock-box {
                    0% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
                    70% { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes qr-search-line {
                    0%, 100% { top: 14%; opacity: 0.3; }
                    50% { top: 84%; opacity: 1; }
                }
                @keyframes qr-lock-pulse {
                    0% { transform: scale(0.9); border-color: rgba(34, 197, 94, 0.8); opacity: 1; }
                    100% { transform: scale(1.15); border-color: rgba(34, 197, 94, 0); opacity: 0; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
