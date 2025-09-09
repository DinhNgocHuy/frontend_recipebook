import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
    search: "",
    topic: "",
    tags: [],
    sortBy: "publishedAt",
    sortDir: "desc",
    page: 1,
    pageSize: 6,
};

const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {
        setSearch(state, action) {
            state.search = action.payload ?? "";
            state.page = 1;
        },
        setTopic(state, action) {
            state.topic = action.payload ?? "";
            state.page = 1;
        },
        toggleTag(state, action) {
            const t = action.payload;
            const i = state.tags.indexOf(t);
            if (i >= 0) state.tags.splice(i, 1);
            else state.tags.push(t);
            state.page = 1;
        },
        clearFilters(state) {
            state.search = "";
            state.topic = "";
            state.tags = [];
            state.page = 1;
        },
        setSort(state, action) {
            const { by = "publishedAt", dir = "desc" } = action.payload || {};
            state.sortBy = by;
            state.sortDir = dir;
            state.page = 1;
        },
        setPage(state, action) {
            state.page = Number(action.payload) || 1;
        },
        setPageSize(state, action) {
            state.pageSize = Number(action.payload) || 12;
            state.page = 1;
        },
    },
});

export const {
    setSearch,
    setTopic,
    toggleTag,
    clearFilters,
    setSort,
    setPage,
    setPageSize,
} = blogSlice.actions;

export default blogSlice.reducer;

// Selector an toàn – không đụng state.blog.list nữa
export const selectBlogQueryArgs = createSelector(
    (state) => state.blog || initialState,
    (b) => ({
        search: b.search,
        topic: b.topic,
        tags: b.tags,
        sortBy: b.sortBy,
        sortDir: b.sortDir,
        page: b.page,
        pageSize: b.pageSize,
    })
);
