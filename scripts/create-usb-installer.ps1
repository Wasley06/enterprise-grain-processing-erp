Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$release = Join-Path $root "release"
$usbFolder = Join-Path $release "GrainERP-USB-Installer"
$usbZip = Join-Path $release "GrainERP-USB-Installer.zip"
$portableZip = Join-Path $release "GrainERP-Windows-Portable.zip"

Push-Location $root
try {
  powershell -ExecutionPolicy Bypass -File scripts\make-windows-portable.ps1

  if (Test-Path $usbFolder) {
    Remove-Item -LiteralPath $usbFolder -Recurse -Force
  }
  New-Item -ItemType Directory -Path $usbFolder | Out-Null
  Copy-Item -LiteralPath $portableZip -Destination (Join-Path $usbFolder "GrainERP-Windows-Portable.zip") -Force

  @'
@echo off
setlocal
title Grain ERP USB Installer

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is required before installing Grain ERP on this computer.
  echo Download and install Node.js LTS from:
  echo https://nodejs.org
  echo.
  pause
  exit /b 1
)

set "INSTALL_DIR=%LOCALAPPDATA%\Grain ERP"
set "APP_DIR=%INSTALL_DIR%\GrainERP-Windows-Portable"
set "PAYLOAD=%~dp0GrainERP-Windows-Portable.zip"
set "DOWNLOAD_URL=https://enterprise-grain-processing-erp.vercel.app/installers/GrainERP-Windows-Portable-v1.0.3.zip"

if not exist "%PAYLOAD%" (
  echo.
  echo GrainERP-Windows-Portable.zip was not found beside this installer.
  echo This usually happens when the BAT file is opened directly from WinRAR or a ZIP preview.
  echo Downloading the payload now...
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TEMP%\GrainERP-Windows-Portable.zip'"
  if errorlevel 1 (
    echo.
    echo Download failed. Please extract the full USB installer ZIP first, then run INSTALL-GRAIN-ERP.bat again.
    echo.
    pause
    exit /b 1
  )
  set "PAYLOAD=%TEMP%\GrainERP-Windows-Portable.zip"
)

echo.
echo Installing Grain ERP to:
echo %INSTALL_DIR%
echo.

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%PAYLOAD%' -DestinationPath '%INSTALL_DIR%' -Force"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws=New-Object -ComObject WScript.Shell; $desktop=[Environment]::GetFolderPath('Desktop'); $s=$ws.CreateShortcut($desktop + '\Grain ERP.lnk'); $s.TargetPath='%APP_DIR%\Start-Grain-ERP.bat'; $s.WorkingDirectory='%APP_DIR%'; $s.Save()"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws=New-Object -ComObject WScript.Shell; $start=[Environment]::GetFolderPath('StartMenu') + '\Programs\Grain ERP.lnk'; $s=$ws.CreateShortcut($start); $s.TargetPath='%APP_DIR%\Start-Grain-ERP.bat'; $s.WorkingDirectory='%APP_DIR%'; $s.Save()"

echo.
echo Grain ERP installed successfully.
echo Open it from the Desktop shortcut or Start Menu.
echo.
pause
'@ | Set-Content -Path (Join-Path $usbFolder "INSTALL-GRAIN-ERP.bat") -Encoding ASCII

  @'
@echo off
setlocal
title Grain ERP Uninstaller

set "INSTALL_DIR=%LOCALAPPDATA%\Grain ERP"

if exist "%USERPROFILE%\Desktop\Grain ERP.lnk" del "%USERPROFILE%\Desktop\Grain ERP.lnk"
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Grain ERP.lnk" del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Grain ERP.lnk"
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"

echo.
echo Grain ERP removed from this computer.
echo.
pause
'@ | Set-Content -Path (Join-Path $usbFolder "UNINSTALL-GRAIN-ERP.bat") -Encoding ASCII

  @'
Grain ERP USB Installer

Use this package to install Grain ERP on another Windows computer from a USB drive.

Steps:
1. Copy this whole GrainERP-USB-Installer folder to a USB drive.
2. Open the folder on the target computer.
3. Double-click INSTALL-GRAIN-ERP.bat.
4. After installation, open Grain ERP from the Desktop shortcut or Start Menu.

Important:
- Extract the full ZIP first before running INSTALL-GRAIN-ERP.bat.
- If you run the BAT directly from WinRAR or ZIP preview, it will try to download the missing payload automatically.

Requirement:
- Node.js LTS must be installed on the target computer.
- If Node.js is missing, the installer will stop and show the Node.js download link.

Why this installer exists:
- This USB installer does not use IExpress or a temporary XP000.TMP folder.
- It avoids the missing Install-Grain-ERP.bat error from the old EXE installer.
'@ | Set-Content -Path (Join-Path $usbFolder "README.txt") -Encoding ASCII

  if (Test-Path $usbZip) {
    Remove-Item -LiteralPath $usbZip -Force
  }
  Compress-Archive -Path (Join-Path $usbFolder "*") -DestinationPath $usbZip -Force
}
finally {
  Pop-Location
}
