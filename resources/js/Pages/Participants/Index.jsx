import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImportModal from '@/Components/ImportModal';
import {
    EMPLOYMENT_STATUSES, FaceStatus, ParticipantAvatar, isNonPermanentStatus, needsReview, nipLabel, STAFF_ID_HINT,
} from '@/Components/ParticipantBits';
import {
    Button, DataTable, Dialog, EmptyState, Field, Input, PageHeader, RowLink, SearchField, Section, Select,
    useConfirm, useToast,
} from '@/ui';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ChevronRight, FileUp, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const SORTS = {
    latest: (a, b) => b.id - a.id,
    oldest: (a, b) => a.id - b.id,
    'alpha-asc': (a, b) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }),
    'alpha-desc': (a, b) => b.nama.localeCompare(a.nama, 'id', { sensitivity: 'base' }),
};

const urlParam = (key) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(key) ?? '');

const normalize = (value) => (value || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

export default function ParticipantsIndex({ participants }) {
    const { flash } = usePage().props;
    const { url: pageUrl } = usePage();
    const { toast } = useToast();
    const confirm = useConfirm();

    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    // Filter dibaca dari & ditulis ke URL: tetap ada setelah kembali dari detail peserta dan bisa dibagikan.
    const [query, setQuery] = useState(() => urlParam('q'));
    const [statusFilter, setStatusFilter] = useState(() => urlParam('status'));
    const [sortBy, setSortBy] = useState(() => (SORTS[urlParam('sort')] ? urlParam('sort') : 'latest'));
    const [reviewOnly, setReviewOnly] = useState(() => urlParam('review') === 'pending');
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (statusFilter) params.set('status', statusFilter);
        if (sortBy !== 'latest') params.set('sort', sortBy);
        if (reviewOnly) params.set('review', 'pending');
        const next = `${window.location.pathname}${params.size ? `?${params}` : ''}`;
        if (next !== window.location.pathname + window.location.search) window.history.replaceState(window.history.state, '', next);
    }, [query, statusFilter, sortBy, reviewOnly]);

    const reviewCount = participants.filter(needsReview).length;
    const attendedCount = participants.filter((participant) => participant.has_attended).length;

    // Tautan dari notifikasi admin: ?review=pending memfilter yang perlu verifikasi. Tautan lama
    // ?review=photo|face&participant=ID diteruskan ke halaman detail peserta.
    useEffect(() => {
        const params = new URLSearchParams(pageUrl.split('?')[1] ?? '');
        const review = params.get('review');
        if (!review) return;

        if (review !== 'pending' && params.get('participant')) {
            router.visit(route('participants.show', { participant: params.get('participant'), review }), { replace: true });
            return;
        }
        setReviewOnly(true);
    }, [pageUrl]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return participants
            .filter((p) => !q || p.nama.toLowerCase().includes(q) || (p.nis_nip || '').toLowerCase().includes(q))
            .filter((p) => !statusFilter || normalize(p.status) === normalize(statusFilter))
            .filter((p) => !reviewOnly || needsReview(p))
            .sort(SORTS[sortBy]);
    }, [participants, query, statusFilter, reviewOnly, sortBy]);

    // Peserta yang tersembunyi oleh filter dilepas dari pilihan: hapus massal hanya mengenai baris yang terlihat.
    useEffect(() => {
        const visible = new Set(rows.map((p) => p.id));
        setSelected((current) => (current.every((id) => visible.has(id)) ? current : current.filter((id) => visible.has(id))));
    }, [rows]);

    const filtered = Boolean(query || statusFilter || reviewOnly);
    const clearFilters = () => {
        setQuery('');
        setStatusFilter('');
        setReviewOnly(false);
    };

    const handleBulkDelete = async () => {
        const count = selected.length;
        const confirmed = await confirm({
            title: `Hapus ${count} peserta?`,
            message: 'Akun login, foto, wajah terdaftar, dan seluruh riwayat presensi mereka ikut terhapus permanen dan tidak bisa dikembalikan.',
            confirmText: `Hapus ${count} peserta`,
            requireText: `${count} peserta`,
        });
        if (!confirmed) return;

        router.delete(route('participants.bulk-destroy'), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Peserta" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Data Peserta"
                    description={`${participants.length} peserta terdaftar · ${attendedCount} sudah hadir hari ini`}
                    actions={
                        <>
                            <Button icon={FileUp} onClick={() => setImportOpen(true)}>Impor Excel</Button>
                            <Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Tambah peserta</Button>
                        </>
                    }
                />

                {reviewCount > 0 && !reviewOnly && (
                    <div className="flex flex-col gap-3 rounded-xl border border-status-telat/30 bg-status-telat-soft p-4 sm:flex-row sm:items-center" role="status">
                        <AlertTriangle className="hidden h-5 w-5 shrink-0 text-status-telat sm:block" aria-hidden="true" />
                        <p className="flex-1 text-sm text-ink">
                            <span className="font-semibold">{reviewCount} peserta</span> menunggu verifikasi foto atau wajah.
                        </p>
                        <Button size="sm" onClick={() => setReviewOnly(true)}>Tampilkan yang perlu verifikasi</Button>
                    </div>
                )}

                <Section flush>
                    <div>
                        <DataTable
                            toolbar={
                                <div className="space-y-3 px-5 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-ink">Daftar peserta</h2>
                                        <p className="mt-0.5 text-sm text-ink-2" aria-live="polite">
                                            {filtered ? `${rows.length} dari ${participants.length} peserta cocok dengan filter` : `${participants.length} peserta`}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 lg:flex-row">
                                        <SearchField value={query} onChange={setQuery} label="Cari peserta" placeholder="Cari nama atau NIP…" className="lg:flex-1" />
                                        <div className="grid grid-cols-2 gap-2 lg:flex">
                                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter status pegawai" className="lg:w-44">
                                                <option value="">Semua status</option>
                                                {EMPLOYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                            </Select>
                                            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Urutkan" className="lg:w-40">
                                                <option value="latest">Terbaru</option>
                                                <option value="oldest">Terlama</option>
                                                <option value="alpha-asc">Nama A–Z</option>
                                                <option value="alpha-desc">Nama Z–A</option>
                                            </Select>
                                        </div>
                                        <Button variant={reviewOnly ? 'primary' : 'secondary'} aria-pressed={reviewOnly} onClick={() => setReviewOnly(!reviewOnly)}>
                                            Perlu verifikasi
                                            <span className="tabular-nums">({reviewCount})</span>
                                        </Button>
                                    </div>
                                </div>
                            }
                            caption="Daftar peserta"
                            rows={rows}
                            filtered={filtered}
                            onClearFilters={clearFilters}
                            empty={
                                <EmptyState
                                    icon={Users}
                                    title="Belum ada peserta"
                                    description="Tambahkan satu per satu atau impor dari Excel. Akun login peserta dibuat otomatis."
                                    action={<Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Tambah peserta</Button>}
                                />
                            }
                            selection={{ selected, onChange: setSelected, label: (p) => `Pilih ${p.nama}` }}
                            mobileCard={(p) => (
                                <div className="flex items-center gap-3">
                                    <ParticipantAvatar participant={p} />
                                    <div className="min-w-0 flex-1">
                                        <RowLink href={route('participants.show', p.id)} className="block truncate">{p.nama}</RowLink>
                                        <p className="truncate text-sm tabular-nums text-ink-2">{p.nis_nip}{p.status ? ` · ${p.status}` : ''}</p>
                                        <FaceStatus participant={p} quiet className="mt-1.5" />
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                                </div>
                            )}
                            columns={[
                                {
                                    key: 'nama',
                                    header: 'Peserta',
                                    cell: (p) => (
                                        <div className="flex items-center gap-3">
                                            <ParticipantAvatar participant={p} />
                                            <div className="min-w-0">
                                                <RowLink href={route('participants.show', p.id)}>{p.nama}</RowLink>
                                                <p className="text-xs tabular-nums text-ink-2 lg:hidden">{p.nis_nip}</p>
                                            </div>
                                        </div>
                                    ),
                                },
                                { key: 'nip', header: 'NIP / ID', hideBelow: 'lg', cell: (p) => (p.nis_nip && p.nis_nip !== '-' ? <span className="tabular-nums text-ink-2">{p.nis_nip}</span> : <span className="text-ink-3" aria-label={isNonPermanentStatus(p.status) ? 'ID belum dibuat: tanggal lahir/jenis kelamin belum diisi' : 'Tanpa NIP'}>–</span>) },
                                { key: 'status', header: 'Status pegawai', hideBelow: 'md', cell: (p) => p.status || <span className="text-ink-3">–</span> },
                                { key: 'wajah', header: 'Wajah', cell: (p) => <FaceStatus participant={p} quiet /> },
                                { key: 'buka', header: <span className="sr-only">Buka</span>, align: 'right', cell: () => <ChevronRight className="ml-auto h-4 w-4 text-ink-3" aria-hidden="true" /> },
                            ]}
                        />
                    </div>
                </Section>
            </div>

            {/* Aksi massal: bilah melayang di bawah selama ada yang dipilih */}
            {selected.length > 0 && (
                <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:pl-64">
                    <div className="pointer-events-auto flex w-full max-w-lg animate-toast-in items-center gap-2 rounded-xl border border-line bg-surface p-2 pl-4 shadow-xl motion-reduce:animate-none" role="region" aria-label="Aksi untuk peserta terpilih">
                        <p className="flex-1 text-sm text-ink"><span className="font-semibold tabular-nums">{selected.length}</span> dipilih</p>
                        <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Batal pilih</Button>
                        <Button size="sm" variant="danger" icon={Trash2} onClick={handleBulkDelete}>Hapus</Button>
                    </div>
                </div>
            )}

            <AddParticipantDialog open={addOpen} onClose={() => setAddOpen(false)} participants={participants} />
            <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
        </AuthenticatedLayout>
    );
}

function AddParticipantDialog({ open, onClose, participants }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ nama: '', nis_nip: '', status: '', tanggal_lahir: '', jenis_kelamin: '' });
    const nonPermanent = isNonPermanentStatus(data.status);

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('participants.store'), { preserveScroll: true, onSuccess: close });
    };

    // GTT/PTT: ID pengganti NIP dibuat server saat disimpan, jadi isiannya dikosongkan (hanya-baca).
    const changeStatus = (status) => setData({
        ...data,
        status,
        nis_nip: isNonPermanentStatus(status) || nonPermanent ? '' : data.nis_nip,
    });

    // Peringatan duplikat langsung saat mengetik (server tetap memvalidasi).
    const sameName = data.nama.trim() && participants.find((p) => p.nama.trim().toLowerCase() === data.nama.trim().toLowerCase());
    const cleanNip = data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, '');
    const sameNip = !nonPermanent && cleanNip && cleanNip !== '-' && participants.find((p) => p.nis_nip === cleanNip);

    return (
        <Dialog
            open={open}
            onClose={close}
            title="Tambah peserta"
            description="Akun login dibuat otomatis dengan NIP (GTT/PTT: ID pengganti NIP) sebagai username dan kata sandi awal."
            footer={
                <>
                    <Button onClick={close}>Batal</Button>
                    <Button variant="primary" type="submit" form="add-participant" loading={processing}>Simpan</Button>
                </>
            }
        >
            <form id="add-participant" onSubmit={submit} className="space-y-4">
                <Field label="Nama lengkap" required error={errors.nama} warning={sameName ? `Nama ini sudah terdaftar dengan NIP ${sameName.nis_nip}.` : undefined}>
                    <Input value={data.nama} onChange={(e) => setData('nama', e.target.value)} autoComplete="off" data-autofocus />
                </Field>
                <Field label="Status pegawai" error={errors.status}>
                    <Select value={data.status} onChange={(e) => changeStatus(e.target.value)}>
                        <option value="">Pilih status</option>
                        {EMPLOYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </Select>
                </Field>
                <Field
                    label={nipLabel(data.status)}
                    required={!nonPermanent}
                    error={errors.nis_nip}
                    hint={nonPermanent ? STAFF_ID_HINT : undefined}
                    warning={sameNip ? `NIP ini sudah terdaftar atas nama ${sameNip.nama}.` : undefined}
                >
                    <Input
                        value={data.nis_nip}
                        onChange={(e) => setData('nis_nip', e.target.value)}
                        readOnly={nonPermanent}
                        placeholder={nonPermanent ? 'Dibuat otomatis saat disimpan' : undefined}
                        inputMode="numeric"
                        autoComplete="off"
                    />
                </Field>
                {nonPermanent && (
                    <>
                        {/* Bahan ID pengganti NIP untuk GTT/PTT (dibuat server). */}
                        <Field label="Tanggal lahir" required error={errors.tanggal_lahir}>
                            <Input type="date" value={data.tanggal_lahir} onChange={(e) => setData('tanggal_lahir', e.target.value)} />
                        </Field>
                        <Field label="Jenis kelamin" required error={errors.jenis_kelamin}>
                            <Select value={data.jenis_kelamin} onChange={(e) => setData('jenis_kelamin', e.target.value)}>
                                <option value="">Pilih</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </Select>
                        </Field>
                    </>
                )}
            </form>
        </Dialog>
    );
}
