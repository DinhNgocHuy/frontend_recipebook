import { cn } from "../../utils/cn";

// eslint-disable-next-line no-unused-vars
export default function Button({ as: Tag = "button", variant = "primary", size = "md", className, ...props }) {
    const base = "btn-base";
    const variants = {
        // Các biến thể bạn đã có
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 hover:border-gray-400 bg-white text-gray-800",
        disabled: "bg-gray-300 text-black-100 cursor-not-allowed",
        ghost: "hover:bg-gray-100 text-gray-800",
        danger: "bg-red-500 text-white hover:bg-red-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        info: "bg-sky-500 text-white hover:bg-sky-600",
        link: "text-blue-600 hover:underline bg-transparent"
    };
    const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-5 py-3 text-base" };

    return <Tag className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
