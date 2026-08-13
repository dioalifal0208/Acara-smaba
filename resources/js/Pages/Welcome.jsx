import { Link, Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/Components/Toast';

export default function Welcome({ auth, stats: initialStats }) {
    const { user } = auth;
    const isAdmin = user && user.isAdmin;

    const [stats, setStats] = useState(initialStats || { total: 0, hadir: 0, belum: 0 });
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

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

    // Auto-start scanner untuk Admin saat landing page terbuka
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

    // Cleanup cooldown
    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) {
                clearTimeout(cooldownTimerRef.current);
            }
        };
    }, []);

    // Klik di luar rekomendasi untuk menutup dropdown autocomplete
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handler ketika input ketikan pencarian QR berubah
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

    // Handler ketika rekomendasi dipilih
    const handleSelectSuggestion = (participant) => {
        setSearchQuery(participant.nama);
        setLookupResult(participant);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Public QR Code Lookup (Guru/Peserta)
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
                setLookupError('Peserta/Guru tidak ditemukan. Cek NIP atau Nama Anda.');
            }
        } catch (err) {
            setLookupError('Gagal memproses pencarian. Periksa jaringan Anda.');
        } finally {
            setIsSearching(false);
        }
    };

    // Cetak QR Code
    const handlePrint = (p) => {
        const printWindow = window.open('', '_blank', 'width=500,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${p.nama}</title>
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
                    <div class="footer">SMA Negeri 1 Babat - Presensi QR Code</div>
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

    // Helper badge
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
            <Head title="Presensi QR Code - SMAN 1 Babat" />
            {/* Toast is now handled globally via ToastProvider */}

            <div className="relative h-screen flex flex-col justify-between overflow-hidden bg-slate-50 text-slate-800">
                
                {/* Background decorative glow (subtle) */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-3xl"></div>

                {/* Navbar (fixed compact height) */}
                <nav className="relative z-10 mx-auto w-full max-w-7xl px-6 py-4 flex items-center justify-between flex-none" data-aos="fade-down">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Logo SMAN 1 Babat"
                            className="h-10 w-10 object-contain"
                        />
                        <div>
                            <span className="font-extrabold text-lg tracking-tight text-slate-900 block">SMABA EVENT</span>
                            <span className="text-[10px] text-indigo-600 block -mt-1 font-semibold">SMA Negeri 1 Babat</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mr-2"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-300"
                                >
                                    Log Out
                                </Link>
                            </>
                        ) : (
                            <Link
                                href={route('login')}
                                className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-800 shadow-md shadow-indigo-500/10"
                            >
                                Login Panitia
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Main Content (constrained height, overflow hidden) */}
                <main className="relative z-10 flex-1 flex items-center justify-center py-4 px-6 overflow-hidden">
                    <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-center">
                        
                        {/* ── Scenario 1: GUEST / GURU (Tampilan Pencarian QR Code) ── */}
                        {(!user || !isAdmin) && (
                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
                                
                                {/* Text Hero & Deskripsi */}
                                <div className="lg:col-span-7 space-y-4 text-center lg:text-left" data-aos="fade-right">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-xs font-bold text-indigo-600 border border-indigo-100">
                                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                        Presensi Cepat SMAN 1 Babat
                                    </div>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl leading-tight">
                                        Cari &amp; Cetak <br />
                                        QR Code Presensi Anda
                                    </h1>
                                    <p className="text-sm text-slate-600 max-w-xl font-medium leading-relaxed">
                                        Masukkan NIP (untuk Guru/Staf) atau Nama Lengkap Anda pada kolom pencarian di samping untuk menampilkan, mencetak, atau mengunduh QR Code pribadi Anda.
                                    </p>
                                    
                                    <div className="flex items-center gap-4 pt-2 justify-center lg:justify-start">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 text-indigo-600 font-bold shadow-sm">1</span>
                                            Cari Identitas
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 text-indigo-600 font-bold shadow-sm">2</span>
                                            Cetak/Unduh QR
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 text-indigo-600 font-bold shadow-sm">3</span>
                                            Scan di Meja Panitia
                                        </div>
                                    </div>
                                </div>

                                {/* Form Pencarian + Kartu Tampilan QR */}
                                <div className="lg:col-span-5 space-y-4" data-aos="fade-left">
                                    {/* Form Pencarian */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl">
                                        <h3 className="text-sm font-bold mb-3 text-slate-800">Cari Kartu Presensi</h3>
                                        <form onSubmit={handleLookup} className="space-y-3">
                                            <div className="relative" ref={suggestionsRef}>
                                                <input
                                                    type="text"
                                                    placeholder="Masukkan NIP atau Nama Anda..."
                                                    value={searchQuery}
                                                    onChange={(e) => handleInputChange(e.target.value)}
                                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium"
                                                    required
                                                    autoComplete="off"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSearching}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-700 p-2 text-white transition-colors hover:bg-indigo-800 disabled:opacity-50"
                                                >
                                                    {isSearching ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Recommendations Floating Dropdown */}
                                                {showSuggestions && (
                                                    <div className="absolute left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 animate-[fadeIn_0.15s_ease-out]">
                                                        {suggestions.map((p) => (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => handleSelectSuggestion(p)}
                                                                className="px-4 py-2.5 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                                                                <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{p.nis_nip}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </form>

                                        {lookupError && (
                                            <p className="mt-2.5 text-xs text-red-700 font-medium flex items-center gap-1.5">
                                                <span className="text-red-500">⚠</span> {lookupError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Hasil Pencarian (Kartu QR Code) */}
                                    {lookupResult && (
                                        <div className="bg-white border border-indigo-200 rounded-3xl p-5 text-center shadow-2xl animate-[slideIn_0.3s_ease-out] relative overflow-hidden" data-aos="zoom-in">
                                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>

                                            <div className="mb-3 flex items-center justify-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                                                    {lookupResult.nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{lookupResult.nama}</h4>
                                                    <p className="text-xs text-indigo-600 font-bold mt-0.5">{lookupResult.nis_nip}</p>
                                                </div>
                                            </div>

                                            <div className="my-3 flex items-center justify-center rounded-2xl bg-white p-3 shadow-inner border border-slate-300">
                                                <img
                                                    src={route('participants.qr', lookupResult.id)}
                                                    alt={`QR Code - ${lookupResult.nama}`}
                                                    className="h-36 w-36"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <a
                                                    href={route('participants.download.svg', lookupResult.id)}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Unduh SVG
                                                </a>
                                                <button
                                                    onClick={() => handlePrint(lookupResult)}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-800 shadow-md shadow-indigo-500/10"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                    Cetak
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Scenario 2: ADMIN (Tampilan QR Scanner utama) ── */}
                        {user && isAdmin && (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 h-full max-h-[560px] items-stretch">
                                
                                {/* ── Left: Scanner + Stats ── */}
                                <div className="lg:col-span-2 flex flex-col justify-between space-y-4" data-aos="fade-right">
                                    <div className="flex items-center justify-between flex-none">
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-600 border border-indigo-100">
                                                Mode Panitia / Admin
                                            </span>
                                            <h2 className="text-xl font-bold mt-1 text-slate-900">Scanner Presensi Utama</h2>
                                        </div>
                                        <div>
                                            {isScanning && (
                                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                                                    Kamera Aktif
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Live Stats Bar (compact) */}
                                    <div className="grid grid-cols-3 gap-3 flex-none">
                                        <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Peserta</p>
                                            <p className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.total}</p>
                                        </div>
                                        <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hadir</p>
                                            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.hadir}</p>
                                        </div>
                                        <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm flex flex-col justify-between">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Progress</p>
                                                <p className="text-xs font-bold text-indigo-600">{attendancePercentage}%</p>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-700"
                                                    style={{ width: `${attendancePercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scanner Card (fixed vertical fit) */}
                                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md flex-1 flex flex-col">
                                        <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 px-4 py-2 flex-none">
                                            <div className="flex items-center justify-between text-white">
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                    <span className="text-xs font-bold">
                                                        {cooldownActive ? 'Memproses...' : 'Arahkan ke QR Code'}
                                                    </span>
                                                </div>
                                                {cooldownActive && (
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white flex-1 flex flex-col justify-center overflow-hidden">
                                            {/* Camera View Wrapper (fixed height to fit page) */}
                                            <div className="relative overflow-hidden rounded-xl bg-slate-900 w-full flex-1 max-h-[300px] flex items-center justify-center">
                                                {isScanning && (
                                                    <div id="qr-reader" className="w-full text-center" />
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
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-200 z-10">
                                                        <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500"></div>
                                                        <p className="text-xs text-slate-300">Menghubungkan ke kamera...</p>
                                                    </div>
                                                )}
                                            </div>

                                            {!isScanning && (
                                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 flex-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <p className="text-xs text-slate-700 font-bold">Kamera dinonaktifkan</p>
                                                    <button
                                                        onClick={startScanner}
                                                        className="mt-3 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-800 transition-colors shadow-md shadow-indigo-500/10"
                                                    >
                                                        Nyalakan Kamera
                                                    </button>
                                                </div>
                                            )}

                                            {error && (
                                                <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-2 text-center flex-none">
                                                    <p className="text-xs font-semibold text-red-700">{error}</p>
                                                </div>
                                            )}

                                            {isScanning && (
                                                <div className="mt-2 flex-none">
                                                    <button
                                                        onClick={stopScanner}
                                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100/60"
                                                    >
                                                        Hentikan Pemindaian
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Right: Scan History (fixed height) ── */}
                                <div className="lg:col-span-1 h-full flex flex-col overflow-hidden" data-aos="fade-left">
                                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-lg flex-1 flex flex-col">
                                        <div className="border-b border-slate-200 px-4 py-2.5 flex items-center justify-between bg-slate-50 flex-none">
                                            <h3 className="text-xs font-extrabold text-slate-800">Riwayat Pemindaian</h3>
                                            {scanHistory.length > 0 && (
                                                <button
                                                    onClick={() => setScanHistory([])}
                                                    className="text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors"
                                                >
                                                    Bersihkan
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[460px]">
                                            {scanHistory.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-700 h-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <p className="text-xs font-bold">Menunggu data scan...</p>
                                                </div>
                                            ) : (
                                                scanHistory.map((item, index) => (
                                                    <div
                                                        key={item.id}
                                                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50/50 ${index === 0 ? 'bg-indigo-50/30' : ''}`}
                                                    >
                                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                            item.status === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                            item.status === 'already' ? 'bg-amber-100 text-amber-700 border border-emerald-200' :
                                                            'bg-rose-100 text-rose-700 border border-rose-200'
                                                        }`}>
                                                            {item.nama?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-bold text-slate-800 leading-tight">{item.nama}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[10px] text-slate-600 font-semibold">{item.nis_nip}</span>
                                                                {getStatusBadge(item.status)}
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-[10px] text-slate-500 font-bold">{item.timestamp}</span>
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

                {/* Footer (compact, flex-none) */}
                <footer className="relative z-10 border-t border-slate-200 bg-white py-3.5 text-center text-xs text-slate-500 font-semibold flex-none" data-aos="fade-up">
                    <p>&copy; {new Date().getFullYear()} SMA Negeri 1 Babat. Hak Cipta Dilindungi.</p>
                </footer>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .qr-svg-container svg {
                    width: 100% !important;
                    height: auto !important;
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
                    width: clamp(130px, 42%, 220px);
                    aspect-ratio: 1 / 1;
                    border: 2px solid rgba(99, 102, 241, 0.95);
                    border-radius: 18px;
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.12), 0 0 28px rgba(99, 102, 241, 0.45);
                    transform: translate(-50%, -50%);
                    animation: qr-search-box 4.8s ease-in-out infinite;
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
                .scanner-search-corner {
                    position: absolute;
                    width: 24px;
                    height: 24px;
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
                @keyframes qr-search-box {
                    0%, 100% { transform: translate(-50%, -50%); }
                    20% { transform: translate(-68%, -58%); }
                    40% { transform: translate(-35%, -60%); }
                    60% { transform: translate(-38%, -36%); }
                    80% { transform: translate(-64%, -34%); }
                }
                @keyframes qr-search-line {
                    0%, 100% { top: 14%; opacity: 0.45; }
                    50% { top: 84%; opacity: 1; }
                }
            `}</style>
        </>
    );
}
