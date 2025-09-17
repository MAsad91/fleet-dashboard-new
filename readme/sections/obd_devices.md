# OBD Devices

Base endpoints:
- List: `GET /api/fleet/obd-devices/`
- Create: `POST /api/fleet/obd-devices/`
- Detail: `GET /api/fleet/obd-devices/{id}/`
- Update: `PUT/PATCH /api/fleet/obd-devices/{id}/`
- Delete: `DELETE /api/fleet/obd-devices/{id}/`

Custom actions:
- Distinct values: `GET /api/fleet/obd-devices/distinct-values/?field=model|manufacturer|device_type|firmware_version`
- Update last communication (admin): `POST /api/fleet/obd-devices/{id}/update-communication/`

List filters (client-side + helpers):
- Client-side filter by `fleet_operator`, `vehicle`, `model`, `firmware_version`, `is_active`, and computed `online` (last_communication_at ≤ 5 min).
- Use `distinct-values` endpoint to populate filter dropdowns for `model` and `firmware_version`. Filter by fleet using the device’s read-only `fleet_operator` field.

Serializer fields (selection):
- `device_id`, `model`, `serial_number`, `can_baud_rate`, `report_interval_sec`
- `vehicle` (id), `fleet_operator` (read-only), `installed_at` (read-only), `is_active`, `last_communication_at` (read-only), `firmware_version`
- `sim_card` (nested in responses; not part of Create form)

## Create/Update — Request Bodies (backend‑accurate)

Notes
- Read‑only: `installed_at`, `last_communication_at`, `fleet_operator`.
- Do not include SIM card fields in the Create form. Manage SIM separately via SIM Cards module.

Create (no SIM in form)

```
{
  "device_id": "OBD-T2-2024-001",
  "model": "TelemX T2",
  "serial_number": "SN-0001",
  "can_baud_rate": 500000,
  "report_interval_sec": 60,
  "vehicle": 5,
  "is_active": true,
  "firmware_version": "1.2.3"
}
```

Field reference (writeable)
- OBD: `device_id`, `model`, `serial_number`, `can_baud_rate`, `report_interval_sec`, `vehicle`, `is_active`, `firmware_version`

### Dropdowns (simple)
- `fleet_operator` options → `GET /api/fleet/fleet-operators/` (value: id; label: name)
- Dependent `vehicle` options → `GET /api/fleet/vehicles/?fleet={fleet_operator_id}&has_obd=false` (value: id; label: plate/VIN + make/model)

## Full Flowchart Layout (Frontend‑accurate)

High‑Level Flow

```
Side Nav → [OBD Devices]
               │
               ▼
        OBD Devices — List
               │ (Row: View)
               ▼
        OBD Device — Detail
```

OBD Devices — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: OBD Devices                                      [+ Create]         │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (client-side from GET /api/fleet/obd-devices/)                    │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐      │
│ │ Total Devices  │ │ Active Devices │ │ Online (≤5m)                 │      │
│ │ [total]        │ │ [active]       │ │ [online_count]               │      │
│ └────────────────┘ └────────────────┘ └───────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client-side): [Fleet] [Vehicle] [Model] [Firmware] [Status] [Online] (Go) │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                        │
│ Device ID  Vehicle  Model     Firmware   Last Comm        Active  Online     │
│ OBD-001    EV-123…  TelemX T2 v1.2.3     2025-01-12 10:02  ✅      ✅         │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Update Comm]  [Delete Selected] (admin)          Page 1/2     │
└─────────────────────────────────────────────────────────────────────────────┘

List call → GET /api/fleet/obd-devices/
Distinct values → GET /api/fleet/obd-devices/distinct-values/?field=model|firmware_version
```

OBD Device — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: OBD Device — Detail (#id)                          [Edit] [Delete]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Active         │ │ Last Comm      │ │ Vehicle        │ │ Firmware       │ │
│ │ [✅/❌]         │ │ [timestamp]    │ │ [plate/VIN]    │ │ [version]      │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Info (Left)                                  │ Connectivity (Right)         │
│ • Device ID • Model • Serial                 │ • Update Communication (btn) │
│ • CAN Baud Rate • Report Interval            │ • Last Comm (timestamp)      │
│ • Status (Active) • Firmware                 │ • Online (≤5m) badge         │
│ • Installed At (timestamp)                   │ • SIM: shown if present (read-only) │
│ • Fleet Operator • Vehicle (id) [View Vehicle]│                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIM CARD DETAILS                                                              │
│ • sim_id • iccid • status • plan_name • plan_data_limit_gb • plan_cost       │
│ • current_data_used_gb • current_cycle_start • overage_threshold              │
│ • last_activity • signal_strength • created_at                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ACTIONS (Admin)                                                               │
│ [Update Communication] → POST /api/fleet/obd-devices/{id}/update-communication/ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Create / Edit Form (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Create/Edit OBD Device                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Fleet Operator (select) → GET /api/fleet/fleet-operators/                   │
│ Vehicle (select) → GET /api/fleet/vehicles/?fleet={id}&has_obd=false        │
│ Device ID (text)     Model (text)     Serial Number (text)                  │
│ CAN Baud Rate (number)     Report Interval Sec (number)                     │
│ Firmware Version (text)    Is Active (checkbox)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Save]  [Cancel]                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data calls
- GET /api/fleet/obd-devices/
- POST /api/fleet/obd-devices/  (create)
- GET /api/fleet/obd-devices/{id}/
- PUT/PATCH/DELETE /api/fleet/obd-devices/{id}/
- GET /api/fleet/obd-devices/distinct-values/?field=model|firmware_version
- POST /api/fleet/obd-devices/{id}/update-communication/
- GET /api/fleet/vehicles/{vehicle_id}/  → View Vehicle from detail
- GET /api/fleet/fleet-operators/  → Populate Fleet dropdown in Create form
- GET /api/fleet/vehicles/?fleet={fleet_operator_id}  → Populate Vehicles dropdown based on Fleet

Code References: `OBDDeviceViewSet`, `OBDDeviceSerializer`, `SimCardSerializer`
