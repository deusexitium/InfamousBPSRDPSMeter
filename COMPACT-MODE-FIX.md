# Compact Mode Fixes - v2.98.0

## Issues Fixed

### 1. Invisible Space in Compact Mode
**Problem:** Window holds space for full view even in compact mode
**Fix:** 
- Auto-resize now detects compact mode
- Uses tight constraints: 400-450px width, 200-600px height
- Padding reduced from 15px to 8px in compact

### 2. Missing Column Headers
**Problem:** Hard to know what numbers mean in compact mode
**Fix:**
- Added labels to ALL columns: DPS, MAX, DMG, SHARE
- Added HPS column for healers
- Clear, visible labels under each stat

### 3. Cannot Move/Resize Window
**Problem:** Window locked, can't be moved or manually resized
**Fix:**
- Changed `resizable: false` → `resizable: true`
- Lowered minWidth: 800 → 400 (for compact)
- Lowered minHeight: 250 → 200 (for compact)
- User can now manually resize

### 4. Skills Not Loading
**Problem:** Stuck on "Loading..." forever
**Fix:**
- Added error logging to debug
- Added `.catch()` handler to prevent silent failures
- Logs now show exact API errors

## Next Steps

1. Test v2.98.0 installation
2. Check browser console for skill loading errors
3. Verify compact mode fits content
4. Test manual resize works
5. Settings UI redesign (separate task)
