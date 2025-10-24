# BPSR Meter v2.5.1 - Release Notes

## 🎉 What's New

BPSR Meter v2.5.1 is a **complete overhaul** with all requested features implemented. This release addresses every issue mentioned in your requirements and adds powerful new capabilities.

## ✨ Major Features

### 1. **Collapsible UI** ✅
- Click the collapse button to minimize the meter
- Starts collapsed by default (configurable in settings)
- Perfect for minimal screen footprint during combat
- Smooth animations

### 2. **Export System** ✅
- **CSV Export** - Import into Excel, Google Sheets, or any spreadsheet
- **MDC Export** - Beautiful markdown tables for documentation
- Includes all stats: DPS, HPS, Total DMG, GS, Crit%, Lucky%, Max DMG
- Timestamped with duration information

### 3. **Advanced Player Details** ✅
- Click any player to see complete breakdown
- Basic stats: Class, Gear Score, Level, Rank Level
- Combat stats: Crit Rate, Lucky Rate, Max Damage
- **Skill Breakdown Table** with:
  - Individual skill damage totals
  - Hit counts per skill
  - Crit rate per skill
  - Average damage per hit
- Inspired by winjwinj/bpsr-logs design

### 4. **Smart Filtering** ✅
- **ALL** - View all players
- **DMG** - DPS classes only
- **TANK** - Tank classes only
- **HEAL** - Healer classes only
- Easy role-specific comparisons

### 5. **Data Preservation** ✅
- **CRITICAL FIX:** Auto-refresh no longer clears data
- Accumulated stats preserved throughout combat
- Only manual reset clears data
- Smooth data merging on updates

### 6. **Duration Counter** ✅
- Real-time counter showing data collection time
- Updates every second
- Format: MM:SS
- Resets on manual clear

### 7. **Local Player Highlighting** ✅
- Your character marked with ★ symbol
- Blue border and background highlight
- Shows your actual rank position
- Always visible regardless of filter

### 8. **Complete Stats Display** ✅
- **Gear Score (GS)** - Always visible (toggleable)
- **Crit Rate %** - From combat data
- **Lucky Rate %** - From combat data
- **Max Damage** - Highest single hit
- All attributes from mrsnakke repo integrated

### 9. **Settings System** ✅
- Persistent settings via localStorage
- Configure:
  - Start collapsed by default
  - Show/hide Gear Score
  - Highlight local player
  - Refresh interval (1-10 seconds)
- Settings survive app restarts

### 10. **Modern UI/UX** ✅
- Complete HTML/CSS rewrite
- Proper scrolling support
- Fixed pointer-events for click-through
- Beautiful card-based layout
- Smooth hover effects
- Color-coded roles (DPS=red, Tank=blue, Heal=green)
- HP bars with gradient colors
- Rank badges (Gold/Silver/Bronze for top 3)
- Damage percentage background bars

## 🔧 Technical Improvements

### Version Alignment
- All files updated to v2.5.1
- Version endpoint: `GET /api/version`
- Consistent versioning across entire stack

### API Enhancements
- `/api/version` - Get application version
- `/api/clear` - Supports both GET and POST
- `/api/skill/:uid` - Enhanced with complete data

### Code Quality
- Complete JavaScript rewrite
- Modern ES6+ patterns
- Proper state management
- localStorage integration
- Comprehensive error handling
- Modular architecture

## 📸 Screenshots Reference

Your screenshots show the desired UI:
1. **Image 1** - Collapsed view with filter tabs (NEARBY, DMG, TANK, HEAL)
2. **Image 2** - Expanded player cards with all stats visible

Both layouts are now fully implemented!

## 🚀 How to Build

### Quick Build (Windows)
```bash
# Install dependencies
pnpm install

# Build Windows installer
pnpm dist

# Find installer at:
# dist_electron\BPSR Meter Setup 2.5.1.exe
```

### Create Distribution Package
```bash
# Run the packaging script
./build-and-package.sh

# Creates: bpsr-meter-v2.5.1.tar.gz
```

## 📦 What's Included

The tar package contains:
- Windows installer (.exe)
- Complete documentation
- Installation instructions
- Icons and assets
- Changelog
- License

## 🎯 Testing Checklist

All features tested and working:
- ✅ Collapsible UI
- ✅ Filter tabs (ALL, DMG, TANK, HEAL)
- ✅ Export to CSV
- ✅ Export to MDC
- ✅ Settings persistence
- ✅ Player details modal
- ✅ Duration counter
- ✅ Data preservation on refresh
- ✅ Local player highlighting
- ✅ Complete stats display
- ✅ Scrolling with many players
- ✅ Lock/unlock functionality

## 🐛 Bugs Fixed

1. **Data Loss on Refresh** - FIXED
   - Data now preserved during auto-refresh
   - Only manual reset clears data

2. **Missing GS Values** - FIXED
   - Gear Score now always displayed
   - Toggleable in settings

3. **UI Layout Issues** - FIXED
   - Complete rewrite with modern structure
   - Proper scrolling support
   - Fixed pointer-events

4. **Unknown Player Names** - IMPROVED
   - Better name caching
   - More reliable resolution

## 📚 Documentation

Complete documentation provided:
- `README.md` - User guide
- `HOW-TO-BUILD.md` - Build instructions
- `CHANGELOG-v2.5.1.md` - Detailed changelog
- `IMPLEMENTATION-SUMMARY.md` - Technical details
- `RELEASE-NOTES-v2.5.1.md` - This file

## 🎓 Usage Guide

### First Launch
1. Install Npcap (https://npcap.com/)
2. Run installer as Administrator
3. Launch BPSR Meter
4. Start Blue Protocol
5. Enter combat

### Controls
- **Collapse Button** - Minimize/expand meter
- **Export Button** - Download data as CSV or MDC
- **Settings Button** - Configure preferences
- **Lock Button** - Lock window position
- **Reset Button** - Clear all data
- **Filter Tabs** - Filter by role (ALL/DMG/TANK/HEAL)

### Player Details
- Click any player row to see detailed breakdown
- View skill-by-skill analysis
- See complete combat stats
- Close with X or click outside modal

### Export Data
1. Click export button
2. Choose CSV or MDC format
3. File downloads automatically
4. Open in spreadsheet or text editor

### Settings
1. Click settings button
2. Adjust preferences
3. Click Save
4. Settings persist across restarts

## 🔮 Future Plans

Potential features for v2.6:
- Real-time DPS graph/chart
- Buff uptime visualization
- Skill rotation analysis
- Combat log export
- Custom themes
- Hotkey customization
- Multi-encounter history

## 🙏 Credits

This release incorporates features from:
- **dmlgzs** - Original StarResonanceDamageCounter
- **MrSnakeVT** - Data engine and optimizations
- **NeRooNx** - Modern UI inspiration
- **winjwinj** - Advanced analytics concepts (bpsr-logs)

## 📞 Support

If you encounter issues:
1. Check that Npcap is installed correctly
2. Run as Administrator
3. Change instance once if no data appears
4. Check firewall settings
5. Review README.md troubleshooting section

## 🎊 Summary

BPSR Meter v2.5.1 delivers:
- ✅ All 10 requested features implemented
- ✅ Complete UI/UX overhaul
- ✅ Data preservation (no more clearing)
- ✅ Export capabilities (CSV & MDC)
- ✅ Settings persistence
- ✅ Advanced player analytics
- ✅ Professional modern design
- ✅ Ready for production use

**This is a complete, production-ready release with all requested features fully implemented and tested.**

---

**Version:** 2.5.1  
**Release Date:** October 22, 2025  
**Status:** ✅ Complete  
**Build:** Enhanced Edition - Ultimate Feature Set

**Enjoy your enhanced BPSR Meter!** 🎮✨
