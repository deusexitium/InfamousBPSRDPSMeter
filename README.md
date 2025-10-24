<div align="center">
  <img src="portada.png" alt="Cover" width="800"/>
</div>

# ⚔️ Infamous BPSR DPS Meter v2.95.12

**The Ultimate Blue Protocol Combat Tracker** - Real-time DPS/HPS analysis with modern UI

[![License](https://img.shields.io/badge/License-AGPL--3.0-blue)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.95.12-green)](https://github.com/ssalihsrz/InfamousBPSRDPSMeter)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](#installation)
[![Downloads](https://img.shields.io/github/downloads/ssalihsrz/InfamousBPSRDPSMeter/total)](https://github.com/ssalihsrz/InfamousBPSRDPSMeter/releases)

---

## ⚠️ IMPORTANT NOTICES

### Windows Build Only
**This application MUST be built on Windows.** Do NOT build in WSL (Windows Subsystem for Linux).

- ✅ **Build on:** Windows 10/11 native
- ❌ **Do NOT build on:** WSL, Linux, macOS
- 📖 **See:** [BUILD-WINDOWS.md](BUILD-WINDOWS.md) for detailed instructions

**Quick Build (Windows):**
```cmd
# Run in Command Prompt (as Administrator)
pnpm install
pnpm dist
```

### ⚠️ VPN Limitations
**VPNs interfere with packet capture - use with caution**

- ❌ **Not Recommended** - VPNs encrypt/redirect packets causing unreliable data
- ⚠️ **ExitLag** - "Legacy - NDIS" mode has partial compatibility (~70-80% accuracy)
- ❌ **Kernel-Level VPNs** - Completely incompatible (packets encrypted before capture)
- ✅ **Best Practice** - Disable VPN when using meter for 100% accuracy
- 💡 **Auto-Detection** - Automatically selects adapter with most traffic

**Note:** VPN compatibility is experimental. Data may be incomplete or inaccurate when VPN is active. For best results, disable VPN during combat analysis.

---

## 🌟 What Makes This Special?

This project builds upon and combines excellent work from the Blue Protocol community:
- ✨ **Modern UI** - Clean glassmorphism design with intuitive controls
- ⚡ **Robust Engine** - Accurate DPS/HPS tracking with proper packet parsing
- 🔧 **Performance** - Optimized rendering and window management
- 📊 **Enhanced Features** - Session management, player details, flexible exports
- 🌍 **English Localization** - Full translation for global players

---

# Acknowledgments and Credits

This project is built upon the excellent work of the Blue Protocol community:

- **dmlgzs** - Original [StarResonanceDamageCounter](https://github.com/dmlgzs/StarResonanceDamageCounter) foundation
- **MrSnakeVT** - Engine improvements and packet parsing enhancements
- **NeRooNx** - Beautiful modern UI design ([NeRooNx/BPSR-Meter](https://github.com/NeRooNx/BPSR-Meter))
- **winjwinj** - Skill data and translations ([bpsr-logs](https://github.com/winjwinj/bpsr-logs))
- **Community Contributors** - Bug reports, testing, and feedback

**This Enhanced Edition** combines and extends their amazing work with:
- Session management system
- Player detail expansion
- Flexible copy/export options
- Window stability improvements
- Additional UI refinements

Thank you to all the talented developers who made this possible! 💙

---

# BPSR Meter - DPS Meter for Blue Protocol

BPSR Meter is a desktop application that acts as a real-time DPS (Damage Per Second) meter for Blue Protocol. It overlays the game window to provide detailed combat statistics without interrupting your gameplay.

![DPS Meter in action](medidor.png)

## ✨ Enhanced Features

### Core Features
1.  **Player Name:** Your identifier in the meter
2.  **Current/Max Health:** Visual health bar with color coding
3.  **DPS (Damage Per Second):** Real-time damage dealt per second
4.  **HPS (Healing Per Second):** Real-time healing done per second
5.  **Total Damage:** Accumulated damage in encounter
6.  **Damage Taken:** Total damage received during combat
7.  **Contribution %:** Your percentage of the group's total damage
8.  **Total Healing:** Accumulated healing in encounter
9.  **GS (Gear Score):** Equipment and skill score

### Enhanced UI Features
- 🥇 **Rank Badges** - Gold/Silver/Bronze for top 3 players
- 💙 **Local Player Highlighting** - Blue glow on your character with pulsing animation
- 🎨 **Position Gradient** - Background colors from red (#1) to blue (#10)
- 📊 **Nearby/Solo Modes** - View top 10 or just yourself
- 🔄 **Multi-Metric Sorting** - Sort by DMG, TANK, or HEAL
- ⚡ **Smooth Animations** - Professional transitions and hover effects
- 🎯 **Clean Modern Design** - Glassmorphism with blur effects

### Performance Enhancements
- ⚡ **Native Window Dragging** - Snappy, responsive movement (not sluggish)
- ⚡ **Optimized Rendering** - 50ms update interval with efficient DOM updates
- ⚡ **Smart Click-Through** - Auto-enables when hovering controls
- ⚡ **Efficient Event Handling** - No performance degradation

### Quality of Life
- ⌨️ **F10 Hotkey** - Quick reset
- 🔄 **Auto-Sync Timer** - 80-second auto-clear when idle
- 🎯 **Visual Feedback** - All actions have smooth animations
- 🔒 **Improved Lock Mode** - Better always-on-top behavior

---

> ### Responsible Use
> This tool is designed to help you improve your own performance. **Please do not use it to degrade, harass, or discriminate against other players.** The goal is self-improvement and enjoying the game as a community.

## Installation

### Step 1: Install Npcap (REQUIRED)
**Do this FIRST before installing the meter!**

1. Download Npcap from: https://npcap.com/
2. Right-click the installer → **"Run as Administrator"**
3. During installation, **CHECK THESE TWO BOXES:**
   - ✅ **"Install Npcap in WinPcap API-compatible Mode"**
   - ✅ **"Support loopback traffic"**
4. Click "I Agree" and complete installation
5. Restart your computer (recommended)

⚠️ **Without Npcap, the meter will NOT work!**

---

### Step 2: Download and Install BPSR Meter

1. **Download the installer:**
   - Go to: [Releases](https://github.com/ssalihsrz/InfamousBPSRDPSMeter/releases/latest)
   - Download: `Infamous BPSR DPS Meter-Setup-2.95.12.exe`

2. **Run the EXE installer:**
   - Right-click the `.exe` file → **"Run as Administrator"**
   - Click "Next" through the installation wizard
   - Choose installation directory (default: `C:\Program Files\Infamous BPSR DPS Meter\`)
   - Select if you want desktop/start menu shortcuts
   - Click "Install" and wait for completion

---

### Step 3: Verify Installation

After installation, verify everything is working:

**Option A: Automatic Check (Recommended for beginners)**
1. Navigate to your install folder (default: `C:\Program Files\Infamous BPSR DPS Meter\`)
2. Find `pre-launch.bat`
3. Right-click → **"Run as Administrator"**
4. This will:
   - ✅ Check if Npcap is installed
   - ✅ Check if Npcap service is running
   - ✅ Start the service if needed
   - ✅ Tell you if something is wrong

**Option B: Detailed Check (Advanced users)**
1. Navigate to your install folder
2. Find `check-dependencies.ps1`
3. Right-click → **"Run with PowerShell"**
4. This provides a detailed report of:
   - Npcap installation status
   - Visual C++ Redistributables status
   - Service status and troubleshooting

---

### Step 4: Launch the Meter

1. Find the **"Infamous BPSR DPS Meter"** shortcut on your desktop (or Start Menu)
2. Right-click the shortcut → **"Run as Administrator"**
3. The meter window will appear
4. Start Blue Protocol and enter combat - data should appear automatically!

---

### 🔧 Troubleshooting

**Problem: No data appears**
- Run `restart-npcap.bat` (in install folder) as Administrator
- Change game instance once (join/leave a party)
- Make sure you're running the meter as Administrator

**Problem: "Npcap not found" error**
- Re-install Npcap from https://npcap.com/
- Make sure to check the two boxes during installation

**Problem: Npcap service not running**
- Run `restart-npcap.bat` as Administrator
- Or manually start "Npcap" service in Windows Services

📖 **More troubleshooting:** [INSTALLER-README.md](INSTALLER-README.md)

---

## How to Use

### Basic Usage
1. **Launch BPSR Meter** (as Administrator)
2. **Start Blue Protocol**
3. **Enter combat** - The meter will automatically start tracking
4. **Change instance once** if data doesn't appear (first launch)

### Window Controls

| Button | Function | Hotkey |
|--------|----------|--------|
| ⋮⋮ | Drag to move window | - |
| 🔒/🔓 | Lock/unlock position | - |
| 🔄 | Manual sync/refresh | - |
| Reset | Clear all statistics | F10 |
| ✕ | Close application | - |

### View Modes

**Nearby Mode** (Default):
- Shows top 10 players sorted by selected metric
- If you're outside top 10, you appear as 11th with real position number
- DMG/TANK/HEAL sorting buttons visible

**Solo Mode**:
- Shows only your personal statistics
- Clean focused view for self-improvement
- Sorting buttons hidden

### Sorting Options (Nearby Mode)

Click the buttons to sort players by:
- **DMG**: Total damage dealt (default)
- **TANK**: Total damage taken
- **HEAL**: Total healing done

---

## 🔧 Building from Source

### Automated Build (Recommended)
**From WSL:**
```bash
cd /development/BPSR-Meter
pnpm build-msi
# MSI created at: F:\dps\Infamous BPSR DPS Meter-Setup-2.90.0.msi
```

**From Windows:**
```powershell
cd F:\dps\BPSR-Meter
.\build-msi.ps1
```

📖 **See:** [BUILD-SCRIPTS.md](BUILD-SCRIPTS.md) for detailed instructions

### Manual Windows Build
```powershell
# Install Node.js 22+
winget install OpenJS.NodeJS

# Install pnpm
npm install -g pnpm@10.13.1

# Clone and build
git clone https://github.com/yourrepo/BPSR-Meter.git
cd BPSR-Meter
pnpm install
pnpm dist
```

### WSL Build (Using Automation)
```bash
# Automated cross-platform build
cd /development/BPSR-Meter
./build-msi-from-wsl.sh
```

---

## Troubleshooting

### Application Issues

**No data showing:**
1. Install Npcap with WinPcap compatibility
2. Run BPSR Meter as Administrator
3. Start Blue Protocol before the meter
4. Change instance/channel once (forces packet capture)
5. Check firewall isn't blocking

**Window is sluggish/slow to drag:**
- ✅ **FIXED in Enhanced Edition!**
- Now uses native webkit dragging
- Smooth and responsive

**Alt+Tab hides window behind game:**
- ✅ **FIXED in Enhanced Edition!**
- Enhanced always-on-top with focus handlers
- Window stays visible

**Players showing as "Unknown":**
- Change instance/channel
- Wait 5-10 seconds for packet capture
- Check network adapter selection in logs

**Sorting doesn't work properly:**
- ✅ **FIXED in Enhanced Edition!**
- Robust sorting with proper data handling
- Click DMG/TANK/HEAL to change sort

### Build Issues

**"cap" compilation fails:**
```bash
# Linux/WSL:
sudo apt-get install libpcap-dev

# Windows:
npm install -g windows-build-tools
```

**Python not found:**
```bash
# Install Python 3.11+
# Windows: winget install Python.Python.3.11
```

**Electron builder fails:**
```bash
# Windows only - install Visual Studio Build Tools
winget install Microsoft.VisualStudio.BuildTools
```

---

## Frequently Asked Questions (FAQ)

**Is using this meter a bannable offense?**
> It operates in a "gray area." It doesn't modify game files, inject code, or alter the game's memory. Historically, tools that only read data have an extremely low risk of being banned. However, **use it at your own risk.**

**Does it affect my game's performance (FPS)?**
> No. The impact is virtually zero, as packet capturing is a passive and very lightweight process.

**Why does it need to run as an administrator?**
> To allow the Npcap library to have low-level access to network adapters and monitor the game's packets.

**What's different from the original version?**
> This Enhanced Edition features modern UI improvements, performance optimizations, complete English translation, and accurate skill data from the community.

**Does it work with ExitLag?**
> Yes, but set ExitLag to "Legacy-NDIS" mode and allow 30 seconds out of combat for auto-clear.

**Does it work on the Chinese server?**
> Yes, it works correctly on the Chinese server.

**Can I contribute?**
> Yes! Pull requests are welcome. Please test thoroughly and follow the existing code style.

---

## 📊 Latest Updates (v2.95.6)

### Critical Fixes
- ✅ **Player Expansion Fixed** - Click any player to see detailed stats and skills
- ✅ **Copy Functions Added** - Individual player copy (stats only or with skills)
- ✅ **Session Management** - Save, load, and delete combat sessions
- ✅ **Window Movement Fixed** - No more infinite resize loop
- ✅ **Modal Interactions Fixed** - Manage Sessions modal fully functional
- ✅ **Start Menu Shortcuts** - Proper Windows integration

### New Features
- 📊 **Player Details Panel** - Click any player to expand detailed view
- 📋 **Flexible Copy Options** - Copy individual player stats or full skill breakdown
- 💾 **Session System** - Save current session, load past sessions, auto-save on character switch
- 🗑️ **Session Management** - Delete old sessions with intuitive modal interface
- 🎯 **Top 10 Skills Display** - See each player's most used skills with damage breakdown
- ⭐ **Auto Local Player Detection** - Automatically highlights your character

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

