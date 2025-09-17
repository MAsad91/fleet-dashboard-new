# Maintenance

Base endpoints (Maintenance Records):
- List: `GET /api/fleet/maintenance-records/`
- Create: `POST /api/fleet/maintenance-records/`
- Detail: `GET /api/fleet/maintenance-records/{id}/`
- Update: `PUT/PATCH /api/fleet/maintenance-records/{id}/`
- Delete: `DELETE /api/fleet/maintenance-records/{id}/`

Actions (Maintenance Records):
- Schedule/Reschedule: `POST /api/fleet/maintenance-records/{id}/schedule/`  
  Body: `{ "scheduled_date": "YYYY-MM-DDTHH:MM:SSZ" }`
- Start: `POST /api/fleet/maintenance-records/{id}/start/`
- Complete: `POST /api/fleet/maintenance-records/{id}/complete/`  
  Body optional: `{ "cost": <decimal> }`
- Cancel: `POST /api/fleet/maintenance-records/{id}/cancel/`
- Overview metrics: `GET /api/fleet/maintenance-records/overview_metrics/`
- Upcoming: `GET /api/fleet/maintenance-records/upcoming/`
- History: `GET /api/fleet/maintenance-records/history/?start=YYYY-MM-DD&end=YYYY-MM-DD`
- Work order HTML: `GET /api/fleet/maintenance-records/{id}/work_order_pdf/`

Base endpoints (Scheduled Maintenance):
- List: `GET /api/fleet/scheduled-maintenance/`
- Create: `POST /api/fleet/scheduled-maintenance/`
- Detail: `GET /api/fleet/scheduled-maintenance/{id}/`
- Update: `PUT/PATCH /api/fleet/scheduled-maintenance/{id}/`
- Delete: `DELETE /api/fleet/scheduled-maintenance/{id}/`

Actions (Scheduled Maintenance):
- Mark service done (bulk): `POST /api/fleet/scheduled-maintenance/mark_service_done/`  
  Body: `{ "selected_records": [ids...] }`
- Dashboard stats: `GET /api/fleet/scheduled-maintenance/dashboard_stats/`

Permissions
- Maintenance Records: `IsAuthenticated`. Actions are available to authenticated users. Vehicle status is set to `maintenance` on start and back to `available` on complete/cancel.
- Scheduled Maintenance: `IsAuthenticated`. Bulk mark-service-done requires admin (`IsAdminUser`).
- Scoping: Non-admin users only see records for vehicles in their `profile.fleet_operator`.

High‑Level Flow

```
Side Nav → [Maintenance]
               │
               ├→ Maintenance — Records
               │     │ (Row: View)
               │     ▼
               │   Maintenance — Detail
               │
               └→ Scheduled Maintenance — List → [Mark Service Done]
```

Maintenance — Records (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Maintenance — Records                              [+ Create]       │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/maintenance-records/overview_metrics/)             │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Scheduled (M)  │ │ Completed      │ │ Overdue        │ │ Cost (6 mo)    │ │
│ │ [scheduled_this_month] │ [completed]    │ [overdue]      │ │ [$cost_last_6_months] │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Status] [Vehicle] [Type] [Scheduled Date Range]         (Apply)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Vehicle  Type      Status       Scheduled         Technician      Cost       │
│ EV-123   routine   scheduled    2024-09-20 10:00  Tech A          $120.00    │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW ACTIONS: [View] [Work Order]                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Maintenance — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Maintenance — Detail (#id)                 [Schedule] [Start] [Complete] [Cancel] │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ ┌─────────┐ │
│ │ Status         │ │ Scheduled Time │ │ Estimated Duration (h) │ │ Cost    │ │
│ │ [status]       │ │ [YYYY-MM-DD…]  │ │ [est_hours]            │ │ [$..]   │ │
│ └────────────────┘ └────────────────┘ └────────────────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Record (Left)                                   │ Vehicle (Right)            │
│ • vehicle                                       │ • [Open Vehicle]           │
│ • maintenance_type                               │                             │
│ • title, description                             │                             │
│ • scheduled_date, start_date, end_date           │                             │
│ • priority, work_order_number, location          │                             │
│ • estimated_duration_hours, cost                 │                             │
│ • technician, parts_used, alerts_enabled         │                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ WORK ORDER: [Open HTML] → GET /api/fleet/maintenance-records/{id}/work_order_pdf/ │
└─────────────────────────────────────────────────────────────────────────────┘
```

Create/Edit — Maintenance Record (Form)

```
┌──────────────────────────────────────────────────────────┐
│ Create/Edit Maintenance Record                            │
├──────────────────────────────────────────────────────────┤
│ vehicle, maintenance_type, title, description             │
│ scheduled_date, priority, estimated_duration_hours        │
│ work_order_number, location, alerts_enabled               │
└──────────────────────────────────────────────────────────┘
[Save] [Cancel]
```

Scheduled Maintenance — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Scheduled Maintenance                                 [Mark Done]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/scheduled-maintenance/dashboard_stats/)            │
│ ┌────────────────┐ ┌──────────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Total          │ │ Due Soon (≤30 days) │ │ Overdue        │ │ Completed      │ │
│ │ [total_records]│ │ [due_soon_records]  │ │ [overdue_records] │ │ [completed_records] │ │
│ └────────────────┘ └──────────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Vehicle] [Type]                                        (Apply)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Vehicle  Type      Interval km  Interval days  Last Service Date             │
│ EV-123   routine   10000        180            2024-06-01                    │
│ …                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Code References: `MaintenanceRecordViewSet`, `ScheduledMaintenanceViewSet`


Create/Update — Request Bodies (backend‑accurate)

- MaintenanceRecord
```
{
  "vehicle": 34,
  "maintenance_type": "routine",
  "title": "Annual service",
  "description": "Change oil, rotate tires",
  "scheduled_date": "2025-10-01T10:00:00Z",
  "priority": "High",
  "estimated_duration_hours": 2.5,
  "work_order_number": "WO-2025-0001",
  "location": "Service Bay A",
  "alerts_enabled": true
}
```

- ScheduledMaintenance
```
{
  "vehicle": 34,
  "maintenance_type": "routine",
  "interval_km": 10000,
  "interval_days": 180
}
```

Dropdowns
- `vehicle` options → `GET /api/fleet/vehicles/` (scoped for non-admins). Value: id; label: plate + make/model.
- `maintenance_type` options → static: `routine|repair|inspection|battery|software`.

## Data Calls

- Maintenance Records: list/detail and actions above
- Overview metrics: `GET /api/fleet/maintenance-records/overview_metrics/`
- Scheduled Maintenance: list/detail and bulk mark; KPIs via `dashboard_stats`

## Code References

- Routes: `fleet/urls.py` → `maintenance-records`, `scheduled-maintenance`
- Views: `MaintenanceRecordViewSet`, `ScheduledMaintenanceViewSet`
- Serializers: `MaintenanceRecordSerializer`, `ScheduledMaintenanceSerializer`
- Models: `MaintenanceRecord`, `ScheduledMaintenance`
