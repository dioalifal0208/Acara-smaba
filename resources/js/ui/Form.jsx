import { Check, ChevronDown, Eye, EyeOff, Minus, Search, X } from 'lucide-react';
import { cloneElement, forwardRef, useId, useState } from 'react';
import { cx } from './cx';

const control =
    'block w-full rounded-lg border border-line-strong bg-surface text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-2 read-only:bg-surface-2 aria-[invalid=true]:border-danger';

/**
 * Bungkus label + kontrol + petunjuk + pesan galat. Kontrol anak otomatis mendapat id,
 * aria-describedby, dan aria-invalid.
 */
export function Field({ label, hint, error, warning, required, className, children }) {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;
    const messageId = error || warning ? `${id}-msg` : undefined;

    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
                {label}
                {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
            </label>
            {cloneElement(children, {
                id,
                required,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': [hintId, messageId].filter(Boolean).join(' ') || undefined,
            })}
            {hint && <p id={hintId} className="mt-1.5 text-xs text-ink-2">{hint}</p>}
            {error ? (
                <p id={messageId} className="mt-1.5 text-xs font-medium text-danger">{error}</p>
            ) : warning ? (
                <p id={messageId} className="mt-1.5 text-xs font-medium text-status-telat">{warning}</p>
            ) : null}
        </div>
    );
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cx(control, 'h-10 px-3', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, rows = 3, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cx(control, 'px-3 py-2', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
    return (
        <div className={cx('relative', className)}>
            <select ref={ref} className={cx(control, 'h-10 appearance-none bg-none pl-3 pr-9')} {...props}>
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" aria-hidden="true" />
        </div>
    );
});

/** Kolom kata sandi dengan tombol tampilkan/sembunyikan. Props diteruskan ke <input> (cocok dengan Field). */
export const PasswordInput = forwardRef(function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input ref={ref} type={visible ? 'text' : 'password'} className={cx(control, 'h-10 pl-3 pr-11', className)} {...props} />
            <button
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={visible}
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
                {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
        </div>
    );
});

/** Kolom cari dengan tombol hapus. `label` menjadi nama untuk pembaca layar. */
export function SearchField({ value, onChange, label = 'Cari', placeholder, className }) {
    return (
        <div className={cx('relative', className)}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                placeholder={placeholder}
                className={cx(control, 'h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden')}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink"
                    aria-label="Hapus pencarian"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

/**
 * Kotak centang dengan area sentuh 40px (kotak terlihat 18px). `indeterminate` untuk
 * "pilih semua" yang terisi sebagian. Dengan `children`, teksnya tampil di samping kotak dan
 * seluruh baris bisa diklik; tanpa `children`, `label` menjadi nama untuk pembaca layar.
 */
export function Checkbox({ checked, indeterminate = false, onChange, label, children, className, ...props }) {
    const box = (
        <>
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                ref={(el) => el && (el.indeterminate = indeterminate)}
                onChange={onChange}
                aria-label={children ? undefined : label}
                {...props}
            />
            <span
                className={cx(
                    'flex h-[18px] w-[18px] items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface',
                    checked || indeterminate ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong bg-surface',
                )}
                aria-hidden="true"
            >
                {indeterminate ? <Minus className="h-3.5 w-3.5" strokeWidth={3} /> : checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
        </>
    );

    if (!children) {
        return <label className={cx('relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center', className)}>{box}</label>;
    }

    // Teks panjang turun ke baris berikutnya; kotak tetap sejajar dengan baris pertama.
    return (
        <label className={cx('flex cursor-pointer items-start gap-3 text-sm text-ink', className)}>
            <span className="relative flex h-10 shrink-0 items-center">{box}</span>
            <span className="py-2.5">{children}</span>
        </label>
    );
}
