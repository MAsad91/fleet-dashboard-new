import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '../api/fleetApi';

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: AlertsState = {
  alerts: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlertsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAlertsData: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    setAlertsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      // Keep only the latest 10 alerts
      if (state.alerts.length > 10) {
        state.alerts = state.alerts.slice(0, 10);
      }
    },
    updateAlert: (state, action: PayloadAction<{ id: number; updates: Partial<Alert> }>) => {
      const index = state.alerts.findIndex(alert => alert.id === action.payload.id);
      if (index !== -1) {
        state.alerts[index] = { ...state.alerts[index], ...action.payload.updates };
      }
    },
    removeAlert: (state, action: PayloadAction<number>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlertsData: (state) => {
      state.alerts = [];
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setAlertsLoading,
  setAlertsData,
  setAlertsError,
  addAlert,
  updateAlert,
  removeAlert,
  clearAlertsData,
} = alertsSlice.actions;

export default alertsSlice.reducer;
