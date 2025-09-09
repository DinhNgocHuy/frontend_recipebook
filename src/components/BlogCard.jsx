import { Card, CardContent, CardHeader } from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

export default function BlogCard({ blog, onView }) {
    const { _id, title, excerpt, thumbnail, tags = [], createdAt, } = blog || {};
    const image = thumbnail || null;
    const date = createdAt ? new Date(createdAt).toLocaleDateString() : "";

    return (    
        <Card className="overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100">
                {image ? <img src={image} alt={title} className="h-full w-full object-cover" /> : null}
            </div>
            <CardHeader>
                <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">{date}</div>
                    <Button onClick={() => onView?.(_id)}>Đọc tiếp</Button>
                </div>
                {excerpt && <p className="line-clamp-3 text-sm text-gray-600">{excerpt}</p>}
                <div className="flex flex-wrap gap-2">
                    {(tags || []).slice(0, 4).map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}
                </div>
            </CardContent>
        </Card>
    );
}
