# Users & Permissions

Prefix: `/api/users/`

## Endpoints (scoped to Users & Permissions)

Users
- List: `GET /api/users/users/`  (admin or support; others see scoped results)
- Create: `POST /api/users/users/`  (OEM_ADMIN, FLEET_ADMIN)
- Detail: `GET /api/users/users/{id}/`
- Update: `PUT/PATCH /api/users/users/{id}/`  (IsOwnerOrAdmin)
- Delete: `DELETE /api/users/users/{id}/`  (admin)
- Me: `GET /api/users/users/me/`

Permissions & Groups
- Available permissions: `GET /api/users/permissions/?app_label=&model=&search=` (admin)
- User permissions: `GET/POST /api/users/users/{id}/permissions/`
- Group permissions: `GET/POST /api/users/groups/{id}/permissions/`
- Group app-permissions (bulk): `POST /api/users/groups/{id}/app-permissions/`
- Group users: `GET/POST /api/users/groups/{id}/users/`
- My permissions: `GET /api/users/my-permissions/`
- Check permission: `GET /api/users/has-permission/{app.codename}/`

Auth & Profile
- Login: `POST /api/users/login_with_password/`
- Refresh: `POST /api/users/refresh_token/`
- Set password: `POST /api/users/set_password/`
- Forgot password: `POST /api/users/forgot_password/`
- Profile (self): `GET/PUT /api/users/user_profile/`

OTP & Contact Updates
- Send OTP: `POST /api/users/send_otp/`
- Verify OTP (login): `POST /api/users/verify_otp/`
- Verify OTP (update password): `POST /api/users/verify_otp_update/`
- Update phone: `POST /api/users/update_phone/`
- Update email: `POST /api/users/update_email/`
- Verify update: `POST /api/users/verify_update/`

## Users — Filters, Access, Payloads

List filters & ordering
- Search: `?search=<username|email|first_name|last_name|profile.phone_number>`
- Ordering: `?ordering=username|date_joined`
- Exclude by group (helper): `?exclude_group_id=<group_id>`
- Scoping: admins/OEM_ADMIN see all; fleet users are scoped by `profile.fleet_operator`; others see self

Create (UserCreateSerializer)
- Fields: `username`, `email`, `password`, `first_name`, `last_name`, optional nested `profile` (see below)
- Role rule: only `OEM_ADMIN` or `FLEET_ADMIN` may create; if `FLEET_ADMIN`, backend auto-sets new user’s `profile.fleet_operator` to creator’s operator

UserSerializer (read/update)
- Fields: `id`, `username`, `email`, `first_name`, `last_name`, `is_staff`, `is_superuser`, `is_active`, `last_login`, `profile`, optional `password`+`confirm_password` (write)
- Profile (UserProfileSerializer): `id`, `user`, `phone_number`, `city`, `state`, `pin`, `address`, `is_phone_verified`, `is_email_verified`, `role` (`OEM_ADMIN|FLEET_ADMIN|FLEET_USER|DRIVER|TECHNICIAN`), `preferred_theme`, `fleet_operator`, `ocpi_party_id`, `ocpi_role`, `ocpi_token`

Me
- `GET /api/users/users/me/` → `UserSerializer` of the authenticated user

## Permissions — Models, Users, Groups

Available permissions
- `GET /api/users/permissions/?app_label=&model=&search=` returns Django `Permission` objects
- Each item: `{ id, name, codename, content_type_app, content_type_model, content_type_name }`

User permissions
- GET `/api/users/users/{id}/permissions/` → `{ direct_permissions: [Permission], group_permissions: [Permission], all_permissions: [Permission] }`
- POST body: `{ "permissions": [<permission_id>, ...] }`  (sets direct perms; overwrites existing)

Group permissions
- GET `/api/users/groups/{id}/permissions/` → `[Permission, ...]`
- POST body: `{ "permissions": [<permission_id>, ...] }`  (overwrites existing)

Group app-permissions (bulk)
- POST `/api/users/groups/{id}/app-permissions/`  
  Body: `{ "app_label": "fleet", "model": "vehicle" (optional), "clear_existing": true (default) }`

Group users
- GET `/api/users/groups/{id}/users/` → `[User]`
- POST body: `{ "users": [<user_id>, ...], "action": "add"|"remove" }`

My permissions & checks
- `GET /api/users/my-permissions/` → `{ permissions: ["app.codename", ...] }`
- `GET /api/users/has-permission/<app.codename>/` → `{ permission_code, has_permission }` (400 if not valid)

## Auth & Profile — Flows

Password login
- `POST /api/users/login_with_password/` → `{ refresh_token, access_token, user, message, provider_tokens? }`
- Use `Authorization: Bearer <access_token>` for requests; refresh via `POST /api/users/refresh_token/` with `{ refresh }`

OTP login
- `POST /api/users/send_otp/` with `{ phone }` or `{ email }` → sends code
- `POST /api/users/verify_otp/` with `{ phone|email, otp }` → `{ refresh_token, access_token, user, is_new_user, message }`

Profile (self)
- `GET/PUT /api/users/user_profile/` (serializer: UserSerializer)

Contact updates (OTP‑guarded)
- Start: `POST /api/users/update_phone/` with `{ phone_number }` or `POST /api/users/update_email/` with `{ email }`
- Complete: `POST /api/users/verify_update/` with `{ otp, type: "phone"|"email", new_value }`

Set/Reset password
- Change: `POST /api/users/set_password/` with `{ old_password?, new_password }`
- Forgot: `POST /api/users/forgot_password/` (provider‑aware; for Cognito, returns delivery info)

## UI — Users & Permissions

Dropdowns
- Groups: `GET /api/users/groups/` (id/name)
- Permissions: `GET /api/users/permissions/?app_label=&model=&search=`
- Fleet Operators: `GET /api/fleet/fleet-operators/` (for assigning in profile)

Flow (High‑Level)

```
Side Nav → Users & Permissions
Within this section: manage Users and Groups; open the Permissions list via the [Open Permissions] button on Groups (List or Detail).
```

Shortcut
- From Groups (List/Detail), click [Open Permissions] to jump to the Permissions — List view (`/users/permissions`). Useful when you want to assign permissions after reviewing a group.

Users — List (Full Layout)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                       │
│  Users & Permissions — Users                      [Search user/email/phone]   [+ Create]     │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP                                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                  │
│ │ Total Users    │ │ Total Groups   │ │ Phone Verified │ │ Email Verified │                  │
│ │    [count]     │ │    [count]     │ │    [count]     │ │    [count]     │                  │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘                  │
│ Data:                                                                                        │
│ • Total Users → GET /api/users/users/?page_size=1  (use "count" from DRF)                    │
│ • Total Groups → GET /api/users/groups/?page_size=1 (use "count")                            │
│ • Phone Verified → GET /api/users/profiles/?is_phone_verified=true&page_size=1               │
│ • Email Verified → GET /api/users/profiles/?is_email_verified=true&page_size=1               │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FILTERS                                                                                      │
│ [Search user/email/phone] [Group: exclude ▾] [Ordering ▾] (Apply)                            │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ TABLE (UserSerializer)                                                                       │
│ Columns: Username | Name | Email | Phone | Role | Operator | Active | Last                   │
│ Row actions: [View] [Edit] [Delete]                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Data source: /users/ + /profiles/ (counts)                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

User — Detail (Full Layout)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                       │
│  User — Detail: {username}                  [Edit] [Set Password] [Delete]                   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP                                                                                    │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                  │
│ │ Active         │ │ Phone Verified │ │ Email Verified │ │ Last Login     │                  │
│ │ [true/false]   │ │  [true/false]  │ │  [true/false]  │ │ [timestamp]    │                  │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘                  │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐                    │
│ │ Direct Perms (cnt)   │ │ Group Perms (cnt)    │ │ Effective Perms (cnt)│                    │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘                    │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ TWO COLUMNS                                                                                  │
│ Info (Left)                                  │ Access (Right)                                 │
│ • USER INFO: username, name, email, is_active │ • GROUPS: memberships [Add] [Remove]          │
│ • PROFILE: phone, address, city/state/pin     │ • DIRECT PERMS: top items [Manage Direct…]    │
│   role, fleet_operator, preferred_theme       │ • EFFECTIVE PERMS: count (direct ∪ group)     │
│ • CONTACT (self): [Send OTP] [Update Email] [Update Phone]                                    │
│ • SECURITY: last_login; [Set Password] (self) or via Edit (admin)                             │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ACTIONS                                                                                      │
│ [Edit] → PUT/PATCH /api/users/users/{id}/ (email, profile, role, password set by admin)      │
│ [Set Password] (self) → POST /api/users/set_password/                                        │
│ [Send OTP] (self) → POST /api/users/send_otp/                                                │
│ [Update Email] (self) → POST /api/users/update_email/ → verify_update                        │
│ [Update Phone] (self) → POST /api/users/update_phone/ → verify_update                        │
│ [Manage Direct Perms] → GET/POST /api/users/users/{id}/permissions/                          │
│ [Add/Remove Group] → POST /api/users/groups/{group_id}/users/ { users:[id], action }         │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Data source: /users/{id}/ + /users/{id}/permissions/                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

User Detail — Data Calls

- User: `GET /api/users/users/{id}/` → UserSerializer (includes profile)
- Permissions: `GET /api/users/users/{id}/permissions/` →
  - direct_permissions: user.user_permissions[]
  - group_permissions: all perms from groups the user is in
  - all_permissions: effective = union(direct, group)
- Groups (membership): No direct “groups by user” endpoint. Options:
  - Fetch `GET /api/users/groups/` then for each group call `GET /api/users/groups/{gid}/users/` and check if user is in the list.
  - Or track membership locally when using `POST /api/users/groups/{gid}/users/` actions.



Users — Create/Update (Forms)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Create User                                         [Save] [Cancel] │
├─────────────────────────────────────────────────────────────────────────────┤
│ USER (UserCreateSerializer)                                                 │
│ • username*  • email  • first_name  • last_name                             │
│ • password*  • confirm_password (UI only)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ PROFILE (UserProfileSerializer)                                             │
│ • phone_number  • role (OEM_ADMIN|FLEET_ADMIN|FLEET_USER|DRIVER|TECHNICIAN) │
│ • fleet_operator (id)  • preferred_theme                                    │
│ • address • city • state • pin                                              │
│ • is_phone_verified (admin) • is_email_verified (admin)                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

Create — Request Bodies (backend‑accurate)

Notes
- Required: `username`, `password`. Others optional but recommended.
- If requester is `FLEET_ADMIN`, backend sets `profile.fleet_operator` to requester’s operator (overrides provided value).
- Only `OEM_ADMIN` and `FLEET_ADMIN` can create users.

Minimal create
```
POST /api/users/users/
{
  "username": "ops01",
  "password": "StrongP@ssw0rd!"
}
```

Full create with profile
```
POST /api/users/users/
{
  "username": "ops02",
  "email": "ops02@example.com",
  "password": "StrongP@ssw0rd!",
  "first_name": "Ops",
  "last_name": "Two",
  "profile": {
    "phone_number": "+15551234567",
    "role": "FLEET_USER",
    "fleet_operator": 3,
    "preferred_theme": "light",
    "address": "Plot 1",
    "city": "Hyderabad",
    "state": "TS",
    "pin": "500001",
    "is_phone_verified": false,
    "is_email_verified": false
  }
}
```

Update (self or admin)
```
PUT /api/users/users/{id}/
{
  "email": "ops02+new@example.com",
  "profile": {
    "phone_number": "+15557654321",
    "role": "FLEET_USER",
    "preferred_theme": "dark"
  }
}
```

Password change (self)
```
POST /api/users/set_password/
{
  "old_password": "OldP@ssw0rd!",
  "new_password": "NewStrongP@ss1"
}
```

 

Groups — List (Full Layout)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                       │
│  Users & Permissions — Groups             [+ New Group]   [Open Permissions]                 │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP                                                                                    │
│ ┌────────────────┐ ┌────────────────┐                                                        │
│ │ Total Groups   │ │ Total Perms    │                                                        │
│ │    [count]     │ │    [count]     │                                                        │
│ └────────────────┘ └────────────────┘                                                        │
│ Data:                                                                                        │
│ • Total Groups → GET /api/users/groups/?page_size=1 (use "count")                            │
│ • Total Perms  → GET /api/users/permissions/?page_size=1 (use "count")                       │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ TABLE: GET /api/users/groups/                                                                │
│ Columns: ID | Name | Users | Perms | Actions [View] [Delete]                                 │
│ Notes: Users/Perms counts are optional; compute via:                                         │
│   • Users → GET /api/users/groups/{id}/users/ (length)                                       │
│   • Perms → GET /api/users/groups/{id}/permissions/ (length)                                 │
│ Example rows:                                                                                │
│  1 | Admins        | 5 | 87 | [View] [Delete]                                                │
│  2 | Fleet Ops     | 8 | 23 | [View] [Delete]                                                │
│  3 | Support       | 3 | 11 | [View] [Delete]                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Data source: /groups/ (+ /groups/{id}/users|permissions for counts)                  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

Permissions — List (Full Layout)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                       │
│  Permissions                                   [Assign to Group]                             │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ACCESS                                                                                       │
│ Open via Groups → [Open Permissions]                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FILTERS                                                                                      │
│ [Search] [App Label] [Model] (Apply)                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ TABLE: GET /api/users/permissions/?search=&app_label=&model=                                 │
│ Columns: ID | Name | App | Model | Codename                                                  │
│ Example rows:                                                                                │
│  12 | Can add vehicle     | fleet | vehicle | add_vehicle                                    │
│  13 | Can change vehicle  | fleet | vehicle | change_vehicle                                 │
│  55 | Can view trip       | fleet | trip    | view_trip                                      │
│ Multi-select rows → [Assign to Group]                                                        │
│ IMPORTANT: POST /groups/{gid}/permissions/ OVERWRITES group permissions.                     │
│ To append, fetch current, union with selected, then POST.                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Data source: /permissions/                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

Group — Detail (Full Layout)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                       │
│  Group — {name}                        [Save] [More ▾] [Open Permissions]                    │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP                                                                                    │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────────┐                  │
│ │ Users in Group      │ │ Group Permissions   │ │ App Perms (last added) │                  │
│ │       [count]       │ │       [count]       │ │ [app/model or (all)]   │                  │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────────┘                  │
│ Data:                                                                                        │
│ • Users → GET /api/users/groups/{id}/users/ (length of list)                                 │
│ • Group perms → GET /api/users/groups/{id}/permissions/ (length)                             │
│ • App perms info → Reflect last POST to /groups/{id}/app-permissions/                        │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ TABS                                                                                         │
│ • Users: GET/POST /api/users/groups/{id}/users/  [Add Users] [Remove Users]                  │
│   - Add: POST { users:[5,8], action:"add" }                                                  │
│   - Remove: POST { users:[5],   action:"remove" }                                            │
│ • Permissions: GET/POST /api/users/groups/{id}/permissions/ [Edit]                           │
│   - WARNING: POST overwrites; to append, fetch current and union locally.                    │
│ • Bulk App Permissions: POST /api/users/groups/{id}/app-permissions/                         │
│   - Body: { app_label:"fleet", model:"vehicle"?, clear_existing:true? }                      │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Data source: /groups/{id}/ (+ /groups/{id}/permissions|users)                        │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

Groups & Permissions — Assignment Flow (ASCII, updated navigation)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GROUPS → [Open Permissions]                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ NAV: Groups (List or Detail) → [Open Permissions] → Permissions — List      │
│ Filter by App/Model → multi-select → [Assign to Group]                      │
│ Pick Group (modal) →                                                         │
│ 1) Append (safe):                                                            │
│    • GET /api/users/groups/{gid}/permissions/  → existing_ids                │
│    • Merge existing_ids ∪ selected_ids                                       │
│    • POST /api/users/groups/{gid}/permissions/ { permissions:[…] }           │
│ 2) Replace (flush-and-set):                                                  │
│    • Direct POST /api/users/groups/{gid}/permissions/ { permissions:[…] }    │
│ 3) Bulk by App/Model:                                                        │
│    • POST /api/users/groups/{gid}/app-permissions/ { app_label, model?,      │
│        clear_existing:false? }                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ NAV: Users & Permissions → Users → User — Detail → Access (Right)            │
│ [Add to Group] → POST /api/users/groups/{gid}/users/                         │
│  • Body { users:[<user_id>], action:"add" }                                  │
│ [Remove] on row → POST { users:[<user_id>], action:"remove" }                │
└─────────────────────────────────────────────────────────────────────────────┘
```

Assign to Group — Modal (from User — Detail)

```
┌──────────────────────────────────────────┐
│ Assign User to Group                     │
├──────────────────────────────────────────┤
│ Group [ Select ▾ (GET /users/groups/) ]  │
│ Mode  ( ) Append (safe)  ( ) Replace     │
├──────────────────────────────────────────┤
│ [Cancel]                    [Assign]     │
└──────────────────────────────────────────┘

On Assign:
- If Append: POST /api/users/groups/{gid}/users/ { users:[<user_id>], action:"add" }
- If Replace (rare): First remove unwanted groups via POST { users:[<user_id>], action:"remove" } in each group not desired; then add in the selected group. (There is no single “move” API.)
```

Assign Permissions to Group — Modal (from Permissions — List)

```
┌──────────────────────────────────────────────────────────────┐
│ Assign Permissions to Group                                  │
├──────────────────────────────────────────────────────────────┤
│ Selected perms: [12, 13, 55, …]                              │
│ Group [ Select ▾ (GET /users/groups/) ]                      │
│ Mode  ( ) Append (safe)  ( ) Replace (overwrite existing)    │
├──────────────────────────────────────────────────────────────┤
│ [Cancel]                                        [Apply]      │
└──────────────────────────────────────────────────────────────┘

On Apply:
- Append (safe):
  1) GET /api/users/groups/{gid}/permissions/ → existing_ids
  2) POST /api/users/groups/{gid}/permissions/ { permissions: existing_ids ∪ selected_ids }
- Replace: POST /api/users/groups/{gid}/permissions/ { permissions: selected_ids }
```

Manage Direct Permissions — Drawer (from User — Detail)

```
┌──────────────────────────────────────────────────────────────┐
│ Direct Permissions (User)                                    │
├──────────────────────────────────────────────────────────────┤
│ Search/Filter perms: [App] [Model] [Search] (Apply)          │
│ LIST (Multi-select): ID | Name | App | Model | Codename       │
│ Selected: [12,13,…]                                          │
├──────────────────────────────────────────────────────────────┤
│ [Cancel]                                   [Save Direct Perms]│
└──────────────────────────────────────────────────────────────┘

On Save:
POST /api/users/users/{user_id}/permissions/ { permissions:[…] }  // overwrites direct perms
Then refresh counts via GET /api/users/users/{user_id}/permissions/
```

Remove Users from Group — Modal (from Group — Detail → Users tab)

```
┌──────────────────────────────────────────┐
│ Remove Users from Group                  │
├──────────────────────────────────────────┤
│ Users: [5, 8] (show usernames)           │
├──────────────────────────────────────────┤
│ [Cancel]                    [Remove]     │
└──────────────────────────────────────────┘

On Remove:
POST /api/users/groups/{gid}/users/ { users:[5,8], action:"remove" }
```


Group — Create
```
POST /api/users/groups/
{
  "name": "Ops Managers"
}
```

Assign permissions to group
```
POST /api/users/groups/{group_id}/permissions/
{
  "permissions": [12, 34, 56]
}
```
Fetch permission IDs first:
```
GET /api/users/permissions/?app_label=fleet&model=vehicle
```

Bulk add all app permissions to group
```
POST /api/users/groups/{group_id}/app-permissions/
{
  "app_label": "fleet",
  "model": "vehicle",          // optional; omit to add entire app
  "clear_existing": true        // default true
}
```

Add/remove users in a group
```
POST /api/users/groups/{group_id}/users/
{
  "users": [5, 8, 11],
  "action": "add"                 // or "remove"
}
```

Manage direct permissions on a user
```
POST /api/users/users/{user_id}/permissions/
{
  "permissions": [12, 34]
}
```

Permission checks
```
GET /api/users/my-permissions/
GET /api/users/has-permission/fleet.add_vehicle/
```

Permission Checks (Front‑end toggles)

```
- Load once on app init: GET /my-permissions/ → set of "app.codename"
- Inline checks for critical actions: GET /has-permission/app.codename/
```



## Field Maps (API accurate)

- `UserSerializer` (GET /api/users/users/{id}/)
  - id, username, email, first_name, last_name, is_staff, is_superuser, is_active, last_login
  - profile: see UserProfileSerializer

- `UserProfileSerializer` (embedded in UserSerializer; filters via /profiles/)
  - id, user, phone_number, city, state, pin, address, is_phone_verified, is_email_verified,
    role, preferred_theme, fleet_operator

- `PermissionSerializer` (GET /api/users/permissions/)
  - id, name, codename, content_type_app, content_type_model, content_type_name

- User permissions payload (GET /api/users/users/{id}/permissions/)
  - direct_permissions: [Permission]
  - group_permissions: [Permission]
  - all_permissions: [Permission]

## Code References

- Routes: `users/urls.py`
- Views: `users/views.py` (UserViewSet.me, UserPermissionsView, GroupPermissionsView, GroupAppPermissionsView, GroupUsersView, HasPermissionView, UserPermissionListView, LoginWithPasswordView, RefreshTokenView, SetPasswordView, ForgotPasswordView, OTP + contact updates)
- Serializers: `users/serializers.py` (UserSerializer, UserCreateSerializer, UserProfileSerializer, PermissionSerializer)
- Models: `users/models.py` (UserProfile.Role, OTP, ApiKey, etc.)
