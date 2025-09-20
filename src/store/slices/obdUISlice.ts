import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OBDFilters {
  search?: string;
  status?: string; // active/inactive
  online?: string; // online/offline (computed from last_communication_at)
  model?: string;
  firmware_version?: string;
}

interface OBDPagination {
  page: number;
  limit: number;
}

interface OBDUIState {
  filters: OBDFilters;
  pagination: OBDPagination;
  selectedDevices: string[];
}

const initialState: OBDUIState = {
  filters: {
    search: '',
    status: undefined,
    online: undefined,
    model: undefined,
    firmware_version: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  selectedDevices: [],
};

const obdUISlice = createSlice({
  name: 'obdUI',
  initialState,
  reducers: {
    setOBDFilters: (state, action: PayloadAction<Partial<OBDFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setOBDPagination: (state, action: PayloadAction<Partial<OBDPagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedDevices: (state, action: PayloadAction<string[]>) => {
      state.selectedDevices = action.payload;
    },
    toggleDeviceSelection: (state, action: PayloadAction<string>) => {
      const deviceId = action.payload;
      if (state.selectedDevices.includes(deviceId)) {
        state.selectedDevices = state.selectedDevices.filter(id => id !== deviceId);
      } else {
        state.selectedDevices.push(deviceId);
      }
    },
    clearDevicesSelection: (state) => {
      state.selectedDevices = [];
    },
    resetOBDFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setOBDFilters,
  setOBDPagination,
  setSelectedDevices,
  toggleDeviceSelection,
  clearDevicesSelection,
  resetOBDFilters,
} = obdUISlice.actions;

export default obdUISlice.reducer;
