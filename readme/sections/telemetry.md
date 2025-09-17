# Telemetry

Base endpoints:
- List (records): `GET /api/fleet/obd-telemetry/`
- Detail: `GET /api/fleet/obd-telemetry/{id}/`

Custom list modes (query params):
- `aggregated=true` → `{ record_count, vehicle_count, error_record_count, averages: { speed_kph, battery_percent, motor_temp_c, tire_pressure_kpa, range_km } }`
- `top_errors=true&limit=10` → `{ top_error_codes: [{ code, count }], total_error_types, vehicles_with_errors }`

Permissions
- Read/Write: `IsAuthenticated`. Non-admins are scoped to their `profile.fleet_operator` via trip→driver→operator.

List filters (query params)
- Time: `timestamp_after`, `timestamp_before` (ISO datetime)
- Trip: `trip=<id>`, `trip_id=<string>`
- Vehicle: `vehicle=<id>`, `vehicle_vin=<vin>`
- Value ranges: `min_speed`, `max_speed`, `min_battery`, `max_battery`, `min_motor_temp`, `max_motor_temp`, `min_range`, `max_range`
- `has_error_codes=true`

Fields (API accurate)
- Core: `id`, `trip`, `timestamp`, `coordinates` (GeoJSON), `latitude`, `longitude`
- Metrics: `speed_kph`, `battery_level_percent`, `motor_temp_c`, `battery_voltage`, `odometer_km`, `error_codes`
- Extended: `charge_limit_percent`, `battery_power_kw`, `tire_pressure_kpa`, `torque_nm`, `range_km`
- Derived: `vehicle_id`, `device_id`

Related vehicle endpoints
- Recent 20 points: `GET /api/fleet/vehicles/{id}/telemetry_data/`
- Trends (history): `GET /api/fleet/history/vehicle/{id}/?date_range=30days` with optional `include_details`, `include_raw`, `visualization`/`category`, `max_points`

## UI — Forms and Layout

Entry points & routing

- Side Nav → opens Telemetry — Explorer (no filters applied).
- Vehicle — Detail → click [Telemetry] → Telemetry — Explorer filtered by `?vehicle={vehicle_id}`.
- Telemetry — Explorer → row [View] → Telemetry — Detail (#telemetry_record_id).

Filter scope

- When arriving with `?vehicle={vehicle_id}`, all sections on Explorer use that vehicle filter:
  - KPI cards call `GET /api/fleet/obd-telemetry/?aggregated=true&vehicle={vehicle_id}`.
  - Table applies `vehicle={vehicle_id}` in its list request.
  - Insights Panel (Top Errors) calls `…/obd-telemetry/?top_errors=true&vehicle={vehicle_id}&limit=10`.
  - Vehicle Snapshot uses `GET /api/fleet/vehicles/{vehicle_id}/telemetry_data/`.
- Keep the vehicle filter in the URL (query param) when navigating between Telemetry pages to persist scope.

High‑Level Flow

```
Side Nav → [Telemetry]
               │
               ▼
        Telemetry — Explorer
               │
               ├─ Row: [View Detail] → Telemetry — Detail (#id)
               │
               └─ [Vehicle Snapshot] (when vehicle selected) → recent 20‑point charts
```

Telemetry — Explorer (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Telemetry — Explorer                                 [Insights]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/obd-telemetry/?aggregated=true&…filters…)          │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Records        │ │ Vehicles       │ │ Error Records  │ │ Avg Speed (kph)│ │
│ │ [record_count] │ │ [vehicle_count]│ │ [error_record] │ │ [speed_kph]    │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│ ┌─────────────────────────┐ ┌────────────────────────┐  ┌─────────────────┐ │
│ │ Avg Battery (%)         │ │ Avg Motor Temp (C)     │  │ Avg Range (km)  │ │
│ │ [battery_percent]       │ │ [motor_temp_c]         │  │ [range_km]      │ │
│ └─────────────────────────┘ └────────────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Time: after|before] [Vehicle|VIN] [Trip|Trip ID]                  │
│          [Min/Max: Speed|Battery|Temp|Range] [Has Error Codes]   (Apply)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE (paged + virtualized)                                                 │
│ Time        Vehicle   Speed  Battery%  Temp C  Range km  Errors    Actions   │
│ 10:01:02    EV-123…   58     76        36      372       P0A1,U012 [View]   │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW ACTIONS: [View Detail]                                                   │
│ EXTRA: [Vehicle Snapshot] (enabled when a vehicle is selected)               │
│        Opens recent 20‑point snapshot (speed/battery/coords).                │
│        API: GET /api/fleet/vehicles/{vehicle_id}/telemetry_data/             │
├─────────────────────────────────────────────────────────────────────────────┤
│ INSIGHTS PANEL                                                               │
│  • Aggregated → GET …/obd-telemetry/?aggregated=true&…filters…               │
│    – Averages: speed | battery | temp | range; Counts: records|vehicles|errors│
│  • Top Errors → GET …/obd-telemetry/?top_errors=true&limit=10&…filters…      │
├─────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Page 1/5                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


Live Telemetry notes
- Vehicles stream telemetry to `ws/vehicle/{vin}/` (device→server). The server updates DB/Redis and does not broadcast to dashboards.
- Admin UI should poll REST for live views: vehicle detail (`latest_obd`), `vehicles/{id}/telemetry_data`, and fleet insights (`obd-telemetry/?aggregated=true`).

Navigation summary
- From Telemetry — Explorer:
  - Click [View Detail] on a row → opens Telemetry — Detail (#id).
  - Click [Vehicle Snapshot] (with a vehicle selected) → shows recent 20‑point charts via `GET /api/fleet/vehicles/{id}/telemetry_data/` (in page or modal).
  - Toggle the Insights Panel to show Aggregated KPIs and Top Error Codes using the same filters.

Telemetry — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Telemetry — Detail (#id)                           [Back to List]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌─────────────────────┐ ┌────────────────────┐ ┌────────┐ │
│ │ Speed (kph)    │ │ Battery Level (%)   │ │ Motor Temp (°C)     │ │ Range │ │
│ │ [speed_kph]    │ │ [battery_level_%]   │ │ [motor_temp_c]      │ │ [km]  │ │
│ └────────────────┘ └─────────────────────┘ └────────────────────┘ └────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ ACTIONS: [Open Vehicle] [Open Trip]                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ LOCATION                                                                      │
│ • Map (if coordinates)  • latitude / longitude                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                    │
│ Metrics (Left)                                  │ Context (Right)             │
│ • speed_kph                                     │ • trip (id)                 │
│ • battery_level_percent                         │ • vehicle_id (derived)      │
│ • motor_temp_c                                  │ • device_id (derived)       │
│ • battery_voltage                                │                             │
│ • odometer_km                                   │                             │
│ • range_km                                      │                             │
│ • battery_power_kw                               │                             │
│ • tire_pressure_kpa                             │                             │
│ • torque_nm                                     │                             │
│ • charge_limit_percent                           │                             │
│ • error_codes                                   │                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Telemetry Detail — Field Map (API accurate)

- Core: `id`, `trip`, `timestamp`, `coordinates` (GeoJSON), `latitude`, `longitude`
- Metrics: `speed_kph`, `battery_level_percent`, `motor_temp_c`, `battery_voltage`, `odometer_km`, `range_km`, `battery_power_kw`, `tire_pressure_kpa`, `torque_nm`, `charge_limit_percent`, `error_codes`
- Derived: `vehicle_id`, `device_id`
- Notes: `coordinates` may be null; fall back to showing lat/lng if available.

## Large Data UX — Recommended Patterns

- Default time window: load the last 1–24 hours by default to keep result sets small; show empty‑state helper to widen the window.
- Server‑side filtering first: always apply Time + Vehicle/Trip filters before loading table/insights to reduce payload size.
- Virtualized table: render only visible rows; use incremental pagination (e.g., 200 rows/page) with infinite scroll and prefetch.
- Live polling with throttling: refresh every 10–15s; avoid reloading when filters or pagination cursors change mid‑poll.
- Insights panel in list: call `aggregated=true` and `top_errors=true` with the same filters; show/hide with a toggle.
- Column chooser: let users hide/reshuffle columns; persist preference per user.
- Pin metrics: surface a compact mini‑header (Speed, Battery %, Range) per vehicle when a vehicle filter is set.
- Export: offer CSV export for the current filtered window; guard large exports (show a tip to narrow time/vehicle).
- Record view: open row in a modal (optional) or navigate to Telemetry — Detail; keep list context and pagination state.
- Time bucketing (optional): add client‑side buckets (e.g., 1‑min, 5‑min) by sampling or binning to visualize trends fast.

## Data Calls

- List: `GET /api/fleet/obd-telemetry/` with filters
- Aggregated: `GET /api/fleet/obd-telemetry/?aggregated=true` (same filters apply)
- Top errors: `GET /api/fleet/obd-telemetry/?top_errors=true&limit=10` (same filters)
- Vehicle recent: `GET /api/fleet/vehicles/{id}/telemetry_data/`
- Vehicle history: `GET /api/fleet/history/vehicle/{id}/?date_range=30days` (+ options)

## Code References

- Routes: `fleet/urls.py` → `obd-telemetry`
- Views: `OBDTelemetryViewSet` (filters, aggregated/top_errors)
- Serializer: `OBDTelemetrySerializer`
- Models: `OBDTelemetry` (trip-linked), related `Trip`, `Vehicle`
