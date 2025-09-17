# Driver Logs

Base endpoints (Admin UI = read‑only):
- List: `GET /api/fleet/driver-logs/`
- Detail: `GET /api/fleet/driver-logs/{id}/`
Note: Create/Update/Delete exist in the API for device/QA use, but the Fleet Admin UI should not expose them.

Permissions
- `IsAuthenticated`. Non-admins see logs only for trips in their `fleet_operator`.

Fields (API accurate)
- `id`, `trip`, `timestamp`, `coordinates` (GeoJSON), `speed_kph`, `heading`, `event_type`

UI
- Per-trip activity timeline with location points and events
- Useful for auditing trip path alongside OBD telemetry

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Driver Logs]
               │
               ▼
        Driver Logs — List → (Row: View)
               │
               └→ Open Trip → Trips — Detail (context)
```

Code References: `DriverLogViewSet`, `DriverLogSerializer`

Wireframes

- Side Nav → Driver Logs Flow

```
Side Nav → [Driver Logs] → Logs List (filter by trip) → (Row) → Log Detail
```

- List Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver Logs                                          [Export CSV]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (client-side from current list)                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────────────┐          │
│ │ Total Logs     │ │ Unique Trips   │ │ Avg Speed (kph)          │          │
│ │ [count]        │ │ [trips]        │ │ [avg_speed]              │          │
│ └────────────────┘ └────────────────┘ └──────────────────────────┘          │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client-side): [Trip ID] [Driver] [Time range] [Has Coords] (Apply) │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE (paged + virtualized)                                                 │
│ Time        Trip   Speed  Heading  Latitude   Longitude   Event   Actions    │
│ 10:05:20    712    45     180      17.41      78.47       brake   [View]     │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Page 1/5                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

 - Detail Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver Log — Detail (#id)                         [Open Trip]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────────────┐          │
│ │ Speed (kph)    │ │ Heading (deg)  │ │ Event Type               │          │
│ │ [speed_kph]    │ │ [heading]      │ │ [event_type or '—']      │          │
│ └────────────────┘ └────────────────┘ └──────────────────────────┘          │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIMESTAMP & LOCATION                                                         │
│ • timestamp                                                                  │
│ • coordinates (GeoJSON)                                                      │
│ • latitude / longitude (derived from coordinates, if present)                │
│ • map preview (optional, when coordinates present)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ FIELDS — API ACCURATE                                                        │
│ • id                                                                         │
│ • trip (id) → [Open Trip]                                                    │
│ • timestamp                                                                  │
│ • coordinates (GeoJSON Point { type, coordinates:[lng,lat] })                │
│ • speed_kph                                                                  │
│ • heading                                                                    │
│ • event_type                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Calls

- List: `GET /api/fleet/driver-logs/` (apply client-side filters)
- Detail: `GET /api/fleet/driver-logs/{id}/`

## Code References

- Views: `DriverLogViewSet`
- Serializer: `DriverLogSerializer`
```
