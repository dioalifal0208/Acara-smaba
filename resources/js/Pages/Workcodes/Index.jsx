import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GoogleMap from '@/Components/GoogleMap';
import { addTolerance, DAYS } from '@/Components/Workcodes/WeekSchedule';
import WorkcodeEditor from '@/Components/Workcodes/WorkcodeEditor';
import {
    AttendanceBoard, Button, Card, Dialog, EmptyState, IconButton, PageHeader, SearchField, Segmented, Select, StatusPill, cx, useConfirm, useToast,
} from '@/ui';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { Archive, ArchiveRestore, CalendarClock, CalendarDays, Clock, ExternalLink, MapPin, MoreHorizontal, Pencil, Plus, Power, PowerOff, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const todayIso = () => (new Date().getDay() === 0 ? 7 : new Date().getDay());
const hhmm = (value) => (value ? value.substring(0, 5) : '–');
const formatDate = (value) => new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatMonth = (yearMonth) => new Date(`${yearMonth}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

/** Papan Hadir dari backend memakai tepat_waktu untuk "hadir". */
const boardCounts = (board) => ({ hadir: board.tepat_waktu, terlambat: board.terlambat, izin: board.izin, belum: board.belum });

export default function WorkcodesIndex({ workcodes, participants, lateToleranceMinutes = 60 }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();
    const [editor, setEditor] = useState(null); // { workcode: null | Workcode, key }
    const [mapWorkcode, setMapWorkcode] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const openEditor = (workcode = null) => setEditor({ workcode, key: Date.now() });

    // Titik awal workcode baru: lokasi workcode terbaru yang punya koordinat.
    const fallbackLocation = useMemo(() => {
        const last = [...workcodes]
            .filter((w) => Number(w.latitude) && Number(w.longitude))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        return last ? { lat: Number(last.latitude), lng: Number(last.longitude), radius: Number(last.radius_meters) || 100, nama: last.nama_workcode } : null;
    }, [workcodes]);

    const handleDelete = async (workcode) => {
        const count = workcode.attendances_count;
        const confirmed = await confirm({
            title: `Hapus ${workcode.nama_workcode}?`,
            message: count > 0
                ? `${count} data kehadiran di workcode ini ikut terhapus permanen dan tidak bisa dikembalikan. Agar datanya tetap ada, pilih Arsipkan saja.`
                : 'Workcode ini belum punya data kehadiran. Penghapusan tidak bisa dibatalkan.',
            confirmText: count > 0 ? `Hapus beserta ${count} data kehadiran` : 'Hapus workcode',
            // Ada data kehadiran: wajib mengetik nama workcode agar tidak terhapus karena salah klik.
            requireText: count > 0 ? workcode.nama_workcode : undefined,
        });
        if (confirmed) router.delete(route('workcodes.destroy', workcode.id), { preserveScroll: true });
    };

    const handleArchive = (workcode) => router.post(route('workcodes.archive', workcode.id), {}, { preserveScroll: true });
    const handleUnarchive = (workcode) => router.post(route('workcodes.unarchive', workcode.id), {}, { preserveScroll: true });
    const [archiveOpen, setArchiveOpen] = useState(false);

    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [month, setMonth] = useState('');
    const needle = query.trim().toLowerCase();
    // Bulan hanya berlaku untuk kegiatan (punya tanggal); presensi harian berulang sehingga tetap tampil.
    const months = [...new Set(workcodes.filter((w) => w.kategori !== 'harian' && w.tanggal).map((w) => w.tanggal.slice(0, 7)))].sort().reverse();
    const matchesMonth = (w) => !month || w.kategori === 'harian' || w.tanggal?.slice(0, 7) === month;
    const byMonthAndQuery = workcodes.filter((w) => matchesMonth(w) && (!needle || w.nama_workcode.toLowerCase().includes(needle)));
    const shown = type === 'all' ? byMonthAndQuery : byMonthAndQuery.filter((w) => (type === 'harian') === (w.kategori === 'harian'));
    const filtered = Boolean(needle || month || type !== 'all');
    const typeOptions = [
        { value: 'all', label: 'Semua', count: byMonthAndQuery.length },
        { value: 'harian', label: 'Work From Office', count: byMonthAndQuery.filter((w) => w.kategori === 'harian').length },
        { value: 'workcode', label: 'Acara', count: byMonthAndQuery.filter((w) => w.kategori !== 'harian').length },
    ];
    const active = shown.filter((w) => !w.archived_at && w.is_effectively_active);
    const inactive = shown.filter((w) => !w.archived_at && !w.is_effectively_active);
    const archived = shown.filter((w) => w.archived_at);
    const handlers = { tolerance: lateToleranceMinutes, onEdit: openEditor, onDelete: handleDelete, onArchive: handleArchive, onUnarchive: handleUnarchive, onMap: setMapWorkcode };

    return (
        <AuthenticatedLayout>
            <Head title="Workcode" />

            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Workcode"
                    description="Jadwal presensi Work From Office dan acara, beserta batas lokasinya."
                    actions={<Button variant="primary" icon={Plus} onClick={() => openEditor()}>Workcode baru</Button>}
                />

                {workcodes.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={CalendarClock}
                            title="Belum ada workcode"
                            description="Buat presensi Work From Office untuk guru & karyawan, atau acara seperti rapat dan upacara."
                            action={<Button variant="primary" icon={Plus} onClick={() => openEditor()}>Workcode baru</Button>}
                        />
                    </Card>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <Segmented label="Filter tipe workcode" value={type} onChange={setType} options={typeOptions} />
                            <Select
                                value={type === 'harian' ? '' : month}
                                onChange={(e) => setMonth(e.target.value)}
                                disabled={type === 'harian' || months.length === 0}
                                aria-label="Filter bulan acara"
                                className="sm:w-48"
                            >
                                <option value="">Semua bulan</option>
                                {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
                            </Select>
                            {workcodes.length > 6 && (
                                <SearchField value={query} onChange={setQuery} label="Cari workcode" placeholder="Cari nama workcode" className="sm:ml-auto sm:w-72" />
                            )}
                        </div>
                        <WorkcodeGroup
                            title="Sedang aktif"
                            empty={filtered ? 'Tidak ada workcode aktif yang cocok dengan filter.' : 'Tidak ada workcode yang aktif. Presensi terkunci sampai ada yang diaktifkan.'}
                            workcodes={active}
                            {...handlers}
                        />
                        {inactive.length > 0 && <WorkcodeGroup title="Tidak aktif" workcodes={inactive} {...handlers} />}
                        {archived.length > 0 && (
                            <section aria-label="Arsip workcode">
                                <Button variant="ghost" icon={Archive} aria-expanded={archiveOpen} onClick={() => setArchiveOpen(!archiveOpen)} className="-ml-3">
                                    {archiveOpen ? 'Sembunyikan arsip' : 'Tampilkan arsip'} <span className="tabular-nums">({archived.length})</span>
                                </Button>
                                {archiveOpen && <div className="mt-3"><WorkcodeGroup title="Arsip" workcodes={archived} {...handlers} /></div>}
                            </section>
                        )}
                    </>
                )}
            </div>

            {editor && (
                <WorkcodeEditor
                    key={editor.key}
                    workcode={editor.workcode}
                    participants={participants}
                    toleranceMinutes={lateToleranceMinutes}
                    fallbackLocation={fallbackLocation}
                    onClose={() => setEditor(null)}
                />
            )}

            <MapPreview workcode={mapWorkcode} onClose={() => setMapWorkcode(null)} />
        </AuthenticatedLayout>
    );
}

function WorkcodeGroup({ title, empty, workcodes, ...handlers }) {
    return (
        <section aria-labelledby={`group-${title}`}>
            <h2 id={`group-${title}`} className="mb-3 text-sm font-medium text-ink-2">
                {title} <span className="tabular-nums">({workcodes.length})</span>
            </h2>
            {workcodes.length === 0 ? (
                <Card className="p-5 text-sm text-ink-2">{empty}</Card>
            ) : (
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {workcodes.map((workcode) => <WorkcodeCard key={workcode.id} workcode={workcode} {...handlers} />)}
                </ul>
            )}
        </section>
    );
}

function WorkcodeCard({ workcode, tolerance, onEdit, onDelete, onArchive, onUnarchive, onMap }) {
    const daily = workcode.kategori === 'harian';
    const day = todayIso();
    const workingToday = workcode.hari_aktif?.includes(day);
    const schedule = workcode.jadwal_per_hari?.[day] ?? workcode;
    const autoManaged = !daily && workcode.jam_aktif_mulai && workcode.jam_aktif_selesai;
    const hasLocation = workcode.latitude && workcode.longitude;
    const restricted = workcode.participants_count > 0;

    const confirm = useConfirm();
    const toggleActive = async () => {
        if (workcode.is_active) {
            const confirmed = await confirm({
                title: `Nonaktifkan ${workcode.nama_workcode}?`,
                message: daily
                    ? 'Guru dan pegawai tidak bisa presensi datang maupun pulang sampai workcode ini diaktifkan lagi.'
                    : 'Peserta tidak bisa presensi ke acara ini sampai diaktifkan lagi. Data yang sudah tercatat tetap aman.',
                confirmText: 'Nonaktifkan',
            });
            if (!confirmed) return;
        }
        router.post(route(workcode.is_active ? 'workcodes.deactivate' : 'workcodes.activate', workcode.id), {}, { preserveScroll: true });
    };

    return (
        <li>
            <Card animate className={cx('flex h-full flex-col', workcode.is_effectively_active && 'border-accent/50')}>
                <div className="flex items-start gap-2 p-5 pb-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                            {workcode.archived_at
                                ? <StatusPill tone="netral" icon={Archive} label="Diarsipkan" />
                                : workcode.is_effectively_active
                                    ? <StatusPill status="approved" label="Aktif" />
                                    : <StatusPill tone="netral" icon={PowerOff} label="Nonaktif" />}
                            <StatusPill tone="netral" icon={daily ? Clock : CalendarDays} label={daily ? 'Work From Office' : 'Acara'} />
                        </div>
                        <h3 className="line-clamp-2 text-base font-semibold text-ink">{workcode.nama_workcode}</h3>
                    </div>
                    <CardMenu workcode={workcode} onEdit={onEdit} onDelete={onDelete} onArchive={onArchive} onUnarchive={onUnarchive} />
                </div>

                <dl className="space-y-2 px-5 pb-4 text-sm">
                    {daily && (
                        workingToday ? (
                            <>
                                <Row label="Datang hari ini">
                                    {hhmm(schedule.jam_datang_mulai)}–{hhmm(schedule.jam_datang_selesai)}
                                    <span className="font-normal text-ink-2"> · telat s.d. {addTolerance(hhmm(schedule.jam_datang_selesai), tolerance)}</span>
                                </Row>
                                <Row label="Pulang hari ini">{hhmm(schedule.jam_pulang_mulai)}–{hhmm(schedule.jam_pulang_selesai)}</Row>
                            </>
                        ) : (
                            <Row label="Hari ini">Libur</Row>
                        )
                    )}
                    {daily && (
                        <Row label="Hari kerja">
                            {DAYS.filter((d) => workcode.hari_aktif?.includes(d.id)).map((d) => d.short).join(', ') || '–'}
                        </Row>
                    )}
                    {!daily && workcode.tanggal && <Row label="Tanggal">{formatDate(workcode.tanggal)}</Row>}
                    {autoManaged && <Row label="Aktif otomatis">{hhmm(workcode.jam_aktif_mulai)}–{hhmm(workcode.jam_aktif_selesai)} WIB</Row>}
                    <Row label="Peserta">
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />{restricted ? `${workcode.participants_count - (workcode.auto_attendees?.length ?? 0)} dipilih` : 'Semua'}</span>
                    </Row>
                    {!daily && workcode.auto_attendees?.length > 0 && <Row label="Auto hadir">{workcode.auto_attendees.length} stakeholder</Row>}
                    <Row label="Lokasi">
                        {hasLocation ? (
                            <button type="button" onClick={() => onMap(workcode)} className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                Radius {workcode.radius_meters || 100} m
                            </button>
                        ) : (
                            <span className="font-normal text-ink-2">Tanpa batas</span>
                        )}
                    </Row>
                </dl>

                <div className="mt-auto border-t border-line px-5 py-4">
                    {workcode.board ? (
                        <AttendanceBoard compact counts={boardCounts(workcode.board)} />
                    ) : (
                        <p className="text-sm text-ink-2"><span className="font-semibold tabular-nums text-ink">{workcode.attendances_count}</span> kehadiran tercatat</p>
                    )}
                    <div className="mt-3 flex justify-end">
                        {workcode.archived_at ? (
                            <Button size="sm" icon={ArchiveRestore} onClick={() => onUnarchive(workcode)}>Kembalikan dari arsip</Button>
                        ) : autoManaged ? (
                            <p className="text-xs text-ink-2">Aktif dan nonaktif mengikuti jam otomatis.</p>
                        ) : workcode.is_active ? (
                            <Button size="sm" icon={PowerOff} onClick={toggleActive}>Nonaktifkan</Button>
                        ) : (
                            <Button size="sm" variant="primary" icon={Power} onClick={toggleActive}>Aktifkan</Button>
                        )}
                    </div>
                </div>
            </Card>
        </li>
    );
}

function CardMenu({ workcode, onEdit, onDelete, onArchive, onUnarchive }) {
    const item = 'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm data-[focus]:bg-surface-2';

    return (
        <Menu>
            <MenuButton as={IconButton} icon={MoreHorizontal} label={`Aksi untuk ${workcode.nama_workcode}`} className="-mr-2 -mt-1" />
            <MenuItems anchor={{ to: 'bottom end', gap: 4 }} className="z-40 w-44 rounded-xl border border-line bg-surface p-1 shadow-xl focus:outline-none">
                <MenuItem>
                    <button type="button" onClick={() => onEdit(workcode)} className={cx(item, 'text-ink')}>
                        <Pencil className="h-4 w-4 text-ink-2" aria-hidden="true" />Ubah
                    </button>
                </MenuItem>
                {workcode.archived_at ? (
                    <MenuItem>
                        <button type="button" onClick={() => onUnarchive(workcode)} className={cx(item, 'text-ink')}>
                            <ArchiveRestore className="h-4 w-4 text-ink-2" aria-hidden="true" />Kembalikan
                        </button>
                    </MenuItem>
                ) : !workcode.is_effectively_active && (
                    <MenuItem>
                        <button type="button" onClick={() => onArchive(workcode)} className={cx(item, 'text-ink')}>
                            <Archive className="h-4 w-4 text-ink-2" aria-hidden="true" />Arsipkan
                        </button>
                    </MenuItem>
                )}
                <MenuItem>
                    <button type="button" onClick={() => onDelete(workcode)} className={cx(item, 'text-danger')}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />Hapus
                    </button>
                </MenuItem>
            </MenuItems>
        </Menu>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-ink-2">{label}</dt>
            <dd className="min-w-0 text-right font-medium tabular-nums text-ink">{children}</dd>
        </div>
    );
}

function MapPreview({ workcode, onClose }) {
    const position = workcode ? { lat: Number(workcode.latitude), lng: Number(workcode.longitude) } : null;

    return (
        <Dialog
            open={Boolean(workcode)}
            onClose={onClose}
            title={workcode?.nama_workcode ?? ''}
            description={workcode ? `Batas lokasi presensi, radius ${workcode.radius_meters || 100} meter` : undefined}
            size="2xl"
            footer={workcode && (
                <>
                    <p className="text-xs tabular-nums text-ink-2 sm:mr-auto">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
                    <Button icon={ExternalLink} onClick={() => window.open(`https://www.google.com/maps?q=${position.lat},${position.lng}`, '_blank', 'noopener')}>
                        Buka di Google Maps
                    </Button>
                    <Button variant="primary" onClick={onClose}>Tutup</Button>
                </>
            )}
        >
            {workcode && (
                <div className="h-80 overflow-hidden rounded-xl border border-line sm:h-96">
                    <GoogleMap position={position} radius={Number(workcode.radius_meters) || 100} />
                </div>
            )}
        </Dialog>
    );
}
