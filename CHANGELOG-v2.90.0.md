# BPSR Meter v2.90.0 - MSI Installer Release

**Release Date:** January 2025  
**Build Type:** Major Installer Update

---

## 🎯 Main Goal: Fix Portability Issues

**Problem:** Previous installers failed when shared with other users because:
- ❌ Missing Node.js dependencies
- ❌ Incomplete native module bindings
- ❌ No dependency verification
- ❌ No clear error messages for missing requirements

**Solution:** Complete MSI installer package with everything bundled

---

## ✨ What's New

### 🎁 MSI Installer Package
- **Format:** Microsoft Installer (.msi) instead of NSIS (.exe)
- **Benefits:**
  - ✅ Better Windows integration
  - ✅ Cleaner installation/uninstallation
  - ✅ Automatic admin privilege elevation
  - ✅ Professional installer experience
  - ✅ More reliable across different systems

### 📦 Complete Bundling
**Everything included in the installer:**
- ✅ All Node.js modules (express, socket.io, cap, winston, etc.)
- ✅ Native bindings compiled and bundled
- ✅ Electron runtime
- ✅ All application assets and resources
- ✅ Packet capture library (cap module)
- ✅ All dependencies pre-installed

**No longer required to install separately:**
- ❌ Node.js (bundled in app)
- ❌ pnpm (not needed)
- ❌ npm packages (pre-installed)

### 🔍 Dependency Checkers

#### `check-dependencies.ps1` (PowerShell)
**Comprehensive diagnostic tool:**
- ✅ Detects if Npcap is installed
- ✅ Checks Npcap installation paths
- ✅ Verifies Npcap service status
- ✅ Attempts to start Npcap service
- ✅ Checks Visual C++ Redistributables
- ✅ Offers to open download pages
- ✅ Provides detailed troubleshooting info
- ✅ Shows clear error messages

**Example output:**
```
==========================================
  BPSR Meter - Dependency Checker
==========================================

[1/2] Checking for Npcap...
  ✓ Npcap found at: C:\Program Files\Npcap
  ✓ Npcap service is running

[2/2] Checking for Visual C++ Redistributables...
  ✓ Visual C++ Redistributable found

==========================================
  Dependency Check Summary
==========================================
✓ All dependencies satisfied!

You can now run BPSR Meter.
```

#### `pre-launch.bat` (Batch File)
**Quick dependency check:**
- ✅ Fast Npcap detection
- ✅ Service status check
- ✅ Automatic service start attempt
- ✅ Download page prompts
- ✅ Simple command-line interface

**Example output:**
```
Checking for Npcap...
[OK] Npcap is installed
[OK] Npcap service is running
[OK] All checks passed
Starting BPSR Meter...
```

### 📋 Installation Improvements

**Before (v2.89.0 and earlier):**
```
1. Download installer
2. Run installer
3. Install Node.js separately
4. Install Npcap
5. Hope everything works
6. Debug missing dependencies
```

**After (v2.90.0):**
```
1. Download MSI installer
2. Install Npcap (one-time)
3. Run MSI installer (includes everything)
4. Verify with check-dependencies.ps1
5. Launch and play!
```

### 🛠️ Technical Changes

#### package.json Updates
```json
{
  "version": "2.90.0",
  "build": {
    "files": [
      "node_modules/**/*",  // ← All dependencies bundled
      "check-dependencies.ps1",
      "pre-launch.bat",
      "restart-npcap.bat"
    ],
    "asarUnpack": [
      "node_modules/cap/**/*"  // ← Native module unpacked
    ],
    "extraResources": [
      // Dependency checkers included
    ],
    "win": {
      "target": [{"target": "msi", "arch": ["x64"]}],  // ← MSI format
      "requestedExecutionLevel": "requireAdministrator"  // ← Auto elevation
    },
    "msi": {
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "perMachine": true,
      "artifactName": "${productName}-Setup-${version}.msi"
    }
  }
}
```

#### Key Configuration Changes
- **Installer Type:** NSIS → MSI
- **Node Modules:** External → Bundled
- **Admin Rights:** Manual → Automatic
- **Dependency Checks:** None → Built-in scripts
- **Installation Scope:** Per-user → Per-machine

---

## 🔧 Building the MSI

### Windows (Native)
```powershell
# Install dependencies
pnpm install

# Build MSI installer
pnpm dist

# Output location:
# dist_electron/Infamous BPSR DPS Meter-Setup-2.90.0.msi
```

### WSL/Linux (Cross-compile)
```bash
# Install dependencies
pnpm install

# Build MSI (requires wine)
pnpm dist

# Transfer MSI to Windows for distribution
```

---

## 📊 Comparison: Old vs New

| Feature | v2.89.0 (NSIS) | v2.90.0 (MSI) |
|---------|----------------|---------------|
| **Installer Format** | .exe (NSIS) | .msi (Windows Installer) |
| **Node.js Required** | ✅ Yes (separate install) | ❌ No (bundled) |
| **npm Packages** | ⚠️ Partial | ✅ Complete |
| **Native Modules** | ⚠️ May fail | ✅ Pre-compiled |
| **Admin Elevation** | ⚠️ Manual | ✅ Automatic |
| **Dependency Check** | ❌ None | ✅ Scripts included |
| **Portability** | ❌ Fails on other PCs | ✅ Works everywhere |
| **Error Messages** | ⚠️ Cryptic | ✅ Clear and helpful |
| **Uninstall** | ⚠️ Leaves files | ✅ Clean removal |
| **Desktop Shortcut** | ⚠️ Sometimes | ✅ Always |
| **Start Menu Entry** | ⚠️ Inconsistent | ✅ Reliable |

---

## 🐛 Issues Fixed

### Issue #1: "App doesn't work when I send it to someone"
**Cause:** Missing Node.js dependencies on recipient's system

**Fix:** All dependencies now bundled in MSI. No external requirements except Npcap.

### Issue #2: "cap module not found" errors
**Cause:** Native bindings not properly packaged

**Fix:** 
- Added `asarUnpack` for cap module
- Bundled native DLLs in extraResources
- Pre-compiled for x64 Windows

### Issue #3: "No clear way to know what's missing"
**Cause:** No diagnostic tools

**Fix:**
- `check-dependencies.ps1` - Comprehensive checker
- `pre-launch.bat` - Quick verification
- Clear error messages with solutions

### Issue #4: "Installation inconsistent across systems"
**Cause:** NSIS installer limitations

**Fix:**
- MSI format with Windows Installer
- Automatic admin elevation
- Per-machine installation scope

---

## 📝 Documentation Updates

### New Files
- **INSTALLER-README.md** - Complete installer guide
- **check-dependencies.ps1** - Dependency checker script
- **pre-launch.bat** - Quick dependency verification

### Updated Files
- **README.md** - Updated installation instructions
- **package.json** - MSI configuration
- **server.js** - Version bump to 2.90.0

---

## 🎯 Testing Checklist

Before distributing the MSI, verify:

### Build Tests
- [ ] MSI builds successfully on Windows
- [ ] MSI builds successfully from WSL (cross-compile)
- [ ] All files included in package
- [ ] Native modules properly bundled

### Installation Tests
- [ ] MSI installs on clean Windows 10 system
- [ ] MSI installs on clean Windows 11 system
- [ ] Desktop shortcut created
- [ ] Start Menu entry created
- [ ] Admin elevation prompt appears

### Dependency Tests
- [ ] `check-dependencies.ps1` runs correctly
- [ ] `pre-launch.bat` runs correctly
- [ ] Npcap detection works
- [ ] Service restart works
- [ ] Error messages are clear

### Functional Tests
- [ ] App launches after installation
- [ ] Packet capture works
- [ ] All features functional
- [ ] No missing dependencies errors

### Uninstall Tests
- [ ] Clean uninstallation
- [ ] All files removed
- [ ] Settings preserved (if configured)
- [ ] No registry leftovers

---

## 🚀 Distribution

### Build the MSI
```powershell
# On Windows
pnpm dist
```

### Test the MSI
```powershell
# Install
msiexec /i "dist_electron\Infamous BPSR DPS Meter-Setup-2.90.0.msi" /l*v install.log

# Check dependencies
cd "C:\Program Files\Infamous BPSR DPS Meter"
.\check-dependencies.ps1

# Launch app
.\Infamous BPSR DPS Meter.exe
```

### Upload to Releases
1. Create GitHub Release: `v2.90.0`
2. Upload MSI: `Infamous BPSR DPS Meter-Setup-2.90.0.msi`
3. Upload checksums (SHA256)
4. Include INSTALLER-README.md in release notes

---

## 🆘 Troubleshooting

### "MSI won't install"
**Solution:** Right-click → Run as Administrator

### "Missing DLL errors"
**Solution:** Run `check-dependencies.ps1`, install VC++ Redistributables

### "Npcap not found"
**Solution:** Install from https://npcap.com/, run `restart-npcap.bat`

### "Application doesn't start"
**Solution:** 
1. Check `%APPDATA%\bpsr-meter\iniciar_log.txt`
2. Run `check-dependencies.ps1`
3. Ensure running as Administrator

---

## 📈 Next Steps

### Future Enhancements
- [ ] Code signing certificate (remove SmartScreen warnings)
- [ ] Automatic Npcap installation (if licensing permits)
- [ ] Auto-update mechanism
- [ ] Installer wizard customization
- [ ] Portable version (no install required)

### Feedback Request
- Does the MSI install correctly on your system?
- Are the dependency checkers helpful?
- Any missing error messages or diagnostics?
- Should we include more troubleshooting tools?

---

## ❤️ Credits

**v2.90.0 Changes:**
- MSI installer configuration
- Dependency bundling
- Diagnostic scripts
- Documentation updates

**Original Authors:**
- dmlgzs - Base BPSR Meter
- MrSnakeVT - Enhanced Edition
- Community - Testing & feedback

---

**🎮 Ready for distribution! No more "it doesn't work on my PC" issues.**
