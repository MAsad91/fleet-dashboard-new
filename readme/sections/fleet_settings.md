# Fleet Settings

Base endpoints (Settings for current operator):
- Get/Update: `GET/PUT /api/fleet/fleet-settings/`
  - OEM Admin/Staff can scope by `?operator_id=`; others default to their own operator.

Permissions
- Settings: `IsAuthenticated`. PUT allowed for Staff, OEM Admin, or Fleet Admin of the same operator.
Note
- Operator CRUD (list/create/delete) is OEM Admin/Staff only and not part of the Fleet Admin UI.

Fields (API accurate)
- FleetOperator: `id`, `name`, `code`, `contact`, `contact_email`, `address`, `metadata` (JSON), `timezone`, `currency`, `unit_system` (metric|imperial), `language`, `date_format`, `logo`, `primary_color`, `created_at`
- Settings response adds: `preferred_theme` (string) from the requesting user’s profile.

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Fleet Settings] → Fleet Settings — Form
```

Fleet Settings — Form (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Fleet Settings — Form                                 [Save] [Cancel]│
├─────────────────────────────────────────────────────────────────────────────┤
│ ORGANIZATION                                                                 │
│ • name • code • contact • contact_email • address                            │
│ • metadata (JSON)                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ LOCALE & BRANDING                                                            │
│ • timezone • currency • unit_system • language • date_format                 │
│ • logo (upload) • primary_color • preferred_theme                            │
└─────────────────────────────────────────────────────────────────────────────┘
```



Fleet Operator — Detail/Edit (Admin/OEM) (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Fleet Operator — Detail/Edit                         [Save] [Delete]│
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (client‑side via list endpoints)                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Vehicles       │ │ Drivers        │ │ Active Trips   │ │ Active Alerts  │ │
│ │ [vehicles]     │ │ [drivers]      │ │ [in_progress]  │ │ [active]       │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│ Notes: For non‑admins, backend scopes to this operator automatically.        │
│        For OEM Admin/Staff, apply UI filter to scope lists to this operator. │
├─────────────────────────────────────────────────────────────────────────────┤
│ ORGANIZATION                                                                 │
│ • name • code • contact • contact_email • address                            │
│ • metadata (JSON)                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ LOCALE & BRANDING                                                            │
│ • timezone • currency • unit_system • language • date_format                 │
│ • logo (upload) • primary_color                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Dependent Sections (linked lists)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DEPENDENT SECTIONS                                                           │
│ BUTTONS: [Vehicles] [Drivers] [Trips] [Alerts] [Maintenance] [Insurance]     │
│          [Dashcams] [Firmware]                                               │
│                                                                               │
│ Vehicles:    opens Vehicles list scoped to this operator                      │
│              Route (admins): /vehicles?fleet={operator_id}                    │
│ Drivers:     opens Drivers list scoped to this operator                       │
│              Note: server auto‑scopes non‑admins; admins apply UI filter      │
│ Trips:       opens Trips list (UI default filter: status=in_progress)         │
│ Alerts:      opens Alerts list (UI default filter: status=active)             │
│ Maintenance: opens Maintenance Records (UI ‘open’ = scheduled|in_progress|delayed) │
│ Insurance:   opens Insurance Policies (scoped)                                 │
│ Dashcams:    opens Dashcams (admin‑only; scoped)                               │
│ Firmware:    opens Firmware Updates (global; installs show per‑vehicle)        │
└─────────────────────────────────────────────────────────────────────────────┘
```
```

Notes
- Settings GET returns FleetOperator data plus `preferred_theme` from the requesting user’s profile; PUT can also update preferred_theme on the profile.
- Fleet Operators list/detail honor role-based scoping and edit permissions per backend.

## Data Calls

- Settings: `GET/PUT /api/fleet/fleet-settings/` (optional `?operator_id=` for staff/OEM)

Dependent sections (filtered to this operator)
- Vehicles: `GET /api/fleet/vehicles/`  
  Non‑admins auto‑scoped; for OEM Admin/Staff, apply UI filter to show only vehicles of this operator.
- Drivers: `GET /api/fleet/drivers/` (same scoping)
- Trips: `GET /api/fleet/trips/?status=in_progress` (same scoping)
- Alerts: `GET /api/fleet/alerts/?status=active` (same scoping)
- Maintenance Records: `GET /api/fleet/maintenance-records/` (same scoping)  
  UI can compute “open” as status in [scheduled|in_progress|delayed].
- Insurance Policies: `GET /api/fleet/insurance-policies/` (same scoping)
- Dashcams (admin‑only): `GET /api/fleet/dashcams/` (same scoping)
- Firmware Updates: `GET /api/fleet/firmware-updates/` (global; installs show per‑vehicle progress)

## Code References

- Routes: `fleet/urls.py` → `fleet-settings`, `fleet-operators`
- Views: `FleetOperatorSettingsView`, `FleetOperatorViewSet`
- Serializer: `FleetOperatorSerializer`
