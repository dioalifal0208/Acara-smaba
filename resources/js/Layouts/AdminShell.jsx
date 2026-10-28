import AdminNotificationBell from '@/Components/AdminNotificationBell';
import SyncButton from '@/Components/SyncButton';
import { useWebSyncSignal } from '@/lib/webSyncSignal';
import { IconButton } from '@/ui/Button';
import { adminNavigation, currentNavItem } from '@/ui/navigation';
import { CountBadge } from '@/ui/StatusPill';
import ThemeMenu from '@/ui/ThemeMenu';
import { cx } from '@/ui/cx';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const today = () => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Kerangka halaman admin: sidebar berkelompok di layar ≥1024px, drawer di layar lebih kecil,
 * bilah atas berisi tanggal hari ini, Sync, dan notifikasi.

 */
export default function AdminShell({ header, children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const current = currentNavItem();

    // Tutup drawer setiap kali pindah halaman.
    useEffect(() => router.on('navigate', () => setDrawerOpen(false)), []);

    // Data baru dari aplikasi Android (tarik ke bawah / presensi / izin) langsung tampil di halaman ini.
    useWebSyncSignal();

    return (
        <div className="flex h-dvh overflow-hidden bg-app text-ink">
            <a
                href="#konten"
                className="sr-only z-[70] rounded-lg bg-surface px-4 py-2 text-sm font-medium text-ink shadow-lg focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
            >
                Langsung ke konten
            </a>

            <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
                <SidebarContent />
            </aside>

            <Dialog open={drawerOpen} onClose={setDrawerOpen} className="relative z-50 lg:hidden">
                <DialogBackdrop transition className="fixed inset-0 bg-black/40 transition-opacity duration-200 data-[closed]:opacity-0" />
                <DialogPanel
                    transition
                    aria-label="Menu utama"
                    className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-xl transition duration-200 ease-out data-[closed]:-translate-x-full motion-reduce:transition-none"
                >
                    <SidebarContent onClose={() => setDrawerOpen(false)} />
                </DialogPanel>
            </Dialog>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 flex-none items-center gap-2 border-b border-line bg-app px-2 sm:px-4 lg:px-6">
                    <IconButton icon={Menu} label="Buka menu" onClick={() => setDrawerOpen(true)} className="lg:hidden" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink lg:hidden">{current?.label ?? 'E-Presensi SMABA'}</p>
                        <p className="hidden text-sm text-ink-2 lg:block">{today()}</p>
                    </div>
                    <ThemeMenu />
                    <SyncButton />
                    <AdminNotificationBell />
                </header>

                <main id="konten" tabIndex={-1} className="relative flex min-h-0 flex-1 flex-col overflow-y-auto focus:outline-none">
                    {header}
                    {children}
                    <footer className="mt-auto px-4 py-4 text-xs text-ink-3 sm:px-6">
                        &copy; {new Date().getFullYear()} E-Presensi SMABA · SMA Negeri 1 Babat
                    </footer>
                </main>
            </div>
        </div>
    );
}

function SidebarContent({ onClose }) {
    const { props } = usePage();
    const user = props.auth.user;

    return (
        <>
            <div className="flex h-14 flex-none items-center gap-3 border-b border-line pl-5 pr-2">
                <img src="/images/logo.png" alt="" className="h-8 w-8 object-contain" />
                <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-semibold text-ink">E-Presensi</p>
                    <p className="truncate text-xs text-ink-2">SMA Negeri 1 Babat</p>
                </div>
                {onClose && <IconButton icon={X} label="Tutup menu" onClick={onClose} />}
            </div>

            <nav aria-label="Menu utama" className="flex-1 overflow-y-auto px-3 pb-4">
                {adminNavigation.map((group) => (
                    <div key={group.label} className="mt-5">
                        <p className="mb-1 px-3 text-xs font-medium text-ink-3" id={`nav-${group.label}`}>{group.label}</p>
                        <ul aria-labelledby={`nav-${group.label}`} className="space-y-0.5">
                            {group.items.map((item) => (
                                <li key={item.route}>
                                    <NavItem item={item} badge={item.badge?.(props) ?? 0} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="flex flex-none items-center gap-3 border-t border-line py-3 pl-5 pr-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-ink-2" aria-hidden="true">
                    {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-2">{user.email}</p>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    aria-label="Keluar"
                    title="Keluar"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                </Link>
            </div>
        </>
    );
}

function NavItem({ item, badge }) {
    const active = route().current(item.match);
    const Icon = item.icon;

    return (
        <Link
            href={route(item.route)}
            aria-current={active ? 'page' : undefined}
            className={cx(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                active ? 'bg-accent-soft font-semibold text-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
            )}
        >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {badge > 0 && (
                <>
                    <CountBadge count={badge} />
                    <span className="sr-only">, {badge} menunggu</span>
                </>
            )}
        </Link>
    );
}
