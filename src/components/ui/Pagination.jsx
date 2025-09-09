import Button from "./Button.jsx";

export default function Pagination({ page = 1, total = 0, limit = 12, onChange }) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (totalPages <= 1) return null;

    const numbers = [];
    const from = Math.max(1, page - 2);
    const to = Math.min(totalPages, page + 2);
    for (let i = from; i <= to; i++) numbers.push(i);

    return (
        <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant={`${page <= 1 ? 'disabled' : 'outline'}`} size="sm" disabled={page <= 1} onClick={() => onChange?.(page - 1)}>Trước</Button>
            {from > 1 && <span className="px-2 text-sm">…</span>}
            {numbers.map(n => (
                <Button key={n} variant={n === page ? "primary" : "outline"} size="sm" onClick={() => onChange?.(n)}>{n}</Button>
            ))}
            {to < totalPages && <span className="px-2 text-sm">…</span>}
            <Button variant={`${page >= totalPages ? 'disabled' : 'outline'}`} size="sm" disabled={page >= totalPages} onClick={() => onChange?.(page + 1)}>Sau</Button>
        </div>
    );
}
