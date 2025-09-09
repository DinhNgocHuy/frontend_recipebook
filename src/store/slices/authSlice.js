import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "rb_token";
const initialToken = localStorage.getItem(TOKEN_KEY) || null;

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: initialToken,
        user: null,           // sẽ fetch /users/profile sau khi có token
    },
    reducers: {
        setCredentials(state, action) {
            const { token, user, skipStoreToken } = action.payload || {};
            if (token) {
                state.token = token;
                if (!skipStoreToken) localStorage.setItem(TOKEN_KEY, token);
            }
            if (user) state.user = user;
        },
        setUser(state, action) {
            state.user = action.payload || null;
        },
        logout(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem(TOKEN_KEY);
        },
    },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
