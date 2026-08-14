import { Head, useForm } from '@inertiajs/react';
import { useState, useCallback, useEffect, useRef } from 'react';

// ── Helper: Simple Lightweight Device Fingerprint (tanpa library eksternal) ──
function getOrCreateDeviceId() {
    const KEY = 'smaba_device_uid';
    let uid = localStorage.getItem(KEY);
    if (!uid) {
        // Generate persistent UUID berbasis waktu + random
        uid = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        // Tambahkan canvas fingerprint
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#069';
            ctx.fillText('smaba🟢', 2, 2);
            const canvasHash = canvas.toDataURL().slice(-32);
            uid += '-' + canvasHash.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
        } catch (_) {}
        localStorage.setItem(KEY, uid);
    }
    return uid;
}

// ── Helper: Kunci lokal ke LocalStorage setelah presensi sukses ──
function getLockKey(eventId) {
    return `smaba_locked_event_${eventId}`;
}

function getLocalLock(eventId) {
    try {
        const raw = localStorage.getItem(getLockKey(eventId));
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
}

function setLocalLock(eventId, participant, timestamp) {
    try {
        localStorage.setItem(getLockKey(eventId), JSON.stringify({ participant, timestamp, locked_at: new Date().toISOString() }));
    } catch (_) {}
}

// ── Komponen: Halaman Terkunci Permanen (sudah absen) ──
function LockedScreen({ lock, activeEvent }) {
    return (
        <div className="relative h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col items-center justify-center p-6 text-center">
            {/* Glow */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-green-400/10 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white border border-emerald-200 shadow-2xl p-7">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <img src="/images/logo.png" alt="Logo SMAN 1 Babat" className="h-12 w-12 object-contain" />
                </div>

                {/* Centang Besar */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-lg font-extrabold text-emerald-800 mb-1">Presensi Berhasil!</h2>
                <p className="text-xs text-slate-500 font-semibold mb-4">
                    {activeEvent?.nama_event || 'Event Aktif'}
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                    <p className="text-base font-extrabold text-slate-900 leading-tight">{lock.participant?.nama}</p>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">{lock.participant?.nis_nip}</p>
                    <p className="text-xs text-slate-500 mt-2 font-semibold">
                        Tercatat pukul: <span className="font-extrabold text-slate-700">{lock.timestamp}</span>
                    </p>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-left">
                    <span className="text-amber-600 text-sm mt-0.5 flex-shrink-0">🔒</span>
                    <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                        Perangkat ini telah dikunci untuk event ini. 1 perangkat hanya diizinkan untuk 1 kali presensi.
                    </p>
                </div>
            </div>

            <p className="relative z-10 mt-5 text-[10px] text-slate-400 font-medium">
                © {new Date().getFullYear()} SMA Negeri 1 Babat · Presensi Mandiri
            </p>
        </div>
    );
}

// ── Komponen Utama ──
export default function SelfCheckInForm({ token, activeEvent }) {
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [deviceLock, setDeviceLock] = useState(null); // null = belum terkunci

    // States untuk Autocomplete Rekomendasi
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef(null);

    const { data, setData, processing, reset } = useForm({
        nis_nip: '',
    });

    // Cek LocalStorage lock saat halaman pertama dibuka
    useEffect(() => {
        if (activeEvent?.id) {
            const lock = getLocalLock(activeEvent.id);
            if (lock) {
                setDeviceLock(lock);
            }
        }
    }, [activeEvent?.id]);

    // Umpan balik audio sederhana untuk HP peserta
    const playAudio = useCallback((type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.20, ctx.currentTime);
            if (type === 'success') {
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
            } else {
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) { /* abaikan jika tidak disupport HP */ }
    }, []);

    const handleInputChange = (val) => {
        setData('nis_nip', val);
        setErrorMsg(null);
        if (val.trim().length >= 2) {
            fetch(route('participants.search') + `?query=${encodeURIComponent(val)}`)
                .then((res) => res.json())
                .then((d) => {
                    setSuggestions(d);
                    setShowSuggestions(d.length > 0);
                })
                .catch(() => {});
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (participant) => {
        setData('nis_nip', participant.nis_nip);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.nis_nip.trim()) return;

        setResult(null);
        setErrorMsg(null);
        setShowSuggestions(false);
        setIsLocating(true);

        if (!navigator.geolocation) {
            setIsLocating(false);
            setErrorMsg('Browser Anda tidak mendukung deteksi lokasi.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
                const deviceTimestamp = position.timestamp || Date.now();

                // Anti-Mock Check: Akurasi 0 = injector
                if (accuracy === 0) {
                    setIsLocating(false);
                    setErrorMsg('Peringatan Keamanan: Terdeteksi manipulasi lokasi / Mock Location (Akurasi 0). Matikan aplikasi Fake GPS pada perangkat Anda.');
                    playAudio('error');
                    return;
                }
                if (accuracy > 100) {
                    setIsLocating(false);
                    setErrorMsg(`Sinyal GPS kurang presisi (akurasi: ±${Math.round(accuracy)}m). Mohon pastikan GPS dalam mode Akurasi Tinggi (High Accuracy) dan berada di area terbuka.`);
                    playAudio('error');
                    return;
                }

                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    const deviceId = getOrCreateDeviceId();

                    const response = await fetch(route('self-checkin.submit', token), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            nis_nip: data.nis_nip,
                            latitude,
                            longitude,
                            accuracy: accuracy ? Math.round(accuracy * 10) / 10 : null,
                            altitude: altitude !== null ? Math.round(altitude * 10) / 10 : null,
                            heading: heading !== null ? heading : null,
                            speed: speed !== null ? speed : null,
                            device_timestamp: deviceTimestamp,
                            device_id: deviceId,
                        }),
                    });

                    const resData = await response.json();

                    if (response.ok) {
                        if (resData.status === 'success') {
                            // Kunci browser secara lokal - permanen untuk event ini
                            setLocalLock(activeEvent.id, resData.participant, resData.timestamp);
                            // Tampilkan layar terkunci permanen
                            setDeviceLock({ participant: resData.participant, timestamp: resData.timestamp });
                            playAudio('success');
                            reset();
                        } else if (resData.status === 'already') {
                            setResult({
                                type: 'already',
                                title: 'Sudah Presensi',
                                message: `${resData.participant.nama} (${resData.participant.nis_nip}) sudah mengisi presensi untuk event ini.`,
                                nama: resData.participant.nama,
                                nis_nip: resData.participant.nis_nip,
                            });
                            playAudio('error');
                            reset();
                        }
                    } else {
                        // Cek device_locked dari server
                        if (resData.status === 'device_locked') {
                            // Kunci juga secara lokal menggunakan data dari server
                            const lp = resData.locked_participant;
                            setLocalLock(activeEvent.id, { nama: lp.nama, nis_nip: lp.nis_nip }, lp.waktu_hadir);
                            setDeviceLock({ participant: { nama: lp.nama, nis_nip: lp.nis_nip }, timestamp: lp.waktu_hadir });
                            playAudio('error');
                        } else {
                            setErrorMsg(resData.message || 'Terjadi kesalahan sistem.');
                            playAudio('error');
                        }
                    }
                } catch (err) {
                    setErrorMsg('Gagal terhubung ke server. Periksa koneksi internet Anda.');
                    playAudio('error');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                let msg = 'Gagal mendapatkan lokasi GPS Anda.';
                if (error.code === 1) msg = 'Akses lokasi ditolak. Aktifkan izin lokasi (GPS) pada browser/perangkat Anda.';
                else if (error.code === 2) msg = 'Sinyal GPS tidak ditemukan atau tidak stabil.';
                else if (error.code === 3) msg = 'Waktu permintaan lokasi habis (timeout). Silakan coba lagi.';
                setErrorMsg(msg);
                playAudio('error');
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    // Jika device sudah terkunci → tampilkan layar terkunci saja
    if (deviceLock) {
        return (
            <>
                <Head title="Presensi Berhasil - SMAN 1 Babat" />
                <LockedScreen lock={deviceLock} activeEvent={activeEvent} />
            </>
        );
    }

    return (
        <>
            <Head title="Self Check-In - SMAN 1 Babat" />

            <div className="relative h-screen overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between p-6">
                {/* Glow Spots */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-green-500/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

                {/* Header Logo */}
                <header className="relative z-10 mx-auto text-center mt-3 flex-none" data-aos="fade-down">
                    <div className="flex justify-center mb-1">
                        <img src="/images/logo.png" alt="Logo SMAN 1 Babat" className="h-10 w-10 object-contain" />
                    </div>
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 block">SMABA EVENT</span>
                    <span className="text-[9px] text-green-700 block -mt-0.5 font-semibold">SMA Negeri 1 Babat</span>
                </header>

                {/* Main Form Card */}
                <main className="relative z-10 flex-1 flex items-center justify-center my-4 overflow-hidden">
                    <div className="w-full max-w-sm">

                        {/* Event Inactive */}
                        {!activeEvent && (
                            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-2xl text-center" data-aos="zoom-in">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xl font-bold">
                                    ⚠️
                                </div>
                                <h2 className="text-base font-extrabold text-slate-800">Presensi Saat Ini Ditutup</h2>
                                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                                    Belum ada Event yang diaktifkan oleh Panitia/Admin. Silakan hubungi panitia acara untuk membuka sesi presensi.
                                </p>
                            </div>
                        )}

                        {/* Status Result Card (sudah/already) */}
                        {activeEvent && result && (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center shadow-xl animate-[slideUp_0.3s_ease-out] text-amber-800" data-aos="zoom-in">
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-lg font-bold">
                                    ⚠
                                </div>
                                <h3 className="text-md font-extrabold mb-1">{result.title}</h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-bold">{result.message}</p>
                            </div>
                        )}

                        {/* Form Utama */}
                        {activeEvent && !result && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl" data-aos="zoom-in">
                                <div className="text-center mb-5">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-700 border border-emerald-200 mb-2">
                                        🟢 {activeEvent.nama_event}
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Presensi Mandiri</h2>
                                    <p className="text-xs text-slate-500 mt-1 font-semibold">Ketik nama atau NIS/NIP untuk memilih</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative" ref={suggestionsRef}>
                                        <input
                                            type="text"
                                            placeholder="Ketik Nama / NIP Anda..."
                                            value={data.nis_nip}
                                            onChange={(e) => handleInputChange(e.target.value)}
                                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-center text-sm font-semibold tracking-wide text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 shadow-sm"
                                            required
                                            disabled={processing || isLocating}
                                            autoComplete="off"
                                            autoFocus
                                        />

                                        {showSuggestions && (
                                            <div className="absolute left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 animate-[fadeIn_0.15s_ease-out]">
                                                {suggestions.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => handleSelectSuggestion(p)}
                                                        className="px-4 py-2.5 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                                                    >
                                                        <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                                                        <p className="text-[11px] text-green-700 font-bold mt-0.5">{p.nis_nip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {errorMsg && (
                                        <p className="text-[11px] text-red-600 text-center font-semibold flex items-center justify-center gap-1">
                                            <span>✕</span> {errorMsg}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing || isLocating}
                                        className="w-full rounded-xl bg-green-700 py-3 text-sm font-bold text-white shadow-md shadow-green-500/20 transition-all hover:bg-green-800 disabled:opacity-50"
                                    >
                                        {isLocating ? 'Mencari Lokasi GPS...' : processing ? 'Memproses...' : 'Kirim Kehadiran'}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 text-center text-[10px] text-slate-500 mt-2 flex-none" data-aos="fade-up">
                    <p>&copy; {new Date().getFullYear()} SMAN 1 Babat. Presensi Mandiri.</p>
                </footer>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
