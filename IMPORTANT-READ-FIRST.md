# ⚠️ IMPORTANT: READ THIS FIRST!

## 🪟 Windows Native Build Required

### ❌ DO NOT BUILD IN WSL!

This application **MUST** be built on **native Windows**. It will **NOT** work if built in WSL (Windows Subsystem for Linux).

---

## Why Windows-Only?

### Technical Reasons:

1. **Packet Capture Library (`cap`)**
   - Requires Npcap/WinPcap drivers
   - Native Windows kernel integration
   - Cannot work in WSL environment

2. **Native Modules**
   - `cap` compiles native C++ code
   - Requires Windows build tools
   - Links against Windows-specific libraries

3. **Electron Native Dependencies**
   - Some Electron modules are platform-specific
   - Must be compiled for Windows target
   - WSL builds create Linux binaries (won't run on Windows)

4. **NSIS Installer**
   - electron-builder creates Windows installer
   - Requires Windows-specific tools
   - Cannot be created from WSL

---

## ✅ Correct Build Environment

### What You Need:

```
✅ Windows 10 or Windows 11 (64-bit)
✅ Native Windows Command Prompt or PowerShell
✅ Node.js installed on Windows (not WSL)
✅ pnpm installed on Windows (not WSL)
✅ Visual Studio Build Tools (for native compilation)
```

### What You DON'T Need:

```
❌ WSL (Windows Subsystem for Linux)
❌ Linux virtual machine
❌ Docker container
❌ Any Linux-based environment
```

---

## 🚀 Quick Start (Windows)

### 1. Open Command Prompt (Windows)
```cmd
# Press Win + R
# Type: cmd
# Press Enter
```

### 2. Navigate to Project
```cmd
cd C:\path\to\BPSR-Meter
```

### 3. Build
```cmd
# Easy way (use the batch script)
build-windows.bat

# Or manual way
pnpm install
pnpm dist
```

### 4. Find Installer
```
Location: dist_electron\BPSR Meter Setup 2.5.1.exe
Size: ~150-200 MB
```

---

## 📚 Documentation Guide

### For Building:
1. **Start here:** [WINDOWS-SETUP.md](WINDOWS-SETUP.md) - Complete Windows setup guide
2. **Quick build:** [BUILD-WINDOWS.md](BUILD-WINDOWS.md) - Build instructions
3. **Troubleshooting:** See troubleshooting sections in above docs

### For Using:
1. **Quick start:** [QUICK-START.md](QUICK-START.md) - How to use the meter
2. **Features:** [DELIVERY-SUMMARY.md](DELIVERY-SUMMARY.md) - What's included
3. **Technical:** [FINAL-IMPLEMENTATION-v2.5.1.md](FINAL-IMPLEMENTATION-v2.5.1.md) - Implementation details

### For Understanding:
1. **Main README:** [README.md](README.md) - Project overview
2. **Changelog:** [CHANGELOG-v2.5.1.md](CHANGELOG-v2.5.1.md) - What's new
3. **How to build:** [HOW-TO-BUILD.md](HOW-TO-BUILD.md) - Original build guide

---

## 🔴 Common Mistakes

### ❌ Mistake #1: Building in WSL
```bash
# This is WRONG - Do NOT do this!
user@WSL:~/BPSR-Meter$ pnpm install
user@WSL:~/BPSR-Meter$ pnpm dist
# This will fail or create unusable binaries!
```

### ✅ Correct: Building in Windows
```cmd
REM This is CORRECT - Do this!
C:\BPSR-Meter> pnpm install
C:\BPSR-Meter> pnpm dist
REM This will work!
```

### ❌ Mistake #2: Using WSL Node.js
```bash
# WRONG - WSL Node.js
user@WSL:~$ which node
/usr/bin/node  # This is WSL Node.js - WRONG!
```

### ✅ Correct: Using Windows Node.js
```cmd
REM CORRECT - Windows Node.js
C:\> where node
C:\Program Files\nodejs\node.exe  # This is Windows Node.js - CORRECT!
```

---

## 🎯 Build Checklist

Before you start building, verify:

- [ ] I am on **Windows 10 or 11** (not WSL!)
- [ ] I opened **Windows Command Prompt** (not WSL terminal)
- [ ] I installed **Node.js on Windows** (not in WSL)
- [ ] I installed **pnpm on Windows** (not in WSL)
- [ ] I can run `node --version` in Windows CMD
- [ ] I can run `pnpm --version` in Windows CMD
- [ ] I am in the project folder in Windows (e.g., `C:\BPSR-Meter`)

If all boxes are checked, you're ready to build! ✅

---

## 🆘 Still Confused?

### How to Tell if You're in WSL:

**WSL Terminal looks like:**
```bash
user@DESKTOP-ABC123:~/project$
# Notice: username@hostname with ~ (tilde)
```

**Windows CMD looks like:**
```cmd
C:\Users\YourName\project>
# Notice: C:\ drive letter
```

**Windows PowerShell looks like:**
```powershell
PS C:\Users\YourName\project>
# Notice: PS and C:\ drive letter
```

### If You're in WSL:
1. **Exit WSL** - Type `exit` or close the terminal
2. **Open Windows CMD** - Press `Win + R`, type `cmd`, press Enter
3. **Navigate to project** - Use `cd C:\path\to\BPSR-Meter`
4. **Build from there** - Run `build-windows.bat`

---

## 📋 System Requirements

### Minimum (for building):
- **OS:** Windows 10 (64-bit)
- **RAM:** 8 GB
- **Disk:** 5 GB free
- **Internet:** Required

### Recommended (for building):
- **OS:** Windows 11 (64-bit)
- **RAM:** 16 GB
- **Disk:** 10 GB free (SSD)
- **Internet:** Fast connection

### For end users (running):
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4 GB
- **Disk:** 500 MB
- **Other:** Npcap installed

---

## 🎓 Learning Resources

### New to Windows Development?

1. **Command Prompt Basics:**
   - `cd` - Change directory
   - `dir` - List files
   - `cls` - Clear screen

2. **Running as Administrator:**
   - Press `Win + X`
   - Select "Command Prompt (Admin)"

3. **Installing Node.js:**
   - Download from: https://nodejs.org/
   - Run installer
   - Restart Command Prompt

4. **Installing pnpm:**
   ```cmd
   npm install -g pnpm
   ```

---

## 🎉 Ready to Build!

Once you've verified you're on **native Windows** (not WSL), follow these docs:

1. **[WINDOWS-SETUP.md](WINDOWS-SETUP.md)** - Complete setup guide
2. **[BUILD-WINDOWS.md](BUILD-WINDOWS.md)** - Build instructions
3. **[QUICK-START.md](QUICK-START.md)** - How to use

---

## 📞 Need Help?

### Build Issues:
- Check [WINDOWS-SETUP.md](WINDOWS-SETUP.md) troubleshooting section
- Ensure you're on Windows (not WSL!)
- Run Command Prompt as Administrator

### Runtime Issues:
- Install Npcap from https://npcap.com/
- Run BPSR Meter as Administrator
- Check [QUICK-START.md](QUICK-START.md)

---

## ⚡ TL;DR (Too Long; Didn't Read)

```
1. Use Windows (NOT WSL!)
2. Open Windows Command Prompt
3. Run: build-windows.bat
4. Wait 10-15 minutes
5. Find installer in dist_electron/
6. Done!
```

**Remember: WINDOWS ONLY, NOT WSL!** 🪟

---

**Version:** 2.5.1  
**Platform:** Windows 10/11 Native (NOT WSL!)  
**Build Time:** ~10-15 minutes  
**Output:** NSIS Installer (.exe)

**Happy Building!** 🔨✨
