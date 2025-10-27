# 🎯 v3.1.24 - STABLE PRODUCTION RELEASE

**The Ultimate Blue Protocol Combat Tracker** - Complete & Stable

---

## 🚀 What's New in v3.1.24

### ✨ Intelligent Session Naming (NEW!)
**No more "junk" or "untranslated" session names!**

Auto-saved sessions now have **meaningful, descriptive names**:

**Examples:**
- `Solo - 2m30s [14:25]` → Solo run, 2min 30sec, at 2:25 PM
- `4P Party - 5min [16:42]` → 4-player party dungeon, 5 minutes
- `8P Raid - 15min [20:15]` → 8-player raid, 15 minutes
- `12P Battle - 8min [18:30]` → 12-player battle, 8 minutes

**Benefits:**
- ✅ Instantly identify solo vs party vs raid battles
- ✅ See battle duration at a glance
- ✅ Know what time each battle happened
- ✅ Easy to find specific sessions in the list
- ✅ No more confusing generic names

---

## 🔧 Critical Fixes (v3.1.23-24)

### ✅ Auto-Save Sessions Fixed (v3.1.23)
- **FIXED:** Auto-saved sessions were missing or had wrong data
- **FIXED:** Backend was ignoring player data sent from frontend
- **RESULT:** Sessions now save correctly with complete battle data

### ✅ Skill Breakdown in Saved Sessions (v3.1.21)
- **FIXED:** "Skill data unavailable" when viewing historical battles
- **FIXED:** Auto-save now includes complete skill breakdown
- **RESULT:** All saved sessions show full skill details

### ✅ Live Data Resume After Viewing Sessions (v3.1.22)
- **FIXED:** Stale/missing players after returning to "Current Session"
- **FIXED:** Clear all session state when switching to live mode
- **RESULT:** Clean transition between saved sessions and live data

### ✅ Settings Sync Issue (v3.1.20)
- **FIXED:** "Keep After Dungeon" setting not being honored
- **FIXED:** Frontend now syncs settings to backend in real-time
- **RESULT:** Auto-clear on zone change works as configured

### ✅ Settings Modal Display (v3.1.19)
- **FIXED:** Modal shrinking on subsequent opens
- **RESULT:** Full-screen modal maintained in all modes

### ✅ Column Visibility Controls (v3.1.18)
- **FIXED:** All column visibility checkboxes now work
- **FIXED:** "Avg DPS" and "Gear Score" labels corrected
- **RESULT:** Full control over displayed columns

---

## 📦 Installation

### Requirements
- **Windows 10/11** (64-bit)
- **Npcap** installed with WinPcap API compatibility mode
- **Administrator privileges** for packet capture

### Quick Install
1. Download `Infamous BPSR DPS Meter-Setup-3.1.24.exe`
2. Right-click → "Run as Administrator"
3. Follow installation wizard
4. Launch and enjoy!

---

## 🎮 Features

- **Real-Time DPS/HPS Tracking** - Live combat analysis
- **Intelligent Session Management** - Auto-save with meaningful names
- **Skill Breakdown** - Top 10 skills per player with crit rates
- **Column Customization** - Show/hide columns in compact mode
- **VPN Compatible** - Works with ExitLag and other VPNs
- **Auto-Clear Options** - Configurable zone change behavior
- **Name Memory** - Remembers player names across sessions
- **Click-Through Mode** - Overlay that doesn't block game
- **Compact Mode** - Minimal in-game overlay

---

## ⚙️ Settings Highlights

### Auto-Clear on Zone Change
- **OFF:** Data persists across zones
- **ON + Keep After Dungeon OFF:** Clear immediately on zone change
- **ON + Keep After Dungeon ON:** Clear when new combat starts in new zone

### Column Visibility (Compact Mode)
- Current DPS
- Max DPS
- Avg DPS
- Total Damage
- HPS
- Damage Taken
- Gear Score

---

## 🔧 Known Issues
None! This is a stable production release.

---

## 📝 Complete Changelog

### v3.1.24 (Latest - Recommended)
- **NEW:** Intelligent session naming system
- Sessions show player count, duration, and time
- Easy to identify and find specific battles
- Production-ready stable release

### v3.1.23
- Fixed auto-save sessions not saving correctly
- Backend now accepts frontend player data
- Complete battle data preserved in sessions

### v3.1.22
- Fixed live data not resuming after viewing saved sessions
- Clear all session state when returning to live mode

### v3.1.21
- Added skill breakdown to saved sessions
- Auto-save now includes complete skill data
- Fixed "Skill data unavailable" in historical battles

### v3.1.20
- Fixed settings sync between frontend and backend
- "Keep After Dungeon" setting now properly honored

### v3.1.19
- Fixed settings modal shrinking on subsequent opens

### v3.1.18
- Fixed column visibility checkboxes
- Corrected "Avg DPS" and "Gear Score" display

---

## 🙏 Credits

**Original Project:** [StarResonanceDamageCounter](https://github.com/dmlgzs/StarResonanceDamageCounter) by dmlgzs  
**Forked From:** [NeRooNx/BPSR-Meter](https://github.com/NeRooNx/BPSR-Meter)  
**BPSR Logs:** [winjwinj/bpsr-logs](https://github.com/winjwinj/bpsr-logs)

This enhanced edition builds upon excellent work from the Blue Protocol community.

---

## 📄 License

AGPL-3.0 License - See LICENSE file for details

---

## 🐛 Bug Reports

Found an issue? Please report it on [GitHub Issues](https://github.com/ssalihsrz/InfamousBPSRDPSMeter/issues)
