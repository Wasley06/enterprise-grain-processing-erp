Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$release = Join-Path $root "release\GrainERP-Windows-Portable"

Push-Location $root
try {
  npm run build

  if (Test-Path $release) {
    Remove-Item -LiteralPath $release -Recurse -Force
  }

  New-Item -ItemType Directory -Path $release | Out-Null
  Copy-Item -Path (Join-Path $root "dist") -Destination (Join-Path $release "dist") -Recurse

  @'
@echo off
setlocal
cd /d "%~dp0"
set NODE_ENV=production
set PORT=3210
start "Grain ERP Server" /min node dist\server.cjs
timeout /t 3 /nobreak >nul
start "" "http://localhost:3210"
echo Grain ERP is running at http://localhost:3210
echo Close this window when you are done, then stop the minimized server window.
pause
'@ | Set-Content -Path (Join-Path $release "Start-Grain-ERP.bat") -Encoding ASCII

  @'
Grain ERP Windows Portable

1. Double-click Start-Grain-ERP.bat
2. The app opens in your browser at http://localhost:3210
3. Keep the server window running while using the app.

Requirement: Node.js must be installed on the computer.
'@ | Set-Content -Path (Join-Path $release "README.txt") -Encoding ASCII

  Compress-Archive -Path (Join-Path $release "*") -DestinationPath (Join-Path $root "release\GrainERP-Windows-Portable.zip") -Force
}
finally {
  Pop-Location
}
