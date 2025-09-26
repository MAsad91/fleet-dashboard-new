// Mock data for dashboard components when APIs are not available
export const mockDashboardData = {
  summary: {
    total_vehicles: 128,
    online_vehicles: 114,
    total_active_trips: 27,
    critical_alerts: 3,
    open_maintenance: 6,
    average_battery_level: 78.0,
    total_distance_travelled_km: 154230,
    vehicle_status_breakdown: { 
      available: 62, 
      in_use: 48, 
      maintenance: 18 
    },
    obd_metrics: {
      average_speed_kph: 54.2,
      average_motor_temp_c: 76.8,
      average_estimated_range_km: 312,
      average_battery_voltage: 48.7,
      average_tire_pressure_kpa: 225,
      vehicles_reporting_errors: 7
    },
    diagnostics: {
      device_health: { critical: 2, warning: 5, normal: 121, total: 128 },
      sim_usage: { high_usage: 9, inactive: 3, total: 12 },
      battery_health: { low_level: 11, total: 128 }
    },
    most_active_vehicle: {
      license_plate: "EV-9832",
      total_distance_km: 1284,
      driver_name: "John Smith"
    }
  },
  
  vehiclesStats: {
    total_vehicles: 128,
    online_vehicles: 114,
    vehicles_growth_rate: 5.2,
    online_growth_rate: 2.1
  },
  
  alertsData: {
    results: [
      {
        id: "1",
        severity: "critical",
        title: "Battery Low",
        vehicle: "EV-9832",
        created_at: "2024-01-15T10:30:00Z",
        status: "active"
      },
      {
        id: "2", 
        severity: "high",
        title: "Engine Overheating",
        vehicle: "EV-9831",
        created_at: "2024-01-15T09:15:00Z",
        status: "active"
      },
      {
        id: "3",
        severity: "medium", 
        title: "Tire Pressure Low",
        vehicle: "EV-9830",
        created_at: "2024-01-15T08:45:00Z",
        status: "active"
      }
    ]
  },
  
  tripsData: {
    results: [
      {
        id: "1",
        trip_id: "TRP-001",
        vehicle: "EV-9832",
        driver: "John Smith",
        status: "in_progress",
        actual_start_time: "2024-01-15T08:00:00Z"
      },
      {
        id: "2",
        trip_id: "TRP-002", 
        vehicle: "EV-9831",
        driver: "Jane Doe",
        status: "in_progress",
        actual_start_time: "2024-01-15T09:30:00Z"
      }
    ]
  },
  
  topErrorCodes: [
    { code: "P0001", description: "Fuel System Too Lean", count: 15 },
    { code: "P0300", description: "Random/Multiple Cylinder Misfire", count: 12 },
    { code: "P0171", description: "System Too Lean Bank 1", count: 8 },
    { code: "P0420", description: "Catalyst System Efficiency Below Threshold", count: 6 }
  ],
  
  telemetryData: {
    results: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      distance_km: Math.random() * 100 + 50,
      speed_kph: Math.random() * 40 + 30,
      battery_level: Math.random() * 20 + 70
    }))
  },
  
  dashcamStats: {
    total_recordings: 1247,
    incident_detections: 23,
    storage_used_gb: 156.7,
    storage_total_gb: 1000,
    cameras_online: 12,
    cameras_total: 15,
    recording_hours: 8.5,
    storage_trend: 'up',
    incident_trend: 'down',
    recording_trend: 'up'
  },
  
  aggregatedData: {
    total_data_points: 15420,
    average_speed_kph: 54.2,
    average_battery_level: 78.0,
    average_motor_temp_c: 76.8,
    average_efficiency_km_per_kwh: 6.3,
    data_quality_score: 94.2,
    total_energy_consumed_kwh: 1247.5,
    vehicles_reporting: 114,
    performance_trend: 'up',
    battery_trend: 'stable',
    efficiency_trend: 'up'
  }
};

export const getMockData = (component: string) => {
  switch (component) {
    case 'summary':
      return mockDashboardData.summary;
    case 'vehicles':
      return mockDashboardData.vehiclesStats;
    case 'alerts':
      return mockDashboardData.alertsData;
    case 'trips':
      return mockDashboardData.tripsData;
    case 'telemetry':
      return mockDashboardData.telemetryData;
    case 'dashcam':
      return mockDashboardData.dashcamStats;
    case 'aggregated':
      return mockDashboardData.aggregatedData;
    case 'errorCodes':
      return mockDashboardData.topErrorCodes;
    default:
      return null;
  }
};
