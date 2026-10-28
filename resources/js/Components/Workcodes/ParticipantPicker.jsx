import { Button, Checkbox, Dialog, SearchField } from '@/ui';
import { useState } from 'react';

/**
 * Pilih peserta yang boleh presensi di workcode ini. Tanpa centang = terbuka untuk semua peserta.
 */
export default function ParticipantPicker({ open, onClose, participants, selected, onChange }) {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();
    const visible = participants.filter((p) => !q || `${p.nama} ${p.nis_nip || ''}`.toLowerCase().includes(q));
    const visibleIds = visible.map((p) => p.id);
    const allVisibleSelected = visible.length > 0 && visibleIds.every((id) => selected.includes(id));

    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    const toggleVisible = () => onChange(
        allVisibleSelected ? selected.filter((id) => !visibleIds.includes(id)) : [...new Set([...selected, ...visibleIds])],
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="Peserta workcode"
            description="Hanya peserta yang dicentang yang bisa presensi. Tanpa centang, semua peserta boleh."
            size="2xl"
            footer={
                <>
                    <p className="text-sm text-ink-2 sm:mr-auto">
                        {selected.length === 0 ? 'Terbuka untuk semua peserta' : `${selected.length} dari ${participants.length} peserta dipilih`}
                    </p>
                    {selected.length > 0 && <Button onClick={() => onChange([])}>Kosongkan</Button>}
                    <Button variant="primary" onClick={onClose}>Selesai</Button>
                </>
            }
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchField value={query} onChange={setQuery} label="Cari peserta" placeholder="Cari nama atau NIP…" className="sm:flex-1" />
                <Button onClick={toggleVisible} disabled={visible.length === 0}>
                    {allVisibleSelected ? 'Batal pilih yang tampil' : 'Pilih semua yang tampil'}
                </Button>
            </div>

            {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-2">Tidak ada peserta yang cocok.</p>
            ) : (
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                    {visible.map((p) => (
                        <li key={p.id} className="flex items-center rounded-lg pr-3 hover:bg-surface-2/60">
                            <Checkbox checked={selected.includes(p.id)} onChange={() => toggle(p.id)} label={p.nama} />
                            <button type="button" onClick={() => toggle(p.id)} className="min-w-0 flex-1 py-2 text-left" tabIndex={-1}>
                                <span className="block truncate text-sm font-medium text-ink">{p.nama}</span>
                                <span className="block truncate text-xs tabular-nums text-ink-2">{p.nis_nip || p.status || 'Tanpa NIP'}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Dialog>
    );
}
