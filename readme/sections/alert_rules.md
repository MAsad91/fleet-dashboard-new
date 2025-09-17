# Alert Rules

Base endpoints:
- List: `GET /api/fleet/alert-rules/`
- Create: `POST /api/fleet/alert-rules/`
- Detail: `GET /api/fleet/alert-rules/{id}/`
- Update: `PUT/PATCH /api/fleet/alert-rules/{id}/`
- Delete: `DELETE /api/fleet/alert-rules/{id}/`

Permissions
- Read/Write: `IsAuthenticated`.

Fields (API accurate)
- Rule core: `id`, `name`, `description`, `severity`, `system`, `is_active`
- Logic: `condition_logic` (`AND|OR`), `trigger_duration_sec`, `cooldown_minutes`, `auto_resolve`
- Notifications: `notification_channels` (subset of `email|sms|in_app`), `recipients` (list of emails/phones)
- Scope: `vehicle_types` (array of ids)
- Conditions: `conditions[]` of `{ field, operator (>,>=,<,<=,==,!=), threshold }`

Create/Update — Request Bodies (backend‑accurate)

Example create

```
{
  "name": "High Motor Temp",
  "description": "Alert when motor temp exceeds 90C",
  "severity": "high",
  "system": "motor",
  "is_active": true,
  "condition_logic": "AND",
  "trigger_duration_sec": 0,
  "cooldown_minutes": 10,
  "auto_resolve": true,
  "notification_channels": ["in_app", "email"],
  "recipients": ["ops@example.com"],
  "vehicle_types": [3,5],
  "conditions": [
    { "field": "motor_temp_c", "operator": ">", "threshold": 90 }
  ]
}
```

Notes
- `notification_channels` validates against: `email`, `sms`, `in_app`. Unknown values are rejected.
- Updating `conditions` replaces the entire list server-side.

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → Alerts → [Alert Rules]
               │
               ▼
        Alert Rules — List
               │ (Row: Edit)
               ▼
        Alert Rule — Detail/Edit
```

Alert Rules — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Alert Rules                                       [+ Create]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (computed client-side from list)                                   │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Total Rules    │ │ Active         │ │ Inactive       │ │ Auto‑Resolve   │ │
│ │ [total_rules]  │ │ [active]       │ │ [inactive]     │ │ [auto_resolve] │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS (client-side): [Severity] [Active] [Search name]        (Apply)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Name           Severity  Active  Vehicle Types                                │
│ High Motor…    high      ✓       [3,5]                                        │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW ACTIONS: [Edit]                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

Alert Rule — Detail/Edit (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Alert Rule — Detail/Edit                           [Save] [Delete]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ ┌─────────┐ │
│ │ Severity       │ │ Active         │ │ Conditions (count)     │ │ Types # │ │
│ │ [high]         │ │ [✓/✗]          │ │ [len(conditions)]      │ │ [len(vt)]│ │
│ └────────────────┘ └────────────────┘ └────────────────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Rule (Left)                                     │ Notifications & Scope (Right) │
│ • name                                          │ • notification_channels         │
│ • description                                   │ • recipients                    │
│ • severity                                      │ • vehicle_types[]               │
│ • system                                        │                                  │
│ • is_active                                     │                                  │
│ • condition_logic (AND/OR)                      │                                  │
│ • trigger_duration_sec                          │                                  │
│ • cooldown_minutes                              │                                  │
│ • auto_resolve                                  │                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ CONDITIONS (grid)                                                               │
│  Field            | Operator (>,>=,<,<=,==,!=) | Threshold | Actions             │
│  motor_temp_c     | >                           | 90        | [− Remove]         │
│  battery_level_%  | <                           | 20        | [− Remove]         │
│  …                                                                            │
│ [ + Add Condition ]  (client-side only; see notes)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Alert Rule Detail — Field Map (API accurate)

- Rule core: `id`, `name`, `description`, `severity`, `system`, `is_active`
- Logic: `condition_logic`, `trigger_duration_sec`, `cooldown_minutes`, `auto_resolve`
- Notifications: `notification_channels`, `recipients`
- Scope: `vehicle_types` (ids array)
- Conditions: `conditions[]` with `field`, `operator`, `threshold`

Conditions grid behavior
- Operators: one of `>`, `>=`, `<`, `<=`, `==`, `!=` (matches backend).
- Add/remove: use “+ Add Condition” to append a row; “Remove” deletes a row locally.
- No separate API: there is no standalone endpoint to add/remove a single condition. The button only edits the in-page form.
- Save behavior: saving the rule (PUT/PATCH `/api/fleet/alert-rules/{id}/`) replaces the entire `conditions` list server‑side (per serializer).

## Data Calls

- List: `GET /api/fleet/alert-rules/`
- Detail: `GET /api/fleet/alert-rules/{id}/`
- Create/Update/Delete: standard REST

## Code References

- Routes: `fleet/urls.py` → `alert-rules`
- Views: `AlertRuleViewSet`
- Serializer: `AlertRuleSerializer`
