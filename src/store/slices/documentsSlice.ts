import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DocumentsFiltersState {
  vehicle?: string;
  type?: string;
  page?: number;
}

export interface DocumentsUIState {
  filters: DocumentsFiltersState;
}

const initialState: DocumentsUIState = {
  filters: {
    page: 1,
  },
};

const documentsSlice = createSlice({
  name: 'documentsUI',
  initialState,
  reducers: {
    setDocumentFilters: (state, action: PayloadAction<Partial<DocumentsFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetDocumentFilters: (state) => {
      state.filters = { page: 1 };
    },
  },
});

export const { setDocumentFilters, resetDocumentFilters } = documentsSlice.actions;
export default documentsSlice.reducer;


