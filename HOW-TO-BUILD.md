# BPSR Meter Enhanced Edition v2.5.1
## Windows Build Guide

---

## Quick Start

### On Windows:

1. **Install Prerequisites** (one-time setup):
   ```powershell
   # Install Node.js 22
   winget install OpenJS.NodeJS
   
   # Verify installation
   node --version  # Should show v22.x
   ```

2. **Open PowerShell as Administrator** in this directory

3. **Run the build script**:
   ```powershell
   .\build.bat
   ```

4. **Wait 5-10 minutes** for the build to complete

5. **Find the installer**:
   ```
   dist_electron\BPSR Meter Setup 2.5.1.exe
   ```

6. **Install and run!**

---

## What You Get

- ✅ Windows installer (.exe)
- ✅ Auto-updater capability
- ✅ Start menu integration
- ✅ Proper uninstaller
- ✅ All enhanced features

---

## Requirements

- Windows 10/11 (64-bit)
- Node.js 22.x
- Administrator privileges
- Internet connection (for dependencies)
- ~3GB free space (for build tools)

---

## Enhanced Features

- ✨ Modern UI (from NeRooNx)
- ⚡ Fast window dragging (native webkit)
- 📊 Nearby/Solo modes
- 🥇 Rank badges
- 💙 Local player highlighting
- 🔄 Multi-metric sorting
- 🌍 100% English
- 🐛 All bugs fixed

---

## Troubleshooting

**Build fails:**
- Run as Administrator
- Install Visual Studio Build Tools
- Install Python 3.11+

**"pnpm not found":**
```powershell
npm install -g pnpm
```

---

That's it! Simple and professional.

