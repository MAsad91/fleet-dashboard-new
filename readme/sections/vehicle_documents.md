# Vehicle Documents — Combined Guide (Spec + Flowchart)

Overview: CRUD is available; use client-side filters for vehicle/doc_type/is_active. Admins create/update/delete.

## Endpoints

- List/Create: GET/POST `/api/fleet/vehicle-documents/`
- Detail/Update/Delete: GET/PUT/PATCH/DELETE `/api/fleet/vehicle-documents/{id}/`

## Create/Edit — Form Fields

- vehicle: select (required)
- doc_type: select (registration | insurance | battery_test | software | warranty | other)
- doc_number: text (optional)
- issue_date: date (optional)
- expiry_date: date (optional)
- is_active: boolean
- doc_file: file upload (optional; use multipart form)

Dropdown: vehicle options → GET `/api/fleet/vehicles/` (value: `id`, label: plate/VIN + make/model)

## Detail Fields (what appears on the page)

- Vehicle (id), Type, Number, Issue Date, Expiry Date, Active
- File (download if present)
- Created (timestamp)

All fields above are reflected in the detail view ASCII below.

## Rules & Behavior

- Unique constraint: `(vehicle, doc_type, doc_number)` must be unique.
- Expiry alerts: created automatically by model logic for expiring docs (no separate API call needed).
- Permissions: create/update/delete → admin-only; non-staff users can view documents for their fleet operator.

## High‑Level Flow

```
Side Nav → Vehicles → [Vehicle Documents]
               │
               ▼
       Vehicle Documents — List
               │ (Row: View)
               ▼
       Vehicle Document — Detail
               │
               └→ [+ Create] → Create Form
```

## Vehicle Documents — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle Documents                              [+ Create] [Bulk ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (computed client-side from GET /api/fleet/vehicle-documents/)     │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐      │
│ │ Total Docs     │ │ Active Docs    │ │ Expiring ≤30d                │      │
│ │ [total]        │ │ [active]       │ │ [expiring_30d]               │      │
│ └────────────────┘ └────────────────┘ └───────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client-side): [Vehicle] [Doc Type] [Active]              (Apply)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                        │
│ Vehicle       Type          Number          Issue       Expiry     Active    │
│ EV-9012       insurance     POL-12345       2024-01-15  2025-01-15 ✅        │
│ EV-1234       registration  REG-444         2023-06-01  2028-06-01 ✅        │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Delete Selected] (admin)                          Page 1/2    │
└─────────────────────────────────────────────────────────────────────────────┘

List call → GET /api/fleet/vehicle-documents/
Note: server does not accept `vehicle`/`doc_type`/`is_active` query params — filter and compute KPIs in UI.
```

### List — Implementation Notes

- Scope: staff sees all; non-staff see only their operator’s docs.
- Bulk delete (admin): confirm per selection; perform DELETE for each id.
- KPIs: compute counts on the filtered client-side dataset (total/active/expiring ≤30d).
- “Expiring soon” badge: compute in UI (e.g., ≤30 days to `expiry_date`).

## Vehicle Document — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Vehicle Document — Detail                 [View Vehicle] [Edit] [Delete] │
│ Vehicle: EV-9012   Type: insurance   Number: POL-12345     Active: ✅          │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Status         │ │ Expires In     │ │ Expiry Date    │ │ Type           │ │
│ │ [Active/❌]    │ │ [days_to_exp]d │ │ [YYYY-MM-DD]   │ │ [insurance]    │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FIELDS                                                                        │
│ Vehicle (id): 5  • Type: insurance  • Number: POL-12345                       │
│ Issue Date: 2024-01-15   Expiry Date: 2025-01-15   Active: ✅                  │
│ Created: 2024-01-15T08:30:00Z                                                 │
│ File: [Download] (if present)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Create / Edit Form (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Create/Edit Vehicle Document                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ vehicle (select), doc_type (select), doc_number                             │
│ issue_date (date), expiry_date (date), is_active (bool)                     │
│ doc_file (upload)                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Save]  [Cancel]                                                            │
└─────────────────────────────────────────────────────────────────────────────┘

Create → POST /api/fleet/vehicle-documents/  (multipart if uploading file)
Edit    → PUT/PATCH /api/fleet/vehicle-documents/{id}/
```

## Data calls (CRUD)

- GET /api/fleet/vehicle-documents/
- POST /api/fleet/vehicle-documents/
- GET /api/fleet/vehicle-documents/{id}/
- PUT/PATCH/DELETE /api/fleet/vehicle-documents/{id}/
 - GET /api/fleet/vehicles/{vehicle_id}/  → for the “View Vehicle” button on detail page

## Cross-links

- From Vehicle Detail → open this list with client-side filter preset to the current vehicle.
- From Insurance Policies → consider linking the related policy doc number where appropriate.
