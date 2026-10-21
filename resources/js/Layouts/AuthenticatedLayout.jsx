import AdminNotificationBell from '@/Components/AdminNotificationBell';
import SyncButton from '@/Components/SyncButton';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { accountMenu, adminMenu, currentMenuLabel, icons } from '@/lib/adminMenu';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;

    return auth.user.is_admin
        ? <AdminShell header={header}>{children}</AdminShell>
        : <ParticipantShell header={header}>{children}</ParticipantShell>;
}

/** Admin: sidebar tetap di kiri, bilah atas hanya breadcrumb + ikon (mengikuti Material Dashboard). */
function AdminShell({ header, children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Tutup drawer HP setiap kali pindah halaman.
    useEffect(() => router.on('navigate', () => setDrawerOpen(false)), []);

    const title = currentMenuLabel();

    return (
        <div className="flex h-screen overflow-hidden bg-canvas text-neutral-700">
            {/* Sidebar desktop */}
            <aside className="hidden w-60 shrink-0 py-2 pl-2 xl:block">
                <Sidebar />
            </aside>

            {/* Drawer HP/tablet */}
            <div className={`fixed inset-0 z-50 xl:hidden ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
                <div
                    className={`absolute inset-0 bg-neutral-900/20 transition-opacity duration-200 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setDrawerOpen(false)}
                />
                <div className={`absolute inset-y-0 left-0 w-60 p-2 transition-transform duration-200 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar onClose={() => setDrawerOpen(false)} />
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Bilah atas */}
                <header className="relative z-20 flex-none px-4 pt-3 sm:px-6">
                    <div className="flex items-center gap-4 py-1">
                        <div className="min-w-0 flex-1">
                            <nav className="flex items-center text-sm" aria-label="Breadcrumb">
                                <Link href={route('dashboard')} className="text-neutral-800 opacity-50 transition-opacity hover:opacity-100">Halaman</Link>
                                <span className="px-2 text-neutral-500">/</span>
                                <span className="truncate text-neutral-600" aria-current="page">{title}</span>
                            </nav>
                            {header && (
                                <div className="mt-0.5 min-w-0 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-neutral-800 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-800">
                                    {header}
                                </div>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-4 text-neutral-600">
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(true)}
                                className="flex h-5 w-5 items-center justify-center transition-colors hover:text-neutral-900 xl:hidden"
                                aria-label="Buka menu"
                            >
                                {icons.menu}
                            </button>
                            <SyncButton />
                            <AdminNotificationBell className="!h-8 !w-8 !border-0 !bg-transparent !text-neutral-600 !shadow-none hover:!text-neutral-900" />
                        </div>
                    </div>
                </header>

                <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
                    {children}
                    <footer className="mt-auto px-4 py-4 text-sm text-neutral-500 sm:px-6">
                        &copy; {new Date().getFullYear()} E-Presensi SMABA · SMA Negeri 1 Babat
                    </footer>
                </main>
            </div>
        </div>
    );
}

function Sidebar({ onClose }) {
    const { props } = usePage();
    const user = props.auth.user;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="relative flex items-center gap-2 px-6 py-4">
                <img src="/images/logo.png" alt="" className="h-7 w-7 object-contain" />
                <span className="truncate text-sm text-neutral-800">E-Presensi SMABA</span>
                {onClose && (
                    <button type="button" onClick={onClose} className="absolute right-3 top-3 h-6 w-6 p-1 text-neutral-800 opacity-50 hover:opacity-100" aria-label="Tutup menu">
                        {icons.close}
                    </button>
                )}
            </div>
            <hr className="hr-fade mb-2" />

            <nav className="flex-1 overflow-y-auto pb-4">
                {adminMenu.map((item) => (
                    <NavItem key={item.route} item={item} badge={item.badge ? props[item.badge] : 0} />
                ))}

                <h6 className="ml-2 mt-4 pb-2 pl-4 text-xs font-bold uppercase text-neutral-800 opacity-50">Akun</h6>
                {accountMenu.map((item) => (
                    <NavItem key={item.route} item={item} />
                ))}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="group mx-3 mb-px flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-brand-soft hover:text-brand-700"
                >
                    <span className="h-[18px] w-[18px] shrink-0 opacity-50 group-hover:opacity-80">{icons.logout}</span>
                    Keluar
                </Link>
            </nav>

            <hr className="hr-fade" />
            <div className="flex items-center gap-2 px-6 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-[11px] font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-neutral-800">{user.name}</p>
                    <p className="truncate text-[11px] text-neutral-500">{user.email}</p>
                </div>
            </div>
        </div>
    );
}

function NavItem({ item, badge = 0 }) {
    const active = route().current(item.match);

    return (
        <Link
            href={route(item.route)}
            aria-current={active ? 'page' : undefined}
            className={`group mx-3 my-px flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-brand-gradient text-white shadow-soft' : 'text-neutral-800 hover:bg-brand-soft hover:text-brand-700'
            }`}
        >
            <span className={`h-[18px] w-[18px] shrink-0 ${active ? '' : 'opacity-50 group-hover:opacity-80'}`}>{item.icon}</span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {badge > 0 && (
                <span className={`rounded px-1.5 text-[10px] font-semibold leading-4 ${active ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'}`}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

/** Peserta: tata letak lama (halaman ala aplikasi HP) tetap dipakai. */
function ParticipantShell({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="relative flex h-screen flex-col justify-between overflow-hidden bg-canvas text-neutral-900">
            <div className="flex w-full flex-1 flex-col overflow-hidden">
                {!route().current('participant.dashboard') && (
                    <header className="relative z-10 h-[72px] flex-none overflow-hidden border-b border-neutral-200 bg-white">
                        <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
                            <Link
                                href={user.is_admin ? route('dashboard') : route('participant.dashboard')}
                                className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50"
                                title="Kembali ke Dashboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div className="min-w-0 flex-1">{header}</div>
                        </div>
                    </header>
                )}

                <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
            </div>

            <footer className="relative flex h-11 flex-none items-center justify-center border-t border-neutral-200 bg-white px-4 text-center text-xs text-neutral-400">
                <p>&copy; {new Date().getFullYear()} E-Presensi SMABA. Hak Cipta Dilindungi.</p>
            </footer>
        </div>
    );
}
