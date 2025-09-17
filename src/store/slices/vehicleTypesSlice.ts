import { createSlice } from '@reduxjs/toolkit';

interface VehicleTypesUIState {
  initialized: boolean;
}

const initialState: VehicleTypesUIState = {
  initialized: false,
};

const vehicleTypesSlice = createSlice({
  name: 'vehicleTypesUI',
  initialState,
  reducers: {
    setVehicleTypesInitialized: (state, action) => {
      state.initialized = action.payload as boolean;
    },
  },
});

export const { setVehicleTypesInitialized } = vehicleTypesSlice.actions;
export default vehicleTypesSlice.reducer;


