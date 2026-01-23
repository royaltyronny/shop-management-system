@echo off
REM Sunrise Shop - Electron Application Launcher
REM This script launches the built Sunrise Shop application

echo.
echo ========================================
echo   SUNRISE SHOP - Point of Sale System
echo ========================================
echo.
echo Starting application...
echo.

REM Navigate to the application directory
cd /d "%~dp0"

REM Run the executable
start "" "dist\win-unpacked\shop-management-app.exe"

REM Wait a moment for the app to start
timeout /t 2 /nobreak

echo.
echo Application launched!
echo.
echo Default Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo ========================================
echo.

exit /b
