import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import LeaveRequestModal from '@/Components/LeaveRequestModal';
import SelfFaceRegistrationModal from '@/Components/SelfFaceRegistrationModal';
import FaceScannerModal from '@/Components/FaceScannerModal';
import { useState } from 'react';

export default function ParticipantDashboard({ activeWorkcode, participant }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    
    // Default tangal ke hari ini, format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Peserta" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-y-auto h-full w-full custom-scrollbar">
                <div className="mx-auto max-w-7xl w-full pb-10">
                    
                    {/* Top Bar (User Profile) */}
                    <div className="flex justify-end mb-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm text-slate-500 font-medium">Masuk sebagai</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')} className="font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 py-2">
                                    Pengaturan Profil
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="font-medium text-red-600 hover:text-red-700 hover:bg-red-50 py-2 w-full text-left">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold">Halo, {participant?.nama || 'Peserta'}!</h3>
                            <p className="text-gray-600 mt-2">NIP: {participant?.nis_nip}</p>
                            <p className="text-gray-600">Anda berhasil login ke sistem presensi.</p>
                        </div>
                    </div>

                    {activeWorkcode ? (
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden shadow-xl sm:rounded-2xl border border-indigo-200">
                            <div className="p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-sm font-semibold mb-4 backdrop-blur-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                                        Sedang Berlangsung
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                                        {activeWorkcode.nama_workcode}
                                    </h3>
                                    <p className="text-indigo-100 mb-2">
                                        Lokasi: {activeWorkcode.lokasi}
                                    </p>
                                    <p className="text-indigo-100 mb-6 max-w-xl">
                                        {activeWorkcode.deskripsi || 'Silakan lakukan presensi sekarang menggunakan fitur Face Recognition.'}
                                    </p>
                                    
                                    {participant ? (
                                        participant.face_status === 'approved' ? (
                                            <button 
                                                onClick={() => setShowScannerModal(true)}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Presensi via Wajah Sekarang
                                            </button>
                                        ) : participant.face_status === 'pending' ? (
                                            <div className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500/20 text-yellow-100 font-bold rounded-xl border border-yellow-400/50 w-full sm:w-auto">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Menunggu Persetujuan Wajah
                                            </div>
                                        ) : participant.face_status === 'rejected' ? (
                                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                                <span className="text-red-200 font-medium text-sm text-center sm:text-left bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30">
                                                    Wajah ditolak oleh Admin.
                                                </span>
                                                <button 
                                                    onClick={() => setShowFaceRegistrationModal(true)}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:bg-red-50 hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    </svg>
                                                    Daftar Ulang Wajah
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setShowFaceRegistrationModal(true)}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Daftarkan Wajah Saya
                                            </button>
                                        )
                                    ) : (
                                        <div className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500/20 text-red-100 font-bold rounded-xl border border-red-400/50 w-full sm:w-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Data Peserta Tidak Ditemukan
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => setShowLeaveModal(true)}
                                        className="mt-4 sm:mt-0 sm:ml-4 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white font-bold rounded-xl border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Ajukan Izin / Sakit
                                    </button>
                                </div>
                                
                                <div className="hidden sm:flex shrink-0 w-32 h-32 bg-white/10 rounded-full items-center justify-center border border-white/20 backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 overflow-hidden shadow-inner sm:rounded-2xl border border-gray-200">
                            <div className="p-10 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Workcode Aktif</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Saat ini belum ada workcode yang dibuka oleh Panitia. Silakan kembali lagi nanti untuk melakukan presensi.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
