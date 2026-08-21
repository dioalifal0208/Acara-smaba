import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

    // Selected Participant & Search
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [searchParticipant, setSearchParticipant] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Current Month & Year in View
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11

    // Attendance Data
    const [attendances, setAttendances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Day Action Modal
    const [selectedDateModal, setSelectedDateModal] = useState(null); // { dateStr, dateFormatted, existingAttendance }
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

    // Set initial participant when modal opens
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

    // Fetch attendances whenever participant or workcode changes
    const fetchAttendances = async (participantId) => {
        if (!workcode || !participantId) return;
        setIsLoading(true);
        try {
            const res = await axios.get(`/report/individual/${workcode.id}/${participantId}`);
            setAttendances(res.data.attendances || []);
        } catch (err) {
            console.error('Gagal mengambil data presensi:', err);
            toast.error('Gagal memuat data presensi kalender.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (show && selectedParticipant && workcode) {
            fetchAttendances(selectedParticipant.id);
        }
    }, [show, selectedParticipant?.id, workcode?.id]);

    // Filter participants for search
    const filteredParticipants = useMemo(() => {
        if (!searchParticipant.trim()) return participants;
        const q = searchParticipant.toLowerCase();
        return participants.filter(
            (p) => (p.nama || '').toLowerCase().includes(q) || (p.nis_nip && p.nis_nip.toLowerCase().includes(q))
        );
    }, [participants, searchParticipant]);

    // Map attendances by Date 'YYYY-MM-DD'
    const attendancesByDate = useMemo(() => {
        const map = {};
        attendances.forEach((att) => {
            if (att.tanggal) {
                map[att.tanggal] = att;
            }
        });
        return map;
    }, [attendances]);

    // Month Navigation
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    const handleGoToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    // Calendar Calculations
    const calendarDays = useMemo(() => {
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        const days = [];

        // Previous month padding days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            days.push({
                dayNumber: dayNum,
                dateStr,
                isCurrentMonth: false,
                isWeekend: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(currentYear, currentMonth, i);
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayOfWeek = dateObj.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday =
                today.getFullYear() === currentYear &&
                today.getMonth() === currentMonth &&
                today.getDate() === i;

            days.push({
                dayNumber: i,
                dateStr,
                isCurrentMonth: true,
                isWeekend,
                isToday,
                dayOfWeek,
                attendance: attendancesByDate[dateStr] || null,
            });
        }

        // Next month padding days to complete 35 or 42 grid boxes
        const totalSoFar = days.length;
        const totalGridBoxes = totalSoFar <= 35 ? 35 : 42;
        const nextDaysCount = totalGridBoxes - totalSoFar;
        for (let i = 1; i <= nextDaysCount; i++) {
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                dayNumber: i,
                dateStr,
                isCurrentMonth: false,
                isWeekend: false,
            });
        }

        return days;
    }, [currentYear, currentMonth, attendancesByDate]);

    // Monthly stats for current visible month
    const monthlyStats = useMemo(() => {
        let hadir = 0, izin = 0, sakit = 0, alpha = 0, lupaAbsen = 0;
        const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        attendances.forEach((att) => {
            if (att.tanggal && att.tanggal.startsWith(prefix)) {
                if (att.status === 'hadir') hadir++;
                else if (att.status === 'izin') izin++;
                else if (att.status === 'sakit') sakit++;
                else if (att.status === 'alpha') alpha++;
                else if (att.status === 'lupa_absen') lupaAbsen++;
            }
        });

        return { hadir, izin, sakit, alpha, lupaAbsen };
    }, [attendances, currentYear, currentMonth]);

    // Click on a Day Box
    const handleDayClick = (day) => {
        if (!day.isCurrentMonth) return;

        const dateObj = new Date(day.dateStr);
        const formattedDate = dateObj.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        const existing = day.attendance;

        if (existing) {
            setDayFormData({
                id: existing.id,
                workcode_id: workcode.id,
                participant_id: selectedParticipant.id,
                tanggal: day.dateStr,
                jam_masuk: existing.jam_masuk || '',
                jam_pulang: existing.jam_pulang || '',
                status: existing.status || 'hadir',
            });
        } else {
            setDayFormData({
                id: null,
                workcode_id: workcode.id,
                participant_id: selectedParticipant.id,
                tanggal: day.dateStr,
                jam_masuk: '07:00',
                jam_pulang: '15:30',
                status: 'hadir',
            });
        }

        setDayErrors({});
        setSelectedDateModal({
            dateStr: day.dateStr,
            dateFormatted: formattedDate,
            existingAttendance: existing,
        });
    };

    // Submit Day Form (Add or Update via Axios)
    const handleDaySubmit = async (e) => {
        e.preventDefault();
        setIsDaySubmitting(true);
        setDayErrors({});

        try {
            if (!dayFormData.id) {
                // Create
                const res = await axios.post(route('admin.attendances.store'), dayFormData);
                toast.success(res.data?.message || 'Presensi berhasil disimpan.');
            } else {
                // Update
                const res = await axios.put(route('admin.attendances.update', dayFormData.id), dayFormData);
                toast.success(res.data?.message || 'Presensi berhasil diperbarui.');
            }
            setSelectedDateModal(null);
            await fetchAttendances(selectedParticipant.id);
            onAttendanceChanged();
        } catch (err) {
            console.error('Gagal menyimpan presensi:', err);
            if (err.response?.data?.errors) {
                setDayErrors(err.response.data.errors);
            }
            toast.error(err.response?.data?.message || 'Gagal menyimpan data presensi.');
        } finally {
            setIsDaySubmitting(false);
        }
    };

    // Delete Attendance from Day Modal via Axios
    const handleDeleteFromDayModal = async () => {
        if (!selectedDateModal?.existingAttendance) return;

        const confirmed = await confirm({
            title: 'Hapus Log Presensi',
            message: `Apakah Anda yakin ingin menghapus catatan presensi untuk ${selectedParticipant?.nama} pada tanggal ${selectedDateModal.dateFormatted}? Status hari tersebut akan direset.`,
            type: 'danger',
            confirmText: 'Ya, Hapus Data',
            cancelText: 'Batal',
        });

        if (confirmed) {
            try {
                const res = await axios.delete(route('admin.attendances.destroy', selectedDateModal.existingAttendance.id));
                toast.success(res.data?.message || 'Presensi berhasil dihapus.');
                setSelectedDateModal(null);
                await fetchAttendances(selectedParticipant.id);
                onAttendanceChanged();
            } catch (err) {
                console.error('Gagal menghapus presensi:', err);
                toast.error(err.response?.data?.message || 'Gagal menghapus data presensi.');
            }
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="5xl">
            <div className="p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto">
                {/* Header: Title & Close */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                Kalender Presensi Peserta
                                {workcode && (
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {workcode.nama_workcode}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Klik kotak tanggal pada kalender untuk menambah, mengedit, atau menghapus presensi.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Top Control Bar: Search Participant (Left) & Month Navigator (Right) */}
                <div className="mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                    {/* Participant Search & Active Badge */}
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1">
                        <div className="relative flex-1 sm:max-w-xs">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cari nama peserta / NIP..."
                                    value={searchParticipant}
                                    onChange={(e) => {
                                        setSearchParticipant(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-xs"
                                />
                                {searchParticipant && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchParticipant('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Dropdown list */}
                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1">
                                        {filteredParticipants.length === 0 ? (
                                            <div className="px-4 py-3 text-xs text-slate-500 text-center font-medium">
                                                Tidak ada peserta ditemukan.
                                            </div>
                                        ) : (
                                            filteredParticipants.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedParticipant(p);
                                                        setSearchParticipant('');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${
                                                        selectedParticipant?.id === p.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                                            {(p.nama || '').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 leading-tight">{p.nama}</p>
                                                            <p className="text-[9px] text-slate-500 font-mono">NIP: {p.nis_nip || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                                        {p.status || '-'}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Selected Participant Badge Card */}
                        {selectedParticipant && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white">
                                    {(selectedParticipant.nama || '').charAt(0).toUpperCase()}
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs font-extrabold text-slate-800">{selectedParticipant.nama}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        NIP: <span className="font-mono">{selectedParticipant.nis_nip || '-'}</span> • {selectedParticipant.status || '-'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Month Navigation Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
                            title="Bulan Sebelumnya"
                        >
                            ❮
                        </button>
                        <h4 className="text-xs font-extrabold text-slate-800 px-2 min-w-[130px] text-center">
                            {MONTH_NAMES[currentMonth]} {currentYear}
                        </h4>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
                            title="Bulan Berikutnya"
                        >
                            ❯
                        </button>
                        <button
                            type="button"
                            onClick={handleGoToday}
                            className="ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            Bulan Ini
                        </button>
                    </div>
                </div>

                {/* Calendar Grid (Wider horizontally) */}
                <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs">
                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
                        {DAY_NAMES.map((name, i) => (
                            <div
                                key={i}
                                className={`py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg ${
                                    i === 0 || i === 6 ? 'text-red-500 bg-red-50/60' : 'text-slate-500 bg-slate-50'
                                }`}
                            >
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Day Cells Grid */}
                    {isLoading ? (
                        <div className="py-16 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                            Memuat data kalender presensi...
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1.5">
                            {calendarDays.map((day, idx) => {
                                const att = day.attendance;
                                const isCurrent = day.isCurrentMonth;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => isCurrent && handleDayClick(day)}
                                        className={`group min-h-[58px] sm:min-h-[64px] rounded-xl p-1.5 flex flex-col justify-between transition-all select-none ${
                                            !isCurrent
                                                ? 'bg-slate-50/40 text-slate-300 border border-transparent cursor-not-allowed opacity-30'
                                                : 'border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer ' +
                                                  (day.isToday ? 'bg-indigo-50/20 ring-2 ring-indigo-500/30' : 'bg-white hover:bg-slate-50/50')
                                        }`}
                                    >
                                        {/* Day Number Header */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-xs font-bold leading-none ${
                                                    !isCurrent
                                                        ? 'text-slate-300'
                                                        : day.isToday
                                                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-black text-[10px]'
                                                        : day.isWeekend
                                                        ? 'text-red-500'
                                                        : 'text-slate-700'
                                                }`}
                                            >
                                                {day.dayNumber}
                                            </span>

                                            {isCurrent && !att && (
                                                <span className="text-[10px] text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                                    +
                                                </span>
                                            )}
                                        </div>

                                        {/* Attendance Badge on this Date */}
                                        {isCurrent && att && (
                                            <div className="mt-1 flex flex-col gap-0.5">
                                                {att.status === 'hadir' && (
                                                    <div className="rounded-md bg-emerald-50 border border-emerald-200 px-1 py-0.5 text-center">
                                                        <span className="text-[9px] font-black text-emerald-700 block leading-tight">
                                                            ✓ HADIR
                                                        </span>
                                                        {(att.jam_masuk || att.jam_pulang) && (
                                                            <span className="text-[8px] font-medium text-emerald-600 block leading-tight font-mono">
                                                                {att.jam_masuk || '–'} - {att.jam_pulang || '–'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {att.status === 'alpha' && (
                                                    <div className="rounded-md bg-red-50 border border-red-200 px-1 py-0.5 text-center">
                                                        <span className="text-[9px] font-black text-red-700 block leading-tight">
                                                            ✗ ALPHA
                                                        </span>
                                                    </div>
                                                )}
                                                {att.status === 'izin' && (
                                                    <div className="rounded-md bg-amber-50 border border-amber-200 px-1 py-0.5 text-center">
                                                        <span className="text-[9px] font-black text-amber-700 block leading-tight">
                                                            ! IZIN
                                                        </span>
                                                    </div>
                                                )}
                                                {att.status === 'sakit' && (
                                                    <div className="rounded-md bg-blue-50 border border-blue-200 px-1 py-0.5 text-center">
                                                        <span className="text-[9px] font-black text-blue-700 block leading-tight">
                                                            + SAKIT
                                                        </span>
                                                    </div>
                                                )}
                                                {att.status === 'lupa_absen' && (
                                                    <div className="rounded-md bg-slate-100 border border-slate-300 px-1 py-0.5 text-center">
                                                        <span className="text-[9px] font-black text-slate-700 block leading-tight">
                                                            ? LUPA ABSEN
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {isCurrent && !att && (
                                            <div className="h-3 flex items-center justify-center">
                                                <span className="text-[9px] text-slate-300 font-medium group-hover:hidden">
                                                    -
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Monthly Legend & Summary Footer */}
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rekap {MONTH_NAMES[currentMonth]}:</span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Hadir: {monthlyStats.hadir}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-amber-700">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span> Izin: {monthlyStats.izin}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-blue-700">
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span> Sakit: {monthlyStats.sakit}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-red-700">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span> Alpha: {monthlyStats.alpha}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                            <span className="h-2 w-2 rounded-full bg-slate-400"></span> Lupa Absen: {monthlyStats.lupaAbsen}
                        </span>
                    </div>

                    <SecondaryButton onClick={onClose} className="text-xs">
                        Tutup
                    </SecondaryButton>
                </div>
            </div>

            {/* Sub-Modal: Quick Action for Clicked Date (Add / Edit / Delete) */}
            {selectedDateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
                    <div
                        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800">
                                        {selectedDateModal.existingAttendance ? 'Edit Data Presensi' : 'Input Presensi Manual'}
                                    </h3>
                                    <p className="text-xs font-bold text-indigo-600">
                                        {selectedDateModal.dateFormatted}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedDateModal(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleDaySubmit} className="p-6 space-y-4">
                            {/* Participant Chip */}
                            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                                    {(selectedParticipant?.nama || 'P').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-extrabold text-slate-800 truncate leading-tight">
                                        {selectedParticipant?.nama}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono leading-tight">
                                        NIP: {selectedParticipant?.nis_nip || '-'} • {selectedParticipant?.status || '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Status Selector Chips */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-2">
                                    Pilih Status Kehadiran:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'hadir', label: 'Hadir', icon: '✓', activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md' },
                                        { key: 'izin', label: 'Izin', icon: '!', activeBg: 'bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md' },
                                        { key: 'sakit', label: 'Sakit', icon: '+', activeBg: 'bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-md' },
                                        { key: 'lupa_absen', label: 'Lupa Absen', icon: '?', activeBg: 'bg-slate-700 text-white border-slate-700 shadow-slate-200 shadow-md' },
                                        { key: 'alpha', label: 'Alpha', icon: '✗', activeBg: 'bg-red-600 text-white border-red-600 shadow-red-200 shadow-md' },
                                    ].map((s) => {
                                        const isSelected = dayFormData.status === s.key;
                                        return (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => setDayFormData({ ...dayFormData, status: s.key })}
                                                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 select-none ${
                                                    isSelected
                                                        ? s.activeBg
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="font-mono text-xs">{s.icon}</span>
                                                <span>{s.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={dayErrors.status?.[0] || dayErrors.status} className="mt-1 text-xs" />
                            </div>

                            {/* Time Fields (When Hadir or Lupa Absen) */}
                            {dayFormData.status !== 'alpha' && (
                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                                            Jam Kehadiran
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDayFormData({
                                                        ...dayFormData,
                                                        jam_masuk: '07:00',
                                                        jam_pulang: '15:30',
                                                    });
                                                }}
                                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-semibold transition-colors"
                                            >
                                                Preset Normal (07:00 - 15:30)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="modal_jam_masuk" className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Jam Datang
                                            </label>
                                            <input
                                                id="modal_jam_masuk"
                                                type="time"
                                                value={dayFormData.jam_masuk}
                                                onChange={(e) => setDayFormData({ ...dayFormData, jam_masuk: e.target.value })}
                                                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                            />
                                            <InputError message={dayErrors.jam_masuk?.[0] || dayErrors.jam_masuk} className="mt-0.5 text-[10px]" />
                                        </div>

                                        <div>
                                            <label htmlFor="modal_jam_pulang" className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Jam Pulang
                                            </label>
                                            <input
                                                id="modal_jam_pulang"
                                                type="time"
                                                value={dayFormData.jam_pulang}
                                                onChange={(e) => setDayFormData({ ...dayFormData, jam_pulang: e.target.value })}
                                                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                            />
                                            <InputError message={dayErrors.jam_pulang?.[0] || dayErrors.jam_pulang} className="mt-0.5 text-[10px]" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Actions (Properly Aligned) */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <div>
                                    {selectedDateModal.existingAttendance && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteFromDayModal}
                                            disabled={isDaySubmitting}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/80 rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50"
                                            title="Hapus presensi dan reset status pada tanggal ini"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Hapus Presensi
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDateModal(null)}
                                        className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDaySubmitting}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                                            selectedDateModal.existingAttendance
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200'
                                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {isDaySubmitting
                                            ? 'Menyimpan...'
                                            : selectedDateModal.existingAttendance
                                            ? 'Perbarui Presensi'
                                            : 'Simpan Presensi'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Modal>
    );
}
