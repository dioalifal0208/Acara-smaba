import { useEffect, useState } from 'react';

const formatDate = (iso) => new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const sourceTone = {
    registration: 'bg-sky-50 text-sky-700 border-sky-100',
    photo_change: 'bg-amber-50 text-amber-700 border-amber-100',
    admin: 'bg-brand-50 text-brand-700 border-brand-100',
};

/** Riwayat wajah peserta yang pernah disetujui admin, terbaru di atas. */
export default function FaceHistoryModal({ participant, onClose }) {
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        let active = true;
        window.axios.get(route('participants.face-history', participant.id))
            .then(({ data }) => active && setItems(data.items))
            .catch(() => active && setError('Riwayat wajah tidak dapat dimuat. Coba lagi.'));

        return () => { active = false; };
    }, [participant.id]);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && (preview ? setPreview(null) : onClose());
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [preview, onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="flex max-h-[85vh] w-full max-w-lg animate-[fadeIn_0.2s_ease-out] flex-col rounded-lg border border-slate-100 bg-white shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800">Riwayat Wajah</h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{participant.nama} · {participant.nis_nip}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    {error && <p className="py-10 text-center text-sm font-medium text-rose-600">{error}</p>}
                    {!error && items === null && <p className="py-10 text-center text-sm text-slate-400">Memuat riwayat…</p>}
                    {items?.length === 0 && (
                        <div className="py-10 text-center">
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
                </div>
            </div>

            {preview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-6" onClick={(e) => { e.stopPropagation(); setPreview(null); }}>
                    <figure className="max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
                        <img src={preview.photo_url} alt={`Wajah ${participant.nama}`} className="max-h-[70vh] w-full rounded-xl object-contain shadow-2xl" />
                        <figcaption className="mt-3 text-sm font-medium text-white">
                            {preview.source_label}{preview.approved_at && ` · ${formatDate(preview.approved_at)}`}
                        </figcaption>
                    </figure>
                </div>
            )}
        </div>
    );
}
