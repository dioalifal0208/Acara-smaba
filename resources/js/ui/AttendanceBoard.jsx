import { Link } from '@inertiajs/react';
import { STATUS } from './StatusPill';
import { cx } from './cx';

const SEGMENTS = [
    { key: 'hadir', status: 'hadir', bar: 'bg-chart-hadir', label: 'Hadir tepat waktu' },
    { key: 'terlambat', status: 'terlambat', bar: 'bg-chart-telat', label: 'Terlambat' },
    { key: 'izin', status: 'izin', bar: 'bg-chart-izin', label: 'Izin / sakit' },
    { key: 'belum', status: 'belum', bar: 'bg-chart-belum', label: 'Belum hadir' },
];

const percent = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);

/**
 * Papan Hadir: satu bar kehadiran hari ini (hadir · terlambat · izin · belum) dengan angka
 * di setiap segmen. Elemen khas tampilan baru; versi `compact` untuk baris workcode.
 *
 * `counts`: `{ hadir, terlambat, izin, belum }`. `hrefFor(key)` opsional membuat tiap
 * keterangan menjadi tautan ke daftar nama di status itu.
 */
export default function AttendanceBoard({ counts, title = 'Kehadiran hari ini', hrefFor, compact = false, className }) {
    const total = SEGMENTS.reduce((sum, s) => sum + (counts[s.key] ?? 0), 0);
    const present = (counts.hadir ?? 0) + (counts.terlambat ?? 0);
    const summary = SEGMENTS.map((s) => `${counts[s.key] ?? 0} ${s.label.toLowerCase()}`).join(', ');

    const bar = (
        // Celah 2px antarsegmen memperlihatkan warna permukaan agar segmen tetap terpisah.
        <div
            className={cx('flex w-full gap-0.5 overflow-hidden rounded-full', total > 0 ? 'bg-surface' : 'bg-chart-belum', compact ? 'h-2' : 'h-3')}
            role="img"
            aria-label={`${present} dari ${total} hadir: ${summary}`}
        >
            {SEGMENTS.map((s) => {
                const value = counts[s.key] ?? 0;
                return value > 0 ? (
                    <div
                        key={s.key}
                        className={cx('h-full min-w-1.5 transition-[width] duration-500 ease-out motion-reduce:transition-none', s.bar)}
                        style={{ width: `${(value / total) * 100}%` }}
                    />
                ) : null;
            })}
        </div>
    );

    if (compact) {
        return (
            <div className={cx('min-w-0', className)}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs text-ink-2">
                    <span><span className="font-semibold tabular-nums text-ink">{present}</span>/{total} hadir</span>
                    {(counts.terlambat ?? 0) > 0 && <span className="tabular-nums text-status-telat">{counts.terlambat} terlambat</span>}
                </div>
                {bar}
            </div>
        );
    }

    return (
        <section className={cx('rounded-xl border border-line bg-surface p-5', className)} aria-labelledby="attendance-board-title" data-aos="fade-up">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                <h2 id="attendance-board-title" className="text-sm font-medium text-ink-2">{title}</h2>
                <p className="text-sm text-ink-2">
                    <span className="font-display text-4xl font-semibold tabular-nums tracking-tight text-ink">{present}</span>
                    <span className="ml-1.5">dari {total} peserta hadir · {percent(present, total)}%</span>
                </p>
            </div>

            <div className="mt-4">{bar}</div>

            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 lg:grid-cols-4">
                {SEGMENTS.map((s) => {
                    const Icon = STATUS[s.status].icon;
                    const value = counts[s.key] ?? 0;
                    const content = (
                        <>
                            <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', s.bar)} aria-hidden="true" />
                            <Icon className="h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate text-ink-2">{s.label}</span>
                            <span className="font-semibold tabular-nums text-ink">{value}</span>
                        </>
                    );
                    const row = 'flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm';

                    return (
                        <li key={s.key}>
                            {hrefFor ? (
                                <Link href={hrefFor(s.key)} className={cx(row, 'hover:bg-surface-2')}>{content}</Link>
                            ) : (
                                <div className={row}>{content}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
