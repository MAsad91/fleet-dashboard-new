# Fleet Admin Dashboard — Frontend Design & API Integration Guide

- Base URL: `https://fleet.platform-api-test.joulepoint.com`
- All endpoints are prefixed with: `/api/`
- Fleet APIs live under: `/api/fleet/...`
- Users/Auth APIs live under: `/api/users/...`

This guide is derived strictly from the implemented backend (models, serializers, views) in the `fleet` and `users` apps. It avoids assumptions and only documents features that exist in code.

## Left Navigation (Fleet Admin)

- Dashboard
- Drivers
- Driver Documents
- Trips
- Telemetry
- Alerts
- Alert Rules
- OBD Devices
- SIM Cards
- Maintenance
- Insurance
- Dashcams & Videos
- Firmware Updates
- Analytics
- Driver Logs
- Performance
- Fleet Settings
- Users & Permissions

## Global Notes

- Auth: use `/api/users/login_with_password/` to obtain `access_token` and `refresh_token`. Refresh with `/api/users/refresh_token/`.
- Date filters: several endpoints accept `date_range` in `{today,10days,30days,90days}`; or explicit `start_date`, `end_date`.
- Operator scoping: for non-staff users, most fleet endpoints are scoped to the user’s `profile.fleet_operator` on the server.

## ASCII Flow: Navigation & API Touchpoints

```
┌───────────────────────────────────────────────────────────┐
│                  FLEET ADMIN DASHBOARD                    │
│  Base: https://fleet.platform-api-test.joulepoint.com     │
│  Prefix: /api/                                            │
├───────────────┬───────────────────────────────────────────┤
│  NAV          │  CONTENT                                  │
│────────────── │────────────────────────────────────────── │
│  Dashboard    │  KPIs, charts → GET /fleet/dashboard/summary/      │
│               │  Extras: drivers/trips/alerts .../stats             │
│               │                                                     │
│  Drivers      │  CRUD → /fleet/drivers/; bulk suspend/export; stats │
│  Driver Docs  │  CRUD → /fleet/driver-documents/                   │
│  Trips        │  CRUD → /fleet/trips/; start/end/cancel; command   │
│  Telemetry    │  OBD data → /fleet/obd-telemetry/ (filters/agg)    │
│  Alerts       │  List/update + ack/ignore/resolve; bulk ops (no create) → /fleet/alerts/ │
│  Alert Rules  │  CRUD → /fleet/alert-rules/                        │
│  OBD Devices  │  CRUD → /fleet/obd-devices/; distinct-values       │
│  SIM Cards    │  CRUD → /fleet/sim-cards/; status/usage/summary    │
│  Maintenance  │  Records → /fleet/maintenance-records/             │
│               │  Scheduled → /fleet/scheduled-maintenance/         │
│  Insurance    │  CRUD → /fleet/insurance-policies/                 │
│  Dashcams     │  CRUD → /fleet/dashcams/; Videos → /video-segments/│
│  Firmware     │  CRUD+rollout → /fleet/firmware-updates/           │
│  Analytics    │  KPIs → GET /fleet/analytics/                      │
│  Driver Logs  │  CRUD → /fleet/driver-logs/                        │
│  Performance  │  Driver → /fleet/driver-performance/             │
│  Fleet Settings│ Get/Update → /fleet/fleet-settings/               │
│  Users        │  Login/Refresh/Profile/Perms → /users/...          │
├───────────────┴───────────────────────────────────────────┤
│ Live Telemetry: Admin UI polls REST.                                   │
└───────────────────────────────────────────────────────────┘
```

## Wireframe — Global Layout & Side Navigation

```
┌───────────────────────────────────────────────────────────────┐
│ Header: Fleet Admin | Tenant | User Menu                      │
├──────────────┬────────────────────────────────────────────────┤
│ Side Nav     │ Content Area                                   │
│──────────────│────────────────────────────────────────────────│
│ ▸ Dashboard  │ [Route content renders here]                   │
│                                                                │
│ ▸ Drivers    │                                                │
│   Driver Docs│                                                │
│ ▸ Trips      │                                                │
│ ▸ Telemetry  │                                                │
│ ▸ Alerts     │                                                │
│   Alert Rules│                                                │
│ ▸ OBD Devices│                                                │
│ ▸ SIM Cards  │                                                │
│ ▸ Maintenance│                                                │
│ ▸ Insurance  │                                                │
│ ▸ Dashcams   │                                                │
│ ▸ Firmware   │                                                │
│ ▸ Analytics  │                                                │
│ ▸ Driver Logs│                                                │
│ ▸ Performance│                                                │
│ ▸ Fleet Settings                                              │
│ ▸ Users     │                                                │
└──────────────┴────────────────────────────────────────────────┘
```

## Implementation Outline

- Dashboard
  - KPIs from: `/api/fleet/dashboard/summary/`
  - Supplementary stats: 
    - `/api/fleet/drivers/dashboard_stats/`
    - `/api/fleet/trips/dashboard_stats/` (note: “active” vs “in_progress” caveat; see Trips doc)
    - `/api/fleet/alerts/dashboard_stats/`
    - `/api/fleet/scheduled-maintenance/dashboard_stats/`
    - `/api/fleet/dashcams/dashboard_stats/`
- Live Telemetry
  - Poll recent data via `/api/fleet/obd-telemetry/`.
  - WebSocket endpoint for device connections; frontend polls REST.
- Control/Commands
  - Send commands via `/api/fleet/trips/{id}/command/` (locks/engine actions via channel layer to vehicles).
- Users & Auth (allowed subset)
  - `/api/users/login_with_password/`, `/api/users/refresh_token/`, `/api/users/user_profile/`
  - OTP/profile update endpoints as listed in Auth doc.

## Section Guides

- Dashboard: `sections/dashboard.md`
- Drivers: `sections/drivers.md`
- Driver Documents: `sections/driver_documents.md`
- Trips: `sections/trips.md`
- Telemetry: `sections/telemetry.md`
- Alerts: `sections/alerts.md`
- Alert Rules: `sections/alert_rules.md`
- OBD Devices: `sections/obd_devices.md`
- SIM Cards: `sections/sim_cards.md`
- Maintenance: `sections/maintenance.md`
- Insurance: `sections/insurance.md`
- Dashcams & Videos: `sections/dashcams.md`
- Firmware Updates: `sections/firmware.md`
- Analytics: `sections/analytics.md`
- Driver Logs: `sections/driver_logs.md`
- Performance: `sections/performance.md`
- Fleet Settings: `sections/fleet_settings.md`
- Users & Permissions: `sections/auth_users.md`

## Flowcharts

Each section contains its own embedded "Full Flowchart Layout" that reflects the current backend. Separate flowchart index pages are no longer maintained.







TOTAL APIS

Total APIs: 165

### Dashboard & Analytics
GET /fleet/dashboard/summary/
GET /fleet/analytics/

### Vehicles
GET /fleet/vehicles/
POST /fleet/vehicles/
GET /fleet/vehicles/dashboard_stats/
POST /fleet/vehicles/set_for_maintenance/
POST /fleet/vehicles/retire_vehicles/
DELETE /fleet/vehicles/{{vehicle_id}}/
GET /fleet/vehicles/{{vehicle_id}}/
PATCH /fleet/vehicles/{{vehicle_id}}/

### Vehicle Documents
GET /fleet/vehicle-documents/
POST /fleet/vehicle-documents/
DELETE /fleet/vehicle-documents/{{vehicle_doc_id}}/
GET /fleet/vehicle-documents/{{vehicle_doc_id}}/
PATCH /fleet/vehicle-documents/{{vehicle_doc_id}}/

### Vehicle Types
GET /fleet/vehicle-types/
POST /fleet/vehicle-types/
POST /fleet/vehicle-types/upload-csv/
DELETE /fleet/vehicle-types/{{vehicle_type_id}}/
GET /fleet/vehicle-types/{{vehicle_type_id}}/
PATCH /fleet/vehicle-types/{{vehicle_type_id}}/
GET /fleet/vehicle-types/{{vehicle_type_id}}/active-vehicles/
GET /fleet/vehicle-types/{{vehicle_type_id}}/alert-thresholds/
GET /fleet/vehicle-types/{{vehicle_type_id}}/documents/
GET /fleet/vehicle-types/{{vehicle_type_id}}/firmware-lineage/

### Drivers
GET /fleet/drivers/
POST /fleet/drivers/
GET /fleet/drivers/dashboard_stats/
GET /fleet/drivers/export_drivers_csv/
POST /fleet/drivers/suspend_drivers/
DELETE /fleet/drivers/{{driver_id}}/
GET /fleet/drivers/{{driver_id}}/
PATCH /fleet/drivers/{{driver_id}}/
PATCH /fleet/drivers/{{driver_id}}/update_driver/
GET /fleet/driver-logs/
GET /fleet/driver-logs/{{driver_log_id}}/
GET /fleet/driver-performance/

### Driver Documents
GET /fleet/driver-documents/
POST /fleet/driver-documents/
DELETE /fleet/driver-documents/{{driver_doc_id}}/
GET /fleet/driver-documents/{{driver_doc_id}}/
PATCH /fleet/driver-documents/{{driver_doc_id}}/

### Trips
GET /fleet/trips/
POST /fleet/trips/
POST /fleet/trips/cancel_trips/
GET /fleet/trips/dashboard_stats/
DELETE /fleet/trips/{{trip_id}}/
GET /fleet/trips/{{trip_id}}/
PATCH /fleet/trips/{{trip_id}}/
POST /fleet/trips/{{trip_id}}/cancel/
POST /fleet/trips/{{trip_id}}/command/
POST /fleet/trips/{{trip_id}}/end/
POST /fleet/trips/{{trip_id}}/start/

### Telemetry
GET /fleet/obd-telemetry/
GET /fleet/obd-telemetry/{{obd_telemetry_id}}/
GET /fleet/vehicles/{{vehicle_id}}/telemetry_data/
GET /fleet/history/vehicle/{{vehicle_id}}/

### Alerts
GET /fleet/alerts/
GET /fleet/alerts/dashboard_stats/
POST /fleet/alerts/mark_read/
POST /fleet/alerts/resolve_alert/
GET /fleet/alerts/trends/
DELETE /fleet/alerts/{{alert_id}}/
GET /fleet/alerts/{{alert_id}}/
PATCH /fleet/alerts/{{alert_id}}/
PATCH /fleet/alerts/{{alert_id}}/acknowledge/
PATCH /fleet/alerts/{{alert_id}}/ignore/
PATCH /fleet/alerts/{{alert_id}}/resolve/

### Alert Rules
GET /fleet/alert-rules/
POST /fleet/alert-rules/
DELETE /fleet/alert-rules/{{rule_id}}/
GET /fleet/alert-rules/{{rule_id}}/
PATCH /fleet/alert-rules/{{rule_id}}/

### OBD Devices
GET /fleet/obd-devices/
POST /fleet/obd-devices/
GET /fleet/obd-devices/distinct-values/
GET /fleet/obd-devices/{{obd_device_id}}/
PATCH /fleet/obd-devices/{{obd_device_id}}/
POST /fleet/obd-devices/{{obd_device_id}}/update-communication/

### SIM Cards
GET /fleet/sim-cards/
POST /fleet/sim-cards/
GET /fleet/sim-cards/summary/
DELETE /fleet/sim-cards/{{sim_id}}/
GET /fleet/sim-cards/{{sim_id}}/
PATCH /fleet/sim-cards/{{sim_id}}/
POST /fleet/sim-cards/{{sim_id}}/activate/
POST /fleet/sim-cards/{{sim_id}}/deactivate/
POST /fleet/sim-cards/{{sim_id}}/suspend/
POST /fleet/sim-cards/{{sim_id}}/update-usage/

### Maintenance Records
GET /fleet/maintenance-records/
POST /fleet/maintenance-records/
GET /fleet/maintenance-records/history/
GET /fleet/maintenance-records/overview_metrics/
GET /fleet/maintenance-records/upcoming/
DELETE /fleet/maintenance-records/{{record_id}}/
GET /fleet/maintenance-records/{{record_id}}/
PATCH /fleet/maintenance-records/{{record_id}}/
POST /fleet/maintenance-records/{{record_id}}/cancel/
POST /fleet/maintenance-records/{{record_id}}/complete/
POST /fleet/maintenance-records/{{record_id}}/reschedule/
POST /fleet/maintenance-records/{{record_id}}/schedule/
POST /fleet/maintenance-records/{{record_id}}/start/
GET /fleet/maintenance-records/{{record_id}}/work_order_pdf/

### Scheduled Maintenance
GET /fleet/scheduled-maintenance/
POST /fleet/scheduled-maintenance/
GET /fleet/scheduled-maintenance/dashboard_stats/
POST /fleet/scheduled-maintenance/mark_service_done/

### Insurance Policies
GET /fleet/insurance-policies/
POST /fleet/insurance-policies/
DELETE /fleet/insurance-policies/{{policy_id}}/
GET /fleet/insurance-policies/{{policy_id}}/
PATCH /fleet/insurance-policies/{{policy_id}}/

### Dashcams & Videos
GET /fleet/dashcams/
POST /fleet/dashcams/
GET /fleet/dashcams/dashboard_stats/
POST /fleet/dashcams/refresh_api_key/
DELETE /fleet/dashcams/{{dashcam_id}}/
GET /fleet/dashcams/{{dashcam_id}}/
PATCH /fleet/dashcams/{{dashcam_id}}/
POST /fleet/upload-video/
GET /fleet/video-segments/
GET /fleet/video-segments/{{segment_id}}/
GET /fleet/video-segments/{{segment_id}}/download/

### Firmware Updates
GET /fleet/firmware-updates/
POST /fleet/firmware-updates/
DELETE /fleet/firmware-updates/{{firmware_id}}/
GET /fleet/firmware-updates/{{firmware_id}}/
PATCH /fleet/firmware-updates/{{firmware_id}}/
POST /fleet/firmware-updates/{{firmware_id}}/pause/
POST /fleet/firmware-updates/{{firmware_id}}/resume/
GET /fleet/firmware-updates/{{firmware_id}}/summary/

### Fleet Settings
GET /fleet/fleet-settings/
PUT /fleet/fleet-settings/

### Users & Permissions
GET /users/groups/
POST /users/groups/
DELETE /users/groups/{{group_id}}/
PATCH /users/groups/{{group_id}}/
POST /users/groups/{{group_id}}/app-permissions/
GET /users/groups/{{group_id}}/permissions/
POST /users/groups/{{group_id}}/permissions/
GET /users/groups/{{group_id}}/users/
POST /users/groups/{{group_id}}/users/
GET /users/has-permission/app.codename/
GET /users/my-permissions/
GET /users/permissions/
GET /users/users/
POST /users/users/
GET /users/users/me/
DELETE /users/users/{{user_id}}/
GET /users/users/{{user_id}}/
PATCH /users/users/{{user_id}}/
GET /users/users/{{user_id}}/permissions/
POST /users/users/{{user_id}}/permissions/

### Auth & Profile
POST /users/login_with_password/
POST /users/refresh_token/
POST /users/send_otp/
POST /users/update_email/
POST /users/update_phone/
GET /users/user_profile/
PUT /users/user_profile/
GET /users/notification-preferences/
PUT /users/notification-preferences/
POST /users/verify_otp/
POST /users/verify_otp_update/
POST /users/verify_update/
