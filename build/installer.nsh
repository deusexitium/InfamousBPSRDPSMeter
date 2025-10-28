; Custom NSIS script for Infamous BPSR DPS Meter
; This script clears cache and old data during installation

!macro customInstall
  ; Clear Electron cache folders in AppData
  SetShellVarContext current
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Cache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\CachedData"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\GPUCache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Service Worker"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Code Cache"
  
  ; Log cleanup
  DetailPrint "Cleared application cache"
!macroend

!macro customUnInstall
  ; Clean up all user data on uninstall
  SetShellVarContext current
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter"
  
  ; Log cleanup
  DetailPrint "Removed all application data"
!macroend
