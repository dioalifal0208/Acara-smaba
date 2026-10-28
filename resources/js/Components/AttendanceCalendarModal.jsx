import { Button, Dialog, IconButton, STATUS, Spinner, cx, useConfirm, useToast } from '@/ui';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
// Minggu dimulai Senin (kalender kerja Indonesia).
const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/** Warna sel per status (latar lembut + teks), selalu berpasangan dengan ikon & label. */
const CELL_TONE = {
    hadir: 'bg-status-hadir-soft text-status-hadir',
    izin: 'bg-status-izin-soft text-status-izin',
    sakit: 'bg-status-izin-soft text-status-izin',
    alpha: 'bg-status-alpha-soft text-status-alpha',
    lupa_absen: 'bg-status-telat-soft text-status-telat',
    libur: 'bg-surface-2 text-ink-2',
};

const STATUS_CHOICES = ['hadir', 'izin', 'sakit', 'lupa_absen', 'alpha', 'libur'];

const pad = (n) => String(n).padStart(2, '0');

/**
 * Kalender presensi sebulan untuk satu peserta di satu workcode. Klik tanggal untuk menambah,
 * mengubah, atau menghapus presensi hari itu.
 */
export default function AttendanceCalendarModal({
    show = false,
    onClose = () => {},
    workcode = null,
    participants = [],
    initialParticipant = null,
    onAttendanceChanged = () => {},
}) {
    const { toast } = useToast();
    const confirm = useConfirm();

    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [searchParticipant, setSearchParticipant] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11

    const [attendances, setAttendances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [holidays, setHolidays] = useState({});

    // Hari libur nasional dimuat sekali.
    useEffect(() => {
        axios.get('/api/holidays').then((res) => setHolidays(res.data || {})).catch(() => {});
    }, []);

    // Dialog per tanggal (tambah/ubah/hapus)
    const [selectedDate, setSelectedDate] = useState(null); // { dateStr, dateFormatted, existingAttendance }
    const [dayFormData, setDayFormData] = useState({
        id: null,
        workcode_id: workcode?.id || '',
        participant_id: '',
        tanggal: '',
        jam_masuk: '07:00',
        jam_pulang: '15:30',
        status: 'hadir',
    });
    const [isDaySubmitting, setIsDaySubmitting] = useState(false);
    const [dayErrors, setDayErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (initialParticipant) {
                setSelectedParticipant(initialParticipant);
                setSearchParticipant('');
            } else if (participants.length > 0 && !selectedParticipant) {
                setSelectedParticipant(participants[0]);
            }
        }
    }, [show, initialParticipant]);

    const fetchAttendances = async (participantId) => {
        if (!workcode || !participantId) return;
        setIsLoading(true);
        try {
            const res = await axios.get(`/report/individual/${workcode.id}/${participantId}`);
            setAttendances(res.data.attendances || []);
        } catch {
            toast.error('Data presensi gagal dimuat. Periksa koneksi lalu coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (show && selectedParticipant && workcode) {
            fetchAttendances(selectedParticipant.id);
        }
    }, [show, selectedParticipant?.id, workcode?.id]);

    const filteredParticipants = useMemo(() => {
        const q = searchParticipant.trim().toLowerCase();
        if (!q) return participants;
        return participants.filter((p) => (p.nama || '').toLowerCase().includes(q) || (p.nis_nip || '').toLowerCase().includes(q));
    }, [participants, searchParticipant]);

    const attendancesByDate = useMemo(() => Object.fromEntries(attendances.filter((a) => a.tanggal).map((a) => [a.tanggal, a])), [attendances]);

    const shiftMonth = (delta) => {
        const d = new Date(currentYear, currentMonth + delta, 1);
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
    };
    const goToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    // Sel kalender: hari-hari bulan ini didahului kotak kosong agar tanggal 1 jatuh di hari yang benar.
    const calendarDays = useMemo(() => {
        const leading = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Senin = 0
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = Array.from({ length: leading }, (_, i) => ({ key: `pad-${i}`, empty: true }));

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(i)}`;
            const dayOfWeek = new Date(currentYear, currentMonth, i).getDay();
            days.push({
                key: dateStr,
                dayNumber: i,
                dateStr,
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
                holidayName: holidays[dateStr] || null,
                isToday: today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === i,
                attendance: attendancesByDate[dateStr] || null,
            });
        }
        return days;
    }, [currentYear, currentMonth, attendancesByDate, holidays]);

    const monthlyStats = useMemo(() => {
        const prefix = `${currentYear}-${pad(currentMonth + 1)}`;
        const counts = Object.fromEntries(STATUS_CHOICES.map((s) => [s, 0]));
        attendances.forEach((a) => {
            if (a.tanggal?.startsWith(prefix) && counts[a.status] !== undefined) counts[a.status]++;
        });
        return counts;
    }, [attendances, currentYear, currentMonth]);

    const formatLong = (dateStr) => new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const handleDayClick = (day) => {
        const existing = day.attendance;
        setDayFormData({
            id: existing?.id ?? null,
            workcode_id: workcode.id,
            participant_id: selectedParticipant.id,
            tanggal: day.dateStr,
            jam_masuk: existing ? existing.jam_masuk || '' : '07:00',
            jam_pulang: existing ? existing.jam_pulang || '' : '15:30',
            status: existing?.status || 'hadir',
        });
        setDayErrors({});
        setSelectedDate({ dateStr: day.dateStr, dateFormatted: formatLong(day.dateStr), existingAttendance: existing });
    };

    const handleDaySubmit = async (e) => {
        e.preventDefault();
        setIsDaySubmitting(true);
        setDayErrors({});
        try {
            const res = dayFormData.id
                ? await axios.put(route('admin.attendances.update', dayFormData.id), dayFormData)
                : await axios.post(route('admin.attendances.store'), dayFormData);
            toast.success(res.data?.message || (dayFormData.id ? 'Presensi diperbarui.' : 'Presensi disimpan.'));
            setSelectedDate(null);
            await fetchAttendances(selectedParticipant.id);
            onAttendanceChanged();
        } catch (err) {
            if (err.response?.data?.errors) setDayErrors(err.response.data.errors);
            toast.error(err.response?.data?.message || 'Presensi gagal disimpan. Periksa isian lalu coba lagi.');
        } finally {
            setIsDaySubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDate?.existingAttendance) return;
        const confirmed = await confirm({
            title: 'Hapus catatan presensi?',
            message: `Catatan presensi ${selectedParticipant?.nama} pada ${selectedDate.dateFormatted} dihapus, dan status hari itu kembali kosong.`,
            confirmText: 'Hapus catatan',
        });
        if (!confirmed) return;

        try {
            const res = await axios.delete(route('admin.attendances.destroy', selectedDate.existingAttendance.id));
            toast.success(res.data?.message || 'Presensi dihapus.');
            setSelectedDate(null);
            await fetchAttendances(selectedParticipant.id);
            onAttendanceChanged();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Presensi gagal dihapus. Coba lagi.');
        }
    };

    const error = (key) => {
        const value = dayErrors[key];
        return Array.isArray(value) ? value[0] : value;
    };

    const cellLabel = (day) => {
        const parts = [formatLong(day.dateStr)];
        if (day.holidayName) parts.push(`libur ${day.holidayName}`);
        const att = day.attendance;
        if (att) {
            parts.push(STATUS[att.status]?.label ?? att.status);
            if (att.jam_masuk || att.jam_pulang) parts.push(`${att.jam_masuk || '–'} sampai ${att.jam_pulang || '–'}`);
        } else {
            parts.push('belum ada catatan, tekan untuk menambah');
        }
        return parts.join(', ');
    };

    return (
        <Dialog
            open={show}
            onClose={onClose}
            title="Kalender presensi"
            description={workcode ? `${workcode.nama_workcode} · tekan tanggal untuk menambah, mengubah, atau menghapus presensi` : undefined}
            size="4xl"
        >
            <div className="space-y-4">
                {/* Peserta & bulan */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative lg:w-96">
                        {selectedParticipant && !isDropdownOpen ? (
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(true)}
                                className="flex h-12 w-full items-center gap-3 rounded-lg border border-line-strong bg-surface px-3 text-left hover:bg-surface-2/60"
                                aria-label={`Peserta: ${selectedParticipant.nama}. Ganti peserta`}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-ink">{selectedParticipant.nama}</span>
                                    <span className="block truncate text-xs tabular-nums text-ink-2">{selectedParticipant.nis_nip || 'Tanpa NIP'} · {selectedParticipant.status || '–'}</span>
                                </span>
                                <span className="text-sm font-medium text-accent">Ganti</span>
                            </button>
                        ) : (
                            <>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                                <input
                                    type="text"
                                    value={searchParticipant}
                                    onChange={(e) => setSearchParticipant(e.target.value)}
                                    placeholder="Cari nama atau NIP peserta…"
                                    aria-label="Cari peserta"
                                    autoFocus
                                    className="h-12 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                                />
                                {selectedParticipant && (
                                    <IconButton icon={X} size="sm" label="Batal ganti peserta" onClick={() => { setIsDropdownOpen(false); setSearchParticipant(''); }} className="absolute right-2 top-1/2 -translate-y-1/2" />
                                )}
                                <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-xl" role="listbox" aria-label="Peserta">
                                    {filteredParticipants.length === 0 ? (
                                        <li className="px-4 py-3 text-center text-sm text-ink-2">Peserta tidak ditemukan.</li>
                                    ) : filteredParticipants.map((p) => (
                                        <li key={p.id}>
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={selectedParticipant?.id === p.id}
                                                onClick={() => { setSelectedParticipant(p); setSearchParticipant(''); setIsDropdownOpen(false); }}
                                                className={cx('flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left hover:bg-surface-2', selectedParticipant?.id === p.id && 'bg-accent-soft')}
                                            >
                                                <span className="text-sm font-medium text-ink">{p.nama}</span>
                                                <span className="text-xs tabular-nums text-ink-2">{p.nis_nip || 'Tanpa NIP'} · {p.status || '–'}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <IconButton icon={ChevronLeft} label="Bulan sebelumnya" onClick={() => shiftMonth(-1)} />
                        <h3 className="min-w-36 text-center text-base font-semibold tabular-nums text-ink" aria-live="polite">{MONTH_NAMES[currentMonth]} {currentYear}</h3>
                        <IconButton icon={ChevronRight} label="Bulan berikutnya" onClick={() => shiftMonth(1)} />
                        <Button size="sm" variant="ghost" onClick={goToday} className="ml-1">Bulan ini</Button>
                    </div>
                </div>

                {/* Kalender */}
                <div className="rounded-xl border border-line p-2">
                    <div className="mb-1 grid grid-cols-7 gap-1 text-center" aria-hidden="true">
                        {DAY_NAMES.map((name, i) => (
                            <div key={name} className={cx('py-1 text-xs font-medium', i >= 5 ? 'text-status-alpha' : 'text-ink-2')}>{name}</div>
                        ))}
                    </div>

                    {isLoading ? (
                        <p className="flex items-center justify-center gap-2 py-20 text-sm text-ink-2"><Spinner className="h-4 w-4" />Memuat presensi…</p>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day) => {
                                if (day.empty) return <div key={day.key} aria-hidden="true" />;
                                const att = day.attendance;
                                const meta = att ? STATUS[att.status] : null;
                                const Icon = meta?.icon;

                                return (
                                    <button
                                        key={day.key}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        disabled={!selectedParticipant}
                                        aria-label={cellLabel(day)}
                                        title={day.holidayName || undefined}
                                        className={cx(
                                            'flex min-h-14 flex-col rounded-lg border p-1 text-left transition-colors sm:min-h-20 sm:p-1.5',
                                            day.isToday ? 'border-accent' : 'border-line hover:border-line-strong',
                                            att ? CELL_TONE[att.status] ?? 'bg-surface' : 'bg-surface hover:bg-surface-2/60',
                                        )}
                                    >
                                        <span className={cx(
                                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                                            day.isToday ? 'bg-accent text-accent-ink' : (day.isWeekend || day.holidayName) ? 'text-status-alpha' : 'text-ink',
                                        )}>
                                            {day.dayNumber}
                                        </span>
                                        {day.holidayName && <span className="hidden truncate text-xs text-status-alpha sm:block">{day.holidayName}</span>}
                                        {att && (
                                            <span className="mt-auto flex items-center gap-1">
                                                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                                                <span className="hidden truncate text-xs font-medium sm:inline">{meta?.label ?? att.status}</span>
                                            </span>
                                        )}
                                        {att?.status === 'hadir' && (att.jam_masuk || att.jam_pulang) && (
                                            <span className="hidden text-xs tabular-nums opacity-90 md:block">{att.jam_masuk || '–'}–{att.jam_pulang || '–'}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Rekap bulan */}
                <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <dt className="sr-only">Rekap {MONTH_NAMES[currentMonth]}</dt>
                    {STATUS_CHOICES.map((s) => {
                        const Icon = STATUS[s].icon;
                        return (
                            <div key={s} className="flex items-center gap-1.5">
                                <Icon className={cx('h-4 w-4', CELL_TONE[s].split(' ')[1])} aria-hidden="true" />
                                <dt className="text-ink-2">{STATUS[s].label}</dt>
                                <dd className="font-semibold tabular-nums text-ink">{monthlyStats[s]}</dd>
                            </div>
                        );
                    })}
                </dl>
            </div>

            {/* Tambah / ubah / hapus presensi satu tanggal */}
            <Dialog
                open={Boolean(selectedDate)}
                onClose={() => setSelectedDate(null)}
                title={selectedDate?.existingAttendance ? 'Ubah presensi' : 'Tambah presensi'}
                description={selectedDate ? `${selectedParticipant?.nama} · ${selectedDate.dateFormatted}` : undefined}
                size="md"
                footer={
                    <>
                        {selectedDate?.existingAttendance && (
                            <Button variant="ghost" icon={Trash2} onClick={handleDelete} disabled={isDaySubmitting} className="text-danger hover:text-danger sm:mr-auto">Hapus</Button>
                        )}
                        <Button onClick={() => setSelectedDate(null)}>Batal</Button>
                        <Button variant="primary" type="submit" form="calendar-day" loading={isDaySubmitting}>
                            {selectedDate?.existingAttendance ? 'Simpan perubahan' : 'Simpan'}
                        </Button>
                    </>
                }
            >
                <form id="calendar-day" onSubmit={handleDaySubmit} className="space-y-4">
                    <fieldset>
                        <legend className="mb-2 text-sm font-medium text-ink">Status</legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup">
                            {STATUS_CHOICES.map((s) => {
                                const Icon = STATUS[s].icon;
                                const active = dayFormData.status === s;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => setDayFormData({ ...dayFormData, status: s })}
                                        className={cx(
                                            'flex h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors',
                                            active ? cx('border-current font-semibold', CELL_TONE[s]) : 'border-line-strong text-ink hover:bg-surface-2',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {STATUS[s].label}
                                    </button>
                                );
                            })}
                        </div>
                        {error('status') && <p className="mt-1.5 text-xs font-medium text-danger">{error('status')}</p>}
                    </fieldset>

                    {!['alpha', 'libur'].includes(dayFormData.status) && (
                        <fieldset>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <legend className="text-sm font-medium text-ink">Jam</legend>
                                <Button size="sm" variant="ghost" onClick={() => setDayFormData({ ...dayFormData, jam_masuk: '07:00', jam_pulang: '15:30' })} className="-mr-3">
                                    Isi jam normal (07:00–15:30)
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[['jam_masuk', 'Datang'], ['jam_pulang', 'Pulang']].map(([key, label]) => (
                                    <div key={key}>
                                        <label htmlFor={`cal-${key}`} className="mb-1.5 block text-sm text-ink-2">{label}</label>
                                        <input
                                            id={`cal-${key}`}
                                            type="time"
                                            value={dayFormData[key]}
                                            onChange={(e) => setDayFormData({ ...dayFormData, [key]: e.target.value })}
                                            aria-invalid={error(key) ? true : undefined}
                                            className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                                        />
                                        {error(key) && <p className="mt-1 text-xs font-medium text-danger">{error(key)}</p>}
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    )}
                </form>
            </Dialog>
        </Dialog>
    );
}
