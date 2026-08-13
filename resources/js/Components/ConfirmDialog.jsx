import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

// ─── Confirm Context ───
const ConfirmContext = createContext(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
    return ctx;
}

// ─── Confirm Dialog ───
function ConfirmDialog({ config, onResolve }) {
    const [phase, setPhase] = useState('enter'); // enter | visible | exit
    const dialogRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setPhase('visible'), 20);
        return () => clearTimeout(timer);
    }, []);

    // Trap focus inside dialog
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClose = (result) => {
        setPhase('exit');
        setTimeout(() => onResolve(result), 350);
    };

    const overlayClass =
        phase === 'enter'
            ? 'opacity-0'
            : phase === 'exit'
            ? 'opacity-0'
            : 'opacity-100';

    const dialogClass =
        phase === 'enter'
            ? 'opacity-0 scale-90 translate-y-4'
            : phase === 'exit'
            ? 'opacity-0 scale-90 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0';

    const typeConfig = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBg: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            ),
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            ),
        },
        info: {
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            confirmBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
            ),
        },
    };

    const tc = typeConfig[config.type] || typeConfig.info;

    return (
        <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${overlayClass}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => handleClose(false)}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${dialogClass}`}
            >
                <div className="p-6">
                    {/* Icon */}
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${tc.iconBg} ${tc.iconColor} ring-4 ring-offset-2 ring-offset-white ${tc.iconBg.replace('bg-', 'ring-')}/30 shadow-lg`}>
                        {tc.icon}
                    </div>

                    {/* Title & Message */}
                    <h3 className="mt-4 text-center text-base font-extrabold text-slate-800">
                        {config.title || 'Konfirmasi'}
                    </h3>
                    <p className="mt-2 text-center text-sm text-slate-600 font-medium leading-relaxed">
                        {config.message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                    <button
                        onClick={() => handleClose(false)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        {config.cancelText || 'Batal'}
                    </button>
                    <button
                        onClick={() => handleClose(true)}
                        autoFocus
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.confirmBg}`}
                    >
                        {config.confirmText || 'Ya, Lanjutkan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Provider ───
export function ConfirmProvider({ children }) {
    const [config, setConfig] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((opts) => {
        const normalizedOpts = typeof opts === 'string' ? { message: opts } : opts;
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig({
                type: 'danger',
                ...normalizedOpts,
            });
        });
    }, []);

    const handleResolve = (result) => {
        if (resolveRef.current) {
            resolveRef.current(result);
            resolveRef.current = null;
        }
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {config && <ConfirmDialog config={config} onResolve={handleResolve} />}
        </ConfirmContext.Provider>
    );
}

export default ConfirmDialog;
