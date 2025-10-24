# BPSR Meter v2.5.1 - Windows Build Guide

## ⚠️ IMPORTANT: Build on Windows Only

This application **MUST** be built on a Windows machine. **DO NOT** build in WSL (Windows Subsystem for Linux).

### Why Windows-Only?
- Uses `cap` library for packet sniffing (Windows-specific)
- Requires Npcap/WinPcap drivers
- Electron native modules compiled for Windows
- NSIS installer for Windows

---

## 🪟 Prerequisites (Windows)

### 1. Install Node.js
- Download: https://nodejs.org/
- Version: **22.15.0 or higher**
- Verify: `node --version`

### 2. Install pnpm
```cmd
npm install -g pnpm
```
Verify: `pnpm --version`

### 3. Install Build Tools
```cmd
npm install -g windows-build-tools
```
Or install Visual Studio Build Tools manually.

### 4. Install Git (Optional)
- Download: https://git-scm.com/download/win
- For cloning the repository

---

## 🚀 Build Steps (Windows)

### Step 1: Open Command Prompt or PowerShell
**Run as Administrator** for best results.

### Step 2: Navigate to Project
```cmd
cd C:\path\to\BPSR-Meter
```

### Step 3: Install Dependencies
```cmd
pnpm install
```

This will:
- Install all Node.js dependencies
- Compile native modules for Windows
- Download Electron binaries
- Set up electron-builder

**Expected time:** 2-5 minutes

### Step 4: Build the Application
```cmd
pnpm dist
```

This will:
- Build Electron application
- Compile all assets
- Create Windows installer (NSIS)
- Package everything into `dist_electron/`

**Expected time:** 3-10 minutes

### Step 5: Find Your Installer
```
dist_electron/
└── BPSR Meter Setup 2.5.1.exe  ← Your installer!
```

---

## 📦 What Gets Built

### Installer File
- **Name:** `BPSR Meter Setup 2.5.1.exe`
- **Type:** NSIS installer
- **Size:** ~150-200 MB
- **Location:** `dist_electron/`

### Installation
- Installs to: `C:\Program Files\BPSR Meter\`
- Creates desktop shortcut
- Adds to Start Menu
- Includes uninstaller

---

## 🔧 Build Scripts Reference

### Available Commands

```cmd
# Install dependencies
pnpm install

# Build Windows installer
pnpm dist

# Run in development mode
pnpm start

# Clean build (if needed)
rmdir /s /q dist_electron
rmdir /s /q node_modules
pnpm install
pnpm dist
```

---

## 🐛 Troubleshooting

### Error: "node-gyp" fails
**Solution:**
```cmd
npm install -g windows-build-tools
npm install -g node-gyp
```

### Error: "cap" module fails to build
**Solution:**
1. Install Visual Studio Build Tools
2. Run Command Prompt as Administrator
3. Rebuild: `pnpm rebuild cap`

### Error: "electron-builder" fails
**Solution:**
```cmd
# Clear cache
rmdir /s /q %APPDATA%\electron-builder
rmdir /s /q %LOCALAPPDATA%\electron-builder

# Rebuild
pnpm install
pnpm dist
```

### Error: "NSIS" not found
**Solution:**
electron-builder will download NSIS automatically. If it fails:
1. Check internet connection
2. Disable antivirus temporarily
3. Run as Administrator

### Build is slow
**Tips:**
- Close other applications
- Disable antivirus temporarily
- Use SSD if available
- Ensure good internet connection (downloads binaries)

---

## 📋 Build Checklist

Before building:
- [ ] Running on **Windows** (not WSL!)
- [ ] Node.js 22.15.0+ installed
- [ ] pnpm installed globally
- [ ] Command Prompt/PowerShell as Administrator
- [ ] Good internet connection
- [ ] Antivirus disabled (optional, for speed)

During build:
- [ ] `pnpm install` completes without errors
- [ ] `pnpm dist` completes without errors
- [ ] Installer appears in `dist_electron/`

After build:
- [ ] Installer file exists
- [ ] File size is reasonable (~150-200 MB)
- [ ] Test installation on clean Windows machine

---

## 🎯 Quick Build (TL;DR)

```cmd
# 1. Open Command Prompt as Administrator
# 2. Navigate to project
cd C:\path\to\BPSR-Meter

# 3. Install and build
pnpm install
pnpm dist

# 4. Find installer
dir dist_electron\*.exe
```

**Done!** Installer is ready at `dist_electron/BPSR Meter Setup 2.5.1.exe`

---

## 📤 Distribution

### Sharing the Installer
1. Locate: `dist_electron/BPSR Meter Setup 2.5.1.exe`
2. Upload to file sharing service
3. Share download link
4. Users run installer on their Windows PC

### System Requirements (for users)
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4 GB minimum
- **Disk:** 500 MB free space
- **Network:** Npcap/WinPcap required
- **Permissions:** Administrator for installation

---

## 🔒 Security Notes

### Antivirus Warnings
Some antivirus software may flag the installer because:
- Uses packet sniffing (cap library)
- Electron app (packed executable)
- NSIS installer

**This is normal.** The application is safe.

### Code Signing (Optional)
For production distribution, consider:
- Purchasing code signing certificate
- Signing the installer
- Reduces antivirus false positives

---

## 🎊 Success!

After building, you'll have:
- ✅ Windows installer (`.exe`)
- ✅ Ready to distribute
- ✅ Includes all dependencies
- ✅ Professional NSIS installer
- ✅ Desktop shortcut
- ✅ Start Menu entry

**Share your DPS meter with the world!** 🎮✨

---

## 📝 Notes

### Build Environment
- **Supported:** Windows 10/11 native
- **Not Supported:** WSL, Linux, macOS
- **Reason:** Native Windows dependencies (cap, Npcap)

### Build Time
- First build: 5-15 minutes
- Subsequent builds: 3-5 minutes
- Depends on: CPU, SSD, internet speed

### Output Size
- Installer: ~150-200 MB
- Installed: ~300-400 MB
- Includes: Electron runtime, Node.js, all dependencies

---

**Version:** 2.5.1  
**Platform:** Windows 10/11 (64-bit)  
**Build Type:** NSIS Installer

**Happy Building!** 🔨
