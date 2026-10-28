import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Dialog, EmptyState, Field, PageHeader, Segmented, StatusPill, Textarea, cx, useToast } from '@/ui';
import useMediaQuery from '@/ui/useMediaQuery';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, ExternalLink, FileText, Inbox, Paperclip } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

// Alasan penolakan yang sering dipakai; tetap bisa diubah sebelum dikirim.
const REJECT_PRESETS = ['Dokumen tidak terbaca', 'Dokumen tidak sesuai alasan izin', 'Tanggal tidak sesuai dokumen', 'Diajukan melewati batas waktu'];

// Persetujuan baru dikirim ke server setelah jeda ini, agar salah klik bisa diurungkan.
const UNDO_SECONDS = 6;

const isTyping = (target) => target?.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"]');

/** Kirim persetujuan yang masih tertunda saat halaman ditinggalkan (keepalive tetap jalan saat pindah halaman). */
function flushApproval(id) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    fetch(route('admin.leave.approve', id), {
        method: 'POST',
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'X-CSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest', Accept: 'text/html' },
    }).catch(() => {});
}

/**
 * Antrean perizinan ala kotak masuk: daftar di kiri, detail & keputusan di kanan (layar lebar),
 * atau detail dalam dialog (HP). Setelah memutuskan, pengajuan menunggu berikutnya langsung terbuka.
 * Setujui bisa diurungkan beberapa detik; Tolak wajib beralasan. Layar lebar: J/K pindah, A setujui, T tolak.
 */
export default function LeaveApprovalsIndex({ leaveRequests }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const wide = useMediaQuery('(min-width: 1024px)');
    const [filter, setFilter] = useState('pending');
    const [selectedId, setSelectedId] = useState(null);
    const [busy, setBusy] = useState(null);
    const [rejecting, setRejecting] = useState(false);
    const [queued, setQueued] = useState(null); // { request, secondsLeft }
    const queuedRef = useRef(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const counts = useMemo(() => leaveRequests.reduce(
        (result, request) => ({ ...result, [request.status_approval]: (result[request.status_approval] || 0) + 1 }),
        { pending: 0, approved: 0, rejected: 0 },
    ), [leaveRequests]);

    // Pengajuan yang sedang menunggu jeda urungkan disembunyikan dari daftar.
    const visible = queued ? leaveRequests.filter((request) => request.id !== queued.request.id) : leaveRequests;
    const rows = filter === 'all' ? visible : visible.filter((request) => request.status_approval === filter);

    // Layar lebar: selalu ada yang terbuka (yang dipilih, atau yang pertama di daftar).
    const selected = rows.find((request) => request.id === selectedId) ?? (wide ? rows[0] : null);

    useEffect(() => setRejecting(false), [selected?.id]);

    // Setelah memutuskan, buka pengajuan berikutnya di posisi yang sama.
    const advanceFrom = useCallback((request) => {
        if (!wide) {
            setSelectedId(null);
            return;
        }
        const index = rows.findIndex((r) => r.id === request.id);
        const remaining = rows.filter((r) => r.id !== request.id);
        setSelectedId(remaining[Math.min(Math.max(index, 0), remaining.length - 1)]?.id ?? null);
    }, [rows, wide]);

    const commitApproval = useCallback((request) => {
        queuedRef.current = null;
        setQueued(null);
        // async: tidak membatalkan (dan tidak dibatalkan) kunjungan lain, mis. tolak yang dikirim bersamaan.
        router.post(route('admin.leave.approve', request.id), {}, { preserveScroll: true, async: true });
    }, []);

    const approve = (request) => {
        if (queuedRef.current) commitApproval(queuedRef.current);
        queuedRef.current = request;
        setQueued({ request, secondsLeft: UNDO_SECONDS });
        advanceFrom(request);
    };

    const undo = () => {
        const request = queuedRef.current;
        queuedRef.current = null;
        setQueued(null);
        if (request) setSelectedId(request.id);
    };

    // Hitung mundur jeda urungkan, lalu kirim ke server.
    useEffect(() => {
        if (!queued) return undefined;
        if (queued.secondsLeft <= 0) {
            commitApproval(queued.request);
            return undefined;
        }
        const timer = setTimeout(() => setQueued((q) => q && { ...q, secondsLeft: q.secondsLeft - 1 }), 1000);
        return () => clearTimeout(timer);
    }, [queued, commitApproval]);

    // Halaman ditutup/berpindah sebelum jeda habis: persetujuan tetap terkirim.
    useEffect(() => {
        const flush = () => {
            if (queuedRef.current) {
                flushApproval(queuedRef.current.id);
                queuedRef.current = null;
            }
        };
        window.addEventListener('pagehide', flush);
        const stopListening = router.on('before', (event) => {
            const { method, url } = event.detail.visit;
            if (queuedRef.current && method === 'get' && url.pathname !== window.location.pathname) flush();
        });
        return () => {
            window.removeEventListener('pagehide', flush);
            stopListening();
            flush();
        };
    }, []);

    const reject = (request, reason) => {
        if (queuedRef.current) commitApproval(queuedRef.current);
        setBusy('reject');
        router.post(route('admin.leave.reject', request.id), { alasan_penolakan: reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejecting(false);
                if (filter === 'pending') advanceFrom(request);
            },
            onError: (errors) => toast.error(errors.alasan_penolakan || 'Pengajuan gagal ditolak.'),
            onFinish: () => setBusy(null),
        });
    };

    // Pintasan keyboard di layar lebar.
    useEffect(() => {
        if (!wide) return undefined;
        const onKey = (event) => {
            if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
            const key = event.key.toLowerCase();
            const index = rows.findIndex((r) => r.id === selected?.id);
            if (key === 'j' || key === 'k') {
                event.preventDefault();
                const next = rows[Math.min(Math.max(index + (key === 'j' ? 1 : -1), 0), rows.length - 1)];
                if (next) setSelectedId(next.id);
            } else if (selected?.status_approval === 'pending' && !busy && key === 'a') {
                event.preventDefault();
                approve(selected);
            } else if (selected?.status_approval === 'pending' && !busy && key === 't') {
                event.preventDefault();
                setRejecting(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const detailProps = { busy, rejecting, onStartReject: () => setRejecting(true), onCancelReject: () => setRejecting(false), onApprove: approve, onReject: reject };

    return (
        <AuthenticatedLayout>
            <Head title="Perizinan" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Perizinan"
                    description="Tinjau keterangan dan lampiran. Status presensi baru berubah setelah pengajuan disetujui."
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Segmented
                        label="Filter status pengajuan"
                        value={filter}
                        onChange={(value) => { setFilter(value); setSelectedId(null); }}
                        options={FILTERS.map((f) => ({ ...f, count: f.value === 'all' ? visible.length : counts[f.value] - (queued && f.value === 'pending' ? 1 : 0) }))}
                    />
                    {wide && (
                        <p className="text-sm text-ink-2">
                            Pintasan: <Kbd>J</Kbd>/<Kbd>K</Kbd> pindah · <Kbd>A</Kbd> setujui · <Kbd>T</Kbd> tolak
                        </p>
                    )}
                </div>

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
                                {/* Diumumkan ke pembaca layar saat pengajuan lain dibuka. */}
                                <p className="sr-only" aria-live="polite">Pengajuan {selected.participant_name} terbuka.</p>
                                <LeaveDetail request={selected} {...detailProps} />
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {!wide && (
                <Dialog open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.participant_name ?? ''} description={selected?.participant_nip} size="lg">
                    {selected && <LeaveDetail request={selected} {...detailProps} compact />}
                </Dialog>
            )}

            {queued && (
                <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-app shadow-xl" role="status">
                    <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <p className="min-w-0 flex-1">
                        Izin <span className="font-semibold">{queued.request.participant_name}</span> disetujui
                        <span className="tabular-nums opacity-80"> · {queued.secondsLeft} dtk</span>
                    </p>
                    <button type="button" onClick={undo} className="-my-1 h-10 shrink-0 rounded-lg px-3 font-semibold underline-offset-2 hover:underline">
                        Urungkan
                    </button>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function LeaveDetail({ request, busy, rejecting, onStartReject, onCancelReject, onApprove, onReject, compact = false }) {
    const pending = request.status_approval === 'pending';
    const [reason, setReason] = useState('');
    const reasonRef = useRef(null);

    useEffect(() => setReason(''), [request.id]);
    useEffect(() => {
        if (rejecting) reasonRef.current?.focus();
    }, [rejecting]);

    const submitReject = (event) => {
        event.preventDefault();
        if (reason.trim()) onReject(request, reason.trim());
    };

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

                {request.status_approval === 'rejected' && request.alasan_penolakan && (
                    <div className="rounded-xl bg-status-alpha-soft p-4">
                        <h3 className="text-sm font-medium text-status-alpha">Alasan penolakan</h3>
                        <p className="mt-1 whitespace-pre-line text-sm text-ink">{request.alasan_penolakan}</p>
                    </div>
                )}
            </div>

            {pending && rejecting ? (
                <form onSubmit={submitReject} className={cx('space-y-3 border-t border-line', compact ? 'mt-5 pt-4' : 'px-6 py-4')}>
                    <Field label="Alasan penolakan" required hint="Peserta melihat alasan ini di riwayat izinnya.">
                        <Textarea ref={reasonRef} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
                    </Field>
                    <div className="flex flex-wrap gap-2" aria-label="Alasan cepat">
                        {REJECT_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setReason(preset)}
                                className="h-10 rounded-full border border-line-strong px-3 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button onClick={onCancelReject} disabled={Boolean(busy)}>Batal</Button>
                        <Button variant="danger" type="submit" disabled={!reason.trim()} loading={busy === 'reject'}>Tolak pengajuan</Button>
                    </div>
                </form>
            ) : (
                <div className={cx('flex flex-col-reverse gap-2 border-t border-line sm:flex-row sm:items-center sm:justify-end', compact ? 'mt-5 pt-4' : 'px-6 py-4')}>
                    {pending ? (
                        <>
                            <Button variant="danger-outline" onClick={onStartReject} disabled={Boolean(busy)} className="sm:mr-auto">Tolak…</Button>
                            <Button variant="primary" onClick={() => onApprove(request)} disabled={Boolean(busy)}>Setujui izin</Button>
                        </>
                    ) : (
                        <p className="text-sm text-ink-2">Pengajuan ini sudah {request.status_approval === 'approved' ? 'disetujui' : 'ditolak'}.</p>
                    )}
                </div>
            )}
        </article>
    );
}

function Kbd({ children }) {
    return <kbd className="rounded border border-line-strong bg-surface px-1.5 py-0.5 font-sans text-xs text-ink">{children}</kbd>;
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
            <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-accent hover:underline">
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
