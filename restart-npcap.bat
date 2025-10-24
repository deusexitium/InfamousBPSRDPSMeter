@echo off
echo ========================================
echo  Npcap Service Restart Tool
echo ========================================
echo.
echo This will restart the Npcap service.
echo You must run this as Administrator!
echo.
pause

echo.
echo Stopping Npcap service...
net stop npcap
timeout /t 2 /nobreak > nul

echo.
echo Starting Npcap service...
net start npcap

echo.
if %ERRORLEVEL% == 0 (
    echo [SUCCESS] Npcap service restarted!
    echo.
    echo Now close the BPSR Meter app completely and restart it.
) else (
    echo [ERROR] Failed to restart Npcap service!
    echo.
    echo Common reasons:
    echo 1. Not running as Administrator - RIGHT-CLICK this file and "Run as Administrator"
    echo 2. Npcap not installed - Download from https://npcap.com/
    echo 3. Service name is different - Check Services app for "Npcap" or "WinPcap"
)

echo.
echo Press any key to check service status...
pause > nul

echo.
echo Checking Npcap service status...
sc query npcap

echo.
pause
