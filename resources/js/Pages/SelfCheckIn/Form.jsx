import PublicShell from '@/Layouts/PublicShell';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { Button, Card, Select, Spinner, cx } from '@/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, CalendarClock, CheckCircle2, Eraser, LocateFixed, Search, Smartphone, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
function getLockKey(workcodeId) {
    return `smaba_locked_workcode_${workcodeId}`;
}

function getLocalLock(workcodeId) {
    try {
        const raw = localStorage.getItem(getLockKey(workcodeId));
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
}

function setLocalLock(workcodeId, participant, timestamp) {
    try {
        localStorage.setItem(getLockKey(workcodeId), JSON.stringify({ participant, timestamp, locked_at: new Date().toISOString() }));
    } catch (_) {}
}

const participantId = (p) => p?.nis_nip || `${p?.status || 'GTT/PTT'} · tanpa NIP`;

// Pemeriksaan GPS yang sama untuk cek awal dan saat kirim. Mengembalikan pesan masalah, atau null bila layak.
function locationProblem({ accuracy }) {
    if (accuracy === 0) return 'Lokasi palsu terdeteksi. Matikan aplikasi Fake GPS di HP Anda, lalu coba lagi.';
    if (accuracy > 100) return `Sinyal GPS kurang tepat (±${Math.round(accuracy)} m). Nyalakan GPS mode akurasi tinggi, pindah ke area terbuka, lalu coba lagi.`;
    return null;
}

function geolocationMessage(error) {
    if (error?.code === 1) return 'Izin lokasi ditolak. Izinkan lokasi untuk situs ini di pengaturan browser, lalu coba lagi.';
    if (error?.code === 2) return 'Sinyal GPS tidak ditemukan. Pindah ke area terbuka lalu coba lagi.';
    if (error?.code === 3) return 'Mencari lokasi terlalu lama. Coba lagi.';
    return 'Lokasi HP tidak bisa didapat. Nyalakan GPS lalu coba lagi.';
}

/** Hasil cek lokasi awal di bawah nama terpilih; saat bermasalah ada tombol coba lagi. */
function LocationStatus({ location, onRetry, disabled }) {
    if (location.status === 'idle') return null;

    return (
        <div
            className={cx(
                'mt-3 flex items-start gap-2.5 rounded-xl border p-3 text-sm',
                location.status === 'error' ? 'border-danger/30 bg-danger-soft text-ink' : 'border-line text-ink-2',
            )}
            role="status"
        >
            {location.status === 'checking' && <Spinner className="mt-0.5 h-4 w-4 shrink-0" />}
            {location.status === 'ok' && <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-status-hadir" aria-hidden="true" />}
            {location.status === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />}
            <p className="min-w-0 flex-1">
                {location.status === 'checking' && 'Memeriksa lokasi HP… Izinkan akses lokasi bila browser bertanya.'}
                {location.status === 'ok' && <>Lokasi terdeteksi <span className="tabular-nums">(±{location.accuracy} m)</span>.</>}
                {location.status === 'error' && location.message}
            </p>
            {location.status === 'error' && (
                <Button onClick={onRetry} disabled={disabled} className="-my-1.5 shrink-0">Coba lagi</Button>
            )}
        </div>
    );
}

const SELF_SERVICE_FALLBACK ='minta panitia memindai QR pribadi Anda di meja presensi';

/**
 * Layar saat HP ini terkunci untuk workcode ini.
 * - success: presensi orang ini baru saja berhasil.
 * - stored: halaman dibuka ulang; yang memegang HP belum tentu orang yang tercatat.
 * - blocked: server menolak karena HP ini sudah dipakai orang lain.
 * Hanya `success` yang memakai tanda berhasil, agar orang lain tidak mengira presensinya tercatat.
 */
function LockedScreen({ lock, activeWorkcode }) {
    const kind = lock.kind || 'stored';
    const nama = lock.participant?.nama;
    const title = {
        success: 'Presensi tercatat',
        stored: 'Presensi dari HP ini sudah tercatat',
        blocked: 'HP ini sudah dipakai untuk presensi',
    }[kind];

    return (
        <div className="space-y-4 text-center" role={kind === 'blocked' ? 'alert' : 'status'}>
            {kind === 'success' && <CheckCircle2 className="mx-auto h-16 w-16 text-status-hadir" strokeWidth={1.75} aria-hidden="true" />}
            {kind === 'stored' && <Smartphone className="mx-auto h-14 w-14 text-ink-2" strokeWidth={1.5} aria-hidden="true" />}
            {kind === 'blocked' && <AlertTriangle className="mx-auto h-14 w-14 text-status-telat" strokeWidth={1.75} aria-hidden="true" />}
            <div>
                <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
                <p className="mt-1 text-sm text-ink-2">{activeWorkcode?.nama_workcode || 'Presensi acara'}</p>
            </div>

            <Card className="p-5 text-left">
                {kind !== 'success' && <p className="mb-1 text-sm text-ink-2">Tercatat atas nama</p>}
                <p className="text-lg font-semibold leading-tight text-ink">{nama}</p>
                <p className="mt-0.5 text-sm tabular-nums text-ink-2">{participantId(lock.participant)}</p>
                <p className="mt-3 text-sm text-ink-2">
                    Pukul <span className="font-semibold tabular-nums text-ink">{lock.timestamp}</span>
                </p>
            </Card>

            {kind === 'success' ? (
                <p className="text-sm text-ink-2">Anda bisa menutup halaman ini. Tunjukkan layar ini bila panitia meminta bukti.</p>
            ) : (
                <div className="rounded-xl border border-line bg-surface-2 p-4 text-left text-sm text-ink-2">
                    <p className="font-medium text-ink">Bukan {nama}?</p>
                    <p className="mt-1">
                        Satu HP hanya bisa dipakai satu orang per acara, jadi presensi Anda <span className="font-medium text-ink">belum tercatat</span>.
                        Pindai QR acara dengan HP Anda sendiri, atau {SELF_SERVICE_FALLBACK}.
                    </p>
                </div>
            )}
        </div>
    );
}

// ── Komponen Utama ──
export default function SelfCheckInForm({ token, activeWorkcode }) {
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [deviceLock, setDeviceLock] = useState(null); // null = belum terkunci

    // States untuk Autocomplete Rekomendasi
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef(null);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const signatureCanvasRef = useRef(null);
    const isSigningRef = useRef(false);
    const [signatureData, setSignatureData] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const [location, setLocation] = useState({ status: 'idle' });

    const { data, setData, processing, reset } = useForm({
        nis_nip: '',
        participant_id: null,
        workcode_id: null,
    });

    // Cek LocalStorage lock saat halaman pertama dibuka
    useEffect(() => {
        if (activeWorkcode?.id) {
            const lock = getLocalLock(activeWorkcode.id);
            if (lock) {
                setDeviceLock(lock);
            }
        }
    }, [activeWorkcode?.id]);

    // Halaman dari QR workcode dapat dibiarkan terbuka sebelum kegiatan dimulai.
    // Perbarui data dari server secara ringan agar workcode yang baru dibuat/diubah
    // segera tampil tanpa scheduler server atau refresh manual. Berhenti setelah presensi berhasil,
    // agar layar konfirmasi tidak berganti menjadi halaman "sesi berakhir" saat workcode selesai.
    const isLocked = Boolean(deviceLock);
    useEffect(() => {
        if (isLocked) {
            return;
        }

        const refreshInterval = window.setInterval(() => {
            backgroundReload({
                only: ['activeWorkcode'],
                preserveScroll: true,
                preserveState: true,
            });
        }, jitteredInterval(30000));

        return () => window.clearInterval(refreshInterval);
    }, [isLocked]);

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

    const clearSignature = useCallback(() => {
        const canvas = signatureCanvasRef.current;
        const context = canvas?.getContext('2d');
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        setSignatureData('');
    }, []);

    const getSignaturePoint = (event) => {
        const canvas = signatureCanvasRef.current;
        const rect = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startSignature = (event) => {
        event.preventDefault();
        setErrorMsg(null);
        const canvas = signatureCanvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const point = getSignaturePoint(event);
        isSigningRef.current = true;
        canvas.setPointerCapture?.(event.pointerId);
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 4;
        context.strokeStyle = '#0f172a';
    };

    const drawSignature = (event) => {
        if (!isSigningRef.current) return;
        event.preventDefault();

        const canvas = signatureCanvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const point = getSignaturePoint(event);
        context.lineTo(point.x, point.y);
        context.stroke();
    };

    const finishSignature = (event) => {
        if (!isSigningRef.current) return;
        event.preventDefault();

        const canvas = signatureCanvasRef.current;
        isSigningRef.current = false;
        canvas?.releasePointerCapture?.(event.pointerId);
        setSignatureData(canvas?.toDataURL('image/png') || '');
    };

    const handleInputChange = (val) => {
        setData({
            nis_nip: val,
            participant_id: null,
            workcode_id: null,
        });
        setSelectedParticipant(null);
        clearSignature();
        setErrorMsg(null);
        if (val.trim().length >= 2) {
            setIsSearchingSuggestions(true);
            setShowSuggestions(true);
            fetch(route('self-checkin.participants', token) + `?query=${encodeURIComponent(val)}`, { headers: { Accept: 'application/json' } })
                .then((res) => {
                    // 410 = workcode QR ini sudah berakhir/ditutup: muat ulang agar halaman informasi tampil.
                    if (res.status === 410) {
                        router.reload();
                    }

                    return res.ok ? res.json() : [];
                })
                .then((d) => {
                    setSuggestions(Array.isArray(d) ? d : []);
                    setActiveIndex(-1);
                    setIsSearchingSuggestions(false);
                })
                .catch(() => {
                    setIsSearchingSuggestions(false);
                });
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsSearchingSuggestions(false);
        }
    };

    // Cek izin & akurasi lokasi lebih awal (saat nama dipilih), agar masalah GPS diketahui
    // sebelum tanda tangan, bukan sesudahnya. Saat kirim, lokasi tetap diambil ulang.
    const checkLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocation({ status: 'error', message: 'Browser Anda tidak mendukung deteksi lokasi. Coba buka dengan Chrome.' });
            return;
        }
        setLocation({ status: 'checking' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const problem = locationProblem(position.coords);
                setLocation(problem
                    ? { status: 'error', message: problem }
                    : { status: 'ok', accuracy: Math.round(position.coords.accuracy) });
            },
            (error) => setLocation({ status: 'error', message: geolocationMessage(error) }),
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
        );
    }, []);

    const handleSelectSuggestion = (participant) => {
        setData({
            nis_nip: participant.nis_nip || participant.nama,
            participant_id: participant.id,
            workcode_id: participant.available_workcodes?.[0]?.workcode_id || null,
        });
        setSelectedParticipant(participant);
        clearSignature();
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
        if (location.status !== 'ok') checkLocation();
    };

    // Navigasi daftar nama dengan keyboard (pola combobox + aria-activedescendant).
    const handleSearchKeyDown = (event) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (event.key === 'Escape') setShowSuggestions(false);
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex((index) => (index + step + suggestions.length) % suggestions.length);
        } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            handleSelectSuggestion(suggestions[activeIndex]);
        } else if (event.key === 'Escape') {
            setShowSuggestions(false);
            setActiveIndex(-1);
        }
    };

    // "Ganti": kembali ke pencarian nama.
    const changeParticipant = () => {
        handleInputChange('');
        window.requestAnimationFrame(() => document.getElementById('nis_nip_input')?.focus());
    };

    useEffect(() => {
        const handleClickOutside = (workcode) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(workcode.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.participant_id || !selectedParticipant) {
            setErrorMsg('Pilih nama atau NIP dari daftar terlebih dahulu.');
            return;
        }
        if (!signatureData) {
            setErrorMsg('Tanda tangan wajib diisi sebelum mengirim kehadiran.');
            return;
        }

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

                // Anti-Mock (akurasi 0 = injector) dan akurasi terlalu kasar.
                const problem = locationProblem(position.coords);
                if (problem) {
                    setIsLocating(false);
                    setErrorMsg(problem);
                    setLocation({ status: 'error', message: problem });
                    playAudio('error');
                    return;
                }
                setLocation({ status: 'ok', accuracy: Math.round(accuracy) });

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
                            participant_id: data.participant_id,
                            workcode_id: data.workcode_id,
                            latitude,
                            longitude,
                            accuracy: accuracy ? Math.round(accuracy * 10) / 10 : null,
                            altitude: altitude !== null ? Math.round(altitude * 10) / 10 : null,
                            heading: heading !== null ? heading : null,
                            speed: speed !== null ? speed : null,
                            device_timestamp: deviceTimestamp,
                            device_id: deviceId,
                            signature: signatureData,
                        }),
                    });

                    const resData = await response.json();

                    if (response.status === 410) {
                        // Sesi workcode berakhir/ditutup saat form masih terbuka: tampilkan halaman informasi.
                        router.reload();
                        return;
                    }

                    if (response.ok) {
                        if (resData.status === 'success') {
                            // Kunci browser secara lokal - permanen untuk workcode ini
                            setLocalLock(data.workcode_id, resData.participant, resData.timestamp);
                            // Tampilkan layar terkunci permanen
                            setDeviceLock({ kind: 'success', participant: resData.participant, timestamp: resData.timestamp });
                            playAudio('success');
                            reset();
                            setSelectedParticipant(null);
                            clearSignature();
                        } else if (resData.status === 'already') {
                            setResult({
                                type: 'already',
                                nama: resData.participant.nama,
                                id: participantId(resData.participant),
                            });
                            playAudio('error');
                            reset();
                            setSelectedParticipant(null);
                        }
                    } else {
                        // Cek device_locked dari server
                        if (resData.status === 'device_locked') {
                            // Kunci juga secara lokal menggunakan data dari server
                            const lp = resData.locked_participant;
                            setLocalLock(data.workcode_id, { nama: lp.nama, nis_nip: lp.nis_nip, status: lp.status }, lp.waktu_hadir);
                            setDeviceLock({ kind: 'blocked', participant: { nama: lp.nama, nis_nip: lp.nis_nip, status: lp.status }, timestamp: lp.waktu_hadir });
                            playAudio('error');
                        } else {
                            setErrorMsg(resData.message || 'Terjadi kesalahan sistem.');
                            playAudio('error');
                        }
                    }
                } catch (err) {
                    setErrorMsg('Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi.');
                    playAudio('error');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                const msg = geolocationMessage(error);
                setErrorMsg(msg);
                setLocation({ status: 'error', message: msg });
                playAudio('error');
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    const busy = processing || isLocating;
    const workcodes = selectedParticipant?.available_workcodes || [];
    const closesAt = activeWorkcode?.jam_aktif_selesai?.slice(0, 5);

    // Jika device sudah terkunci → tampilkan layar terkunci saja
    if (deviceLock) {
        return (
            <PublicShell>
                <Head title="Presensi tercatat" />
                <LockedScreen lock={deviceLock} activeWorkcode={activeWorkcode} />
            </PublicShell>
        );
    }

    return (
        <PublicShell>
            <Head title="Presensi acara" />

            {!activeWorkcode ? (
                <div className="py-10 text-center">
                    <CalendarClock className="mx-auto h-12 w-12 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Presensi belum dibuka</h1>
                    <p className="mt-2 text-sm text-ink-2">Panitia belum mengaktifkan presensi acara. Biarkan halaman ini terbuka atau hubungi panitia.</p>
                </div>
            ) : result ? (
                <div className="space-y-4 py-6 text-center" role="status">
                    <UserCheck className="mx-auto h-12 w-12 text-ink-2" strokeWidth={1.5} aria-hidden="true" />
                    <div>
                        <h1 className="font-display text-2xl font-semibold text-ink">Sudah presensi</h1>
                        <p className="mt-2 text-sm text-ink-2">
                            <span className="font-medium text-ink">{result.nama}</span> ({result.id}) sudah tercatat hadir di acara ini. Tidak perlu presensi lagi.
                        </p>
                    </div>
                    <Button onClick={() => setResult(null)} className="w-full">Pilih nama lain</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <p className="text-sm text-ink-2">Presensi acara</p>
                        <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink">{activeWorkcode.nama_workcode}</h1>
                        {closesAt && <p className="mt-1 text-sm text-ink-2">Dibuka sampai pukul <span className="tabular-nums">{closesAt}</span> WIB</p>}
                    </div>

                    {/* Langkah 1: pilih nama */}
                    <section aria-labelledby="step-name">
                        <h2 id="step-name" className="mb-2 text-sm font-medium text-ink">1. Pilih nama Anda</h2>
                        {selectedParticipant ? (
                            <Card className="flex items-center gap-3 p-4">
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-status-hadir" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-base font-semibold text-ink">{selectedParticipant.nama}</p>
                                    <p className="text-sm tabular-nums text-ink-2">{participantId(selectedParticipant)}</p>
                                </div>
                                <Button variant="ghost" onClick={changeParticipant} disabled={busy} className="-mr-2">Ganti</Button>
                            </Card>
                        ) : (
                            <div className="relative" ref={suggestionsRef}>
                                <label htmlFor="nis_nip_input" className="sr-only">Nama atau NIP</label>
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                                {/* Huruf 16px agar iPhone tidak memperbesar halaman saat isian disentuh. */}
                                <input
                                    id="nis_nip_input"
                                    type="text"
                                    placeholder="Ketik nama atau NIP"
                                    value={data.nis_nip}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onFocus={() => { if (data.nis_nip.trim().length >= 2) setShowSuggestions(true); }}
                                    onKeyDown={handleSearchKeyDown}
                                    aria-activedescendant={showSuggestions && activeIndex >= 0 ? `suggestion-${suggestions[activeIndex]?.id}` : undefined}
                                    className="h-12 w-full rounded-xl border border-line-strong bg-surface pl-12 pr-4 text-base text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                                    disabled={busy}
                                    autoComplete="off"
                                    autoCapitalize="words"
                                    spellCheck={false}
                                    role="combobox"
                                    aria-expanded={showSuggestions}
                                    aria-controls="suggestions-list"
                                    aria-autocomplete="list"
                                    aria-describedby="name-hint"
                                />
                                <p id="name-hint" className="mt-1.5 text-sm text-ink-2">Ketik minimal 2 huruf, lalu pilih dari daftar.</p>

                                {showSuggestions && (
                                    <div className="absolute inset-x-0 top-12 z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface shadow-xl">
                                        {isSearchingSuggestions ? (
                                            <p className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-ink-2" role="status"><Spinner className="h-4 w-4" />Mencari…</p>
                                        ) : suggestions.length > 0 ? (
                                            <ul id="suggestions-list" role="listbox" aria-label="Hasil pencarian peserta" className="divide-y divide-line">
                                                {suggestions.map((p, index) => (
                                                    // Fokus tetap di kolom ketik; opsi aktif ditandai lewat aria-activedescendant.
                                                    <li
                                                        key={p.id}
                                                        id={`suggestion-${p.id}`}
                                                        role="option"
                                                        aria-selected={index === activeIndex}
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => handleSelectSuggestion(p)}
                                                        onMouseEnter={() => setActiveIndex(index)}
                                                        className={cx('flex min-h-14 cursor-pointer flex-col justify-center px-4 py-2.5 text-left', index === activeIndex && 'bg-surface-2')}
                                                    >
                                                        <span className="text-base font-medium text-ink">{p.nama}</span>
                                                        <span className="text-sm tabular-nums text-ink-2">{participantId(p)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="px-4 py-5 text-center text-sm text-ink-2" role="status">Nama tidak ditemukan. Periksa ejaan atau coba ketik NIP.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {workcodes.length > 1 && (
                            <div className="mt-3">
                                <label htmlFor="workcode-select" className="mb-1.5 block text-sm text-ink-2">Presensi untuk acara</label>
                                <Select id="workcode-select" value={data.workcode_id || ''} onChange={(event) => setData('workcode_id', Number(event.target.value) || null)}>
                                    {workcodes.map((workcode) => <option key={workcode.workcode_id} value={workcode.workcode_id}>{workcode.nama_workcode}</option>)}
                                </Select>
                            </div>
                        )}

                        {selectedParticipant && <LocationStatus location={location} onRetry={checkLocation} disabled={busy} />}
                    </section>

                    {/* Langkah 2: tanda tangan (terbuka setelah nama dipilih) */}
                    <section aria-labelledby="step-sign">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <h2 id="step-sign" className={cx('text-sm font-medium', selectedParticipant ? 'text-ink' : 'text-ink-2')}>2. Tanda tangan</h2>
                            {selectedParticipant && signatureData && (
                                <Button variant="ghost" icon={Eraser} onClick={clearSignature} disabled={busy} className="-mr-3">Ulangi</Button>
                            )}
                        </div>
                        {selectedParticipant ? (
                            <>
                                {/* Kanvas selalu putih seperti kertas (goresan gelap), juga di mode gelap. */}
                                <canvas
                                    ref={signatureCanvasRef}
                                    width="800"
                                    height="320"
                                    onPointerDown={startSignature}
                                    onPointerMove={drawSignature}
                                    onPointerUp={finishSignature}
                                    onPointerCancel={finishSignature}
                                    onPointerLeave={finishSignature}
                                    className={cx('h-40 w-full cursor-crosshair touch-none rounded-xl border-2 bg-white', signatureData ? 'border-line-strong' : 'border-dashed border-line-strong')}
                                    aria-label="Area tanda tangan. Gambar tanda tangan dengan jari."
                                />
                                <p className="mt-1.5 text-sm text-ink-2" aria-live="polite">
                                    {signatureData ? 'Tanda tangan siap dikirim.' : 'Tanda tangani dengan jari di kotak putih.'}
                                </p>
                                <p className="mt-1 text-sm text-ink-2">Tidak bisa tanda tangan di layar? Lewati halaman ini dan {SELF_SERVICE_FALLBACK}.</p>
                            </>
                        ) : (
                            <p className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-2">Pilih nama dulu, lalu tanda tangan di sini.</p>
                        )}
                    </section>

                    {errorMsg && (
                        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-ink" role="alert">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                            {errorMsg}
                        </p>
                    )}

                    <div>
                        <Button variant="primary" type="submit" size="lg" loading={busy} disabled={!selectedParticipant || !signatureData} className="w-full">
                            {isLocating ? 'Memeriksa lokasi…' : processing ? 'Mengirim…' : 'Kirim kehadiran'}
                        </Button>
                        <p className="mt-2 text-center text-sm text-ink-2">Lokasi HP diperiksa ulang saat mengirim.</p>
                    </div>
                </form>
            )}
        </PublicShell>
    );
}
