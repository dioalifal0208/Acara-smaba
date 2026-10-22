import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

// ─── Toast Context ───
const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}

// ─── Icons ───
const icons = {
    success: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    already: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    warning: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    info: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
    ),
};

const themeConfig = {
    success: { icon: 'bg-emerald-500 shadow-emerald-500/30', title: 'text-emerald-600', progress: 'bg-emerald-500', label: 'Berhasil' },
    error: { icon: 'bg-rose-500 shadow-rose-500/30', title: 'text-rose-600', progress: 'bg-rose-500', label: 'Gagal' },
    already: { icon: 'bg-amber-500 shadow-amber-500/30', title: 'text-amber-600', progress: 'bg-amber-500', label: 'Sudah Absen' },
    warning: { icon: 'bg-amber-500 shadow-amber-500/30', title: 'text-amber-600', progress: 'bg-amber-500', label: 'Peringatan' },
    info: { icon: 'bg-sky-500 shadow-sky-500/30', title: 'text-sky-600', progress: 'bg-sky-500', label: 'Informasi' },
};

const EXIT_MS = 350;

// ─── Single Toast Item ───
// Kapsul persegi panjang di atas tengah: turun dari atas saat muncul, naik kembali saat hilang.
function ToastItem({ toast, onRemove }) {
    const [phase, setPhase] = useState('enter'); // enter | visible | exit
    const duration = toast.duration || 4000;

    const theme = themeConfig[toast.status] || themeConfig.info;
    const icon = icons[toast.status] || icons.info;

    useEffect(() => {
        // Satu frame di posisi awal (di atas, transparan) agar transisi turunnya berjalan.
        const visibleTimer = setTimeout(() => setPhase('visible'), 20);
        const exitTimer = setTimeout(() => setPhase('exit'), duration - EXIT_MS);
        const removeTimer = setTimeout(() => onRemove(toast.id), duration);
        return () => {
            clearTimeout(visibleTimer);
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, duration, onRemove]);

    const handleClose = () => {
        setPhase('exit');
        setTimeout(() => onRemove(toast.id), EXIT_MS);
    };

    const motion = phase === 'visible'
        ? 'translate-y-0 opacity-100 scale-100'
        : '-translate-y-[130%] opacity-0 scale-95';

    return (
        <div
            className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 py-3 pl-3 pr-2 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.25)] backdrop-blur-md transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${motion}`}
            role={toast.status === 'error' ? 'alert' : 'status'}
        >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md ${theme.icon}`}>
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${theme.title}`}>{theme.label}</span>
                    {toast.timestamp && (
                        <span className="text-[11px] tabular-nums text-neutral-400">{toast.timestamp}</span>
                    )}
                </div>
                <p className="mt-0.5 text-sm font-medium leading-snug text-neutral-800 line-clamp-2">{toast.message}</p>
                {toast.participantName && (
                    <p className="mt-0.5 truncate text-xs font-semibold text-neutral-500">{toast.participantName}</p>
                )}
            </div>

            <button
                type="button"
                onClick={handleClose}
                className="shrink-0 self-start rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Tutup notifikasi"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Sisa waktu tampil: garis tipis yang menyusut di tepi bawah. */}
            <div
                className={`absolute bottom-0 left-0 h-[3px] origin-left ${theme.progress} opacity-70`}
                style={{ width: '100%', animation: `toast-progress ${duration}ms linear forwards` }}
            />
        </div>
    );
}

// ─── Toast Stack ───
// Atas tengah layar; notifikasi terbaru paling atas dan mendorong yang lama ke bawah.
function ToastStack({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-2.5 px-4">
            <style>{'@keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }'}</style>
            {[...toasts].reverse().map((toast) => (
                <div key={toast.id} className="pointer-events-auto w-full max-w-md">
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}

// ─── Toast Provider ───
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const addToast = useCallback((opts) => {
        const id = ++idRef.current;
        setToasts((prev) => {
            const updated = [...prev, { id, ...opts }];
            return updated.slice(-5); // max 5 visible
        });
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (message, opts = {}) => {
            return addToast({
                status: opts.status || opts.type || 'info',
                message,
                participantName: opts.participantName,
                timestamp: opts.timestamp,
                duration: opts.duration || 4000,
            });
        },
        [addToast],
    );

    // Shorthand methods
    toast.success = (message, opts = {}) => toast(message, { ...opts, status: 'success' });
    toast.error = (message, opts = {}) => toast(message, { ...opts, status: 'error' });
    toast.warning = (message, opts = {}) => toast(message, { ...opts, status: 'warning' });
    toast.already = (message, opts = {}) => toast(message, { ...opts, status: 'already' });
    toast.info = (message, opts = {}) => toast(message, { ...opts, status: 'info' });

    return (
        <ToastContext.Provider value={{ toast, addToast, removeToast }}>
            {children}
            <ToastStack toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export default ToastItem;
