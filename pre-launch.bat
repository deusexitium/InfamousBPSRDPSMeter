@echo off
REM BPSR Meter Pre-Launch Dependency Checker
REM This runs before the main application to verify dependencies

title BPSR Meter - Dependency Check

REM Check for Npcap
echo Checking for Npcap...
if exist "%ProgramFiles%\Npcap\wpcap.dll" (
    echo [OK] Npcap is installed
) else if exist "%windir%\System32\Npcap\wpcap.dll" (
    echo [OK] Npcap is installed
) else (
    echo.
    echo [ERROR] Npcap is NOT installed!
    echo.
    echo BPSR Meter requires Npcap to capture network packets.
    echo.
    echo Download from: https://npcap.com/
    echo.
    echo Installation steps:
    echo 1. Download Npcap installer
    echo 2. Run as Administrator
    echo 3. Enable "WinPcap API-compatible Mode"
    echo 4. Enable "Support loopback traffic"
    echo.
    set /p OPEN_URL="Open download page in browser? (Y/N): "
    if /i "%OPEN_URL%"=="Y" start https://npcap.com/#download
    echo.
    echo Install Npcap and try again.
    pause
    exit /b 1
)

REM Check if Npcap service is running
sc query npcap | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Npcap service is not running!
    echo Attempting to start...
    net start npcap >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Npcap service started
    ) else (
        echo [ERROR] Could not start Npcap service
        echo Please run as Administrator or use restart-npcap.bat
    )
)

echo.
echo [OK] All checks passed
echo Starting BPSR Meter...
echo.

REM Continue to main application
exit /b 0
