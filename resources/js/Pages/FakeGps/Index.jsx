import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';

const reasonTone = {
    developer_options: 'from-amber-400 to-orange-500',
};
const blockingTone = 'from-rose-400 to-rose-600';

export default function FakeGpsIndex({ logs, filters, reasonOptions, stats }) {
    const [form, setForm] = useState(filters);
    const firstRender = useRef(true);

    // Terapkan filter (pencarian diberi jeda agar tidak memuat ulang di setiap ketikan).
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return undefined;
        }
        const timer = window.setTimeout(() => {
            router.get(route('admin.fake-gps.index'), clean(form), { preserveState: true, preserveScroll: true, replace: true });
        }, 350);
        return () => window.clearTimeout(timer);
    }, [form]);

    // Catatan baru dari aplikasi Android muncul tanpa muat ulang manual.
    useEffect(() => {
        const reload = () => backgroundReload({ only: ['logs', 'stats'], preserveScroll: true, preserveState: true });
        const interval = window.setInterval(reload, jitteredInterval(15000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const hasFilter = Object.values(form).some(Boolean);

    return (
        <AuthenticatedLayout>
            <Head title="Catatan Fake GPS" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                <div className="mb-4 shrink-0" data-aos="fade-up">
                    <h3 className="text-xl font-bold text-neutral-800">Fake GPS</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">
                        Presensi Android yang diblokir karena lokasi palsu, aplikasi fake GPS, atau HP yang di-root/dimodifikasi. Opsi Pengembang aktif tetap boleh presensi, tetapi dicatat.
                    </p>
                </div>

                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Diblokir Hari Ini" value={stats.blocked_today} icon={icons.gpsOff}>
                        <span className={`font-bold ${stats.blocked_today > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{stats.blocked_today}</span> presensi ditolak
                    </KpiCard>
                    <KpiCard delay={50} label="Dicatat Hari Ini" value={stats.logged_today} icon={icons.document}>
                        <span className="font-bold text-amber-500">{stats.logged_today}</span> opsi pengembang aktif
                    </KpiCard>
                    <KpiCard delay={100} label="Peserta (7 Hari)" value={stats.users_7_days} icon={icons.users}>
                        peserta berbeda tercatat
                    </KpiCard>
                </section>

                <div className="mt-4 flex flex-col xl:min-h-0 xl:flex-1">
                    <section className="card-soft flex flex-col overflow-hidden xl:min-h-0 xl:flex-1" data-aos="fade-up" data-aos-delay="100">
                        <div className="p-4 pb-0">
                            <h6 className="text-base font-semibold text-neutral-800">Catatan Percobaan</h6>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                <span className="h-4 w-4 text-emerald-500">{icons.check}</span>
                                <span className="font-bold text-neutral-700">{logs.total ?? logs.data.length}</span> catatan
                            </p>
                        </div>
                        <div className="grid gap-2 px-4 py-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center">
                            <input
                                type="search"
                                value={form.q}
                                onChange={update('q')}
                                placeholder="Cari nama, NIS/NIP, atau tipe HP"
                                autoComplete="off"
                                className="input-soft"
                            />
                            <select value={form.status} onChange={update('status')} className="input-soft lg:w-auto" aria-label="Filter status">
                                <option value="">Semua status</option>
                                <option value="blocked">Diblokir</option>
                                <option value="logged">Dicatat saja</option>
                            </select>
                            <select value={form.reason} onChange={update('reason')} className="input-soft lg:w-auto" aria-label="Filter keterangan">
                                <option value="">Semua keterangan</option>
                                {reasonOptions.map((option) => (
                                    <option key={option.code} value={option.code}>{option.label}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={form.date}
                                onChange={update('date')}
                                className="input-soft lg:w-auto"
                                aria-label="Filter tanggal"
                            />
                            {hasFilter && (
                                <button
                                    type="button"
                                    onClick={() => setForm({ q: '', status: '', reason: '', date: '' })}
                                    className="rounded-md px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                                >
                                    Reset filter
                                </button>
                            )}
                        </div>

                        {logs.data.length === 0 ? (
                            <p className="border-t border-neutral-200 px-5 py-14 text-center text-sm text-neutral-400">
                                {hasFilter ? 'Tidak ada catatan yang cocok dengan filter.' : 'Belum ada catatan fake GPS.'}
                            </p>
                        ) : (
                            <>
                                {/* Tabel untuk layar lebar */}
                                <div className="hidden min-h-0 flex-1 overflow-x-auto md:block xl:overflow-y-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="sticky top-0 z-10 bg-white text-xs font-semibold uppercase text-neutral-500">
                                            <tr className="border-y border-neutral-200 [&>th]:opacity-70">
                                                <th className="px-5 py-3">Waktu</th>
                                                <th className="px-5 py-3">User</th>
                                                <th className="px-5 py-3">HP</th>
                                                <th className="px-5 py-3">Keterangan</th>
                                                <th className="px-5 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {logs.data.map((log) => (
                                                <tr key={log.id} className="align-top transition-colors hover:bg-neutral-50">
                                                    <td className="whitespace-nowrap px-5 py-3 text-xs font-bold text-slate-500">
                                                        {log.created_at}
                                                        {log.workcode_name && <p className="mt-0.5 font-medium text-slate-400">{log.workcode_name}</p>}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <p className="font-extrabold text-slate-800">{log.participant_name}</p>
                                                        <p className="text-xs font-medium text-slate-500">{log.participant_nip}</p>
                                                    </td>
                                                    <td className="px-5 py-3 font-semibold text-slate-700">{log.device_model}</td>
                                                    <td className="px-5 py-3"><Reasons log={log} /></td>
                                                    <td className="px-5 py-3"><StatusBadge blocked={log.blocked} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Kartu untuk layar HP */}
                                <ul className="divide-y divide-neutral-100 border-t border-neutral-200 md:hidden">
                                    {logs.data.map((log) => (
                                        <li key={log.id} className="px-4 py-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-extrabold text-slate-800">{log.participant_name}</p>
                                                    <p className="text-xs font-medium text-slate-500">{log.participant_nip} · {log.device_model}</p>
                                                </div>
                                                <StatusBadge blocked={log.blocked} />
                                            </div>
                                            <div className="mt-2"><Reasons log={log} /></div>
                                            <p className="mt-1.5 text-xs font-medium text-slate-400">
                                                {log.created_at}{log.workcode_name && ` · ${log.workcode_name}`}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs font-bold text-slate-500 sm:px-5">
                                <span>Halaman {logs.current_page} dari {logs.last_page} · {logs.total} catatan</span>
                                <div className="flex gap-2">
                                    <PageLink href={logs.prev_page_url} label="Sebelumnya" />
                                    <PageLink href={logs.next_page_url} label="Berikutnya" />
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function clean(form) {
    return Object.fromEntries(Object.entries(form).filter(([, value]) => value));
}

function Reasons({ log }) {
    return (
        <div>
            <div className="flex flex-wrap gap-1.5">
                {log.reasons.map((reason) => (
                    <span key={reason.code} className={`inline-flex items-center rounded-md bg-gradient-to-b px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white ${reasonTone[reason.code] || blockingTone}`}>
                        {reason.label}
                    </span>
                ))}
            </div>
            {log.fake_apps.length > 0 && (
                <p className="mt-1.5 text-xs font-semibold text-slate-500">Aplikasi: {log.fake_apps.join(', ')}</p>
            )}
        </div>
    );
}

function StatusBadge({ blocked }) {
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold ${blocked ? 'text-rose-600' : 'text-amber-600'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {blocked ? 'Diblokir' : 'Dicatat'}
        </span>
    );
}

function PageLink({ href, label }) {
    return href ? (
        <Link href={href} preserveScroll className="rounded-md border border-brand-600 px-3 py-1.5 text-brand-700 transition-colors hover:bg-brand-600 hover:text-white">{label}</Link>
    ) : (
        <span className="cursor-not-allowed rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-300">{label}</span>
    );
}
