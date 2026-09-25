# PRESENSI SMABA: Data and API Foundation Audit Report

## 1. Current Data-Model Map

The core data entities are structured using Eloquent ORM. Below is the mapped schema of the domain:

- **Participant (`participants`)**
  - **Ownership:** Core authoritative source for all physical actors doing attendance.
  - **Key Columns:** `nis_nip` (Unique Identifier), `nama`, `qr_token` (UUID), `face_descriptor` (JSON array for face matching), `face_status` (Enum/String), `photo_path`.
  - **Relationships:** `hasMany(Attendance::class)`

- **User (`users`)**
  - **Ownership:** System authentication and RBAC layer.
  - **Key Columns:** `username`, `email` (nullable), `password`, `role` (`admin`, `participant`), `participant_id` (Foreign Key -> participants.id).
  - **Relationships:** `belongsTo(Participant::class)`

- **Workcode (`workcodes`)**
  - **Ownership:** Master schedule/event that participants attend.
  - **Key Columns:** `nama_workcode`, `tanggal`, `jam_datang_mulai`, `jam_datang_selesai`, `latitude`, `longitude`, `radius_meters`, `is_active` (boolean), `hari_aktif` (JSON), `jadwal_per_hari` (JSON).
  - **Relationships:** `hasMany(Attendance::class)`

- **Attendance (`attendances`)**
  - **Ownership:** Transactional log of check-ins/check-outs.
  - **Key Columns:** `participant_id`, `workcode_id`, `waktu_hadir`, `waktu_pulang`, `status` (Enum: hadir, izin, sakit, libur), `leave_request_id` (Nullable FK), `device_hash` (anti-spoofing mechanism), `ip_address`.
  - **Relationships:** `belongsTo(Participant::class)`, `belongsTo(Workcode::class)`, `belongsTo(LeaveRequest::class)`

- **Leave Request (`leave_requests`)**
  - **Ownership:** Process for submitting absentee proofs (sick/leave).
  - **Key Columns:** `participant_id`, `workcode_id`, `tanggal`, `tipe` (sakit/izin), `alasan`, `bukti_path`, `status_approval`.
  - **Relationships:** `belongsTo(Participant::class)`, `belongsTo(Workcode::class)`, `hasOne(Attendance::class)`

---

## 2. Data Quality Findings

A read-only diagnostic script evaluated the current database state.

| Risk Level | Finding | Description & Status |
|---|---|---|
| **Low** | Orphaned Foreign Keys | `0` Attendances and `0` Users possess non-existent `participant_id` values. Relational integrity is completely intact. |
| **Low** | Duplicate Participants | `0` duplicated `nis_nip` entries found. (Total Participants: 103). |
| **Low** | Duplicate Attendances | `0` duplicate check-ins found for the same Participant and Workcode combination. |
| **Low** | Null Identifiers | `0` Attendances exist without a bound `participant_id`. |
| **Medium** | Timezone Handling | `waktu_hadir` and `waktu_pulang` are timestamped correctly, but API clients (Android) must standardize on UTC/ISO-8601 when transmitting `device_timestamp` to prevent replay/skew rejection. |

---

## 3. Existing-Rule Ownership Map

Currently, business rules are strongly coupled to inline Controller logic rather than decoupled services or FormRequests.

- **QR & Token Generation:** Embedded in `Participant` Model booted hooks and `SelfCheckInController`.
- **Face Verification:** Embedded inside `FaceRecognitionController` directly processing the descriptor Euclidean distances.
- **GPS/Geofencing Validation:** Handled entirely inline inside `SelfCheckInController` (e.g., mock location checks, radius Haversine formula distance checks).
- **Duplicate Prevention & Device Locking:** Validated inline within `SelfCheckInController` using SHA256 `device_hash`.
- **Leave Request Approval:** Managed in `AdminLeaveController`.

*Observation:* An Android app cannot cleanly reuse this logic if it remains tightly coupled to the HTTP Web controllers and `Inertia::render()` responses.

---

## 4. API Readiness Assessment

- **Authentication:** `laravel/sanctum` is present in `composer.json`, but `config/auth.php` does not have an `api` guard defined, and there is no `routes/api.php` file. The app currently relies heavily on web session state.
- **Controllers:** There are no dedicated API Resource classes. All controllers return `Inertia::render` or Web Redirects.
- **Security Risks:** The Android app will need to transmit `face_descriptor` or `qr_token` payloads. Currently, there is no API rate limiting configured for these endpoints, which poses a brute-force risk if opened to a mobile client.
- **Code Reuse:** The massive inline validation blocks (e.g., GPS spoofing checks in `SelfCheckInController`) must be extracted into a shared `AttendanceValidationService` so the Android API can consume the exact same rules without code duplication.

---

## 5. Proposed API v1 Endpoint Contract

| Method | Endpoint | Purpose | Request Needs |
|---|---|---|---|
| **POST** | `/api/v1/auth/login` | Obtain Sanctum Token | `login` (NIS/NIP/Email), `password`, `device_name` |
| **POST** | `/api/v1/auth/logout` | Revoke Token | Bearer Token |
| **GET** | `/api/v1/me` | Fetch active user profile | Bearer Token |
| **GET** | `/api/v1/workcodes/active` | Get today's active schedule & radius | Bearer Token |
| **POST** | `/api/v1/attendances/check-in` | Perform attendance check-in | Bearer Token, `latitude`, `longitude`, `accuracy`, `device_timestamp`, `device_id` |
| **POST** | `/api/v1/attendances/leave` | Submit sick/leave proof | Bearer Token, `tipe`, `alasan`, `bukti` (Multipart) |
| **GET** | `/api/v1/attendances/history` | Retrieve personal logs (Paginated) | Bearer Token, `month`, `year` |

---

## 6. Recommended Implementation Phases

To safely transition the architecture without breaking the web platform, execute these small, testable phases:

### Phase 1: API Scaffolding & Sanctum Setup
- **Action:** Run `php artisan install:api` to scaffold `routes/api.php` and configure Sanctum.
- **Affected Files:** `bootstrap/app.php`, `config/auth.php`, `routes/api.php`, `app/Models/User.php` (Add `HasApiTokens`).

### Phase 2: Service Extraction
- **Action:** Extract GPS, device hash, and mock location validation from `SelfCheckInController` into an injectable `AttendanceValidationService`.
- **Affected Files:** `app/Services/AttendanceValidationService.php` (New), `app/Http/Controllers/SelfCheckInController.php`.

### Phase 3: Auth & Profile API
- **Action:** Create API-specific auth controllers to issue and revoke Sanctum tokens, and return the User resource.
- **Affected Files:** `app/Http/Controllers/Api/AuthController.php`, `app/Http/Resources/UserResource.php`, `routes/api.php`.

### Phase 4: Workcode & Attendance API
- **Action:** Expose active workcodes and wrap the newly extracted `AttendanceValidationService` in an API endpoint returning structured JSON.
- **Affected Files:** `app/Http/Controllers/Api/AttendanceController.php`, `app/Http/Controllers/Api/WorkcodeController.php`, `routes/api.php`.
