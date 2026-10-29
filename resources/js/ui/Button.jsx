import { Link } from '@inertiajs/react';
import { forwardRef } from 'react';
import { cx } from './cx';

const variants = {
    primary: 'bg-accent text-accent-ink hover:bg-accent/90',
    secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
    ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
    danger: 'bg-danger text-surface hover:bg-danger/90',
    // Aksi berisiko yang bukan aksi utama (mis. Tolak di samping Setujui): tidak sekuat tombol utama.
    'danger-outline': 'border border-line-strong bg-surface text-danger hover:bg-danger-soft',
};

// Layar sentuh (pointer kasar): sm ikut 40px agar tetap mudah diketuk ibu jari; mouse tetap 32px rapat.
const coarse40 = '[@media(pointer:coarse)]:h-10';

const sizes = {
    sm: `h-8 gap-1.5 px-3 text-sm [&_svg]:h-4 [&_svg]:w-4 ${coarse40}`,
    md: 'h-10 gap-2 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4',
    lg: 'h-12 gap-2 px-5 text-base [&_svg]:h-5 [&_svg]:w-5',
};

const base =
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

/**
 * Tombol standar. Dengan `href` menjadi tautan Inertia; `loading` mengunci tombol dan
 * menampilkan putaran di tempat ikon.
 */
const Button = forwardRef(function Button(
    { variant = 'secondary', size = 'md', icon: Icon, loading = false, href, external = false, className, children, disabled, type = 'button', ...props },
    ref,
) {
    const classes = cx(base, variants[variant], sizes[size], className);
    const content = (
        <>
            {loading ? <Spinner /> : Icon && <Icon aria-hidden="true" />}
            {children}
        </>
    );

    // `external`: tautan biasa (unduhan file, halaman luar), bukan navigasi Inertia.
    if (href && external) {
        return (
            <a ref={ref} href={href} className={classes} {...props}>
                {content}
            </a>
        );
    }

    if (href) {
        return (
            <Link ref={ref} href={href} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
            {content}
        </button>
    );
});

export default Button;

/** Tombol ikon saja. `label` wajib: dipakai sebagai nama untuk pembaca layar dan tooltip. */
export const IconButton = forwardRef(function IconButton(
    { icon: Icon, label, size = 'md', variant = 'ghost', className, type = 'button', ...props },
    ref,
) {
    const box = { sm: `h-8 w-8 [&_svg]:h-4 [&_svg]:w-4 ${coarse40} [@media(pointer:coarse)]:w-10`, md: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5' }[size];

    return (
        <button
            ref={ref}
            type={type}
            aria-label={label}
            title={label}
            className={cx(base, variants[variant], box, className)}
            {...props}
        >
            <Icon aria-hidden="true" />
        </button>
    );
});

export function Spinner({ className }) {
    return (
        <svg className={cx('animate-spin motion-reduce:animate-none', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
