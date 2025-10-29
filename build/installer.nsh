; Custom NSIS script for Infamous BPSR DPS Meter
; This script clears ONLY browser cache during installation
; USER DATA IS PRESERVED: sessions/, player_map.json, settings.json, etc.

!macro customInstall
  ; Clear ONLY Electron browser cache folders (NOT user data!)
  ; This fixes stale JS/CSS without deleting your sessions or settings
  SetShellVarContext current
  
  ; Clear browser cache ONLY - preserve user data, logs, sessions, player mappings
  ; CRITICAL: DO NOT DELETE THESE FILES/FOLDERS
  ; - sessions\* (DPS sessions) - PRESERVED
  ; - player_map.json (player name mappings) - PRESERVED
  ; - iniciar_log.txt (application log) - PRESERVED
  ; - settings.json (user settings) - PRESERVED
  ; - skill_translations.json, talent_table.json, conflicts.json - PRESERVED
  ; Only Electron cache is removed during install
  
  ; Electron browser cache folders (safe to delete)
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Cache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\GPUCache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Code Cache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\DawnGraphiteCache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\DawnWebGPUCache"
  
  ; PRESERVE LOGS - Do NOT delete iniciar_log.txt or any log files
  ; User needs these for debugging
  
  ; EXPLICITLY PRESERVE USER DATA (DO NOT DELETE):
  ; - sessions/ (your saved DPS charts)
  ; - player_map.json (saved player names)
  ; - settings.json (your settings)
  ; - skill_translations.json
  ; - talent_table.json
  ; - conflicts.json
  
  DetailPrint "Cleared browser cache (sessions and settings preserved)"
!macroend

!macro customUnInstall
  ; DISABLED: Do NOT delete user data on uninstall per user request
  ; Users should be able to upgrade without losing:
  ; - settings.json (user settings)
  ; - player_map.json (player name cache)
  ; - sessions/ (saved DPS charts)
  
  ; Only remove Electron cache folders (safe to delete)
  SetShellVarContext current
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Cache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\GPUCache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\Code Cache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\DawnGraphiteCache"
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter\DawnWebGPUCache"
  
  DetailPrint "Removed browser cache (user data preserved)"
!macroend
