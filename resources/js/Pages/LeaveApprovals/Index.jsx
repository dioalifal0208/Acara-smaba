import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useToast } from '@/Components/Toast';

export default function LeaveApprovalsIndex({ leaveRequests }) {
    const { post, processing } = useForm();
    const { toast } = useToast();

    const handleApprove = (id) => {
        if (confirm('Yakin ingin menyetujui pengajuan ini?')) {
            post(route('admin.leave.approve', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Pengajuan berhasil disetujui.'),
                onError: () => toast.error('Terjadi kesalahan.'),
            });
        }
    };

    const handleReject = (id) => {
        if (confirm('Yakin ingin menolak pengajuan ini?')) {
            post(route('admin.leave.reject', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Pengajuan ditolak.'),
                onError: () => toast.error('Terjadi kesalahan.'),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Verifikasi Izin & Sakit" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1 w-full">
                <div className="mx-auto max-w-7xl w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                        <h2 className="text-2xl font-bold text-slate-800">Verifikasi Izin &amp; Sakit</h2>
                        <Link href={route('dashboard')} className="px-4 py-2 bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 font-semibold transition-colors text-sm text-center">
                            Kembali ke Dashboard
                        </Link>
                    </div>

                    {/* ── Mobile Card List (< sm) ── */}
                    <div className="sm:hidden space-y-3">
                        {leaveRequests.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                                <svg className="w-10 h-10 text-slate-300 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-sm font-semibold text-slate-500">Tidak ada pengajuan menunggu verifikasi.</p>
                            </div>
                        ) : (
                            leaveRequests.map((req) => (
                                <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                                    {/* Top row: name + status badge */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{req.participant_name}</p>
                                            <p className="text-xs text-slate-500">{req.participant_nip}</p>
                                        </div>
                                        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                            ${req.status_approval === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                              req.status_approval === 'rejected' ? 'bg-red-100 text-red-800' :
                                              'bg-slate-100 text-slate-800'}`}>
                                            {req.status_approval}
                                        </span>
                                    </div>
                                    {/* Date + workcode */}
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-semibold">{req.tanggal}</span>
                                        <span className="text-slate-400">·</span>
                                        <span className="truncate">{req.workcode_name}</span>
                                    </div>
                                    {/* Type + reason */}
                                    <div className="flex items-start gap-2">
                                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize
                                            ${req.tipe === 'izin' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {req.tipe}
                                        </span>
                                        <p className="text-xs text-slate-700 leading-relaxed">{req.alasan}</p>
                                    </div>
                                    {/* Attachment */}
                                    {req.bukti_url && (
                                        <a href={req.bukti_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                            </svg>
                                            Lihat Lampiran
                                        </a>
                                    )}
                                    {/* Action buttons */}
                                    {req.status_approval === 'pending' && (
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                disabled={processing}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                disabled={processing}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-red-600 text-sm font-bold border border-red-200 rounded-xl hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Tolak
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── Desktop Table (≥ sm) ── */}
                    <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tgl / Workcode</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Peserta</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe / Alasan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bukti Dukung</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {leaveRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    <span className="text-lg font-medium">Tidak ada pengajuan izin/sakit yang menunggu verifikasi.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        leaveRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-slate-900">{req.tanggal}</div>
                                                    <div className="text-xs text-slate-500">{req.workcode_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-900">{req.participant_name}</div>
                                                    <div className="text-xs text-slate-500">{req.participant_nip}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize mb-1
                                                        ${req.tipe === 'izin' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                                                        {req.tipe}
                                                    </div>
                                                    <p className="text-sm text-slate-700 mt-1 max-w-xs truncate" title={req.alasan}>
                                                        {req.alasan}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {req.bukti_url ? (
                                                        <a href={req.bukti_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                                            </svg>
                                                            Lihat Lampiran
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">Tidak ada bukti</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                                        ${req.status_approval === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                          req.status_approval === 'rejected' ? 'bg-red-100 text-red-800' :
                                                          'bg-slate-100 text-slate-800'}`}>
                                                        {req.status_approval}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {req.status_approval === 'pending' && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleApprove(req.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(req.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center px-3 py-1.5 bg-white text-red-600 font-bold border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
