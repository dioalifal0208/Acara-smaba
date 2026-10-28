import { Button, cx } from '@/ui';
import { Copy, ListChecks, Rows3 } from 'lucide-react';
import { useState } from 'react';

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

const sameTimes = (a, b) => Object.keys(DEFAULT_DAY).every((key) => (a ?? DEFAULT_DAY)[key] === (b ?? DEFAULT_DAY)[key]);

const timeInput = 'h-10 w-full rounded-lg border border-line-strong bg-surface px-2 text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 sm:w-[6.5rem]';

// Kolom tabel jadwal di layar ≥640px: hari | datang | pulang | datang ditutup.
const grid = 'sm:grid sm:grid-cols-[6.5rem_auto_auto_1fr] sm:items-center sm:gap-x-4';

/**
 * Jadwal mingguan presensi harian. Bawaannya satu jam yang sama untuk semua hari kerja (pilih hari,
 * lalu isi jam datang & pulang). "Atur per hari" membuka tabel satu baris per hari untuk sekolah
 * yang jamnya berbeda, misalnya Jumat pulang lebih awal.
 */
export default function WeekSchedule({ activeDays, schedule, onToggleDay, onChangeTime, onChangeAll, onCopyFirst, toleranceMinutes, errors }) {
    const firstDay = DAYS.find((day) => activeDays.includes(day.id));
    const [perDay, setPerDay] = useState(() => activeDays.some((day) => !sameTimes(schedule[day], schedule[firstDay?.id])));
    const firstError = DAYS.map((day) => errors[`jadwal_per_hari.${day.id}.jam_pulang_mulai`]).find(Boolean);

    // Kembali ke jam yang sama: semua hari mengikuti hari kerja pertama.
    const useSameTimes = () => {
        onCopyFirst();
        setPerDay(false);
    };

    return (
        <fieldset>
            <legend className="sr-only">Jadwal mingguan</legend>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink" aria-hidden="true">Jadwal mingguan</p>
                {perDay ? (
                    <Button size="sm" variant="ghost" icon={ListChecks} onClick={useSameTimes} className="-mr-2">Jam sama setiap hari</Button>
                ) : (
                    <Button size="sm" variant="ghost" icon={Rows3} onClick={() => setPerDay(true)} className="-mr-2">Atur per hari</Button>
                )}
            </div>

            {perDay ? (
                <PerDayTable
                    activeDays={activeDays}
                    schedule={schedule}
                    firstDay={firstDay}
                    onToggleDay={onToggleDay}
                    onChangeTime={onChangeTime}
                    onCopyFirst={onCopyFirst}
                    toleranceMinutes={toleranceMinutes}
                    errors={errors}
                />
            ) : (
                <SameEveryDay
                    activeDays={activeDays}
                    times={schedule[firstDay?.id ?? 1] ?? DEFAULT_DAY}
                    onToggleDay={onToggleDay}
                    onChangeAll={onChangeAll}
                    toleranceMinutes={toleranceMinutes}
                    error={firstError}
                />
            )}
        </fieldset>
    );
}

function SameEveryDay({ activeDays, times, onToggleDay, onChangeAll, toleranceMinutes, error }) {
    const closes = addTolerance(times.jam_datang_selesai, toleranceMinutes);

    return (
        <div className="space-y-4 rounded-xl border border-line p-4">
            <div>
                <p id="hari-kerja-label" className="mb-1.5 text-sm text-ink-2">Hari kerja</p>
                <div role="group" aria-labelledby="hari-kerja-label" className="flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                        const on = activeDays.includes(day.id);
                        return (
                            <button
                                key={day.id}
                                type="button"
                                aria-pressed={on}
                                aria-label={day.name}
                                onClick={() => onToggleDay(day.id)}
                                className={cx(
                                    'h-10 min-w-[3rem] rounded-lg border px-3 text-sm transition-colors',
                                    on ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink',
                                )}
                            >
                                {day.short}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4">
                <TimeRange
                    label="Datang"
                    labelVisible
                    from={times.jam_datang_mulai}
                    to={times.jam_datang_selesai}
                    onFrom={(v) => onChangeAll('jam_datang_mulai', v)}
                    onTo={(v) => onChangeAll('jam_datang_selesai', v)}
                />
                <TimeRange
                    label="Pulang"
                    labelVisible
                    from={times.jam_pulang_mulai}
                    to={times.jam_pulang_selesai}
                    onFrom={(v) => onChangeAll('jam_pulang_mulai', v)}
                    onTo={(v) => onChangeAll('jam_pulang_selesai', v)}
                />
            </div>

            <p className="text-sm text-ink-2">
                Datang lewat <span className="tabular-nums">{times.jam_datang_selesai || '–'}</span> tercatat terlambat;
                presensi datang ditutup pukul <span className="font-medium tabular-nums text-ink">{closes ?? '–'}</span>.
            </p>
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
        </div>
    );
}

function PerDayTable({ activeDays, schedule, firstDay, onToggleDay, onChangeTime, onCopyFirst, toleranceMinutes, errors }) {
    return (
        <>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="text-sm text-ink-2">Datang lewat jam selesai tercatat terlambat dan masih diterima {toleranceMinutes} menit.</p>
                {firstDay && activeDays.length > 1 && (
                    <Button size="sm" variant="ghost" icon={Copy} onClick={onCopyFirst} className="-mr-2">Samakan dengan {firstDay.name}</Button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-line">
                <div className={cx('hidden border-b border-line bg-surface-2/60 px-4 py-1.5 text-xs font-medium text-ink-2', grid)} aria-hidden="true">
                    <span>Hari</span>
                    <span>Datang</span>
                    <span>Pulang</span>
                    <span>Datang ditutup</span>
                </div>

                <ul className="divide-y divide-line">
                    {DAYS.map((day) => {
                        const on = activeDays.includes(day.id);
                        const times = schedule[day.id] ?? DEFAULT_DAY;
                        const error = errors[`jadwal_per_hari.${day.id}.jam_pulang_mulai`];

                        return (
                            <li key={day.id} className={cx('space-y-2 px-4 py-2.5 sm:space-y-0 sm:py-1', grid, !on && 'bg-surface-2/40')}>
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
                                            <span className="sm:hidden">Datang ditutup </span>
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
        </>
    );
}

function TimeRange({ label, labelVisible = false, dayName, from, to, onFrom, onTo }) {
    const name = dayName ? `${label} ${dayName}` : label;
    return (
        <div>
            <p className={cx('mb-1', labelVisible ? 'text-sm font-medium text-ink' : 'text-xs font-medium text-ink-2 sm:hidden')}>{label}</p>
            <div className="flex items-center gap-1.5">
                <input type="time" value={from} onChange={(e) => onFrom(e.target.value)} required aria-label={`${name} mulai`} className={timeInput} />
                <span className="text-ink-3" aria-hidden="true">–</span>
                <input type="time" value={to} onChange={(e) => onTo(e.target.value)} required aria-label={`${name} selesai`} className={timeInput} />
            </div>
        </div>
    );
}
