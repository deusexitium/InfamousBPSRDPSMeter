# BPSR Meter - Build Scripts Guide

This guide explains how to use the automated build scripts to create MSI installers from WSL or Windows.

---

## 🎯 Overview

**Problem:** Building Electron apps with native modules from WSL doesn't work due to cross-compilation issues.

**Solution:** Automated scripts that handle the entire Windows build process using PowerShell.

---

## 📜 Available Scripts

### 1. `build-msi-from-wsl.sh` (WSL → Windows)
**Fully automated build from WSL**

**What it does:**
1. Creates source archive (.tar.gz)
2. Copies archive to Windows (F:\dps)
3. Extracts on Windows using PowerShell
4. Installs dependencies via pnpm
5. Builds MSI installer
6. Copies MSI back to Windows directory
7. Optional cleanup

**Usage:**
```bash
# From WSL, in project directory:
cd /development/BPSR-Meter
./build-msi-from-wsl.sh

# Or using pnpm:
pnpm build-msi
```

**Requirements:**
- WSL with bash
- PowerShell access from WSL
- Windows F:\dps directory exists
- pnpm installed on Windows
- Node.js installed on Windows

---

### 2. `build-msi.ps1` (Windows Native)
**Direct build on Windows**

**What it does:**
1. Verifies pnpm and Node.js installed
2. Extracts source archive (if provided)
3. Installs dependencies
4. Builds MSI installer
5. Reports results and opens folder

**Usage:**

#### Option A: From extracted source
```powershell
# In PowerShell, navigate to extracted BPSR-Meter folder:
cd F:\dps\BPSR-Meter
.\build-msi.ps1
```

#### Option B: From source archive
```powershell
# Provide path to .tar.gz archive:
cd F:\dps
.\build-msi.ps1 -SourceArchive "BPSR-Meter-v2.90.0-source.tar.gz"
```

#### Option C: Custom build directory
```powershell
.\build-msi.ps1 -SourceArchive "path\to\archive.tar.gz" -BuildDir "D:\builds"
```

**Requirements:**
- Windows 10/11
- PowerShell 5.1 or later
- pnpm installed globally
- Node.js installed

---

## 🚀 Quick Start

### From WSL (Recommended for Development)

```bash
# 1. Navigate to project
cd /development/BPSR-Meter

# 2. Run automated build
pnpm build-msi

# 3. Find MSI at:
# F:\dps\Infamous BPSR DPS Meter-Setup-2.90.0.msi
```

### From Windows (Recommended for Release Builds)

```powershell
# 1. Copy source archive to Windows
# (Already done by WSL script, or manually copy)

# 2. Extract archive
cd F:\dps
tar -xzf BPSR-Meter-v2.90.0-source.tar.gz

# 3. Run build script
cd BPSR-Meter
.\build-msi.ps1
```

---

## 📋 Detailed Workflow

### WSL Build Process

```
┌─────────────────────────────────────────┐
│  WSL: /development/BPSR-Meter           │
├─────────────────────────────────────────┤
│  1. Create tar.gz archive               │
│  2. Copy to F:\dps                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Windows: F:\dps                        │
├─────────────────────────────────────────┤
│  3. Extract archive (PowerShell)        │
│  4. Install dependencies (pnpm)         │
│  5. Build MSI (electron-builder)        │
│  6. Copy MSI to F:\dps                  │
└─────────────────────────────────────────┘
```

### Windows Build Process

```
┌─────────────────────────────────────────┐
│  Windows: F:\dps\BPSR-Meter             │
├─────────────────────────────────────────┤
│  1. Verify Node.js & pnpm               │
│  2. Install dependencies                │
│  3. Build MSI                           │
│  4. Report results                      │
└─────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### WSL Script Configuration

Edit `build-msi-from-wsl.sh` to change:

```bash
# Build directory on Windows
WINDOWS_BUILD_DIR="/mnt/f/dps"

# Source directory in WSL
SOURCE_DIR="/development/BPSR-Meter"
```

### PowerShell Script Configuration

Use parameters:

```powershell
# Custom build directory
.\build-msi.ps1 -BuildDir "D:\builds"

# Custom source archive location
.\build-msi.ps1 -SourceArchive "C:\downloads\archive.tar.gz"
```

---

## 🐛 Troubleshooting

### Issue: "pnpm command not found"

**Cause:** pnpm not installed on Windows

**Solution:**
```powershell
# Install pnpm globally
npm install -g pnpm
```

### Issue: "PowerShell execution policy error"

**Cause:** Scripts blocked by PowerShell

**Solution:**
```powershell
# Run with bypass
powershell.exe -ExecutionPolicy Bypass -File build-msi.ps1

# Or set policy for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "tar command not found" on Windows

**Cause:** Old Windows version without built-in tar

**Solution:**
- Update to Windows 10 v1803+ or Windows 11
- Or install 7-Zip and use: `7z x archive.tar.gz`

### Issue: "node-gyp cross-compilation error"

**Cause:** Trying to build from WSL directly

**Solution:**
- Use the automated scripts (build-msi-from-wsl.sh)
- Never run `pnpm dist` directly from WSL

### Issue: "MSI not found after build"

**Cause:** Build failed, check output

**Solution:**
1. Check for error messages in build output
2. Verify dependencies installed correctly
3. Ensure Node.js version matches (v22.15.0)
4. Try running `pnpm install` manually first

---

## 📊 Build Output

### Expected Output Structure

```
F:\dps\
├── BPSR-Meter\                          # Extracted source
│   ├── dist_electron\                   # Build output
│   │   ├── Infamous BPSR DPS Meter-Setup-2.90.0.msi  ✅
│   │   ├── builder-effective-config.yaml
│   │   └── builder-debug.yml
│   ├── node_modules\                    # Dependencies
│   ├── package.json
│   └── ...
├── BPSR-Meter-v2.90.0-source.tar.gz    # Source archive
└── Infamous BPSR DPS Meter-Setup-2.90.0.msi  ✅ Final MSI (copied here)
```

### MSI Details

**Filename:** `Infamous BPSR DPS Meter-Setup-2.90.0.msi`
**Size:** ~80-120 MB (includes all dependencies)
**Type:** Windows Installer Package (.msi)
**Architecture:** x64 (64-bit)

---

## 🔄 Update Workflow

### When Releasing New Version

1. **Update version number:**
   ```bash
   # Edit package.json
   "version": "2.91.0"
   
   # Edit server.js
   const VERSION = '2.91.0';
   
   # Edit README.md
   # Update version badges
   ```

2. **Run build script:**
   ```bash
   # From WSL
   pnpm build-msi
   ```

3. **Test MSI:**
   - Install on clean Windows system
   - Run check-dependencies.ps1
   - Verify all features work

4. **Create release:**
   - Upload MSI to GitHub Releases
   - Include INSTALLER-README.md
   - Add changelog
   - Calculate SHA256 checksum

---

## 🎯 Best Practices

### Development Builds
- Use WSL script for quick iterations
- Build directory gets overwritten each time
- No need to manually cleanup

### Release Builds
- Use Windows script for final release
- Test on multiple Windows versions
- Verify digital signature (if signed)
- Check MSI properties and metadata

### Version Management
- Always increment version before building
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update all version references:
  - package.json
  - server.js
  - README.md
  - CHANGELOG.md

---

## 🔐 Security Notes

### PowerShell Execution Policy

Scripts use `-ExecutionPolicy Bypass` to avoid policy issues:
- **Safe:** Only runs within the build process
- **Temporary:** Doesn't change system policy
- **Controlled:** Only executes known commands

### Build Isolation

- Each build uses fresh extraction
- Dependencies installed from package.json
- No system-wide modifications
- Clean build environment

---

## 📈 Performance

### Build Times (Approximate)

| Step | Duration |
|------|----------|
| Archive creation | ~5-10 seconds |
| Copy to Windows | ~1-2 seconds |
| Extract archive | ~3-5 seconds |
| Install dependencies | ~2-5 minutes |
| Build MSI | ~3-7 minutes |
| **Total** | **~6-13 minutes** |

**Note:** First build takes longer due to downloading dependencies. Subsequent builds are faster if node_modules cached.

---

## 🆘 Support

### If Build Fails

1. **Check prerequisites:**
   ```powershell
   node --version    # Should be v22.x
   pnpm --version    # Should be installed
   ```

2. **Review build output:**
   - Look for error messages
   - Check dependency installation logs
   - Verify electron-builder output

3. **Try manual build:**
   ```powershell
   cd F:\dps\BPSR-Meter
   pnpm install
   pnpm dist
   ```

4. **Check logs:**
   - WSL: Console output
   - Windows: PowerShell output
   - electron-builder: dist_electron/builder-debug.yml

---

## 📚 Additional Resources

### Related Documentation
- [INSTALLER-README.md](INSTALLER-README.md) - Installer usage guide
- [BUILD-WINDOWS.md](BUILD-WINDOWS.md) - Windows build instructions
- [CHANGELOG-v2.90.0.md](CHANGELOG-v2.90.0.md) - MSI installer changes

### External Links
- [electron-builder](https://www.electron.build/) - Build tool documentation
- [pnpm](https://pnpm.io/) - Package manager
- [MSI Format](https://docs.microsoft.com/en-us/windows/win32/msi/windows-installer-portal) - Windows Installer

---

## ✅ Checklist

### Before Building
- [ ] Version incremented in package.json
- [ ] Version updated in server.js
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] All code changes committed

### After Building
- [ ] MSI file created successfully
- [ ] MSI size is reasonable (~80-120 MB)
- [ ] Tested on clean Windows system
- [ ] Dependency checker runs correctly
- [ ] All features work properly
- [ ] Ready for release

---

**🎉 Happy Building!**

These scripts automate the tedious parts of cross-platform building, letting you focus on development instead of build configuration.
