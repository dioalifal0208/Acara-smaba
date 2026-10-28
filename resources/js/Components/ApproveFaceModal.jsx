import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ImageOff } from 'lucide-react';
import { Button, Dialog, useToast } from '@/ui';

/** Tinjau pendaftaran wajah peserta: setujui atau tolak. */
export default function ApproveFaceModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const form = useForm();
    const [imgError, setImgError] = useState(false);
    const [action, setAction] = useState(null);

    const submit = (kind) => {
        setAction(kind);
        form.post(route(`participants.face.${kind}`, participant.id), {
            onSuccess: () => {
                toast.success(kind === 'approve' ? 'Wajah disetujui.' : 'Wajah ditolak.');
                onSuccess();
            },
        });
    };

    return (
        <Dialog
            open
            onClose={onClose}
            title="Tinjau wajah"
            description={participant.nama}
            size="sm"
            footer={
                <>
                    <Button variant="danger" onClick={() => submit('reject')} disabled={form.processing} loading={form.processing && action === 'reject'}>Tolak</Button>
                    <Button variant="primary" onClick={() => submit('approve')} disabled={form.processing} loading={form.processing && action === 'approve'}>Setujui</Button>
                </>
            }
        >
            <FacePhoto src={participant.photo_url} alt={`Foto wajah ${participant.nama}`} failed={imgError} onError={() => setImgError(true)} />
            <p className="mt-4 text-center text-sm text-ink-2">Pastikan wajah terlihat jelas dan sesuai orangnya sebelum disetujui.</p>
        </Dialog>
    );
}

export function FacePhoto({ src, alt, failed, onError }) {
    return src && !failed ? (
        <img src={src} alt={alt} className="mx-auto h-56 w-56 rounded-xl border border-line object-cover" onError={onError} />
    ) : (
        <div className="mx-auto flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 p-4 text-center text-sm text-ink-2">
            <ImageOff className="h-8 w-8 text-ink-3" aria-hidden="true" />
            {failed ? 'Foto gagal dimuat' : 'Tidak ada foto'}
        </div>
    );
}
