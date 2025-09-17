# Vehicles

Base endpoints:
- List: `GET /api/fleet/vehicles/`
- Create: `POST /api/fleet/vehicles/`
- Detail: `GET /api/fleet/vehicles/{id}/`  (includes `vehicle`, `latest_obd`, `recent_alerts`)
- Update: `PUT/PATCH /api/fleet/vehicles/{id}/`
- Delete: `DELETE /api/fleet/vehicles/{id}/`

Custom actions:
- Bulk maintenance: `POST /api/fleet/vehicles/set_for_maintenance/`  
  Body: `{ "selected_vehicles": [ids...] }`
- Bulk retire: `POST /api/fleet/vehicles/retire_vehicles/`  
  Body: `{ "selected_vehicles": [ids...] }`
- Dashboard stats: `GET /api/fleet/vehicles/dashboard_stats/`
- Recent telemetry data (20 points): `GET /api/fleet/vehicles/{id}/telemetry_data/`
- Telemetry trends (time series): `GET /api/fleet/history/vehicle/{id}/`  
  Query: `date_range={today|10days|30days|90days}` or `start_date`, `end_date`; `include_details=true`, `include_raw=true` (optional)

List filters (query params):
- `fleet=<operator_id>`
- `vehicle_type=<id>`
- `has_obd=true|false`
- `online=true|false` (based on OBD last communication within 5 minutes)
- `health_status=Good|Warning|Critical`

Serializer fields (selection):
- `vin`, `license_plate`, `vehicle_type`, `make`, `model`, `year`
- `battery_capacity_kwh`, `current_battery_level`, `mileage_km`, `status`
- `last_known_location` (GeoJSON), `latitude`, `longitude`
- `efficiency_km_per_kwh`, `health_status`, `speed_kph`, `online_status`
- Optional nested: `obd_device`

Vehicle Detail aggregates:
- `vehicle`: full VehicleSerializer
- `latest_obd`: latest `OBDTelemetry` for vehicle
- `recent_alerts`: last 5 alerts for vehicle

## Create/Update — Request Bodies (backend‑accurate)

Notes (short)
- `vin` unique. `battery_capacity_kwh` > 0. `current_battery_level` 0–100.
- Send ids for `fleet_operator` and `vehicle_type`.
- `last_known_location` GeoJSON: `{ type:"Point", coordinates:[lng,lat] }`.
- `status`: `available|in_service|maintenance|retired`.
- Create OBD/SIM separately (see endpoints below). Do not include them here.

Full create (all supported writeable fields)

Notes
- Do not send read‑only fields: `id`, `created_at`, `health_status`, `latitude`, `longitude`, `online_status`, `speed_kph`.
- Date fields use `YYYY‑MM‑DD`.

```
{
  "vin": "VAUZZZ8V5LA567890",
  "fleet_operator": 3,
  "license_plate": "EV-5678",
  "vehicle_type": 3,
  "alerts_enabled": true,
  "ota_enabled": false,
  "make": "Hyundai",
  "model": "Kona Electric",
  "year": 2023,
  "battery_capacity_kwh": 64.0,
  "current_battery_level": 92.0,
  "mileage_km": 5200,
  "warranty_expiry_date": "2026-10-15",
  "status": "available",               // one of: available|in_service|maintenance|retired
  "color": "Blue",
  "seating_capacity": 5,
  "fuel_type": "Electric",
  "transmission_type": "Automatic",
  "last_known_location": { "type": "Point", "coordinates": [78.47258, 17.40406] },
  "efficiency_km_per_kwh": 5.0
}
```

Field reference (writeable)
- Vehicle: `vin`, `fleet_operator`, `license_plate`, `vehicle_type`, `alerts_enabled`, `ota_enabled`, `make`, `model`, `year`, `battery_capacity_kwh`, `current_battery_level`, `mileage_km`, `warranty_expiry_date`, `status`, `color`, `seating_capacity`, `fuel_type`, `transmission_type`, `last_known_location`, `efficiency_km_per_kwh`

Manage OBD devices and SIM cards separately
- OBD devices: POST/GET `/api/fleet/obd-devices/` — associate via `vehicle` field.
- SIM cards: POST/GET `/api/fleet/sim-cards/` — associate via `device` field.

### Dropdowns (simple)

- `fleet_operator` options → `GET /api/fleet/fleet-operators/`
  - Admins: see all. Others: see own operator. Preselect/disable for non-admins.
  - Use `id` as value, `name` as label. Paginate client-side if needed.

- `vehicle_type` options → `GET /api/fleet/vehicle-types/`
  - Use `id` as value, show `name` and  `category`.
  - No server filters; filter/search client-side. Paginate if needed.

Vehicle Detail aggregates:
- `vehicle`: full VehicleSerializer
- `latest_obd`: latest `OBDTelemetry` for vehicle
- `recent_alerts`: last 5 alerts for vehicle

## Code References

- Routes: `fleet/urls.py`
- Views: `VehicleViewSet` (list, detail, stats, bulk actions), `VehicleTelemetryTrendsView` (trends)
- Serializer: `VehicleSerializer`, `VehicleLiveDataSerializer`

## Full Flowchart Layout (Frontend‑accurate)

High‑Level Flow

```
Side Nav → [Vehicles]
               │
               ▼
        Vehicles — List
               │ (Row: View)
               ▼
        Vehicle — Detail
```

Vehicles — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicles                                      [+ Create] [Bulk ▼]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/vehicles/dashboard_stats/ with same filters)      │
│ ┌───────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Total         │ │ Available      │ │ In Service     │ │ Maintenance    │ │
│ │ [total_veh]   │ │ [avail_veh]    │ │ [in_serv_veh]  │ │ [maint_veh]    │ │
│ └───────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│ ┌────────────────┐ ┌─────────────────────────┐                              │
│ │ Avg Battery %  │ │ Expiring Vehicle Docs   │                              │
│ │ [avg_batt]%    │ │ [expiring_vehicle_docs] │                              │
│ └────────────────┘ └─────────────────────────┘                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Vehicle Type] [Has OBD] [Online] [Health] [Fleet]     (Apply)     │
│ Legend: Online = green/grey • Health = Good/Warning/Critical                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ VIN        Plate     Make / Model (Year)   Battery   Status   Online Health  │
│ 676776     ev-001    test / test (2020)    78%       avail.   off    Good    │
│ BAU…678    EV-9012   Mercedes / eSpr. (23) 64%       maint.   off    Good    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Set for Maintenance]  [Retire]                 Page 1/2       │
└─────────────────────────────────────────────────────────────────────────────┘

KPI call → GET /api/fleet/vehicles/dashboard_stats/?vehicle_type=&has_obd=&online=&health_status=&fleet=
List call → GET /api/fleet/vehicles/?vehicle_type=&has_obd=&online=&health_status=&fleet=
```

Vehicle — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle — Detail                     [Edit] [Maint.] [Retire] [Delete] [History] [Telemetry] │
│ Make / Model (Year)   VIN: KMHC851H5NU…   Plate: EV-9012   Status: in_service   ● │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Battery %      │ │ Status/Online  │ │ Health         │ │ Mileage (km)   │ │
│ │ [78%]          │ │ in_service/off │ │ Good           │ │ [12,400]       │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Info (Left)                                    │ Connectivity (Right)        │
│ • Vehicle Type: [category] (id) [View Type]     │ • OBD: device_id, model     │
│ • VIN                                          │   serial, firmware, baud     │
│ • License Plate                                │   report_interval, active    │
│ • Make/Model/Year                              │   Last Comm (timestamp)      │
│ • Status • Health • Online                     │   [View OBD Device]          │
│ • Color                                        │ • SIM: iccid, plan, status   │
│ • Seating Capacity                             │   used/limit GB, threshold   │
│ • Fuel Type                                    │   last_activity, signal      │
│ • Transmission                                 │   [View SIM Card]            │
│ • Battery Capacity (kWh)                       │ • Dashcam: device_id         │
│ • Efficiency (km/kWh)                          │   firmware, active, last_strm│
│ • Warranty Expiry                              │   [View Dashcam] [Videos]    │
│ • Alerts Enabled • OTA Enabled                 │                              │
├───────────────────────────────────────────────┴─────────────────────────────┤
│ LOCATION MAP (last_known_location or default Hyderabad lat/lng)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ LIVE SNAPSHOT (latest_obd): Speed | Battery % | (Range if present)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ RECENT ALERTS (5)  → from GET /api/fleet/alerts/?vehicle={id}&status=active │
├─────────────────────────────────────────────────────────────────────────────┤
│ CHARTS                                                                        │
│ • Recent (20 pts) → GET /api/fleet/vehicles/{id}/telemetry_data/             │
│   (Speed timeline • Battery timeline • Path coordinates)                      │
│ • Trends (Today | 10d | 30d | 90d) → GET /api/fleet/history/vehicle/{id}/    │
│   (Speed • Battery % • Motor Temp • Power • Range)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ PANELS                                                                        │
│ • Top Error Codes → GET /api/fleet/obd-telemetry/?vehicle={id}&top_errors=true&limit=10 │
│ • VEHICLE TYPE INSIGHTS                                                       │
│   – Alert Breakdown → GET /api/fleet/vehicle-types/{type_id}/alert-thresholds/│
│   – Firmware Lineage → GET /api/fleet/vehicle-types/{type_id}/firmware-lineage/│
│   – Type Documents → GET /api/fleet/vehicle-types/{type_id}/documents/        │
│   – Active Vehicles → GET /api/fleet/vehicle-types/{type_id}/active-vehicles/ │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOCUMENTS: open Vehicle Documents pre-filtered by vehicle                     │
├─────────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────┘
```

Vehicle — History (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle — History (VIN: …)                          [Back]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Range ▾ today|10d|30d|90d] [Start] [End]            (Apply)       │
│ Notes: Only admins can view any vehicle; others scoped to their operator.    │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/history/vehicle/{id}/)                              │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Max Speed (kph)│ │ Avg Battery %  │ │ Avg Range (km) │ │ Error Records  │ │
│ │ [max_speed_kph]│ │ [battery_level]│ │ [avg_range_km] │ │ [error_count]  │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│ ┌────────────────┐ ┌──────────────────────────┐                             │
│ │ Trips          │ │ Distance (km)            │                             │
│ │ [trip_count]   │ │ [distance_km]            │                             │
│ └────────────────┘ └──────────────────────────┘                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIME SERIES CHARTS (time_series_charts)                                       │
│  • Speed (speed_kph) • Battery % (battery_level_percent) • Range (range_km)   │
│  • Motor Temp (motor_temp_c) • Power (battery_power_kw)                       │
│  • Tire Pressure (tire_pressure_kpa) • Torque (torque_nm)                     │
│  Params: `?date_range=30days` or `start_date`,`end_date`; optional            │
│          `visualization=all|speed|battery_level|range|power|tire_pressure|…`  │
│          or `category=<metric>`; sampling via `max_points` (default 100).     │
├─────────────────────────────────────────────────────────────────────────────┤
│ PANELS (optional details: include_details=true)                               │
│ • Telemetry Stats: avg/min/max per metric (speed, battery, temp, range, …)    │
│ • Trips Summary: completed trips, total distance                              │
│ • Maintenance Summary: count, total cost                                      │
│ • Energy Breakdown: driving/charging/idle %                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ RAW (optional): include_raw=true → first 100 telemetry records (OBDTelemetry) │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Vehicle Detail — Field Map (API accurate)

- Vehicle core: `id`, `vin`, `fleet_operator` (id), `license_plate`, `vehicle_type` (category string), `vehicle_type_id`, `alerts_enabled`, `ota_enabled`, `make`, `model`, `year`, `battery_capacity_kwh`, `current_battery_level`, `mileage_km`, `warranty_expiry_date`, `status`, `created_at`, `color`, `seating_capacity`, `fuel_type`, `transmission_type`, `last_known_location` (GeoJSON), `latitude`, `longitude`, `efficiency_km_per_kwh`, `health_status`, `online_status`, `speed_kph`.
- Alert summary: `alerts_summary` with `WARNINGS` and `ERRORS` arrays (active, unresolved alerts).
- OBD device (nested): `id`, `device_id`, `model`, `serial_number`, `can_baud_rate`, `report_interval_sec`, `vehicle`, `fleet_operator`, `installed_at`, `is_active`, `last_communication_at`, `firmware_version`, `sim_card`.
- SIM card (nested under OBD): `id`, `sim_id`, `iccid`, `status`, `plan_name`, `plan_data_limit_gb`, `plan_cost`, `current_data_used_gb`, `current_cycle_start`, `overage_threshold`, `device`, `last_activity`, `signal_strength`, `created_at`.
- Latest OBD snapshot (`latest_obd`): `id`, `trip`, `timestamp`, `coordinates` (GeoJSON), `latitude`, `longitude`, `speed_kph`, `battery_level_percent`, `motor_temp_c`, `battery_voltage`, `odometer_km`, `error_codes`, `charge_limit_percent`, `battery_power_kw`, `tire_pressure_kpa`, `torque_nm`, `range_km`, `vehicle_id`, `device_id`.
- Recent alerts (`recent_alerts`): `id`, `alert_type`, `system`, `vehicle` (id), `vehicle_info` (vehicle object), `obd_device`, `device_id`, `driver`, `title`, `message`, `created_at`, `read`, `ignored`, `severity`, `resolved`, `resolved_at`, `status_label`.

Notes
- Vehicle type: the response includes `vehicle_type` (category string) and `vehicle_type_id`. Fetch details (name, code, category, etc.) via `GET /api/fleet/vehicle-types/{vehicle_type_id}/` when needed.
- Dashcam: not embedded in this response. Fetch via `GET /api/fleet/dashcams/?vehicle={id}` (list) or `GET /api/fleet/dashcams/{dashcam_id}/`.
- Location defaults: when `last_known_location` is null, `latitude`/`longitude` default to Hyderabad values for map fallback.

Data calls:
- GET /api/fleet/vehicles/{id}/  → { vehicle, latest_obd, recent_alerts }
- GET /api/fleet/vehicles/{id}/telemetry_data/  → { speed_data, battery_data, coords_data }
- GET /api/fleet/obd-telemetry/?vehicle={id}  → opens Telemetry — Explorer filtered by vehicle
- GET /api/fleet/history/vehicle/{id}/?date_range=30days  → { date_filter, vehicle, stats, time_series_charts }
- GET /api/fleet/history/vehicle/{id}/?start_date=…&end_date=…  → same as above
- Optional params: `include_details=true`, `include_raw=true`, `visualization=…` or `category=<metric>`, `max_points=<n>`
- GET /api/fleet/obd-telemetry/?vehicle={id}&top_errors=true&limit=10  → { top_error_codes }
- GET /api/fleet/alerts/?vehicle={id}&status=active  → recent active alerts
- GET /api/fleet/vehicle-documents/  (UI filters by vehicle id)
- GET /api/fleet/vehicle-types/{vehicle_type_id}/  → open Vehicle Type detail page
- GET /api/fleet/vehicle-types/{vehicle_type_id}/alert-thresholds/
- GET /api/fleet/vehicle-types/{vehicle_type_id}/firmware-lineage/
- GET /api/fleet/vehicle-types/{vehicle_type_id}/documents/
- GET /api/fleet/vehicle-types/{vehicle_type_id}/active-vehicles/
- GET /api/fleet/obd-devices/{obd_id}/  → open OBD Device detail page
- GET /api/fleet/sim-cards/{sim_id}/    → open SIM Card detail page (if present)
- GET /api/fleet/dashcams/{dashcam_id}/ (if present)
- GET /api/fleet/video-segments/?vehicle={id}
