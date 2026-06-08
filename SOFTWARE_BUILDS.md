# Grain ERP Software Builds

## Windows Desktop

Desktop app support has been added with Electron.

Commands:

```powershell
npm run desktop
npm run dist:desktop
```

Portable fallback package:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\make-windows-portable.ps1
```

Output:

```text
release\GrainERP-Windows-Portable.zip
```

The portable package requires Node.js on the target computer.

## Android APK

Android support has been added with Capacitor.

Commands:

```powershell
npm run android:sync
npm run android:apk
```

APK output when Android SDK is installed:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

If the APK build says `SDK location not found`, install Android Studio or Android SDK command line tools, then set:

```powershell
$env:ANDROID_HOME="C:\Users\user\AppData\Local\Android\Sdk"
```

Or create:

```text
android\local.properties
```

with:

```text
sdk.dir=C:\\Users\\user\\AppData\\Local\\Android\\Sdk
```

## Notes

The desktop version runs the ERP backend locally inside the app.

The Android version packages the web interface with offline fallback data. For full live sync on Android, connect it to a hosted backend or run the backend on a reachable server.
