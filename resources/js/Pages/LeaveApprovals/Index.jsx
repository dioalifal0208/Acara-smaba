import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useToast } from '@/Components/Toast';

const statusMeta = {
    pending: {
        label: 'Menunggu',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        iconClass: 'bg-amber-100 text-amber-600',
    },
    approved: {
        label: 'Disetujui',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        iconClass: 'bg-emerald-100 text-emerald-600',
    },
    rejected: {
        label: 'Ditolak',
        badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
        iconClass: 'bg-rose-100 text-rose-600',
    },
};

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

    const renderStatus = (status) => {
        const meta = statusMeta[status] || statusMeta.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${meta.badgeClass}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {meta.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={<h1 className="truncate text-base font-extrabold leading-tight text-slate-800 sm:text-xl">Pusat Perizinan</h1>}
        >
            <Head title="Pusat Perizinan" />

            <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-800 p-5 text-white shadow-xl shadow-indigo-600/15 sm:p-6">
                        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl" />
                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-sm">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Administrasi Presensi</p>
                                    <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Riwayat dan Verifikasi Izin</h2>
                                    <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-indigo-100">
                                        Tinjau lampiran dan keterangan peserta sebelum mengambil keputusan. Status presensi hanya diperbarui setelah pengajuan disetujui.
                                    </p>
                                </div>
                            </div>
                            <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/15 px-4 py-3 text-sm font-bold backdrop-blur-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    {counts.pending > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70" />}
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
                                </span>
                                {counts.pending} menunggu verifikasi
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {['pending', 'approved', 'rejected'].map((status) => {
                            const meta = statusMeta[status];

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    className={`group flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${statusFilter === status ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}
                                    aria-pressed={statusFilter === status}
                                >
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}>
                                        {status === 'pending' ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        ) : status === 'approved' ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m6 18 12-12M6 6l12 12" /></svg>
                                        )}
                                    </span>
                                    <span>
                                        <span className="block text-2xl font-black leading-none text-slate-800">{counts[status]}</span>
                                        <span className="mt-1 block text-xs font-bold text-slate-500">{meta.label}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-800">Daftar Pengajuan</h2>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">{filteredRequests.length} dari {leaveRequests.length} pengajuan ditampilkan</p>
                            </div>
                            <div className="flex flex-wrap gap-2" aria-label="Filter status pengajuan">
                                {[['all', 'Semua'], ['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']].map(([status, label]) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${statusFilter === status ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        aria-pressed={statusFilter === status}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01.586-1.414l5-5A2 2 0 0114 1h5a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h2" /></svg>
                                </div>
                                <p className="font-bold text-slate-700">Tidak ada pengajuan pada filter ini.</p>
                                <button type="button" onClick={() => setStatusFilter('all')} className="mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">Tampilkan semua pengajuan</button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 p-4 sm:hidden">
                                    {filteredRequests.map((request) => <LeaveRequestCard key={request.id} request={request} processing={processing} renderStatus={renderStatus} onApprove={handleApprove} onReject={handleReject} />)}
                                </div>
                                <div className="hidden max-h-[474px] overflow-x-auto overflow-y-auto sm:block">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Peserta</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Pengajuan</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Keterangan</th>
                                                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {filteredRequests.map((request) => (
                                                <tr key={request.id} className="transition-colors hover:bg-slate-50/80">
                                                    <td className="px-5 py-4 align-top">
                                                        <p className="text-sm font-extrabold text-slate-800">{request.participant_name}</p>
                                                        <p className="mt-0.5 text-xs font-medium text-slate-500">{request.participant_nip}</p>
                                                    </td>
                                                    <td className="px-5 py-4 align-top">
                                                        <p className="text-sm font-bold text-slate-700">{request.tanggal}</p>
                                                        <p className="mt-1 text-xs font-medium text-slate-500">{request.workcode_name}</p>
                                                        <p className="mt-1.5 inline-flex rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{request.tipe_izin_label}</p>
                                                    </td>
                                                    <td className="max-w-sm px-5 py-4 align-top">
                                                        {request.jenis_izin_label && <p className="text-xs font-bold text-slate-600">{request.jenis_izin_label}</p>}
                                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{request.keterangan}</p>
                                                        {request.bukti_url && <a href={request.bukti_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"><PaperclipIcon /> Lihat lampiran</a>}
                                                    </td>
                                                    <td className="px-5 py-4 text-center align-top">{renderStatus(request.status_approval)}</td>
                                                    <td className="px-5 py-4 text-right align-top"><LeaveActions request={request} processing={processing} onApprove={handleApprove} onReject={handleReject} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function LeaveRequestCard({ request, processing, renderStatus, onApprove, onReject }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-800">{request.participant_name}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{request.participant_nip}</p>
                </div>
                {renderStatus(request.status_approval)}
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-sm font-bold text-slate-700">{request.tanggal}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{request.workcode_name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{request.tipe_izin_label}</span>
                    {request.jenis_izin_label && <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{request.jenis_izin_label}</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{request.keterangan}</p>
                {request.bukti_url && <a href={request.bukti_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600"><PaperclipIcon /> Lihat lampiran</a>}
            </div>
            <div className="mt-4"><LeaveActions request={request} processing={processing} onApprove={onApprove} onReject={onReject} /></div>
        </article>
    );
}

function LeaveActions({ request, processing, onApprove, onReject }) {
    if (request.status_approval !== 'pending') {
        return <span className="text-xs font-semibold text-slate-400">Sudah diproses</span>;
    }

    return (
        <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onReject(request.id)} disabled={processing} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">Tolak</button>
            <button type="button" onClick={() => onApprove(request.id)} disabled={processing} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">Setujui</button>
        </div>
    );
}

function PaperclipIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.172 7-6.586 6.586a2 2 0 1 0 2.828 2.828l6.414-6.414a4 4 0 1 0-5.656-5.656l-6.415 6.414a6 6 0 1 0 8.486 8.486L20.5 13" />
        </svg>
    );
}
