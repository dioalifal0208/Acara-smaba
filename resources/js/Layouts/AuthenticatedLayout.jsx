import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, activeWorkcode } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-hidden relative">
            {/* Background decorative glow (subtle) */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-3xl pointer-events-none"></div>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
                {/* Sub Header & Back Button */}
                {(!route().current('dashboard') && !route().current('participant.dashboard')) && (
                    <header className="relative z-10 h-[72px] flex-none overflow-hidden border-b border-slate-200/80 bg-white shadow-sm">
                        <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
                            <Link 
                                href={!user.is_admin ? route('participant.dashboard') : route('dashboard')}
                                className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 group"
                                title="Kembali ke Dashboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div className="min-w-0 flex-1">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
            </div>

            {/* Footer */}
            <footer className="relative flex h-12 flex-none items-center justify-center border-t border-slate-200 bg-white px-4 text-center text-xs font-medium text-slate-500">
                <p>&copy; {new Date().getFullYear()} E-Presensi SMABA. Hak Cipta Dilindungi.</p>
            </footer>
        </div>
    );
}
