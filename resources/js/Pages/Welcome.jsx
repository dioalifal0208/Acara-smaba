import { Link, Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/Components/Toast';
import LoginModal from '@/Components/LoginModal';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Welcome({ auth, stats: initialStats, recentScans: initialRecentScans = [], canResetPassword = true }) {
    const { user } = auth;
    const isAdmin = user && user.isAdmin;

    const [stats, setStats] = useState(initialStats || { total: 0, hadir: 0, belum: 0 });
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    const [recentScans, setRecentScans] = useState(initialRecentScans);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
        });
    }, []);

    // Scanner states (Admin-only)
    const { addToast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [cooldownActive, setCooldownActive] = useState(false);
    const [scanCount, setScanCount] = useState(0);

    // Lookup states (Public/Guru)
    const [searchQuery, setSearchQuery] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupError, setLookupError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Autocomplete states
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const suggestionsRef = useRef(null);

    const html5QrCodeRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastScannedRef = useRef('');
    const cooldownTimerRef = useRef(null);

    // Audio Feedback
    const playSound = useCallback((type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);

            if (type === 'success') {
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === 'already') {
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.setValueAtTime(370, ctx.currentTime + 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
            } else {
                osc.frequency.setValueAtTime(250, ctx.currentTime);
                osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
            }
        } catch (e) { /* silent */ }
    }, []);

    // Scan Handler
    const handleScan = useCallback(async (decodedText) => {
        if (isProcessingRef.current) return;
        if (decodedText === lastScannedRef.current) return;

        isProcessingRef.current = true;
        lastScannedRef.current = decodedText;
        setCooldownActive(true);

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
            const message = response.status === 419
                ? 'Sesi scanner kedaluwarsa. Refresh halaman lalu login kembali jika diminta.'
                : data.message;

            addToast({
                status: response.ok ? data.status : 'error',
                message: message || 'Gagal memproses QR Code.',
                participantName: data.participant?.nama,
                timestamp: data.timestamp || new Date().toLocaleTimeString('id-ID'),
            });

            playSound(response.ok ? data.status : 'error');

            if (data.stats) {
                setStats(data.stats);
            }

            if (data.participant) {
                setScanHistory(prev => [{
                    id: Date.now(),
                    status: data.status,
                    nama: data.participant.nama,
                    nis_nip: data.participant.nis_nip,
                    waktu: data.participant.waktu_hadir,
                    timestamp: data.timestamp,
                }, ...prev].slice(0, 15));
            }

            setScanCount(prev => prev + 1);

        } catch (err) {
            addToast({
                status: 'error',
                message: 'Gagal terhubung ke server.',
                participantName: 'Error',
                timestamp: new Date().toLocaleTimeString('id-ID'),
            });
            playSound('error');
        }

        cooldownTimerRef.current = setTimeout(() => {
            isProcessingRef.current = false;
            lastScannedRef.current = '';
            setCooldownActive(false);
        }, 1500);
    }, [playSound, addToast]);

    // Start/Stop Scanner
    const startScanner = useCallback(async () => {
        setError(null);
        setIsScanning(true);
        setIsCameraLoading(true);

        setTimeout(async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');

                if (html5QrCodeRef.current) {
                    try { await html5QrCodeRef.current.stop(); } catch (e) { /* */ }
                }

                const html5QrCode = new Html5Qrcode('qr-reader');
                html5QrCodeRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 15,
                        aspectRatio: 1.0,
                        disableFlip: false,
                    },
                    (decodedText) => handleScan(decodedText),
                    () => { /* ignore */ }
                );

                setIsCameraLoading(false);
            } catch (err) {
                setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
                setIsScanning(false);
                setIsCameraLoading(false);
            }
        }, 150);
    }, [handleScan]);

    const stopScanner = useCallback(async () => {
        setIsCameraLoading(false);
        setIsScanning(false);
        if (html5QrCodeRef.current) {
            try { await html5QrCodeRef.current.stop(); } catch (e) { /* */ }
            html5QrCodeRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            const timer = setTimeout(() => {
                startScanner();
            }, 300);
            return () => {
                clearTimeout(timer);
                if (html5QrCodeRef.current) {
                    try { html5QrCodeRef.current.stop(); } catch (e) { /* */ }
                }
            };
        }
    }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) {
                clearTimeout(cooldownTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (val) => {
        setSearchQuery(val);
        setLookupError(null);

        if (val.trim().length >= 2) {
            setIsSearchingSuggestions(true);
            fetch(route('participants.search') + `?query=${encodeURIComponent(val)}`)
                .then((res) => res.json())
                .then((data) => {
                    setSuggestions(data);
                    setShowSuggestions(data.length > 0);
                    setIsSearchingSuggestions(false);
                })
                .catch(() => {
                    setIsSearchingSuggestions(false);
                });
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (participant) => {
        setSearchQuery(participant.nama);
        setLookupResult(participant);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setLookupResult(null);
        setLookupError(null);
        setShowSuggestions(false);

        try {
            const response = await fetch(route('participants.lookup') + `?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.participant) {
                setLookupResult(data.participant);
            } else {
                setLookupError('Data tidak ditemukan. Pastikan Anda memasukkan nama atau NIP yang sesuai.');
            }
        } catch (err) {
            setLookupError('Terjadi kesalahan sistem. Silakan coba lagi.');
        } finally {
            setIsSearching(false);
        }
    };

    const handlePrint = (p) => {
        const printWindow = window.open('', '_blank', 'width=500,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code Presensi - ${p.nama}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                    .card { text-align: center; padding: 40px; border: 2px solid #e5e7eb; border-radius: 16px; max-width: 400px; }
                    .card h2 { font-size: 20px; color: #1e1b4b; margin-bottom: 4px; }
                    .card p { font-size: 14px; color: #6366f1; margin-bottom: 20px; font-weight: 600; }
                    .qr-container { display: flex; justify-content: center; margin-bottom: 10px; }
                    .qr-container svg { width: 220px; height: 220px; }
                    .footer { font-size: 11px; color: #9ca3af; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>${p.nama}</h2>
                    <p>${p.nis_nip}</p>
                    <div class="qr-container">
                        <img src="${route('participants.qr', p.id)}" alt="QR Code" />
                    </div>
                    <div class="footer">E-Presensi SMA Negeri 1 Babat</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getStatusBadge = (status) => {
        if (status === 'success') {
            return <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-200">Hadir</span>;
        } else if (status === 'already') {
            return <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-200">Sudah Absen</span>;
        }
        return <span className="inline-flex rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 border border-rose-200">Gagal</span>;
    };


    return (
        <>
            <Head title="E-Presensi SMA Negeri 1 Babat" />

            {/* ═══════════════════════════════════════════════════
                ROOT SHELL — warm green-tinted off-white background
            ═══════════════════════════════════════════════════ */}
            <div className="h-screen overflow-hidden flex flex-col" style={{ backgroundColor: '#f6faf6', fontFamily: "'Figtree', sans-serif" }}>

                {/* ── SUBTLE BACKGROUND TEXTURE ── */}
                <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                    {/* Faint radial gradient — top center only, not heavy blobs */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(47,147,56,0.07) 0%, transparent 70%)'
                    }} />
                    {/* Subtle dot grid — top portion only */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle, rgba(47,147,56,0.12) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%)',
                    }} />
                </div>

                {/* ═══════════════════════════════════════════════════
                    NAVBAR — sticky, minimal, integrated with page
                ═══════════════════════════════════════════════════ */}
                <header className="relative z-50 sticky top-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', backgroundColor: 'rgba(246,250,246,0.95)', backdropFilter: 'blur(12px)' }}>
                    <div className="max-w-6xl mx-auto px-6 h-[64px] flex items-center justify-between">
                        {/* Brand Mark */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: '#f0faf0', border: '1px solid #c3efc6' }}>
                                <img src="/images/logo.png" alt="Logo SMABA" className="h-6 w-6 object-contain" />
                            </div>
                            <div>
                                <span className="block text-[15px] font-black tracking-tight" style={{ color: '#1a3d1e', lineHeight: 1 }}>E-Presensi</span>
                                <span className="block text-[9px] font-bold tracking-[0.18em] uppercase mt-[3px]" style={{ color: '#2f9338' }}>SMA Negeri 1 Babat</span>
                            </div>
                        </div>

                        {/* Nav Actions */}
                        <nav className="flex items-center gap-3">
                            {user ? (
                                <>
                                    {isAdmin && (
                                        <Link href={route('dashboard')} className="text-sm font-semibold transition-colors" style={{ color: '#4d7a52' }}>
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link href={route('logout')} method="post" as="button" className="h-9 px-4 rounded-lg text-sm font-semibold transition-all" style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#374151', background: 'white' }}>
                                        Keluar
                                    </Link>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    id="btn-login-nav"
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="h-9 px-5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                                    style={{ background: '#2f9338', boxShadow: '0 1px 8px rgba(47,147,56,0.25)' }}
                                >
                                    Masuk →
                                </button>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ═══════════════════════════════════════════════════
                    MAIN CONTENT
                ═══════════════════════════════════════════════════ */}
                <main className="relative z-10 flex-1 flex flex-col">

                    {/* ── GUEST / NON-ADMIN: Hero + Search Card ── */}
                    {(!user || !isAdmin) && (
                        <div className="flex-1 flex items-center">
                            <div className="max-w-6xl mx-auto w-full px-6 py-4 lg:py-6">

                                {/* ── GOLDEN RATIO GRID: 61.8% / 38.2% ── */}
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.618fr] gap-10 lg:gap-16 items-center">

                                    {/* ─── LEFT COLUMN: Hero Copy (61.8%) ─── */}
                                    <div className="space-y-8 order-2 lg:order-1" data-aos="fade-right">

                                        {/* Eyebrow tag */}
                                        <div className="inline-flex items-center gap-2.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4db855' }}></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#2f9338' }}></span>
                                            </span>
                                            <span className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: '#2f9338' }}>
                                                Layanan Administrasi Digital
                                            </span>
                                        </div>

                                        {/* Main headline */}
                                        <div>
                                            <h1 className="font-black tracking-tight leading-[1.06]" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#0f2612' }}>
                                                Sistem Presensi<br/>
                                                <span style={{ color: '#2f9338' }}>Cerdas</span> &amp; Terintegrasi<br/>
                                                <span style={{ fontSize: '0.7em', fontWeight: 800, color: '#374151', letterSpacing: '-0.01em' }}>SMA Negeri 1 Babat</span>
                                            </h1>
                                        </div>

                                        {/* Description */}
                                        <p className="text-base leading-relaxed" style={{ color: '#4b5563', maxWidth: '420px', fontWeight: 500 }}>
                                            Pantau statistik kehadiran acara secara langsung. Sistem presensi cerdas ini mendukung identifikasi cepat dan akurat menggunakan pemindaian wajah mandiri.
                                        </p>

                                        {/* Step indicators */}
                                        <div className="flex flex-wrap items-center gap-3 pt-1">
                                            {[
                                                { n: '01', label: 'Siapkan Diri' },
                                                { n: '02', label: 'Hampiri Kiosk Layar' },
                                                { n: '03', label: 'Verifikasi Wajah' },
                                            ].map((s, i) => (
                                                <div key={i} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all"
                                                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                                    <span className="text-[10px] font-black tabular-nums" style={{ color: '#2f9338' }}>{s.n}</span>
                                                    <span className="w-px h-3.5" style={{ background: '#e5e7eb' }}></span>
                                                    <span className="text-[13px] font-semibold" style={{ color: '#374151' }}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Decorative divider */}
                                        <div className="flex items-center gap-4 pt-4">
                                            <div className="h-px flex-1" style={{ maxWidth: '200px', background: 'linear-gradient(to right, #c3efc6, transparent)' }}></div>
                                            <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#9ca3af' }}>E-Presensi SMABA</span>
                                        </div>
                                    </div>

                                    {/* ─── RIGHT COLUMN: Live Dashboard (38.2%) ─── */}
                                    <div className="order-1 lg:order-2" data-aos="fade-left" data-aos-delay="150">
                                        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'white', boxShadow: '0 4px 32px rgba(0,0,0,0.09)', border: '1px solid rgba(0,0,0,0.07)' }}>
                                            
                                            {/* Card Header — smaba green band */}
                                            <div className="px-5 py-4 shrink-0 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #26742e 0%, #2f9338 60%, #38a843 100%)' }}>
                                                <div>
                                                    <h2 className="text-base font-black text-white">Live Dashboard</h2>
                                                    <p className="text-[12px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                                        Statistik kehadiran hari ini
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live</span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5 space-y-5">
                                                
                                                {/* Circular Progress & Quick Stats */}
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                                                        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0faf0" strokeWidth="3" />
                                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2f9338" strokeWidth="3" strokeDasharray={`${attendancePercentage}, 100`} className="transition-all duration-1000 ease-out" />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-sm font-black" style={{ color: '#1a3d1e' }}>{attendancePercentage}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                                        <div className="p-2.5 rounded-xl text-center" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                                                            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Total</p>
                                                            <p className="text-lg font-black mt-0.5" style={{ color: '#111827' }}>{stats.total}</p>
                                                        </div>
                                                        <div className="p-2.5 rounded-xl text-center" style={{ background: '#f0faf0', border: '1px solid #c3efc6' }}>
                                                            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#2f9338' }}>Hadir</p>
                                                            <p className="text-lg font-black mt-0.5" style={{ color: '#1a3d1e' }}>{stats.hadir}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recent Activity List */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-px flex-1" style={{ background: '#e5e7eb' }}></div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Aktivitas Terkini</p>
                                                        <div className="h-px flex-1" style={{ background: '#e5e7eb' }}></div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {recentScans.length > 0 ? recentScans.map((scan, i) => (
                                                            <div key={scan.id || i} className="flex items-center justify-between p-2.5 rounded-xl transition-all hover:bg-gray-50" style={{ background: 'white', border: '1px solid #f3f4f6' }}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: '#f0faf0', color: '#2f9338' }}>
                                                                        {scan.nama.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold" style={{ color: '#1f2937' }}>{scan.nama}</p>
                                                                        <p className="text-[10px] font-medium" style={{ color: '#2f9338' }}>Berhasil hadir</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-bold" style={{ color: '#9ca3af' }}>{scan.waktu}</span>
                                                            </div>
                                                        )) : (
                                                            <div className="text-center py-4">
                                                                <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>Belum ada data presensi.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Below-card login prompt */}
                                        {!user && (
                                            <p className="mt-4 text-center text-[12px] font-medium" style={{ color: '#9ca3af' }}>
                                                Admin sekolah?{' '}
                                                <button
                                                    id="btn-login-card-prompt"
                                                    onClick={() => setIsLoginModalOpen(true)}
                                                    className="font-bold transition-colors hover:underline"
                                                    style={{ color: '#2f9338' }}
                                                >
                                                    Masuk di sini
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                    {/* ─── END RIGHT COLUMN ─── */}

                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── ADMIN: QR Scanner Dashboard ── */}
                    {user && isAdmin && (
                        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col gap-4">

                            {/* ── Top bar: Page title + stats ── */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-aos="fade-down">
                                <div>
                                    <div className="inline-flex items-center gap-2 mb-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-smaba-500 animate-pulse"></span>
                                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#2f9338' }}>Dashboard Admin</span>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight" style={{ color: '#0f2612' }}>Kamera Presensi</h2>
                                    <p className="text-sm font-medium mt-0.5" style={{ color: '#6b7280' }}>Arahkan QR Code peserta ke kamera untuk memvalidasi kehadiran</p>
                                </div>

                                {/* Compact Stats */}
                                <div className="flex items-stretch gap-3">
                                    <div className="px-5 py-3 rounded-xl text-center" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Total</p>
                                        <p className="text-2xl font-black mt-0.5" style={{ color: '#111827' }}>{stats.total}</p>
                                    </div>
                                    <div className="px-5 py-3 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #26742e, #2f9338)', boxShadow: '0 2px 8px rgba(47,147,56,0.2)' }}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>Hadir</p>
                                        <p className="text-2xl font-black mt-0.5 text-white">{stats.hadir}</p>
                                    </div>
                                    <div className="px-5 py-3 rounded-xl flex flex-col justify-center" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minWidth: '90px' }}>
                                        <div className="flex items-end justify-between mb-1.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Progress</p>
                                            <p className="text-sm font-black" style={{ color: '#2f9338' }}>{attendancePercentage}%</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: '#f0faf0' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${attendancePercentage}%`, background: 'linear-gradient(to right, #4db855, #2f9338)' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Scanner + History: Golden Ratio 62%/38% ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.618fr] gap-5 flex-1 min-h-0" style={{ maxHeight: '520px' }}>

                                {/* ─── LEFT: Scanner (61.8%) ─── */}
                                <div className="rounded-2xl overflow-hidden flex flex-col" data-aos="fade-right"
                                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                                    {/* Scanner header */}
                                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#374151' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: '#2f9338' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Pratinjau Kamera
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {isScanning && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md" style={{ background: '#fef2f2' }}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#dc2626' }}>LIVE</span>
                                                </div>
                                            )}
                                            {isScanning && (
                                                <button onClick={stopScanner} className="text-[11px] font-semibold px-3 py-1 rounded-md transition-colors" style={{ color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                                    Hentikan
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Scanner viewport */}
                                    <div className="flex-1 relative overflow-hidden" style={{ background: '#0f172a', minHeight: '280px' }}>
                                        {isScanning && <div id="qr-reader" className="w-full h-full object-cover" />}

                                        {isScanning && !isCameraLoading && (
                                            <div className="scanner-search-overlay" aria-hidden="true">
                                                <div className="scanner-search-box">
                                                    <span className="scanner-search-corner scanner-search-corner-tl"></span>
                                                    <span className="scanner-search-corner scanner-search-corner-tr"></span>
                                                    <span className="scanner-search-corner scanner-search-corner-bl"></span>
                                                    <span className="scanner-search-corner scanner-search-corner-br"></span>
                                                    <span className="scanner-search-line"></span>
                                                </div>
                                            </div>
                                        )}

                                        {isScanning && isCameraLoading && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)' }}>
                                                <div className="h-9 w-9 rounded-full border-3 border-t-smaba-500 border-slate-700 animate-spin mb-3" style={{ border: '3px solid #1e293b', borderTopColor: '#2f9338' }}></div>
                                                <p className="text-xs font-bold text-white tracking-widest uppercase">Inisialisasi Kamera</p>
                                            </div>
                                        )}

                                        {!isScanning && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#1e293b' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{ color: '#475569' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-bold text-white mb-1">Kamera Dinonaktifkan</p>
                                                <p className="text-xs mb-6" style={{ color: '#64748b' }}>Klik tombol di bawah untuk memulai pemindaian QR</p>
                                                <button
                                                    id="btn-mulai-scan"
                                                    onClick={startScanner}
                                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                                                    style={{ background: '#2f9338', boxShadow: '0 2px 12px rgba(47,147,56,0.3)' }}
                                                >
                                                    Mulai Pemindaian
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Error message */}
                                    {error && (
                                        <div className="px-5 py-3" style={{ background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                                            <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>{error}</p>
                                        </div>
                                    )}
                                </div>

                                {/* ─── RIGHT: Scan History (38.2%) ─── */}
                                <div className="rounded-2xl flex flex-col overflow-hidden" data-aos="fade-left" data-aos-delay="100"
                                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                                    {/* History header */}
                                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
                                        <h3 className="text-sm font-black flex items-center gap-2" style={{ color: '#111827' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: '#2f9338' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Aktivitas Real-time
                                        </h3>
                                        {scanHistory.length > 0 && (
                                            <button
                                                onClick={() => setScanHistory([])}
                                                className="text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                style={{ color: '#9ca3af' }}
                                                onMouseEnter={e => e.target.style.color = '#ef4444'}
                                                onMouseLeave={e => e.target.style.color = '#9ca3af'}
                                            >
                                                Bersihkan
                                            </button>
                                        )}
                                    </div>

                                    {/* History list */}
                                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                        {scanHistory.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                                <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#f9fafb' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" style={{ color: '#d1d5db' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-bold" style={{ color: '#6b7280' }}>Belum ada aktivitas</p>
                                                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Log scan akan muncul di sini</p>
                                            </div>
                                        ) : (
                                            scanHistory.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start gap-3 p-3.5 rounded-xl transition-all"
                                                    style={{
                                                        background: index === 0 ? 'white' : 'white',
                                                        border: `1px solid ${index === 0 ? 'rgba(47,147,56,0.2)' : 'rgba(0,0,0,0.06)'}`,
                                                        boxShadow: index === 0 ? '0 2px 8px rgba(47,147,56,0.08)' : 'none',
                                                        transform: index === 0 ? 'scale(1.01)' : 'scale(1)',
                                                    }}
                                                >
                                                    <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl text-sm font-black text-white shadow-sm"
                                                        style={{
                                                            background: item.status === 'success' ? '#2f9338'
                                                                : item.status === 'already' ? '#d97706'
                                                                : '#ef4444'
                                                        }}>
                                                        {item.nama?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-0.5">
                                                        <p className="truncate text-sm font-bold" style={{ color: '#111827' }}>{item.nama}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-semibold" style={{ color: '#9ca3af' }}>{item.nis_nip}</span>
                                                            {getStatusBadge(item.status)}
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 text-[10px] font-semibold" style={{ color: '#9ca3af' }}>{item.timestamp}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Scan count footer */}
                                    <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
                                        <span className="text-[11px] font-semibold" style={{ color: '#9ca3af' }}>
                                            Total scan: <strong style={{ color: '#374151' }}>{scanCount}</strong>
                                        </span>
                                        <Link href={route('dashboard')} className="text-[11px] font-bold transition-colors" style={{ color: '#2f9338' }}>
                                            Buka Dashboard →
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </main>

                {/* ═══════════════════════════════════════════════════
                    FOOTER — minimal, integrated
                ═══════════════════════════════════════════════════ */}
                <footer className="relative z-10" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: 'rgba(246,250,246,0.9)' }}>
                    <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold" style={{ color: '#9ca3af' }}>
                            © {new Date().getFullYear()} E-Presensi SMA Negeri 1 Babat
                        </p>
                        <p className="text-[12px] font-medium" style={{ color: '#d1d5db' }}>
                            Dikelola oleh Tim IT Sekolah
                        </p>
                    </div>
                </footer>

            </div>

            {/* ── ANIMATIONS ── */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(8px) scale(0.99); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── QR Scanner overlay ── */
                .scanner-search-overlay {
                    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
                    background: radial-gradient(circle at center, transparent 0 33%, rgba(15,23,42,0.5) 34% 100%);
                }
                .scanner-search-box {
                    position: absolute; left: 50%; top: 50%;
                    width: clamp(140px, 45%, 220px); aspect-ratio: 1/1;
                    border: 2px solid rgba(47,147,56,0.85);
                    border-radius: 20px;
                    box-shadow: 0 0 0 999px rgba(15,23,42,0.45), 0 0 30px rgba(47,147,56,0.25);
                    transform: translate(-50%, -50%);
                }
                .scanner-search-line {
                    position: absolute; left: 8%; right: 8%; top: 10%; height: 3px; border-radius: 999px;
                    background: linear-gradient(90deg, transparent, #4db855, #2f9338, transparent);
                    box-shadow: 0 0 14px rgba(77,184,85,0.7);
                    animation: qr-scan-line 2s ease-in-out infinite;
                }
                .scanner-search-corner {
                    position: absolute; width: 24px; height: 24px;
                    border-color: white;
                    filter: drop-shadow(0 0 6px rgba(47,147,56,0.5));
                }
                .scanner-search-corner-tl { left: -2px; top: -2px; border-left: 4px solid; border-top: 4px solid; border-top-left-radius: 20px; }
                .scanner-search-corner-tr { right: -2px; top: -2px; border-right: 4px solid; border-top: 4px solid; border-top-right-radius: 20px; }
                .scanner-search-corner-bl { left: -2px; bottom: -2px; border-left: 4px solid; border-bottom: 4px solid; border-bottom-left-radius: 20px; }
                .scanner-search-corner-br { right: -2px; bottom: -2px; border-right: 4px solid; border-bottom: 4px solid; border-bottom-right-radius: 20px; }
                @keyframes qr-scan-line {
                    0%, 100% { top: 10%; opacity: 0.2; }
                    50% { top: 82%; opacity: 1; }
                }
            `}</style>

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                canResetPassword={canResetPassword}
            />
        </>
    );
}
