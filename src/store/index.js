import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import recipeReducer from "./slices/recipeSlice";
import blogReducer from "./slices/blogSlice";

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        recipe: recipeReducer,
        blog: blogReducer,
        ui: uiReducer,
    },
    middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);
