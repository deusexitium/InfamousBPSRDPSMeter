; Custom NSIS script for Infamous BPSR DPS Meter
; This script clears ONLY browser cache during installation
; USER DATA IS PRESERVED: sessions/, player_map.json, settings.json, etc.

!macro customInstall
  ; Clear ONLY Electron browser cache folders (NOT user data!)
  ; This fixes stale JS/CSS without deleting your sessions or settings
  SetShellVarContext current
  
  ; Clear browser cache ONLY - preserve user data, logs, sessions, player mappings
  ; CRITICAL: DO NOT DELETE THESE FILES/FOLDERS
  ; - user_data\sessions\* (DPS sessions)
  ; - user_data\player_db.json (player name mappings)
  ; - user_data\logs\* (application logs)
  ; - user_data\settings.json (user settings)
  ; Only 7-day cleanup happens at runtime, NOT during install
  
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
  ; Only on UNINSTALL, remove all app data (including user data)
  SetShellVarContext current
  RMDir /r "$APPDATA\infamous-bpsr-dps-meter"
  
  DetailPrint "Removed all application data"
!macroend
