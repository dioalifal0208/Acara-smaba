import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AttendanceCalendarModal from '@/Components/AttendanceCalendarModal';
import {
    AttendanceStatus, LogsDialog, ManualEditDialog, ParticipantActionsDialog, ProofDialog, ProofThumb,
} from '@/Components/Report/ReportDialogs';
import { appUrl } from '@/lib/appUrl';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { printIndividualRecap, printReport } from '@/lib/reportPrint';
import {
    AttendanceBoard, Button, Card, DataTable, EmptyState, IconButton, PageHeader, SearchField, Section, Select, useConfirm, useToast,
} from '@/ui';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronRight, FileBarChart, FileDown, Pencil, Printer, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const EMPLOYMENT_STATUSES = ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'GTT', 'PTT'];

/** 12 bulan terakhir ("YYYY-MM") untuk pilihan bulan rekap; bulan yang sedang dibuka selalu ikut. */
function recentMonths(selected) {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    if (selected && !months.includes(selected)) months.push(selected);
    return months.map((value) => {
        const [year, month] = value.split('-').map(Number);
        return { value, label: new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) };
    });
}

export default function ReportIndex({
    workcodes = [],
    activeWorkcodes = [],
    selectedWorkcodeId,
    selectedWorkcode,
    stats,
    period = null,
    attendances = [],
    participants = [],
    kepalaSekolahNama = '',
    kepalaSekolahNip = '',
}) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [proof, setProof] = useState(null); // presensi acara yang dibuka buktinya
    const [actionsFor, setActionsFor] = useState(null); // peserta rekap harian yang dibuka pilihannya
    const [editOpen, setEditOpen] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [logsOpen, setLogsOpen] = useState(false);
    const [logsParticipant, setLogsParticipant] = useState(null);
    const [logsLoading, setLogsLoading] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarParticipant, setCalendarParticipant] = useState(null);

    const editForm = useForm({ id: null, tanggal: '', jam_masuk: '', jam_pulang: '', status: 'hadir' });

    const isDaily = selectedWorkcode?.kategori === 'harian';
    const singleAttendance = selectedWorkcode?.kategori === 'workcode';

    // Presensi dari Android/scanner masuk terus: segarkan rekap di latar belakang, kecuali saat
    // dialog terbuka (agar form ubah tidak tertimpa).
    const dialogOpen = editOpen || logsOpen || calendarOpen || proof !== null || actionsFor !== null;
    useEffect(() => {
        if (dialogOpen) return undefined;
        const reload = () => backgroundReload({ only: ['stats', 'attendances', 'participants', 'activeWorkcodes'], preserveScroll: true, preserveState: true });
        const interval = window.setInterval(reload, jitteredInterval(20000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [dialogOpen]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const statuses = useMemo(
        () => [...new Set([...EMPLOYMENT_STATUSES, ...attendances.map((a) => a.status_pegawai).filter(Boolean).sort()])],
        [attendances],
    );

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return attendances.filter((a) => (!q || (a.nama || '').toLowerCase().includes(q) || (a.nis_nip || '').toLowerCase().includes(q))
            && (!statusFilter || a.status_pegawai === statusFilter));
    }, [attendances, query, statusFilter]);

    const filtered = Boolean(query || statusFilter);
    const signatory = { kepalaSekolahNama, kepalaSekolahNip };

    const fetchLogs = async ({ id, nama, nis_nip, status_pegawai }) => {
        if (!selectedWorkcode) return;
        setLogsLoading(true);
        setLogsOpen(true);
        try {
            const response = await fetch(appUrl(`report/individual/${selectedWorkcode.id}/${id}`));
            const data = await response.json();
            setLogsParticipant({
                id,
                nama: nama || data.participant.nama,
                nis_nip: nis_nip || data.participant.nis_nip,
                status_pegawai: status_pegawai || data.participant.status,
                attendances: data.attendances || [],
            });
        } catch {
            setLogsOpen(false);
            toast.error('Riwayat presensi gagal dimuat. Periksa koneksi lalu coba lagi.');
        } finally {
            setLogsLoading(false);
        }
    };

    const refreshLogs = () => logsOpen && logsParticipant && fetchLogs(logsParticipant);

    const openEdit = (att, name) => {
        const waktu = att.waktu_hadir && att.waktu_hadir !== '-' ? String(att.waktu_hadir) : '';
        editForm.setData({
            id: att.id,
            tanggal: att.tanggal || waktu.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || new Date().toISOString().split('T')[0],
            jam_masuk: att.jam_masuk || waktu.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1] || '',
            jam_pulang: singleAttendance ? '' : att.jam_pulang || '',
            status: att.status || 'hadir',
        });
        editForm.clearErrors();
        setEditingName(name || att.nama || 'Peserta');
        setEditOpen(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.attendances.update', editForm.data.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditOpen(false);
                editForm.reset();
                refreshLogs();
            },
        });
    };

    const deleteAttendance = async (attendanceId, name, dateInfo) => {
        const confirmed = await confirm({
            title: 'Hapus catatan presensi?',
            message: `Catatan presensi ${name}${dateInfo ? ` tanggal ${dateInfo}` : ''} dihapus, termasuk status hadir, izin, atau alpha di hari itu.`,
            confirmText: 'Hapus catatan',
        });
        if (confirmed) router.delete(route('admin.attendances.destroy', attendanceId), { preserveScroll: true, onSuccess: refreshLogs });
    };

    const openCalendar = (person) => {
        setCalendarParticipant(participants.find((p) => p.id === person.participant_id) || {
            id: person.participant_id, nama: person.nama, nis_nip: person.nis_nip, status: person.status_pegawai,
        });
        setCalendarOpen(true);
    };

    const printIndividual = async (person) => {
        try {
            await printIndividualRecap({ workcode: selectedWorkcode, participantId: person.participant_id, participantName: person.nama, ...signatory });
        } catch {
            toast.error('Rekap individu gagal dimuat. Periksa koneksi lalu coba lagi.');
        }
    };

    const nip = (a) => (a.nis_nip && a.nis_nip !== '-' ? a.nis_nip : null);
    const personCell = (a) => (
        <div className="min-w-0">
            <p className="font-medium text-ink">{a.nama}</p>
            <p className="text-xs tabular-nums text-ink-2">{nip(a) ?? 'Tanpa NIP'}{a.status_pegawai ? ` · ${a.status_pegawai}` : ''}</p>
        </div>
    );
    const count = (value, tone) => <span className={value > 0 ? `font-semibold tabular-nums ${tone}` : 'tabular-nums text-ink-3'}>{value || 0}</span>;

    const dailyColumns = [
        { key: 'nama', header: 'Peserta', cell: personCell },
        { key: 'alpha', header: 'Alpha', align: 'right', cell: (a) => count(a.total_alpha, 'text-status-alpha') },
        { key: 'izin', header: 'Izin', align: 'right', hideBelow: 'md', cell: (a) => count(a.total_izin, 'text-ink') },
        { key: 'sakit', header: 'Sakit', align: 'right', hideBelow: 'md', cell: (a) => count(a.total_sakit, 'text-ink') },
        { key: 'lupa', header: 'Lupa absen', align: 'right', hideBelow: 'lg', cell: (a) => count(a.total_lupa_absen, 'text-ink') },
        { key: 'telat', header: 'Terlambat', align: 'right', cell: (a) => (a.total_menit_terlambat ? <span className="font-semibold tabular-nums text-status-telat">{a.total_menit_terlambat} mnt</span> : <span className="tabular-nums text-ink-3">0</span>) },
        {
            key: 'buka',
            header: <span className="sr-only">Pilihan</span>,
            align: 'right',
            cell: (a) => <IconButton icon={ChevronRight} size="sm" label={`Pilihan untuk ${a.nama}`} onClick={() => setActionsFor(a)} />,
        },
    ];

    const eventColumns = [
        { key: 'nama', header: 'Peserta', cell: personCell },
        { key: 'waktu', header: 'Waktu hadir', cell: (a) => <span className="tabular-nums">{a.status === 'libur' || a.waktu_hadir === '-' ? '–' : a.waktu_hadir}</span> },
        { key: 'status', header: 'Status', cell: (a) => <AttendanceStatus status={a.status} /> },
        { key: 'metode', header: 'Metode', hideBelow: 'lg', className: 'text-ink-2', cell: (a) => a.attendance_method || '–' },
        { key: 'bukti', header: 'Bukti', hideBelow: 'md', cell: (a) => <ProofThumb attendance={a} onOpen={() => setProof(a)} /> },
        {
            key: 'aksi',
            header: <span className="sr-only">Aksi</span>,
            align: 'right',
            cell: (a) => (
                <div className="flex justify-end gap-1">
                    <IconButton icon={Pencil} size="sm" label={`Ubah presensi ${a.nama}`} onClick={() => openEdit(a, a.nama)} disabled={!a.id} />
                    <IconButton icon={Trash2} size="sm" label={`Hapus presensi ${a.nama}`} onClick={() => deleteAttendance(a.id, a.nama, a.waktu_hadir)} disabled={!a.id} className="hover:bg-danger-soft hover:text-danger" />
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Laporan" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Laporan"
                    description={activeWorkcodes.length > 1
                        ? `${activeWorkcodes.length} workcode aktif bersamaan: ${activeWorkcodes.map((w) => w.nama_workcode).join(' · ')}`
                        : 'Rekap kehadiran per workcode, lengkap dengan bukti presensi.'}
                    actions={selectedWorkcodeId && (
                        <>
                            <Button icon={FileDown} href={route('workcodes.export', { workcode: selectedWorkcodeId, ...(period ? { bulan: period.month } : {}) })} external>Ekspor Excel</Button>
                            <Button
                                variant="primary"
                                icon={Printer}
                                onClick={() => printReport({ workcode: selectedWorkcode, attendances: rows, period, ...signatory })}
                            >
                                Cetak{filtered ? ` (${rows.length})` : ''}
                            </Button>
                        </>
                    )}
                />

                {workcodes.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={FileBarChart}
                            title="Belum ada workcode"
                            description="Laporan tersedia setelah ada workcode dan presensi yang tercatat."
                            action={<Button variant="primary" href={route('workcodes.index')}>Atur workcode</Button>}
                        />
                    </Card>
                ) : (
                    <Section flush>
                        <DataTable
                            caption={isDaily ? 'Rekap presensi Work From Office per peserta' : 'Daftar kehadiran'}
                            rows={rows}
                            rowKey={(a) => a.participant_id ?? a.id}
                            filtered={filtered}
                            onClearFilters={() => { setQuery(''); setStatusFilter(''); }}
                            empty={<EmptyState title="Belum ada data kehadiran" description="Presensi di workcode ini akan muncul di sini." />}
                            toolbar={
                                <div className="space-y-3 px-5 py-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                        <div className="min-w-0">
                                            <label htmlFor="report-workcode" className="mb-1.5 block text-sm font-medium text-ink">Workcode</label>
                                            <Select
                                                id="report-workcode"
                                                value={selectedWorkcodeId || ''}
                                                onChange={(e) => router.get(route('report'), { workcode_id: e.target.value }, { preserveState: true, preserveScroll: true })}
                                                className="md:w-80"
                                            >
                                                {workcodes.filter((w) => !w.archived_at).map((w) => (
                                                    <option key={w.id} value={w.id}>{w.is_active ? '● ' : ''}{w.nama_workcode} ({w.attendances_count} hadir)</option>
                                                ))}
                                                {workcodes.some((w) => w.archived_at) && (
                                                    <optgroup label="Arsip">
                                                        {workcodes.filter((w) => w.archived_at).map((w) => (
                                                            <option key={w.id} value={w.id}>{w.nama_workcode} ({w.attendances_count} hadir)</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </Select>
                                        </div>
                                        {singleAttendance && stats && (
                                            <AttendanceBoard compact counts={{ hadir: stats.hadir, izin: stats.izin ?? 0, belum: stats.belum }} className="md:w-72" />
                                        )}
                                        {isDaily && period && (
                                            <div className="md:text-right">
                                                <label htmlFor="report-month" className="mb-1.5 block text-sm font-medium text-ink">Bulan rekap</label>
                                                <Select
                                                    id="report-month"
                                                    value={period.month}
                                                    onChange={(e) => router.get(route('report'), { workcode_id: selectedWorkcodeId, bulan: e.target.value }, { preserveState: true, preserveScroll: true })}
                                                    className="md:w-56"
                                                >
                                                    {recentMonths(period.month).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <SearchField value={query} onChange={setQuery} label="Cari peserta" placeholder="Cari nama atau NIP…" className="sm:flex-1" />
                                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter status pegawai" className="sm:w-52">
                                            <option value="">Semua status pegawai</option>
                                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </Select>
                                    </div>
                                    <p className="text-sm text-ink-2" aria-live="polite">
                                        {filtered ? `${rows.length} dari ${attendances.length} baris cocok dengan filter` : `${attendances.length} baris`}
                                        {isDaily && ' · alpha, izin, sakit, lupa absen, dan total menit terlambat per peserta'}
                                    </p>
                                </div>
                            }
                            mobileCard={(a) => (isDaily ? (
                                <button type="button" onClick={() => setActionsFor(a)} className="w-full text-left">
                                    {personCell(a)}
                                    <p className="mt-1.5 flex flex-wrap gap-x-3 text-sm text-ink-2">
                                        <span>Alpha {count(a.total_alpha, 'text-status-alpha')}</span>
                                        <span>Izin {count(a.total_izin, 'text-ink')}</span>
                                        <span>Sakit {count(a.total_sakit, 'text-ink')}</span>
                                        <span>Telat {count(a.total_menit_terlambat, 'text-status-telat')} mnt</span>
                                    </p>
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    {personCell(a)}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold tabular-nums text-ink">{a.status === 'libur' || a.waktu_hadir === '-' ? '–' : a.waktu_hadir}</span>
                                            <AttendanceStatus status={a.status} />
                                        </div>
                                        <ProofThumb attendance={a} onOpen={() => setProof(a)} />
                                    </div>
                                    {a.id && <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(a, a.nama)} className="-ml-3">Ubah presensi</Button>}
                                </div>
                            ))}
                            columns={isDaily ? dailyColumns : eventColumns}
                        />
                    </Section>
                )}
            </div>

            <ProofDialog attendance={proof} workcode={selectedWorkcode} onClose={() => setProof(null)} />

            <ParticipantActionsDialog
                attendance={actionsFor}
                onClose={() => setActionsFor(null)}
                onCalendar={(a) => { setActionsFor(null); openCalendar(a); }}
                onLogs={(a) => { setActionsFor(null); fetchLogs({ id: a.participant_id, nama: a.nama, nis_nip: a.nis_nip, status_pegawai: a.status_pegawai }); }}
                onPrint={(a) => { setActionsFor(null); printIndividual(a); }}
            />

            <ManualEditDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                form={editForm}
                participantName={editingName}
                singleAttendance={singleAttendance}
                onSubmit={submitEdit}
            />

            <LogsDialog
                open={logsOpen}
                onClose={() => setLogsOpen(false)}
                participant={logsParticipant}
                loading={logsLoading}
                onOpenCalendar={() => {
                    setLogsOpen(false);
                    openCalendar({ participant_id: logsParticipant.id, ...logsParticipant });
                }}
                onEdit={(att) => openEdit(att, logsParticipant?.nama)}
                onDelete={(att, date) => deleteAttendance(att.id, logsParticipant?.nama, date)}
            />

            <AttendanceCalendarModal
                show={calendarOpen}
                onClose={() => {
                    setCalendarOpen(false);
                    setCalendarParticipant(null);
                    router.reload({ only: ['stats', 'attendances'], preserveScroll: true, preserveState: true });
                }}
                workcode={selectedWorkcode}
                participants={participants}
                initialParticipant={calendarParticipant}
                onAttendanceChanged={() => router.reload({ only: ['stats', 'attendances'], preserveScroll: true, preserveState: true })}
            />
        </AuthenticatedLayout>
    );
}
