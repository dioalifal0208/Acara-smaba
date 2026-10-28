import PublicShell from '@/Layouts/PublicShell';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { Button, Card, Select, Spinner, cx } from '@/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, CalendarClock, CheckCircle2, Eraser, Info, Search } from 'lucide-react';
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

// ── Layar setelah presensi berhasil: perangkat ini terkunci untuk workcode ini ──
function LockedScreen({ lock, activeWorkcode }) {
    return (
        <div className="space-y-4 text-center" role="status">
            <CheckCircle2 className="mx-auto h-16 w-16 text-status-hadir" strokeWidth={1.75} aria-hidden="true" />
            <div>
                <h1 className="font-display text-2xl font-semibold text-ink">Presensi tercatat</h1>
                <p className="mt-1 text-sm text-ink-2">{activeWorkcode?.nama_workcode || 'Workcode aktif'}</p>
            </div>

            <Card className="p-5 text-left">
                <p className="text-lg font-semibold leading-tight text-ink">{lock.participant?.nama}</p>
                <p className="mt-0.5 text-sm tabular-nums text-ink-2">{participantId(lock.participant)}</p>
                <p className="mt-3 text-sm text-ink-2">
                    Pukul <span className="font-semibold tabular-nums text-ink">{lock.timestamp}</span>
                </p>
            </Card>

            <p className="flex items-start gap-2 text-left text-sm text-ink-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                HP ini sudah dipakai untuk presensi kegiatan ini. Satu HP hanya untuk satu kali presensi, jadi peserta lain memakai HP masing-masing.
            </p>
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

                // Anti-Mock Check: Akurasi 0 = injector
                if (accuracy === 0) {
                    setIsLocating(false);
                    setErrorMsg('Lokasi palsu terdeteksi. Matikan aplikasi Fake GPS di HP Anda, lalu coba lagi.');
                    playAudio('error');
                    return;
                }
                if (accuracy > 100) {
                    setIsLocating(false);
                    setErrorMsg(`Sinyal GPS kurang tepat (±${Math.round(accuracy)} m). Nyalakan GPS mode akurasi tinggi, pindah ke area terbuka, lalu coba lagi.`);
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
                            setDeviceLock({ participant: resData.participant, timestamp: resData.timestamp });
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
                            setDeviceLock({ participant: { nama: lp.nama, nis_nip: lp.nis_nip, status: lp.status }, timestamp: lp.waktu_hadir });
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
                let msg = 'Lokasi HP tidak bisa didapat. Nyalakan GPS lalu coba lagi.';
                if (error.code === 1) msg = 'Izin lokasi ditolak. Izinkan lokasi untuk situs ini di pengaturan browser, lalu coba lagi.';
                else if (error.code === 2) msg = 'Sinyal GPS tidak ditemukan. Pindah ke area terbuka lalu coba lagi.';
                else if (error.code === 3) msg = 'Mencari lokasi terlalu lama. Coba lagi.';
                setErrorMsg(msg);
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
            <Head title="Presensi kegiatan" />

            {!activeWorkcode ? (
                <div className="py-10 text-center">
                    <CalendarClock className="mx-auto h-12 w-12 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Presensi belum dibuka</h1>
                    <p className="mt-2 text-sm text-ink-2">Panitia belum mengaktifkan presensi kegiatan. Biarkan halaman ini terbuka atau hubungi panitia.</p>
                </div>
            ) : result ? (
                <div className="space-y-4 py-6 text-center" role="status">
                    <Info className="mx-auto h-12 w-12 text-status-izin" strokeWidth={1.5} aria-hidden="true" />
                    <div>
                        <h1 className="font-display text-2xl font-semibold text-ink">Sudah presensi</h1>
                        <p className="mt-2 text-sm text-ink-2">
                            <span className="font-medium text-ink">{result.nama}</span> ({result.id}) sudah tercatat hadir di kegiatan ini. Tidak perlu presensi lagi.
                        </p>
                    </div>
                    <Button onClick={() => setResult(null)} className="w-full">Pilih nama lain</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <p className="text-sm text-ink-2">Presensi kegiatan</p>
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
                                <Button size="sm" variant="ghost" onClick={changeParticipant} disabled={busy}>Ganti</Button>
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
                                    className="h-12 w-full rounded-xl border border-line-strong bg-surface pl-12 pr-4 text-base text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                                    disabled={busy}
                                    autoComplete="off"
                                    autoCapitalize="words"
                                    spellCheck={false}
                                    autoFocus
                                    role="combobox"
                                    aria-expanded={showSuggestions}
                                    aria-controls="suggestions-list"
                                    aria-autocomplete="list"
                                    aria-describedby="name-hint"
                                />
                                <p id="name-hint" className="mt-1.5 text-sm text-ink-2">Ketik minimal 2 huruf, lalu pilih dari daftar.</p>

                                {showSuggestions && (
                                    <div id="suggestions-list" role="listbox" aria-label="Hasil pencarian peserta" className="absolute inset-x-0 top-12 z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface shadow-xl">
                                        {isSearchingSuggestions ? (
                                            <p className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-ink-2"><Spinner className="h-4 w-4" />Mencari…</p>
                                        ) : suggestions.length > 0 ? (
                                            <ul className="divide-y divide-line">
                                                {suggestions.map((p) => (
                                                    <li key={p.id}>
                                                        <button
                                                            type="button"
                                                            role="option"
                                                            aria-selected={false}
                                                            onClick={() => handleSelectSuggestion(p)}
                                                            className="flex min-h-14 w-full flex-col justify-center px-4 py-2.5 text-left hover:bg-surface-2 focus-visible:bg-surface-2"
                                                        >
                                                            <span className="text-base font-medium text-ink">{p.nama}</span>
                                                            <span className="text-sm tabular-nums text-ink-2">{participantId(p)}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="px-4 py-5 text-center text-sm text-ink-2">Nama tidak ditemukan. Periksa ejaan atau coba ketik NIP.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {workcodes.length > 1 && (
                            <div className="mt-3">
                                <label htmlFor="workcode-select" className="mb-1.5 block text-sm text-ink-2">Presensi untuk kegiatan</label>
                                <Select id="workcode-select" value={data.workcode_id || ''} onChange={(event) => setData('workcode_id', Number(event.target.value) || null)}>
                                    {workcodes.map((workcode) => <option key={workcode.workcode_id} value={workcode.workcode_id}>{workcode.nama_workcode}</option>)}
                                </Select>
                            </div>
                        )}
                    </section>

                    {/* Langkah 2: tanda tangan (terbuka setelah nama dipilih) */}
                    <section aria-labelledby="step-sign">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <h2 id="step-sign" className={cx('text-sm font-medium', selectedParticipant ? 'text-ink' : 'text-ink-2')}>2. Tanda tangan</h2>
                            {selectedParticipant && signatureData && (
                                <Button size="sm" variant="ghost" icon={Eraser} onClick={clearSignature} disabled={busy} className="-mr-3">Ulangi</Button>
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
                        <p className="mt-2 text-center text-xs text-ink-2">Lokasi HP diperiksa saat mengirim. Izinkan akses lokasi bila browser bertanya.</p>
                    </div>
                </form>
            )}
        </PublicShell>
    );
}
