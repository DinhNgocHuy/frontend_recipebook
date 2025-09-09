// src/store/api/recipeApi.js
import { apiSlice } from "./apiSlice";

function normalizeRecipe(data = {}) {
    const diffMap = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };

    // time: number|string -> object
    let time = data.time;
    const n = Number(time);
    if (Number.isFinite(n)) time = { prep: 0, cook: n, total: n };
    else if (time && typeof time === "object") {
        const prep = Number(time.prep ?? 0) || 0;
        const cook = Number(time.cook ?? time.total ?? 0) || 0;
        const total = Number(time.total ?? prep + cook) || 0;
        time = { prep, cook, total };
    } else time = { prep: 0, cook: 0, total: 0 };

    let tags = data.tags;
    if (typeof tags === "string") tags = tags.split(",").map(s => s.trim()).filter(Boolean);

    let difficulty = data.difficulty;
    difficulty = diffMap[difficulty] || difficulty || "Dễ";

    return { ...data, time, tags, difficulty, servings: Number(data.servings ?? 0) || 0 };
}

function buildRecipePayload(data = {}) {
    const d = normalizeRecipe(data);
    const hasFile = d?.thumbnail instanceof File || d?.thumbnailFile instanceof File;

    if (!hasFile) {
        const body = { ...d };
        delete body.thumbnailFile;
        return { body, isForm: false };
    }

    const fd = new FormData();
    const { title, summary, content, ingredients, steps, time, tags, difficulty, servings, thumbnail, thumbnailFile, ...rest } = d;

    if (title != null) fd.append("title", title);
    if (summary != null) fd.append("summary", summary);
    if (content != null) fd.append("content", content);

    fd.append("ingredients", JSON.stringify(ingredients ?? []));
    fd.append("steps", JSON.stringify(steps ?? []));
    fd.append("time", JSON.stringify(time ?? { prep: 0, cook: 0, total: 0 }));
    fd.append("tags", JSON.stringify(tags ?? []));

    if (difficulty != null) fd.append("difficulty", difficulty);
    if (servings != null) fd.append("servings", String(servings));

    const file = thumbnailFile || thumbnail;
    if (file instanceof File) fd.append("thumbnail", file); // đúng tên field

    Object.entries(rest).forEach(([k, v]) => {
        if (v == null) return;
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    });

    // (tuỳ chọn) debug để chắc chắn đúng dạng:
    // for (const [k, v] of fd.entries()) console.log(k, v);

    return { body: fd, isForm: true };
}



export const recipeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ------- LIST -------
        getRecipes: builder.query({
            // args: { q, tags, difficulty, maxTotalTime, page, limit, sort }
            query: (args = {}) => {
                const {
                    q, tags, difficulty, maxTotalTime,
                    page = 1, limit = 12, sort = "newest",
                } = args;
                return {
                    url: "/recipes",
                    params: {
                        q,
                        tags: Array.isArray(tags) ? tags.join(",") : tags,
                        difficulty,
                        maxTotalTime,
                        page,
                        limit,
                        sort,
                    },
                };
            },
            /** Nhận nhiều shape response:
             *  - Array
             *  - { items, total, page, limit }
             *  - { data: [...], message, success }
             *  - { pagination: { total, page, limit } }
             */
            transformResponse: (res, meta, arg) => {
                const root = res?.data ?? res;

                const items = Array.isArray(root)
                    ? root
                    : Array.isArray(root?.items)
                        ? root.items
                        : Array.isArray(root?.data)
                            ? root.data
                            : [];

                const total =
                    // eslint-disable-next-line no-constant-binary-expression
                    root?.total ??
                    root?.pagination?.total ??
                    Number(meta?.response?.headers?.get("x-total-count")) ??
                    items.length;

                const page =
                    Number(root?.page ?? root?.pagination?.page ?? arg?.page ?? 1);

                const limit =
                    Number(root?.limit ?? root?.pagination?.limit ?? arg?.limit ?? 12);

                return { items, total, page, limit };
            },
            providesTags: (result) =>
                result?.items?.length
                    ? [
                        { type: "RecipeList", id: "LIST" },
                        ...result.items.map((r) => ({ type: "Recipe", id: r._id })),
                    ]
                    : [{ type: "RecipeList", id: "LIST" }],
        }),

        // ------- DETAIL -------
        getRecipe: builder.query({
            query: (id) => `/recipes/${id}`,
            transformResponse: (res) => res?.data ?? res,
            providesTags: (r, e, id) => [{ type: "Recipe", id }],
        }),

        // ------- CREATE -------
        addRecipe: builder.mutation({
            query: (data) => {
                const { body } = buildRecipePayload(data);
                return { url: "/recipes", method: "POST", body };
            },
            transformResponse: (res) => res?.data ?? res,
            invalidatesTags: [{ type: "RecipeList", id: "LIST" }],
        }),

        // ------- UPDATE -------
        updateRecipe: builder.mutation({
            query: ({ id, ...data }) => {
                const { body } = buildRecipePayload(data);
                return { url: `/recipes/${id}`, method: "PUT", body };
            },
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),

        // ------- DELETE -------
        deleteRecipe: builder.mutation({
            query: (id) => ({ url: `/recipes/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: "RecipeList", id: "LIST" }],
        }),

        // ------- LIKE / UNLIKE -------
        toggleLike: builder.mutation({
            query: (id) => ({ url: `/recipes/${id}/like`, method: "POST" }),
            invalidatesTags: (r, e, id) => [
                { type: "Recipe", id },
                { type: "RecipeList", id: "LIST" },
            ],
        }),

        // ------- RATING -------
        addRating: builder.mutation({
            query: ({ id, value, content = "" }) => ({
                url: `/recipes/${id}/rate`,
                method: "POST",
                body: { value, content },
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),
        updateRating: builder.mutation({
            query: ({ id, value, content = "" }) => ({
                url: `/recipes/${id}/rating`,
                method: "PUT",
                body: { value, content },
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),
        deleteMyRating: builder.mutation({
            query: (id) => ({ url: `/recipes/${id}/rating`, method: "DELETE" }),
            invalidatesTags: (r, e, id) => [{ type: "Recipe", id }],
        }),

        // ------- COMMENTS -------
        addComment: builder.mutation({
            query: ({ id, content }) => ({
                url: `/recipes/${id}/comments`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),
        deleteMyComment: builder.mutation({
            query: ({ id, commentId }) => ({
                url: `/recipes/${id}/comments/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),

        // ------- ADMIN (nếu có role) -------
        adminHide: builder.mutation({
            query: (id) => ({ url: `/recipes/${id}/hide`, method: "PATCH" }),
            invalidatesTags: (r, e, id) => [{ type: "Recipe", id }],
        }),
        adminUnhide: builder.mutation({
            query: (id) => ({ url: `/recipes/${id}/unhide`, method: "PATCH" }),
            invalidatesTags: (r, e, id) => [{ type: "Recipe", id }],
        }),
        adminDeleteUserRating: builder.mutation({
            query: ({ id, userId }) => ({
                url: `/recipes/${id}/rating/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),
        adminDeleteComment: builder.mutation({
            query: ({ id, commentId }) => ({
                url: `/recipes/${id}/comments/${commentId}/admin`,
                method: "DELETE",
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Recipe", id }],
        }),
        getUserRecipes: builder.query({
            query: ({ userId, page = 1, limit = 12, sort = "newest" }) => ({
                url: `/recipes/users/${userId}`,
                params: { page, limit, sort },
            }),
            providesTags: (r) => [{ type: "Recipe", id: "LIST_BY_USER" }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetRecipesQuery,
    useGetRecipeQuery,
    useAddRecipeMutation,
    useUpdateRecipeMutation,
    useDeleteRecipeMutation,
    useToggleLikeMutation,
    useAddRatingMutation,
    useUpdateRatingMutation,
    useDeleteMyRatingMutation,
    useAddCommentMutation,
    useDeleteMyCommentMutation,
    useAdminHideMutation,
    useAdminUnhideMutation,
    useAdminDeleteUserRatingMutation,
    useAdminDeleteCommentMutation,
    useGetUserRecipesQuery,
} = recipeApi;
