import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import TagChip from "../components/ui/TagChip";
import RecipeCard from "../components/RecipeCard";
import Skeleton from "../components/ui/Skeleton";
import Pagination from "../components/ui/Pagination";
import { useGetRecipesQuery, useToggleLikeMutation } from "../store/api/recipeApi";

export default function RecipesPage() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [tags, setTags] = useState([]);
    const [page, setPage] = useState(1);
    const limit = 6;

    const queryArgs = {
        q: search || undefined,
        difficulty: difficulty || undefined,
        tags: tags.length ? tags : undefined,
        page,
        limit,
        sort: "newest",
    };

    
    const { data, isLoading, isError, error, refetch } = useGetRecipesQuery(queryArgs);
    const [toggleLike, { isLoading: liking }] = useToggleLikeMutation();

    useEffect(() => { setPage(1); }, [search, difficulty, tags.join(",")]);

    const handleToggleTag = (t) =>
        setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

    const items = data?.items || [];
    const total = data?.total || 0;

    return (
        <div className="container-page space-y-6">
            <div className="flex items-center justify-between">
                <h1>Recipes</h1>
                <Button variant="outline" onClick={() => refetch()}>↻ Refresh</Button>
            </div>

            {/* Filters */}
            <div className="grid gap-3 md:grid-cols-3">
                <Input
                    placeholder="Tìm kiếm công thức..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="">Độ khó</option>
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                </Select>
                <div className="flex flex-wrap items-center gap-2">
                    {["Việt Nam", "tiệc", "truyền thống"].map((t) => (
                        <TagChip key={t} label={t} active={tags.includes(t)} onClick={() => handleToggleTag(t)} />
                    ))}
                    <Button
                        variant="outline"
                        className="ml-auto"
                        onClick={() => { setSearch(""); setDifficulty(""); setTags([]); }}
                    >
                        Xóa lọc
                    </Button>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card overflow-hidden">
                            <Skeleton className="aspect-[16/9]" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <p className="text-red-600">{error?.data?.message || "Không tải được dữ liệu"}</p>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((r) => (
                            <RecipeCard
                                key={r._id}
                                recipe={r}
                                onView={(id) => navigate(`/recipes/${id}`)}
                                onLike={async (id) => { if (!liking) await toggleLike(id); }}
                            />
                        ))}
                    </div>
                    <Pagination page={page} total={total} limit={limit} onChange={setPage} />
                </>
            )}
        </div>
    );
}
