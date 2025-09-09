import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: async (args, api, extra) => {
        // bọc fetchBaseQuery để log & xử lý 401
        const rawBaseQuery = fetchBaseQuery({
            baseUrl: BASE_URL,
            credentials: "include",
            prepareHeaders: (headers, { getState }) => {
                const token = getState().auth.token;
                if (token) headers.set("authorization", `Bearer ${token}`);
                return headers;
            },
        });

        const result = await rawBaseQuery(args, api, extra);

        if (result?.error?.status === 401) {
            api.dispatch(logout());
        }
        return result;
    },
    tagTypes: ["Recipe", "RecipeList", "Blog", "BlogList", "Auth"],
    endpoints: () => ({}),
});
