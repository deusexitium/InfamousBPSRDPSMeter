# 🎉 Infamous BPSR DPS Meter v3.0.0 - STABLE RELEASE

**Release Date:** October 26, 2025  
**Release Type:** Major Stable Release  
**Status:** ✅ Production Ready - Ready for Public Distribution

---

## 📦 Download

**Installer:** `Infamous BPSR DPS Meter-Setup-3.0.0.exe`  
**Size:** ~90MB  
**Location:** 
- `F:\DPS\Infamous BPSR DPS Meter-Setup-3.0.0.exe`
- `/development/Infamous BPSR DPS Meter-Setup-3.0.0.exe`

**GitHub Release:** https://github.com/ssalihsrz/InfamousBPSRDPSMeter/releases/tag/v3.0.0

---

## ✨ What's New

### **🎨 UI/UX Improvements**

1. **✅ Fixed White Borders**
   - Window background now matches app theme (`#1a1d29`)
   - No more white/gray areas in full or compact mode
   - Professional, polished appearance

2. **✅ Removed Scrollbars from Settings**
   - Clean, scroll-free settings interface
   - All settings visible without scrolling
   - Improved user experience

3. **✅ Optimized Performance**
   - Removed debug logging
   - Faster rendering
   - Cleaner console output

### **📚 Documentation**

1. **✅ DEVELOPMENT.md - Living Guidelines**
   - Critical rules (NEVER DO THESE)
   - Architecture overview
   - Code patterns and best practices
   - Common pitfalls guide
   - Testing checklists
   - Deployment procedures
   - Version history lessons

2. **✅ Updated All Documentation**
   - CHANGELOG.md - Complete version history
   - README.md - Updated installation guide
   - Version numbers consistent across all files

### **🐛 Bug Fixes**

All v2.99.x issues resolved:
- ✅ Data displays correctly
- ✅ Filter logic working as intended
- ✅ HTML rendering fixed
- ✅ Window resizing stable
- ✅ No ReferenceErrors
- ✅ No crashes on window close
- ✅ No missing variable declarations

---

## 🚀 Features

### **Core Features:**
- ⚔️ **Real-time DPS/HPS Tracking** - Live damage and healing meters
- 📊 **Team Totals and Rankings** - See your party's performance
- 🎯 **Training Dummy Support** - Practice and optimize your rotation
- 💾 **Session Management** - 20 auto-save + unlimited manual saves
- 🎨 **Compact Overlay Mode** - Minimal UI for in-game use
- 🔒 **Click-Through Mode** - Click through the overlay to interact with game
- 🎚️ **Opacity Slider** - 30-100% transparency adjustment
- 🌐 **VPN Compatibility** - Works with ExitLag and other VPNs
- 📱 **Multi-Instance Support** - Run multiple meters simultaneously

### **Advanced Features:**
- 🔄 **Auto-Resize** - Window adapts to content automatically
- ⏸️ **Pause/Resume** - Freeze data for analysis
- 🎭 **Role Filtering** - Filter by DPS, Tank, or Healer
- 👤 **Solo Mode** - Show only your performance
- 📈 **Skill Breakdown** - Detailed per-skill analysis
- 🎮 **Idle Detection** - 30-second inactivity threshold
- 🔔 **Toast Notifications** - Non-intrusive alerts

---

## 💻 System Requirements

**Minimum:**
- Windows 10/11 (64-bit)
- 4GB RAM
- 100MB disk space
- Npcap (WinPcap API-compatible mode)

**Recommended:**
- Windows 11 (64-bit)
- 8GB RAM
- 200MB disk space
- Stable internet connection

---

## 📥 Installation

### **Step 1: Install Npcap**
1. Download from: https://npcap.com/
2. Right-click installer → **"Run as Administrator"**
3. ✅ Check **"Install Npcap in WinPcap API-compatible Mode"**
4. Complete installation
5. **Restart computer**

### **Step 2: Install DPS Meter**
1. Right-click `Infamous BPSR DPS Meter-Setup-3.0.0.exe`
2. Select **"Run as Administrator"**
3. Follow installation wizard
4. Launch application

### **Step 3: Configure (Optional)**
1. Open Settings (⚙️ icon)
2. Adjust opacity (30-100%)
3. Enable/disable auto-clear options
4. Configure compact mode preferences

---

## ✅ Testing Results

**Tested On:**
- ✅ Fresh Windows 10 install
- ✅ Fresh Windows 11 install
- ✅ With VPN (ExitLag)
- ✅ Without VPN
- ✅ Multiple network adapters

**Combat Scenarios:**
- ✅ Training dummies (solo)
- ✅ Goblin Territory (party)
- ✅ Raids and dungeons
- ✅ Mixed DPS/Tank/Heal parties
- ✅ 2-20 player groups

**Features Verified:**
- ✅ Real-time data updates
- ✅ Accurate DPS calculations
- ✅ Session management
- ✅ Compact mode toggle
- ✅ Click-through mode
- ✅ Window dragging
- ✅ Auto-resize
- ✅ Settings persistence
- ✅ No white borders
- ✅ No scrollbars in settings

---

## 🎯 Known Issues

**None!** 

This is a stable release with all known issues resolved.

If you encounter any problems, please report them on GitHub:
https://github.com/ssalihsrz/InfamousBPSRDPSMeter/issues

---

## 📝 Upgrade Notes

### **From v2.99.x:**
1. Uninstall old version
2. Delete cache: `%APPDATA%\infamous-bpsr-dps-meter\Cache`
3. Install v3.0.0
4. Restart computer (recommended)

### **From v2.x:**
1. Export any important sessions (if needed)
2. Uninstall old version
3. Delete user data folder (optional): `%APPDATA%\infamous-bpsr-dps-meter`
4. Install v3.0.0
5. Restart computer

---

## 🔧 Technical Details

### **What Changed in v3.0.0:**

**Electron (electron-main.js):**
```javascript
backgroundColor: '#1a1d29'  // Match app background
```

**CSS (style.css):**
```css
body {
    background: var(--bg-dark);  /* Eliminate white borders */
}

.settings-panel {
    max-height: none;       /* No height limit */
    overflow-y: visible;    /* No scrollbars */
}
```

**JavaScript (main.js):**
- Removed all debug `console.log()` statements
- Kept error logging for troubleshooting
- Optimized rendering performance

**Version Updates:**
- package.json → v3.0.0
- public/index.html → v3.0.0 (5 locations)
- public/js/main.js → v3.0.0 (2 locations)
- server.js → v3.0.0

---

## 📚 For Developers

See **DEVELOPMENT.md** for:
- Critical rules and patterns
- Architecture overview
- Common pitfalls
- Testing procedures
- Deployment guidelines

**Key Lessons from v2.99.x:**
1. Trust backend filtering - don't re-filter in frontend
2. Always declare variables before use
3. Never use placeholder comments as code
4. Keep resize functions synchronous
5. Test incrementally, not in bulk

---

## 🙏 Credits

**Original Project:**
- dmlgzs - StarResonanceDamageCounter (packet parsing foundation)

**Fork Base:**
- NeRooNx - BPSR-Meter (modern UI design)

**Enhanced Edition:**
- Backend improvements - Packet parsing, filtering
- Frontend improvements - UI/UX, rendering, auto-resize
- Documentation - Development guidelines, testing procedures
- Community - Testing, bug reports, feedback

---

## 📞 Support

**Issues:** https://github.com/ssalihsrz/InfamousBPSRDPSMeter/issues  
**Discussions:** https://github.com/ssalihsrz/InfamousBPSRDPSMeter/discussions  
**Documentation:** See README.md and DEVELOPMENT.md

---

## 📜 License

AGPL-3.0 License - See LICENSE file for details

---

## 🎊 Conclusion

**v3.0.0 represents a major milestone** - the first production-ready stable release of Infamous BPSR DPS Meter. After extensive bug fixing, testing, and refinement through versions 2.99.5-2.99.8, this release is:

- ✅ **Stable** - No known bugs or crashes
- ✅ **Professional** - Clean UI without white borders or scrollbars
- ✅ **Documented** - Comprehensive guides for users and developers
- ✅ **Tested** - Verified across multiple scenarios and configurations
- ✅ **Ready** - Suitable for public distribution and community use

**Thank you for your patience during the development process. We hope you enjoy using Infamous BPSR DPS Meter v3.0.0!** 🎉

---

**Build Info:**
- Commit: 75db2e0
- Build Date: October 26, 2025
- Builder: electron-builder
- Platform: Windows (x64)
- Node: v22.15.0
- Electron: v38.3.0
