import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    useGetRecipeQuery,
    useToggleLikeMutation,
    useUpdateRatingMutation,     // nếu chưa có, có thể bỏ 2 hook này (nhưng giữ vị trí hook, đừng đặt dưới return)
    useDeleteMyRatingMutation,   // hoặc tạm thời comment cả 2 cùng lúc để không đổi thứ tự hook giữa các lần render
} from "../store/api/recipeApi";
import Button from "../components/ui/Button";
import RatingStars from "../components/ui/RatingStars";
import Skeleton from "../components/ui/Skeleton";
import RateModal from "../components/modals/RateModal";
import CommentModal from "../components/modals/CommentModal";
import { FaHeart, FaEdit, FaTrash } from "react-icons/fa";
import { displayName, defaultAvatar } from "../utils/userDisplay";
import DOMPurify from "dompurify";

export default function RecipeDetailPage() {
    const navigate = useNavigate();
    // ===== Hooks: luôn đặt TẤT CẢ ở trên cùng, không bao giờ đặt sau các return =====
    const { id } = useParams();
    const { user } = useSelector((s) => s.auth);
    const userId = user?._id || user?.id || null;

    const { data, isLoading, isError, error, refetch } = useGetRecipeQuery(id);
    const [toggleLike, { isLoading: liking }] = useToggleLikeMutation();
    const [updateRating, { isLoading: updatingRating }] = useUpdateRatingMutation?.() || [() => { }, { isLoading: false }];
    const [deleteMyRating, { isLoading: deletingRating }] = useDeleteMyRatingMutation?.() || [() => { }, { isLoading: false }];

    const [openRate, setOpenRate] = useState(false);
    const [openCmt, setOpenCmt] = useState(false);

    // ===== Derive data an toàn theo schema API bạn gửi =====
    const r = data || {};
    const likesArr = Array.isArray(r.likes) ? r.likes : [];
    const isLiked = !!(userId && likesArr.some(x => String(x) === String(userId)));
    const likesCount = likesArr.length;

    const ratingsArr = Array.isArray(r.ratings) ? r.ratings : [];
    const ratingsCount = ratingsArr.length;
    const ratingAvg = ratingsCount
        ? ratingsArr.reduce((s, it) => s + Number(it.stars || 0), 0) / ratingsCount
        : 0;
    const authorName = displayName(r?.authorSummary);
    const safeHtml = DOMPurify.sanitize(r.content || "");
    const myRating = userId ? ratingsArr.find(rt => String(rt.user) === String(userId)) : null;

    const authorId = r?.authorSummary?._id;

    const isAuthor = String(userId) === String(authorId);
    // ===== Handlers =====
    const handleLike = async () => {
        if (!userId || liking) return;
        await toggleLike(id);
        refetch();
    };
    const handleEditMyRating = () => setOpenRate(true);
    const handleDeleteMyRating = async () => {
        if (!userId || deletingRating) return;
        await deleteMyRating(id);
        refetch();
    };

    // ===== Render (sau khi đã khai báo xong hooks) =====
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
        return <div className="container-page text-red-600">{error?.data?.message || "Lỗi tải chi tiết"}</div>;
    }

    return (
        <div className="container-page space-y-4">
            <h1>{r.title}</h1>
            {r.summary && <p className="text-gray-700">{r.summary}</p>}
            <div className="mt-3 flex items-center gap-3">
                <img
                    src={r?.authorSummary?.avatar || defaultAvatar}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                    <span className="font-medium">{authorName}</span>
                    {r?.createdAt && (
                        <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
            <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
                {r.thumbnail ? (
                    <img src={r.thumbnail} alt={r.title} className="h-full w-full object-cover" />
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* ⭐ trung bình + số lượt */}
                <div className="flex items-center gap-2">
                    <RatingStars value={Number(ratingAvg)} />
                    <span className="text-sm text-gray-500">
                        {Number(ratingAvg).toFixed(1)} ({ratingsCount})
                    </span>
                    {myRating && <span className="text-xs text-gray-500 ml-2">• của tôi: {myRating.stars}★</span>}
                </div>

                <span className="text-sm text-gray-500">⏱ {r?.time?.total ?? "-"} phút</span>
                <span className="text-sm text-gray-500">Độ khó: {r?.difficulty ?? "-"}</span>

                <div className="ml-auto flex gap-2">
                    {isAuthor && (
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/recipes/update/${id}`)}
                            className="flex items-center gap-1"
                        >
                            <FaEdit />
                            <span>Chỉnh sửa</span>
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setOpenCmt(true)} disabled={!userId}>Bình luận</Button>
                    <Button
                        variant="outline"
                        disabled={!userId || liking}
                        onClick={handleLike}
                        className="flex items-center gap-1"
                        title={!userId ? "Đăng nhập để thích" : (isLiked ? "Bỏ thích" : "Thích")}
                    >
                        <FaHeart className="text-lg" color={isLiked ? "red" : "gray"} />
                        <span>{likesCount}</span>
                    </Button>
                </div>
            </div>

            {r.content &&
                <article
                    className="prose max-w-none [&_img]:max-w-full [&_img]:h-auto"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />}

            <section className="grid gap-4 md:grid-cols-2">
                <div className="card p-4">
                    <h2 className="mb-2">Nguyên liệu</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        {(r.ingredients || []).map((x, i) => (
                            <li key={i}>{typeof x === "string" ? x : x?.name ? `${x.name} ${x.quantity ?? x.amount ?? ""} ${x.unit ?? ""}` : JSON.stringify(x)}</li>
                        ))}
                    </ul>
                </div>
                <div className="card p-4">
                    <h2 className="mb-2">Các bước</h2>
                    <ol className="list-decimal pl-5 space-y-2">
                        {(r.steps || []).map((s, i) => <li key={i}>{typeof s === "string" ? s : (s?.text || JSON.stringify(s))}</li>)}
                    </ol>
                </div>
            </section>

            {/* ===== Khối Đánh giá dưới công thức ===== */}
            <section className="card p-4 space-y-3">
                <h2 className="mb-1">Đánh giá</h2>

                <div className="flex items-center gap-2">
                    {!myRating ? (
                        <Button onClick={() => setOpenRate(true)} disabled={!userId}>Thêm đánh giá</Button>
                    ) : (
                        <>
                            <Button onClick={handleEditMyRating} disabled={updatingRating}><FaEdit className="inline-block mr-2" />Sửa đánh giá</Button>
                            <Button variant="outline" onClick={handleDeleteMyRating} disabled={deletingRating}><FaTrash className="inline-block mr-2" />Xóa</Button>
                        </>
                    )}
                </div>

                <div className="divide-y">
                    {ratingsArr.length === 0 ? (
                        <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
                    ) : (
                        ratingsArr
                            .slice()
                            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
                            .map((rt, idx) => (
                                <div key={idx} className="py-3 flex items-start gap-3">
                                    <div className="mt-1"><RatingStars value={Number(rt.stars || 0)} /></div>
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-700">{rt.comment || <span className="text-gray-400 italic">Không có nhận xét</span>}</div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(rt.updatedAt || rt.createdAt || Date.now()).toLocaleString()}
                                            {String(rt.user) === String(userId) && <span> • của tôi</span>}
                                        </div>
                                    </div>
                                    {String(rt.user) === String(userId) && (
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleEditMyRating}><FaEdit /></Button>
                                            <Button size="sm" variant="outline" onClick={handleDeleteMyRating}><FaTrash /></Button>
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </section>

            {/* Modals */}
            <RateModal open={openRate} onClose={() => setOpenRate(false)} recipeId={id} afterSuccess={refetch} current={myRating || r.myRating} />
            <CommentModal open={openCmt} onClose={() => setOpenCmt(false)} recipeId={id} afterSuccess={refetch} comments={r.comments || []} />
        </div>
    );
}
