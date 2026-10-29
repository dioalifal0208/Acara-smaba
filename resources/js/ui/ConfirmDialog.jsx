import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Button from './Button';
import Dialog from './Dialog';
import { Field, Input } from './Form';

const ConfirmContext = createContext(null);

/**
 * `const confirm = useConfirm(); if (await confirm({ title, message, type, confirmText })) …`
 * `type`: 'danger' (bawaan) | 'warning' | 'info'.
 * `requireText`: untuk penghapusan berantai yang tidak bisa dibatalkan, tombol konfirmasi baru aktif
 * setelah teks ini diketik (huruf besar/kecil diabaikan).
 */
export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
    return ctx;
}

export function ConfirmProvider({ children }) {
    const [config, setConfig] = useState(null);
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');
    const resolveRef = useRef(null);
    const cancelRef = useRef(null);

    const confirm = useCallback((opts) => {
        const normalized = typeof opts === 'string' ? { message: opts } : opts;
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig({ type: 'danger', ...normalized });
            setTyped('');
            setOpen(true);
        });
    }, []);

    const settle = (result) => {
        resolveRef.current?.(result);
        resolveRef.current = null;
        setOpen(false);
    };

    const danger = config?.type === 'danger';
    const normalize = (value) => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const locked = Boolean(config?.requireText) && normalize(typed) !== normalize(config.requireText);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {config && (
                <Dialog
                    open={open}
                    onClose={() => settle(false)}
                    title={config.title || 'Konfirmasi'}
                    size="sm"
                    // Aksi berbahaya: fokus awal di Batal agar Enter tidak langsung menghapus
                    // (kecuali harus mengetik konfirmasi: fokus ke kolomnya).
                    initialFocus={danger && !config.requireText ? cancelRef : undefined}
                    footer={
                        <>
                            <Button ref={cancelRef} onClick={() => settle(false)}>
                                {config.cancelText || 'Batal'}
                            </Button>
                            <Button variant={danger ? 'danger' : 'primary'} onClick={() => settle(true)} disabled={locked}>
                                {config.confirmText || 'Lanjutkan'}
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm leading-relaxed text-ink-2">{config.message}</p>
                    {config.requireText && (
                        <form onSubmit={(e) => { e.preventDefault(); if (!locked) settle(true); }} className="mt-4">
                            <Field label={<>Ketik <span className="font-semibold">{config.requireText}</span> untuk melanjutkan</>}>
                                <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} data-autofocus />
                            </Field>
                        </form>
                    )}
                </Dialog>
            )}
        </ConfirmContext.Provider>
    );
}
