# Performance

Permissions
- Admin-only: both `/api/fleet/driver-performance/` and `/api/fleet/vehicle-performance/` require admin privileges (`IsAuthenticated`, `IsAdminUser`).

Base endpoints
- Driver Performance: `GET/POST /api/fleet/driver-performance/`, `GET/PUT/PATCH/DELETE /api/fleet/driver-performance/{id}/`
- Vehicle Performance: `GET/POST /api/fleet/vehicle-performance/`, `GET/PUT/PATCH/DELETE /api/fleet/vehicle-performance/{id}/`

Fields (API accurate)
- DriverPerformance: `id`, `driver`, `period_start`, `period_end`, `average_speed_kph`, `distance_covered_km`, `number_of_harsh_brakes`, `number_of_accidents`, `safety_score`, `eco_score`, `created_at`
- VehiclePerformance: `id`, `vehicle`, `period_start`, `period_end`, `average_energy_consumption_kwh_per_km`, `total_distance_covered_km`, `downtime_hours`, `battery_health_score`, `service_count`, `created_at`

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Performance]
               │
               ├→ Driver Performance — List → (Row: View)
               │                               │
               │                               └→ [Edit] (admin)
               │
               └→ Vehicle Performance — List → (Row: View)
                                               │
                                               └→ [Edit] (admin)
```

Driver Performance — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver Performance                                   [+ Create]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Driver] [Date range] [Min score] [Max score]          (Apply)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Driver   Period            Safety  Eco  Avg Speed  Distance  Harsh  Accidents│
│ J. Doe   2025‑09‑01→09‑30  92      88   46.2       1,240     3      0        │
│ …                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Driver Performance — Detail/Edit (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver Performance — Detail (#id)                     [Save] [Delete]│
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Safety Score   │ │ Eco Score      │ │ Avg Speed (kph)│ │ Distance (km)  │ │
│ │ [safety]       │ │ [eco]          │ │ [avg_speed]    │ │ [distance]     │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ PERIOD & METRICS                                                             │
│ • period_start → period_end • harsh brakes • accidents                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

Vehicle Performance — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle Performance                                   [+ Create]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Vehicle] [Date range] [Min battery score] [Max downtime] (Apply)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Vehicle  Period            Avg Cons.  Distance  Downtime  Battery  Services  │
│ EV‑9012  2025‑09‑01→09‑30  0.18       1,950     12.0      87.0     2         │
│ …                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Vehicle Performance — Detail/Edit (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle Performance — Detail (#id)                    [Save] [Delete]│
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│ │ Avg Energy (kWh/km)            │ │ Distance (km)  │ │ Downtime (h)  │     │
│ │ [avg_energy_kwh_per_km]        │ │ [distance_km]  │ │ [downtime]    │     │
│ └────────────────────────────────┘ └────────────────┘ └────────────────┘     │
│ ┌──────────────────────────┐ ┌──────────────────────────┐                      │
│ │ Battery Health Score     │ │ Services Count           │                      │
│ │ [battery_health_score]   │ │ [service_count]          │                      │
│ └──────────────────────────┘ └──────────────────────────┘                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ PERIOD & METRICS                                                             │
│ • period_start → period_end                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Calls

- Driver Performance: list/detail and CRUD via `/api/fleet/driver-performance/` and `/{id}/`
- Vehicle Performance: list/detail and CRUD via `/api/fleet/vehicle-performance/` and `/{id}/`

## Code References

- Routes: `fleet/urls.py` → `driver-performance`, `vehicle-performance`
- Views: `DriverPerformanceViewSet`, `VehiclePerformanceViewSet`
- Serializers: `DriverPerformanceSerializer`, `VehiclePerformanceSerializer`
