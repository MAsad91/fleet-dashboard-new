import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashcamsFilters {
  search?: string;
  status?: string;
  vehicle_id?: string;
}

interface DashcamsPagination {
  page: number;
  limit: number;
}

interface DashcamsUIState {
  filters: DashcamsFilters;
  pagination: DashcamsPagination;
  selectedDashcams: string[];
}

const initialState: DashcamsUIState = {
  filters: {
    search: '',
    status: undefined,
    vehicle_id: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  selectedDashcams: [],
};

const dashcamsUISlice = createSlice({
  name: 'dashcamsUI',
  initialState,
  reducers: {
    setDashcamsFilters: (state, action: PayloadAction<Partial<DashcamsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setDashcamsPagination: (state, action: PayloadAction<Partial<DashcamsPagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedDashcams: (state, action: PayloadAction<string[]>) => {
      state.selectedDashcams = action.payload;
    },
    toggleDashcamSelection: (state, action: PayloadAction<string>) => {
      const dashcamId = action.payload;
      if (state.selectedDashcams.includes(dashcamId)) {
        state.selectedDashcams = state.selectedDashcams.filter(id => id !== dashcamId);
      } else {
        state.selectedDashcams.push(dashcamId);
      }
    },
    clearDashcamsSelection: (state) => {
      state.selectedDashcams = [];
    },
    resetDashcamsFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setDashcamsFilters,
  setDashcamsPagination,
  setSelectedDashcams,
  toggleDashcamSelection,
  clearDashcamsSelection,
  resetDashcamsFilters,
} = dashcamsUISlice.actions;

export default dashcamsUISlice.reducer;
