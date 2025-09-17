# Dashcams & Videos

Base endpoints (Dashcams):
- List: `GET /api/fleet/dashcams/`
- Create: `POST /api/fleet/dashcams/` (admin only)
- Detail: `GET /api/fleet/dashcams/{id}/`
- Update: `PUT/PATCH /api/fleet/dashcams/{id}/` (admin only)
- Delete: `DELETE /api/fleet/dashcams/{id}/` (admin only)
- Dashboard stats: `GET /api/fleet/dashcams/dashboard_stats/`
- Refresh API keys (bulk): `POST /api/fleet/dashcams/refresh_api_key/`  
  Body: `{ "selected_records": [ids...] }` (admin only)

Base endpoints (Video Segments):
- List: `GET /api/fleet/video-segments/`  
  Filters: `vehicle` or `vehicle_id`
- Detail: `GET /api/fleet/video-segments/{id}/`
- Download (presigned): `GET /api/fleet/video-segments/{id}/download/`

Device Upload (dashcam devices):
- `POST /api/fleet/upload-video/` (multipart; header `X-API-KEY: <dashcam_api_key>`)  
  Body: `device_id`, `start_time`, `end_time`, `video_data=.mp4`

Permissions
- Dashcams: admin-only for all actions (`IsAdminUser` with auth). Non-admins cannot access dashcam endpoints; hide Dashcams UI for non-admin roles.
- Segments: `IsAuthenticated`. Non-admins see only segments for vehicles in their operator; server supports `?vehicle=` filter.

Fields (API accurate)
- Dashcam: `id`, `device_id`, `vehicle`, `firmware_version`, `is_active`, `last_streamed_at`, `api_key`, `created_at`
- VideoSegment: `id`, `dashcam`, `segment_id` (UUID), `s3_key`, `start_time`, `end_time`, `uploaded_at`, `is_uploaded`, `upload_attempts`

## UI — Forms and Layout

High‑Level Flow

```
Side Nav → [Dashcams]
               │
               ├→ Dashcams — List → (Row: Edit)
               │                      └→ [Refresh API Key] (bulk)
               │
               └→ Video Segments — List → (Row: Download)
```

Dashcams — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Dashcams                                           [+ Create] [Bulk ▼]│
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (GET /api/fleet/dashcams/dashboard_stats/)                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                    │
│ │ Total          │ │ Active         │ │ Inactive       │                    │
│ │ [total]        │ │ [active]       │ │ [inactive]     │                    │
│ └────────────────┘ └────────────────┘ └────────────────┘                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Active] [Vehicle]                                      (Apply)     │
│ Note: Entire Dashcams section is admin-only (403 for non-admins).            │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE                                                                       │
│ DeviceID  Vehicle    Firmware     Active   API Key Created   Last Streamed   │
│ DC-001    EV-123     v1.0.0       ✓        2025-08-30        2025-09-08      │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ BULK: [Refresh API Key]                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

Dashcam — Detail/Edit (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Dashcam — Detail/Edit (#id)                          [Save] [Delete] │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI CARDS                                                                    │
│ ┌────────────────┐ ┌──────────────────────┐ ┌────────────────────────────┐    │
│ │ Status         │ │ Firmware Version     │ │ API Key (created at)       │    │
│ │ [Active/Off]   │ │ [vX.Y.Z]             │ │ [YYYY-MM-DD hh:mm]         │    │
│ └────────────────┘ └──────────────────────┘ └────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                  │
│ Device (Left)                                   │ Vehicle (Right)            │
│ • device_id                                     │ • [Open Vehicle]           │
│ • is_active                                     │ • List Segments            │
│ • firmware_version                               │   → GET /api/fleet/video-segments/?vehicle={vehicle_id} │
│ • last_streamed_at (read-only)                   │                             │
│ • api_key (admin-visible)                        │                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Video Segments — List (Full Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Video Segments                                 [Grid ▢] [Table ☑]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Vehicle] [Dashcam] [Uploaded ▢] [Start ⏱] [End ⏱] [Search ID] (Apply) │
│ Notes: Date filters are client-side; server supports vehicle filter.         │
├─────────────────────────────────────────────────────────────────────────────┤
│ TABLE (paged + virtualized)                                                 │
│ Thumb  Segment ID      Dashcam    Start → End        Duration  Uploaded  Actions │
│ ▷      7c1e…           DC-001     10:00 → 10:10      00:10     ✓         [Preview] [Download] │
│ …                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Page 1/5                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Row actions and behavior
- Preview: opens a modal with an inline player; fetches a fresh presigned URL only when needed.
- Download: calls `GET /api/fleet/video-segments/{id}/download/` and downloads the returned `s3_url`.
- Thumbnail: optional; if your CDN/S3 supports thumbnails, render a static image; otherwise show a play icon.

Video Segments — Grid View (Optional)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [▢ Grid] [☑ Table]  Filters same as above                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▢  ▷  7c1e…  DC-001  10:00→10:10  ✓   [Preview] [Download]                  │
│ ▢  ▷  a9bf…  DC-002  11:15→11:20  ✓   [Preview] [Download]                  │
│ …                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

Video Segment — Preview (Modal)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Preview — Segment 7c1e…                                   [Close] [Download] │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Vehicle: EV-123  • Dashcam: DC-001  • Start–End: 10:00–10:10  • Uploaded: ✓ │
├─────────────────────────────────────────────────────────────────────────────┤
│ <video controls src={presigned s3_url} poster={thumb?} />                    │
│ Note: Presigned URL expires; re-request for replay if needed.                │
└─────────────────────────────────────────────────────────────────────────────┘
```

Entry points & routing
- From Vehicle — Detail → [Videos] → opens Video Segments filtered by `?vehicle={vehicle_id}`.
- From Dashcam — Detail → “List Segments” → opens Video Segments filtered by `?vehicle={vehicle_id}`.

Data calls
- List (filter by vehicle): `GET /api/fleet/video-segments/?vehicle={id}`
- Download: `GET /api/fleet/video-segments/{id}/download/` → `{ s3_url }`
- For inline preview: use the same `s3_url` in an HTML5 `<video>` player.

Device Upload — Notes
- Devices authenticate with `X-API-KEY` and post multipart to `/api/fleet/upload-video/`.
- Backend enqueues upload to S3; `VideoSegment` is created immediately with `segment_id` and `s3_key`.

## Data Calls

- Dashcams: `GET /api/fleet/dashcams/`, `GET /api/fleet/dashcams/{id}/`, `POST /api/fleet/dashcams/refresh_api_key/`, `GET /api/fleet/dashcams/dashboard_stats/`
- Video Segments: `GET /api/fleet/video-segments/?vehicle={id}`, `GET /api/fleet/video-segments/{id}/download/`
- Device Upload: `POST /api/fleet/upload-video/` (X-API-KEY header)

## Code References

- Routes: `fleet/urls.py` → `dashcams`, `video-segments`, `upload-video`
- Views: `DashcamViewSet`, `VideoSegmentViewSet`, `CloudDashcamUploadView`
- Models: `Dashcam`, `VideoSegment`
