import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const statusStyle = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusLabel = {
    pending: 'Menunggu persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const formatLabel = (value) => (value || '-').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function LeaveHistory({ leaveRequests }) {
    return (
        <AuthenticatedLayout header={<h1 className="truncate text-base font-extrabold leading-tight text-slate-800 sm:text-xl">Riwayat Izin</h1>}>
            <Head title="Riwayat Izin" />

            <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <p className="mb-5 text-sm text-slate-600">Pantau status pengajuan Anda. Izin hanya berlaku setelah disetujui admin.</p>

                    {leaveRequests.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                            Belum ada pengajuan izin.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaveRequests.map((request) => (
                                <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="font-extrabold text-slate-900">{request.workcode_name}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-600">
                                                {request.tanggal}{request.tanggal_selesai ? ` s.d. ${request.tanggal_selesai}` : ''}
                                            </p>
                                        </div>
                                        <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusStyle[request.status_approval] || statusStyle.pending}`}>
                                            {statusLabel[request.status_approval] || 'Menunggu persetujuan'}
                                        </span>
                                    </div>
                                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                        <div><span className="text-slate-500">Tipe: </span><span className="font-semibold text-slate-800">{formatLabel(request.tipe_izin)}</span></div>
                                        <div><span className="text-slate-500">Jenis: </span><span className="font-semibold text-slate-800">{formatLabel(request.jenis_izin)}</span></div>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{request.keterangan}</p>
                                    <p className="mt-3 text-xs text-slate-400">Diajukan {request.created_at}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
