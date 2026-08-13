import { Head, useForm } from '@inertiajs/react';
import { useState, useCallback, useEffect, useRef } from 'react';

export default function SelfCheckInForm({ token, activeEvent }) {
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // States untuk Autocomplete Rekomendasi
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const suggestionsRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        nis_nip: '',
    });

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

    // Handler ketika input ketikan berubah (memicu autocomplete)
    const handleInputChange = (val) => {
        setData('nis_nip', val);
        setErrorMsg(null);

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

    // Handler ketika rekomendasi dipilih dari list
    const handleSelectSuggestion = (participant) => {
        setData('nis_nip', participant.nis_nip);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Klik di luar rekomendasi untuk menutup dropdown
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

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(route('self-checkin.submit', token), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ nis_nip: data.nis_nip }),
            });

            const resData = await response.json();

            if (response.status === 200) {
                if (resData.status === 'success') {
                    setResult({
                        type: 'success',
                        title: 'Presensi Sukses!',
                        message: `Selamat datang, ${resData.participant.nama}. Kehadiran Anda berhasil dicatat pukul ${resData.timestamp}.`,
                        nama: resData.participant.nama,
                        nis_nip: resData.participant.nis_nip,
                    });
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
                    playAudio('already');
                    reset();
                }
            } else {
                setErrorMsg(resData.message || 'Terjadi kesalahan sistem.');
                playAudio('error');
            }

        } catch (err) {
            setErrorMsg('Gagal terhubung ke server. Periksa koneksi internet Anda.');
            playAudio('error');
        }
    };

    return (
        <>
            <Head title="Self Check-In - SMAN 1 Babat" />
            
            <div className="relative h-screen overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between p-6">
                {/* Glow Spots (subtle) */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl pointer-events-none"></div>

                {/* Header Logo (flex-none) */}
                <header className="relative z-10 mx-auto text-center mt-3 flex-none" data-aos="fade-down">
                    <div className="flex justify-center mb-1">
                        <img
                            src="/images/logo.png"
                            alt="Logo SMAN 1 Babat"
                            className="h-10 w-10 object-contain"
                        />
                    </div>
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 block">SMABA EVENT</span>
                    <span className="text-[9px] text-indigo-600 block -mt-0.5 font-semibold">SMA Negeri 1 Babat</span>
                </header>

                {/* Main Form Card (flex-1) */}
                <main className="relative z-10 flex-1 flex items-center justify-center my-4 overflow-hidden">
                    <div className="w-full max-w-sm">
                        
                        {/* Event Inactive Warning Screen */}
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

                        {/* Status Result Card */}
                        {activeEvent && result && (
                            <div className={`rounded-3xl border p-6 text-center shadow-xl animate-[slideUp_0.3s_ease-out] ${
                                result.type === 'success' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`} data-aos="zoom-in">
                                <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                                    result.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {result.type === 'success' ? '✓' : '⚠'}
                                </div>
                                <h3 className="text-md font-extrabold mb-1">{result.title}</h3>
                                <p className="text-xs text-slate-700 leading-relaxed mb-4 font-bold">{result.message}</p>
                                <button
                                    onClick={() => setResult(null)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Absen Kembali
                                </button>
                            </div>
                        )}

                        {/* General Form */}
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
                                    {/* Input & Autocomplete Suggestions */}
                                    <div className="relative" ref={suggestionsRef}>
                                        <input
                                            type="text"
                                            placeholder="Ketik Nama / NIP Anda..."
                                            value={data.nis_nip}
                                            onChange={(e) => handleInputChange(e.target.value)}
                                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-center text-sm font-semibold tracking-wide text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                                            required
                                            disabled={processing}
                                            autoComplete="off"
                                            autoFocus
                                        />

                                        {/* Suggestions Dropdown */}
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

                                    {errorMsg && (
                                        <p className="text-[11px] text-red-600 text-center font-semibold flex items-center justify-center gap-1">
                                            <span>✕</span> {errorMsg}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/10 transition-all hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : 'Kirim Kehadiran'}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </main>

                {/* Footer Info (flex-none) */}
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
