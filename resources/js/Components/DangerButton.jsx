export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-transparent bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 active:scale-[0.98] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
