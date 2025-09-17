# Driver Documents

Overview: CRUD is available; use client‑side filters for driver/doc_type/is_active. Admins manage create/update/delete.

Endpoints:
- List/Create: `GET/POST /api/fleet/driver-documents/`
- Detail/Update/Delete: `GET/PUT/PATCH/DELETE /api/fleet/driver-documents/{id}/`

## Create/Edit — Form Fields

- driver: select (required)
- doc_type: select (license | insurance | medical | training | background | other)
- doc_number: text (optional)
- issue_date: date (optional)
- expiry_date: date (optional)
- is_active: boolean
- doc_file: file upload (optional; use multipart form)

Dropdown: driver options → GET `/api/fleet/drivers/` (value: `id`, label: full name; include phone/license as sublabel)

## Detail Fields (what appears on the page)

- Driver (id), Type, Number, Issue Date, Expiry Date, Active
- File (download if present)
- Created (timestamp)

UI (what to build)
- List: Driver, Type, Number, Issue/Expiry, Active; client‑side filters for driver, doc_type, is_active.
- Detail: Full fields; upload/download `doc_file` when present; [View Driver] button.
- Create/Edit: driver, doc_type, doc_number, dates, is_active, file upload.

Related (for sidebar): GET `/api/fleet/drivers/{driver_id}/` to show name, phone, license, status.

High‑Level Flow

```
┌──────────────────────────────┐
│ Driver Documents (List)      │  GET /api/fleet/driver-documents/
│  - Driver | Type | Number    │
│  - Issue/Expiry | Active     │
└───────────────┬──────────────┘
                │ View / Edit
                ▼
┌──────────────────────────────┐
│ Driver Document Detail       │  GET /api/fleet/driver-documents/{id}/
│  Fields editable (PATCH)     │  PATCH /api/fleet/driver-documents/{id}/
│  Upload file                 │
└──────────────────────────────┘
```

Wireframes

Side Nav → Driver Documents Flow

```
Side Nav → Drivers → [Driver Documents]
                          │
                          ▼
                 Documents List → Detail/Edit
                            │
                            └→ [+ Create]
```

- List Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver Documents                               [+ Create] [Bulk ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (client‑side from GET /api/fleet/driver-documents/)               │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐      │
│ │ Total Docs     │ │ Active Docs    │ │ Expiring ≤30d                │      │
│ │ [total]        │ │ [active]       │ │ [expiring_30d]               │      │
│ └────────────────┘ └────────────────┘ └───────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client‑side): [Driver] [Doc Type] [Active]                (Apply)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                        │
│ Driver        Type          Number          Issue       Expiry     Active    │
│ John Smith    license       LIC-998         2023-06-01  2026-06-30 ✅        │
│ …                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Select All]  [Delete Selected] (admin)                          Page 1/2    │
└─────────────────────────────────────────────────────────────────────────────┘
```

Driver Document — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Driver Document — Detail                         [View Driver] [Edit] [Delete] │
│ Driver: John Smith (jsmith)  Type: license  Number: LIC-998    Active: ✅           │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Status         │ │ Expires In     │ │ Expiry Date    │ │ Type           │ │
│ │ [Active/❌]    │ │ [days_to_exp]d │ │ [YYYY-MM-DD]   │ │ [license]      │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FIELDS                                                                        │
│ Driver (id): 12  • Type: license  • Number: LIC-998                           │
│ Issue Date: 2023-06-01   Expiry Date: 2026-06-30   Active: ✅                  │
│ Created: 2023-06-01T10:15:00Z                                                 │
│ File: [Download] (if present)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR (Driver Summary)                                                      │
│ Name • Phone • License • Status                                              │
│ [Open Driver] → GET /api/fleet/drivers/{driver_id}/                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Create/Edit Form Wireframe

```
┌──────────────────────────────────────────────────────────┐
Create/Edit Driver Document
├──────────────────────────────────────────────────────────┤
│ driver (select), doc_type (select), doc_number           │
│ issue_date, expiry_date, is_active, doc_file (upload)    │
└──────────────────────────────────────────────────────────┘
[Save] [Cancel]
```

Code References: `DriverDocumentViewSet`, `DriverDocumentSerializer`, `DriverDocument` model

Data calls (CRUD + cross‑links)
- GET /api/fleet/driver-documents/
- POST /api/fleet/driver-documents/
- GET /api/fleet/driver-documents/{id}/
- PUT/PATCH/DELETE /api/fleet/driver-documents/{id}/
- GET /api/fleet/drivers/{driver_id}/  → for the “View Driver” button on detail page
