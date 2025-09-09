import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: "ui",
    initialState: { loading: false, modal: null, toast: null },
    reducers: {
        setLoading: (s, a) => { s.loading = a.payload; },
        openModal: (s, a) => { s.modal = a.payload; },
        closeModal: (s) => { s.modal = null; },
        showToast: (s, a) => { s.toast = a.payload; },
        clearToast: (s) => { s.toast = null; },
    },
});

export const { setLoading, openModal, closeModal, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
