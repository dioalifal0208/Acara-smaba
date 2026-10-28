import { cx } from './cx';

const SERIES = [
    { key: 'tepat', label: 'Tepat waktu', fill: 'bg-chart-hadir' },
    { key: 'telat', label: 'Terlambat', fill: 'bg-chart-telat' },
];

/** Batas atas sumbu yang "bulat" (1, 2, 5 × 10ⁿ) agar garis bantu mudah dibaca. */
function niceMax(value) {
    if (value <= 4) return 4;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 5, 10].find((s) => s * magnitude >= value / 2) * magnitude;
    return Math.ceil(value / step) * step;
}

/**
 * Batang bertumpuk presensi per hari: tepat waktu (bawah) + terlambat (atas). Tooltip muncul
 * saat batang disorot atau difokus keyboard; data yang sama tersedia sebagai tabel.
 *
 * `days`: `[{ date: 'YYYY-MM-DD', tepat, telat }]`, urut lama → baru (hari terakhir = hari ini).
 */
export default function TrendChart({ days, caption }) {
    const max = niceMax(Math.max(0, ...days.map((d) => d.tepat + d.telat)));
    const ticks = [max, max / 2, 0];
    const label = (date, options) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', options);

    return (
        <figure>
            <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-hidden="true">
                {SERIES.map((s) => (
                    <li key={s.key} className="flex items-center gap-1.5">
                        <span className={cx('h-2.5 w-2.5 rounded-sm', s.fill)} />
                        {s.label}
                    </li>
                ))}
            </ul>

            <div className="relative flex h-44 gap-2 pl-8">
                {/* Garis bantu & label sumbu Y */}
                {ticks.map((tick) => (
                    <div key={tick} className="pointer-events-none absolute inset-x-0 flex translate-y-1/2 items-center" style={{ bottom: `${(tick / max) * 100}%` }} aria-hidden="true">
                        <span className="w-7 -translate-y-px pr-1 text-right text-xs tabular-nums text-ink-3">{tick}</span>
                        <span className={cx('h-px flex-1', tick === 0 ? 'bg-line-strong/60' : 'bg-line')} />
                    </div>
                ))}

                {days.map((day, index) => {
                    const total = day.tepat + day.telat;
                    const isToday = index === days.length - 1;
                    const title = label(day.date, { weekday: 'long', day: 'numeric', month: 'long' });

                    return (
                        <div
                            key={day.date}
                            tabIndex={0}
                            aria-label={`${title}: ${total} hadir, ${day.tepat} tepat waktu, ${day.telat} terlambat`}
                            className="group relative flex flex-1 flex-col items-center justify-end rounded-md outline-none hover:bg-surface-2/60 focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            {/* Batang: celah 2px antarsegmen, ujung data membulat 4px, dasar rata di garis nol */}
                            <div className="flex w-full max-w-7 flex-col-reverse gap-0.5" style={{ height: `${(total / max) * 100}%` }}>
                                {day.tepat > 0 && <div className={cx('bg-chart-hadir', day.telat === 0 && 'rounded-t')} style={{ flexGrow: day.tepat }} />}
                                {day.telat > 0 && <div className="rounded-t bg-chart-telat" style={{ flexGrow: day.telat }} />}
                            </div>

                            <div
                                aria-hidden="true"
                                className={cx(
                                    // Di dalam area grafik (kartu memotong yang keluar); kolom tepi rata kiri/kanan.
                                    'pointer-events-none absolute top-0 z-10 hidden w-max rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg group-hover:block group-focus-visible:block',
                                    index < 2 ? 'left-0' : index > days.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2',
                                )}
                            >
                                <p className="font-medium text-ink">{title}</p>
                                <p className="mt-1 text-ink-2"><span className="font-semibold tabular-nums text-ink">{total}</span> hadir</p>
                                {SERIES.map((s) => (
                                    <p key={s.key} className="flex items-center gap-1.5 text-ink-2">
                                        <span className={cx('h-2 w-2 rounded-sm', s.fill)} />
                                        {s.label} <span className="ml-auto pl-3 font-medium tabular-nums text-ink">{day[s.key]}</span>
                                    </p>
                                ))}
                            </div>

                            <span className={cx('absolute -bottom-6 text-xs', isToday ? 'font-semibold text-ink' : 'text-ink-2')}>
                                {isToday ? 'Hari ini' : label(day.date, { weekday: 'short' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            <figcaption className="mt-8 text-xs text-ink-2">{caption}</figcaption>

            <details className="mt-2 text-sm">
                <summary className="inline-flex min-h-8 cursor-pointer items-center rounded-md text-xs font-medium text-accent hover:underline">Lihat sebagai tabel</summary>
                <table className="mt-2 w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-line text-xs text-ink-2">
                            <th scope="col" className="py-2 font-medium">Tanggal</th>
                            <th scope="col" className="py-2 text-right font-medium">Tepat waktu</th>
                            <th scope="col" className="py-2 text-right font-medium">Terlambat</th>
                            <th scope="col" className="py-2 text-right font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody className="tabular-nums">
                        {days.map((day) => (
                            <tr key={day.date} className="border-b border-line last:border-0">
                                <td className="py-1.5 text-ink">{label(day.date, { weekday: 'long', day: 'numeric', month: 'short' })}</td>
                                <td className="py-1.5 text-right text-ink">{day.tepat}</td>
                                <td className="py-1.5 text-right text-ink">{day.telat}</td>
                                <td className="py-1.5 text-right font-medium text-ink">{day.tepat + day.telat}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    );
}
