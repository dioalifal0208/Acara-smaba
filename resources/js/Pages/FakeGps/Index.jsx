import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { Button, DataTable, EmptyState, Input, PageHeader, SearchField, Section, Select, StatusPill } from '@/ui';
import { Head, router } from '@inertiajs/react';
import { Ban, ChevronLeft, ChevronRight, Eye, MapPinOff, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const EMPTY_FILTERS = { q: '', status: '', reason: '', date: '' };

// Tautan halaman: tombol nonaktif bila tidak ada halaman tujuan.
const pageLink = (url) => (url ? { href: url, preserveScroll: true } : { disabled: true });

const clean = (form) => Object.fromEntries(Object.entries(form).filter(([, value]) => value));

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

    const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const hasFilter = Object.values(form).some(Boolean);

    return (
        <AuthenticatedLayout>
            <Head title="Fake GPS" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Fake GPS"
                    description="Presensi Android yang diblokir karena lokasi palsu, aplikasi fake GPS, atau HP yang di-root. Opsi Pengembang aktif tetap boleh presensi, tetapi dicatat."
                />

                <Section flush>
                    <DataTable
                        caption="Catatan fake GPS"
                        rows={logs.data}
                        filtered={hasFilter}
                        onClearFilters={() => setForm(EMPTY_FILTERS)}
                        empty={<EmptyState icon={ShieldCheck} title="Belum ada catatan" description="Percobaan presensi dengan lokasi palsu atau HP yang dimodifikasi akan tercatat di sini." />}
                        toolbar={
                            <div className="space-y-3 px-5 py-4">
                                <div>
                                    <h2 className="text-base font-semibold text-ink">Catatan percobaan</h2>
                                    <p className="mt-0.5 text-sm text-ink-2">
                                        Hari ini <span className="font-medium text-ink">{stats.blocked_today} diblokir</span> dan {stats.logged_today} dicatat · {stats.users_7_days} peserta berbeda dalam 7 hari
                                    </p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center">
                                    <SearchField value={form.q} onChange={set('q')} label="Cari catatan" placeholder="Cari nama, NIP, atau tipe HP…" className="sm:col-span-2 lg:col-span-1" />
                                    <Select value={form.status} onChange={(e) => set('status')(e.target.value)} aria-label="Filter status" className="lg:w-40">
                                        <option value="">Semua status</option>
                                        <option value="blocked">Diblokir</option>
                                        <option value="logged">Dicatat saja</option>
                                    </Select>
                                    <Select value={form.reason} onChange={(e) => set('reason')(e.target.value)} aria-label="Filter keterangan" className="lg:w-52">
                                        <option value="">Semua keterangan</option>
                                        {reasonOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
                                    </Select>
                                    <Input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} aria-label="Filter tanggal" className="lg:w-44" />
                                    {hasFilter && <Button variant="ghost" onClick={() => setForm(EMPTY_FILTERS)}>Hapus filter</Button>}
                                </div>
                            </div>
                        }
                        mobileCard={(log) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink">{log.participant_name}</p>
                                        <p className="truncate text-sm text-ink-2">{log.participant_nip} · {log.device_model}</p>
                                    </div>
                                    <Outcome blocked={log.blocked} />
                                </div>
                                <Reasons log={log} />
                                <p className="text-xs tabular-nums text-ink-2">{log.created_at}{log.workcode_name && ` · ${log.workcode_name}`}</p>
                            </div>
                        )}
                        columns={[
                            {
                                key: 'waktu',
                                header: 'Waktu',
                                cell: (log) => (
                                    <div className="whitespace-nowrap">
                                        <p className="tabular-nums text-ink">{log.created_at}</p>
                                        {log.workcode_name && <p className="text-xs text-ink-2">{log.workcode_name}</p>}
                                    </div>
                                ),
                            },
                            {
                                key: 'peserta',
                                header: 'Peserta',
                                cell: (log) => (
                                    <div className="min-w-0">
                                        <p className="font-medium text-ink">{log.participant_name}</p>
                                        <p className="text-xs tabular-nums text-ink-2">{log.participant_nip}</p>
                                    </div>
                                ),
                            },
                            { key: 'hp', header: 'HP', hideBelow: 'lg', className: 'text-ink-2', cell: (log) => log.device_model },
                            { key: 'alasan', header: 'Keterangan', cell: (log) => <Reasons log={log} /> },
                            { key: 'hasil', header: 'Hasil', cell: (log) => <Outcome blocked={log.blocked} /> },
                        ]}
                    />

                    {logs.last_page > 1 && (
                        <nav className="flex items-center justify-between gap-3 border-t border-line px-5 py-3" aria-label="Halaman catatan">
                            <p className="text-sm text-ink-2">Halaman {logs.current_page} dari {logs.last_page} · {logs.total} catatan</p>
                            <div className="flex gap-2">
                                <Button size="sm" icon={ChevronLeft} {...pageLink(logs.prev_page_url)}>Sebelumnya</Button>
                                <Button size="sm" {...pageLink(logs.next_page_url)}>
                                    Berikutnya
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </div>
                        </nav>
                    )}
                </Section>
            </div>
        </AuthenticatedLayout>
    );
}

/** Alasan blokir sebagai kapsul; Opsi Pengembang (hanya dicatat) netral, sisanya merah. */
function Reasons({ log }) {
    return (
        <div>
            <div className="flex flex-wrap gap-1.5">
                {log.reasons.map((reason) => (
                    <StatusPill key={reason.code} tone={reason.code === 'developer_options' ? 'netral' : 'alpha'} icon={reason.code === 'developer_options' ? null : MapPinOff} label={reason.label} />
                ))}
            </div>
            {log.fake_apps.length > 0 && <p className="mt-1.5 text-xs text-ink-2">Aplikasi: {log.fake_apps.join(', ')}</p>}
        </div>
    );
}

function Outcome({ blocked }) {
    return blocked
        ? <StatusPill tone="alpha" icon={Ban} label="Diblokir" />
        : <StatusPill tone="telat" icon={Eye} label="Dicatat" />;
}
