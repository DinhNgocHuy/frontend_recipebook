import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    list: {
        page: 1,
        pageSize: 12,
        sortBy: "createdAt",
        sortDir: "desc", // 'asc' | 'desc'
        search: "",
        category: "",     // ví dụ: "Dessert", "Drink", ...
        tags: [],         // ["spicy", "vegan", ...]
        onlyMy: false,    // chỉ công thức của tôi (nếu backend hỗ trợ)
    },
    selection: {
        currentId: null,  // id đang xem/được chọn
    },
    ui: {
        createOpen: false,
        editOpen: false,
        detailOpen: false,
        pendingId: null,  // id đang xử lý (xóa/cập nhật)
    },
    editor: {
        // draft dùng cho create/edit; bạn có thể tùy biến field theo schema backend
        draft: null, // { title:'', description:'', images:[], ingredients:[], steps:[] }
    },
};

const recipeSlice = createSlice({
    name: "recipeUI",
    initialState,
    reducers: {
        // ----- FILTER / SORT / PAGINATION -----
        setSearch(state, action) { state.list.search = action.payload || ""; state.list.page = 1; },
        setCategory(state, action) { state.list.category = action.payload || ""; state.list.page = 1; },
        setTags(state, action) { state.list.tags = Array.isArray(action.payload) ? action.payload : []; state.list.page = 1; },
        toggleTag(state, action) {
            const tag = String(action.payload || "").trim();
            if (!tag) return;
            const idx = state.list.tags.indexOf(tag);
            if (idx >= 0) state.list.tags.splice(idx, 1);
            else state.list.tags.push(tag);
            state.list.page = 1;
        },
        setOnlyMy(state, action) { state.list.onlyMy = !!action.payload; state.list.page = 1; },
        clearFilters(state) {
            state.list.search = "";
            state.list.category = "";
            state.list.tags = [];
            state.list.onlyMy = false;
            state.list.page = 1;
        },
        setSort(state, action) {
            const { by, dir } = action.payload || {};
            if (by) state.list.sortBy = by;
            if (dir) state.list.sortDir = dir === "asc" ? "asc" : "desc";
            state.list.page = 1;
        },
        setPage(state, action) { state.list.page = Math.max(1, Number(action.payload) || 1); },
        setPageSize(state, action) {
            const ps = Number(action.payload) || 12;
            state.list.pageSize = ps > 0 ? ps : 12;
            state.list.page = 1;
        },

        // ----- SELECTION & DETAIL -----
        selectRecipe(state, action) { state.selection.currentId = action.payload || null; },
        clearSelection(state) { state.selection.currentId = null; },
        openDetail(state, action) {
            state.ui.detailOpen = true;
            state.selection.currentId = action.payload ?? state.selection.currentId;
        },
        closeDetail(state) { state.ui.detailOpen = false; },

        // ----- CREATE / EDIT MODAL & DRAFT -----
        openCreate(state) {
            state.ui.createOpen = true;
            state.editor.draft = { title: "", description: "", images: [], ingredients: [], steps: [] };
        },
        openEdit(state, action) {
            state.ui.editOpen = true;
            // nếu đã có dữ liệu từ RTKQ (detail), bạn truyền vào đây
            state.editor.draft = action.payload || null;
        },
        closeEditor(state) {
            state.ui.createOpen = false;
            state.ui.editOpen = false;
            state.editor.draft = null;
        },
        setDraft(state, action) {
            // ghi đè toàn bộ draft
            state.editor.draft = action.payload || state.editor.draft;
        },
        setDraftField(state, action) {
            // cập nhật 1 field: { key, value }
            const { key, value } = action.payload || {};
            if (!state.editor.draft || !key) return;
            state.editor.draft[key] = value;
        },

        // ----- PENDING -----
        setPendingId(state, action) { state.ui.pendingId = action.payload || null; },
    },
});

export const {
    setSearch, setCategory, setTags, toggleTag, setOnlyMy, clearFilters,
    setSort, setPage, setPageSize,
    selectRecipe, clearSelection, openDetail, closeDetail,
    openCreate, openEdit, closeEditor, setDraft, setDraftField,
    setPendingId,
} = recipeSlice.actions;

export default recipeSlice.reducer;

// ----- Selectors tiện dụng -----
export const selectRecipeQueryArgs = (state) => {
    const { search, category, tags, onlyMy, sortBy, sortDir, page, pageSize } = state.recipeUI.list;
    return { search, category, tags, onlyMy, sortBy, sortDir, page, pageSize };
};
export const selectRecipeDraft = (state) => state.recipeUI.editor.draft;
export const selectRecipeSelectedId = (state) => state.recipeUI.selection.currentId;
export const selectRecipeUI = (state) => state.recipeUI.ui;
