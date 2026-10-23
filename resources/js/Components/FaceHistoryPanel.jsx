import { useEffect, useState } from 'react';

const formatDate = (iso) => new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const sourceTone = {
    registration: 'bg-sky-50 text-sky-700 border-sky-100',
    photo_change: 'bg-amber-50 text-amber-700 border-amber-100',
    admin: 'bg-brand-50 text-brand-700 border-brand-100',
};

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
            .catch(() => active && setError('Riwayat wajah tidak dapat dimuat. Coba lagi.'));

        return () => { active = false; };
    }, [participant.id, reloadKey]);

    useEffect(() => {
        if (!preview) return undefined;
        const onKey = (e) => e.key === 'Escape' && setPreview(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [preview]);

    return (
        <>
            {error && <p className="py-8 text-center text-sm font-medium text-rose-600">{error}</p>}
            {!error && items === null && <p className="py-8 text-center text-sm text-slate-400">Memuat riwayat…</p>}
            {items?.length === 0 && (
                <div className="py-8 text-center">
                    <p className="text-sm font-medium text-slate-500">Belum ada wajah yang disetujui.</p>
                    <p className="mt-1 text-xs text-slate-400">Riwayat terisi setiap kali admin menyetujui pendaftaran wajah atau ganti foto.</p>
                </div>
            )}
            {items?.length > 0 && (
                <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[39px] before:top-2 before:w-px before:bg-slate-200">
                    {items.map((item) => (
                        <li key={item.id} className="relative flex gap-4">
                            {item.photo_url ? (
                                <button type="button" onClick={() => setPreview(item)} className="relative z-10 shrink-0 rounded-lg ring-4 ring-white focus:outline-none focus:ring-brand-200" title="Perbesar foto">
                                    <img src={item.photo_url} alt={`Wajah ${participant.nama}`} loading="lazy" className={`h-20 w-20 rounded-lg object-cover ${item.is_active ? 'border-2 border-brand-500' : 'border border-slate-200'}`} />
                                </button>
                            ) : (
                                <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-1 text-center text-[10px] leading-tight text-slate-400 ring-4 ring-white">
                                    Foto tidak tersimpan
                                </div>
                            )}
                            <div className="min-w-0 flex-1 pt-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${sourceTone[item.source] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>{item.source_label}</span>
                                    {item.is_active && <span className="inline-flex rounded-md bg-brand-gradient px-2 py-0.5 text-[11px] font-semibold text-white">Aktif</span>}
                                </div>
                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                    {item.approved_at ? formatDate(item.approved_at) : 'Waktu tidak tercatat'}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {item.approved_by ? `Disetujui oleh ${item.approved_by}` : item.approved_at ? 'Disetujui lewat sistem' : 'Sebelum riwayat wajah dicatat'}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            )}

            {preview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-6" onClick={() => setPreview(null)}>
                    <figure className="max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
                        <img src={preview.photo_url} alt={`Wajah ${participant.nama}`} className="max-h-[70vh] w-full rounded-xl object-contain shadow-2xl" />
                        <figcaption className="mt-3 text-sm font-medium text-white">
                            {preview.source_label}{preview.approved_at && ` · ${formatDate(preview.approved_at)}`}
                        </figcaption>
                    </figure>
                </div>
            )}
        </>
    );
}
