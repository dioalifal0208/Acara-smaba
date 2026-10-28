import { cx } from './cx';

/**
 * Animasi masuk (AOS) untuk blok besar halaman: sekali, singkat, dan mati bila pengguna memilih
 * "kurangi gerakan". Jangan dipakai untuk baris tabel, dialog, atau menu.
 */
export const reveal = { 'data-aos': 'fade-up' };

/** Kartu dasar: permukaan putih (gelap di mode gelap) dengan garis tipis. `animate` = animasi masuk. */
export function Card({ as: Tag = 'div', animate = false, className, children, ...props }) {
    return (
        <Tag className={cx('rounded-xl border border-line bg-surface', className)} {...(animate ? reveal : {})} {...props}>
            {children}
        </Tag>
    );
}

/** Judul halaman (satu-satunya h1), deskripsi singkat, dan aksi utama di sisi kanan. */
export function PageHeader({ title, description, actions, className }) {
    return (
        <header className={cx('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)} {...reveal}>
            <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
                {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
    );
}

/** Kartu bagian dengan judul h2. `flush` menghilangkan padding isi (untuk tabel). */
export function Section({ title, description, actions, flush = false, className, children }) {
    return (
        <Card as="section" animate className={cx('flex flex-col overflow-clip', className)}>
            {(title || actions) && (
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-4">
                    <div className="min-w-0">
                        {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
                        {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={cx('min-h-0 flex-1', !flush && 'px-5 pb-5')}>{children}</div>
        </Card>
    );
}

/** Keadaan kosong: jelaskan apa yang terjadi dan beri satu langkah berikutnya. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div className={cx('flex flex-col items-center px-6 py-12 text-center', className)}>
            {Icon && (
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-ink-2">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            )}
            <p className="text-sm font-medium text-ink">{title}</p>
            {description && <p className="mt-1 max-w-sm text-sm text-ink-2">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/** Kerangka pemuatan. Animasi denyut dimatikan bila pengguna memilih kurangi gerakan. */
export function Skeleton({ className }) {
    return <div className={cx('animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none', className)} aria-hidden="true" />;
}
