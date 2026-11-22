@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 desktop_start.py
) else (
  python desktop_start.py
)
if errorlevel 1 (
  echo Python 3.9+ ve ilk kurulum icin Node.js LTS gereklidir: https://www.python.org/downloads/windows/
  pause
)
