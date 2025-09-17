import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DashcamsFiltersState {
  status?: string;
  page?: number;
}

export interface DashcamsUIState {
  filters: DashcamsFiltersState;
}

const initialState: DashcamsUIState = {
  filters: {
    page: 1,
  },
};

const dashcamsSlice = createSlice({
  name: 'dashcamsUI',
  initialState,
  reducers: {
    setDashcamFilters: (state, action: PayloadAction<Partial<DashcamsFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetDashcamFilters: (state) => {
      state.filters = { page: 1 };
    },
  },
});

export const { setDashcamFilters, resetDashcamFilters } = dashcamsSlice.actions;
export default dashcamsSlice.reducer;


