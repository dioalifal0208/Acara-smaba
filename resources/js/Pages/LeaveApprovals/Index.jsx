import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Dialog, EmptyState, PageHeader, Segmented, StatusPill, cx, useToast } from '@/ui';
import useMediaQuery from '@/ui/useMediaQuery';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, ExternalLink, FileText, Inbox, Paperclip } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const FILTERS = [
    { value: 'pending', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'all', label: 'Semua' },
];

const EMPTY = {
    pending: { icon: CheckCircle2, title: 'Tidak ada yang menunggu', description: 'Semua pengajuan izin sudah diproses. Pengajuan baru dari aplikasi Android muncul di sini.' },
    approved: { icon: Inbox, title: 'Belum ada yang disetujui' },
    rejected: { icon: Inbox, title: 'Belum ada yang ditolak' },
    all: { icon: Inbox, title: 'Belum ada pengajuan izin', description: 'Peserta mengajukan izin lewat aplikasi Android atau halaman peserta.' },
};

/**
 * Antrean perizinan ala kotak masuk: daftar di kiri, detail & keputusan di kanan (layar lebar),
 * atau detail dalam dialog (HP). Setelah memutuskan, pengajuan menunggu berikutnya langsung terbuka.
 */
export default function LeaveApprovalsIndex({ leaveRequests }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const wide = useMediaQuery('(min-width: 1024px)');
    const [filter, setFilter] = useState('pending');
    const [selectedId, setSelectedId] = useState(null);
    const [busy, setBusy] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const counts = useMemo(() => leaveRequests.reduce(
        (result, request) => ({ ...result, [request.status_approval]: (result[request.status_approval] || 0) + 1 }),
        { pending: 0, approved: 0, rejected: 0 },
    ), [leaveRequests]);

    const rows = filter === 'all' ? leaveRequests : leaveRequests.filter((request) => request.status_approval === filter);

    // Layar lebar: selalu ada yang terbuka (yang dipilih, atau yang pertama di daftar).
    const selected = rows.find((request) => request.id === selectedId) ?? (wide ? rows[0] : null);

    const decide = (request, action) => {
        const index = rows.indexOf(request);
        setBusy(action);
        router.post(route(`admin.leave.${action}`, request.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Di filter Menunggu, lanjut ke pengajuan berikutnya di posisi yang sama (yang diputuskan keluar dari daftar).
                if (!wide) setSelectedId(null);
                else if (filter === 'pending') {
                    const remaining = rows.filter((r) => r.id !== request.id);
                    setSelectedId(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
                }
            },
            onFinish: () => setBusy(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Perizinan" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Perizinan"
                    description="Tinjau keterangan dan lampiran. Status presensi baru berubah setelah pengajuan disetujui."
                />

                <Segmented
                    label="Filter status pengajuan"
                    value={filter}
                    onChange={(value) => { setFilter(value); setSelectedId(null); }}
                    options={FILTERS.map((f) => ({ ...f, count: f.value === 'all' ? leaveRequests.length : counts[f.value] }))}
                />

                {rows.length === 0 ? (
                    <Card><EmptyState {...EMPTY[filter]} /></Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-5">
                        <Card className="overflow-hidden lg:col-span-2">
                            <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto" aria-label="Daftar pengajuan">
                                {rows.map((request) => (
                                    <li key={request.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(request.id)}
                                            aria-current={selected?.id === request.id ? 'true' : undefined}
                                            className={cx(
                                                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                                                selected?.id === request.id ? 'bg-accent-soft' : 'hover:bg-surface-2/60',
                                            )}
                                        >
                                            <Initial name={request.participant_name} />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-start justify-between gap-2">
                                                    <span className="truncate text-sm font-medium text-ink">{request.participant_name}</span>
                                                    <span className="shrink-0 text-xs tabular-nums text-ink-2">{request.created_at}</span>
                                                </span>
                                                <span className="mt-0.5 block truncate text-sm text-ink-2">
                                                    {request.tipe_izin_label}{request.jenis_izin_label ? ` · ${request.jenis_izin_label}` : ''} · {request.tanggal}
                                                </span>
                                                {filter === 'all' && <StatusPill status={request.status_approval} className="mt-1.5" />}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {wide && selected && (
                            <Card className="lg:col-span-3">
                                <LeaveDetail request={selected} busy={busy} onDecide={decide} />
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {!wide && (
                <Dialog open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.participant_name ?? ''} description={selected?.participant_nip} size="lg">
                    {selected && <LeaveDetail request={selected} busy={busy} onDecide={decide} compact />}
                </Dialog>
            )}
        </AuthenticatedLayout>
    );
}

function LeaveDetail({ request, busy, onDecide, compact = false }) {
    const pending = request.status_approval === 'pending';

    return (
        <article className="flex h-full flex-col">
            <div className={cx('flex-1 space-y-5', !compact && 'p-6')}>
                {!compact && (
                    <header className="flex items-start gap-3">
                        <Initial name={request.participant_name} large />
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold text-ink">{request.participant_name}</h2>
                            <p className="text-sm tabular-nums text-ink-2">{request.participant_nip}</p>
                        </div>
                        <StatusPill status={request.status_approval} />
                    </header>
                )}
                {compact && <StatusPill status={request.status_approval} />}

                <dl className="grid gap-4 sm:grid-cols-2">
                    <Detail icon={FileText} label="Jenis">
                        {request.tipe_izin_label}{request.jenis_izin_label ? ` · ${request.jenis_izin_label}` : ''}
                    </Detail>
                    <Detail icon={CalendarDays} label="Tanggal">{request.tanggal}</Detail>
                    <Detail label="Workcode">{request.workcode_name}</Detail>
                    <Detail label="Diajukan">{request.created_at}</Detail>
                </dl>

                <div>
                    <h3 className="text-sm font-medium text-ink-2">Keterangan</h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{request.keterangan || 'Tanpa keterangan.'}</p>
                </div>

                <Attachment url={request.bukti_url} />
            </div>

            <div className={cx('flex flex-col-reverse gap-2 border-t border-line sm:flex-row sm:items-center sm:justify-end', compact ? 'mt-5 pt-4' : 'px-6 py-4')}>
                {pending ? (
                    <>
                        <p className="text-xs text-ink-2 sm:mr-auto">Keputusan tidak bisa dibatalkan.</p>
                        <Button variant="danger" onClick={() => onDecide(request, 'reject')} disabled={Boolean(busy)} loading={busy === 'reject'}>Tolak</Button>
                        <Button variant="primary" onClick={() => onDecide(request, 'approve')} disabled={Boolean(busy)} loading={busy === 'approve'}>Setujui izin</Button>
                    </>
                ) : (
                    <p className="text-sm text-ink-2">Pengajuan ini sudah {request.status_approval === 'approved' ? 'disetujui' : 'ditolak'}.</p>
                )}
            </div>
        </article>
    );
}

function Detail({ icon: Icon, label, children }) {
    return (
        <div>
            <dt className="flex items-center gap-1.5 text-sm text-ink-2">
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">{children}</dd>
        </div>
    );
}

/** Pratinjau lampiran bila berupa gambar; selain itu (PDF dll.) cukup tautan untuk membukanya. */
function Attachment({ url }) {
    const [isImage, setIsImage] = useState(true);

    if (!url) {
        return <p className="flex items-center gap-1.5 text-sm text-ink-2"><Paperclip className="h-4 w-4" aria-hidden="true" />Tanpa lampiran</p>;
    }

    return (
        <div>
            <h3 className="text-sm font-medium text-ink-2">Lampiran</h3>
            {isImage && (
                <a href={url} target="_blank" rel="noreferrer" className="mt-2 block w-fit">
                    <img src={url} alt="Lampiran pengajuan izin" className="max-h-72 rounded-lg border border-line object-contain" onError={() => setIsImage(false)} />
                </a>
            )}
            <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Buka lampiran di tab baru
            </a>
        </div>
    );
}

function Initial({ name, large = false }) {
    return (
        <span className={cx('flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2', large ? 'h-12 w-12 text-lg' : 'h-9 w-9 text-sm')} aria-hidden="true">
            {(name || '?').charAt(0).toUpperCase()}
        </span>
    );
}
