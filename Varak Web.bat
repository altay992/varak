@echo off
rem Varak web arayuzu: tarayicida acilir. Yalnizca Python 3.9+ gerekir.
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
where py >nul 2>nul
if not errorlevel 1 (
  py -3 server\server.py
) else (
  python server\server.py
)
if errorlevel 1 (
  echo Python 3.9+ gereklidir: https://www.python.org/downloads/windows/
  pause
)
