export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm text-neutral-600 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
