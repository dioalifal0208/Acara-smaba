import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Button from './Button';
import Dialog from './Dialog';

const ConfirmContext = createContext(null);

/**
 * `const confirm = useConfirm(); if (await confirm({ title, message, type, confirmText })) …`
 * `type`: 'danger' (bawaan) | 'warning' | 'info'.
 */
export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
    return ctx;
}

export function ConfirmProvider({ children }) {
    const [config, setConfig] = useState(null);
    const [open, setOpen] = useState(false);
    const resolveRef = useRef(null);
    const cancelRef = useRef(null);

    const confirm = useCallback((opts) => {
        const normalized = typeof opts === 'string' ? { message: opts } : opts;
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig({ type: 'danger', ...normalized });
            setOpen(true);
        });
    }, []);

    const settle = (result) => {
        resolveRef.current?.(result);
        resolveRef.current = null;
        setOpen(false);
    };

    const danger = config?.type === 'danger';

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {config && (
                <Dialog
                    open={open}
                    onClose={() => settle(false)}
                    title={config.title || 'Konfirmasi'}
                    size="sm"
                    // Aksi berbahaya: fokus awal di Batal agar Enter tidak langsung menghapus.
                    initialFocus={danger ? cancelRef : undefined}
                    footer={
                        <>
                            <Button ref={cancelRef} onClick={() => settle(false)}>
                                {config.cancelText || 'Batal'}
                            </Button>
                            <Button variant={danger ? 'danger' : 'primary'} onClick={() => settle(true)}>
                                {config.confirmText || 'Lanjutkan'}
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm leading-relaxed text-ink-2">{config.message}</p>
                </Dialog>
            )}
        </ConfirmContext.Provider>
    );
}
