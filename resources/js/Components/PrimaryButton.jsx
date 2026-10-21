export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-transparent bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white shadow-dark-sm transition-shadow duration-200 ease-in-out hover:shadow-dark-hover active:opacity-85 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
