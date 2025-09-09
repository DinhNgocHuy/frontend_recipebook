export default function Textarea({ className = "", ...props }) {
    return <textarea className={`input-base min-h-[120px] ${className}`} {...props} />;
}
