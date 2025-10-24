# 🚀 Build from WSL (No Export Required!)

## Quick Build

Instead of exporting the archive and building on Windows, you can build directly from WSL:

```bash
cd /development/BPSR-Meter
./build-from-wsl.sh
```

This script will:
1. ✅ Copy source to Windows temp directory
2. ✅ Install dependencies on Windows  
3. ✅ Build Windows installer using Windows tools
4. ✅ Copy the installer back to WSL
5. ✅ Clean up (optional)

---

## Requirements

- WSL2 (Windows Subsystem for Linux)
- Node.js and pnpm installed on **Windows** (not just WSL)
- Windows 10/11

---

## How It Works

The script uses WSL's ability to execute Windows commands from Linux:
- Copies source to Windows temp folder
- Runs `cmd.exe` to execute pnpm/electron-builder on Windows
- The build happens natively on Windows (required for `cap` library)
- Copies the final installer back to WSL

---

## Result

After completion, you'll have:
- **WSL location:** `/development/BPSR-Meter-Setup-2.8.0.exe`
- **Windows location:** `C:\Users\YourName\AppData\Local\Temp\BPSR-Meter-Build\dist_electron\`

---

## Troubleshooting

**Error: "pnpm: command not found"**
- Install pnpm on Windows: `npm install -g pnpm` (from Windows PowerShell/CMD)

**Error: "Failed to install dependencies"**
- Make sure Node.js 22.15.0+ is installed on Windows
- Run Windows Command Prompt as Administrator

**Error: "cap" build failed**
- This is expected if building from pure WSL
- The script builds on Windows to avoid this issue

---

## Why This Works

The `cap` (packet capture) library requires:
- Windows native compilation
- Access to Windows network drivers
- electron-builder needs Windows for signing

By building on Windows but controlling it from WSL, we get the best of both worlds!
