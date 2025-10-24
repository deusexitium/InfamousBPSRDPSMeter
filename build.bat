@echo off
REM BPSR Meter Enhanced Edition v2.5.1 - Build Script

cls
echo.
echo ========================================================
echo  BPSR Meter Enhanced Edition v2.5.1
echo  Complete Feature Build System
echo ========================================================
echo.

if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the BPSR-Meter directory
    pause
    exit /b 1
)

echo [OK] Running in project directory
echo.

echo [Step 1/4] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo [OK] Node.js found
echo.

echo [Step 2/4] Checking pnpm...
where pnpm >nul 2>&1
if errorlevel 1 (
    echo Installing pnpm...
    call npm install -g pnpm
    if errorlevel 1 (
        echo ERROR: Failed to install pnpm
        pause
        exit /b 1
    )
)
echo [OK] pnpm ready
echo.

echo [Step 3/4] Installing dependencies...
echo This may take 2-5 minutes...
echo.

call pnpm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Run as Administrator and try again
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed
echo.

echo [Step 4/4] Building Windows installer...
echo This may take 3-10 minutes...
echo.

call pnpm dist
if errorlevel 1 (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ========================================================
echo  BUILD SUCCESSFUL!
echo ========================================================
echo.

if exist "dist_electron" (
    echo Installer created:
    dir /b dist_electron\*.exe
    echo.
    echo Location: %CD%\dist_electron\
)

echo.
echo NEXT STEPS:
echo 1. Install Npcap from https://npcap.com/
echo 2. Run the installer from dist_electron\ as Administrator
echo 3. Launch BPSR Meter from Start Menu
echo 4. Start Blue Protocol and enjoy!
echo.
pause
