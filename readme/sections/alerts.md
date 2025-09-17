# Alerts

Base endpoints:
- List: `GET /api/fleet/alerts/`
- Detail: `GET /api/fleet/alerts/{id}/`
- Update: `PUT/PATCH /api/fleet/alerts/{id}/`
- Delete: `DELETE /api/fleet/alerts/{id}/`

Note: Alerts are system/device-generated; no manual creation via API in admin workflows.

Custom actions:
- Bulk mark read: `POST /api/fleet/alerts/mark_read/`  
  Body: `{ "selected_records": [ids...] }` (admin-only)
- Bulk resolve: `POST /api/fleet/alerts/resolve_alert/`  
  Body: `{ "selected_records": [ids...] }` (admin-only)
- Acknowledge (single): `PATCH /api/fleet/alerts/{id}/acknowledge/`
- Ignore (single): `PATCH /api/fleet/alerts/{id}/ignore/`
- Resolve (single): `PATCH /api/fleet/alerts/{id}/resolve/`
- Dashboard stats: `GET /api/fleet/alerts/dashboard_stats/`
- Trends: `GET /api/fleet/alerts/trends/`

Permissions
- Read/Write: `IsAuthenticated`.
- Bulk actions (mark_read, resolve_alert): Admins only.
- Single acknowledge/ignore/resolve: Any authenticated user.

List filters (query params)
- `severity`: `low|medium|high|critical`
- `status`: `acknowledged|ignored|resolved|active`
- `vehicle`: `<id>`
- `system`: `<string>`

Fields (API accurate)
- Read-only: `id`, `created_at`, `resolved_at`, `status_label`, `vehicle_info`, `device_id`
- Writable: `alert_type`, `system`, `vehicle`, `obd_device`, `driver`, `title`, `message`, `severity`, `read`, `ignored`, `resolved`

Notes
- `status_label` derives from flags: Ignored > Resolved > Acknowledged > New.
- Non-admin users are auto-scoped to their fleet operator via vehicle/driver linkage.

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Alerts]
               │
               ▼
        Alerts — List → (Row: View)
               │                   
               └─────[Mark Read] [Resolve]
```

Alerts — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Alerts                                        [Mark Read] [Resolve] │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/alerts/dashboard_stats/)                           │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────────────┐          │
│ │ Total Alerts   │ │ Unread         │ │ Resolved                 │          │
│ │ [total_alerts] │ │ [unread]       │ │ [resolved_alerts]        │          │
│ └────────────────┘ └────────────────┘ └──────────────────────────┘          │
├─────────────────────────────────────────────────────────────────────────────┤
│ DISTRIBUTION (from dashboard_stats)                                          │
│  • By Severity: low [#] | medium [#] | high [#] | critical [#]               │
│  • By Type: vehicle_health [#] | maintenance_due [#] | system [#] …          │
│  Optionally, use GET /api/fleet/alerts/trends/ for active (unresolved) only. │
├─────────────────────────────────────────────────────────────────────────────┤
│ ASCII CHARTS (illustrative)                                                  │
│  Severity (bars scaled to max count)                                         │
│   low      | ███████ 7                                                       │
│   medium   | ████ 4                                                          │
│   high     | ██ 2                                                             │
│   critical | █ 1                                                              │
│                                                                                │
│  Type (bars scaled to max count)                                              │
│   vehicle_health  | ██████ 6                                                  │
│   maintenance_due | ██ 2                                                      │
│   system          | ███ 3                                                     │
│   geofence        |  0                                                        │
│ Notes: scale bars dynamically; 1 block ≈ max(count)/7 (rounded up).           │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Severity] [Status] [Vehicle] [System]                (Apply)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Sev  Type            Title                          Vehicle     Created  St │
│ high vehicle_health  High Motor Temperature         EV-9012     10:05   New │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ BULK: [Mark Read] [Resolve]                                      Page 1/2    │
└─────────────────────────────────────────────────────────────────────────────┘

KPI call → GET /api/fleet/alerts/dashboard_stats/
List call → GET /api/fleet/alerts/?severity=&status=&vehicle=&system=
```

Alert — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Alert — Detail                          [Acknowledge] [Ignore] [Resolve] │
│ Type: vehicle_health  Severity: high  Status: New  System: motor               │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────────┐ ┌───────────┐ │
│ │ Severity       │ │ Status         │ │ Created At           │ │ Resolved  │ │
│ │ [high]         │ │ [New]          │ │ [2025-08-22 10:05]   │ │ [—/time]  │ │
│ └────────────────┘ └────────────────┘ └──────────────────────┘ └───────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Summary (Left)                                 │ Context (Right)              │
│ • title                                        │ • vehicle_info (plate/make)  │
│ • message                                      │ • device_id (if any)         │
│ • created_at                                   │ • driver (if any)            │
│ • status_label                                 │ • [View Vehicle]             │
│                                                │ • [View OBD Device]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

Alert Detail — Field Map (API accurate)

- Core: `id`, `alert_type`, `system`, `vehicle`, `driver`, `title`, `message`, `severity`, `created_at`
- Flags: `read`, `ignored`, `resolved`, `resolved_at`, `status_label`
- Device context: `obd_device`, `device_id`
- Vehicle context: `vehicle_info`

Notes
- Serializer does not expose `rule` on Alert; fetch related rule only if your API adds it.

## Data Calls

- List: `GET /api/fleet/alerts/`
- Detail: `GET /api/fleet/alerts/{id}/`
- Dashboard stats: `GET /api/fleet/alerts/dashboard_stats/`
- Trends: `GET /api/fleet/alerts/trends/`
- Bulk mark read: `POST /api/fleet/alerts/mark_read/` → `{ message, updated_count }`
- Bulk resolve: `POST /api/fleet/alerts/resolve_alert/` → `{ message, updated_count }`
- Single acknowledge/ignore/resolve: `PATCH /api/fleet/alerts/{id}/(acknowledge|ignore|resolve)/`
- Open related pages: `GET /api/fleet/vehicles/{vehicle}/`, `GET /api/fleet/obd-devices/{obd_device}/`

## Code References

- Routes: `fleet/urls.py` → `alerts`
- Views: `AlertViewSet` (List/Detail/Update/Delete; bulk, single actions, stats, trends; manual create not used)
- Serializer: `AlertSerializer`
