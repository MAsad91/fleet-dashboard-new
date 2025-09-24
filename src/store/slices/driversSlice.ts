import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DriversFiltersState {
  search?: string;
  status?: string;
  minRating?: string;
  page?: number;
}

export interface DriversUIState {
  filters: DriversFiltersState;
  selectedDriverId: string | null;
}

const initialState: DriversUIState = {
  filters: {
    page: 1,
  },
  selectedDriverId: null,
};

const driversSlice = createSlice({
  name: 'driversUI',
  initialState,
  reducers: {
    setDriverFilters: (state, action: PayloadAction<Partial<DriversFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetDriverFilters: (state) => {
      state.filters = { page: 1 };
    },
    setSelectedDriverId: (state, action: PayloadAction<string | null>) => {
      state.selectedDriverId = action.payload;
    },
  },
});

export const { setDriverFilters, resetDriverFilters, setSelectedDriverId } = driversSlice.actions;
export default driversSlice.reducer;

// Updated to include minRating filter


