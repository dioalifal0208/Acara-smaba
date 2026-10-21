export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-brand-600 bg-transparent px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors duration-200 ease-in-out hover:bg-brand-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
