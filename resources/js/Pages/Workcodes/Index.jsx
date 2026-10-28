import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GoogleMap from '@/Components/GoogleMap';
import { addTolerance, DAYS } from '@/Components/Workcodes/WeekSchedule';
import WorkcodeEditor from '@/Components/Workcodes/WorkcodeEditor';
import {
    AttendanceBoard, Button, Card, Dialog, EmptyState, IconButton, PageHeader, StatusPill, cx, useConfirm, useToast,
} from '@/ui';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarClock, CalendarDays, Clock, ExternalLink, MapPin, MoreHorizontal, Pencil, Plus, Power, PowerOff, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const todayIso = () => (new Date().getDay() === 0 ? 7 : new Date().getDay());
const hhmm = (value) => (value ? value.substring(0, 5) : '–');
const formatDate = (value) => new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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

    const handleDelete = async (workcode) => {
        const confirmed = await confirm({
            title: `Hapus ${workcode.nama_workcode}?`,
            message: `${workcode.attendances_count} data kehadiran di workcode ini ikut terhapus permanen dan tidak bisa dikembalikan.`,
            confirmText: 'Hapus workcode',
        });
        if (confirmed) router.delete(route('workcodes.destroy', workcode.id), { preserveScroll: true });
    };

    const active = workcodes.filter((w) => w.is_effectively_active);
    const inactive = workcodes.filter((w) => !w.is_effectively_active);

    return (
        <AuthenticatedLayout>
            <Head title="Workcode" />

            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Workcode"
                    description="Jadwal presensi harian dan kegiatan, beserta batas lokasinya."
                    actions={<Button variant="primary" icon={Plus} onClick={() => openEditor()}>Workcode baru</Button>}
                />

                {workcodes.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={CalendarClock}
                            title="Belum ada workcode"
                            description="Buat presensi harian untuk guru & karyawan, atau kegiatan sekali seperti rapat dan upacara."
                            action={<Button variant="primary" icon={Plus} onClick={() => openEditor()}>Workcode baru</Button>}
                        />
                    </Card>
                ) : (
                    <>
                        <WorkcodeGroup
                            title="Sedang aktif"
                            empty="Tidak ada workcode yang aktif. Presensi terkunci sampai ada yang diaktifkan."
                            workcodes={active}
                            tolerance={lateToleranceMinutes}
                            onEdit={openEditor}
                            onDelete={handleDelete}
                            onMap={setMapWorkcode}
                        />
                        {inactive.length > 0 && (
                            <WorkcodeGroup
                                title="Tidak aktif"
                                workcodes={inactive}
                                tolerance={lateToleranceMinutes}
                                onEdit={openEditor}
                                onDelete={handleDelete}
                                onMap={setMapWorkcode}
                            />
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

function WorkcodeCard({ workcode, tolerance, onEdit, onDelete, onMap }) {
    const daily = workcode.kategori === 'harian';
    const day = todayIso();
    const workingToday = workcode.hari_aktif?.includes(day);
    const schedule = workcode.jadwal_per_hari?.[day] ?? workcode;
    const autoManaged = !daily && workcode.jam_aktif_mulai && workcode.jam_aktif_selesai;
    const hasLocation = workcode.latitude && workcode.longitude;
    const restricted = workcode.participants_count > 0;

    const toggleActive = () => router.post(route(workcode.is_active ? 'workcodes.deactivate' : 'workcodes.activate', workcode.id), {}, { preserveScroll: true });

    return (
        <li>
            <Card animate className={cx('flex h-full flex-col', workcode.is_effectively_active && 'border-accent/50')}>
                <div className="flex items-start gap-2 p-5 pb-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                            {workcode.is_effectively_active
                                ? <StatusPill status="approved" label="Aktif" />
                                : <StatusPill tone="netral" icon={PowerOff} label="Nonaktif" />}
                            <StatusPill tone="netral" icon={daily ? Clock : CalendarDays} label={daily ? 'Harian' : 'Kegiatan'} />
                        </div>
                        <h3 className="line-clamp-2 text-base font-semibold text-ink">{workcode.nama_workcode}</h3>                    </div>
                    <CardMenu workcode={workcode} onEdit={onEdit} onDelete={onDelete} />
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
                        {autoManaged ? (
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

function CardMenu({ workcode, onEdit, onDelete }) {
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
