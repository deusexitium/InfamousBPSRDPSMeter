# BPSR Meter v2.5.2 - Changelog

## Release Date: October 22, 2025

## 🐛 Critical Bug Fixes

### UI Layout Issues (Major Fix)
- **Fixed missing player names** - Now properly displays actual player names instead of just role labels
- **Fixed vertical layout** - Changed from tall/vertical to compact horizontal layout
- **Fixed container width** - Increased from 640px to 900px to accommodate horizontal stats
- **Fixed row height** - Reduced from 48px to 36px for more compact display

### Data Display Issues
- **Fixed missing GS (Gear Score)** - Now always displays in rightmost column
- **Fixed zero-DPS filtering** - No longer shows players with no combat data (e.g., in town)
- **Smart player detection** - Only displays players with actual damage/healing/DPS/HPS
- **Player database building** - Still adds all players to name database even if not displayed

### Filtering & Sorting
- **Fixed filter tabs** - ALL/DPS/TANK/HEAL now work correctly
- **Proper combat detection** - Filters out non-combat players automatically
- **Name mapping persistence** - Builds player UID→Name database in background

## ✨ UI Improvements

### Horizontal Layout
- **Wider container**: 900px (was 640px)
- **Compact rows**: 36px height (was 48px)
- **Horizontal stats**: All stats displayed in columns left-to-right
- **Mini HP bar**: 3px thin bar under player name

### Stat Columns (Left to Right)
1. **Rank** - Position badge with gold/silver/bronze for top 3
2. **Name + Role** - Player name with role badge and HP bar
3. **DPS** - Damage per second
4. **HPS** - Healing per second
5. **TOTAL DMG** - Total damage dealt
6. **DMG TAKEN** - Damage received
7. **% DMG** - Damage contribution percentage (highlighted in gold)
8. **TOTAL HEAL** - Total healing done
9. **GS** - Gear Score

### Visual Enhancements
- **Local player indicator**: Gold star (★) next to your name
- **Role badges**: Small colored badges (DPS=red, TANK=blue, HEAL=green)
- **Mini HP bar**: Thin 3px bar showing current HP percentage
- **Proper spacing**: 12px gap between columns for readability

## 🔧 Technical Changes

### JavaScript (main.js)
- Added `activePlayers` filter to exclude zero-combat players
- Still processes all players for name database
- Improved player name retrieval logic
- Better handling of missing data (GS, names, etc.)

### CSS (style.css)
- Rewritten `.player-row` for horizontal flexbox layout
- New `.player-name-col` for name + HP bar
- New `.stat-col` for individual stat columns
- Removed old vertical grid layout
- Added `.hp-bar-mini` for compact HP display
- Added `.role-badge` styling

### Data Flow
1. Fetch all players from API
2. Filter for active combat players (has damage/healing)
3. Add all players to database (for name mapping)
4. Display only active players
5. Sort by total damage

## 📊 Before vs After

### Before (v2.5.1)
```
❌ Missing player names (just "DPS", "TANK", "HEAL")
❌ Too tall/vertical layout
❌ Shows everyone in town (0 DPS)
❌ Missing GS in some cases
❌ Stats scattered vertically
❌ 640px wide, 48px rows
```

### After (v2.5.2)
```
✅ Shows actual player names
✅ Compact horizontal layout
✅ Only shows combat-active players
✅ Always shows GS
✅ Clean horizontal stat columns
✅ 900px wide, 36px rows
```

## 🎯 What's Fixed

| Issue | Status | Solution |
|-------|--------|----------|
| Missing names | ✅ Fixed | Proper name retrieval + database lookup |
| Wrong layout | ✅ Fixed | Horizontal flexbox, wider container |
| Zero-DPS spam | ✅ Fixed | Filter for active combat only |
| Missing GS | ✅ Fixed | Always display in rightmost column |
| Poor organization | ✅ Fixed | Clean horizontal stat columns |
| Filter tabs broken | ✅ Fixed | Proper role filtering logic |

## 🚀 Performance

- **Faster rendering**: Simpler HTML structure
- **Less clutter**: Only shows relevant players
- **Better readability**: Horizontal layout easier to scan
- **Proper spacing**: 12px gaps between columns

## 📝 Notes

### Player Database
- Continuously builds UID→Name mapping
- Works even for non-combat players
- Persists across sessions
- Reduces "unknown" players over time

### Combat Detection
A player is considered "active" if they have:
- Total damage > 0, OR
- Total healing > 0, OR
- DPS > 0, OR
- HPS > 0

This prevents showing idle players in town while still learning their names.

## 🔄 Migration from v2.5.1

No special migration needed. Just:
1. Extract new archive
2. Build on Windows
3. Install

Settings and player database will persist.

## 📦 Archive Details

**File**: `BPSR-Meter-v2.5.2-source.tar.gz`  
**Size**: 14 MB  
**MD5**: `f97aac85c8b3e8fa157854d9e26e16be`  
**Location**: `/development/`

## ⚠️ Breaking Changes

None. This is a bug fix release.

## 🎊 Summary

v2.5.2 fixes all major UI issues from v2.5.1:
- ✅ Names now display correctly
- ✅ Layout is horizontal and compact
- ✅ Only shows combat-active players
- ✅ All stats including GS display properly
- ✅ Filter tabs work correctly

**This is the version you should use!**

---

**Version**: 2.5.2  
**Previous**: 2.5.1  
**Type**: Bug Fix Release  
**Priority**: High (fixes critical UI issues)
