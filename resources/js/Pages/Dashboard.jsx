import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { icons } from '@/lib/adminMenu';
import MaterialChart from '@/Components/MaterialChart';
import KpiCard from '@/Components/KpiCard';

export default function Dashboard({
    stats,
    activeWorkcode: propActiveWorkcode,
    activeWorkcodes = [],
    pendingLeaveCount = 0,
    pendingDeviceCount = 0,
    fakeGpsBlockedToday = 0,
    weekly = [],
    lateness = [],
    methods = [],
    recentAttendances = [],
}) {
    const { activeWorkcode: globalActiveWorkcode } = usePage().props;
    const activeWorkcode = propActiveWorkcode || globalActiveWorkcode;
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    const todayCount = methods.reduce((sum, item) => sum + item.value, 0);
    const lateTotal = lateness.reduce((sum, item) => sum + item.late, 0);
    const dailyTotal = lateness.reduce((sum, item) => sum + item.total, 0);
    const dayLabel = (date, options) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', options);
    const weekDays = weekly.map((item) => new Date(`${item.date}T00:00:00`));

    // Presensi dari aplikasi Android/scanner masuk terus: segarkan data di latar belakang.
    useEffect(() => {
        const reload = () => backgroundReload({
            only: ['stats', 'activeWorkcode', 'activeWorkcodes', 'pendingLeaveCount', 'pendingDeviceCount', 'fakeGpsBlockedToday', 'weekly', 'lateness', 'methods', 'recentAttendances'],
            preserveScroll: true,
            preserveState: true,
        });
        const interval = window.setInterval(reload, jitteredInterval(20000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="flex w-full flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
                <div className="mb-4 shrink-0" data-aos="fade-up">
                    <h3 className="text-xl font-bold text-neutral-800">Dashboard</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">
                        {activeWorkcode
                            ? <>Ringkasan presensi <span className="font-medium text-neutral-700">{activeWorkcode.nama_workcode}</span>{activeWorkcodes.length > 1 && ` dan ${activeWorkcodes.length - 1} workcode aktif lainnya`}.</>
                            : 'Belum ada workcode aktif. Aktifkan workcode agar presensi dapat berjalan.'}
                    </p>
                </div>

                {/* KPI */}
                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard delay={0} label="Tingkat Kehadiran" value={`${attendancePercentage}%`} icon={icons.chart}>
                        <span className="font-bold text-emerald-600">{stats.hadir}</span> dari {stats.total} peserta
                    </KpiCard>
                    <KpiCard delay={50} label="Sudah Hadir" value={stats.hadir} icon={icons.check}>
                        <span className="font-bold text-emerald-600">+{todayCount}</span> presensi masuk hari ini
                    </KpiCard>
                    <KpiCard delay={100} label="Belum Hadir" value={stats.belum} icon={icons.clock}>
                        <span className="font-bold text-rose-500">{stats.total > 0 ? 100 - attendancePercentage : 0}%</span> peserta belum presensi
                    </KpiCard>
                    <KpiCard delay={150} label="Total Peserta" value={stats.total} icon={icons.users}>
                        <span className="font-bold text-neutral-800">{activeWorkcodes.length}</span> workcode aktif
                    </KpiCard>
                </section>

                {/* Grafik */}
                <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:min-h-0 xl:flex-[1.15] xl:grid-cols-3">
                    <ChartCard delay={0} title="Presensi 7 Hari" subtitle="Jumlah peserta hadir per hari" footer="7 hari terakhir">
                        <MaterialChart
                            className={CHART_FILL}
                            type="bar"
                            label="Hadir"
                            labels={weekDays.map((day) => day.toLocaleDateString('id-ID', { weekday: 'short' }))}
                            titles={weekDays.map((day) => day.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }))}
                            data={weekly.map((item) => item.value)}
                        />
                    </ChartCard>
                    <ChartCard
                        delay={50}
                        title="Keterlambatan 7 Hari"
                        subtitle="Presensi harian yang melewati batas jam datang"
                        footer={dailyTotal > 0 ? `${lateTotal} dari ${dailyTotal} presensi harian terlambat` : 'belum ada presensi harian'}
                    >
                        <MaterialChart
                            className={CHART_FILL}
                            type="line"
                            label="Terlambat"
                            color="#F44335"
                            labels={lateness.map((item) => dayLabel(item.date, { weekday: 'short' }))}
                            titles={lateness.map((item) => `${dayLabel(item.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${item.total} presensi`)}
                            data={lateness.map((item) => item.late)}
                        />
                    </ChartCard>
                    <ChartCard delay={100} title="Metode Presensi" subtitle="Sebaran metode hari ini" footer={`${todayCount} presensi hari ini`} className="md:col-span-2 xl:col-span-1">
                        <MaterialChart
                            className={CHART_FILL}
                            type="bar"
                            label="Presensi"
                            labels={methods.map((item) => item.label)}
                            data={methods.map((item) => item.value)}
                        />
                    </ChartCard>
                </section>

                {/* Tabel & linimasa */}
                <section className="mt-4 grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-3">
                    <div className="card-soft flex flex-col overflow-hidden xl:col-span-2 xl:min-h-0" data-aos="fade-up">
                        <div className="p-4 pb-2">
                            <h6 className="text-base font-semibold text-neutral-800">Presensi Terbaru</h6>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                <span className="h-4 w-4 text-sky-600">{icons.check}</span>
                                <span className="font-bold text-neutral-700">{todayCount}</span> presensi hari ini
                            </p>
                        </div>

                        {recentAttendances.length === 0 ? (
                            <p className="px-4 pb-10 pt-6 text-center text-sm text-neutral-400">Belum ada presensi hari ini.</p>
                        ) : (
                            <div className="min-h-0 flex-1 overflow-x-auto xl:overflow-hidden">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500 opacity-70">
                                            <th className="whitespace-nowrap px-6 py-2.5">Peserta</th>
                                            <th className="hidden whitespace-nowrap px-6 py-2.5 md:table-cell">Workcode</th>
                                            <th className="whitespace-nowrap px-6 py-2.5 text-center">Masuk</th>
                                            <th className="hidden whitespace-nowrap px-6 py-2.5 text-center sm:table-cell">Pulang</th>
                                            <th className="whitespace-nowrap px-6 py-2.5 text-center">Metode</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAttendances.map((row) => (
                                            <tr key={row.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50">
                                                <td className="whitespace-nowrap px-6 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white">
                                                            {initials(row.nama)}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-neutral-800">{row.nama}</p>
                                                            <p className="truncate text-xs text-neutral-500">{row.nis_nip || 'Tanpa NIS/NIP'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden max-w-[14rem] truncate px-6 py-2 text-xs text-neutral-600 md:table-cell">{row.workcode || '-'}</td>
                                                <td className="px-6 py-2 text-center text-xs font-bold tabular-nums text-neutral-800">{row.waktu || '-'}</td>
                                                <td className="hidden px-6 py-2 text-center text-xs tabular-nums text-neutral-500 sm:table-cell">{row.pulang || '-'}</td>
                                                <td className="px-6 py-2 text-center text-xs font-bold text-neutral-600">{row.metode}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="card-soft flex flex-col xl:min-h-0" data-aos="fade-up" data-aos-delay="100">
                        <div className="p-4 pb-0">
                            <h6 className="text-base font-semibold text-neutral-800">Perlu Perhatian</h6>
                            <p className="mt-0.5 text-sm text-neutral-500">Menunggu tindakan admin</p>
                        </div>
                        <ol className="relative flex flex-1 flex-col justify-center p-4 pt-3 before:absolute before:bottom-8 before:left-[29px] before:top-8 before:w-px before:bg-neutral-200">
                            <TimelineItem href={route('admin.leave.index')} icon={icons.document} count={pendingLeaveCount} title="pengajuan izin" hint="menunggu verifikasi" tone="text-rose-500" />
                            <TimelineItem href={route('admin.devices.index')} icon={icons.phone} count={pendingDeviceCount} title="permintaan pindah HP" hint="menunggu persetujuan" tone="text-sky-600" />
                            <TimelineItem href={route('admin.fake-gps.index')} icon={icons.gpsOff} count={fakeGpsBlockedToday} title="fake GPS diblokir" hint="hari ini" tone="text-amber-500" />
                        </ol>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

// HP: tinggi tetap; desktop: isi sisa tinggi kartu.
const CHART_FILL = 'h-[170px] xl:h-auto xl:min-h-[90px] xl:flex-1';

function ChartCard({ title, subtitle, footer, delay, className = '', children }) {
    return (
        <div className={`card-soft flex flex-col p-4 xl:min-h-0 ${className}`} data-aos="fade-up" data-aos-delay={delay}>
            <h6 className="text-base font-semibold text-neutral-800">{title}</h6>
            <p className="text-sm text-neutral-500">{subtitle}</p>
            <div className="mt-3 flex flex-1 flex-col xl:min-h-0">{children}</div>
            <hr className="hr-fade my-2.5" />
            <p className="flex items-center gap-1 text-sm text-neutral-500">
                <span className="h-4 w-4">{icons.clock}</span>
                {footer}
            </p>
        </div>
    );
}

function TimelineItem({ href, icon, count, title, hint, tone }) {
    return (
        <li className="relative pb-4 last:pb-0">
            <Link href={href} className="group -mx-2 flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-neutral-50">
                <span className={`relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white ${count > 0 ? tone : 'text-neutral-400'}`}>
                    <span className="h-[18px] w-[18px]">{icon}</span>
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-800">
                        {count} {title}
                    </span>
                    <span className="block truncate text-xs font-medium text-neutral-500">{hint}</span>
                </span>
                <span className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500">{icons.chevron}</span>
            </Link>
        </li>
    );
}

function initials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}
