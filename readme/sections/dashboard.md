# Fleet Admin Home Dashboard — Figma Prompt

Copy-paste this prompt into your design tool (e.g., Figma, Galileo AI, v0, Framer) to generate a high-fidelity Fleet Admin Home Dashboard. It follows the backend-authored wireframe and API fields documented in `sections/dashboard.md`.

---

Prompt Title:
“Design a modern Fleet Admin Home Dashboard UI (Web) based on the following wireframe layout and API-driven data flow.”

Prompt Body:
Create a high-fidelity Figma-style UI layout for a Fleet Admin Dashboard (Web App) that visualizes real-time telemetry, trip statuses, alert metrics, and vehicle data.

Use a 3-column grid layout with clean cards, pie charts, map widgets, and WebSocket-based real-time updates. Use dashboards like Fleetio or Samsara as visual references.

Follow this section-wise layout extracted from a backend-authored ASCII flow:

—

Header
- Title: “Fleet Admin”
- Dropdown: Tenant Selector (e.g., “Acme Logistics ▾”)
- User Menu (top-right): avatar + name
- Date Range Filters: Today, 10d, 30d, 90d, and a custom calendar input (from–to)

KPI Strip (Horizontal Cards)
- Total Vehicles → API: `total_vehicles` (e.g., 128)
- Online Vehicles → `online_vehicles` (e.g., 114)
- Active Trips → `total_active_trips` (e.g., 27)
- Critical Alerts → `critical_alerts` (e.g., 3)
- Open Maintenance → `open_maintenance` (e.g., 6)
- Avg Battery % → `average_battery_level` (e.g., 78%)
- Total Distance (km) → `total_distance_travelled_km` (e.g., 154,230)

Status & Energy Panel (Two-Column)
- Left: Vehicle Status Pie Chart — categories: `available`, `in_use`, `maintenance` (example: 62 / 48 / 18)
- Right: Energy KPIs — “Total Energy (kWh)” and “Avg Efficiency (km/kWh)”
  - Example: Total 6,240 kWh, Avg 6.3 km/kWh

OBD Metrics Snapshot (Mini Grid Cards)
- Avg Speed (kph) — e.g., 54.2
- Avg Motor Temp (°C) — e.g., 76.8
- Avg Range (km) — e.g., 312
- Avg Battery Voltage (V) — e.g., 48.7
- Avg Tire Pressure (kPa) — e.g., 225
- Vehicles with Errors — e.g., 7 (use a small red badge)

Diagnostics (Donuts & Badges)
- Device Health donut: `critical | warning | normal` (e.g., 2 | 5 | 121)
- SIM Card Usage donut: `high_usage | inactive` (e.g., 9 | 3)
- Battery Health: “Low level” badge when threshold breached (e.g., 11 vehicles < 20%)

Most Active Vehicle (Card)
- Fields: `license_plate` (e.g., EV-9832), `total_distance_km` (e.g., 1,284 km last 7d), [View Vehicle] button

Vehicles on Map
- Pins showing `last_known_location` from vehicle API
- Clicking a pin opens vehicle detail overlay/card
- Toggle to overlay last 20 OBD points as a thin polyline per selected vehicle

Live Telemetry Charts
- Mini live graphs: Speed | Battery % | Range
- Powered by WebSocket: `ws/vehicle/{vin}`
- Show 30–60s sliding window, 1–2s tick cadence; draw a subtle zero-line and grid

Charts & Tables (Bottom Grid)
- Top Error Codes (Bar Chart)
- Active Trips Table: columns `trip_id`, `vehicle`, `driver`, `status`, `actual_start_time`
- Recent Alerts Table: columns `severity`, `title`, `vehicle`, `created_at`, `status`
- Distance/Speed Time Series Charts (Last 30 days): dual-axis or separate small multiples

Footer
- Text: “Last updated: now | Data source: Dashboard Summary + Telemetry/Trips/Alerts”

—

Visual & Layout Guidance
- Grid: 3-column responsive grid (base 12-col system). Card gutters 24px, section spacing 32px.
- Breakpoints: desktop ≥1280px (3-col), tablet 768–1279px (2-col), mobile <768px (1-col stacked). Keep KPI strip scrollable on mobile.
- Cards: use shadow-sm, 12–16px radius, 20–24px padding. Provide clear titles and small subtitles for API fields.
- Typography: clean sans-serif (e.g., Inter). Use 18–20px section headers, 12–14px metadata, 28–40px KPI numerals.
- Color: neutral background; use fleet accent for primary (e.g., indigo/blue). Severity colors: critical=red, warning=amber, normal=green, info=blue.
- Icons: simple outline icons for KPIs (vehicle, online, trip, alert, wrench, battery, distance). Use consistent icon size (16–20px).
- Interactions: hover states on cards; click-through on tables and map pins; gentle 200ms transitions.
- Empty/Loading/Error: skeleton loaders for charts/tables; empty copy with call-to-action; inline error banners and retry.

API & Data Wiring
- Primary: `GET /api/fleet/dashboard/summary/?date_range=today|10days|30days|90days` or `start_date`/`end_date`
- Use fields: `total_vehicles`, `online_vehicles`, `total_active_trips`, `critical_alerts`, `open_maintenance`, `average_battery_level`, `total_distance_travelled_km`, `vehicle_status_breakdown`, `obd_metrics`, `diagnostics`, `most_active_vehicle`
- Tables: Alerts → `GET /api/fleet/alerts/?status=active`, Trips → `GET /api/fleet/trips/?status=in_progress`
- WebSocket: `ws/vehicle/{vin}` → stream objects like `{ ts, speed_kph, soc_percent, est_range_km }`

Example Summary Payload (visualize with sample values)
```
{
  "total_vehicles": 128,
  "online_vehicles": 114,
  "total_active_trips": 27,
  "critical_alerts": 3,
  "open_maintenance": 6,
  "average_battery_level": 78.0,
  "total_distance_travelled_km": 154230,
  "vehicle_status_breakdown": { "available": 62, "in_use": 48, "maintenance": 18 },
  "obd_metrics": {
    "average_speed_kph": 54.2,
    "average_motor_temp_c": 76.8,
    "average_estimated_range_km": 312,
    "average_battery_voltage": 48.7,
    "average_tire_pressure_kpa": 225,
    "vehicles_reporting_errors": 7
  },
  "diagnostics": {
    "device_health": { "critical": 2, "warning": 5, "normal": 121, "total": 128 },
    "sim_cards": { "high_usage": 9, "inactive": 3, "total": 128 }
  },
  "most_active_vehicle": { "id": 42, "license_plate": "EV-9832", "total_distance_km": 1284.0 }
}
```

Component Structure (suggested)
- Header: `Header/TenantSelect`, `Header/DateRange`, `Header/UserMenu`
- KPIs: `KPI/Card` (optional tiny sparkline)
- Charts: `Chart/PieStatus`, `Chart/GaugeEnergy`, `Chart/BarTopErrors`, `Chart/LineTelemetryMini`
- Diagnostics: `Donut/DeviceHealth`, `Donut/SIMUsage`, `Badge/BatteryLow`
- Tables: `Table/ActiveTrips`, `Table/RecentAlerts`
- Map: `Map/Vehicles` with `Pin/Vehicle` and overlay toggle

Behavioral Notes
- Tenant selector and date range re-query the summary endpoint and refresh all child widgets.
- Live telemetry respects selected vehicle, unsubscribes on change, and buffers 60s of points.
- Tables paginate (25/50/100), sortable by severity/time; rows are clickable to detail pages.
- Map clusters pins at lower zoom; pin hover shows a mini tooltip card.

Accessibility
- Ensure text color contrast ≥ 4.5:1; focus rings on all interactive elements; provide aria labels for charts and map pins.

Deliverables
- One cohesive web dashboard artboard (1440×1024 base), plus compact tablet and mobile variants.
- Realistic numbers and statuses as above; no lorem for primary KPIs.

Reference
- Backend fields and wireframe: see `sections/dashboard.md` for ASCII flow, chart tags, and additional examples.

## ASCII Wireframes — Full Layout (3-Column Grid)

Use the following ASCII wireframes as a direct visual spec for layout, spacing, and component placement. Keep card paddings consistent and align to a 12‑column underlying grid (rendered here as 3 primary columns for clarity).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                       │
│  Fleet Admin            [Tenant ▾]      [Today | 10d | 30d | 90d | 📅 Custom]      [User ⧁]  │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP                                                                                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ Total Veh    │ │ Online Veh   │ │ Active Trips │ │ Critical Alr │ │ Open Maint   │          │
│ │     128      │ │     114      │ │      27      │ │       3      │ │       6      │          │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  ┌─────┐ │
│ ┌──────────────┐ ┌───────────────────────────┐                                          │Avg  │ │
│ │ Avg Battery% │ │ Total Distance (km)       │                                          │Batt%│ │
│ │     78%      │ │ 154,230                   │                                          │ 78% │ │
│ └──────────────┘ └───────────────────────────┘                                          └─────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW A — STATUS & ENERGY (Two-Column within 3-col canvas)                                     │
│ ┌───────────────────────────────┐         ┌───────────────────────────────────────────────┐   │
│ │ Vehicle Status [Pie]          │         │ Energy KPIs                                   │   │
│ │  available 62                 │         │  • Total Energy (kWh): 6,240                  │   │
│ │  in_use   48                  │         │  • Avg Efficiency (km/kWh): 6.3               │   │
│ │  maint    18                  │         │  [Gauge]     [Gauge]                          │   │
│ └───────────────────────────────┘         └───────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW B — OBD METRICS (Mini Grid Cards)                                                        │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│ │ Avg Speed     │ │ Avg Motor Temp│ │ Avg Range     │ │ Avg Voltage   │ │ Avg Tire kPa  │    │
│ │   54.2 kph    │ │   76.8 °C     │ │   312 km      │ │   48.7 V      │ │   225 kPa     │    │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘    │
│ ┌──────────────────────┐                                                                        │
│ │ Vehicles with Errors 7 │  Note: red badge = errors                                           │
│ └──────────────────────┘                                                                        │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW C — DIAGNOSTICS                                                                            │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐                     │
│ │ Device Health [Donut]│ │ SIM Usage [Donut]    │ │ Battery Health [Badge]│                    │
│ │ crit 2 warn 5 ok 121 │ │ high 9  inactive 3   │ │ Low level: 11 vehicles │                    │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘                     │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ MOST ACTIVE VEHICLE                                                                            │
│ ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ EV-9832 — Distance: 1,284 km (last 7d)                      [View Vehicle ▸]             │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ VEHICLES ON MAP                                                                                │
│ ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │   ◉    ◉      ◉  ◉        ◉     (pins, clusters; click → Vehicle Detail overlay)        │ │
│ │ Note: overlay last 20 OBD points (polyline)                                               │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ LIVE TELEMETRY (WebSocket)                                                                     │
│ [Select Vehicle ▾ VIN-123]  Mini charts →  Speed | Battery % | Range  (Note: Live window 60s | Update 2s) │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                                       │
│ │ ▂▃▅▆▇▆▅▃▂     │  │ ▂▄▆█▆▄▂       │  │ ▃▅▇█▇▅▃       │  Note: Live window 60s | Update 2s   │
│ └───────────────┘  └───────────────┘  └───────────────┘                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ BOTTOM GRID — CHARTS & TABLES                                                                  │
│ ┌──────────────────────┬─────────────────────────────────┬──────────────────────────────────┐ │
│ │ Top Error Codes [Bar]│ Recent Alerts [Table]           │ Active Trips [Table]             │ │
│ │ ▇▇▅▆▃                │ Sev  Title           Vehicle  T │ Trip  Vehicle  Driver  Status  T │ │
│ │ ▃▆█▅▂                │ H    Overheat        EV-981  2 │ #875  EV-113   J.Doe  InProg  9 │ │
│ │ ▂▃▅▇▆                │ M    Brake press     EV-402  5 │ #876  EV-221   A.Li   InProg  9 │ │
│ └──────────────────────┴─────────────────────────────────┴──────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Last updated: now | Data source: Dashboard Summary + Telemetry/Trips/Alerts            │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Gallery (ASCII)

KPI Card
```
┌──────────────┐
│ Title        │  ← small label
│    1,284     │  ← large numeral
│ ▲ +12% vs 7d │  ← tiny trend (optional)
└──────────────┘
```

Donut/Pie Placeholder
```
   ▓▓▓▓▓      legend: critical (red), warning (amber), normal (green)
 ▓▓    ▓▓
 ▓  ██  ▓   ← fill proportion roughly to counts
 ▓▓    ▓▓
   ▓▓▓▓▓
```

Gauge Placeholder
```
┌──────────────┐
│ Total kWh    │
│ [██████▁▁▁ ] │  ← 0–100% indicator
│   6,240      │
└──────────────┘
```

Mini Line (Sparkline)
```
▁▂▃▄▅▆▇█▇▆▅▄▃▁
```

Table Row (Compact)
```
Sev  Title                 Vehicle   Created           Status
H    Overheat Detected     EV-981    2025-09-14 10:12  Active
```

Map Pin Cluster (symbolic)
```
◉  main pin     • small pin     ◎ cluster (count)
```

## ASCII Flowchart — Data & Events

The following diagram illustrates client interactions, data sources, and update flow between UI components and APIs/WebSockets.

```
                        ┌─────────────────────────┐
                        │   Tenant + Date Range   │
                        │   (Header Controls)     │
                        └────────────┬────────────┘
                                     │ re-query
                                     ▼
      ┌────────────────────────────────────────────────────────────────┐
      │        GET /api/fleet/dashboard/summary/ (with filters)        │
      └────────────┬───────────────────────┬───────────────────────────┘
                   │                       │
                   │                       │
                   ▼                       ▼
        KPIs, Status Pie           OBD Metrics, Diagnostics
                   │                       │
                   └──────────────┬────────┘
                                  │
                                  ▼
                         Most Active Vehicle

                                  │
                                  │ select vehicle
                                  ▼
                         ws/vehicle/{vin} (WebSocket)
                                  │
                                  ▼
                     Live Mini Charts: Speed | SoC | Range

                                  │
                 ┌────────────────┴──────────────────┐
                 │                                   │
                 ▼                                   ▼
     GET /api/fleet/alerts/?status=active   GET /api/fleet/trips/?status=in_progress
                 │                                   │
                 ▼                                   ▼
          Recent Alerts Table                 Active Trips Table

                                  │
                                  ▼
                           Vehicles on Map
                 (pins from vehicles in summary payload)
```

### Legend
- [KPI]: numeric tile with optional sparkline
- [Pie]/[Donut]: distribution charts
- [Gauge]: progress meter for energy KPIs
- [Table]: row-based data views with sorting/pagination
- WebSocket: updates every 1–2s; buffer ~60s of points

 

## API Map by Section (Developers)

- Header Controls:
  - Purpose: Set global filters; re-fetch all widgets.
  - Calls: Re-run Summary, Alerts, Trips, Map, and Top Errors with same time range.
  - Params: `date_range=today|10days|30days|90days` or `start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`.

- KPI Strip (Top):
  - API: `GET /api/fleet/dashboard/summary/?{date filters}`
  - Fields: `total_vehicles`, `online_vehicles`, `total_active_trips`, `critical_alerts`, `open_maintenance`, `average_battery_level`, `total_distance_travelled_km`.

- Vehicle Status Pie:
  - API: `GET /api/fleet/dashboard/summary/?{date filters}`
  - Fields: `vehicle_status_breakdown.available`, `.in_use`, `.maintenance`.

- Energy KPIs (kWh, km/kWh):
  - API: `GET /api/fleet/dashboard/summary/?{date filters}`
  - Fields: `energy_metrics.total_energy_consumed_kwh`, `energy_metrics.average_efficiency_km_per_kwh`.
  - Note: If `energy_metrics` not present, hide gauges or source from vehicles/performance pages later.

- OBD Metrics Snapshot:
  - API: `GET /api/fleet/dashboard/summary/?{date filters}`
  - Fields: `obd_metrics.average_speed_kph`, `.average_motor_temp_c`, `.average_estimated_range_km`, `.average_battery_voltage`, `.average_tire_pressure_kpa`, `.vehicles_reporting_errors`.

- Diagnostics (Device/SIM/Battery):
  - API: `GET /api/fleet/dashboard/summary/?{date filters}`
  - Fields: `diagnostics.device_health.critical|warning|normal`, `diagnostics.sim_cards.high_usage|inactive`.
  - Optional: `diagnostics.battery_low_count` (if provided). If absent, omit Badge or compute separately.

- Most Active Vehicle:
  - API: `GET /api/fleet/dashboard/summary/?{date filters}`
  - Fields: `most_active_vehicle.id`, `.license_plate`, `.total_distance_km`.

- Vehicles on Map (pins):
  - Primary: `GET /api/fleet/vehicles/dashboard_stats/?{date filters}` (if implemented).
  - Fallback: `GET /api/fleet/vehicles/?fields=id,license_plate,vin,last_known_location,online_status&limit=500`.
  - Fields: `last_known_location` (GeoJSON) or `latitude`/`longitude`.

- Live Telemetry (mini charts):
  - WebSocket: `ws/vehicle/{vin}` streaming `{ ts, speed_kph, soc_percent, est_range_km }`.
  - Seed (optional): `GET /api/fleet/vehicles/{id}/telemetry_data/` (recent ~20 points).
  - Note: Live window 60s | Update 2s; unsubscribe on vehicle change.

- Top Error Codes (bar):
  - API: `GET /api/fleet/obd-telemetry/?top_errors=true&limit=10&{date filters}`
  - Optional filters: `vehicle={id}` or `vehicle_vin={vin}` to scope per selection.
  - Fields: `top_error_codes[]: { code, count }`, `vehicles_with_errors` (optional).

- Recent Alerts (table):
  - API: `GET /api/fleet/alerts/?status=active&{date filters}`
  - Client-side sort: by `created_at` if server ordering not exposed.
  - Columns: `severity`, `title`, `vehicle`, `created_at`, `status`.

- Active Trips (table):
  - API: `GET /api/fleet/trips/?status=in_progress&{date filters}`
  - Columns: `trip_id`, `vehicle`, `driver`, `status`, `actual_start_time`.

- Distance/Speed Time Series (last 30 days):
  - Distance (fleet daily): derive from Trips
    - API: `GET /api/fleet/trips/?status=completed&actual_end_time__date__gte=<30d>`
    - Field: sum `distance_travelled_km` per day client-side.
  - Speed (per-vehicle trend): derive from Telemetry
    - API: `GET /api/fleet/history/vehicle/{id}/?date_range=30days&max_points=1000`
    - Field: time series over `speed_kph` (or use `obd-telemetry/` with time filters and downsample client-side).

- Footer:
  - No API. Show last refresh timestamp of the Summary call and indicate data sources.

Notes
- Apply the same date filters to all GETs for a consistent snapshot.
- If an endpoint lacks server-side date filters, fetch a reasonable window and filter client-side.
- Respect tenant scoping as enforced by auth; tenant selector should not require explicit query params unless your backend exposes them.



