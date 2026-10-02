import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useToast } from './Toast';

export default function ApprovePhotoChangeRequestModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const form = useForm({ rejection_reason: '' });
    const [imgError, setImgError] = useState(false);
    const request = participant.pending_photo_change_request;

    const submit = (action) => {
        form.post(route(`photo-change-requests.${action}`, request.id), {
            onSuccess: () => {
                toast.success(action === 'approve' ? 'Foto baru disetujui.' : 'Pengajuan foto ditolak.');
                onSuccess();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
            <div className="flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:max-w-sm sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800">Verifikasi Foto Baru</h3>
                        <p className="mt-0.5 text-sm font-semibold text-slate-500">{participant.nama}</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="mb-5 flex flex-col items-center">
                    {request.photo_url && !imgError ? (
                        <img src={request.photo_url} alt={`Foto pengajuan ${participant.nama}`} className="h-48 w-48 rounded-2xl border-4 border-amber-100 object-cover shadow-md" onError={() => setImgError(true)} />
                    ) : (
                        <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-4 border-slate-200 bg-slate-100 p-4 text-center text-xs font-bold text-slate-400">Foto pengajuan tidak dapat dimuat.</div>
                    )}
                    <p className="mt-4 text-center text-xs font-medium text-slate-500">Foto aktif peserta tidak akan berubah sebelum Anda menyetujuinya.</p>
                </div>

                <textarea value={form.data.rejection_reason} onChange={(event) => form.setData('rejection_reason', event.target.value)} maxLength="500" placeholder="Alasan penolakan (opsional)" className="mb-3 min-h-20 w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <div className="flex gap-3">
                    <button type="button" onClick={() => submit('reject')} disabled={form.processing} className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-extrabold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">Tolak</button>
                    <button type="button" onClick={() => submit('approve')} disabled={form.processing} className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 disabled:opacity-50">Setujui</button>
                </div>
            </div>
        </div>
    );
}
