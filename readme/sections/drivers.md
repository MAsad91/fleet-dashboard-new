# Drivers

Endpoints:
- List/Create: `GET/POST /api/fleet/drivers/`
- Detail/Update/Delete: `GET/PUT/PATCH/DELETE /api/fleet/drivers/{id}/`
- Update driver (explicit): `PUT/PATCH /api/fleet/drivers/{id}/update_driver/`
- Suspend (bulk): `POST /api/fleet/drivers/suspend_drivers/`  
  Body: `{ "selected_drivers": [ids...] }`
- Export CSV: `GET /api/fleet/drivers/export_drivers_csv/?ids=1,2,3`
- Dashboard stats: `GET /api/fleet/drivers/dashboard_stats/`

## Create — Request Bodies (backend‑accurate)

Notes
- Use either `user` (nested object) or `user_id` (existing Django user). `username` is required when using nested `user`.
- Read‑only on create: `status`, `rating`, `date_joined`.
- Unique constraints: `phone_number`, `license_number`.

Create (nested user)

```
{
  "user": {
    "username": "jdoe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  },
  "fleet_operator": 1,
  "phone_number": "+91-9876543210",
  "license_number": "LIC-998",
  "experience_years": 6,
  "address": "123 Main St, Hyderabad",
  "date_of_birth": "1990-04-12",
  "emergency_contact": "Jane Doe, +91-9000000000"
}
```

Create (referencing existing user)

```
{
  "user_id": 42,
  "fleet_operator": 1,
  "phone_number": "+91-9812345678",
  "license_number": "LIC-123",
  "experience_years": 3,
  "address": "Hyderabad",
  "date_of_birth": "1992-07-01",
  "emergency_contact": "John Roe, +91-9999999999"
}
```

### Dropdowns (simple)

- `fleet_operator` options → `GET /api/fleet/fleet-operators/`
  - Admins/OEM admins: see all operators. Fleet admins: see their own operator.
  - Use `id` as value, `name` as label. Preselect for non-admins.

Driver Documents:
- List/Create: `GET/POST /api/fleet/driver-documents/`
- Detail/Update/Delete: `GET/PUT/PATCH/DELETE /api/fleet/driver-documents/{id}/`

Fields (DriverSerializer selection):
- `user` (id, username, first/last name, email)
- `fleet_operator`, `phone_number`, `license_number`
- `experience_years`, `rating`, `status`, `date_joined`
- `address`, `date_of_birth`, `emergency_contact`

## Driver Detail — Field Map (API accurate)

- Core: `id`, `fleet_operator` (id), `phone_number`, `license_number`, `experience_years`, `rating`, `status`, `date_joined`, `address`, `date_of_birth`, `emergency_contact`
- User (nested): `id`, `username`, `first_name`, `last_name`, `email`
- Related (fetch as needed):
  - Documents: via `/api/fleet/driver-documents/` (filter client‑side by driver)
  - Trips: via `/api/fleet/trips/?driver={id}`
  - Logs: via `/api/fleet/driver-logs/?trip={trip_id}` (from trip)
  - Alerts: via `/api/fleet/alerts/?status=active` (filter client‑side by driver)
  - Performance: via `/api/fleet/driver-performance/` (filter client‑side by driver)

DriverDocument fields:
- `driver`, `doc_type`, `doc_number`, `issue_date`, `expiry_date`, `is_active`, `doc_file`
  - Aliases on write: `document_type` → `doc_type`, `document_number` → `doc_number`

Dependent sections — key fields (for driver detail context)
- Trips (`TripSerializer`): `id`, `trip_id`, `driver`, `vehicle`, `scheduled_start_time`, `scheduled_end_time`, `actual_start_time`, `actual_end_time`, `distance_travelled_km`, `estimated_cost`, `status`, `start_coordinate`, `end_coordinate`.
- Driver Logs (`DriverLogSerializer`): `id`, `trip`, `timestamp`, `coordinates` (GeoJSON), `speed_kph`, `heading`, `event_type`.
- Alerts (`AlertSerializer`): `id`, `alert_type`, `system`, `driver`, `vehicle`, `title`, `message`, `created_at`, `severity`, `read`, `ignored`, `resolved`, `status_label`.
- Driver Performance (`DriverPerformanceSerializer`): `id`, `driver`, `period_start`, `period_end`, `average_speed_kph`, `distance_covered_km`, `number_of_harsh_brakes`, `number_of_accidents`, `safety_score`, `eco_score`, `created_at`.

UI (Brief)
- List: Name, Phone, License, Experience, Rating, Status; actions for suspend/export.
- Detail: Driver profile (editable fields), documents, trips, alerts, performance (admin).

Full Flowchart Layout

High‑Level Flow

```
Side Nav → [Drivers]
               │
               ▼
        Drivers — List
               │ (Row: View)
               ▼
        Driver — Detail
```

Drivers — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Drivers                                      [+ Create] [Bulk ▼]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/drivers/dashboard_stats/)                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Total Drivers  │ │ Active Drivers │ │ Suspended      │ │ Avg Rating     │ │
│ │ [total]        │ │ [active]       │ │ [suspended]    │ │ [avg_rating]   │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│ ┌────────────────────────────┐                                              │
│ │ Expiring Driver Docs (30d) │  [expiring_driver_docs]                      │
│ └────────────────────────────┘                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Status] [Min Rating] [Search name/phone]                (Apply)    │
│ Note: server returns operator-scoped drivers; filters apply client-side.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                        │
│ Name            Phone         License       Exp.(y) Rating Status  Actions   │
│ Jane Doe        +91-987…      ABC123        6       4.8    active [View]    │
│ John Smith      +91-981…      XYZ987        3       4.6    susp.  [View]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Suspend Selected]  [Export CSV]                  Page 1/2     │
└─────────────────────────────────────────────────────────────────────────────┘

List call → GET /api/fleet/drivers/
Bulk suspend → POST /api/fleet/drivers/suspend_drivers/ { selected_drivers:[ids] }
Export CSV → GET /api/fleet/drivers/export_drivers_csv/?ids=1,2,3
Create → POST /api/fleet/drivers/ (uses DriverSerializer; supports nested `user` or `user_id`)
```

Driver — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver — Detail                                  [Edit] [Suspend] [Delete] │
│ Name (username)    Phone: +91-…   License: ABC123   Status: active         │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐      │
│ │ Rating         │ │ Experience (y) │ │ Trips (completed, 30d)       │      │
│ │ [4.8]          │ │ [6]            │ │ [count via /trips?driver=&status=completed] ││
│ └────────────────┘ └────────────────┘ └───────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ PROFILE                                                                      │
│ • Fleet Operator: [name] (id) [View Operator]                                │
│ • Name (username) | Email                                                    │
│ • Phone | License | Status | Rating | Experience (years)                     │
│ • Address | Date of Birth | Emergency Contact                                │
│ • Joined: date_joined                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOCUMENTS                                                                     │
│ [View Driver Documents] → GET /api/fleet/driver-documents/                   │
│   Note: backend does NOT support a `driver` query param; filter by driver id in UI. │
│ [Upload Document] → POST /api/fleet/driver-documents/                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ TRIPS                                                                         │
│ [View Trips] → GET /api/fleet/trips/?driver={id} [chips: all | in_progress | completed] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ALERTS                                                                        │
│ [Open Alerts] → GET /api/fleet/alerts/?status=active (filter in UI by driver)│
├─────────────────────────────────────────────────────────────────────────────┤
│ PERFORMANCE (Admin)                                                           │
│ [Open Driver Performance] → /api/fleet/driver-performance/ (filter in UI)    │
├─────────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────┘
```

Data calls:
- GET /api/fleet/drivers/{id}/
- PATCH /api/fleet/drivers/{id}/update_driver/
- GET /api/fleet/driver-documents/  (no `driver` param; filter client-side)
- GET /api/fleet/driver-documents/{doc_id}/  → retrieve single doc
- PATCH/DELETE /api/fleet/driver-documents/{doc_id}/  → update/delete
- GET /api/fleet/trips/?driver={id}
- GET /api/fleet/alerts/?status=active  (filter in UI by driver)
- (Admin) /api/fleet/driver-performance/  (filter in UI by driver)
- (Optional) GET /api/fleet/driver-logs/?trip={trip_id}  (from Trips context)

Code References: `DriverViewSet`, `DriverDocumentViewSet`
