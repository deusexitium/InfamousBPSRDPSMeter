# BPSR Meter v2.90.0 - MSI Installer

## What's Included

This MSI installer packages everything needed to run BPSR Meter:

### ✅ Bundled Components
- **Full Application** - All BPSR Meter files and resources
- **Node.js Dependencies** - All required npm packages (express, socket.io, cap, etc.)
- **Packet Capture Library** - cap module with native bindings
- **Dependency Checkers** - Scripts to verify system requirements
- **Utility Scripts** - Npcap restart helper

### ⚙️ Installer Features
- **MSI Format** - Professional Windows Installer format
- **Admin Privileges** - Automatically requests elevation
- **Desktop Shortcut** - Quick access icon
- **Start Menu Entry** - Listed in Windows programs
- **Clean Uninstall** - Removes all files and settings

## System Requirements

### Required (MUST Install)
1. **Npcap** - Packet capture driver
   - Download: https://npcap.com/
   - Enable "WinPcap API-compatible Mode"
   - Enable "Support loopback traffic"

### Recommended
2. **Visual C++ Redistributables** - Runtime libraries
   - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - Usually already installed on most systems

## Installation Steps

### First-Time Installation

1. **Download** `Infamous BPSR DPS Meter-Setup-2.90.0.msi`

2. **Right-click** → **Run as Administrator**

3. **Follow the wizard:**
   - Choose installation directory
   - Select shortcuts options
   - Click Install

4. **Install Npcap** (if not already installed):
   - Download from https://npcap.com/
   - Run as Administrator
   - ✅ Enable "WinPcap API-compatible Mode"
   - ✅ Enable "Support loopback traffic"
   - Complete installation

5. **Verify Dependencies:**
   - Navigate to installation folder
   - Run `check-dependencies.ps1` (PowerShell)
   - Or run `pre-launch.bat` (Command Prompt)

6. **Launch BPSR Meter:**
   - Use desktop shortcut
   - Or find in Start Menu
   - Always run as Administrator

## Dependency Checker Scripts

The installer includes helper scripts in the installation directory:

### `check-dependencies.ps1` (Recommended)
**PowerShell script with detailed checks**

```powershell
# Right-click → Run with PowerShell
# Or in PowerShell:
.\check-dependencies.ps1
```

**Features:**
- ✅ Checks if Npcap is installed
- ✅ Verifies Npcap service is running
- ✅ Checks VC++ Redistributables
- ✅ Offers to open download pages
- ✅ Attempts to start Npcap service
- ✅ Provides detailed troubleshooting info

### `pre-launch.bat`
**Simple batch file for quick checks**

```cmd
# Double-click to run
# Or in Command Prompt:
pre-launch.bat
```

**Features:**
- ✅ Quick Npcap presence check
- ✅ Attempts to start Npcap service
- ✅ Opens download page if missing

### `restart-npcap.bat`
**Restart Npcap service if it stops working**

```cmd
# Right-click → Run as Administrator
```

## Troubleshooting Installation

### MSI Won't Install
- **Run as Administrator** - Right-click → Run as administrator
- **Uninstall old version** - Remove previous NSIS version first
- **Check Windows Installer** - Ensure Windows Installer service is running

### "Npcap not found" after installation
1. Install Npcap from https://npcap.com/
2. Restart computer
3. Run `check-dependencies.ps1`
4. If still failing, run `restart-npcap.bat` as admin

### Application won't start
1. Run `check-dependencies.ps1` to diagnose
2. Check log file at: `%APPDATA%\bpsr-meter\iniciar_log.txt`
3. Ensure running as Administrator
4. Verify Npcap service is running

### "Application cannot be installed" error
- **Cause:** Windows SmartScreen or antivirus blocking
- **Solution:** 
  1. Click "More info" on SmartScreen warning
  2. Click "Run anyway"
  3. Or temporarily disable antivirus during install

## Post-Installation

### First Launch Checklist
- [ ] Run as Administrator
- [ ] Npcap is installed and running
- [ ] Blue Protocol is running
- [ ] Firewall allows BPSR Meter
- [ ] Desktop shortcut created

### Configuration Files
Stored in: `%APPDATA%\bpsr-meter\`
- `settings.json` - App preferences
- `player_map.json` - Player name cache
- `users.json` - User data
- `iniciar_log.txt` - Startup logs

## Uninstallation

### Complete Removal
1. **Windows Settings** → Apps → Infamous BPSR DPS Meter → Uninstall
2. **Or:** Control Panel → Programs → Uninstall a program
3. **Manual cleanup** (if needed):
   - Delete: `%APPDATA%\bpsr-meter\`
   - Delete: Desktop shortcuts

### Keep Settings
If you want to preserve your settings for reinstallation:
1. **Before uninstalling:**
   - Copy `%APPDATA%\bpsr-meter\settings.json`
2. **After reinstalling:**
   - Paste back to `%APPDATA%\bpsr-meter\`

## What Makes This MSI Better?

### vs. Previous NSIS Installer
| Feature | MSI | Old NSIS |
|---------|-----|----------|
| Admin privileges | ✅ Automatic | ⚠️ Manual |
| Dependency bundling | ✅ Complete | ⚠️ Partial |
| Node modules | ✅ Included | ❌ Missing |
| Dependency checkers | ✅ Yes | ❌ No |
| Clean uninstall | ✅ Yes | ⚠️ Partial |
| Windows compatibility | ✅ Full | ⚠️ Issues |
| Portable to other PCs | ✅ Yes | ❌ No |

### Self-Contained Package
The MSI includes **ALL** dependencies bundled:
- ✅ All npm packages pre-installed
- ✅ Native bindings compiled
- ✅ cap module with DLLs
- ✅ Electron runtime
- ✅ All application assets

**No need to install:**
- ❌ Node.js ~~(not needed)~~
- ❌ pnpm ~~(not needed)~~
- ❌ npm packages ~~(pre-bundled)~~

**Still need to install:**
- ✅ Npcap (cannot be bundled legally)
- ✅ VC++ Redistributables (optional)

## Support

### Getting Help
1. Check `iniciar_log.txt` for errors
2. Run `check-dependencies.ps1` for diagnostics
3. Visit: https://github.com/mrsnakke/BPSR-Meter/issues
4. Join Discord: [Coming Soon]

### Common Solutions
| Problem | Solution |
|---------|----------|
| "Waiting for combat data..." | Install Npcap, run as admin |
| Window won't move | Click unlock (🔓) button |
| No players showing | Change instance in game |
| Server won't start | Run `restart-npcap.bat` |
| High CPU usage | Normal during combat |

## Version Information

**Version:** 2.90.0  
**Build Date:** 2025  
**Installer Type:** MSI (Windows Installer)  
**Platform:** Windows 10/11 (64-bit)  
**License:** AGPL-3.0

## Credits

- **dmlgzs** - Original BPSR Meter
- **MrSnakeVT** - Enhanced Edition
- **Contributors** - Community improvements

---

**🎮 Happy hunting, Resonator!**
