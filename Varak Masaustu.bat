@echo off
rem Varak masaustu uygulamasi (Electron). Python 3.9+ ve Node.js LTS gerekir.
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js LTS gereklidir: https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules (
  echo Ilk kurulum yapiliyor, internet baglantisini acik tutun...
  call npm install --no-audit --no-fund
)
call npm run desktop
if errorlevel 1 pause
