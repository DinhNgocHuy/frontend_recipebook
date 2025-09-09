/* eslint-disable no-empty */
import { apiSlice } from "./apiSlice";
import { setCredentials, setUser, logout } from "../slices/authSlice";

// tiện ích gỡ lớp bọc res.success(...)
const unwrap = (res) => (res && res.data != null ? res.data : res);

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ===== CORE AUTH =====
        register: builder.mutation({
            // body: { username, fullname?, email, password }
            query: (body) => ({ url: "/auth/register", method: "POST", body }),
        }),

        login: builder.mutation({
            // body: { identifier, password }  (identifier = username hoặc email)
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled; // { token, user }
                    dispatch(setCredentials({ token: data?.token, user: data?.user }));
                } catch { }
            },
        }),

        logout: builder.mutation({
            query: () => ({ url: "/auth/logout", method: "POST" }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(logout());
                } catch { }
            },
        }),


        // ===== PROFILE / ACCOUNT =====
        fetchProfile: builder.query({
            query: () => ({ url: "/users/profile", method: "GET" }),
            transformResponse: (res) => unwrap(res),
            providesTags: ["Auth"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled; // {id,username,email,avatar,fullname,role}
                    dispatch(setUser(data));
                } catch (e) {
                    // Nếu 401 thì apiSlice baseQuery có thể chưa tự logout -> chủ động
                    if (e?.error?.status === 401) dispatch(logout());
                }
            },
        }),

        updateInfo: builder.mutation({
            // body: { email, fullname }
            query: (body) => ({ url: "/users/update-info", method: "PUT", body }),
            transformResponse: (res) => unwrap(res), // { user, message }
            invalidatesTags: ["Auth"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // backend trả { user } trong res.success
                    if (data?.user) dispatch(setUser(data.user));
                } catch { }
            },
        }),

        changePassword: builder.mutation({
            // body: { oldPassword, newPassword }
            query: (body) => ({ url: "/users/change-password", method: "PUT", body }),
        }),

        uploadAvatar: builder.mutation({
            // args: File hoặc { file } hoặc { avatar: File }
            query: (fileOrObj) => {
                const fd = new FormData();
                const file = fileOrObj?.avatar instanceof File ? fileOrObj.avatar
                    : fileOrObj instanceof File ? fileOrObj
                        : null;
                if (file) fd.append("avatar", file);
                return { url: "/users/avatar", method: "PUT", body: fd };
            },
            transformResponse: (res) => unwrap(res), // { avatar, user }
            invalidatesTags: ["Auth"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.user) dispatch(setUser(data.user));
                } catch { }
            },
        }),

        // ===== VERIFY EMAIL (HYBRID) =====
        requestVerifyEmail: builder.mutation({
            // cần JWT
            query: () => ({ url: "/auth/verify/request", method: "POST" }),
        }),

        confirmVerifyToken: builder.mutation({
            // token hex64: có thể GET ?token=..., ở FE dùng POST cho tiện
            query: (token) => ({ url: "/auth/verify/confirm", method: "POST", body: { token } }),
            invalidatesTags: ["Auth"],
        }),

        confirmVerifyCode: builder.mutation({
            // body: { code }, cần JWT
            query: (code) => ({ url: "/auth/verify/confirm-code", method: "POST", body: { code } }),
            invalidatesTags: ["Auth"],
        }),


        // ===== FORGOT / RESET PASSWORD (HYBRID) =====
        forgotPassword: builder.mutation({
            // body: { email } (response mù)
            query: (email) => ({ url: "/auth/forgot", method: "POST", body: { email } }),
        }),

        resetPasswordByToken: builder.mutation({
            // body: { token, newPassword }
            query: ({ token, newPassword }) => ({ url: "/auth/reset/token", method: "POST", body: { token, newPassword } }),
        }),

        resetPasswordByCode: builder.mutation({
            // body: { email, code, newPassword }
            query: ({ email, code, newPassword }) => ({ url: "/auth/reset/code", method: "POST", body: { email, code, newPassword } }),
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
    useFetchProfileQuery,
    useUpdateInfoMutation,
    useChangePasswordMutation,
    useUploadAvatarMutation,
    useRequestVerifyEmailMutation,
    useConfirmVerifyTokenMutation,
    useConfirmVerifyCodeMutation,
    useForgotPasswordMutation,
    useResetPasswordByTokenMutation,
    useResetPasswordByCodeMutation,
} = authApi;
