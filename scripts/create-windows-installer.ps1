Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$release = Join-Path $root "release"
$payload = Join-Path $release "installer-payload"
$portableZip = Join-Path $release "GrainERP-Windows-Portable.zip"
$installerExe = Join-Path $release "GrainERP-Windows-Installer.exe"
$sed = Join-Path $release "grain-erp-installer.sed"

Push-Location $root
try {
  powershell -ExecutionPolicy Bypass -File scripts\make-windows-portable.ps1

  if (Test-Path $payload) {
    Remove-Item -LiteralPath $payload -Recurse -Force
  }
  New-Item -ItemType Directory -Path $payload | Out-Null
  Copy-Item -LiteralPath $portableZip -Destination (Join-Path $payload "GrainERP-Windows-Portable.zip") -Force

  @'
@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run Grain ERP.
  echo Install Node.js from https://nodejs.org and run this installer again.
  pause
  exit /b 1
)

set "INSTALL_DIR=%LOCALAPPDATA%\Grain ERP"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%~dp0GrainERP-Windows-Portable.zip' -DestinationPath '%INSTALL_DIR%' -Force"

set "APP_DIR=%INSTALL_DIR%\GrainERP-Windows-Portable"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Grain ERP.lnk'); $s.TargetPath='%APP_DIR%\Start-Grain-ERP.bat'; $s.WorkingDirectory='%APP_DIR%'; $s.Save()"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$start=[Environment]::GetFolderPath('StartMenu') + '\Programs\Grain ERP.lnk'; $ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut($start); $s.TargetPath='%APP_DIR%\Start-Grain-ERP.bat'; $s.WorkingDirectory='%APP_DIR%'; $s.Save()"

echo Grain ERP installed successfully.
echo Open it from the Desktop shortcut or Start Menu.
pause
'@ | Set-Content -Path (Join-Path $payload "Install-Grain-ERP.bat") -Encoding ASCII

  @'
@echo off
setlocal
set "INSTALL_DIR=%LOCALAPPDATA%\Grain ERP"
if exist "%USERPROFILE%\Desktop\Grain ERP.lnk" del "%USERPROFILE%\Desktop\Grain ERP.lnk"
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Grain ERP.lnk" del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Grain ERP.lnk"
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"
echo Grain ERP removed.
pause
'@ | Set-Content -Path (Join-Path $payload "Uninstall-Grain-ERP.bat") -Encoding ASCII

  @"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=Grain ERP installer finished.
TargetName=$installerExe
FriendlyName=Grain ERP Installer
AppLaunched=Install-Grain-ERP.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
SourceFiles=SourceFiles
[Strings]
FILE0="GrainERP-Windows-Portable.zip"
FILE1="Install-Grain-ERP.bat"
FILE2="Uninstall-Grain-ERP.bat"
[SourceFiles]
SourceFiles0=$payload
[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=
"@ | Set-Content -Path $sed -Encoding ASCII

  iexpress.exe /N /Q $sed
}
finally {
  Pop-Location
}
