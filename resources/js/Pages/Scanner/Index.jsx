import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/Components/Toast';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';
import { Html5Qrcode } from 'html5-qrcode';

// ─── Main Scanner Component ───
export default function ScannerIndex({ initialStats, activeWorkcode: propActiveWorkcode }) {
    const { toast, addToast } = useToast();
    const { activeWorkcode: globalActiveWorkcode } = usePage().props;
    const activeWorkcode = propActiveWorkcode || globalActiveWorkcode;
    const [stats, setStats] = useState(initialStats);
    const [isScanning, setIsScanning] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [cooldownActive, setCooldownActive] = useState(false);
    const [scanCount, setScanCount] = useState(0);
    const [scanLock, setScanLock] = useState({ active: false, style: null });
    const [showFullscreenWarning, setShowFullscreenWarning] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    const html5QrCodeRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastScannedRef = useRef('');
    const cooldownTimerRef = useRef(null);
    const lockTimerRef = useRef(null);
    const gpsDataRef = useRef(null);

    useEffect(() => {
        let watchId;
        if (activeWorkcode?.latitude && activeWorkcode?.longitude) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    gpsDataRef.current = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    };
                },
                (err) => {
                    console.error("GPS Error:", err);
                    gpsDataRef.current = null;
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [activeWorkcode]);

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
            } else if (type === 'warning' || type === 'late') {
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
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
        if (!activeWorkcode) {
            toast.error('Belum ada Workcode yang aktif! Pilih workcode terlebih dahulu.');
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
            
            let requestBody = { qr_token: decodedText };
            if (activeWorkcode?.latitude && activeWorkcode?.longitude) {
                if (!gpsDataRef.current) {
                    throw new Error("Menunggu sinyal GPS atau izin lokasi ditolak.");
                }
                requestBody = { ...requestBody, ...gpsDataRef.current };
            }

            const response = await fetch(scanUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && (data.status === 'success' || data.status === 'warning' || data.status === 'already')) {
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
                    is_late: data.is_late || false,
                    late_minutes: data.late_minutes || 0,
                    late_formatted: data.late_formatted || '',
                    timestamp,
                }, ...prev.slice(0, 4)]);

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
                message: err.message || 'Terjadi kesalahan jaringan. Coba lagi.',
            });
        } finally {
            cooldownTimerRef.current = setTimeout(() => {
                isProcessingRef.current = false;
                setCooldownActive(false);
            }, 1500);
        }
    }, [playSound, addToast, activeWorkcode, toast, showScanLock]);

    // ─── Start Scanner — called directly from user click ───
    const startScanner = async () => {
        if (!activeWorkcode) {
            toast.error('Gagal memulai scanner: Belum ada workcode yang aktif!');
            return;
        }
        setError(null);
        setIsCameraLoading(true);
        setIsScanning(true);

        try {
            if (!window.isSecureContext) {
                throw new Error('InsecureContext');
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('UnsupportedBrowser');
            }

            // Html5Qrcode is imported statically at the top — no dynamic import needed.
            // scanner.start() calls getUserMedia internally, staying inside the user-gesture context.
            const scanner = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10 },
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

            let errorMessage;
            const name = err.name || '';
            const msg = (err.message || '').toLowerCase();

            if (err.message === 'InsecureContext') {
                errorMessage = 'Halaman harus dibuka via HTTPS agar kamera dapat diakses.';
            } else if (err.message === 'UnsupportedBrowser') {
                errorMessage = 'Browser Anda tidak mendukung akses kamera. Coba Chrome atau Safari terbaru.';
            } else if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || msg.includes('permission') || msg.includes('denied')) {
                errorMessage = 'Izin kamera ditolak. Buka Pengaturan browser lalu izinkan akses kamera untuk halaman ini, kemudian muat ulang halaman.';
            } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || msg.includes('not found') || msg.includes('no camera')) {
                errorMessage = 'Kamera tidak ditemukan pada perangkat ini.';
            } else if (name === 'NotReadableError' || name === 'TrackStartError' || msg.includes('in use') || msg.includes('busy') || msg.includes('could not start')) {
                errorMessage = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi.';
            } else if (name === 'OverconstrainedError') {
                errorMessage = 'Kamera belakang tidak tersedia. Coba di perangkat lain.';
            } else {
                errorMessage = 'Gagal menginisialisasi pemindai. Silakan muat ulang halaman dan coba lagi.';
            }
            setError(errorMessage);
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
            // Release camera on unmount
            if (html5QrCodeRef.current) {
                try {
                    html5QrCodeRef.current.stop();
                } catch (e) {}
                html5QrCodeRef.current = null;
            }
            if (cooldownTimerRef.current) {
                clearTimeout(cooldownTimerRef.current);
            }
            if (lockTimerRef.current) {
                clearTimeout(lockTimerRef.current);
            }
        };
    }, []);

    // ─── Status Badge (badge gradien ala Material Dashboard) ───
    const getStatusBadge = (item) => {
        const status = typeof item === 'object' ? item.status : item;
        const isLate = typeof item === 'object' ? item.is_late : false;
        const lateMinutes = typeof item === 'object' ? item.late_minutes : 0;
        const lateFormatted = typeof item === 'object' ? item.late_formatted : '';
        const showLateStatus = activeWorkcode?.kategori === 'harian' && (status === 'warning' || isLate);
        const badge = 'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white';

        if (showLateStatus) {
            let label = lateFormatted;
            if (!label) {
                if (lateMinutes >= 60) {
                    const j = Math.floor(lateMinutes / 60);
                    const m = lateMinutes % 60;
                    label = `${j}j ${m > 0 ? `${m}m` : ''}`;
                } else if (lateMinutes > 0) {
                    label = `${lateMinutes}m`;
                }
            }
            return <span className={`${badge} bg-gradient-to-b from-amber-400 to-orange-500`}>Telat{label ? ` ${label}` : ''}</span>;
        }
        switch (status) {
            case 'warning':
            case 'success':
                return <span className={`${badge} bg-gradient-to-b from-emerald-400 to-emerald-600`}>Hadir</span>;
            case 'already':
                return <span className={`${badge} bg-gradient-to-b from-neutral-400 to-neutral-600`}>Duplikat</span>;
            default:
                return <span className={`${badge} bg-gradient-to-b from-rose-400 to-rose-600`}>Gagal</span>;
        }
    };

    const historyTone = (item) => {
        if (activeWorkcode?.kategori === 'harian' && (item.status === 'warning' || item.is_late)) return 'text-amber-500';
        if (item.status === 'success' || item.status === 'warning') return 'text-emerald-500';
        if (item.status === 'already') return 'text-neutral-400';
        return 'text-rose-500';
    };

    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    const busy = cooldownActive;

    return (
        <AuthenticatedLayout>
            <Head title="Scanner Presensi" />

            {/* ─── Ajakan mode layar penuh ─── */}
            {showFullscreenWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-soft-lg" data-aos="zoom-in">
                        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-dark">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </span>
                        <h2 className="text-lg font-bold text-neutral-800">Gunakan mode layar penuh</h2>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                            {isMobile
                                ? 'Agar tampilan kamera dan riwayat scan terlihat utuh, masuk ke mode layar penuh.'
                                : <>Agar tampilan kamera dan riwayat scan terlihat utuh, masuk ke mode layar penuh atau tekan <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-700">F11</kbd>.</>}
                        </p>
                        <hr className="hr-fade my-5" />
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setShowFullscreenWarning(false)} className="btn-soft">Lanjut tanpa layar penuh</button>
                            <button type="button" onClick={handleEnterFullscreen} className="btn-brand">Masuk layar penuh</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                {/* Judul halaman + status kamera */}
                <div className="mb-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-aos="fade-up">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-neutral-800">Scanner Presensi</h3>
                        <p className="mt-0.5 truncate text-sm text-neutral-500">
                            {activeWorkcode
                                ? <>Workcode aktif: <span className="font-medium text-neutral-700">{activeWorkcode.nama_workcode}</span></>
                                : 'Presensi terkunci: belum ada workcode aktif.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <StatusChip on={isScanning} label={isScanning ? 'Kamera aktif' : 'Kamera mati'} />
                    </div>
                </div>

                {!activeWorkcode && (
                    <div className="mb-4 flex shrink-0 items-start gap-3 rounded-lg bg-gradient-to-b from-amber-400 to-orange-500 p-4 text-sm text-white shadow-soft" role="alert" data-aos="fade-up">
                        <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <p><strong className="font-semibold">Presensi terkunci.</strong> Aktifkan workcode lewat menu Workcode di sidebar agar scan dapat diproses.</p>
                    </div>
                )}

                {/* KPI */}
                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Total Peserta" value={stats.total} icon={icons.users}>
                        terdaftar di sistem
                    </KpiCard>
                    <KpiCard delay={50} label="Telah Hadir" value={stats.hadir} icon={icons.check}>
                        <span className="font-bold text-emerald-600">+{scanCount}</span> scan di sesi ini
                    </KpiCard>
                    <KpiCard delay={100} label="Progres Presensi" value={`${attendancePercentage}%`} icon={icons.chart}>
                        <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-neutral-200">
                            <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out" style={{ width: `${attendancePercentage}%` }} />
                        </span>
                    </KpiCard>
                </section>

                {/* Kamera + riwayat */}
                <section className="mt-4 grid flex-1 grid-cols-1 gap-4 lg:min-h-[28rem] lg:grid-cols-3 xl:min-h-0">
                    {/* ── Kamera ── */}
                    <div className="card-soft flex flex-col p-4 lg:col-span-2 xl:min-h-0" data-aos="fade-up">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h6 className="text-base font-semibold text-neutral-800">Kamera Scanner</h6>
                                <p className="text-sm text-neutral-500">Arahkan QR presensi peserta ke kamera</p>
                            </div>
                            {busy && (
                                <span className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
                                    Memproses…
                                </span>
                            )}
                        </div>

                        <div className="relative mt-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-900 lg:aspect-video xl:aspect-auto xl:min-h-0 xl:flex-1">
                            {/* Wadah video Html5Qrcode. */}
                            <div
                                id="qr-reader"
                                className="absolute inset-0 flex h-full w-full items-center justify-center"
                                style={{ opacity: isScanning ? 1 : 0, pointerEvents: isScanning ? 'auto' : 'none', zIndex: isScanning ? 1 : -1 }}
                            />

                            {isCameraLoading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-900 text-white">
                                    <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    <p className="text-sm font-medium">Mengaktifkan kamera…</p>
                                    <p className="mt-1 px-4 text-center text-xs text-neutral-400">Izinkan akses kamera pada pop-up browser</p>
                                </div>
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

                            {!isScanning && !isCameraLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white/70">
                                        <span className="h-6 w-6">{icons.camera}</span>
                                    </span>
                                    <p className="text-sm font-medium text-white/80">Kamera belum aktif</p>
                                    <p className="mt-1 text-xs text-white/50">Tekan tombol di bawah untuk mulai</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 flex items-start gap-3 rounded-lg bg-gradient-to-b from-rose-400 to-rose-600 p-3 text-sm text-white" role="alert">
                                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="flex-1">{error}</p>
                            </div>
                        )}

                        <hr className="hr-fade my-3" />
                        <div className="flex items-center justify-between gap-3">
                            <p className="flex items-center gap-1 text-sm text-neutral-500">
                                <span className="h-4 w-4">{icons.clock}</span>
                                {isScanning ? 'Memindai otomatis' : 'Siap memindai'}
                            </p>
                            {isScanning ? (
                                <button type="button" onClick={stopScanner} className="btn-soft !border-rose-500 !text-rose-600 hover:!bg-rose-500 hover:!text-white">
                                    Hentikan kamera
                                </button>
                            ) : (
                                <button type="button" onClick={startScanner} className="btn-brand">
                                    <span className="h-4 w-4">{icons.camera}</span>
                                    {error ? 'Coba lagi' : isMobile ? 'Aktifkan kamera' : 'Mulai scan'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Riwayat scan ── */}
                    <div className="card-soft flex min-h-[18rem] flex-col lg:min-h-0" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-start justify-between gap-3 p-4 pb-2">
                            <div>
                                <h6 className="text-base font-semibold text-neutral-800">Riwayat Scan</h6>
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                    <span className="h-4 w-4 text-emerald-500">{icons.check}</span>
                                    <span className="font-bold text-neutral-700">{scanHistory.length}</span> scan di sesi ini
                                </p>
                            </div>
                            {scanHistory.length > 0 && (
                                <button type="button" onClick={() => setScanHistory([])} className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                                    Bersihkan
                                </button>
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 lg:h-0">
                            {scanHistory.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                                    <span className="mb-3 h-8 w-8 text-neutral-300">{icons.document}</span>
                                    <p className="text-sm font-medium text-neutral-600">Belum ada scan</p>
                                    <p className="mt-0.5 text-xs text-neutral-400">Hasil scan akan muncul di sini.</p>
                                </div>
                            ) : (
                                <ol className="relative py-2 before:absolute before:bottom-6 before:left-[13px] before:top-6 before:w-px before:bg-neutral-200">
                                    {scanHistory.map((item, index) => (
                                        <li key={item.id} className={`relative flex items-start gap-3 rounded-md py-2 transition-colors ${index === 0 ? 'animate-[scan-in_0.35s_ease-out]' : ''}`}>
                                            <span className={`relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white ${historyTone(item)}`}>
                                                <span className="h-2.5 w-2.5 rounded-full bg-current" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-semibold text-neutral-800">{item.nama}</p>
                                                    <span className="shrink-0 text-xs font-medium tabular-nums text-neutral-500">{item.timestamp}</span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {getStatusBadge(item)}
                                                    <span className="truncate text-xs text-neutral-500">{item.nis_nip}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>

                        <hr className="hr-fade" />
                        <div className="flex items-center justify-between gap-2 p-4 py-3 text-xs text-neutral-500">
                            <Legend className="bg-emerald-500" label="Hadir" />
                            <Legend className="bg-amber-500" label="Telat" />
                            <Legend className="bg-neutral-400" label="Duplikat" />
                            <Legend className="bg-rose-500" label="Gagal" />
                        </div>
                    </div>
                </section>
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
                    border: 2px solid rgba(255, 255, 255, 0.9);
                    border-radius: 16px;
                    box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.18), 0 0 18px rgba(255, 255, 255, 0.25);
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
                    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.4));
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
                @keyframes scan-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
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

function StatusChip({ on, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-neutral-600">
            <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
            {label}
        </span>
    );
}

function Legend({ className, label }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${className}`} />
            {label}
        </span>
    );
}
