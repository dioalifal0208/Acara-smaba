import { Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Interval cek pekerjaan baru saat tab terlihat. */
const POLL_MS = 60_000;
const SEEN_KEY = 'admin-notifications:last-opened';
const NOTIFIED_KEY = 'admin-notifications:notified';

const TYPE_STYLES = {
    photo_change: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-100' },
    face_registration: { dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    leave: { dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 border-blue-100' },
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
                aria-label={total > 0 ? `${total} pekerjaan menunggu verifikasi` : 'Notifikasi'}
                aria-expanded={open}
                className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${className}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {total > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white">
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
                    className="fixed z-[60] flex max-h-[min(32rem,calc(100vh-6rem))] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <p className="text-sm font-extrabold text-slate-900">Notifikasi</p>
                            <p className="text-xs font-medium text-slate-500">
                                {total > 0 ? `${total} menunggu verifikasi` : 'Tidak ada yang perlu diverifikasi'}
                            </p>
                        </div>
                        <button type="button" onClick={refresh} className="rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50">
                            Muat ulang
                        </button>
                    </div>

                    {groups.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
                            {groups.map((group) => (
                                <Link
                                    key={group.type}
                                    href={group.url}
                                    onClick={closePanel}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${TYPE_STYLES[group.type]?.chip ?? 'bg-slate-50 text-slate-700 border-slate-100'}`}
                                >
                                    {group.label}
                                    <span className="tabular-nums">{group.count}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-sm font-bold text-slate-700">Semua sudah diverifikasi</p>
                                <p className="mt-1 text-xs text-slate-500">Pengajuan baru akan muncul di sini.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url}
                                            onClick={closePanel}
                                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                                        >
                                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_STYLES[item.type]?.dot ?? 'bg-slate-400'}`} />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-bold text-slate-800">{item.title}</span>
                                                    {isNew(item) && (
                                                        <span className="shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-rose-600">Baru</span>
                                                    )}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-slate-600">{item.body}</span>
                                                <span className="mt-1 block text-[11px] font-medium text-slate-400">{relativeTime(item.created_at)}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {permission === 'default' && (
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                            <button type="button" onClick={enableBrowserNotifications} className="text-xs font-bold text-indigo-600 hover:underline">
                                Aktifkan notifikasi browser
                            </button>
                            <p className="mt-0.5 text-[11px] text-slate-500">Tampilkan pemberitahuan saat ada pengajuan baru, selama halaman admin terbuka.</p>
                        </div>
                    )}
                </div>,
                document.body,
            )}
        </>
    );
}
