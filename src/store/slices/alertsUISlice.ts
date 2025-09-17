import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertsFilters {
  search?: string;
  status?: string;
  severity?: string;
  alert_type?: string;
  vehicle_id?: string;
  driver_id?: string;
  start_date?: string;
  end_date?: string;
}

interface AlertsPagination {
  page: number;
  limit: number;
}

interface AlertsUIState {
  filters: AlertsFilters;
  pagination: AlertsPagination;
  selectedAlerts: string[];
}

const initialState: AlertsUIState = {
  filters: {
    search: '',
    status: undefined,
    severity: undefined,
    alert_type: undefined,
    vehicle_id: undefined,
    driver_id: undefined,
    start_date: undefined,
    end_date: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  selectedAlerts: [],
};

const alertsUISlice = createSlice({
  name: 'alertsUI',
  initialState,
  reducers: {
    setAlertsFilters: (state, action: PayloadAction<Partial<AlertsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setAlertsPagination: (state, action: PayloadAction<Partial<AlertsPagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedAlerts: (state, action: PayloadAction<string[]>) => {
      state.selectedAlerts = action.payload;
    },
    toggleAlertSelection: (state, action: PayloadAction<string>) => {
      const alertId = action.payload;
      if (state.selectedAlerts.includes(alertId)) {
        state.selectedAlerts = state.selectedAlerts.filter(id => id !== alertId);
      } else {
        state.selectedAlerts.push(alertId);
      }
    },
    clearAlertsSelection: (state) => {
      state.selectedAlerts = [];
    },
    resetAlertsFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setAlertsFilters,
  setAlertsPagination,
  setSelectedAlerts,
  toggleAlertSelection,
  clearAlertsSelection,
  resetAlertsFilters,
} = alertsUISlice.actions;

export default alertsUISlice.reducer;
