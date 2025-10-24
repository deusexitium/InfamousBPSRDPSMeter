# Quick Build Reference

## 🚀 One-Command Build

### From WSL (Easiest)
```bash
cd /development/BPSR-Meter
pnpm build-msi
```

**Output:** `F:\dps\Infamous BPSR DPS Meter-Setup-2.90.0.msi`

---

## 📋 Alternative Methods

### From Windows PowerShell
```powershell
cd F:\dps\BPSR-Meter
.\build-msi.ps1
```

### From Windows Command Prompt
```cmd
cd F:\dps\BPSR-Meter
pnpm dist
```

---

## 🔧 Prerequisites

### Required on Windows
- ✅ Node.js v22+ (`node --version`)
- ✅ pnpm (`npm install -g pnpm`)

### Required on WSL
- ✅ Bash shell
- ✅ PowerShell access

---

## 📁 File Locations

| What | Where |
|------|-------|
| Source (WSL) | `/development/BPSR-Meter` |
| Build Output | `F:\dps\` |
| MSI Installer | `F:\dps\Infamous BPSR DPS Meter-Setup-2.90.0.msi` |

---

## ⏱️ Build Time

**Total:** ~6-13 minutes
- Dependencies: 2-5 min
- MSI Build: 3-7 min

---

## 🆘 If Build Fails

1. **Check pnpm:** `pnpm --version`
2. **Check Node:** `node --version` (should be v22.x)
3. **Use Command Prompt** instead of PowerShell (avoids execution policy)
4. **See:** [BUILD-SCRIPTS.md](BUILD-SCRIPTS.md) for troubleshooting

---

## 📚 Full Documentation

- [BUILD-SCRIPTS.md](BUILD-SCRIPTS.md) - Complete guide
- [INSTALLER-README.md](INSTALLER-README.md) - Installer usage
- [CHANGELOG-v2.90.0.md](CHANGELOG-v2.90.0.md) - What's new
