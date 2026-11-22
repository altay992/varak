@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 cevirmen.py
) else (
  python cevirmen.py
)
if errorlevel 1 (
  echo Python 3.9+ ve Tcl/Tk gereklidir: https://www.python.org/downloads/windows/
  pause
)
