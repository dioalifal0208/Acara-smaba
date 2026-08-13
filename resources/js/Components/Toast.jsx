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
    success: {
        gradient: 'from-emerald-500 to-teal-600',
        iconBg: 'bg-emerald-500',
        iconRing: 'ring-emerald-400/30',
        progressBar: 'bg-emerald-400',
        glow: 'shadow-emerald-500/20',
        title: 'Berhasil',
    },
    error: {
        gradient: 'from-rose-500 to-red-600',
        iconBg: 'bg-rose-500',
        iconRing: 'ring-rose-400/30',
        progressBar: 'bg-rose-400',
        glow: 'shadow-rose-500/20',
        title: 'Gagal',
    },
    already: {
        gradient: 'from-amber-500 to-orange-500',
        iconBg: 'bg-amber-500',
        iconRing: 'ring-amber-400/30',
        progressBar: 'bg-amber-400',
        glow: 'shadow-amber-500/20',
        title: 'Sudah Absen',
    },
    warning: {
        gradient: 'from-amber-500 to-orange-500',
        iconBg: 'bg-amber-500',
        iconRing: 'ring-amber-400/30',
        progressBar: 'bg-amber-400',
        glow: 'shadow-amber-500/20',
        title: 'Peringatan',
    },
    info: {
        gradient: 'from-blue-500 to-indigo-600',
        iconBg: 'bg-blue-500',
        iconRing: 'ring-blue-400/30',
        progressBar: 'bg-blue-400',
        glow: 'shadow-blue-500/20',
        title: 'Informasi',
    },
};

// ─── Single Toast Item ───
function ToastItem({ toast, onRemove }) {
    const [phase, setPhase] = useState('enter'); // enter | visible | exit
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 4000;
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const theme = themeConfig[toast.status] || themeConfig.info;
    const icon = icons[toast.status] || icons.info;

    // Progress bar animation
    useEffect(() => {
        startTimeRef.current = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining > 0) {
                timerRef.current = requestAnimationFrame(animate);
            }
        };
        timerRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(timerRef.current);
    }, [duration]);

    // Auto-dismiss lifecycle
    useEffect(() => {
        // Enter → visible
        const visibleTimer = setTimeout(() => setPhase('visible'), 50);
        // visible → exit
        const exitTimer = setTimeout(() => setPhase('exit'), duration - 400);
        // Remove from DOM
        const removeTimer = setTimeout(() => onRemove(toast.id), duration);
        return () => {
            clearTimeout(visibleTimer);
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, duration, onRemove]);

    const handleClose = () => {
        setPhase('exit');
        setTimeout(() => onRemove(toast.id), 400);
    };

    const animationClass =
        phase === 'enter'
            ? 'translate-x-[120%] opacity-0 scale-95'
            : phase === 'exit'
            ? 'translate-x-[120%] opacity-0 scale-95'
            : 'translate-x-0 opacity-100 scale-100';

    return (
        <div
            className={`group relative flex w-full max-w-[400px] overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl ${theme.glow} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${animationClass}`}
            role="alert"
        >
            {/* Left accent gradient bar */}
            <div className={`w-1.5 shrink-0 bg-gradient-to-b ${theme.gradient}`} />

            {/* Content */}
            <div className="flex flex-1 items-start gap-3 p-3.5 min-w-0">
                {/* Icon */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} text-white ring-4 ${theme.iconRing} shadow-lg`}>
                    {icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {theme.title}
                        </span>
                        {toast.timestamp && (
                            <span className="text-[9px] font-semibold text-slate-400 tabular-nums shrink-0">
                                {toast.timestamp}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {toast.message}
                    </p>
                    {toast.participantName && (
                        <p className="mt-0.5 text-xs font-bold text-indigo-600 truncate">
                            {toast.participantName}
                        </p>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="shrink-0 rounded-lg p-1 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50">
                <div
                    className={`h-full ${theme.progressBar} transition-none rounded-full`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// ─── Toast Stack ───
function ToastStack({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-[420px] px-4 sm:px-0 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
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
