import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trip } from '../api/fleetApi';

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setTripsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTripsData: (state, action: PayloadAction<Trip[]>) => {
      state.trips = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    setTripsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateTrip: (state, action: PayloadAction<{ id: string; updates: Partial<Trip> }>) => {
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = { ...state.trips[index], ...action.payload.updates };
      }
    },
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.trips.unshift(action.payload);
      // Keep only the latest 20 trips
      if (state.trips.length > 20) {
        state.trips = state.trips.slice(0, 20);
      }
    },
    removeTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
    },
    clearTripsData: (state) => {
      state.trips = [];
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setTripsLoading,
  setTripsData,
  setTripsError,
  updateTrip,
  addTrip,
  removeTrip,
  clearTripsData,
} = tripsSlice.actions;

export default tripsSlice.reducer;
