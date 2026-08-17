import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, activeEvent } = usePage().props;
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
                    <header className="relative z-10 bg-white border-b border-slate-200/80 shadow-sm flex-none">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
                            <Link 
                                href={user.role === 'participant' ? route('participant.dashboard') : route('dashboard')}
                                className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 group"
                                title="Kembali ke Dashboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div className="flex-1">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="relative z-10 flex-1 overflow-hidden flex flex-col">{children}</main>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200 bg-white py-3.5 text-center text-xs text-slate-500 font-medium flex-none">
                <p>&copy; {new Date().getFullYear()} SMA Negeri 1 Babat. Hak Cipta Dilindungi.</p>
            </footer>
        </div>
    );
}
