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
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none"></div>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <nav className="relative z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md flex-none">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center gap-8">
                                <Link href="/" className="flex items-center gap-3">
                                    <img
                                        src="/images/logo.png"
                                        alt="Logo SMAN 1 Babat"
                                        className="h-8 w-8 object-contain"
                                    />
                                    <div>
                                        <span className="font-extrabold text-sm tracking-tight text-slate-900 block">SMABA EVENT</span>
                                        <span className="text-[9px] text-indigo-600 block -mt-1 font-semibold">Panitia Panel</span>
                                    </div>
                                </Link>

                                <div className="hidden space-x-6 sm:-my-px sm:flex h-full">
                                    <Link
                                        href={route('dashboard')}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all ${
                                            route().current('dashboard')
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href={route('events.index')}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all ${
                                            route().current('events.index')
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                    >
                                        Kelola Event
                                    </Link>
                                    <Link
                                        href={route('participants.index')}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all ${
                                            route().current('participants.index')
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                    >
                                        Peserta
                                    </Link>
                                    <Link
                                        href={route('admin.master-qr')}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all ${
                                            route().current('admin.master-qr')
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                    >
                                        Master QR
                                    </Link>
                                    <Link
                                        href={route('report')}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all ${
                                            route().current('report')
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                    >
                                        Laporan
                                    </Link>
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-4">
                                {/* Active Event Badge */}
                                <Link
                                    href={route('events.index')}
                                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm border ${
                                        activeEvent
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    }`}
                                    title="Klik untuk kelola event"
                                >
                                    <span className={`h-2 w-2 rounded-full ${activeEvent ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                    <span className="truncate max-w-[150px]">
                                        {activeEvent ? activeEvent.nama_event : 'Belum Ada Event Aktif'}
                                    </span>
                                </Link>

                                <div className="relative ms-1">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold leading-4 text-slate-700 transition hover:text-slate-900 focus:outline-none shadow-sm"
                                                >
                                                    {user.name}
                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4 text-slate-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                                className="block w-full px-4 py-2 text-left text-sm leading-5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition font-medium"
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="block w-full px-4 py-2 text-left text-sm leading-5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition font-medium"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            {/* Mobile Hamburger */}
                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowShowingNavigationDropdown((prev) => !prev)}
                                    className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none border border-transparent hover:border-slate-200"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Dropdown */}
                    <div className={showingNavigationDropdown ? 'block' : 'hidden'}>
                        <div className="space-y-1 pb-3 pt-2 px-4 border-t border-slate-200 bg-white">
                            <Link
                                href={route('dashboard')}
                                className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-semibold rounded-r-lg ${
                                    route().current('dashboard')
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('events.index')}
                                className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-semibold rounded-r-lg ${
                                    route().current('events.index')
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                Kelola Event
                            </Link>
                            <Link
                                href={route('participants.index')}
                                className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-semibold rounded-r-lg ${
                                    route().current('participants.index')
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                Peserta
                            </Link>
                            <Link
                                href={route('admin.master-qr')}
                                className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-semibold rounded-r-lg ${
                                    route().current('admin.master-qr')
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                Master QR
                            </Link>
                            <Link
                                href={route('report')}
                                className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-semibold rounded-r-lg ${
                                    route().current('report')
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                Laporan
                            </Link>
                        </div>

                        <div className="border-t border-slate-200 pb-3 pt-4 px-4 bg-slate-50">
                            <div className="px-3">
                                <div className="text-base font-bold text-slate-800">{user.name}</div>
                                <div className="text-sm font-medium text-slate-500">{user.email}</div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <Link
                                    href={route('profile.edit')}
                                    className="block pl-3 pr-4 py-2 text-base font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
                                >
                                    Profile
                                </Link>
                                <Link
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    className="block w-full text-left pl-3 pr-4 py-2 text-base font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Sub Header */}
                {header && (
                    <header className="relative z-10 bg-white border-b border-slate-200/80 shadow-sm flex-none">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                            {header}
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
