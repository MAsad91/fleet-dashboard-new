import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { fleetApi } from './api/fleetApi';
import { vehiclesApi } from './api/vehiclesApi';
import { driversApi } from './api/driversApi';
import { tripsApi } from './api/tripsApi';
import { alertsApi } from './api/alertsApi';
import { maintenanceApi } from './api/maintenanceApi';
import { dashcamsApi } from './api/dashcamsApi';
import { obdApi } from './api/obdApi';
import dashboardReducer from './slices/dashboardSlice';
import alertsReducer from './slices/alertsSlice';
import alertsUISliceReducer from './slices/alertsUISlice';
import tripsReducer from './slices/tripsSlice';
import tripsUIReducer from './slices/tripsUISlice';
import vehiclesUISliceReducer from './slices/vehiclesUISlice';
import driversUIReducer from './slices/driversSlice';
import maintenanceUIReducer from './slices/maintenanceSlice';
import maintenanceUISliceReducer from './slices/maintenanceUISlice';
import dashcamsUIReducer from './slices/dashcamsSlice';
import dashcamsUISliceReducer from './slices/dashcamsUISlice';
import obdUISliceReducer from './slices/obdUISlice';
import documentsUIReducer from './slices/documentsSlice';
import vehicleTypesUIReducer from './slices/vehicleTypesSlice';

export const store = configureStore({
  reducer: {
    // API slices
    [fleetApi.reducerPath]: fleetApi.reducer,
    [vehiclesApi.reducerPath]: vehiclesApi.reducer,
    [driversApi.reducerPath]: driversApi.reducer,
    [tripsApi.reducerPath]: tripsApi.reducer,
    [alertsApi.reducerPath]: alertsApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [dashcamsApi.reducerPath]: dashcamsApi.reducer,
    [obdApi.reducerPath]: obdApi.reducer,
    
        // Feature slices
        dashboard: dashboardReducer,
        alerts: alertsReducer,
        alertsUI: alertsUISliceReducer,
        trips: tripsReducer,
        tripsUI: tripsUIReducer,
        vehiclesUI: vehiclesUISliceReducer,
        driversUI: driversUIReducer,
        maintenanceUI: maintenanceUISliceReducer,
        dashcamsUI: dashcamsUISliceReducer,
        obdUI: obdUISliceReducer,
        documentsUI: documentsUIReducer,
        vehicleTypesUI: vehicleTypesUIReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          fleetApi.util.resetApiState.type,
          vehiclesApi.util.resetApiState.type,
          driversApi.util.resetApiState.type,
          tripsApi.util.resetApiState.type,
          alertsApi.util.resetApiState.type,
          maintenanceApi.util.resetApiState.type,
          dashcamsApi.util.resetApiState.type,
          obdApi.util.resetApiState.type,
        ],
      },
    }).concat(
      fleetApi.middleware,
      vehiclesApi.middleware,
      driversApi.middleware,
      tripsApi.middleware,
      alertsApi.middleware,
      maintenanceApi.middleware,
      dashcamsApi.middleware,
      obdApi.middleware
    ),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
