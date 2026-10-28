import { appUrl } from '@/lib/appUrl';
import { cx } from '@/ui';
import ThemeMenu from '@/ui/ThemeMenu';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { FileClock, Home, LogOut, UserRound } from 'lucide-react';

const NAV = [
    { route: 'participant.dashboard', label: 'Beranda', icon: Home },
    { route: 'leave.history', label: 'Riwayat izin', icon: FileClock },
];

/**
 * Kerangka halaman peserta (guru/pegawai yang login dengan NIP di web): bilah atas berisi logo,
 * dua menu, tampilan, dan akun. Satu kolom konten; di HP menu pindah ke bilah bawah.
 */
export default function ParticipantShell({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="flex min-h-dvh flex-col bg-app text-ink">
            <a href="#konten" className="sr-only z-50 rounded-lg bg-surface px-4 py-2 text-sm font-medium text-ink shadow-lg focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
                Langsung ke konten
            </a>

            <header className="sticky top-0 z-30 border-b border-line bg-app/95 backdrop-blur supports-[backdrop-filter]:bg-app/80">
                <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4 sm:px-6">
                    <Link href={route('participant.dashboard')} className="flex min-w-0 items-center gap-3">
                        <img src={appUrl('images/logo.png')} alt="" className="h-8 w-8 shrink-0 object-contain" />
                        <span className="hidden leading-tight sm:block">
                            <span className="block text-sm font-semibold text-ink">E-Presensi</span>
                            <span className="block text-xs text-ink-2">SMA Negeri 1 Babat</span>
                        </span>
                    </Link>

                    <nav className="ml-4 hidden flex-1 items-center gap-1 sm:flex" aria-label="Menu peserta">
                        {NAV.map((item) => <NavLink key={item.route} item={item} />)}
                    </nav>
                    <div className="flex-1 sm:hidden" />

                    <ThemeMenu />
                    <AccountMenu user={user} />
                </div>
            </header>

            {header && <div className="mx-auto w-full max-w-4xl px-4 pt-6 sm:px-6">{header}</div>}

            <main id="konten" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-6 focus:outline-none sm:px-6 sm:pb-10">
                {children}
            </main>

            <footer className="hidden px-4 pb-6 text-center text-xs text-ink-2 sm:block">
                &copy; {new Date().getFullYear()} E-Presensi SMA Negeri 1 Babat
            </footer>

            {/* HP: menu utama di bawah, terjangkau ibu jari */}
            <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden" aria-label="Menu peserta">
                {NAV.map((item) => {
                    const active = route().current(item.route);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.route}
                            href={route(item.route)}
                            aria-current={active ? 'page' : undefined}
                            className={cx('flex h-16 flex-col items-center justify-center gap-1 text-xs', active ? 'font-semibold text-accent' : 'text-ink-2')}
                        >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

function NavLink({ item }) {
    const active = route().current(item.route);
    return (
        <Link
            href={route(item.route)}
            aria-current={active ? 'page' : undefined}
            className={cx('inline-flex h-10 items-center rounded-lg px-3 text-sm transition-colors', active ? 'bg-accent-soft font-semibold text-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}
        >
            {item.label}
        </Link>
    );
}

function AccountMenu({ user }) {
    const item = 'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink data-[focus]:bg-surface-2';

    return (
        <Menu>
            <MenuButton
                aria-label={`Akun ${user.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-ink-2 hover:text-ink data-[open]:ring-2 data-[open]:ring-accent"
            >
                {user.name.charAt(0).toUpperCase()}
            </MenuButton>
            <MenuItems anchor={{ to: 'bottom end', gap: 8 }} className="z-50 w-60 rounded-xl border border-line bg-surface p-1 shadow-xl focus:outline-none">
                <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-2">{user.username || user.email}</p>
                </div>
                <div className="my-1 border-t border-line" />
                <MenuItem>
                    <Link href={route('profile.edit')} className={item}>
                        <UserRound className="h-4 w-4 text-ink-2" aria-hidden="true" />Profil
                    </Link>
                </MenuItem>
                <MenuItem>
                    <Link href={route('logout')} method="post" as="button" className={item}>
                        <LogOut className="h-4 w-4 text-ink-2" aria-hidden="true" />Keluar
                    </Link>
                </MenuItem>
            </MenuItems>
        </Menu>
    );
}
