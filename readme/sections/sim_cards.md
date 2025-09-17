# SIM Cards

Base endpoints:
- List: `GET /api/fleet/sim-cards/`
- Create: `POST /api/fleet/sim-cards/`
- Detail: `GET /api/fleet/sim-cards/{id}/`
- Update: `PUT/PATCH /api/fleet/sim-cards/{id}/`
- Delete: `DELETE /api/fleet/sim-cards/{id}/`

Custom actions:
- Suspend: `POST /api/fleet/sim-cards/{id}/suspend/`
- Activate: `POST /api/fleet/sim-cards/{id}/activate/`
- Deactivate: `POST /api/fleet/sim-cards/{id}/deactivate/`
- Update usage: `POST /api/fleet/sim-cards/{id}/update-usage/`  
  Body: `{ "current_data_used_gb": <float> }`
- Summary: `GET /api/fleet/sim-cards/summary/` → `{ count, total_data_used_gb, total_monthly_cost }`

Permissions
- Read: any authenticated user. Non-admins only see SIMs attached to OBD devices whose vehicles belong to their `fleet_operator`.
- Write (create/update/delete and actions): admins only.

List filters (UI/client-side)
- `status`: `inactive|active|suspended` (filter in UI over list results)
- `plan_name`: client-side search by substring
- `device`: select by OBDDevice id; non-admins only see devices in their operator
- `overage`: highlight rows where `current_data_used_gb ≥ plan_data_limit_gb × overage_threshold` (client-only)

Fields (API accurate)
- Read-only: `id`, `last_activity`, `signal_strength`, `created_at`
- Writable: `sim_id`, `iccid`, `status` (`inactive|active|suspended`), `plan_name`, `plan_data_limit_gb`, `plan_cost`, `current_data_used_gb`, `current_cycle_start`, `overage_threshold`, `device` (OBDDevice id)

Notes
- Validation: when `status = inactive`, `device` must be null. Setting `status` to inactive during update also clears `device`.
- Single-SIM-per-device: assigning `device` moves off any existing SIM already on that device.
- Overage alerts: when `current_data_used_gb ≥ plan_data_limit_gb × overage_threshold`, a system `Alert` is generated (once per threshold crossing).

## SIM Detail — Field Map (API accurate)

- Core: `id`, `sim_id`, `iccid`, `status`, `plan_name`, `plan_data_limit_gb`, `plan_cost`, `current_data_used_gb`, `current_cycle_start`, `overage_threshold`, `device`, `created_at`
- Derived: `last_activity`, `signal_strength`

## UI — Forms and Layout

Create SIM form (all fields)
- `sim_id` (text)
- `iccid` (text)
- `status` (select: inactive, active, suspended; default inactive)
- `plan_name` (text)
- `plan_data_limit_gb` (number)
- `plan_cost` (number)
- `current_data_used_gb` (number; default 0)
- `current_cycle_start` (date)
- `overage_threshold` (number 0..1; default 0.9)
- `device` (select OBDDevice by id; disable/hide when status=inactive)
  - Populate dropdown with OBD devices that do not have a SIM card. If the backend does not provide such a filter, show all OBD devices.
  - Pass the selected device `id` as `device` in the create request.
  - API to load options: `GET /api/fleet/obd-devices/` (server scopes by operator for non-admins). Filter client-side to "no-SIM" by keeping only devices where `sim_card` is null.

Example create request (JSON)

```
{
  "sim_id": "SIM-001-2025",
  "iccid": "8991101200003204512",
  "status": "active",                 // one of: inactive|active|suspended
  "plan_name": "IoT 2GB/mo",
  "plan_data_limit_gb": 2.0,
  "plan_cost": 6.99,
  "current_data_used_gb": 0.25,
  "current_cycle_start": "2025-09-01",
  "overage_threshold": 0.9,
  "device": 42                         // OBDDevice id (from dropdown); optional
}
```

SIM detail page (all fields)
- Show: `sim_id`, `iccid`, `status`, `plan_name`, `plan_data_limit_gb`, `plan_cost`, `current_data_used_gb`, `current_cycle_start`, `overage_threshold`, `device`, `created_at`
- Show derived: `last_activity`, `signal_strength`
- Actions: `[Activate] [Deactivate] [Suspend] [Update Usage]`
- Navigation: `[View OBD Device]` (opens OBD Device detail page)

## Full Flowchart Layout (Frontend‑accurate)

High‑Level Flow

```
Side Nav → [SIM Cards]
               │
               ▼
        SIM Cards — List
               │ (Row: View)
               ▼
        SIM Card — Detail/Edit
```

SIM Cards — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: SIM Cards                                      [+ Create]           │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/sim-cards/summary/)                               │
│ ┌────────────────┐ ┌──────────────────────────┐ ┌────────────────────────┐ │
│ │ Total SIMs     │ │ Total Data Used (GB)     │ │ Total Monthly Cost ($) │ │
│ │ {count}        │ │ {total_data_used_gb}     │ │ {total_monthly_cost}   │ │
│ └────────────────┘ └──────────────────────────┘ └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Status] [Plan] [Device (no‑SIM only if backend filter exists; else all)]  (Apply) │
│ Legend: Signal = strong/weak/none                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ ICCID     Status   Plan Name     Limit (GB)  Used (GB)  Device  Last Act.  │
│ 8991…     active   IoT 2GB/mo    2.0         1.6        42      09-10 12:31│
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW ACTIONS: [View]                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

KPI call → GET /api/fleet/sim-cards/summary/
List call → GET /api/fleet/sim-cards/   (filters applied client-side)
```

SIM Card — Detail/Edit (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: SIM Card — Detail                             [Save] [Activate] [Deactivate] [Suspend] [Delete] │
│ ICCID: 8991…  SIM: SIM-001-2025  Status: active  Signal: strong                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────────┐ ┌───────────┐ │
│ │ Plan Limit (GB)│ │ Used (GB)      │ │ Overage Threshold (%)│ │ Status    │ │
│ │ [2.0]          │ │ [1.6]          │ │ [90%]                │ │ active    │ │
│ └────────────────┘ └────────────────┘ └──────────────────────┘ └───────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Info (Left)                                    │ Device/Connectivity (Right) │
│ • sim_id                                       │ • device (OBD id)           │
│ • iccid                                        │ • last_activity              │
│ • status                                       │ • signal_strength            │
│ • plan_name                                    │ • created_at                 │
│ • plan_data_limit_gb                           │ • [View OBD Device]          │
│ • plan_data_limit_gb                           │                              │
│ • plan_cost                                    │                              │
│ • current_cycle_start                          │                              │
│ • current_data_used_gb                         │                              │
│ • overage_threshold                            │                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Calls

- List: `GET /api/fleet/sim-cards/`
- Detail: `GET /api/fleet/sim-cards/{id}/`
- Summary: `GET /api/fleet/sim-cards/summary/` → `{ count, total_data_used_gb, total_monthly_cost }`
- Update usage: `POST /api/fleet/sim-cards/{id}/update-usage/` → `{ current_data_used_gb }`
- Activate/Deactivate/Suspend: `POST /api/fleet/sim-cards/{id}/(activate|deactivate|suspend)/`
- Open OBD Device page: `GET /api/fleet/obd-devices/{device}/`
- Device dropdown options: `GET /api/fleet/obd-devices/` (no dedicated no-SIM filter in backend; filter client-side)

## Code References

- Routes: `fleet/urls.py` → `sim-cards`
- Views: `SimCardViewSet` (CRUD, status actions, usage, summary)
- Model: `SimCard` (enforces constraints and raises overage alerts)
