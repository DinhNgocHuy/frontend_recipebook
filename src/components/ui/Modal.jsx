import { useEffect } from "react";
import Button from "./Button.jsx";
import { cn } from "../../utils/cn";

export default function Modal({ open, onClose, title, children, className }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose?.();
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className={cn("card absolute left-1/2 top-1/2 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2", className)}>
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" onClick={onClose}>✕</Button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
