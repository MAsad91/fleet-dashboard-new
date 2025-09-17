import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VehiclesFilters {
  search?: string;
  status?: string;
  vehicle_type_id?: string;
  make?: string;
  model?: string;
  year?: string;
}

interface VehiclesPagination {
  page: number;
  limit: number;
}

interface VehiclesUIState {
  filters: VehiclesFilters;
  pagination: VehiclesPagination;
  selectedVehicles: string[];
}

const initialState: VehiclesUIState = {
  filters: {
    search: '',
    status: undefined,
    vehicle_type_id: undefined,
    make: undefined,
    model: undefined,
    year: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  selectedVehicles: [],
};

const vehiclesUISlice = createSlice({
  name: 'vehiclesUI',
  initialState,
  reducers: {
    setVehiclesFilters: (state, action: PayloadAction<Partial<VehiclesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setVehiclesPagination: (state, action: PayloadAction<Partial<VehiclesPagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedVehicles: (state, action: PayloadAction<string[]>) => {
      state.selectedVehicles = action.payload;
    },
    toggleVehicleSelection: (state, action: PayloadAction<string>) => {
      const vehicleId = action.payload;
      if (state.selectedVehicles.includes(vehicleId)) {
        state.selectedVehicles = state.selectedVehicles.filter(id => id !== vehicleId);
      } else {
        state.selectedVehicles.push(vehicleId);
      }
    },
    clearVehiclesSelection: (state) => {
      state.selectedVehicles = [];
    },
    resetVehiclesFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setVehiclesFilters,
  setVehiclesPagination,
  setSelectedVehicles,
  toggleVehicleSelection,
  clearVehiclesSelection,
  resetVehiclesFilters,
} = vehiclesUISlice.actions;

export default vehiclesUISlice.reducer;
