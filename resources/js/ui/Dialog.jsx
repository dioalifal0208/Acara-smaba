import { Dialog as HDialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { cx } from './cx';

const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg', xl: 'sm:max-w-xl', '2xl': 'sm:max-w-2xl', '4xl': 'sm:max-w-4xl', '6xl': 'sm:max-w-6xl' };

/**
 * Dialog standar di atas Headless UI: fokus terkunci di dalam, Esc menutup, fokus kembali ke
 * pemicu. Di HP muncul dari bawah selebar layar; di layar lebar di tengah.
 *
 * `initialFocus` (ref) menentukan elemen yang difokus pertama; untuk aksi berbahaya arahkan ke Batal.
 */
export default function Dialog({ open, onClose, title, description, footer, size = 'md', initialFocus, dismissible = true, children }) {
    return (
        <HDialog open={open} onClose={dismissible ? onClose : () => {}} initialFocus={initialFocus} className="relative z-50">
            <DialogBackdrop transition className="fixed inset-0 bg-black/40 transition-opacity duration-200 data-[closed]:opacity-0" />
            <div className="fixed inset-0 flex items-end justify-center overflow-y-auto sm:items-center sm:p-4">
                <DialogPanel
                    transition
                    className={cx(
                        'flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-xl transition duration-200 ease-out sm:rounded-2xl',
                        'data-[closed]:translate-y-4 data-[closed]:opacity-0 motion-reduce:data-[closed]:translate-y-0 sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95',
                        widths[size],
                    )}
                >
                    <div className="flex items-start gap-3 px-5 pb-2 pt-4">
                        <div className="min-w-0 flex-1 pt-1.5">
                            <DialogTitle className="text-lg font-semibold text-ink">{title}</DialogTitle>
                            {description && <Description className="mt-1 text-sm text-ink-2">{description}</Description>}
                        </div>
                        {dismissible && <IconButton icon={X} label="Tutup" onClick={onClose} className="-mr-2" />}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">{children}</div>
                    {footer && (
                        <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>
                    )}
                </DialogPanel>
            </div>
        </HDialog>
    );
}
