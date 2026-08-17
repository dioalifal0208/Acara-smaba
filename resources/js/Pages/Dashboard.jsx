import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { useEffect, useState } from 'react';

export default function Dashboard({ stats, activeEvent: propActiveEvent, pendingLeaveCount }) {
    const { auth, activeEvent: globalActiveEvent } = usePage().props;
    const activeEvent = propActiveEvent || globalActiveEvent;
    const user = auth.user;
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    
    // For staggered entry animations
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-3 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col w-full max-w-7xl mx-auto overflow-hidden">
                
                {/* Header Section (User Profile & Title) */}
                <div className={`relative z-30 flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 transition-all duration-700 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Pantau performa presensi SMA Negeri 1 Babat.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-start sm:self-auto z-20">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="group relative flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-md border border-white/80 p-1.5 pr-4 shadow-sm transition-all hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                                        <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-indigo-600">
                                            <span className="font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                                        <p className="text-[10px] font-semibold text-slate-500 leading-tight">Admin</p>
                                    </div>
                                    <svg className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors hidden sm:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content contentClasses="py-1 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden mt-2">
                                <div className="px-4 py-3 border-b border-slate-100/50 bg-slate-50/50">
                                    <p className="text-xs text-slate-500 font-medium">Masuk sebagai</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                <div className="p-1">
                                    <Dropdown.Link href={route('profile.edit')} className="text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg py-2 transition-colors">
                                        Pengaturan Profil
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg py-2 w-full text-left transition-colors">
                                        Log Out
                                    </Dropdown.Link>
                                </div>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
                
                {/* Alerts Area */}
                <div className="space-y-2 mb-4 flex-none">
                    {/* No Event Banner */}
                    {!activeEvent && (
                        <div className={`overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-1 shadow-sm transition-all duration-500 ease-out transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-4 bg-white/40 backdrop-blur-sm rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-amber-400 rounded-xl blur opacity-50 animate-pulse"></div>
                                        <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-amber-900 tracking-tight">Belum Ada Event Aktif</h3>
                                        <p className="text-sm text-amber-700 font-medium mt-0.5">
                                            Pilih atau buat event terlebih dahulu agar sistem presensi dapat berjalan.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('events.index')}
                                    className="w-full sm:w-auto shrink-0 inline-flex justify-center items-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-600/20 transition-all hover:bg-amber-700 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Kelola Event
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pending Leave Banner */}
                    {pendingLeaveCount > 0 && (
                        <div className={`overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 p-1 shadow-sm transition-all duration-500 ease-out delay-100 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-4 bg-white/40 backdrop-blur-sm rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-10">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
                                        </span>
                                        <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-blue-900 tracking-tight">Terdapat {pendingLeaveCount} Pengajuan Izin</h3>
                                        <p className="text-sm text-blue-700 font-medium mt-0.5">
                                            Segera verifikasi pengajuan izin/sakit dari peserta.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.leave.index')}
                                    className="w-full sm:w-auto shrink-0 inline-flex justify-center items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Verifikasi Sekarang
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                    
                    {/* Left Column (Hero & Quick Actions) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-h-0">
                        
                        {/* Premium Hero / Welcome Banner */}
                        <div className={`relative overflow-hidden rounded-3xl p-6 lg:p-8 shadow-2xl flex-none transition-all duration-700 ease-out delay-200 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {/* Animated Mesh Background */}
                            <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[140%] rounded-full bg-indigo-600/40 mix-blend-screen filter blur-[80px] animate-blob"></div>
                                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] rounded-full bg-violet-600/40 mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000"></div>
                                <div className="absolute bottom-[-30%] left-[20%] w-[80%] h-[120%] rounded-full bg-fuchsia-600/40 mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50"></div>
                                {/* Optional subtle noise/grid pattern */}
                                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-center">
                                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 border shadow-sm backdrop-blur-md bg-white/10 border-white/20 self-start">
                                    <span className={`relative flex h-2.5 w-2.5`}>
                                        {activeEvent && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeEvent ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`}></span>
                                    </span>
                                    <span className={`text-[11px] font-bold tracking-widest uppercase ${activeEvent ? 'text-emerald-50' : 'text-amber-50'}`}>
                                        {activeEvent ? activeEvent.nama_event : 'Standby Mode'}
                                    </span>
                                </div>
                                
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] drop-shadow-sm">
                                    E-Presensi <br className="hidden sm:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">
                                        SMA NEGERI 1 BABAT
                                    </span>
                                </h1>
                                <p className="mt-4 text-sm sm:text-base text-indigo-100/90 font-medium max-w-xl leading-relaxed">
                                    Kelola kehadiran secara real-time dengan teknologi scan QR dan Face Recognition yang terintegrasi.
                                </p>
                                
                                <div className="mt-4 lg:mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={route('scanner')}
                                        className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-indigo-50 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:translate-y-0 group"
                                    >
                                        <div className="rounded-full bg-indigo-100 p-1.5 text-indigo-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        Buka Scanner
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Bento Grid - Quick Actions */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className={`text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2 transition-all duration-700 ease-out delay-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Akses Cepat
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                                
                                {/* Item 1 */}
                                <Link
                                    href={route('participants.index')}
                                    className={`group relative overflow-hidden rounded-2xl bg-white p-3 sm:p-4 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1.5 flex flex-col items-center justify-center text-center transform ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    style={{ transitionDelay: '350ms' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative z-10">
                                        <div className="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-extrabold text-slate-800 text-sm mb-1 group-hover:text-blue-700 transition-colors">Data Peserta</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Kelola & cetak QR</p>
                                    </div>
                                </Link>

                                {/* Item 2 */}
                                <Link
                                    href={route('report')}
                                    className={`group relative overflow-hidden rounded-2xl bg-white p-3 sm:p-4 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-1.5 flex flex-col items-center justify-center text-center transform ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    style={{ transitionDelay: '400ms' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative z-10">
                                        <div className="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-extrabold text-slate-800 text-sm mb-1 group-hover:text-emerald-700 transition-colors">Laporan</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Rekap absensi</p>
                                    </div>
                                </Link>

                                {/* Item 3 */}
                                <Link
                                    href={route('admin.master-qr')}
                                    className={`group relative overflow-hidden rounded-2xl bg-white p-3 sm:p-4 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 hover:-translate-y-1.5 flex flex-col items-center justify-center text-center transform ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    style={{ transitionDelay: '450ms' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative z-10">
                                        <div className="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-extrabold text-slate-800 text-sm mb-1 group-hover:text-amber-700 transition-colors">Master QR</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Self check-in</p>
                                    </div>
                                </Link>

                                {/* Item 4 */}
                                <Link
                                    href={route('events.index')}
                                    className={`group relative overflow-hidden rounded-2xl bg-white p-3 sm:p-4 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 hover:-translate-y-1.5 flex flex-col items-center justify-center text-center transform ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    style={{ transitionDelay: '500ms' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative z-10">
                                        <div className="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-extrabold text-slate-800 text-sm mb-1 group-hover:text-purple-700 transition-colors">Workcode</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Konfigurasi</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Statistics) */}
                    <div className="lg:col-span-5 xl:col-span-4 flex-1 min-h-0">
                        <div className={`relative h-full rounded-3xl bg-white border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col transition-all duration-700 ease-out delay-500 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                            
                            {/* Decorative Background for Stats */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-50 blur-3xl opacity-60"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-50 blur-3xl opacity-60"></div>

                            {/* Stats Header */}
                            <div className="relative z-10 p-5 pb-2">
                                <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
                                    <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </span>
                                    Statistik Presensi
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-2 pl-9">
                                    {activeEvent ? `Data dari event: ${activeEvent.nama_event}` : 'Ringkasan presensi (Tidak ada event aktif)'}
                                </p>
                            </div>
                            
                            {/* Stats Content */}
                            <div className="relative z-10 p-5 pt-3 space-y-4 lg:space-y-6 flex-1 flex flex-col">
                                
                                {/* Progress Indicator */}
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex-none">
                                    <div className="flex items-end justify-between mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tingkat Kehadiran</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-indigo-600 tracking-tighter">{attendancePercentage}</span>
                                                <span className="text-xl font-bold text-indigo-400">%</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Hadir</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-extrabold text-slate-800">{stats.hadir}</span>
                                                <span className="text-xs font-medium text-slate-500">/ {stats.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Premium Progress Bar */}
                                    <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200/70 shadow-inner relative">
                                        <div
                                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] transition-all duration-1500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                            style={{ width: `${mounted ? attendancePercentage : 0}%`, backgroundPosition: mounted ? 'right center' : 'left center' }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Grid */}
                                <div className="grid grid-cols-2 gap-3 lg:gap-4 flex-none">
                                    {/* Card Hadir */}
                                    <div className="relative overflow-hidden rounded-2xl bg-white border border-emerald-100 p-4 shadow-sm group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-emerald-50 transition-transform group-hover:scale-150"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-xs font-bold text-slate-600">Sudah Hadir</span>
                                            </div>
                                            <p className="text-3xl font-black text-slate-800">{stats.hadir}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Card Belum */}
                                    <div className="relative overflow-hidden rounded-2xl bg-white border border-rose-100 p-4 shadow-sm group hover:border-rose-300 hover:shadow-md transition-all duration-300">
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-rose-50 transition-transform group-hover:scale-150"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
                                                <span className="text-xs font-bold text-slate-600">Belum Hadir</span>
                                            </div>
                                            <p className="text-3xl font-black text-slate-800">{stats.belum}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Total Summary */}
                                <div className="mt-auto rounded-2xl bg-slate-900 text-white p-4 flex items-center justify-between relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-80"></div>
                                    {/* Subtle animated pattern */}
                                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-[length:12px_12px] group-hover:animate-pulse"></div>
                                    
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="rounded-xl bg-white/10 backdrop-blur p-2.5 text-white/90">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Keseluruhan</span>
                                            <p className="text-xl font-black text-white">{stats.total} <span className="text-sm font-medium text-slate-400">Peserta</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Custom Animations & Styles */}
            <style jsx="true">{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite alternate ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
