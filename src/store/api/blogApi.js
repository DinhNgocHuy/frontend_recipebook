// src/store/api/blogApi.js
import { apiSlice } from "./apiSlice";

/** Tạo payload: nếu có file thumbnail -> FormData (field name phải là "thumbnail") */
function buildBlogPayload(data = {}) {
    const hasFile =
        data?.thumbnail instanceof File || data?.thumbnailFile instanceof File;
    if (!hasFile) {
        const body = { ...data };
        delete body.thumbnailFile;
        return { body, isForm: false };
    }
    const fd = new FormData();
    const { title, content, thumbnail, thumbnailFile, ...rest } = data;
    if (title != null) fd.append("title", title);
    if (content != null) fd.append("content", content);
    const file = thumbnailFile || thumbnail;
    if (file) fd.append("thumbnail", file); // <-- backend uploadBlogImage.single("thumbnail")
    Object.entries(rest).forEach(([k, v]) => {
        if (v != null) fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    });
    return { body: fd, isForm: true };
}

export const blogApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ===== LIST (server không paginate) =====
        getBlogs: builder.query({
            // args: { page, pageSize }
            query: (args = {}) => {
                const { q, sort = "newest" } = args;
                return {
                    url: "/blogs",
                    params: { q, sort }
                };
            },
            transformResponse: (res, _meta, arg) => {
                const root = res?.data ?? res;
                const all =
                    Array.isArray(root) ? root :
                        Array.isArray(root?.items) ? root.items :
                            Array.isArray(root?.data) ? root.data : [];

                // Phân trang phía client
                const page = Number(arg?.page ?? 1);
                const limit = Number(arg?.pageSize ?? 12);
                const start = (page - 1) * limit;
                const items = all.slice(start, start + limit);
                const total = all.length;

                return { items, total, page, limit };
            },
            providesTags: (result) =>
                result?.items?.length
                    ? [{ type: "BlogList", id: "LIST" }, ...result.items.map((b) => ({ type: "Blog", id: b._id }))]
                    : [{ type: "BlogList", id: "LIST" }],
        }),

        // ===== DETAIL =====
        getBlog: builder.query({
            query: (id) => `/blogs/${id}`,
            transformResponse: (res) => res?.data ?? res,
            providesTags: (r, e, id) => [{ type: "Blog", id }],
        }),

        // ===== CREATE (admin) =====
        addBlog: builder.mutation({
            query: (data) => {
                const { body } = buildBlogPayload(data);
                return { url: "/blogs", method: "POST", body };
            },
            invalidatesTags: [{ type: "BlogList", id: "LIST" }],
        }),

        // ===== UPDATE (admin) =====
        updateBlog: builder.mutation({
            query: ({ id, ...data }) => {
                const { body } = buildBlogPayload(data);
                return { url: `/blogs/${id}`, method: "PUT", body };
            },
            invalidatesTags: (r, e, { id }) => [{ type: "Blog", id }],
        }),

        // ===== DELETE (admin) =====
        deleteBlog: builder.mutation({
            query: (id) => ({ url: `/blogs/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: "BlogList", id: "LIST" }],
        }),

        // ===== COMMENTS =====
        addComment: builder.mutation({
            // POST /blogs/:id/comment  body: { content }
            query: ({ id, content }) => ({
                url: `/blogs/${id}/comment`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Blog", id }],
        }),
        deleteComment: builder.mutation({
            // DELETE /blogs/:blogId/comment/:commentId
            query: ({ blogId, commentId }) => ({
                url: `/blogs/${blogId}/comment/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (r, e, { blogId }) => [{ type: "Blog", id: blogId }],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogQuery,
    useAddBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
    useAddCommentMutation,
    useDeleteCommentMutation,
} = blogApi;
