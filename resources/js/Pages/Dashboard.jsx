import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function Dashboard({ stats, activeEvent: propActiveEvent, pendingLeaveCount }) {
    const { auth, activeEvent: globalActiveEvent } = usePage().props;
    const activeEvent = propActiveEvent || globalActiveEvent;
    const user = auth.user;
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-3 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden h-full w-full">
                <div className="mx-auto max-w-7xl w-full h-full flex flex-col">
                    
                    {/* Top Bar (User Profile) */}
                    <div className="flex justify-end mb-2 flex-none">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span>{user.name}</span>
                                    <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium">Masuk sebagai</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')} className="text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 py-1.5">
                                    Pengaturan Profil
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 w-full text-left">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                    
                    {/* Event Warning Banner (Full Width - Top) */}
                    {!activeEvent && (
                        <div className="mb-3 flex-none overflow-hidden rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 shadow-sm text-amber-900 flex flex-row items-center justify-between gap-4 transition-all hover:bg-amber-500/20" data-aos="fade-down">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-500 text-white p-2 shrink-0 shadow-sm">
                                    <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-amber-900 tracking-tight">Perhatian: Belum Ada Event Aktif!</h3>
                                    <p className="text-xs text-amber-700 font-medium mt-0.5">
                                        Pilih atau buat event terlebih dahulu agar sistem presensi dapat digunakan.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('events.index')}
                                className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-amber-700 hover:-translate-y-0.5"
                            >
                                Kelola Event
                            </Link>
                        </div>
                    )}

                    {/* Pending Leave Banner */}
                    {pendingLeaveCount > 0 && (
                        <div className="mb-3 flex-none overflow-hidden rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 shadow-sm text-blue-900 flex flex-row items-center justify-between gap-4 transition-all hover:bg-blue-500/20" data-aos="fade-down">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500 text-white p-2 shrink-0 shadow-sm relative">
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-blue-900 tracking-tight">Ada {pendingLeaveCount} Pengajuan Izin/Sakit</h3>
                                    <p className="text-xs text-blue-700 font-medium mt-0.5">
                                        Menunggu verifikasi Anda untuk menyetujui pengajuan tersebut.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('admin.leave.index')}
                                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-blue-700 hover:-translate-y-0.5"
                            >
                                Verifikasi
                            </Link>
                        </div>
                    )}

                    {/* Golden Ratio Grid: 7 : 5 - Takes remaining height */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0">
                        
                        {/* MAIN COLUMN (Kiri - ~60%) */}
                        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
                            
                            {/* Welcome Banner */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-6 shadow-xl shadow-indigo-200/50 flex-none" data-aos="fade-up">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-5 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-3 border shadow-sm backdrop-blur-md bg-white/10 border-white/20 self-start">
                                        <span className={`h-1.5 w-1.5 rounded-full ${activeEvent ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-amber-400'}`}></span>
                                        <span className={`text-[10px] font-bold tracking-wide uppercase ${activeEvent ? 'text-emerald-50' : 'text-amber-50'}`}>
                                            {activeEvent ? activeEvent.nama_event : 'Belum Ada Event'}
                                        </span>
                                    </div>
                                    
                                    <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                                        Sistem Presensi Digital
                                    </h1>
                                    <p className="mt-1 text-xs text-indigo-100 font-medium max-w-lg leading-relaxed">
                                        Kelola kehadiran peserta acara dengan cepat dan real-time menggunakan QR Code.
                                    </p>
                                    
                                    <div className="mt-4">
                                        <Link
                                            href={route('scanner')}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-700 shadow-md transition-all hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            Buka Scanner
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions (Bento Grid Style) */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 px-1 flex-none">Menu Cepat</h3>
                                <div className="grid grid-cols-2 gap-3 flex-1" data-aos="fade-up" data-aos-delay="100">
                                    <Link
                                        href={route('participants.index')}
                                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 flex flex-col justify-between"
                                    >
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-blue-50 transition-transform group-hover:scale-150"></div>
                                        <div className="relative z-10 flex flex-col h-full gap-2">
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-sm">Kelola Peserta</h3>
                                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Data peserta & QR Code.</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('report')}
                                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 flex flex-col justify-between"
                                    >
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-teal-50 transition-transform group-hover:scale-150"></div>
                                        <div className="relative z-10 flex flex-col h-full gap-2">
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-sm">Laporan Hadir</h3>
                                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Rekapan absensi event.</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('admin.master-qr')}
                                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 flex flex-col justify-between"
                                    >
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-amber-50 transition-transform group-hover:scale-150"></div>
                                        <div className="relative z-10 flex flex-col h-full gap-2">
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-sm">Master QR</h3>
                                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Untuk self check-in.</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('events.index')}
                                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 flex flex-col justify-between"
                                    >
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-purple-50 transition-transform group-hover:scale-150"></div>
                                        <div className="relative z-10 flex flex-col h-full gap-2">
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-sm">Kelola Event</h3>
                                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Buat/hapus event.</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* SECONDARY COLUMN (Kanan - ~40%) */}
                        <div className="lg:col-span-5 flex-1 min-h-0" data-aos="fade-up" data-aos-delay="200">
                            <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
                                {/* Header Card */}
                                <div className="bg-slate-50/80 border-b border-slate-100 p-4 flex-none">
                                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                        Statistik Kehadiran
                                    </h3>
                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">Ringkasan absensi event aktif.</p>
                                </div>
                                
                                {/* Ringkasan Angka */}
                                <div className="p-4 space-y-4 flex-1 flex flex-col justify-center">
                                    {/* Progress Bar Besar */}
                                    <div>
                                        <div className="flex items-end justify-between mb-2">
                                            <div>
                                                <span className="text-2xl font-black text-indigo-600">{attendancePercentage}%</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Hadir</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-700">{stats.hadir}</span>
                                                <span className="text-[10px] font-medium text-slate-500"> / {stats.total} Orang</span>
                                            </div>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out relative"
                                                style={{ width: `${attendancePercentage}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 my-1" />

                                    {/* Grid Rincian */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 transition-colors hover:bg-emerald-50 hover:border-emerald-100">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sudah Hadir</span>
                                            </div>
                                            <p className="text-2xl font-black text-slate-800">{stats.hadir}</p>
                                        </div>
                                        
                                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 transition-colors hover:bg-amber-50 hover:border-amber-100">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Belum Hadir</span>
                                            </div>
                                            <p className="text-2xl font-black text-slate-800">{stats.belum}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2.5">
                                            <div className="rounded bg-indigo-100 p-1.5 text-indigo-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Total Peserta</span>
                                                <p className="text-lg font-black text-slate-800">{stats.total}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            {/* Add Custom Animations */}
            <style jsx="true">{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
