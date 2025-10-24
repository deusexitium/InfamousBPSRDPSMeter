# BPSR Meter v2.5.1 - Complete Feature Update

## 🎉 Major Features Added

### 1. ✅ Modern Collapsible UI
**Problem:** UI was always expanded, taking up screen space
**Solution:**
- Added collapse/expand button in header
- Collapsible main content area
- Setting to start collapsed by default
- Smooth animations for collapse/expand

**Result:** Minimal screen footprint when collapsed, full details when needed!

### 2. ✅ Data Export System
**Problem:** No way to save or share DPS data
**Solution:**
- Export to CSV format (spreadsheet-compatible)
- Export to MDC (Markdown) format for documentation
- Includes all player stats: DPS, HPS, DMG, GS, Crit%, Lucky%, Max DMG
- Timestamped exports with duration info

**Result:** Easy data sharing and analysis!

### 3. ✅ Advanced Player Details Modal
**Problem:** Limited information about individual players
**Solution:**
- Click any player row to open detailed breakdown
- Shows basic stats (Class, GS, Level, Rank Level)
- Combat stats (Crit Rate, Lucky Rate, Max Damage, Crit/Lucky stats)
- Complete skill breakdown table with:
  - Skill ID
  - Total Damage
  - Hit Count
  - Crit Rate per skill
  - Average Damage per hit
- Sorted by damage (highest first)

**Result:** Deep dive into any player's performance!

### 4. ✅ Duration Counter
**Problem:** No way to know how long data has been collecting
**Solution:**
- Real-time duration counter in MM:SS format
- Shows elapsed time since combat started
- Updates every second
- Resets when data is cleared

**Result:** Always know your sample duration!

### 5. ✅ Smart Filter Tabs
**Problem:** Mixed roles made it hard to compare within role
**Solution:**
- **ALL** - Shows all players (default)
- **DMG** - Shows only DPS classes
- **TANK** - Shows only Tank classes  
- **HEAL** - Shows only Healer classes
- Maintains sort order within each filter
- Visual active state on selected tab

**Result:** Easy role-specific comparisons!

### 6. ✅ Data Preservation on Refresh
**Problem:** Auto-refresh was clearing all accumulated data
**Solution:**
- Data now merges instead of replacing
- Existing player data is updated, not cleared
- New players are added to the list
- Accumulated totals are preserved
- Only manual reset clears data

**Result:** No more data loss during combat!

### 7. ✅ Local Player Highlighting
**Problem:** Hard to find yourself in the list
**Solution:**
- Local player marked with ★ symbol
- Highlighted with blue border and background
- Shows your actual rank position
- Always visible regardless of filter

**Result:** Instantly see your performance!

### 8. ✅ Complete Attribute Display
**Problem:** Missing important stats (GS, Level, Crit, Lucky, Max)
**Solution:**
- Gear Score (GS) displayed for all players
- Crit Rate % shown
- Lucky Rate % shown
- Max Damage displayed
- All stats from mrsnakke repo integrated
- Toggle GS visibility in settings

**Result:** All the stats you need at a glance!

### 9. ✅ Settings System with Persistence
**Problem:** Settings reset every time app restarted
**Solution:**
- Settings modal with all preferences
- localStorage persistence (survives restarts)
- Settings include:
  - Start collapsed by default
  - Show/hide Gear Score
  - Highlight local player
  - Refresh interval (1-10 seconds)
- Save button applies and persists settings

**Result:** Your preferences are remembered!

### 10. ✅ Improved UI/UX
**Problem:** Old UI had layout issues and poor responsiveness
**Solution:**
- Complete HTML/CSS rewrite
- Modern card-based layout
- Proper scrolling support
- Fixed pointer-events for click-through
- Smooth hover effects
- Better color coding (DPS=red, Tank=blue, Heal=green)
- HP bars with color gradient
- Rank badges (Gold/Silver/Bronze for top 3)
- Damage percentage background bars

**Result:** Beautiful, functional, responsive UI!

## 🔧 Technical Improvements

### API Enhancements
- Added `/api/version` endpoint
- Fixed `/api/clear` to support both GET and POST
- Enhanced `/api/skill/:uid` with complete skill data
- Version parameter propagated through entire stack

### Code Quality
- Complete JavaScript rewrite with modern patterns
- Proper state management
- Modular function organization
- Comprehensive error handling
- localStorage integration for settings
- Clean separation of concerns

### Performance
- Efficient data merging (no unnecessary clears)
- Optimized rendering with minimal DOM updates
- Smart refresh intervals
- Proper event listener cleanup

## 📊 What's Changed

### Modified Files:
- `package.json` - Version updated to 2.5.1
- `server.js` - Version constant and propagation
- `public/index.html` - Complete rewrite with modern structure
- `public/css/style.css` - Complete rewrite with modern design
- `public/js/main.js` - Complete rewrite with all features
- `src/server/api.js` - Version endpoint and enhancements
- `src/server/dataManager.js` - Version tracking and attr exposure
- `README.md` - Updated to v2.5.1
- `HOW-TO-BUILD.md` - Updated to v2.5.1
- `build.bat` - Updated to v2.5.1

### New Files:
- `build-and-package.sh` - Automated build and tar packaging script
- `CHANGELOG-v2.5.1.md` - This file

## 🎯 Testing Checklist

- [x] Window dragging works smoothly
- [x] Collapse/expand functionality
- [x] All filter tabs work correctly
- [x] Export to CSV produces valid file
- [x] Export to MDC produces valid markdown
- [x] Settings modal opens and saves
- [x] Settings persist after restart
- [x] Player details modal shows complete data
- [x] Duration counter updates correctly
- [x] Data preserved on auto-refresh
- [x] Manual reset clears data
- [x] Local player highlighted correctly
- [x] All stats display properly (GS, Crit, Lucky, Max)
- [x] Scrolling works with many players
- [x] Lock button functionality
- [x] Close button works

## 🐛 Bug Fixes

### Fixed: Data Loss on Refresh
- **Problem:** Auto-refresh was clearing all accumulated data
- **Solution:** Implemented smart data merging
- **Result:** Data persists throughout entire combat session

### Fixed: Missing GS Values
- **Problem:** Gear Score not displaying
- **Solution:** Ensured fightPoint is included in summary and rendered
- **Result:** GS now shows for all players

### Fixed: Unknown Player Names
- **Problem:** Players showing as "unknown"
- **Solution:** Better name caching and resolution
- **Result:** Names appear more reliably

### Fixed: UI Layout Issues
- **Problem:** Mismatched HTML/CSS causing broken layout
- **Solution:** Complete rewrite with consistent structure
- **Result:** Clean, professional layout

### Fixed: Pointer Events
- **Problem:** Click-through not working properly
- **Solution:** Proper pointer-events CSS hierarchy
- **Result:** Controls clickable, content click-through when locked

## 🔜 Future Enhancements

### Planned for v2.6:
- [ ] Real-time DPS graph/chart
- [ ] Buff uptime tracking visualization
- [ ] Skill rotation analysis
- [ ] Combat log export
- [ ] Custom themes
- [ ] Hotkey customization
- [ ] Multi-encounter history
- [ ] Comparison mode (compare two players)

---

**Version:** 2.5.1  
**Release Date:** October 22, 2025  
**Compatibility:** Windows 10/11, Blue Protocol Star Resonance  
**Build:** Enhanced Edition with Complete Feature Set

## 📦 Distribution

This release includes:
- Windows installer (NSIS)
- Complete source code
- Documentation
- Build scripts
- Tar package for easy distribution

## 🙏 Acknowledgments

This version incorporates features and inspiration from:
- **dmlgzs** - Original StarResonanceDamageCounter
- **MrSnakeVT** - Data engine and bug fixes
- **NeRooNx** - Modern UI design
- **winjwinj** - Advanced analytics concepts (bpsr-logs)

## 📝 Notes

- First launch may take a few seconds to initialize
- Change instance once if data doesn't appear immediately
- Run as Administrator for proper packet capture
- Npcap must be installed with WinPcap compatibility mode
- Settings are stored in browser localStorage
- Data is preserved until manual reset or app restart

---

**Enjoy the enhanced BPSR Meter v2.5.1!**
