export default function Input({ className = "", ...props }) {
    return <input className={`input-base ${className}`} {...props} />;
}
