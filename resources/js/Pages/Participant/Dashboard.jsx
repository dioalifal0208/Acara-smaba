import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import LeaveRequestModal from '@/Components/LeaveRequestModal';
import SelfFaceRegistrationModal from '@/Components/SelfFaceRegistrationModal';
import FaceScannerModal from '@/Components/FaceScannerModal';
import { useState, useEffect } from 'react';
import AOS from 'aos';

export default function ParticipantDashboard({ activeWorkcode, participant }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    
    // Initialize & refresh AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
        });
        AOS.refresh();
    }, []);

    // Default tanggal ke hari ini, format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const faceStatus = participant?.face_status;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Peserta" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-y-auto h-full w-full custom-scrollbar">
                <div className="mx-auto max-w-7xl w-full pb-10 space-y-6">
                    
                    {/* Top Bar (Header & User Profile Dropdown) */}
                    <div 
                        className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        data-aos="fade-down"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                Portal Peserta E-Presensi
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Halo, {participant?.nama || user.name}! 👋
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Selamat datang di sistem presensi cerdas SMA Negeri 1 Babat.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto relative z-30">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="group inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200/80 p-1.5 pr-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    >
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[2px] shadow-sm">
                                            <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center text-indigo-700 font-black text-sm">
                                                {(participant?.nama || user.name).charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-xs font-extrabold text-slate-800 leading-tight truncate max-w-[150px]">
                                                {participant?.nama || user.name}
                                            </p>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {participant?.status || 'Peserta'}
                                            </p>
                                        </div>
                                        <svg className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="py-1 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl overflow-hidden mt-2 min-w-[200px]">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                                        <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
                                        <p className="text-sm font-extrabold text-slate-900 truncate">{participant?.nama || user.name}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{user.email || user.username}</p>
                                    </div>
                                    <div className="p-1">
                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl py-2 px-3 transition-colors">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Pengaturan Profil
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50/60 rounded-xl py-2 px-3 w-full text-left transition-colors">
                                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log Out
                                        </Dropdown.Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Participant Summary / Status Card */}
                    <div 
                        className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                        data-aos="fade-up"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                {participant?.photo_url ? (
                                    <img 
                                        src={participant.photo_url} 
                                        alt={participant.nama} 
                                        className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-indigo-500/20">
                                        {(participant?.nama || user.name).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {faceStatus === 'approved' && (
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="Wajah Terverifikasi">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                                        {participant?.nama || user.name}
                                    </h2>
                                    {participant?.status && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] font-extrabold text-indigo-700 uppercase">
                                            {participant.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
                                    <span>NIP / NIS: <strong className="text-slate-700">{participant?.nis_nip || '-'}</strong></span>
                                </p>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                            {faceStatus === 'approved' ? (
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Wajah Disetujui
                                </div>
                            ) : faceStatus === 'pending' ? (
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Menunggu Persetujuan Admin
                                </div>
                            ) : faceStatus === 'rejected' ? (
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                                    <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Wajah Ditolak
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-extrabold shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Wajah Belum Terdaftar
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Workcode Banner */}
                    {activeWorkcode ? (
                        <div 
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/10 border border-indigo-400/20"
                            data-aos="fade-up"
                            data-aos-delay="100"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                <div className="flex-1 max-w-2xl">
                                    {/* Workcode Badge */}
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-extrabold mb-4 backdrop-blur-md text-white shadow-sm">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                        </span>
                                        Workcode Aktif • Sedang Berlangsung
                                    </div>

                                    {/* Workcode Name */}
                                    <h3 className="text-2xl sm:text-4xl font-black mb-3 leading-tight tracking-tight text-white drop-shadow-sm">
                                        {activeWorkcode.nama_workcode}
                                    </h3>

                                    {/* Workcode Location */}
                                    <div className="flex items-center gap-2 text-indigo-100 text-sm font-semibold mb-3">
                                        <svg className="h-4 w-4 text-indigo-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Lokasi: <strong className="text-white font-bold">{activeWorkcode.lokasi}</strong></span>
                                    </div>

                                    {/* Workcode Description */}
                                    <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                        {activeWorkcode.deskripsi || 'Silakan lakukan presensi sekarang dengan menggunakan fitur Face Recognition langsung dari perangkat Anda.'}
                                    </p>
                                    
                                    {/* Special Notification Alert for Rejected Face Status */}
                                    {faceStatus === 'rejected' && (
                                        <div 
                                            className="mb-6 rounded-2xl bg-rose-500/20 border border-rose-300/40 p-4 backdrop-blur-md text-rose-50 flex items-start gap-3.5 shadow-sm"
                                            data-aos="zoom-in"
                                        >
                                            <div className="p-2 bg-rose-500/30 rounded-xl shrink-0 text-rose-200 mt-0.5">
                                                <svg className="w-5 h-5 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-white text-sm">Pendaftaran Wajah Ditolak oleh Admin</h4>
                                                <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                                                    Foto wajah yang Anda daftarkan sebelumnya tidak memenuhi kriteria verifikasi. Silakan klik <strong>Daftar Ulang Wajah</strong> untuk mengambil foto baru dengan pencahayaan yang jelas dan menghadap lurus ke kamera.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Notification Alert for Pending Face Status */}
                                    {faceStatus === 'pending' && (
                                        <div 
                                            className="mb-6 rounded-2xl bg-amber-500/20 border border-amber-300/40 p-4 backdrop-blur-md text-amber-50 flex items-start gap-3.5 shadow-sm"
                                            data-aos="zoom-in"
                                        >
                                            <div className="p-2 bg-amber-500/30 rounded-xl shrink-0 text-amber-200 mt-0.5">
                                                <svg className="w-5 h-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-white text-sm">Menunggu Persetujuan Admin</h4>
                                                <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
                                                    Pendaftaran wajah Anda telah dikirim dan sedang dalam antrean review oleh Administrator. Setelah disetujui, tombol presensi wajah akan aktif otomatis.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons Section - Flex container without overlapping */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 w-full">
                                        {participant ? (
                                            faceStatus === 'approved' ? (
                                                <button 
                                                    onClick={() => setShowScannerModal(true)}
                                                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-indigo-700 font-black text-sm rounded-xl shadow-lg hover:bg-indigo-50 hover:shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Presensi via Wajah Sekarang
                                                </button>
                                            ) : faceStatus === 'pending' ? (
                                                <div className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-amber-400/20 text-amber-100 font-bold text-sm rounded-xl border border-amber-300/40 backdrop-blur-md w-full sm:w-auto cursor-not-allowed">
                                                    <svg className="animate-spin h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Menunggu Verifikasi Wajah
                                                </div>
                                            ) : faceStatus === 'rejected' ? (
                                                <button 
                                                    onClick={() => setShowFaceRegistrationModal(true)}
                                                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Daftar Ulang Wajah
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setShowFaceRegistrationModal(true)}
                                                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-indigo-700 font-black text-sm rounded-xl shadow-lg hover:bg-indigo-50 hover:shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Daftarkan Wajah Saya
                                                </button>
                                            )
                                        ) : (
                                            <div className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-rose-500/20 text-rose-100 font-bold text-sm rounded-xl border border-rose-400/40 w-full sm:w-auto">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Data Peserta Tidak Ditemukan
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={() => setShowLeaveModal(true)}
                                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-extrabold text-sm rounded-xl border border-white/25 shadow-md backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Ajukan Izin / Sakit
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Right Decorative Icon Box */}
                                <div className="hidden lg:flex shrink-0 w-40 h-40 bg-white/10 rounded-3xl items-center justify-center border border-white/20 backdrop-blur-md shadow-2xl">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg"></div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/90 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center"
                            data-aos="fade-up"
                            data-aos-delay="100"
                        >
                            <div className="h-20 w-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Belum Ada Workcode Aktif</h3>
                            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                Saat ini belum ada sesi presensi atau workcode yang dibuka oleh Panitia. Silakan kembali lagi nanti untuk melakukan presensi.
                            </p>
                        </div>
                    )}

                    {/* Quick Guide & Info Grid (Bento style) */}
                    <div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        {/* Info 1: Face Recognition */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm mb-1">Presensi via Wajah</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Pastikan pencahayaan cukup dan wajah terlihat jelas. Sistem menerapkan verifikasi liveness acak (senyum, buka mulut, kedip mata, tengok, miringkan kepala) untuk mencegah foto palsu.
                            </p>
                        </div>

                        {/* Info 2: GPS Location */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm mb-1">Geofencing & Lokasi</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Presensi hanya dapat dilakukan ketika Anda berada dalam radius area SMA Negeri 1 Babat.
                            </p>
                        </div>

                        {/* Info 3: Leave Request */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm mb-1">Izin & Sakit</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Apabila berhalangan hadir, gunakan tombol Ajukan Izin / Sakit dengan menyertakan keterangan dan bukti pendukung (surat dokter / foto).
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            {activeWorkcode && (
                <LeaveRequestModal 
                    show={showLeaveModal} 
                    onClose={() => setShowLeaveModal(false)}
                    workcodeId={activeWorkcode.id}
                    tanggal={today}
                />
            )}

            {showFaceRegistrationModal && (
                <SelfFaceRegistrationModal
                    participant={participant}
                    onClose={() => setShowFaceRegistrationModal(false)}
                />
            )}

            {showScannerModal && (
                <FaceScannerModal
                    activeWorkcode={activeWorkcode}
                    participant={participant}
                    onClose={() => setShowScannerModal(false)}
                    onSuccess={() => {
                        setShowScannerModal(false);
                        window.location.reload();
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}

