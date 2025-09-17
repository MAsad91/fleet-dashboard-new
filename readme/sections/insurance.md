# Insurance Policies

Base endpoints:
- List: `GET /api/fleet/insurance-policies/`
- Create: `POST /api/fleet/insurance-policies/`
- Detail: `GET /api/fleet/insurance-policies/{id}/`
- Update: `PUT/PATCH /api/fleet/insurance-policies/{id}/`
- Delete: `DELETE /api/fleet/insurance-policies/{id}/`

Permissions
- Read: any authenticated user. Non-admins only see policies for vehicles under their `fleet_operator`.
- Write (create/update/delete): admins only (`IsAdminOrReadOnly`).

Fields (API accurate)
- Core: `id`, `vehicle`, `policy_number`, `provider`, `start_date`, `end_date`, `coverage_amount`, `premium_amount`, `created_at`
- Computed: `is_active` (true when today is within the start/end range)
- Constraints: unique per `(vehicle, policy_number)`; `end_date` must be after `start_date`

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Insurance]
               │
               ▼
        Insurance — Policies
               │ (Row: Edit)
               ▼
        Insurance — Detail/Edit
```

Insurance — Policies (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Insurance Policies                               [+ Create]         │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (client-side from list)                                           │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────────────┐          │
│ │ Total Policies │ │ Active         │ │ Expiring Soon (≤30 days) │          │
│ │ [total]        │ │ [active]       │ │ [expiring_30d]           │          │
│ └────────────────┘ └────────────────┘ └──────────────────────────┘          │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client-side): [Vehicle] [Provider] [Active] [Date range] (Apply)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Vehicle   Policy #        Provider           Start Date   End Date   Active │
│ EV-123    POL-12345-678   Acme Insurance Co. 2024-01-01   2025-01-01  ✓     │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW ACTIONS: [Edit]                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

Insurance — Detail/Edit (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Insurance — Detail/Edit                            [Save] [Delete]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌─────────────────────┐ ┌──────────────────────────┐      │
│ │ Status         │ │ Coverage Amount     │ │ Premium Amount (annual)  │      │
│ │ [Active/Expired]│ │ [$coverage_amount] │ │ [$premium_amount]        │      │
│ └────────────────┘ └─────────────────────┘ └──────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Policy (Left)                                   │ Vehicle (Right)            │
│ • vehicle                                        │ • [Open Vehicle]           │
│ • policy_number                                  │                             │
│ • provider                                       │                             │
│ • start_date                                     │                             │
│ • end_date                                       │                             │
│ • coverage_amount                                │                             │
│ • premium_amount                                 │                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Create/Update — Request Body (backend‑accurate)

```
{
  "vehicle": 34,
  "policy_number": "POL-12345-678",
  "provider": "Acme Insurance Co.",
  "start_date": "2024-01-01",
  "end_date": "2025-01-01",
  "coverage_amount": 5000000.00,
  "premium_amount": 1250.00
}
```

Dropdowns
- `vehicle` options → `GET /api/fleet/vehicles/` (server-scoped for non-admins). Use `id` as value; show plate and make/model.

## Data Calls

- List: `GET /api/fleet/insurance-policies/`
- Detail: `GET /api/fleet/insurance-policies/{id}/`
- Create/Update/Delete: standard REST

## Code References

- Routes: `fleet/urls.py` → `insurance-policies`
- Views: `InsurancePolicyViewSet`
- Model: `InsurancePolicy` (validations, uniqueness, `is_active`)
