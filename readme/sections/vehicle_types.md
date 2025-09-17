# Vehicle Types

Base endpoints:
- List: `GET /api/fleet/vehicle-types/`
- Create: `POST /api/fleet/vehicle-types/`
- Detail: `GET /api/fleet/vehicle-types/{id}/`
- Update: `PUT/PATCH /api/fleet/vehicle-types/{id}/`
- Delete: `DELETE /api/fleet/vehicle-types/{id}/`

Custom actions:
- Upload CSV: `POST /api/fleet/vehicle-types/upload-csv/`  
  Body: multipart `file` (CSV headers: code,name,category,drivetrain,battery_capacity_kwh,motor_power_kw,wltp_range_km,status)
- Firmware lineage: `GET /api/fleet/vehicle-types/{id}/firmware-lineage/`
- Alert thresholds: `GET /api/fleet/vehicle-types/{id}/alert-thresholds/`
- Type documents: `GET /api/fleet/vehicle-types/{id}/documents/`
- Active vehicles: `GET /api/fleet/vehicle-types/{id}/active-vehicles/`

List filters (query params):
- No server-side filters; filter/search client-side (status, category, name, code).

Serializer fields (selection):
- `code`, `name`, `category`, `drivetrain`
- `battery_capacity_kwh`, `motor_power_kw`, `wltp_range_km`
- `status` (active|inactive), `description`
- Read-only: `id`, `active_vehicle_count`

## Create/Update — Request Bodies (backend‑accurate)

Notes
- Status choices: `active|inactive`.
- Read‑only: `id`, `active_vehicle_count`.

Full create (all supported writeable fields)

```
{
  "code": "VTY-ESPR-2024",
  "name": "eSprinter Van",
  "category": "4W",
  "drivetrain": "FWD",
  "battery_capacity_kwh": 113.0,
  "motor_power_kw": 150.0,
  "wltp_range_km": 440.0,
  "status": "active",
  "description": "Large electric cargo van"
}
```

Field reference (writeable)
- `code`, `name`, `category`, `drivetrain`, `battery_capacity_kwh`, `motor_power_kw`, `wltp_range_km`, `status`, `description`

### Dropdowns (simple)
- `status` options: `active`, `inactive`
- `category`, `drivetrain`: free text (standardize client-side if needed)

## Full Flowchart Layout (Frontend‑accurate)

High‑Level Flow

```
Side Nav → Vehicles → [Vehicle Types]
               │
               ▼
        Vehicle Types — List
               │ (Row: View)
               ▼
        Vehicle Type — Detail
```

Vehicle Types — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle Types                                [+ Create] [Upload CSV] │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (client-side from GET /api/fleet/vehicle-types/)                  │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐      │
│ │ Total Types    │ │ Active Types   │ │ Active Vehicles (sum)        │      │
│ │ [total]        │ │ [active]       │ │ [sum_active_vehicle_count]   │      │
│ └────────────────┘ └────────────────┘ └───────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client-side): [Status] [Category] [Search name/code]     (Apply)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                        │
│ Code   Name              Category  Drivetrain  Battery  Motor  WLTP  Status  Active │
│ VTY1   Sedan EV          Car       RWD         75 kWh   120 kW 450km active   23    │
│ VTY2   eSprinter Van     Van       FWD         113 kWh  150 kW 440km active   12    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Delete Selected] (admin)                          Page 1/2    │
└─────────────────────────────────────────────────────────────────────────────┘

List call → GET /api/fleet/vehicle-types/
Upload CSV → POST /api/fleet/vehicle-types/upload-csv/ (file)
```

Vehicle Type — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle Type — Detail (#id)                           [Edit] [Delete] │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Active Vehicles│ │ Battery (kWh)  │ │ Motor (kW)     │ │ WLTP Range (km)│ │
│ │ [active_count] │ │ [battery]      │ │ [motor]        │ │ [wltp]         │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Info (Left)                                  │ Insights (Right)              │
│ • Code • Name • Category • Drivetrain        │ • Firmware Lineage            │
│ • Status • Description                       │   GET /api/fleet/vehicle-types/{id}/firmware-lineage/ │
│                                              │ • Alert Breakdown             │
│                                              │   GET /api/fleet/vehicle-types/{id}/alert-thresholds/ │
│                                              │ • Type Documents              │
│                                              │   GET /api/fleet/vehicle-types/{id}/documents/        │
│                                              │ • Active Vehicles             │
│                                              │   GET /api/fleet/vehicle-types/{id}/active-vehicles/  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PANELS                                                                        │
│ • Firmware Lineage → distinct OBD/Dashcam firmware versions                   │
│ • Alert Breakdown → counts by severity (Critical/High/Medium/etc.)            │
│ • Type Documents → list of documents across vehicles of this type             │
│ • Active Vehicles → list/table of active vehicles for this type               │
│ • Vehicles (All for this Type) → full list/table via Vehicles endpoint        │
├─────────────────────────────────────────────────────────────────────────────┤
│ VEHICLES (for this type)                                                      │
│ • All Vehicles → GET /api/fleet/vehicles/?vehicle_type={id}                   │
│ • Active Only  → GET /api/fleet/vehicle-types/{id}/active-vehicles/           │
│ Table: VIN  Plate  Make/Model (Year)  Status  Battery%  Online  Health        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data calls
- GET /api/fleet/vehicle-types/
- POST /api/fleet/vehicle-types/  (create)
- GET /api/fleet/vehicle-types/{id}/
- PUT/PATCH/DELETE /api/fleet/vehicle-types/{id}/
- POST /api/fleet/vehicle-types/upload-csv/  (multipart file)
- GET /api/fleet/vehicle-types/{id}/firmware-lineage/
- GET /api/fleet/vehicle-types/{id}/alert-thresholds/
- GET /api/fleet/vehicle-types/{id}/documents/
- GET /api/fleet/vehicle-types/{id}/active-vehicles/
- GET /api/fleet/vehicles/?vehicle_type={id}  → list all vehicles for this type

Code References: `VehicleTypeViewSet`, `VehicleTypeSerializer`
