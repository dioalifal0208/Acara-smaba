import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useToast } from '@/Components/Toast';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';

const statusMeta = {
    pending: { label: 'Menunggu', badge: 'from-amber-400 to-orange-500' },
    approved: { label: 'Disetujui', badge: 'from-emerald-400 to-emerald-600' },
    rejected: { label: 'Ditolak', badge: 'from-rose-400 to-rose-600' },
};

const filters = [['all', 'Semua'], ['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']];

export default function LeaveApprovalsIndex({ leaveRequests }) {
    const { post, processing } = useForm();
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState('all');

    const counts = useMemo(() => leaveRequests.reduce((result, request) => {
        result[request.status_approval] = (result[request.status_approval] || 0) + 1;

        return result;
    }, { pending: 0, approved: 0, rejected: 0 }), [leaveRequests]);

    const filteredRequests = useMemo(
        () => statusFilter === 'all'
            ? leaveRequests
            : leaveRequests.filter((request) => request.status_approval === statusFilter),
        [leaveRequests, statusFilter],
    );

    const handleApprove = (id) => {
        if (confirm('Setujui pengajuan izin ini? Status presensi akan diperbarui sesuai tipe izin.')) {
            post(route('admin.leave.approve', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Pengajuan izin berhasil disetujui.'),
                onError: () => toast.error('Pengajuan izin tidak dapat disetujui.'),
            });
        }
    };

    const handleReject = (id) => {
        if (confirm('Tolak pengajuan izin ini?')) {
            post(route('admin.leave.reject', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Pengajuan izin ditolak.'),
                onError: () => toast.error('Pengajuan izin tidak dapat ditolak.'),
            });
        }
    };

    const total = leaveRequests.length;
    const percent = (value) => (total > 0 ? Math.round((value / total) * 100) : 0);

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Perizinan" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                <div className="mb-4 shrink-0" data-aos="fade-up">
                    <h3 className="text-xl font-bold text-neutral-800">Perizinan</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">
                        Tinjau lampiran dan keterangan peserta. Status presensi baru berubah setelah pengajuan disetujui.
                    </p>
                </div>

                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Menunggu Verifikasi" value={counts.pending} icon={icons.clock}>
                        {counts.pending > 0
                            ? <><span className="font-bold text-amber-500">{counts.pending}</span> perlu keputusan admin</>
                            : <><span className="font-bold text-emerald-600">Aman</span>, tidak ada yang menunggu</>}
                    </KpiCard>
                    <KpiCard delay={50} label="Disetujui" value={counts.approved} icon={icons.check}>
                        <span className="font-bold text-emerald-600">{percent(counts.approved)}%</span> dari {total} pengajuan
                    </KpiCard>
                    <KpiCard delay={100} label="Ditolak" value={counts.rejected} icon={icons.document}>
                        <span className="font-bold text-rose-500">{percent(counts.rejected)}%</span> dari {total} pengajuan
                    </KpiCard>
                </section>

                <section className="card-soft mt-4 flex flex-col overflow-hidden xl:min-h-0 xl:flex-1" data-aos="fade-up" data-aos-delay="100">
                    <div className="flex flex-col gap-3 p-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h6 className="text-base font-semibold text-neutral-800">Daftar Pengajuan</h6>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                <span className="h-4 w-4 text-emerald-500">{icons.check}</span>
                                <span className="font-bold text-neutral-700">{filteredRequests.length}</span> dari {total} pengajuan ditampilkan
                            </p>
                        </div>
                        <div className="inline-flex w-fit rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="Filter status pengajuan">
                            {filters.map(([status, label]) => (
                                <button
                                    key={status}
                                    type="button"
                                    role="tab"
                                    aria-selected={statusFilter === status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${statusFilter === status ? 'bg-white text-brand-700 shadow-soft' : 'text-neutral-500 hover:text-neutral-900'}`}
                                >
                                    {label}
                                    {status !== 'all' && counts[status] > 0 && <span className="ml-1 tabular-nums text-neutral-400">{counts[status]}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredRequests.length === 0 ? (
                        <div className="border-t border-neutral-200 px-5 py-14 text-center">
                            <p className="text-sm font-medium text-neutral-600">Tidak ada pengajuan pada filter ini.</p>
                            {statusFilter !== 'all' && (
                                <button type="button" onClick={() => setStatusFilter('all')} className="mt-1 text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
                                    Tampilkan semua pengajuan
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <ul className="divide-y divide-neutral-100 border-t border-neutral-200 sm:hidden">
                                {filteredRequests.map((request) => (
                                    <LeaveRequestItem key={request.id} request={request} processing={processing} onApprove={handleApprove} onReject={handleReject} />
                                ))}
                            </ul>
                            <div className="hidden max-h-[520px] min-h-0 flex-1 overflow-auto sm:block xl:max-h-none">
                                <table className="min-w-full text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="border-y border-neutral-200 text-xs font-semibold uppercase text-neutral-500 [&>th]:opacity-70">
                                            <th className="px-6 py-3">Peserta</th>
                                            <th className="px-6 py-3">Pengajuan</th>
                                            <th className="px-6 py-3">Keterangan</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3 text-right">Tindakan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((request) => (
                                            <tr key={request.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50">
                                                <td className="px-6 py-3 align-top">
                                                    <div className="flex items-center gap-3">
                                                        <Initial name={request.participant_name} />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-neutral-800">{request.participant_name}</p>
                                                            <p className="text-xs text-neutral-500">{request.participant_nip}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 align-top">
                                                    <p className="text-sm font-semibold text-neutral-800">{request.tanggal}</p>
                                                    <p className="mt-0.5 text-xs text-neutral-500">{request.workcode_name}</p>
                                                    <p className="mt-1 text-xs font-bold uppercase text-neutral-600">{request.tipe_izin_label}</p>
                                                </td>
                                                <td className="max-w-sm px-6 py-3 align-top">
                                                    {request.jenis_izin_label && <p className="text-xs font-semibold text-neutral-700">{request.jenis_izin_label}</p>}
                                                    <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">{request.keterangan}</p>
                                                    <Attachment url={request.bukti_url} />
                                                </td>
                                                <td className="px-6 py-3 text-center align-top"><StatusBadge status={request.status_approval} /></td>
                                                <td className="px-6 py-3 text-right align-top"><LeaveActions request={request} processing={processing} onApprove={handleApprove} onReject={handleReject} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
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

function Attachment({ url }) {
    if (!url) {
        return null;
    }

    return (
        <a href={url} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 rounded px-1 -mx-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.172 7-6.586 6.586a2 2 0 1 0 2.828 2.828l6.414-6.414a4 4 0 1 0-5.656-5.656l-6.415 6.414a6 6 0 1 0 8.486 8.486L20.5 13" />
            </svg>
            Lihat lampiran
        </a>
    );
}

function LeaveRequestItem({ request, processing, onApprove, onReject }) {
    return (
        <li className="space-y-3 px-4 py-3">
            <div className="flex items-start gap-3">
                <Initial name={request.participant_name} />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{request.participant_name}</p>
                    <p className="text-xs text-neutral-500">{request.participant_nip}</p>
                </div>
                <StatusBadge status={request.status_approval} />
            </div>
            <div className="text-sm">
                <p className="font-semibold text-neutral-800">{request.tanggal} · <span className="font-normal text-neutral-500">{request.workcode_name}</span></p>
                <p className="mt-1 text-xs font-bold uppercase text-neutral-600">
                    {request.tipe_izin_label}{request.jenis_izin_label && ` · ${request.jenis_izin_label}`}
                </p>
                <p className="mt-1 leading-relaxed text-neutral-600">{request.keterangan}</p>
                <Attachment url={request.bukti_url} />
            </div>
            <LeaveActions request={request} processing={processing} onApprove={onApprove} onReject={onReject} />
        </li>
    );
}

function LeaveActions({ request, processing, onApprove, onReject }) {
    if (request.status_approval !== 'pending') {
        return <span className="text-xs text-neutral-400">Sudah diproses</span>;
    }

    return (
        <div className="flex justify-end gap-2">
            <button
                type="button"
                onClick={() => onReject(request.id)}
                disabled={processing}
                className="rounded-md border border-rose-500 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                Tolak
            </button>
            <button
                type="button"
                onClick={() => onApprove(request.id)}
                disabled={processing}
                className="rounded-md bg-gradient-to-b from-emerald-400 to-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-dark-sm transition-shadow hover:shadow-dark-hover active:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            >
                Setujui
            </button>
        </div>
    );
}
