import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TripsFilters {
  search?: string;
  status?: string;
  driver_id?: string;
  vehicle_id?: string;
  start_date?: string;
  end_date?: string;
}

interface TripsPagination {
  page: number;
  limit: number;
}

interface TripsUIState {
  filters: TripsFilters;
  pagination: TripsPagination;
  selectedTrips: string[];
}

const initialState: TripsUIState = {
  filters: {
    search: '',
    status: undefined,
    driver_id: undefined,
    vehicle_id: undefined,
    start_date: undefined,
    end_date: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  selectedTrips: [],
};

const tripsUISlice = createSlice({
  name: 'tripsUI',
  initialState,
  reducers: {
    setTripsFilters: (state, action: PayloadAction<Partial<TripsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    setTripsPagination: (state, action: PayloadAction<Partial<TripsPagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedTrips: (state, action: PayloadAction<string[]>) => {
      state.selectedTrips = action.payload;
    },
    toggleTripSelection: (state, action: PayloadAction<string>) => {
      const tripId = action.payload;
      if (state.selectedTrips.includes(tripId)) {
        state.selectedTrips = state.selectedTrips.filter(id => id !== tripId);
      } else {
        state.selectedTrips.push(tripId);
      }
    },
    clearTripsSelection: (state) => {
      state.selectedTrips = [];
    },
    resetTripsFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setTripsFilters,
  setTripsPagination,
  setSelectedTrips,
  toggleTripSelection,
  clearTripsSelection,
  resetTripsFilters,
} = tripsUISlice.actions;

export default tripsUISlice.reducer;
