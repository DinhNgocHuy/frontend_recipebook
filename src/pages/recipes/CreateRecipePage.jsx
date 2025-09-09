
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAddRecipeMutation } from "../../store/api/recipeApi";
import RecipeForm from "../../components/recipes/RecipeForm";

export default function CreateRecipePage() {
    const navigate = useNavigate();
    const [addRecipe, { isLoading }] = useAddRecipeMutation();

    const handleSubmit = async (payload) => {
        try {
            const res = await addRecipe(payload).unwrap();
            const id = res?.id || res?._id || res?.recipe?._id;
            navigate(id ? `/recipes/${id}` : "/recipes");
        } catch (e) {
            alert(e?.data?.message || "Tạo công thức thất bại");
        }
    };

    return (
        <div className="container-page space-y-6">
            <div className="flex items-center justify-between">
                <h1>Tạo công thức</h1>
            </div>
            <RecipeForm submitting={isLoading} onSubmit={handleSubmit} />
        </div>
    );
}
