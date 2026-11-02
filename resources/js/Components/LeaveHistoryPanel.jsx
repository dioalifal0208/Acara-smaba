import { Button, Segmented, Skeleton, StatusPill } from '@/ui';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

const FILTERS = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
];

/**
 * Riwayat izin satu peserta (semua status, terbaru di atas). Hanya untuk dilihat: pengajuan yang menunggu
 * ditinjau dan diputuskan di halaman Perizinan.
 */
export default function LeaveHistoryPanel({ participant }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        let active = true;
        setError(null);
        window.axios.get(route('participants.leave-history', participant.id))
            .then(({ data: response }) => active && setData(response))
            .catch(() => active && setError('Riwayat izin gagal dimuat. Muat ulang halaman untuk mencoba lagi.'));

        return () => { active = false; };
    }, [participant.id]);

    if (error) return <p className="py-8 text-center text-sm font-medium text-danger">{error}</p>;

    if (data === null) {
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Memuat riwayat izin">
                <Skeleton className="h-16 w-full" />
                {[0, 1].map((i) => <div key={i} className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-64" /></div>)}
            </div>
        );
    }

    if (data.items.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm font-medium text-ink">Belum pernah mengajukan izin</p>
                <p className="mt-1 text-sm text-ink-2">Pengajuan izin dari aplikasi Android atau halaman peserta akan tercatat di sini.</p>
            </div>
        );
    }

    const { summary } = data;
    const items = filter === 'all' ? data.items : data.items.filter((item) => item.status_approval === filter);

    return (
        <div className="space-y-4">
            {/* Di kolom setengah layar (lg ke atas) tetap 2x2 agar label tidak terlipat. */}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <Stat label="Menunggu" value={summary.pending} />
                <Stat label="Disetujui" value={summary.approved} />
                <Stat label="Ditolak" value={summary.rejected} />
                <Stat label="Hari izin disetujui" value={summary.approved_days} />
            </dl>

            <Segmented
                label="Filter status riwayat izin"
                value={filter}
                onChange={setFilter}
                options={FILTERS.map((f) => ({ ...f, count: f.value === 'all' ? data.items.length : summary[f.value] }))}
            />

            {items.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-2">Tidak ada pengajuan dengan status ini.</p>
            ) : (
                <ol className="divide-y divide-line">
                    {items.map((item) => <LeaveHistoryItem key={item.id} item={item} />)}
                </ol>
            )}
        </div>
    );
}

function LeaveHistoryItem({ item }) {
    return (
        <li className="space-y-2 py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                        <CalendarDays className="h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
                        {item.tanggal}
                        {item.days > 1 && <span className="font-normal tabular-nums text-ink-2">({item.days} hari)</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-2">
                        {item.tipe_izin_label}{item.jenis_izin_label ? ` · ${item.jenis_izin_label}` : ''} · {item.workcode_name}
                    </p>
                </div>
                <StatusPill status={item.status_approval} />
            </div>

            {item.keterangan && <p className="whitespace-pre-line text-sm text-ink">{item.keterangan}</p>}

            {item.status_approval === 'rejected' && item.alasan_penolakan && (
                <p className="rounded-lg bg-status-alpha-soft px-3 py-2 text-sm text-ink">
                    <span className="font-medium text-status-alpha">Alasan penolakan: </span>{item.alasan_penolakan}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="tabular-nums text-ink-2">Diajukan {item.created_at}</span>
                {item.bukti_url && (
                    <a href={item.bukti_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 font-medium text-accent hover:underline">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Lampiran
                    </a>
                )}
                {item.status_approval === 'pending' && (
                    <Button size="sm" variant="primary" href={route('admin.leave.index', { id: item.id })} className="sm:ml-auto">
                        Tinjau di Perizinan
                    </Button>
                )}
            </div>
        </li>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-lg bg-surface-2 px-3 py-2">
            <dt className="text-xs text-ink-2">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums text-ink">{value}</dd>
        </div>
    );
}
