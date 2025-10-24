# Missing Features Analysis - v2.6.0

## ✅ COMPLETED Features

1. **Local player at top** - Shows above rankings with rank number
2. **Inline expansion** - No popups, click to expand details
3. **Top 5 skills** - Shows skill breakdown inline
4. **Max DPS tracking** - AVG DPS, Current DPS, Max DPS
5. **Haste stat** - Added to backend and displays in details
6. **Copy to clipboard** - Works with Electron
7. **Export CSV/Markdown** - Working
8. **Player name database** - Persists UID→Name mapping
9. **Filter tabs** - ALL, DPS, TANK, HEAL
10. **Data accumulation** - Frontend merges player data instead of replacing

## ❌ MISSING/INCOMPLETE Features

### Critical Missing:

1. **Compact/Detailed View Toggle**
   - Status: NOT IMPLEMENTED
   - Required: Button to switch between compact (minimal stats) and detailed (all stats)
   - Impact: HIGH

2. **Zone/Map/Instance Change Detection**
   - Status: NOT IMPLEMENTED in frontend
   - Backend has `autoClearOnServerChange` but only for server changes
   - Need to detect:
     - Zone changes (town → field → dungeon)
     - Map changes within same zone
     - Instance entry/exit
     - Boss encounter start/end
   - Impact: CRITICAL

3. **Smart Reset Logic**
   - Status: PARTIALLY IMPLEMENTED
   - Backend clears on server change
   - Frontend has manual reset only
   - Need automatic reset triggers:
     - Channel change
     - Map/zone change
     - Dungeon instance change
     - Boss encounter end
   - Impact: CRITICAL

4. **Mastery Stat**
   - Status: NOT IMPLEMENTED
   - Added Haste but forgot Mastery
   - Impact: MEDIUM

5. **Auto-update Names**
   - Status: PARTIALLY WORKING
   - Player database saves names
   - BUT: Need to verify names update automatically when encountered
   - Impact: MEDIUM

6. **Solo/Local Mode Toggle**
   - Status: NOT IMPLEMENTED
   - Backend has `getSoloUserData()` function
   - Frontend doesn't use it
   - Impact: MEDIUM

7. **Instance/Dungeon Detection Display**
   - Status: NOT IMPLEMENTED
   - No UI indicator showing current instance/dungeon
   - No detection of dungeon vs open world
   - Impact: LOW

8. **Boss Fight Duration Tracking**
   - Status: NOT IMPLEMENTED
   - User mentioned: "If you're able to determine boss fights and have a duration snapshot for each fight duration"
   - Impact: LOW (user said "if you cant thats fine to ignore for now")

### Verification Needed:

1. **Filtering/Sorting**
   - Need to verify ALL, DPS, TANK, HEAL filters work correctly
   - Need to verify sort by damage works

2. **Auto-update behavior**
   - Verify data accumulates correctly across refreshes
   - Verify doesn't reset unless conditions met

## 🔧 Implementation Plan

### Priority 1 (Critical):

1. Add Compact/Detailed view toggle
2. Implement zone/map/instance change detection
3. Add smart reset logic based on game state changes
4. Fix Mastery stat tracking

### Priority 2 (High):

1. Add Solo mode toggle
2. Verify and fix filtering/sorting if broken
3. Ensure auto-name updates work

### Priority 3 (Medium):

1. Add instance/dungeon detection display
2. Add boss fight tracking (if possible)

## 📝 Technical Notes

### For Zone/Map Detection:

The winjwinj repo uses Rust and likely hooks into game memory or specific packet types. Since this is a packet sniffer, we need to:

1. Identify packet types that indicate zone/map changes
2. Add handlers in `algo/packet.js`
3. Emit events to frontend
4. Frontend listens and triggers reset

### For Compact/Detailed Toggle:

Simple implementation:
1. Add button to header
2. State variable: `VIEW_MODE = 'compact' | 'detailed'`
3. In compact: Show only essential stats (Name, DPS, Total DMG, % DMG)
4. In detailed: Show all stats currently displayed

### For Smart Reset:

Backend already has infrastructure:
- `userDataManager.clearAll()`
- `autoClearOnServerChange` setting

Need to add:
- Zone change detection
- Map change detection  
- Instance change detection
- Emit to frontend so UI knows to clear STATE.players

## ⚠️ Current Issues

1. **Names still not showing** - Need to debug why player.name is undefined
2. **Skill data "undefined"** - API returns data but skills show as undefined
3. **No visual feedback** on data accumulation vs reset

## 🎯 User's Core Request

> "ensure you've done it all according to my wants, especially the filtering/sorting, auto update/ auto update names, accumulate data unless specific requirements are met to reset, like new zone, new map, new boss, new instance etc"

Translation:
- Filtering/sorting: VERIFY IT WORKS
- Auto-update: DATA ACCUMULATES automatically
- Auto-update names: NAMES REFRESH when players encountered
- Smart reset: ONLY reset on zone/map/boss/instance changes
- Keep data otherwise: ACCUMULATE EVERYTHING ELSE

## 🔍 Verification Checklist

Before claiming "done":
- [ ] Compact/detailed toggle works
- [ ] Zone change resets data
- [ ] Map change resets data  
- [ ] Instance change resets data
- [ ] Data accumulates between resets
- [ ] Names update automatically
- [ ] Filtering works (ALL/DPS/TANK/HEAL)
- [ ] Sorting works (by damage)
- [ ] Mastery stat shows
- [ ] Solo mode works
- [ ] No popups (all inline)
- [ ] Copy to clipboard works
- [ ] Exports work
