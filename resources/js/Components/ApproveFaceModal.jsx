import { useForm } from '@inertiajs/react';
import { useToast } from './Toast';

export default function ApproveFaceModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const form = useForm();

    const handleApprove = (e) => {
        e.preventDefault();
        form.post(route('participants.face.approve', participant.id), {
            onSuccess: () => {
                toast.success('Wajah disetujui.');
                onSuccess();
            },
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        form.post(route('participants.face.reject', participant.id), {
            onSuccess: () => {
                toast.success('Wajah ditolak.');
                onSuccess();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out] rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800">Review Wajah</h3>
                        <p className="text-sm text-slate-500 font-semibold mt-0.5">{participant.nama}</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                <div className="mb-6 flex flex-col items-center">
                    {participant.photo_url ? (
                        <img src={participant.photo_url} alt="Foto Wajah" className="w-48 h-48 object-cover rounded-2xl border-4 border-slate-100 shadow-md" />
                    ) : (
                        <div className="w-48 h-48 rounded-2xl bg-slate-100 border-4 border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                            Tidak ada foto
                        </div>
                    )}
                    <p className="text-xs text-slate-500 font-medium mt-4 text-center">Pastikan foto wajah terlihat jelas sebelum memberikan persetujuan.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReject}
                        disabled={form.processing}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-extrabold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                        Tolak
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={form.processing}
                        className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 disabled:opacity-50"
                    >
                        Setujui
                    </button>
                </div>
            </div>
        </div>
    );
}
