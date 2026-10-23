import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';

const GUIDE_HIDDEN_KEY = 'devices.guide.hidden';

export default function DevicesIndex({ devices, participantCount = 0, minAppVersionCode = 0 }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showGuide, setShowGuide] = useState(() => {
        try { return window.localStorage.getItem(GUIDE_HIDDEN_KEY) !== '1'; } catch { return true; }
    });
    const confirm = useConfirm();

    const toggleGuide = (visible) => {
        setShowGuide(visible);
        try { window.localStorage.setItem(GUIDE_HIDDEN_KEY, visible ? '0' : '1'); } catch { /* penyimpanan browser diblokir */ }
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
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

    const filteredDevices = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return devices;

        return devices.filter((d) => `${d.participant_name} ${d.participant_nip} ${d.device_model}`.toLowerCase().includes(keyword));
    }, [devices, search]);

    const submit = (url) => {
        router.post(url, {}, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const handleReset = async (device) => {
        const confirmed = await confirm({
            title: 'Reset Kunci Perangkat',
            message: `Reset kunci perangkat ${device.participant_name}? Akun akan keluar dari ${device.device_model}, dan HP yang dipakai login berikutnya otomatis terdaftar.`,
            type: 'danger',
            confirmText: 'Ya, Reset',
            cancelText: 'Batal',
        });
        if (confirmed) {
            submit(route('admin.devices.reset', device.user_id));
        }
    };

    const handleResetAll = async () => {
        const confirmed = await confirm({
            title: 'Reset Semua Kunci Perangkat',
            message: `Reset kunci perangkat ${devices.length} peserta sekaligus? Semua peserta akan keluar dari aplikasi dan harus login ulang. HP yang dipakai login berikutnya otomatis terdaftar.`,
            type: 'danger',
            confirmText: 'Ya, Reset Semua',
            cancelText: 'Batal',
        });
        if (confirmed) {
            submit(route('admin.devices.reset-all'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Perangkat Peserta" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-3" data-aos="fade-up">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800">Perangkat</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            Satu akun peserta hanya bisa dipakai di satu HP, dan satu HP hanya untuk satu akun.
                        </p>
                    </div>
                    {!showGuide && (
                        <button type="button" onClick={() => toggleGuide(true)} className="shrink-0 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                            Cara kerja
                        </button>
                    )}
                </div>

                {showGuide && <HowItWorks onHide={() => toggleGuide(false)} />}

                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Perangkat Terdaftar" value={devices.length} icon={icons.phone}>
                        akun peserta terkunci ke HP
                    </KpiCard>
                    <KpiCard delay={50} label="Belum Login di Aplikasi" value={notRegistered} icon={icons.users}>
                        dari <span className="font-bold text-neutral-700">{participantCount}</span> peserta
                    </KpiCard>
                    <KpiCard delay={100} label="Versi Aplikasi Usang" value={minAppVersionCode > 0 ? outdatedCount : '-'} icon={icons.clock}>
                        {minAppVersionCode > 0
                            ? (outdatedCount > 0
                                ? <><span className="font-bold text-rose-500">{outdatedCount}</span> HP perlu update aplikasi</>
                                : <><span className="font-bold text-emerald-600">Semua</span> memakai versi terbaru</>)
                            : 'versi minimum belum diatur'}
                    </KpiCard>
                </section>

                <section className="card-soft mt-4 flex flex-col overflow-hidden xl:min-h-0 xl:flex-1" data-aos="fade-up" data-aos-delay="100">
                    <div className="flex flex-col gap-3 p-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h6 className="text-base font-semibold text-neutral-800">Perangkat Terdaftar</h6>
                            <p className="mt-0.5 text-sm text-neutral-500">
                                <span className="font-bold text-neutral-700">{filteredDevices.length}</span> dari {devices.length} HP terkunci ke akun peserta
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-1 sm:flex-row sm:items-center sm:justify-end sm:pl-8">
                            <div className="relative min-w-0 sm:flex-1 lg:max-w-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, NIS/NIP, atau tipe HP"
                                    autoComplete="off"
                                    className="input-soft pl-9"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleResetAll}
                                disabled={processing || devices.length === 0}
                                className="shrink-0 rounded-md border border-rose-500 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Reset semua
                            </button>
                        </div>
                    </div>

                    {filteredDevices.length === 0 ? (
                        <div className="border-t border-neutral-200 px-5 py-14 text-center">
                            <p className="text-sm font-medium text-neutral-500">
                                {devices.length === 0 ? 'Belum ada peserta yang login di aplikasi Android.' : 'Tidak ada yang cocok dengan pencarian.'}
                            </p>
                            {devices.length === 0 && (
                                <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-400">HP otomatis terdaftar di sini saat peserta pertama kali login di aplikasi.</p>
                            )}
                        </div>
                    ) : (
                        <div className="min-h-0 flex-1 overflow-y-auto border-t border-neutral-200">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-neutral-400">
                                    <tr className="border-b border-neutral-100">
                                        <th className="px-4 py-2.5 font-semibold">Peserta</th>
                                        <th className="hidden px-4 py-2.5 font-semibold md:table-cell">HP</th>
                                        <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">Terdaftar sejak</th>
                                        <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Versi aplikasi</th>
                                        <th className="px-4 py-2.5 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {filteredDevices.map((device) => (
                                        <tr key={device.user_id} className="transition-colors hover:bg-neutral-50">
                                            <td className="px-4 py-2.5">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Initial name={device.participant_name} />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-neutral-800">{device.participant_name}</p>
                                                        <p className="truncate text-xs text-neutral-500">
                                                            {device.participant_nip}
                                                            {/* Di layar sempit kolom HP disembunyikan, jadi tampilkan di bawah nama. */}
                                                            <span className="md:hidden"> · {device.device_model}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden px-4 py-2.5 text-neutral-700 md:table-cell">{device.device_model}</td>
                                            <td className="hidden px-4 py-2.5 text-neutral-500 lg:table-cell">{device.bound_at ?? '-'}</td>
                                            <td className="hidden px-4 py-2.5 sm:table-cell">
                                                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${isOutdated(device) ? 'bg-rose-50 text-rose-600' : 'bg-neutral-100 text-neutral-600'}`}>
                                                    {device.app_version_code ? `v${device.app_version_name ?? '?'} (${device.app_version_code})` : 'versi lama'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleReset(device)}
                                                    disabled={processing}
                                                    className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    title={`Reset kunci perangkat ${device.participant_name}`}
                                                >
                                                    Reset kunci
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

/** Penjelasan singkat alur kunci perangkat; bisa disembunyikan (diingat per browser). */
function HowItWorks({ onHide }) {
    const steps = [
        {
            title: 'Login pertama mengunci akun',
            body: 'HP yang pertama dipakai login otomatis terdaftar di daftar ini. Akun itu tidak bisa dipakai di HP lain, dan HP itu tidak bisa dipakai akun lain.',
        },
        {
            title: 'Peserta ganti HP',
            body: 'Login di HP baru ditolak dengan pesan "sudah terdaftar di HP lain". Peserta menghubungi admin.',
        },
        {
            title: 'Admin klik Reset kunci',
            body: 'Kunci akun dilepas dan HP lama keluar. HP yang dipakai login berikutnya otomatis terdaftar.',
        },
    ];

    return (
        <section className="card-soft mb-4 shrink-0 p-4" data-aos="fade-up">
            <div className="flex items-start justify-between gap-3">
                <h6 className="text-sm font-semibold text-neutral-800">Cara kerja kunci perangkat</h6>
                <button type="button" onClick={onHide} className="shrink-0 text-xs font-medium text-neutral-400 hover:text-neutral-600">
                    Sembunyikan
                </button>
            </div>
            <ol className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {steps.map((step, index) => (
                    <li key={step.title} className="flex gap-3 rounded-lg bg-neutral-50 p-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">{index + 1}</span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-800">{step.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function Initial({ name }) {
    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white">
            {(name || '?').charAt(0).toUpperCase()}
        </span>
    );
}
