import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useState, useEffect } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('profile-info');

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">Pengaturan Profil</h2>
            }
        >
            <Head title="Pengaturan Profil" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col w-full max-w-7xl mx-auto overflow-hidden">


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                    {/* Left Sidebar Menu */}
                    <div className={`hidden lg:block lg:col-span-3 transition-all duration-700 ease-out delay-100 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-2 shadow-sm">
                            <nav className="flex flex-col space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile-info')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors w-full text-left ${activeTab === 'profile-info' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Informasi Profil
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors w-full text-left ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Keamanan
                                </button>
                                <button
                                    onClick={() => setActiveTab('danger-zone')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors w-full text-left ${activeTab === 'danger-zone' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-red-50 hover:text-red-700'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Hapus Akun
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="col-span-1 lg:col-span-9 flex-1 min-h-0 overflow-y-auto pb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {activeTab === 'profile-info' && (
                            <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-10 min-h-full animate-[fadeIn_0.3s_ease-out]">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-2xl"
                                />
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-10 min-h-full animate-[fadeIn_0.3s_ease-out]">
                                <UpdatePasswordForm className="max-w-2xl" />
                            </div>
                        )}

                        {activeTab === 'danger-zone' && (
                            <div className="bg-white border border-red-200/60 shadow-sm shadow-red-500/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden min-h-full animate-[fadeIn_0.3s_ease-out]">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-red-50 blur-3xl opacity-50 pointer-events-none"></div>
                                <DeleteUserForm className="max-w-2xl relative z-10" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
