export default function RatingStars({ value = 0, size = 18, editable = false, onChange }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center gap-1">
            {stars.map(s => {
                const active = s <= Math.round(value);
                return (
                    <svg
                        key={s}
                        onClick={editable ? () => onChange?.(s) : undefined}
                        width={size} height={size} viewBox="0 0 24 24"
                        className={`${editable ? "cursor-pointer" : ""} ${active ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-200 stroke-gray-300"}`}
                    >
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                );
            })}
        </div>
    );
}
