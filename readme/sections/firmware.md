# Firmware Updates

Base endpoints:
- List: `GET /api/fleet/firmware-updates/` (multipart enabled for create)
- Create: `POST /api/fleet/firmware-updates/` (multipart)
- Detail: `GET /api/fleet/firmware-updates/{id}/` (includes `installs`)
- Update: `PUT/PATCH /api/fleet/firmware-updates/{id}/`
- Pause/Resume: `POST /api/fleet/firmware-updates/{id}/(pause|resume)/`
- Summary: `GET /api/fleet/firmware-updates/{id}/summary/`

Permissions
- `IsAuthenticated`. Backend does not enforce admin-only writes; recommend limiting create/update to admins in the UI.

Fields (API accurate)
- Update: `id`, `component` (obd|dashcam|other), `version`, `description`, `release_date`, `file`, `file_size`, `priority`, `status` (paused|rolling_out|completed), counters: `target_count`, `success_count`, `failure_count`
- Detail extras: `installs[]` per vehicle: `vehicle`, `status` (pending|in_progress|success|failed), `attempts`, `last_attempt_date`, `error_message`

Create — Multipart (backend‑accurate)

Fields
- `component`, `version`, `description`, `release_date`, `file`, `priority`, `status` (default paused)
- Targeting (one of): `vehicle_ids[]=…` (multi) OR `vehicle_type=<id>`

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Firmware Updates]
               │
               ▼
        Firmware Updates — List
               │ (Row: View)
               ▼
        Firmware Update — Detail
```

Firmware Updates — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Firmware Updates                                  [+ Create]       │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Component] [Status] [Version search]                  (Apply)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ Version  Component  Status        Targets  Success/Fail  Release Date       │
│ v1.2.3   obd        rolling_out   120      80/2          2025-09-01         │
│ …                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Firmware Update — Detail (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Firmware Update — Detail (#id)                   [Pause] [Resume]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Targets        │ │ Success        │ │ Failure        │ │ Status         │ │
│ │ [target_count] │ │ [success_count]│ │ [failure_count]│ │ [status]       │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                                      │
│ • Component: [obd|dashcam|other]  • Version: vX.Y.Z  • Priority: N          │
│ • Release: YYYY‑MM‑DD  • File: name.mp4 (size)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ INSTALLS (per vehicle)                                                       │
│ Vehicle     Status        Attempts  Last Attempt    Error                    │
│ EV-001      in_progress   1         2025‑09‑10      —                        │
│ …                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Create Firmware Update (Multipart)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Create Firmware Update                                     [Save] [Cancel]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ component  version  description                                            │
│ release_date  file (upload)  priority  status (paused|rolling_out)         │
│ Target: vehicle_ids[] OR vehicle_type                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

Notes
- On create, backend precomputes `file_size`, creates `FirmwareInstall` rows for targets, sets `target_count` and optionally enqueues rollout when status=rolling_out.
- Pause/Resume toggles rollout state; Summary returns latest counts only.

## Data Calls

- List: `GET /api/fleet/firmware-updates/`
- Detail: `GET /api/fleet/firmware-updates/{id}/`
- Pause/Resume: `POST /api/fleet/firmware-updates/{id}/(pause|resume)/`
- Summary: `GET /api/fleet/firmware-updates/{id}/summary/`
- Create: `POST /api/fleet/firmware-updates/` (multipart: fields + targets)

## Code References

- Routes: `fleet/urls.py` → `firmware-updates`
- Views: `FirmwareUpdateViewSet` (CRUD + pause/resume/summary)
- Serializers: `FirmwareUpdateSerializer`, `FirmwareUpdateDetailSerializer`
- Models: `FirmwareUpdate`, `FirmwareInstall`
