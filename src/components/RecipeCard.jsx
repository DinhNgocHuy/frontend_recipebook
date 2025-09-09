import { Card, CardContent, CardHeader } from "./ui/Card";
import Badge from "./ui/Badge";
import RatingStars from "./ui/RatingStars";
import Button from "./ui/Button";
import { useSelector } from "react-redux";
import { FaHeart } from "react-icons/fa"; // icon like
import { useMemo } from "react";
import { displayName, defaultAvatar } from "../utils/userDisplay";

export default function RecipeCard({ recipe, onView, onLike }) {
    const { user } = useSelector((s) => s.auth);

    const {
        _id, title, summary, thumbnail, thumbnailUrl,
        difficulty, time, tags = [], ratings = [], likes = [],
        authorSummary
    } = recipe || {};
    const authorName = displayName(authorSummary);

    const image = thumbnailUrl || thumbnail;
    const userId = user?._id || user?.id || null;
    const isLiked = !!(userId && Array.isArray(likes) && likes.some(x => String(x) === String(userId)));
    const likesCount = likes.length;

    const ratingsArr = Array.isArray(ratings) ? ratings : [];
    const ratingsCount = ratingsArr.length;
    const ratingAvg = useMemo(() => {
        if (!ratingsCount) return 0;
        const sum = ratingsArr.reduce((s, it) => s + Number(it?.stars || 0), 0);
        return sum / ratingsCount;
    }, [ratingsArr, ratingsCount]);

    return (
        <Card className="overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full grid place-items-center text-gray-400">
                        No image
                    </div>
                )}
            </div>

            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
                    {difficulty && (
                        <Badge variant="green" className="whitespace-nowrap">
                            {difficulty}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <img
                        src={authorSummary?.avatar || defaultAvatar}
                        alt={authorName}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{authorName}</span>
                </div>
                {summary && (
                    <p className="line-clamp-2 text-sm text-gray-600">{summary}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    <RatingStars value={ratingAvg} />
                    <span className="text-xs text-gray-500">
                        {Number(ratingAvg).toFixed(1)} ({ratingsCount})
                    </span>
                    {time?.total && (
                        <span className="ml-auto text-xs text-gray-500">
                            ⏱ {time.total} phút
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {(tags || []).slice(0, 4).map((t) => (
                        <Badge key={t}>#{t}</Badge>
                    ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        className="bg-blue-300 hover:text-blue-600"
                        onClick={() => onView?.(_id)}
                    >
                        Xem chi tiết
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!userId}
                        onClick={() => onLike?.(_id)}
                        className="flex items-center gap-1"
                        title={!userId ? "Đăng nhập để thích" : (isLiked ? "Bỏ thích" : "Thích")}
                    >
                        <FaHeart className="text-lg" color={isLiked ? "red" : "gray"} />
                        <span>{likesCount}</span>
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
}
