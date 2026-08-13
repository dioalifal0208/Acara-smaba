import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, activeEvent: propActiveEvent }) {
    const { activeEvent: globalActiveEvent } = usePage().props;
    const activeEvent = propActiveEvent || globalActiveEvent;
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-lg font-bold leading-tight text-slate-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center overflow-hidden">
                <div className="mx-auto max-w-7xl w-full space-y-4">
                    
                    {/* Event Warning Banner if No Active Event */}
                    {!activeEvent && (
                        <div className="overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 shadow-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-amber-500 text-white p-2 shrink-0">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-amber-900">Perhatian: Belum Ada Event Aktif!</h3>
                                    <p className="text-xs text-amber-700 font-medium mt-0.5">
                                        Admin wajib membuat atau memilih event terlebih dahulu sebelum peserta atau panitia dapat melakukan scan.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('events.index')}
                                className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-700"
                            >
                                Kelola Event Now
                            </Link>
                        </div>
                    )}

                    {/* Welcome Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-800 p-5 shadow-lg" data-aos="fade-up">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                        activeEvent ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${activeEvent ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                                        {activeEvent ? activeEvent.nama_event : 'Belum Ada Event Aktif'}
                                    </span>
                                </div>
                                <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                                    Sistem Presensi QR Code
                                </h1>
                                <p className="mt-1 text-xs text-indigo-100 font-medium">
                                    SMA Negeri 1 Babat — Event Management System
                                </p>
                            </div>
                            <Link
                                href={route('scanner')}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                Buka Scanner
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-aos="fade-up" data-aos-delay="100">
                        <div className="group overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2.5 transition-colors group-hover:bg-indigo-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Peserta</p>
                                    <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="group overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 transition-colors group-hover:bg-emerald-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sudah Hadir</p>
                                    <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{stats.hadir}</p>
                                </div>
                            </div>
                        </div>

                        <div className="group overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 transition-colors group-hover:bg-amber-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Belum Hadir</p>
                                    <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{stats.belum}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Kehadiran */}
                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm" data-aos="fade-up" data-aos-delay="200">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Progress Kehadiran</span>
                            <span className="text-xs font-bold text-indigo-600">{attendancePercentage}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out"
                                style={{ width: `${attendancePercentage}%` }}
                            />
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-500 font-semibold">{stats.hadir} dari {stats.total} peserta telah berada di lokasi acara</p>
                    </div>

                    {/* Quick Actions (compact size) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-aos="fade-up" data-aos-delay="300">
                        <Link
                            href={route('participants.index')}
                            className="group flex items-center gap-3.5 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                        >
                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 transition-colors group-hover:bg-blue-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Kelola Peserta</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Tambah, lihat, atau hapus peserta</p>
                            </div>
                        </Link>

                        <Link
                            href={route('scanner')}
                            className="group flex items-center gap-3.5 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                        >
                            <div className="rounded-xl bg-purple-50 border border-purple-100 p-2.5 transition-colors group-hover:bg-purple-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Scanner Panitia</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Mulai scan presensi di Beranda</p>
                            </div>
                        </Link>

                        <Link
                            href={route('admin.master-qr')}
                            className="group flex items-center gap-3.5 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                        >
                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 transition-colors group-hover:bg-amber-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Master QR Code</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Tampilkan QR absen mandiri</p>
                            </div>
                        </Link>

                        <Link
                            href={route('report')}
                            className="group flex items-center gap-3.5 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                        >
                            <div className="rounded-xl bg-teal-50 border border-teal-100 p-2.5 transition-colors group-hover:bg-teal-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Lihat Laporan</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Laporan kehadiran lengkap</p>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
