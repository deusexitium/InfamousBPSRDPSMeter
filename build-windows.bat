@echo off
REM ========================================================
REM  BPSR Meter v2.8.1 - Windows Build Script
REM  Run this on Windows (NOT in WSL!)
REM ========================================================

cls
echo.
echo ========================================================
echo  BPSR Meter v2.8.1 - Windows Build
echo ========================================================
echo.
echo  This script will:
echo  1. Install dependencies
echo  2. Build Windows installer
echo  3. Create distributable .exe
echo.
echo  Requirements:
echo  - Windows 10/11 (64-bit)
echo  - Node.js 22.15.0+
echo  - pnpm installed
echo  - Run as Administrator (recommended)
echo.
echo ========================================================
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pnpm is not installed!
    echo.
    echo Please install pnpm first:
    echo   npm install -g pnpm
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
node --version
echo.

echo [2/4] Installing dependencies...
echo This may take a few minutes...
echo.
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo.
    echo Troubleshooting:
    echo 1. Run as Administrator
    echo 2. Install Visual Studio Build Tools
    echo 3. Check internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo  Dependencies installed successfully!
echo ========================================================
echo.

echo [3/4] Building Windows installer...
echo This will take 5-10 minutes...
echo.
call pnpm dist
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo Troubleshooting:
    echo 1. Check dist_electron folder permissions
    echo 2. Disable antivirus temporarily
    echo 3. Run as Administrator
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo  Build completed successfully!
echo ========================================================
echo.

echo [4/4] Locating installer...
echo.

if exist "dist_electron\BPSR Meter Setup 2.8.1.exe" (
    echo [SUCCESS] Installer created successfully!
    echo.
    echo Location: dist_electron\BPSR Meter Setup 2.8.1.exe
    echo.
    
    REM Get file size
    for %%A in ("dist_electron\BPSR Meter Setup 2.8.1.exe") do (
        set size=%%~zA
    )
    echo File size: %size% bytes
    echo.
    
    echo ========================================================
    echo  READY TO DISTRIBUTE!
    echo ========================================================
    echo.
    echo You can now:
    echo 1. Install on this PC
    echo 2. Share with others
    echo 3. Upload to file hosting
    echo.
    
    REM Ask if user wants to open the folder
    echo.
    set /p OPEN="Open dist_electron folder? (Y/N): "
    if /i "%OPEN%"=="Y" (
        explorer dist_electron
    )
) else (
    echo [WARNING] Installer not found!
    echo.
    echo Expected: dist_electron\BPSR Meter Setup 2.8.1.exe
    echo.
    echo Check the dist_electron folder manually.
    echo.
)

echo.
echo ========================================================
echo  Build script completed!
echo ========================================================
echo.
pause
