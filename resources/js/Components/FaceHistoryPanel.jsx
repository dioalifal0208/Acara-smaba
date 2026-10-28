import { Dialog, Skeleton, StatusPill } from '@/ui';
import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

const formatDate = (iso) => new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const sourceTone = { registration: 'izin', photo_change: 'telat', admin: 'netral' };

/** Riwayat wajah peserta yang pernah disetujui admin, terbaru di atas. `reloadKey` memuat ulang setelah wajah berubah. */
export default function FaceHistoryPanel({ participant, reloadKey }) {
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        let active = true;
        setError(null);
        window.axios.get(route('participants.face-history', participant.id))
            .then(({ data }) => active && setItems(data.items))
            .catch(() => active && setError('Riwayat wajah gagal dimuat. Muat ulang halaman untuk mencoba lagi.'));

        return () => { active = false; };
    }, [participant.id, reloadKey]);

    if (error) return <p className="py-8 text-center text-sm font-medium text-danger">{error}</p>;

    if (items === null) {
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Memuat riwayat wajah">
                {[0, 1].map((i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-20 w-20" />
                        <div className="flex-1 space-y-2 pt-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-48" /></div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm font-medium text-ink">Belum ada wajah yang disetujui</p>
                <p className="mt-1 text-sm text-ink-2">Riwayat terisi setiap kali admin menyetujui pendaftaran wajah atau ganti foto.</p>
            </div>
        );
    }

    return (
        <>
            <ol className="space-y-4">
                {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                        {item.photo_url ? (
                            <button
                                type="button"
                                onClick={() => setPreview(item)}
                                className="shrink-0 rounded-lg"
                                aria-label={`Perbesar foto ${item.source_label}`}
                            >
                                <img
                                    src={item.photo_url}
                                    alt=""
                                    loading="lazy"
                                    className={`h-20 w-20 rounded-lg object-cover ${item.is_active ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'border border-line'}`}
                                />
                            </button>
                        ) : (
                            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong bg-surface-2 px-1 text-center text-xs text-ink-2">
                                <ImageOff className="h-4 w-4" aria-hidden="true" />
                                Tidak tersimpan
                            </div>
                        )}
                        <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <StatusPill tone={sourceTone[item.source] ?? 'netral'} label={item.source_label} icon={null} />
                                {item.is_active && <StatusPill status="approved" label="Aktif" />}
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-ink">
                                {item.approved_at ? formatDate(item.approved_at) : 'Waktu tidak tercatat'}
                            </p>
                            <p className="mt-0.5 text-sm text-ink-2">
                                {item.approved_by ? `Disetujui oleh ${item.approved_by}` : item.approved_at ? 'Disetujui lewat sistem' : 'Sebelum riwayat wajah dicatat'}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            <Dialog
                open={Boolean(preview)}
                onClose={() => setPreview(null)}
                title={preview?.source_label ?? ''}
                description={preview?.approved_at ? formatDate(preview.approved_at) : undefined}
                size="md"
            >
                {preview && <img src={preview.photo_url} alt={`Wajah ${participant.nama}`} className="mx-auto max-h-[60vh] rounded-lg object-contain" />}
            </Dialog>
        </>
    );
}
