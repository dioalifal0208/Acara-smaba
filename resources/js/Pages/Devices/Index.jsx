import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import {
    Button, DataTable, EmptyState, PageHeader, SearchField, Section, StatusPill, useConfirm, useToast,
} from '@/ui';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, HelpCircle, RotateCcw, Smartphone, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const GUIDE_HIDDEN_KEY = 'devices.guide.hidden';

export default function DevicesIndex({ devices, participantCount = 0, minAppVersionCode = 0 }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showGuide, setShowGuide] = useState(() => {
        try { return window.localStorage.getItem(GUIDE_HIDDEN_KEY) !== '1'; } catch { return true; }
    });

    const toggleGuide = (visible) => {
        setShowGuide(visible);
        try { window.localStorage.setItem(GUIDE_HIDDEN_KEY, visible ? '0' : '1'); } catch { /* penyimpanan browser diblokir */ }
    };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // HP yang baru terkunci (login pertama di aplikasi) muncul tanpa muat ulang. Dijeda saat admin memproses aksi.
    useEffect(() => {
        if (processing) return undefined;
        const reload = () => backgroundReload({ only: ['devices', 'participantCount'], preserveScroll: true, preserveState: true });
        const interval = window.setInterval(reload, jitteredInterval(15000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [processing]);

    // APK lama tidak mengirim versi: kosong dihitung di bawah versi minimum apa pun.
    const isOutdated = (device) => minAppVersionCode > 0 && (device.app_version_code ?? 0) < minAppVersionCode;
    const outdatedCount = useMemo(() => devices.filter(isOutdated).length, [devices, minAppVersionCode]);
    const notRegistered = Math.max(0, participantCount - devices.length);

    const rows = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return keyword ? devices.filter((d) => `${d.participant_name} ${d.participant_nip} ${d.device_model}`.toLowerCase().includes(keyword)) : devices;
    }, [devices, search]);

    const submit = (url) => router.post(url, {}, {
        preserveScroll: true,
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
    });

    const handleReset = async (device) => {
        const confirmed = await confirm({
            title: `Reset kunci ${device.participant_name}?`,
            message: `Akun keluar dari ${device.device_model}. HP yang dipakai login berikutnya otomatis terdaftar.`,
            type: 'warning',
            confirmText: 'Reset kunci',
        });
        if (confirmed) submit(route('admin.devices.reset', device.user_id));
    };

    const handleResetAll = async () => {
        const confirmed = await confirm({
            title: `Reset kunci ${devices.length} perangkat?`,
            message: 'Semua peserta keluar dari aplikasi dan harus login ulang. HP yang dipakai login berikutnya otomatis terdaftar.',
            confirmText: 'Reset semua',
        });
        if (confirmed) submit(route('admin.devices.reset-all'));
    };

    const version = (device) => (device.app_version_code
        ? isOutdated(device)
            ? <StatusPill tone="alpha" icon={AlertTriangle} label={`v${device.app_version_name ?? '?'} · perlu update`} />
            : <span className="tabular-nums text-ink-2">v{device.app_version_name ?? '?'} ({device.app_version_code})</span>
        : <StatusPill tone={minAppVersionCode > 0 ? 'alpha' : 'netral'} icon={minAppVersionCode > 0 ? AlertTriangle : null} label="Versi lama" />);

    const summary = [
        `${devices.length} HP terdaftar`,
        `${notRegistered} dari ${participantCount} peserta belum login di aplikasi`,
        minAppVersionCode > 0 && (outdatedCount > 0 ? `${outdatedCount} HP perlu update aplikasi` : 'semua memakai versi terbaru'),
    ].filter(Boolean).join(' · ');

    return (
        <AuthenticatedLayout>
            <Head title="Perangkat" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Perangkat"
                    description="Satu akun peserta hanya bisa dipakai di satu HP, dan satu HP hanya untuk satu akun."
                    actions={
                        <>
                            {!showGuide && <Button icon={HelpCircle} onClick={() => toggleGuide(true)}>Cara kerja</Button>}
                            <Button variant="danger" icon={RotateCcw} onClick={handleResetAll} disabled={processing || devices.length === 0}>Reset semua</Button>
                        </>
                    }
                />

                {showGuide && <HowItWorks onHide={() => toggleGuide(false)} />}

                <Section flush>
                    <DataTable
                        caption="Perangkat terdaftar"
                        rows={rows}
                        rowKey={(d) => d.user_id}
                        filtered={Boolean(search)}
                        onClearFilters={() => setSearch('')}
                        empty={
                            <EmptyState
                                icon={Smartphone}
                                title="Belum ada HP terdaftar"
                                description="HP otomatis terdaftar di sini saat peserta pertama kali login di aplikasi Android."
                            />
                        }
                        toolbar={
                            <div className="space-y-3 px-5 py-4">
                                <div>
                                    <h2 className="text-base font-semibold text-ink">Perangkat terdaftar</h2>
                                    <p className="mt-0.5 text-sm text-ink-2" aria-live="polite">{search ? `${rows.length} dari ${devices.length} HP cocok` : summary}</p>
                                </div>
                                <SearchField value={search} onChange={setSearch} label="Cari perangkat" placeholder="Cari nama, NIP, atau tipe HP…" />
                            </div>
                        }
                        mobileCard={(d) => (
                            <div className="space-y-2">
                                <div>
                                    <p className="truncate text-sm font-medium text-ink">{d.participant_name}</p>
                                    <p className="truncate text-sm text-ink-2">{d.device_model} · {d.participant_nip}</p>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    {version(d)}
                                    <Button size="sm" icon={RotateCcw} onClick={() => handleReset(d)} disabled={processing}>Reset kunci</Button>
                                </div>
                            </div>
                        )}
                        columns={[
                            {
                                key: 'peserta',
                                header: 'Peserta',
                                cell: (d) => (
                                    <div className="min-w-0">
                                        <p className="font-medium text-ink">{d.participant_name}</p>
                                        <p className="text-xs tabular-nums text-ink-2">
                                            {d.participant_nip}
                                            {/* Kolom HP tersembunyi di layar sempit, jadi tampil di bawah nama. */}
                                            <span className="md:hidden"> · {d.device_model}</span>
                                        </p>
                                    </div>
                                ),
                            },
                            { key: 'hp', header: 'HP', hideBelow: 'md', cell: (d) => d.device_model },
                            { key: 'sejak', header: 'Terdaftar sejak', hideBelow: 'lg', className: 'text-ink-2', cell: (d) => d.bound_at ?? '–' },
                            { key: 'versi', header: 'Versi aplikasi', cell: version },
                            {
                                key: 'aksi',
                                header: <span className="sr-only">Aksi</span>,
                                align: 'right',
                                cell: (d) => <Button size="sm" icon={RotateCcw} onClick={() => handleReset(d)} disabled={processing} aria-label={`Reset kunci ${d.participant_name}`}>Reset kunci</Button>,
                            },
                        ]}
                    />
                </Section>
            </div>
        </AuthenticatedLayout>
    );
}

/** Penjelasan singkat alur kunci perangkat; bisa disembunyikan (diingat per browser). */
function HowItWorks({ onHide }) {
    const steps = [
        { title: 'Login pertama mengunci akun', body: 'HP yang pertama dipakai login otomatis terdaftar. Akun itu tidak bisa dipakai di HP lain, dan HP itu tidak bisa dipakai akun lain.' },
        { title: 'Peserta ganti HP', body: 'Login di HP baru ditolak dengan pesan "sudah terdaftar di HP lain", lalu peserta menghubungi admin.' },
        { title: 'Admin menekan Reset kunci', body: 'Kunci akun dilepas dan HP lama keluar. HP yang dipakai login berikutnya otomatis terdaftar.' },
    ];

    return (
        <Section
            title="Cara kerja kunci perangkat"
            actions={<Button size="sm" variant="ghost" icon={X} onClick={onHide}>Sembunyikan</Button>}
        >
            {/* Urutan langkah memang berurutan, jadi pakai daftar bernomor. */}
            <ol className="grid gap-4 md:grid-cols-3">
                {steps.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink-2" aria-hidden="true">{index + 1}</span>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-ink">{step.title}</p>
                            <p className="mt-0.5 text-sm text-ink-2">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </Section>
    );
}
