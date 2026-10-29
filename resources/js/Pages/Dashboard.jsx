import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import {
    AttendanceBoard, Button, Card, DataTable, EmptyState, PageHeader, Section, StatusPill, cx,
} from '@/ui';
import TrendChart from '@/ui/TrendChart';
import { Head, Link, usePage } from '@inertiajs/react';
import { Camera, CalendarClock, CheckCircle2, ChevronRight, FileCheck, MapPinOff, ScanFace, ImageUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const RELOAD_PROPS = ['boards', 'activeWorkcodes', 'fakeGpsBlockedToday', 'weekly', 'lateness', 'methods', 'recentAttendances', 'adminNotifications'];

const ACTION_ICONS = { leave: FileCheck, face_registration: ScanFace, photo_change: ImageUp };

/** Papan Hadir memakai kunci hadir/terlambat/izin/belum; backend mengirim tepat_waktu untuk "hadir". */
const boardCounts = (counts) => ({ hadir: counts.tepat_waktu, terlambat: counts.terlambat, izin: counts.izin, belum: counts.belum });

const clock = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
const minutes = (hhmm) => {
    const [h, m] = (hhmm || '').split(':').map(Number);
    return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m;
};

/** Jam sekarang (menit sejak tengah malam), diperbarui tiap 30 detik untuk strip jadwal. */
function useNowMinutes() {
    const read = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
    const [now, setNow] = useState(read);
    useEffect(() => {
        const id = window.setInterval(() => setNow(read()), 30000);
        return () => window.clearInterval(id);
    }, []);
    return now;
}

export default function Dashboard({ boards = [], fakeGpsBlockedToday = 0, weekly = [], lateness = [], methods = [], recentAttendances = [] }) {
    const { adminNotifications } = usePage().props;
    const [primary, ...others] = boards;

    // Waktu data terakhir diterima (muat awal & setiap penyegaran latar belakang).
    const [updatedAt, setUpdatedAt] = useState(() => new Date());
    useEffect(() => setUpdatedAt(new Date()), [boards, recentAttendances]);

    // Presensi dari aplikasi Android/scanner masuk terus: segarkan data di latar belakang.
    useEffect(() => {
        const reload = () => backgroundReload({ only: RELOAD_PROPS, preserveScroll: true, preserveState: true });
        const interval = window.setInterval(reload, jitteredInterval(20000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    // Terlambat hanya dihitung untuk presensi harian; sisanya tepat waktu.
    const trend = weekly.map((day) => {
        const late = lateness.find((item) => item.date === day.date)?.late ?? 0;
        return { date: day.date, tepat: Math.max(0, day.value - late), telat: Math.min(late, day.value) };
    });

    const actions = [
        ...(adminNotifications?.groups ?? []).filter((group) => group.count > 0).map((group) => ({
            key: group.type, href: group.url, icon: ACTION_ICONS[group.type] ?? FileCheck, count: group.count, label: group.label.toLowerCase(), hint: 'menunggu verifikasi',
        })),
        ...(fakeGpsBlockedToday > 0
            ? [{ key: 'fake-gps', href: route('admin.fake-gps.index'), icon: MapPinOff, count: fakeGpsBlockedToday, label: 'fake GPS diblokir', hint: 'hari ini, periksa catatannya' }]
            : []),
    ];

    const usedMethods = methods.filter((method) => method.value > 0);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader
                    title="Dashboard"
                    description={
                        primary
                            ? `Presensi ${primary.nama}${others.length ? ` dan ${others.length} workcode aktif lainnya` : ''} · diperbarui ${clock(updatedAt)}`
                            : 'Belum ada workcode aktif hari ini.'
                    }
                    actions={<Button variant="primary" icon={Camera} href={route('scanner')}>Buka Scanner</Button>}
                />

                {primary?.jadwal && <ScheduleStrip daily={primary.kategori === 'harian'} jadwal={primary.jadwal} />}

                {primary ? (
                    <AttendanceBoard
                        title={primary.kategori === 'harian' ? `Kehadiran hari ini · ${primary.nama}` : `Kehadiran · ${primary.nama}`}
                        counts={boardCounts(primary.counts)}
                    />
                ) : (
                    <Card>
                        <EmptyState
                            icon={CalendarClock}
                            title="Belum ada workcode aktif"
                            description="Presensi baru bisa berjalan setelah ada workcode yang aktif. Aktifkan presensi Work From Office atau buat acara baru."
                            action={<Button variant="primary" href={route('workcodes.index')}>Atur workcode</Button>}
                        />
                    </Card>
                )}

                {others.length > 0 && (
                    <Section title="Workcode aktif lainnya">
                        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                            {others.map((board) => (
                                <li key={board.id}>
                                    <p className="mb-2 truncate text-sm font-medium text-ink">{board.nama}</p>
                                    <AttendanceBoard compact counts={boardCounts(board.counts)} />
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <Section
                        title="Presensi terbaru"
                        description={usedMethods.length ? `Hari ini lewat ${usedMethods.map((m) => `${m.label.toLowerCase()} ${m.value}`).join(' · ')}` : undefined}
                        actions={<Button size="sm" variant="ghost" href={route('report')}>Lihat laporan</Button>}
                        flush
                        className="lg:col-span-2"
                    >
                        <DataTable
                            caption="Presensi terbaru hari ini"
                            rows={recentAttendances}
                            empty={<EmptyState title="Belum ada presensi hari ini" description="Presensi dari aplikasi Android, scanner, dan self check-in akan muncul di sini." />}
                            mobileCard={(row) => (
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink">{row.nama}</p>
                                        <p className="truncate text-sm text-ink-2">{row.workcode || 'Tanpa workcode'} · {row.metode}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold tabular-nums text-ink">{row.waktu || '–'}</p>
                                        <StatusPill status={row.terlambat ? 'terlambat' : 'hadir'} className="mt-1" />
                                    </div>
                                </div>
                            )}
                            columns={[
                                {
                                    key: 'nama',
                                    header: 'Peserta',
                                    cell: (row) => (
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-ink">{row.nama}</p>
                                            <p className="truncate text-xs tabular-nums text-ink-2">{row.nis_nip || 'Tanpa NIP'}</p>
                                        </div>
                                    ),
                                },
                                { key: 'workcode', header: 'Workcode', hideBelow: 'xl', className: 'max-w-[12rem] truncate text-ink-2', cell: (row) => row.workcode || '–' },
                                { key: 'masuk', header: 'Masuk', align: 'right', cell: (row) => <span className="font-semibold tabular-nums">{row.waktu || '–'}</span> },
                                { key: 'pulang', header: 'Pulang', align: 'right', hideBelow: 'md', cell: (row) => <span className="tabular-nums text-ink-2">{row.pulang || '–'}</span> },
                                { key: 'status', header: 'Status', cell: (row) => <StatusPill status={row.terlambat ? 'terlambat' : 'hadir'} /> },
                                { key: 'metode', header: 'Metode', hideBelow: 'lg', className: 'text-ink-2', cell: (row) => row.metode },
                            ]}
                        />
                    </Section>

                    <Section title="Perlu tindakan" flush>
                        {actions.length === 0 ? (
                            <EmptyState icon={CheckCircle2} title="Semua beres" description="Tidak ada izin, wajah, atau foto yang menunggu verifikasi." />
                        ) : (
                            <ul className="divide-y divide-line border-t border-line">
                                {actions.map(({ key, href, icon: Icon, count, label, hint }) => (
                                    <li key={key}>
                                        <Link href={href} className="flex min-h-14 items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2">
                                                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-medium text-ink">
                                                    <span className="tabular-nums">{count}</span> {label}
                                                </span>
                                                <span className="block text-xs text-ink-2">{hint}</span>
                                            </span>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>

                <Section title="Tren 7 hari" description="Peserta hadir per hari, dipisah tepat waktu dan terlambat.">
                    <TrendChart days={trend} caption="Terlambat dihitung dari presensi Work From Office yang melewati batas jam datang. Presensi acara selalu dihitung tepat waktu." />
                </Section>
            </div>
        </AuthenticatedLayout>
    );
}

/**
 * Jadwal hari ini dalam satu baris: harian = datang · terlambat · pulang; kegiatan = berlangsung.
 * Fase yang sedang berjalan ditandai agar admin tahu presensi apa yang sedang diterima.
 */
function ScheduleStrip({ daily, jadwal }) {
    const now = useNowMinutes();
    const steps = daily
        ? [
            { label: 'Datang', from: jadwal.datang_mulai, to: jadwal.datang_selesai },
            { label: 'Terlambat', from: jadwal.datang_selesai, to: jadwal.ditutup },
            { label: 'Pulang', from: jadwal.pulang_mulai, to: jadwal.pulang_selesai },
        ]
        : [{ label: 'Berlangsung', from: jadwal.mulai, to: jadwal.selesai }];
    const isCurrent = (step) => minutes(step.from) !== null && minutes(step.to) !== null && now >= minutes(step.from) && now < minutes(step.to);
    const current = steps.find(isCurrent);
    const last = minutes(steps[steps.length - 1].to);
    const status = current
        ? `Sekarang: ${current.label.toLowerCase()}`
        : now < (minutes(steps[0].from) ?? 0) ? 'Belum dibuka' : last !== null && now >= last ? 'Sudah ditutup' : 'Di luar jam presensi';

    return (
        <section aria-label="Jadwal presensi hari ini" className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center">
            <p className="px-2 text-sm font-medium text-ink sm:w-44 sm:shrink-0">{status}</p>
            <ol className={cx('grid flex-1 gap-2', daily ? 'grid-cols-3' : 'grid-cols-1')}>
                {steps.map((step) => {
                    const active = step === current;
                    return (
                        <li
                            key={step.label}
                            aria-current={active ? 'step' : undefined}
                            className={cx('rounded-lg px-3 py-2', active ? 'bg-accent-soft' : 'bg-surface-2/60')}
                        >
                            <p className={cx('text-xs', active ? 'font-semibold text-accent' : 'text-ink-2')}>{step.label}</p>
                            <p className="text-sm font-medium tabular-nums text-ink">{step.from ?? '–'}–{step.to ?? '–'}</p>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
