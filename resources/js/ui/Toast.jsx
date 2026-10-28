import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cx } from './cx';

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}

const kinds = {
    success: { icon: CheckCircle2, color: 'text-status-hadir', label: 'Berhasil' },
    error: { icon: XCircle, color: 'text-status-alpha', label: 'Gagal' },
    warning: { icon: AlertTriangle, color: 'text-status-telat', label: 'Peringatan' },
    already: { icon: AlertTriangle, color: 'text-status-telat', label: 'Sudah presensi' },
    info: { icon: Info, color: 'text-status-izin', label: 'Informasi' },
};

const MAX_VISIBLE = 5;

/**
 * Notifikasi singkat di atas tengah. Pesan galat tidak hilang sendiri (harus ditutup), yang lain
 * hilang setelah `duration` ms; hitungan berhenti saat kursor atau fokus berada di atasnya.
 */
function ToastItem({ toast, onRemove }) {
    const kind = kinds[toast.status] ?? kinds.info;
    const Icon = kind.icon;
    const persistent = toast.status === 'error';
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (persistent || paused) return undefined;
        const timer = setTimeout(() => onRemove(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [persistent, paused, toast.id, toast.duration, onRemove]);

    return (
        <div
            role={persistent ? 'alert' : 'status'}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="pointer-events-auto flex w-full max-w-md animate-toast-in items-start gap-3 rounded-xl border border-line bg-surface p-3 shadow-lg motion-reduce:animate-none"
        >
            <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', kind.color)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2 text-sm font-semibold text-ink">
                    {kind.label}
                    {toast.timestamp && <span className="text-xs font-normal tabular-nums text-ink-3">{toast.timestamp}</span>}
                </p>
                <p className="mt-0.5 text-sm text-ink-2">{toast.message}</p>
                {toast.participantName && <p className="mt-0.5 truncate text-sm font-medium text-ink">{toast.participantName}</p>}
            </div>
            <button
                type="button"
                onClick={() => onRemove(toast.id)}
                className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink"
                aria-label="Tutup notifikasi"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

    const addToast = useCallback((opts) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { ...opts, duration: opts.duration || 4000, id }].slice(-MAX_VISIBLE));
        return id;
    }, []);

    const toast = useMemo(() => {
        const fn = (message, opts = {}) => addToast({ ...opts, status: opts.status || opts.type || 'info', message });
        for (const status of Object.keys(kinds)) {
            fn[status] = (message, opts = {}) => fn(message, { ...opts, status });
        }
        return fn;
    }, [addToast]);

    const value = useMemo(() => ({ toast, addToast, removeToast }), [toast, addToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
                {[...toasts].reverse().map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
