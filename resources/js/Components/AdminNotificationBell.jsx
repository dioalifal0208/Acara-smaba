import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import Button from '@/ui/Button';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Interval cek pekerjaan baru saat tab terlihat. */
const POLL_MS = 60_000;
const SEEN_KEY = 'admin-notifications:last-opened';
const NOTIFIED_KEY = 'admin-notifications:notified';

const TYPE_STYLES = {
    photo_change: { dot: 'bg-status-telat', chip: 'bg-status-telat-soft text-status-telat' },
    face_registration: { dot: 'bg-status-hadir', chip: 'bg-status-hadir-soft text-status-hadir' },
    leave: { dot: 'bg-status-izin', chip: 'bg-status-izin-soft text-status-izin' },
};

const storage = {
    get(key, fallback) {
        try {
            const value = window.localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Penyimpanan browser tidak tersedia (mode privat); notifikasi tetap berjalan tanpa penanda "baru".
        }
    },
};

const relativeTime = (iso) => {
    if (!iso) return '';
    const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
    const steps = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];
    for (const [unit, size] of steps) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
    }
    return 'baru saja';
};

const browserNotificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

/**
 * Lonceng notifikasi admin: jumlah pekerjaan yang menunggu verifikasi (ganti foto, pendaftaran wajah,
 * izin, pindah perangkat) dari server. Item hilang sendiri setelah diproses admin.
 */
export default function AdminNotificationBell({ className = '' }) {
    const shared = usePage().props.adminNotifications;
    const [data, setData] = useState(shared);
    const [open, setOpen] = useState(false);
    const [lastOpened, setLastOpened] = useState(() => storage.get(SEEN_KEY, null));
    const [permission, setPermission] = useState(() => (browserNotificationsSupported() ? Notification.permission : 'unsupported'));
    const [position, setPosition] = useState(null);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
    const knownIdsRef = useRef(new Set((shared?.items ?? []).map((item) => item.id)));

    // Data dari server ikut diperbarui setiap navigasi Inertia.
    useEffect(() => {
        if (shared) setData(shared);
    }, [shared]);

    const notifyNewItems = useCallback((items) => {
        const fresh = items.filter((item) => !knownIdsRef.current.has(item.id));
        items.forEach((item) => knownIdsRef.current.add(item.id));
        if (fresh.length === 0 || !browserNotificationsSupported() || Notification.permission !== 'granted') return;

        // Satu notifikasi per item meski admin membuka beberapa tab.
        const notified = storage.get(NOTIFIED_KEY, []);
        const toNotify = fresh.filter((item) => !notified.includes(item.id));
        storage.set(NOTIFIED_KEY, [...notified, ...toNotify.map((item) => item.id)].slice(-200));

        toNotify.slice(0, 3).forEach((item) => {
            const notification = new Notification(item.title, { body: item.body, tag: item.id });
            notification.onclick = () => {
                window.focus();
                window.location.href = item.url;
            };
        });
    }, []);

    const refresh = useCallback(async () => {
        try {
            const response = await window.axios.get(route('admin.notifications'));
            setData(response.data);
            notifyNewItems(response.data.items ?? []);
        } catch {
            // Gagal jaringan: coba lagi pada interval berikutnya.
        }
    }, [notifyNewItems]);

    useEffect(() => {
        const tick = () => {
            if (document.visibilityState === 'visible') refresh();
        };
        const interval = window.setInterval(tick, POLL_MS);
        document.addEventListener('visibilitychange', tick);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', tick);
        };
    }, [refresh]);

    const total = data?.total ?? 0;

    // Item yang sudah terlihat di panel tidak lagi ditandai "Baru".
    const closePanel = useCallback(() => {
        const now = new Date().toISOString();
        storage.set(SEEN_KEY, now);
        setLastOpened(now);
        setOpen(false);
    }, []);

    useLayoutEffect(() => {
        if (!open || !buttonRef.current) return;
        const place = () => {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + 8, right: Math.max(16, window.innerWidth - rect.right) });
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = (event) => {
            if (event.type === 'keydown' && event.key !== 'Escape') return;
            if (event.type === 'mousedown' && (panelRef.current?.contains(event.target) || buttonRef.current?.contains(event.target))) return;
            closePanel();
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', close);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', close);
        };
    }, [open, closePanel]);

    const toggle = () => {
        if (open) {
            closePanel();
            return;
        }
        refresh();
        setOpen(true);
    };

    const enableBrowserNotifications = async () => {
        if (!browserNotificationsSupported()) return;
        setPermission(await Notification.requestPermission());
    };

    if (!data) return null;

    const groups = (data.groups ?? []).filter((group) => group.count > 0);
    const items = data.items ?? [];
    const isNew = (item) => !lastOpened || (item.created_at && item.created_at > lastOpened);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggle}
                aria-label={total > 0 ? `Notifikasi, ${total} menunggu verifikasi` : 'Notifikasi'}
                aria-expanded={open}
                aria-haspopup="dialog"
                title="Notifikasi"
                className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink ${className}`}
            >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {total > 0 && (
                    <span className="absolute right-0.5 top-0.5 min-w-5 rounded-full bg-danger px-1 text-center text-xs font-semibold leading-5 text-surface ring-2 ring-app" aria-hidden="true">
                        {total > 99 ? '99+' : total}
                    </span>
                )}
            </button>

            {open && position && createPortal(
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Notifikasi admin"
                    style={{ top: position.top, right: position.right }}
                    className="fixed z-[60] flex max-h-[min(32rem,calc(100dvh-6rem))] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
                >
                    <div className="flex items-center justify-between gap-2 border-b border-line py-2 pl-4 pr-2">
                        <div>
                            <p className="text-sm font-semibold text-ink">Notifikasi</p>
                            <p className="text-xs text-ink-2">
                                {total > 0 ? `${total} menunggu verifikasi` : 'Tidak ada yang perlu diverifikasi'}
                            </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={refresh}>Muat ulang</Button>
                    </div>

                    {groups.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
                            {groups.map((group) => (
                                <Link
                                    key={group.type}
                                    href={group.url}
                                    onClick={closePanel}
                                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium ${TYPE_STYLES[group.type]?.chip ?? 'bg-surface-2 text-ink-2'}`}
                                >
                                    {group.label}
                                    <span className="font-semibold tabular-nums">{group.count}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-sm font-medium text-ink">Semua sudah diverifikasi</p>
                                <p className="mt-1 text-xs text-ink-2">Pengajuan baru akan muncul di sini.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-line">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url}
                                            onClick={closePanel}
                                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                                        >
                                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_STYLES[item.type]?.dot ?? 'bg-ink-3'}`} aria-hidden="true" />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-medium text-ink">{item.title}</span>
                                                    {isNew(item) && (
                                                        <span className="shrink-0 rounded bg-danger-soft px-1.5 text-xs font-medium text-danger">Baru</span>
                                                    )}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-ink-2">{item.body}</span>
                                                <span className="mt-1 block text-xs text-ink-3">{relativeTime(item.created_at)}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {permission === 'default' && (
                        <div className="border-t border-line bg-surface-2 px-4 py-3">
                            <button type="button" onClick={enableBrowserNotifications} className="text-sm font-medium text-accent hover:underline">
                                Aktifkan notifikasi browser
                            </button>
                            <p className="mt-0.5 text-xs text-ink-2">Tampilkan pemberitahuan saat ada pengajuan baru, selama halaman admin terbuka.</p>
                        </div>
                    )}
                </div>,
                document.body,
            )}
        </>
    );
}
