import { cn } from "../../utils/cn";
export default function TagChip({ label, active = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "badge transition",
                active ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            )}
        >
            #{label}
        </button>
    );
}
