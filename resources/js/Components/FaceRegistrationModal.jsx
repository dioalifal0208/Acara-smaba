import { useCallback, useState } from 'react';
import axios from 'axios';
import { useToast } from './Toast';
import FaceEnrollmentCamera from '@/Components/FaceEnrollmentCamera';

export default function FaceRegistrationModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCamera, setShowCamera] = useState(!participant.has_face);

    const handleComplete = useCallback(async ({ descriptors, photo }) => {
        const response = await axios.post(`/api/participants/${participant.id}/face`, { descriptor: descriptors, photo });
        toast.success(response.data.message);
        onSuccess(); // tutup modal & muat ulang daftar
    }, [participant.id, onSuccess, toast]);

    const handleDelete = async () => {
        if (!confirm('Yakin ingin menghapus data wajah peserta ini?')) return;

        setIsProcessing(true);
        try {
            const response = await axios.delete(`/api/participants/${participant.id}/face`);
            toast.success(response.data.message);
            onSuccess();
        } catch {
            toast.error('Gagal menghapus wajah.');
        } finally {
            setIsProcessing(false);
        }
    };

    const hasFace = participant.has_face;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full sm:max-w-md animate-[fadeIn_0.2s_ease-out] sm:rounded-xl rounded-none bg-white border border-slate-200 p-6 shadow-2xl flex flex-col max-h-screen sm:max-h-[95dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800">Detail & Registrasi Wajah</h3>
                        <p className="text-sm text-slate-500 font-semibold mt-0.5">{participant.nama} - {participant.nis_nip}</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Status Section */}
                <div className="mb-4 flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Status Wajah:</span>
                    {hasFace ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Terdaftar
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Belum Terdaftar
                        </span>
                    )}
                </div>

                {/* Camera Section: pemindaian wajah depan terpandu, tersimpan otomatis setelah selesai */}
                {showCamera ? (
                    <>
                        <FaceEnrollmentCamera onComplete={handleComplete} className="rounded-2xl" subjectLabel="peserta" />
                        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                            Minta peserta mengikuti instruksi di layar. Data wajah tersimpan otomatis setelah semua langkah selesai.
                        </p>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        disabled={isProcessing}
                        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Daftarkan Ulang Wajah
                    </button>
                )}

                {/* Actions */}
                {hasFace && (
                    <div className="mt-5 flex gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 transition-colors hover:bg-red-100 focus:outline-none disabled:opacity-50"
                        >
                            Hapus Data Wajah
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
