import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';

const statusMeta = {
    pending: { label: 'Menunggu', badge: 'from-amber-400 to-orange-500' },
    approved: { label: 'Disetujui', badge: 'from-emerald-400 to-emerald-600' },
    rejected: { label: 'Ditolak', badge: 'from-rose-400 to-rose-600' },
};

export default function DevicesIndex({ deviceRequests, devices, violationsToday = 0, minAppVersionCode = 0 }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);
    const confirm = useConfirm();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Sinkron dengan aplikasi Android: pengajuan pindah perangkat baru dan HP yang baru terkunci
    // (login pertama) muncul tanpa muat ulang. Dijeda saat admin sedang memproses sebuah aksi.
    useEffect(() => {
        if (processing) return undefined;

        const reload = () => backgroundReload({ only: ['deviceRequests', 'devices', 'violationsToday'], preserveScroll: true, preserveState: true });
        const interval = window.setInterval(reload, jitteredInterval(15000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [processing]);

    const pendingCount = useMemo(() => deviceRequests.filter((r) => r.status === 'pending').length, [deviceRequests]);

    const filteredRequests = useMemo(
        () => statusFilter === 'all' ? deviceRequests : deviceRequests.filter((r) => r.status === statusFilter),
        [deviceRequests, statusFilter],
    );

    const filteredDevices = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return devices;

        return devices.filter((d) => `${d.participant_name} ${d.participant_nip} ${d.device_model}`.toLowerCase().includes(keyword));
    }, [devices, search]);

    const submit = (url, data = {}) => {
        router.post(url, data, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const handleApprove = async (request) => {
        const confirmed = await confirm({
            title: 'Setujui Pindah Perangkat',
            message: `Setujui pindah perangkat ${request.participant_name} ke ${request.device_model}? HP lama akan langsung keluar dari akun.`,
            type: 'info',
            confirmText: 'Ya, Setujui',
            cancelText: 'Batal',
        });
        if (confirmed) {
            submit(route('admin.device-change-requests.approve', request.id));
        }
    };

    const handleReject = (request) => {
        const reason = prompt('Alasan penolakan (opsional, akan terlihat oleh peserta):', '');
        if (reason !== null) {
            submit(route('admin.device-change-requests.reject', request.id), { rejection_reason: reason || null });
        }
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
            message: `Reset kunci perangkat ${devices.length} peserta sekaligus? Semua peserta akan keluar dari aplikasi dan harus login ulang. HP yang dipakai login berikutnya otomatis terdaftar. Pengajuan pindah perangkat yang menunggu juga ditutup.`,
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
                <div className="mb-4 shrink-0" data-aos="fade-up">
                    <h3 className="text-xl font-bold text-neutral-800">Perangkat</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">
                        Setiap akun terkunci ke HP pertama yang dipakai login. Setujui pengajuan bila peserta berganti HP, atau reset kunci bila HP hilang/rusak.
                    </p>
                </div>

                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Menunggu Persetujuan" value={pendingCount} icon={icons.clock}>
                        {pendingCount > 0
                            ? <><span className="font-bold text-amber-500">{pendingCount}</span> pengajuan pindah HP</>
                            : <><span className="font-bold text-emerald-600">Aman</span>, tidak ada pengajuan</>}
                    </KpiCard>
                    <KpiCard delay={50} label="Perangkat Terdaftar" value={devices.length} icon={icons.phone}>
                        akun peserta terkunci ke HP
                    </KpiCard>
                    <KpiCard delay={100} label="Fake GPS Diblokir" value={violationsToday} icon={icons.gpsOff}>
                        <span className={`font-bold ${violationsToday > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{violationsToday}</span> percobaan hari ini
                    </KpiCard>
                </section>

                <section className="mt-4 grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-3">
                    {/* Pengajuan pindah perangkat */}
                    <div className="card-soft flex flex-col overflow-hidden xl:col-span-2 xl:min-h-0" data-aos="fade-up">
                        <div className="flex flex-col gap-3 p-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h6 className="text-base font-semibold text-neutral-800">Pengajuan Pindah Perangkat</h6>
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                    <span className="h-4 w-4 text-emerald-500">{icons.check}</span>
                                    <span className="font-bold text-neutral-700">{filteredRequests.length}</span> dari {deviceRequests.length} pengajuan
                                </p>
                            </div>
                            <div className="inline-flex w-fit rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="Filter status pengajuan">
                                {[['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak'], ['all', 'Semua']].map(([status, label]) => (
                                    <button
                                        key={status}
                                        type="button"
                                        role="tab"
                                        aria-selected={statusFilter === status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${statusFilter === status ? 'bg-white text-brand-700 shadow-soft' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <p className="border-t border-neutral-200 px-5 py-12 text-center text-sm text-neutral-400">Tidak ada pengajuan pada filter ini.</p>
                        ) : (
                            <ul className="max-h-[520px] min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto border-t border-neutral-200">
                                {filteredRequests.map((request) => (
                                    <li key={request.id} className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex min-w-0 flex-1 gap-3">
                                            <Initial name={request.participant_name} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-neutral-800">{request.participant_name}</p>
                                                    <span className="text-xs text-neutral-500">{request.participant_nip}</span>
                                                    <StatusBadge status={request.status} />
                                                </div>
                                                <p className="mt-1 text-xs font-semibold text-neutral-600">
                                                    {request.previous_device_model} <span className="text-neutral-400">→</span> <span className="text-neutral-900">{request.device_model}</span>
                                                </p>
                                                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{request.reason}</p>
                                                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                                                    <span className="h-3.5 w-3.5">{icons.clock}</span>
                                                    Diajukan {request.created_at}
                                                    {request.reviewed_at && ` · diproses ${request.reviewed_at}${request.reviewer_name ? ` oleh ${request.reviewer_name}` : ''}`}
                                                </p>
                                                {request.rejection_reason && <p className="mt-1 text-xs font-medium text-rose-600">Alasan ditolak: {request.rejection_reason}</p>}
                                            </div>
                                        </div>
                                        {request.status === 'pending' && (
                                            <div className="flex shrink-0 justify-end gap-2">
                                                <button type="button" onClick={() => handleReject(request)} disabled={processing} className="rounded-md border border-rose-500 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                                                    Tolak
                                                </button>
                                                <button type="button" onClick={() => handleApprove(request)} disabled={processing} className="rounded-md bg-gradient-to-b from-emerald-400 to-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-dark-sm transition-shadow hover:shadow-dark-hover active:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">
                                                    Setujui
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Perangkat terdaftar */}
                    <div className="card-soft flex flex-col overflow-hidden xl:min-h-0" data-aos="fade-up" data-aos-delay="100">
                        <div className="p-4 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h6 className="text-base font-semibold text-neutral-800">Perangkat Terdaftar</h6>
                                    <p className="mt-0.5 text-sm text-neutral-500">{devices.length} akun terkunci ke perangkat</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    disabled={processing || devices.length === 0}
                                    className="shrink-0 rounded-md border border-rose-500 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Reset semua
                                </button>
                            </div>
                            <div className="relative mt-3">
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
                        </div>

                        {filteredDevices.length === 0 ? (
                            <p className="border-t border-neutral-200 px-5 py-12 text-center text-sm text-neutral-400">
                                {devices.length === 0 ? 'Belum ada peserta yang login di aplikasi Android.' : 'Tidak ada yang cocok dengan pencarian.'}
                            </p>
                        ) : (
                            <ul className="max-h-[480px] min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto border-t border-neutral-200">
                                {filteredDevices.map((device) => (
                                    <li key={device.user_id} className="group flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-50">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-neutral-800">{device.participant_name}</p>
                                            <p className="mt-0.5 truncate text-xs text-neutral-500">
                                                {device.device_model}{device.bound_at && ` · sejak ${device.bound_at}`}
                                                {' · '}
                                                {/* APK lama tidak mengirim versi, jadi kosong = di bawah versi apa pun yang tercatat. */}
                                                <span className={minAppVersionCode > 0 && (device.app_version_code ?? 0) < minAppVersionCode ? 'font-medium text-rose-600' : ''}>
                                                    {device.app_version_code ? `v${device.app_version_name ?? '?'} (${device.app_version_code})` : 'versi lama'}
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleReset(device)}
                                            disabled={processing}
                                            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            title={`Reset kunci perangkat ${device.participant_name}`}
                                        >
                                            Reset kunci
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

function StatusBadge({ status }) {
    const meta = statusMeta[status] || statusMeta.pending;

    return (
        <span className={`inline-flex items-center rounded-md bg-gradient-to-b px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white ${meta.badge}`}>
            {meta.label}
        </span>
    );
}

function Initial({ name }) {
    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white">
            {(name || '?').charAt(0).toUpperCase()}
        </span>
    );
}
