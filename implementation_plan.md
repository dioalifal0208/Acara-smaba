# Phase G Implementation Plan: Flutter Android MVP Foundation

This plan outlines the architecture, setup, and endpoints integration for the PRESENSI SMABA Android MVP using Flutter.

## User Review Required
> [!IMPORTANT]
> The `flutter` command is currently **not recognized** in your system path (and not found in typical locations like `C:\src\flutter`). 
> 
> Please let me know:
> 1. Is Flutter already installed? If so, what is the absolute path to `flutter.bat`?
> 2. If it is not installed, would you like me to install Flutter first, or will you install it and add it to your system PATH before I proceed?

## Proposed Architecture (presensi_smaba_mobile)
The Flutter app will be created in `C:\laragon\www\presensi_smaba_mobile` to keep it entirely separate from the Laravel repository.

### Packages
- `dio`: HTTP networking and multipart requests.
- `flutter_secure_storage`: Secure storage for the Sanctum token.
- `flutter_riverpod`: Reactive state management.
- `uuid`: Generating secure App Installation UUIDs.

### Directory Structure (`lib/`)
- `core/config/`
  - `app_config.dart` (Reads `--dart-define=API_BASE_URL`)
- `core/network/`
  - `api_client.dart` (Dio instance, base URL, response envelope parsing)
  - `auth_interceptor.dart` (Injects Bearer token, handles global 401 clearing)
  - `api_error_handler.dart` (Maps complex backend errors to concise Indonesian UI messages)
- `core/storage/`
  - `secure_storage.dart` (Token and UUID storage layer)
- `core/models/`
  - `user.dart`, `participant.dart`, `workcode.dart`
- `features/auth/`
  - `presentation/login_screen.dart`, `presentation/splash_screen.dart`
  - `providers/auth_provider.dart`
- `features/dashboard/`
  - `presentation/dashboard_screen.dart` (Greeting, NIS, active workcode, placeholder buttons)
- `features/profile/`
  - `providers/profile_provider.dart`

## Implementation Steps

1. **Project Initialization**
   - Run `flutter create --org id.sch.smanegeri1babatlmg presensi_smaba_mobile`.
   - Remove boilerplate code.

2. **Android Configuration**
   - Update `AndroidManifest.xml` (`android/app/src/main/AndroidManifest.xml`) to use the label `PRESENSI SMABA` and include `<uses-permission android:name="android.permission.INTERNET"/>`.
   - Cleartext traffic will be disabled implicitly (default on modern Android).

3. **Core Layer Implementation**
   - Setup `flutter_secure_storage` logic.
   - Configure Dio with interceptors and base URL from `String.fromEnvironment('API_BASE_URL')`.
   - Create generic data parsing logic for the `{"status":"success", "data": ...}` envelope.

4. **Features Development**
   - **Splash Screen**: Evaluates token presence. Routes to Dashboard if valid, Login if missing.
   - **Login Screen**: Minimalist input for NIS/Email, Password, and Device Name. Calls `POST /api/v1/auth/login`.
   - **Dashboard**: 
     - Calls `GET /api/v1/me` to get participant info.
     - Calls `GET /api/v1/workcodes/active` to show active event status.
     - 3 Placeholder buttons ("Segera hadir").
   - **Profile/Logout**: Action to clear storage and return to Login.

5. **Testing**
   - **Unit Tests**: `test/core/storage/secure_storage_test.dart` and `test/core/network/api_error_handler_test.dart`.
   - **Widget Tests**: `test/features/auth/login_screen_test.dart` using mock providers.

## Verification Plan
1. `flutter pub get`
2. `flutter analyze`
3. `flutter test`
4. `flutter build apk --debug --dart-define=API_BASE_URL=https://presensi.smanegeri1babatlmg.sch.id/api/v1`
5. Report the output APK path and the command usage.
