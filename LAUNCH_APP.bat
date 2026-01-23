@echo off
REM Launch the Sunrise Shop Management App
REM This is the executable built with npm run build:win

cd /d "%~dp0"
start "" "dist\win-unpacked\shop-management-app.exe"
