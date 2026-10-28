import { useCallback, useState } from 'react';
import axios from 'axios';
import { Button, Dialog, StatusPill, useConfirm, useToast } from '@/ui';
import FaceEnrollmentCamera from '@/Components/FaceEnrollmentCamera';

/** Daftarkan (ulang) wajah peserta oleh admin lewat kamera, atau hapus data wajahnya. */
export default function FaceRegistrationModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCamera, setShowCamera] = useState(!participant.has_face);
    const hasFace = participant.has_face;

    const handleComplete = useCallback(async ({ descriptors, photo }) => {
        const response = await axios.post(`/api/participants/${participant.id}/face`, { descriptor: descriptors, photo });
        toast.success(response.data.message);
        onSuccess(); // tutup modal & muat ulang data
    }, [participant.id, onSuccess, toast]);

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Hapus data wajah?',
            message: `${participant.nama} tidak bisa presensi wajah sampai wajahnya didaftarkan lagi.`,
            confirmText: 'Hapus data wajah',
        });
        if (!confirmed) return;

        setIsProcessing(true);
        try {
            const response = await axios.delete(`/api/participants/${participant.id}/face`);
            toast.success(response.data.message);
            onSuccess();
        } catch {
            toast.error('Data wajah gagal dihapus. Periksa koneksi lalu coba lagi.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog
            open
            onClose={onClose}
            title={hasFace ? 'Perbarui wajah' : 'Daftarkan wajah'}
            description={`${participant.nama} · ${participant.nis_nip}`}
            footer={hasFace && (
                <Button variant="danger" onClick={handleDelete} loading={isProcessing}>Hapus data wajah</Button>
            )}
        >
            <div className="mb-4 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                <span className="text-ink-2">Status wajah</span>
                <StatusPill status={hasFace ? 'approved' : 'belum'} label={hasFace ? 'Terdaftar' : 'Belum terdaftar'} />
            </div>

            {showCamera ? (
                <>
                    {/* Pemindaian wajah depan terpandu, tersimpan otomatis setelah selesai */}
                    <FaceEnrollmentCamera onComplete={handleComplete} className="rounded-xl" subjectLabel="peserta" />
                    <p className="mt-3 text-center text-sm text-ink-2">
                        Minta peserta mengikuti instruksi di layar. Data wajah tersimpan otomatis setelah semua langkah selesai.
                    </p>
                </>
            ) : (
                <Button variant="primary" className="w-full" onClick={() => setShowCamera(true)} disabled={isProcessing}>
                    Daftarkan ulang wajah
                </Button>
            )}
        </Dialog>
    );
}
