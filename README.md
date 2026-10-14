# Presensi SMABA (Acara SMABA)

Attendance system for SMA Negeri 1 Babat. It handles staff and student attendance for daily schedules and one-off events ("workcodes"). People can check in by QR scan, by face recognition, or through a public self check-in link. Admins approve leave requests and face photos, then export signed attendance reports.

The project includes:

- **Web app**: Laravel 12 + Inertia + React. Admins use it for management and scanning, and participants use it for their dashboard, face registration and leave requests.
- **Mobile API** (`/api/v1`): Sanctum-authenticated endpoints for the Android app, with push notifications through Firebase Cloud Messaging.

## Tech stack

| Layer      | Tools |
|------------|-------|
| Backend    | PHP 8.2+, Laravel 12, Sanctum, Inertia (server), Ziggy |
| Frontend   | React 18, Inertia, Tailwind CSS, Vite 7, Headless UI |
| Attendance | `face-api.js` (models in [public/models/](public/models/)), `html5-qrcode`, Google Maps JavaScript API (geofence maps) |
| Other      | `simple-qrcode` (QR generation), PhpSpreadsheet (Excel import/export), `kreait/laravel-firebase` (FCM) |

## Key concepts

- **Participant**: a teacher, staff member or student whose attendance is tracked. A participant can be linked to a `User` account with role `participant`.
- **Workcode**: an attendance session, either a one-off event or a recurring daily schedule. Its category is `workcode` or `harian`. One-off events have an automatic date/time activation window; daily attendance has per-day check-in/check-out schedules. Both support a GPS geofence. Only one workcode is active at a time.
- **Attendance**: one record per participant per workcode per day, with `waktu_hadir` and `waktu_pulang`. The status is one of `hadir` (present), `izin` (leave), `sakit` (sick), `lupa_absen` (forgot to check in), `libur` (holiday) or `alpha` (absent).
- **Leave request (izin)**: submitted by participants and approved or rejected by an admin. An approved request marks the matching attendance as leave.
- **Photo change request**: a participant asks to replace their registered face photo, and an admin verifies the new one.

All attendance rules (time windows, geofence, duplicates) are enforced centrally in [AttendanceValidationService](app/Services/AttendanceValidationService.php). The web scanner and the mobile API therefore apply the same rules.

## Getting started (local)

Requirements: PHP 8.2+, Composer, Node.js 20+, and a database (SQLite works by default; MySQL also works, e.g. via Laragon).

```bash
composer setup
```

This installs PHP and JS dependencies, creates `.env` from `.env.example`, generates the app key, runs migrations and builds the assets. To do it manually:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

Set `GOOGLE_MAPS_API_KEY` in `.env`. The key must have **Maps JavaScript API** enabled and should be restricted to the web application's HTTP referrers. An Android-restricted key cannot be used by the browser. Because Laravel provides the key at runtime, changing it does not require rebuilding the frontend; run `php artisan config:clear` if configuration is cached.

Seed an admin account, sample participants and the school settings:

```bash
php artisan db:seed
php artisan db:seed --class=SettingSeeder   # principal name/NIP used on signed reports
```

The default admin login is `admin` / `password123`. **Change it on any shared or deployed instance.**

Link public storage for uploaded photos. A fallback `/storage/{path}` route also exists for hosts where symlinks don't work:

```bash
php artisan storage:link
```

### Running the dev environment

```bash
composer dev
```

This starts the Laravel server, the queue worker, log tailing (Pail) and the Vite dev server together.

The camera (QR scanner and face recognition) only works in a **secure context**: `localhost` or HTTPS. To test on a phone, serve the app over HTTPS, for example with Laragon's SSL or a tunnel.

### Scheduler

Two scheduled jobs are defined in [routes/console.php](routes/console.php):

| Command | Schedule | Purpose |
|---------|----------|---------|
| `attendance:calculate-alpha` | every 5 minutes | Marks participants as absent once a session's window closes |
| `workcode:auto-activate`     | every minute | Activates and deactivates event workcodes according to their date/time window |

Locally, run `php artisan schedule:work`. In production, add the standard cron entry:

```
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

### Firebase (push notifications)

Put the Firebase service-account JSON at `storage/app/firebase-credentials.json`. This file is gitignored, so never commit it. You can also point `FIREBASE_CREDENTIALS` elsewhere. To send a test push:

```bash
php artisan fcm:test               # to the default topic
php artisan fcm:test --token=XXXX  # to one device
```

## Other artisan commands

| Command | Purpose |
|---------|---------|
| `face:update-descriptor --id=` | Recompute or update a participant's stored face descriptor |

## Testing

```bash
composer test        # or: php artisan test
```

Feature tests live in [tests/Feature/](tests/Feature/). The mobile API tests are in [tests/Feature/Api/](tests/Feature/Api/) and are grouped by implementation phase.

## Project layout

```
app/
  Console/Commands/       Scheduled & maintenance commands
  Http/Controllers/       Web (Inertia) controllers
  Http/Controllers/Api/V1 Mobile API controllers
  Http/Resources/Api/V1   API JSON resources
  Services/               AttendanceValidationService, FcmService, QrCodeService
resources/js/Pages/       React pages (Admin, Participant, Scanner, Report, Workcodes, ...)
routes/web.php            Web routes (admin, participant, public self check-in)
routes/api.php            /api/v1 mobile endpoints
deploy/                   Server setup & deploy scripts
public/models/            face-api.js model weights
```

## Main routes

**Admin** (`auth` + `admin` middleware): `/dashboard`, `/workcodes`, `/participants` (including Excel import with preview), `/scanner`, `/report`, `/admin/leaves`, `/admin/master-qr`, `/admin/settings`.

**Participant** (`role:participant`): `/participant/dashboard`, `/participant/face-registration`, `/participant/leave-history`.

**Public**: `/` (live stats), `/self-checkin/{token}` (opened via the Master QR), `/verify-signature/{workcode}` (verifies a signed report), and the participant QR download routes.

## Mobile API

All endpoints are under `/api/v1` and use `Authorization: Bearer <token>`, which you get from `POST /api/v1/auth/login`. Write endpoints (attendance, leave requests, photo change requests) require an `Idempotency-Key` header containing a UUID v4.

See [API_CONTRACT.md](API_CONTRACT.md) for the full request and response specification.

## Deployment

Production runs on shared hosting over SSH. The deploy script builds the assets, pushes to GitHub, then on the server pulls, runs `composer install --no-dev`, caches config, routes and views, and migrates.

1. Create `deploy/.env.deploy` (gitignored) with `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `REMOTE_DIR`, `REMOTE_PUBLIC_DIR`, `GITHUB_REPO`, and `PUBLIC_URL`.
2. Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\install-deploy-command.ps1` once and authorize its printed public key on the hosting account.
3. Open a new terminal, then run:

   ```powershell
   deploy
   ```

For a first-time server setup, see [deploy/server-setup.sh](deploy/server-setup.sh). Built assets in `public/build` are committed, so the server does not need Node.js.
