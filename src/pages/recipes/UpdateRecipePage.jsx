
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecipeForm from "../../components/recipes/RecipeForm";
import { useGetRecipeQuery, useUpdateRecipeMutation } from "../../store/api/recipeApi";
import Skeleton from "../../components/ui/Skeleton";

export default function UpdateRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetRecipeQuery(id);
  const [updateRecipe, { isLoading: saving }] = useUpdateRecipeMutation();

  const initial = useMemo(() => {
    const r = data?.recipe || data;
    if (!r) return {};
    return {
      title: r.title,
      summary: r.summary,
      content: r.content,
      ingredients: r.ingredients,
      steps: r.steps,
      time: r.time,
      difficulty: r.difficulty,
      servings: r.servings,
      tags: r.tags,
      thumbnailUrl: r.thumbnail,
    };
  }, [data]);

  const handleSubmit = async (payload) => {
    try {
      await updateRecipe({ id, ...payload }).unwrap();
      navigate(`/recipes/${id}`);
    } catch (e) {
      alert(e?.data?.message || "Cập nhật thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="container-page space-y-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container-page space-y-6">
      <div className="flex items-center justify-between">
        <h1>Cập nhật công thức</h1>
      </div>
      <RecipeForm initial={initial} submitting={saving} onSubmit={handleSubmit} />
    </div>
  );
}
