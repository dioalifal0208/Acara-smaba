import { cx } from './cx';

/**
 * Pilihan tunggal berbentuk segmen (filter tampilan). `options`: `[{ value, label, count? }]`.
 * Panah kiri/kanan berpindah pilihan, seperti radio group.
 */
export default function Segmented({ value, onChange, options, label, className }) {
    const move = (event, index) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        const next = options[(index + step + options.length) % options.length];
        onChange(next.value);
        event.currentTarget.parentElement.children[options.indexOf(next)]?.focus();
    };

    return (
        <div role="radiogroup" aria-label={label} className={cx('inline-flex max-w-full overflow-x-auto rounded-lg bg-surface-2 p-1', className)}>
            {options.map((option, index) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => move(event, index)}
                        className={cx(
                            'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors',
                            active ? 'bg-surface font-medium text-ink shadow-sm' : 'text-ink-2 hover:text-ink',
                        )}
                    >
                        {option.label}
                        {option.count != null && <span className="tabular-nums text-ink-2">{option.count}</span>}
                    </button>
                );
            })}
        </div>
    );
}
