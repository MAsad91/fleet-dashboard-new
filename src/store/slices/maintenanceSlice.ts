import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MaintenanceFiltersState {
  status?: string;
  due_in_days?: number;
  page?: number;
}

export interface MaintenanceUIState {
  filters: MaintenanceFiltersState;
}

const initialState: MaintenanceUIState = {
  filters: {
    page: 1,
  },
};

const maintenanceSlice = createSlice({
  name: 'maintenanceUI',
  initialState,
  reducers: {
    setMaintenanceFilters: (state, action: PayloadAction<Partial<MaintenanceFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetMaintenanceFilters: (state) => {
      state.filters = { page: 1 };
    },
  },
});

export const { setMaintenanceFilters, resetMaintenanceFilters } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;


