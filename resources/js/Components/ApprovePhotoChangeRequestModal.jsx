import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button, Dialog, Field, Textarea, useToast } from '@/ui';
import { FacePhoto } from './ApproveFaceModal';

/** Verifikasi pengajuan ganti foto wajah dari aplikasi peserta. */
export default function ApprovePhotoChangeRequestModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const form = useForm({ rejection_reason: '' });
    const [imgError, setImgError] = useState(false);
    const [action, setAction] = useState(null);
    const request = participant.pending_photo_change_request;

    const submit = (kind) => {
        setAction(kind);
        form.post(route(`photo-change-requests.${kind}`, request.id), {
            onSuccess: () => {
                toast.success(kind === 'approve' ? 'Foto baru disetujui.' : 'Pengajuan foto ditolak.');
                onSuccess();
            },
        });
    };

    return (
        <Dialog
            open
            onClose={onClose}
            title="Verifikasi foto baru"
            description={participant.nama}
            size="sm"
            footer={
                <>
                    <Button variant="danger" onClick={() => submit('reject')} disabled={form.processing} loading={form.processing && action === 'reject'}>Tolak</Button>
                    <Button variant="primary" onClick={() => submit('approve')} disabled={form.processing} loading={form.processing && action === 'approve'}>Setujui</Button>
                </>
            }
        >
            <FacePhoto src={request.photo_url} alt={`Foto pengajuan ${participant.nama}`} failed={imgError} onError={() => setImgError(true)} />
            <p className="mt-4 text-center text-sm text-ink-2">Foto aktif peserta tidak berubah sebelum Anda menyetujuinya.</p>
            <Field label="Alasan penolakan" hint="Opsional. Ditampilkan ke peserta bila ditolak." className="mt-4">
                <Textarea value={form.data.rejection_reason} onChange={(e) => form.setData('rejection_reason', e.target.value)} maxLength={500} />
            </Field>
        </Dialog>
    );
}
