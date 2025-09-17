# Trips

Base endpoints:
- List: `GET /api/fleet/trips/`
- Create: `POST /api/fleet/trips/`
- Detail: `GET /api/fleet/trips/{id}/`
- Update: `PUT/PATCH /api/fleet/trips/{id}/`
- Delete: `DELETE /api/fleet/trips/{id}/`

Custom actions:
- Start: `POST /api/fleet/trips/{id}/start/`  
  Body: `{ "start_latitude": <float>, "start_longitude": <float> }` (optional)
- End: `POST /api/fleet/trips/{id}/end/`  
  Body: `{ "end_latitude": <float>, "end_longitude": <float>, "distance_travelled_km": <float> }` (optional)
- Cancel: `POST /api/fleet/trips/{id}/cancel/`  
  Body: `{ "reason": "..." }` (optional)
- Vehicle command: `POST /api/fleet/trips/{id}/command/`  
  Sends commands to the vehicle via backend services (lock/unlock/start_engine/stop_engine)
- Bulk cancel: `POST /api/fleet/trips/cancel_trips/`  
  Body: `{ "selected_records": [ids...] }`
- Dashboard stats: `GET /api/fleet/trips/dashboard_stats/`

Permissions
- Read/Write: `IsAuthenticated`. Non-admins are scoped to their `profile.fleet_operator` for list/detail.

List filters (query params)
- `status`: `scheduled|in_progress|completed|cancelled`
- `vehicle`: `<id>`
- `driver`: `<id>`
- `trip_id`: exact match via `?trip_id=...`

Fields (API accurate)
- Read-only: `id`, `created_at`, `actual_start_time`, `actual_end_time`, `distance_travelled_km`, `driver_distance_km`, `obd_distance_km`, `actual_cost`, `status`, `live_driver_coordinate`, `live_driver_coordinate_updated_at`, `live_obd_coordinate`, `live_obd_coordinate_updated_at`
- Writable: `trip_id`, `driver`, `vehicle`, `assignment` (optional), `scheduled_start_time`, `scheduled_end_time`, `start_coordinate` (GeoJSON), `end_coordinate` (GeoJSON), `estimated_cost`

Notes
- `trip_id` must be unique. On conflict, create returns HTTP 409 with `existing_trip_id`.
- GeoJSON points: `{ "type": "Point", "coordinates": [lng, lat] }` for `start_coordinate` and `end_coordinate`.
- Status transitions happen via actions (`start`, `end`, `cancel`).

## Create/Update — Request Bodies (backend‑accurate)

Create (all supported writeable fields)

Notes
- Do not send read‑only fields.
- Coordinates are optional; `start`/`end` actions can set live points.

```
{
  "trip_id": "T-2025-0098",
  "driver": 12,
  "vehicle": 34,
  "assignment": null,
  "scheduled_start_time": "2025-09-20T09:30:00Z",
  "scheduled_end_time": "2025-09-20T12:00:00Z",
  "start_coordinate": { "type": "Point", "coordinates": [78.47258, 17.40406] },
  "end_coordinate": { "type": "Point", "coordinates": [78.50111, 17.39910] },
  "estimated_cost": 250.00
}
```

Field reference (writeable)
- Trip: `trip_id`, `driver`, `vehicle`, `assignment`, `scheduled_start_time`, `scheduled_end_time`, `start_coordinate`, `end_coordinate`, `estimated_cost`

### Dropdowns (simple)

- `driver` options → `GET /api/fleet/drivers/`
  - Admins: see all. Others: scoped to their operator.
  - Use `id` as value; show full name and phone.
- `vehicle` options → `GET /api/fleet/vehicles/`
  - Admins: see all. Others: scoped to their operator.
  - Use `id` as value; show plate and make/model.

## Trip Detail — Field Map (API accurate)

- Core: `id`, `trip_id`, `driver`, `vehicle`, `assignment`, `scheduled_start_time`, `scheduled_end_time`, `actual_start_time`, `actual_end_time`, `distance_travelled_km`, `driver_distance_km`, `obd_distance_km`, `estimated_cost`, `actual_cost`, `status`, `created_at`, `start_coordinate`, `end_coordinate`, `live_driver_coordinate`, `live_driver_coordinate_updated_at`, `live_obd_coordinate`, `live_obd_coordinate_updated_at`

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Trips]
               │
               ▼
        Trips — List → [+ Create]
               │            │
               │            ▼
               │     Create Trip — Form  → [Save]
               │            │
               │            ▼
               └────→ Trip — Detail → [Start]
                               │
                               ▼
                        Trip — In Progress (Live)
                               │
                               ▼
                          [End Trip] → End Trip — Modal → Completed
```

Create Trip — Form (all fields)

- `trip_id` (text; unique)
- `driver` (select by id; `GET /api/fleet/drivers/`)
- `vehicle` (select by id; `GET /api/fleet/vehicles/`)
- `assignment` (optional, id; advanced — keep null unless you manage assignments)
- `scheduled_start_time` (datetime)
- `scheduled_end_time` (datetime)
- `start_coordinate` (optional GeoJSON Point)
- `end_coordinate` (optional GeoJSON Point)
- `estimated_cost` (number)

Notes
- After saving, redirect to Trip — Detail to start the trip.
- GeoJSON example: `{ "type": "Point", "coordinates": [lng, lat] }`.

Example create request (JSON)

```
{
  "trip_id": "T-2025-0098",
  "driver": 12,
  "vehicle": 34,
  "assignment": null,
  "scheduled_start_time": "2025-09-20T09:30:00Z",
  "scheduled_end_time": "2025-09-20T12:00:00Z",
  "start_coordinate": { "type": "Point", "coordinates": [78.47258, 17.40406] },
  "end_coordinate": { "type": "Point", "coordinates": [78.50111, 17.39910] },
  "estimated_cost": 250.00
}
```

Trips — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Trips                                          [+ Create] [Bulk ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/trips/dashboard_stats/)                           │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Total Trips    │ │ In Progress    │ │ Completed      │ │ Cancelled      │ │
│ │ [total_trips]  │ │ [in_prog]      │ │ [completed]    │ │ [cancelled]    │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Status] [Vehicle] [Driver] [Trip ID]                  (Apply)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Trip ID     Vehicle        Driver            Start → End           Status    │
│ T-2025-98   EV-9012        S. Rao            09:30 → 12:00         scheduled │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Cancel Selected]                                 Page 1/2     │
└─────────────────────────────────────────────────────────────────────────────┘

KPI call → GET /api/fleet/trips/dashboard_stats/
List call → GET /api/fleet/trips/?status=&vehicle=&driver=&trip_id=
```

Trip — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Trip — Detail                        [Start] [End] [Cancel] [Command] │
│ Trip: T-2025-0098  Vehicle: EV-9012  Driver: S. Rao  Status: in_progress      │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Driver Dist (km)│ │ OBD Dist (km)  │ │ Est. Cost      │ │ Actual Cost    │ │
│ │ [12.4]         │ │ [12.7]         │ │ [250.00]       │ │ [248.75]       │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Info (Left)                                    │ Live & Actions (Right)      │
│ • trip_id                                      │ • Status                     │
│ • driver  [View Driver]                        │ • [Start] [End] [Cancel]     │
│ • vehicle [View Vehicle]                       │ • [Send Command]             │
│ • assignment (if any)                          │ • live_driver_coordinate      │
│ • scheduled_start_time / scheduled_end_time    │   updated_at                  │
│ • actual_start_time   / actual_end_time        │ • live_obd_coordinate         │
│ • start_coordinate / end_coordinate            │   updated_at                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

Start Trip — Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Start Trip                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Optional location:                                                           │
│ • start_latitude                                                             │
│ • start_longitude                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
[Start]

POST /api/fleet/trips/{id}/start/  → { start_latitude?, start_longitude? }
```

Trip — In Progress (Live)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Trip — In Progress                         [End Trip] [Command]      │
├─────────────────────────────────────────────────────────────────────────────┤
│ LIVE SNAPSHOT (latest OBD telemetry for this trip)                           │
│  • Speed (kph) • Battery % • Range (km) • Motor Temp • Voltage               │
│  Data source: GET /api/fleet/obd-telemetry/?trip={id} (poll)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ CHARTS (optional)                                                             │
│  • Averages → GET …/obd-telemetry/?trip={id}&aggregated=true                 │
│  • Top Error Codes → GET …/obd-telemetry/?trip={id}&top_errors=true&limit=10 │
├─────────────────────────────────────────────────────────────────────────────┤
│ PANELS                                                                        │
│  • Driver Logs → GET /api/fleet/driver-logs/?trip={id}                        │
│  • Connection Status (from vehicle OBD last_communication_at)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

End Trip — Modal (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ End Trip                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Optional location + distance:                                                │
│ • end_latitude                                                               │
│ • end_longitude                                                              │
│ • distance_travelled_km                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
[End Trip]

POST /api/fleet/trips/{id}/end/ → { end_latitude?, end_longitude?, distance_travelled_km? }

After success: show Completed summary with times, distances, costs.
```

Cancel Trip — Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Cancel Trip                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Reason (optional):                                                           │
│ • reason                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
[Cancel Trip]

POST /api/fleet/trips/{id}/cancel/ → { reason? }
```

Vehicle Command — Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Vehicle Command                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Command: [lock | unlock | start_engine | stop_engine]                        │
│ Extra params (optional key/value pairs)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
[Send]

POST /api/fleet/trips/{id}/command/ → { "command": "lock", ...extra }
Response: command execution status (backend VehicleService)
```

Bulk Cancel — Confirm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Cancel Selected Trips                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ You are about to cancel N selected trips. Continue?                           │
└─────────────────────────────────────────────────────────────────────────────┘
[Cancel Selected]

POST /api/fleet/trips/cancel_trips/ → { "selected_records": [ids...] }
Returns: { message, canceled_count }
```

Trip — Completed Summary (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Trip — Completed                                   [Back to Trips]  │
│ Trip: T-2025-0098  Vehicle: EV-9012  Driver: S. Rao  Status: completed      │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Driver Dist (km)│ │ OBD Dist (km)  │ │ Est. Cost      │ │ Actual Cost    │ │
│ │ [driver_km]    │ │ [obd_km]       │ │ [est_cost]     │ │ [actual_cost?] │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                                       │
│ • Scheduled: start → end                                                       │
│ • Actual:    start → end                                                       │
│ • Distance: driver / OBD / reported total                                      │
│ • Start/End Locations (GeoJSON → map pins)                                     │
│ • Notes: show cancellation reason if status=cancelled                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ DATA PANELS                                                                    │
│ • Telemetry recap (aggregated) → GET /api/fleet/obd-telemetry/?trip={id}&aggregated=true │
│ • Top Error Codes → GET …/obd-telemetry/?trip={id}&top_errors=true&limit=10              │
│ • Driver Logs (timeline) → GET /api/fleet/driver-logs/?trip={id}                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

Notes
- `actual_cost` may be null unless computed elsewhere. Display `estimated_cost` always; show `actual_cost` only when present.
- If trip was cancelled, status is `cancelled`, `actual_end_time` is set, and End location may show cancellation point if provided.

## Data Calls

- List: `GET /api/fleet/trips/`
- Detail: `GET /api/fleet/trips/{id}/`
- Start/End/Cancel: `POST /api/fleet/trips/{id}/(start|end|cancel)/`
- Commands: `POST /api/fleet/trips/{id}/command/`  → status object
- Bulk cancel: `POST /api/fleet/trips/cancel_trips/`  → `{ message, canceled_count }`
- Telemetry for trip: `GET /api/fleet/obd-telemetry/?trip={id}`  
  - Aggregated averages: `GET /api/fleet/obd-telemetry/?trip={id}&aggregated=true`
  - Top error codes: `GET /api/fleet/obd-telemetry/?trip={id}&top_errors=true&limit=10`
- Driver logs for trip: `GET /api/fleet/driver-logs/?trip={id}`

Live telemetry notes (backend-accurate)
- Vehicle sends telemetry via WebSocket `ws/vehicle/{vin}/` to the backend. Admin UI should poll REST (above) to render live data.
- Online status can be inferred from the vehicle’s OBD device `last_communication_at` (see Vehicles guide). Poll `GET /api/fleet/vehicles/{vehicle_id}/` or fetch OBD device detail.

## Code References

- Routes: `fleet/urls.py` → `trips`
- Views: `TripViewSet` (CRUD, start/end/cancel, command, bulk cancel, dashboard_stats)
- Serializer: `TripSerializer`, `TripStartSerializer`, `TripEndSerializer`, `TripCancelSerializer`
