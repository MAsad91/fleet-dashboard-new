import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VehiclesFiltersState {
  fleet?: string;
  vehicle_type?: string;
  has_obd?: string;
  online?: string;
  health_status?: string;
  page?: number;
}

export interface VehiclesUIState {
  filters: VehiclesFiltersState;
  selectedVehicleId: string | null;
}

const initialState: VehiclesUIState = {
  filters: {
    page: 1,
  },
  selectedVehicleId: null,
};

const vehiclesSlice = createSlice({
  name: 'vehiclesUI',
  initialState,
  reducers: {
    setVehicleFilters: (state, action: PayloadAction<Partial<VehiclesFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetVehicleFilters: (state) => {
      state.filters = { page: 1 };
    },
    setSelectedVehicleId: (state, action: PayloadAction<string | null>) => {
      state.selectedVehicleId = action.payload;
    },
  },
});

export const { setVehicleFilters, resetVehicleFilters, setSelectedVehicleId } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;


