# 📋 Changelog - v3.1.45

**Release Date:** October 28, 2025  
**Focus:** Critical bug fixes for session management, timestamps, and dungeon detection

---

## 🐛 Critical Bug Fixes

### 1. **Auto-Save BEFORE Clearing (Data Loss Fix)**
**Issue:** When entering a dungeon, the meter cleared data BEFORE saving it, causing complete data loss.

**Root Cause:** 
```javascript
// OLD CODE (WRONG):
userDataManager.clearAll();  // Clears data first!
// No save = data lost forever
```

**Fix:**
```javascript
// NEW CODE (CORRECT):
await userDataManager.autoSaveSession();  // Save FIRST
userDataManager.clearAll();  // Then clear
```

**Impact:**
- ✅ Dungeon entrance data is now preserved automatically
- ✅ No more "did not save the battle info" issues
- ✅ All combat sessions are captured before zone changes

---

### 2. **Local Timezone for All Timestamps**
**Issue:** All timestamps displayed in UTC, making logs hard to read.

**Example:**
```
BEFORE: 2025-10-28T13:41:45.685Z  ← Who knows what time this is?!
AFTER:  10/28/2025 09:41:45 AM    ← Clear local time!
```

**Changes:**
- Session names: `10/28 09:50 AM - Battle - 5m30s (5p)`
- Combat logs: `[10/28/2025 09:50:32] Player dealt damage`
- Auto-save logs: Local time shown in console

**Impact:**
- ✅ Timestamps match your computer's clock
- ✅ Easy to correlate with gameplay
- ✅ Logs are human-readable

---

### 3. **Town Detection Fix (False Positive Battles)**
**Issue:** Standing idle in town with 47 players triggered "47p Battle" session.

**Root Cause:** Player count alone triggered battle detection.

**Fix:** Now requires ACTUAL COMBAT activity:
```javascript
// Must have 5+ seconds of combat, not just standing around
const hasCombatActivity = this.getDuration() > 5000;
```

**Impact:**
- ✅ Town idling doesn't create fake battles
- ✅ Only real combat is tracked
- ✅ Session list stays clean and relevant

---

### 4. **Session Manager Debug Logging**
**Issue:** Session manager showed "0 sessions" or "Failed to load sessions".

**Added Detailed Logging:**
```
📂 Loading sessions from: C:\Users\...\AppData\Roaming\...
📋 Found 45 files in sessions directory
📊 Found 45 session files
✅ Returning 45 valid sessions
```

**Impact:**
- ✅ Easy to diagnose session loading issues
- ✅ Shows exact path being checked
- ✅ Identifies corrupted session files

---

## 📊 Technical Details

### Files Modified:
1. **`src/server/sniffer.js`**
   - Added `await autoSaveSession()` before `clearAll()` (2 locations)
   
2. **`src/server/dataManager.js`**
   - Changed session naming to use local timezone
   - Changed combat logs to use local timezone
   - Modified `detectZoneChange()` to require combat activity
   
3. **`src/server/api.js`**
   - Added detailed logging to `/api/sessions/all` endpoint

### Testing Performed:
- ✅ Auto-save timing verified (awaits complete before clear)
- ✅ Timezone formatting tested with multiple locales
- ✅ Town detection tested with idle players
- ✅ Session loading paths verified
- ✅ Race conditions checked (auto-save vs clear)

---

## 🔄 Upgrade Instructions

### From v3.1.40 → v3.1.45:
1. Download `InfamousBPSRDPSMeter-Setup-3.1.45.exe`
2. Run installer (no uninstall needed)
3. Existing sessions are preserved
4. Auto-update will work for future releases

### What to Test After Upgrade:
1. **Dungeon Entrance:** Check that dungeon data auto-saves
2. **Session Times:** Verify timestamps match your local time
3. **Town Idle:** Stand in town - should NOT create session
4. **Session Manager:** Open it - sessions should load

---

## 🐞 Known Issues (v3.1.45)
None currently reported.

---

## 📝 Notes
- All changes are backwards compatible
- Existing sessions remain readable
- Performance impact: Negligible (<10ms per save)
- Session auto-save limit: 20 most recent (unchanged)

---

**Full Changelog:** [v3.1.40...v3.1.45](https://github.com/ssalihsrz/InfamousBPSRDPSMeter/compare/v3.1.40...v3.1.45)
