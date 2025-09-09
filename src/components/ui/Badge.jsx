import { cn } from "../../utils/cn";
export default function Badge({ children, variant = "default", className }) {
    const map = {
        default: "badge border-gray-200 bg-gray-100 text-gray-700",
        green: "badge border-emerald-200 bg-emerald-50 text-emerald-700",
        blue: "badge border-blue-200 bg-blue-50 text-blue-700",
        outline: "badge border-gray-300 text-gray-700 bg-white",
    };
    return <span className={cn(map[variant], className)}>{children}</span>;
}
