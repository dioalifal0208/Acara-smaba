import { Button, cx } from '@/ui';
import { Copy } from 'lucide-react';

export const DAYS = [
    { id: 1, short: 'Sen', name: 'Senin' },
    { id: 2, short: 'Sel', name: 'Selasa' },
    { id: 3, short: 'Rab', name: 'Rabu' },
    { id: 4, short: 'Kam', name: 'Kamis' },
    { id: 5, short: 'Jum', name: 'Jumat' },
    { id: 6, short: 'Sab', name: 'Sabtu' },
    { id: 7, short: 'Min', name: 'Minggu' },
];

export const DEFAULT_DAY = { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' };

// Batas tutup presensi datang ("HH:MM" + toleransi), paling lambat 23:59 — sama dengan Workcode::withLateTolerance.
export const addTolerance = (time, minutes) => {
    const [hours, mins] = (time || '').split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
    const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 59);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const timeInput = 'h-10 w-full rounded-lg border border-line-strong bg-surface px-2.5 text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 sm:w-[7.25rem]';

// Kolom tabel jadwal di layar ≥640px: hari | datang | pulang | batas terlambat.
const grid = 'sm:grid sm:grid-cols-[7.5rem_auto_auto_1fr] sm:items-center sm:gap-x-5';

/**
 * Jadwal mingguan presensi harian dalam bentuk tabel: satu baris per hari dengan sakelar hari
 * kerja, jam datang & pulang, dan batas terlambat yang dihitung otomatis. "Samakan" menyalin jam
 * hari kerja pertama ke hari kerja lainnya.
 */
export default function WeekSchedule({ activeDays, schedule, onToggleDay, onChangeTime, onCopyFirst, toleranceMinutes, errors }) {
    const firstDay = DAYS.find((day) => activeDays.includes(day.id));

    return (
        <fieldset>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-medium text-ink">Jadwal mingguan</legend>
                {firstDay && activeDays.length > 1 && (
                    <Button size="sm" variant="ghost" icon={Copy} onClick={onCopyFirst} className="-mr-2">Samakan dengan {firstDay.name}</Button>
                )}
            </div>
            <p className="mb-3 text-sm text-ink-2">
                Presensi datang masih dibuka {toleranceMinutes} menit setelah jam datang selesai dan dicatat terlambat. Jam pulang harus dimulai setelah batas itu.
            </p>

            <div className="overflow-hidden rounded-xl border border-line">
                <div className={cx('hidden border-b border-line bg-surface-2/60 px-4 py-2 text-xs font-medium text-ink-2', grid)} aria-hidden="true">
                    <span>Hari</span>
                    <span>Datang</span>
                    <span>Pulang</span>
                    <span>Batas terlambat</span>
                </div>

                <ul className="divide-y divide-line">
                    {DAYS.map((day) => {
                        const on = activeDays.includes(day.id);
                        const times = schedule[day.id] ?? DEFAULT_DAY;
                        const error = errors[`jadwal_per_hari.${day.id}.jam_pulang_mulai`];

                        return (
                            <li key={day.id} className={cx('space-y-2 px-4 py-2.5 sm:space-y-0', grid, !on && 'bg-surface-2/40')}>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={on}
                                    onClick={() => onToggleDay(day.id)}
                                    className="flex h-10 items-center gap-2.5 rounded-lg text-left text-sm"
                                >
                                    <span className={cx('relative h-5 w-9 shrink-0 rounded-full transition-colors', on ? 'bg-accent' : 'bg-line-strong/50')} aria-hidden="true">
                                        <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform', on ? 'translate-x-[18px]' : 'translate-x-0.5')} />
                                    </span>
                                    <span className={cx('font-medium', on ? 'text-ink' : 'text-ink-2')}>{day.name}</span>
                                </button>

                                {on ? (
                                    <>
                                        <TimeRange
                                            label="Datang"
                                            dayName={day.name}
                                            from={times.jam_datang_mulai}
                                            to={times.jam_datang_selesai}
                                            onFrom={(v) => onChangeTime(day.id, 'jam_datang_mulai', v)}
                                            onTo={(v) => onChangeTime(day.id, 'jam_datang_selesai', v)}
                                        />
                                        <TimeRange
                                            label="Pulang"
                                            dayName={day.name}
                                            from={times.jam_pulang_mulai}
                                            to={times.jam_pulang_selesai}
                                            onFrom={(v) => onChangeTime(day.id, 'jam_pulang_mulai', v)}
                                            onTo={(v) => onChangeTime(day.id, 'jam_pulang_selesai', v)}
                                        />
                                        <p className="text-sm tabular-nums text-ink-2">
                                            <span className="sm:hidden">Batas terlambat </span>
                                            {addTolerance(times.jam_datang_selesai, toleranceMinutes) ?? '–'}
                                        </p>
                                        {error && <p className="text-xs font-medium text-danger sm:col-span-3 sm:col-start-2">{error}</p>}
                                    </>
                                ) : (
                                    <p className="text-sm text-ink-2 sm:col-span-3">Libur</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </fieldset>
    );
}

function TimeRange({ label, dayName, from, to, onFrom, onTo }) {
    return (
        <div>
            <p className="mb-1 text-xs font-medium text-ink-2 sm:hidden">{label}</p>
            <div className="flex items-center gap-1.5">
                <input type="time" value={from} onChange={(e) => onFrom(e.target.value)} required aria-label={`${label} ${dayName} mulai`} className={timeInput} />
                <span className="text-ink-3" aria-hidden="true">–</span>
                <input type="time" value={to} onChange={(e) => onTo(e.target.value)} required aria-label={`${label} ${dayName} selesai`} className={timeInput} />
            </div>
        </div>
    );
}
