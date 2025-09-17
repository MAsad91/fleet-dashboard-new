import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardSummary } from '../api/fleetApi';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setDashboardData: (state, action: PayloadAction<DashboardSummary>) => {
      state.summary = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    setDashboardError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearDashboardData: (state) => {
      state.summary = null;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setDashboardLoading,
  setDashboardData,
  setDashboardError,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
