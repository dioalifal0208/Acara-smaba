import { Link, Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/Components/Toast';
import LoginModal from '@/Components/LoginModal';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Welcome({ auth, stats: initialStats, canResetPassword = true }) {
    const { user } = auth;
    const isAdmin = user && user.isAdmin;

    const [stats, setStats] = useState(initialStats || { total: 0, hadir: 0, belum: 0 });
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
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

            <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-800 font-sans">
                
                {/* --- PREMIUM BACKGROUND ELEMENTS --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Top left deep green glow */}
                    <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-smaba-600/20 to-emerald-400/10 blur-[120px]"></div>
                    {/* Bottom right subtle glow */}
                    <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-smaba-500/20 to-teal-300/10 blur-[120px]"></div>
                    {/* Grid Pattern overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                </div>

                {/* --- MODERN GLASS NAVBAR --- */}
                <nav className="relative z-50 w-full px-6 py-5" data-aos="fade-down">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-3">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                                    <img
                                        src="/images/logo.png"
                                        alt="Logo SMA Negeri 1 Babat"
                                        className="h-9 w-9 object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="font-black text-xl tracking-tight text-slate-900 leading-none">E-Presensi</h1>
                                    <p className="text-[11px] font-bold text-smaba-600 tracking-widest uppercase mt-1">SMA Negeri 1 Babat</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {user ? (
                                    <>
                                        {isAdmin && (
                                            <Link
                                                href={route('dashboard')}
                                                className="text-sm font-bold text-slate-600 hover:text-smaba-600 transition-colors mr-3"
                                            >
                                                Dashboard Admin
                                            </Link>
                                        )}
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="rounded-2xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                                        >
                                            Keluar
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="group relative rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-smaba-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="relative flex items-center gap-2">
                                            Login
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="relative z-10 flex-1 flex items-center justify-center py-8 px-6">
                    <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-center">
                        
                        {/* ── Scenario 1: GUEST / GURU (Tampilan Pencarian QR Code) ── */}
                        {(!user || !isAdmin) && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                                
                                {/* ── Left Column: Premium Typography & Copywriting ── */}
                                <div className="lg:col-span-7 space-y-8 text-center lg:text-left" data-aos="fade-right">
                                    <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-smaba-700 border border-slate-100 shadow-sm shadow-smaba-500/5">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-smaba-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-smaba-500"></span>
                                        </span>
                                        Layanan Administrasi Digital Terpadu
                                    </div>
                                    
                                    <h2 className="text-5xl font-black tracking-tight text-slate-900 sm:text-7xl leading-[1.05]">
                                        Sistem Presensi <br />
                                        <span className="relative inline-block mt-2">
                                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-smaba-600 via-emerald-500 to-teal-500">
                                                Cerdas &amp; Terintegrasi
                                            </span>
                                        </span>
                                    </h2>
                                    
                                    <p className="text-base text-slate-600 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
                                        Selamat datang di portal <strong className="font-bold text-slate-800">E-Presensi SMA Negeri 1 Babat</strong>. 
                                        Dapatkan akses cepat ke QR Code identitas Anda untuk keperluan absensi kegiatan sekolah. Masukkan Nama Lengkap atau NIP Anda untuk mencetak atau mengunduh kode presensi pribadi.
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-6 pt-2 justify-center lg:justify-start">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-smaba-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">1. Cari Data</span>
                                        </div>
                                        <div className="w-8 h-[2px] bg-slate-200 rounded-full hidden sm:block"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-emerald-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">2. Unduh QR</span>
                                        </div>
                                        <div className="w-8 h-[2px] bg-slate-200 rounded-full hidden sm:block"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-teal-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">3. Scan di Lokasi</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Right Column: Interactive Search Card ── */}
                                <div className="lg:col-span-5 relative" data-aos="fade-left" data-aos-delay="200">
                                    {/* Decorative elements behind card */}
                                    <div className="absolute -inset-4 bg-gradient-to-r from-smaba-400 to-emerald-400 rounded-[40px] blur-2xl opacity-20"></div>
                                    
                                    <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-20 border border-slate-100/80">
                                        <div className="mb-8">
                                            <h3 className="text-xl font-black text-slate-900 mb-2">Akses QR Code</h3>
                                            <p className="text-sm text-slate-500 font-medium">Temukan kartu identitas digital Anda</p>
                                        </div>

                                        <form onSubmit={handleLookup} className="space-y-4">
                                            <div className="relative group" ref={suggestionsRef}>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nama Lengkap / NIP</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Ketik nama untuk mencari..."
                                                        value={searchQuery}
                                                        onChange={(e) => handleInputChange(e.target.value)}
                                                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-4 pl-5 pr-14 text-sm text-slate-900 placeholder-slate-400 focus:border-smaba-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-smaba-500/10 font-semibold transition-all"
                                                        required
                                                        autoComplete="off"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isSearching}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-smaba-500 to-smaba-600 text-white transition-all hover:shadow-lg hover:shadow-smaba-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                                    >
                                                        {isSearching ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Recommendations Floating Dropdown */}
                                                {showSuggestions && (
                                                    <div className="absolute left-0 right-0 mt-3 z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 max-h-60 overflow-y-auto divide-y divide-slate-50 animate-[fadeIn_0.15s_ease-out]">
                                                        {suggestions.map((p) => (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => handleSelectSuggestion(p)}
                                                                className="px-5 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer group/item"
                                                            >
                                                                <p className="text-sm font-bold text-slate-800 group-hover/item:text-smaba-700 transition-colors">{p.nama}</p>
                                                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5 tracking-wide">{p.nis_nip}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </form>

                                        {lookupError && (
                                            <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3 animate-[fadeIn_0.2s_ease-out]">
                                                <div className="bg-rose-100 rounded-full p-1 mt-0.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                                                    {lookupError}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Tampilan Kartu Hasil QR */}
                                        {lookupResult && (
                                            <div className="mt-6 pt-6 border-t border-slate-100 relative animate-[slideIn_0.4s_ease-out]">
                                                <div className="flex flex-col items-center bg-slate-50/50 rounded-3xl p-6 border border-slate-100/80">
                                                    <div className="mb-4 flex flex-col items-center text-center">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-smaba-100 to-emerald-100 text-smaba-700 font-black text-xl mb-3 shadow-sm border border-white">
                                                            {lookupResult.nama.charAt(0).toUpperCase()}
                                                        </div>
                                                        <h4 className="text-base font-black text-slate-900 leading-tight">{lookupResult.nama}</h4>
                                                        <p className="text-xs text-slate-500 font-bold mt-1 tracking-wide bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{lookupResult.nis_nip}</p>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-6">
                                                        <img
                                                            src={route('participants.qr', lookupResult.id)}
                                                            alt={`QR Code - ${lookupResult.nama}`}
                                                            className="h-44 w-44"
                                                        />
                                                    </div>

                                                    <div className="flex gap-3 w-full">
                                                        <a
                                                            href={route('participants.download.svg', lookupResult.id)}
                                                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                            Simpan
                                                        </a>
                                                        <button
                                                            onClick={() => handlePrint(lookupResult)}
                                                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-smaba-600 to-emerald-600 px-4 py-3 text-xs font-bold text-white transition-all hover:from-smaba-700 hover:to-emerald-700 shadow-lg shadow-smaba-500/25 active:scale-95"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                            </svg>
                                                            Cetak
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Scenario 2: ADMIN (Tampilan QR Scanner utama) ── */}
                        {user && isAdmin && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[600px]">
                                
                                {/* ── Left: Scanner Dashboard ── */}
                                <div className="lg:col-span-8 flex flex-col space-y-6">
                                    <div className="flex items-end justify-between bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden" data-aos="fade-down">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-smaba-50 to-transparent rounded-bl-full"></div>
                                        <div className="relative z-10">
                                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider mb-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                                Dashboard Admin
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kamera Presensi</h2>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Arahkan QR Code peserta ke kamera untuk memvalidasi kehadiran.</p>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-4" data-aos="fade-up" data-aos-delay="100">
                                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Data</p>
                                            <p className="text-3xl font-black text-slate-800 mt-1">{stats.total}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-smaba-600 to-emerald-600 rounded-[24px] p-5 shadow-md shadow-smaba-500/20 text-white flex flex-col justify-center">
                                            <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Telah Hadir</p>
                                            <p className="text-3xl font-black mt-1">{stats.hadir}</p>
                                        </div>
                                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
                                            <div className="flex items-end justify-between mb-2">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</p>
                                                <p className="text-base font-black text-smaba-600 leading-none">{attendancePercentage}%</p>
                                            </div>
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-smaba-400 to-emerald-500 transition-all duration-1000 ease-out"
                                                    style={{ width: `${attendancePercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scanner Camera Box */}
                                    <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col relative overflow-hidden" data-aos="zoom-in" data-aos-delay="200">
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-smaba-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Pratinjau Kamera
                                            </h3>
                                            {isScanning && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                                                    <span className="text-[11px] font-bold uppercase tracking-wider">Live</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative flex-1 rounded-[24px] bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center min-h-[250px]">
                                            {isScanning && (
                                                <div id="qr-reader" className="w-full h-full object-cover" />
                                            )}

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
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-smaba-500 mb-4"></div>
                                                    <p className="text-xs font-bold text-white tracking-widest uppercase">Inisialisasi Kamera</p>
                                                </div>
                                            )}

                                            {!isScanning && (
                                                <div className="flex flex-col items-center justify-center text-center p-8">
                                                    <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-300 mb-1">Kamera Dinonaktifkan</p>
                                                    <p className="text-xs text-slate-500 mb-6">Sistem menunggu untuk mengaktifkan pemindai QR Code</p>
                                                    <button
                                                        onClick={startScanner}
                                                        className="rounded-xl bg-smaba-600 px-6 py-3 text-sm font-bold text-white hover:bg-smaba-700 transition-all shadow-lg active:scale-95"
                                                    >
                                                        Mulai Pemindaian
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {error && (
                                            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                                                <p className="text-xs font-bold text-rose-600">{error}</p>
                                            </div>
                                        )}

                                        {isScanning && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={stopScanner}
                                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    Hentikan Kamera
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── Right: Live Scan History ── */}
                                <div className="lg:col-span-4 h-full">
                                    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full flex flex-col overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-smaba-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Aktivitas Real-time
                                            </h3>
                                            {scanHistory.length > 0 && (
                                                <button
                                                    onClick={() => setScanHistory([])}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-500 transition-colors"
                                                >
                                                    Bersihkan
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
                                            {scanHistory.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">Belum ada aktivitas</p>
                                                    <p className="text-xs mt-1 text-slate-400">Log scan peserta akan muncul di sini</p>
                                                </div>
                                            ) : (
                                                scanHistory.map((item, index) => (
                                                    <div
                                                        key={item.id}
                                                        className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${index === 0 ? 'bg-white shadow-md border border-slate-100 scale-[1.02] relative z-10' : 'bg-white/50 hover:bg-white border border-transparent'}`}
                                                    >
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow-sm ${
                                                            item.status === 'success' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' :
                                                            item.status === 'already' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
                                                            'bg-gradient-to-br from-rose-400 to-rose-500 text-white'
                                                        }`}>
                                                            {item.nama?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-0.5">
                                                            <p className="truncate text-sm font-bold text-slate-800 leading-none">{item.nama}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-[10px] text-slate-500 font-semibold">{item.nis_nip}</span>
                                                                {getStatusBadge(item.status)}
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-[10px] text-slate-400 font-bold">{item.timestamp}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>

                {/* --- FOOTER --- */}
                <footer className="relative z-10 py-6 text-center mt-auto border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-500">
                        &copy; {new Date().getFullYear()} E-Presensi SMA Negeri 1 Babat. 
                        <span className="font-medium ml-1 text-slate-400">Dikelola oleh Tim IT Sekolah.</span>
                    </p>
                </footer>
            </div>

            {/* --- INLINE STYLES FOR ANIMATIONS --- */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .scanner-search-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                    background: radial-gradient(circle at center, transparent 0 35%, rgba(15, 23, 42, 0.4) 36% 100%);
                }
                .scanner-search-box {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: clamp(160px, 50%, 260px);
                    aspect-ratio: 1 / 1;
                    border: 2px solid rgba(16, 185, 129, 0.8);
                    border-radius: 32px;
                    box-shadow: 0 0 0 999px rgba(15, 23, 42, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
                    transform: translate(-50%, -50%);
                    animation: qr-search-box 6s ease-in-out infinite;
                }
                .scanner-search-line {
                    position: absolute;
                    left: 10%;
                    right: 10%;
                    top: 15%;
                    height: 4px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, transparent, #34d399, #10b981, transparent);
                    box-shadow: 0 0 20px rgba(52, 211, 153, 0.8);
                    animation: qr-search-line 2s ease-in-out infinite;
                }
                .scanner-search-corner {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border-color: #ffffff;
                    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.6));
                }
                .scanner-search-corner-tl {
                    left: -2px;
                    top: -2px;
                    border-left: 5px solid;
                    border-top: 5px solid;
                    border-top-left-radius: 32px;
                }
                .scanner-search-corner-tr {
                    right: -2px;
                    top: -2px;
                    border-right: 5px solid;
                    border-top: 5px solid;
                    border-top-right-radius: 32px;
                }
                .scanner-search-corner-bl {
                    left: -2px;
                    bottom: -2px;
                    border-left: 5px solid;
                    border-bottom: 5px solid;
                    border-bottom-left-radius: 32px;
                }
                .scanner-search-corner-br {
                    right: -2px;
                    bottom: -2px;
                    border-right: 5px solid;
                    border-bottom: 5px solid;
                    border-bottom-right-radius: 32px;
                }
                @keyframes qr-search-box {
                    0%, 100% { transform: translate(-50%, -50%); }
                    25% { transform: translate(-60%, -55%); }
                    50% { transform: translate(-40%, -45%); }
                    75% { transform: translate(-45%, -55%); }
                }
                @keyframes qr-search-line {
                    0%, 100% { top: 15%; opacity: 0.2; }
                    50% { top: 85%; opacity: 1; }
                }
            `}</style>

            {/* Login Popup Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                canResetPassword={canResetPassword}
            />
        </>
    );
}
