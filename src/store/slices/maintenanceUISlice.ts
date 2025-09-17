import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MaintenanceFilters {
  search?: string;
  status?: string;
  vehicle_id?: string;
  maintenance_type?: string;
  start_date?: string;
  end_date?: string;
}

interface MaintenancePagination {
  page: number;
  limit: number;
}

interface MaintenanceUIState {
  filters: MaintenanceFilters;
  pagination: MaintenancePagination;
  selectedMaintenance: string[];
}

const initialState: MaintenanceUIState = {
  filters: {
    search: '',
    status: undefined,
    vehicle_id: undefined,
    maintenance_type: undefined,
    start_date: undefined,
    end_date: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  selectedMaintenance: [],
};

const maintenanceUISlice = createSlice({
  name: 'maintenanceUI',
  initialState,
  reducers: {
    setMaintenanceFilters: (state, action: PayloadAction<Partial<MaintenanceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setMaintenancePagination: (state, action: PayloadAction<Partial<MaintenancePagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedMaintenance: (state, action: PayloadAction<string[]>) => {
      state.selectedMaintenance = action.payload;
    },
    toggleMaintenanceSelection: (state, action: PayloadAction<string>) => {
      const maintenanceId = action.payload;
      if (state.selectedMaintenance.includes(maintenanceId)) {
        state.selectedMaintenance = state.selectedMaintenance.filter(id => id !== maintenanceId);
      } else {
        state.selectedMaintenance.push(maintenanceId);
      }
    },
    clearMaintenanceSelection: (state) => {
      state.selectedMaintenance = [];
    },
    resetMaintenanceFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setMaintenanceFilters,
  setMaintenancePagination,
  setSelectedMaintenance,
  toggleMaintenanceSelection,
  clearMaintenanceSelection,
  resetMaintenanceFilters,
} = maintenanceUISlice.actions;

export default maintenanceUISlice.reducer;
