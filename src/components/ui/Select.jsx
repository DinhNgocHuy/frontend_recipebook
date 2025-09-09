export default function Select({ className = "", children, ...props }) {
    return (
        <select className={`input-base pr-8 ${className}`} {...props}>
            {children}
        </select>
    );
}
