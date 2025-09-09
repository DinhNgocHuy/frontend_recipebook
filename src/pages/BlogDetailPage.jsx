import { useParams } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { useGetBlogQuery } from "../store/api/blogApi";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import BlogCommentModal from "../components/modals/BlogCommentModal";

export default function BlogDetailPage() {
    const { id } = useParams();
    const { user } = useSelector((s) => s.auth);
    const userId = user?._id || user?.id || null;

    const { data, isLoading, isError, error, refetch } = useGetBlogQuery(id);
    const [openCmt, setOpenCmt] = useState(false);

    if (isLoading) {
        return (
            <div className="container-page space-y-4">
                <Skeleton className="h-8 w-60" />
                <Skeleton className="aspect-[16/9]" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container-page text-red-600">
                {error?.data?.message || "Không tải được blog"}
            </div>
        );
    }

    const b = data || {};
    const image = b.coverUrl || b.cover || b.thumbnail || null;
    const dateStr = b.publishedAt || b.createdAt
        ? new Date(b.publishedAt || b.createdAt).toLocaleDateString()
        : "";

    const safeHtml = DOMPurify.sanitize(b.content || "");

    return (
        <div className="container-page space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="mr-auto">{b.title}</h1>
                <div className="text-sm text-gray-500">Đăng: {dateStr}</div>
                <Button variant="outline" onClick={() => refetch()}>↻ Refresh</Button>
                <Button onClick={() => setOpenCmt(true)} disabled={!userId}>Bình luận</Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {(b.tags || []).map((t) => <Badge key={t}>#{t}</Badge>)}
            </div>

            {image && (
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                    <img src={image} alt={b.title} className="h-full w-full object-cover" />
                </div>
            )}

            {/* Nội dung HTML đã sanitize */}
            <article
                className="prose max-w-none [&_img]:max-w-full [&_img]:h-auto"
                dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {/* Modal bình luận */}
            <BlogCommentModal
                open={openCmt}
                onClose={() => setOpenCmt(false)}
                blogId={id}
                comments={b.comments || []}
                afterSuccess={refetch}
            />
        </div>
    );
}
