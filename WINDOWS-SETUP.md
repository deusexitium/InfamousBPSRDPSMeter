# BPSR Meter v2.5.1 - Windows Setup Guide

## 🪟 Complete Windows Installation & Build Guide

This guide covers everything you need to build and run BPSR Meter on Windows.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Building the Application](#building-the-application)
4. [Installing the Application](#installing-the-application)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

---

## 💻 System Requirements

### For Building:
- **OS:** Windows 10 or Windows 11 (64-bit)
- **RAM:** 8 GB minimum (16 GB recommended)
- **Disk:** 5 GB free space (for Node.js, dependencies, build)
- **CPU:** Any modern CPU (build will be faster with more cores)
- **Internet:** Required for downloading dependencies

### For Running (End Users):
- **OS:** Windows 10 or Windows 11 (64-bit)
- **RAM:** 4 GB minimum
- **Disk:** 500 MB free space
- **Network:** Npcap or WinPcap installed
- **Permissions:** Administrator for installation

---

## 🔧 Prerequisites Installation

### Step 1: Install Node.js

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download: **LTS version** (22.15.0 or higher)
   - Choose: **Windows Installer (.msi)** for 64-bit

2. **Install Node.js:**
   - Run the downloaded installer
   - Accept license agreement
   - Choose default installation path
   - ✅ Check "Automatically install necessary tools"
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   ```cmd
   # Open Command Prompt
   node --version
   # Should show: v22.15.0 or higher
   
   npm --version
   # Should show: 10.x.x or higher
   ```

### Step 2: Install pnpm

1. **Open Command Prompt as Administrator:**
   - Press `Win + X`
   - Select "Command Prompt (Admin)" or "PowerShell (Admin)"

2. **Install pnpm globally:**
   ```cmd
   npm install -g pnpm
   ```

3. **Verify Installation:**
   ```cmd
   pnpm --version
   # Should show: 10.13.1 or higher
   ```

### Step 3: Install Build Tools (Important!)

The `cap` library requires native compilation. Install build tools:

**Option A: Automatic (Recommended)**
```cmd
npm install -g windows-build-tools
```

**Option B: Manual**
1. Download Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. Install "Desktop development with C++"
3. Restart computer

### Step 4: Install Git (Optional)

If you want to clone the repository:

1. Download: https://git-scm.com/download/win
2. Install with default options
3. Verify: `git --version`

---

## 🏗️ Building the Application

### Method 1: Using Batch Script (Easiest)

1. **Navigate to project folder:**
   ```cmd
   cd C:\path\to\BPSR-Meter
   ```

2. **Run build script:**
   ```cmd
   build-windows.bat
   ```

3. **Wait for completion:**
   - Dependencies install: 2-5 minutes
   - Build process: 5-10 minutes
   - Total: ~10-15 minutes

4. **Find installer:**
   - Location: `dist_electron\BPSR Meter Setup 2.5.1.exe`

### Method 2: Manual Build

1. **Open Command Prompt as Administrator**

2. **Navigate to project:**
   ```cmd
   cd C:\path\to\BPSR-Meter
   ```

3. **Install dependencies:**
   ```cmd
   pnpm install
   ```
   
   This will:
   - Download all npm packages
   - Compile native modules (cap)
   - Download Electron binaries
   - Set up electron-builder

4. **Build the installer:**
   ```cmd
   pnpm dist
   ```
   
   This will:
   - Bundle the application
   - Create NSIS installer
   - Output to `dist_electron/`

5. **Verify build:**
   ```cmd
   dir dist_electron\*.exe
   ```
   
   You should see: `BPSR Meter Setup 2.5.1.exe`

---

## 📦 Installing the Application

### For Yourself (Testing):

1. **Locate installer:**
   ```
   dist_electron\BPSR Meter Setup 2.5.1.exe
   ```

2. **Run installer:**
   - Double-click the .exe file
   - Click "Yes" on UAC prompt (Administrator)
   - Follow installation wizard
   - Choose installation location (default: `C:\Program Files\BPSR Meter\`)
   - Click "Install"

3. **Installation completes:**
   - Desktop shortcut created
   - Start Menu entry added
   - Uninstaller included

### For Distribution:

1. **Upload installer to file hosting:**
   - Google Drive
   - Dropbox
   - GitHub Releases
   - Your own server

2. **Share download link with users**

3. **Users run installer on their Windows PC**

---

## 🚀 Running the Application

### First Launch:

1. **Install Npcap (Required):**
   - Download: https://npcap.com/#download
   - Install with "WinPcap API-compatible Mode" checked
   - Restart computer

2. **Launch BPSR Meter:**
   - Desktop shortcut, OR
   - Start Menu → BPSR Meter, OR
   - `C:\Program Files\BPSR Meter\BPSR Meter.exe`

3. **Run as Administrator (Important!):**
   - Right-click BPSR Meter
   - Select "Run as administrator"
   - This is required for packet capture

4. **Start Blue Protocol:**
   - Launch the game
   - Enter combat
   - BPSR Meter will start showing data

### Subsequent Launches:

- Just run BPSR Meter as Administrator
- Data will appear when you enter combat

---

## 🐛 Troubleshooting

### Build Issues

#### Error: "pnpm: command not found"
**Solution:**
```cmd
npm install -g pnpm
# Then restart Command Prompt
```

#### Error: "node-gyp" fails
**Solution:**
```cmd
# Install build tools
npm install -g windows-build-tools

# Or install Visual Studio Build Tools manually
```

#### Error: "cap" module fails to compile
**Solution:**
1. Install Visual Studio Build Tools
2. Ensure you have C++ build tools
3. Run Command Prompt as Administrator
4. Try again:
   ```cmd
   pnpm install
   ```

#### Error: "electron-builder" fails
**Solution:**
```cmd
# Clear cache
rmdir /s /q %APPDATA%\electron-builder
rmdir /s /q %LOCALAPPDATA%\electron-builder

# Rebuild
pnpm install
pnpm dist
```

#### Error: Build is very slow
**Solutions:**
- Close other applications
- Disable antivirus temporarily
- Ensure good internet connection
- Use SSD if available

### Runtime Issues

#### No data showing in meter
**Solutions:**
1. Install Npcap with WinPcap mode
2. Run BPSR Meter as Administrator
3. Restart computer after Npcap install
4. Change instance in game (triggers packet capture)

#### "Unknown" player names
**Solutions:**
- Change instance once (triggers name packets)
- Database will learn names over time
- Names persist across restarts

#### Antivirus blocks the application
**Solutions:**
- Add exception for BPSR Meter
- This is normal (packet sniffing triggers AV)
- Application is safe

#### Application won't start
**Solutions:**
1. Install Visual C++ Redistributable:
   - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Reinstall BPSR Meter
3. Check Windows Event Viewer for errors

---

## 📁 File Locations

### Build Files:
```
BPSR-Meter/
├── dist_electron/              ← Build output
│   └── BPSR Meter Setup 2.5.1.exe
├── node_modules/               ← Dependencies
├── package.json                ← Project config
└── build-windows.bat           ← Build script
```

### Installed Files:
```
C:\Program Files\BPSR Meter\
├── BPSR Meter.exe              ← Main executable
├── resources/                  ← Application files
└── Uninstall BPSR Meter.exe    ← Uninstaller
```

### User Data:
```
%APPDATA%\BPSR Meter\
├── settings.json               ← User settings
├── player_map.json             ← Player database
└── logs/                       ← Application logs
```

---

## 🔒 Security & Permissions

### Why Administrator Required?

BPSR Meter requires Administrator privileges because:
1. **Packet Capture:** Npcap requires admin for network access
2. **Low-Level Network:** Reading game packets needs elevated permissions
3. **Driver Access:** Npcap driver requires admin

### Is It Safe?

Yes! The application:
- ✅ Only reads Blue Protocol packets
- ✅ Does not modify game files
- ✅ Does not send data externally
- ✅ Open source code (you can audit)
- ✅ No telemetry or tracking

### Antivirus Warnings

Some antivirus may flag because:
- Uses packet sniffing (legitimate use)
- Electron app (packed executable)
- Unsigned installer (no code signing certificate)

**This is a false positive.** The application is safe.

---

## 📊 Build Performance

### Expected Build Times:

| Step | Time | Notes |
|------|------|-------|
| `pnpm install` | 2-5 min | First time only |
| `pnpm dist` | 5-10 min | Depends on CPU |
| **Total** | **7-15 min** | First build |
| Subsequent builds | 3-5 min | Faster |

### Build Output Size:

| Item | Size |
|------|------|
| Installer (.exe) | ~150-200 MB |
| Installed app | ~300-400 MB |
| Includes | Electron + Node.js + deps |

---

## ✅ Build Checklist

### Before Building:
- [ ] Running Windows 10/11 (NOT WSL!)
- [ ] Node.js 22.15.0+ installed
- [ ] pnpm installed globally
- [ ] Build tools installed
- [ ] Command Prompt as Administrator
- [ ] Good internet connection

### During Build:
- [ ] `pnpm install` completes
- [ ] No error messages
- [ ] `pnpm dist` completes
- [ ] Installer created

### After Build:
- [ ] Installer exists in `dist_electron/`
- [ ] File size ~150-200 MB
- [ ] Test installation
- [ ] Test running as Administrator
- [ ] Test with Blue Protocol

---

## 🎯 Quick Reference

### Build Commands:
```cmd
# Full build
pnpm install && pnpm dist

# Clean build
rmdir /s /q dist_electron node_modules
pnpm install && pnpm dist

# Development mode
pnpm start
```

### File Paths:
```cmd
# Installer
dist_electron\BPSR Meter Setup 2.5.1.exe

# Installed app
C:\Program Files\BPSR Meter\BPSR Meter.exe

# User data
%APPDATA%\BPSR Meter\
```

### Support:
- **Build Issues:** See [BUILD-WINDOWS.md](BUILD-WINDOWS.md)
- **Usage Help:** See [QUICK-START.md](QUICK-START.md)
- **Features:** See [DELIVERY-SUMMARY.md](DELIVERY-SUMMARY.md)

---

## 🎊 Success!

After following this guide, you should have:
- ✅ Working build environment
- ✅ Built installer (.exe)
- ✅ Installed application
- ✅ Running BPSR Meter
- ✅ Tracking DPS in Blue Protocol

**Enjoy your DPS meter!** 🎮✨

---

**Version:** 2.5.1  
**Platform:** Windows 10/11 (64-bit)  
**Build Type:** Native Windows Build (NOT WSL!)

**Remember: Always build on Windows, never in WSL!** 🪟
