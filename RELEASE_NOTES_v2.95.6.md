# 🎉 Infamous BPSR DPS Meter v2.95.6 - Release Notes

## ⚔️ The Player Details Fix Release

This release fixes the critical player expansion feature that was broken in v2.95.5. Players can now click on any player row to view detailed stats and skills!

---

## 🐛 Critical Fixes

### Player Expansion Finally Works!
- **Fixed:** Removed duplicate click handler causing immediate collapse
- **Result:** Click any player → Details expand → Shows stats & skills
- **Impact:** Core feature now fully functional

### Technical Details
- Removed old event delegation handler (line 1454)
- Single per-row click handler now works correctly
- No more double-toggle behavior

---

## ✨ Key Features (Restored/Working)

### 📊 Player Details Panel
Click any player to see:
- **Combat Stats:** Crit Rate, Lucky Rate, Max Damage, Haste, Mastery
- **Top 10 Skills:** Skill name, Total DMG, Hits, Crit%, Avg DMG
- **Copy Buttons:** Two options for exporting data

### 📋 Flexible Copy Options
- **Copy Stats Only:** Basic player statistics
- **Copy with Skills:** Full stats + top 15 skill breakdown with formatting

### 💾 Session Management
- **Save Sessions:** Manually save current combat data
- **Auto-Save:** Automatic save on character switch
- **Load Sessions:** View past combat encounters
- **Delete Sessions:** Clean up old data via modal

### 🎯 Auto-Detection
- **Local Player:** Automatically identifies your character
- **Network Adapter:** Selects adapter with most traffic
- **VPN Support:** Works with ExitLag, WTFast, etc.

---

## 🔄 Changes from v2.95.5

| Feature | v2.95.5 | v2.95.6 |
|---------|---------|---------|
| Player Expansion | ❌ Broken | ✅ Working |
| Click Handlers | 2 (conflicting) | 1 (working) |
| Details Display | Not showing | Shows correctly |
| Copy Buttons | Invisible | Visible & functional |

---

## 📦 Installation

### Windows Users (Recommended)
1. Download `Infamous BPSR DPS Meter-Setup-2.95.6.exe`
2. Run installer as Administrator
3. Install Npcap if prompted
4. Launch from Start Menu or Desktop shortcut

### Requirements
- **OS:** Windows 10/11 (64-bit)
- **Npcap:** v1.83+ (included/prompted)
- **Permissions:** Administrator rights
- **Blue Protocol:** Global or Chinese server

---

## 🧪 Testing

### Verified Working
- ✅ Player row expansion
- ✅ Skills display
- ✅ Copy buttons (both options)
- ✅ Session management modal
- ✅ Start Menu shortcuts
- ✅ Window movement
- ✅ VPN compatibility

### Test Cases Passed
1. Click player → Details expand ✅
2. Click again → Details collapse ✅
3. Copy Stats Only → Clipboard populated ✅
4. Copy with Skills → Full data copied ✅
5. Manage Sessions modal → Fully interactive ✅

---

## 🔧 For Developers

### Build from Source
```bash
# Clone repository
git clone https://github.com/beaRSZT/BPSR_dev.git
cd BPSR_dev

# Install dependencies
pnpm install

# Build MSI (Windows only)
pnpm dist
```

### Project Structure
```
BPSR-Meter/
├── public/
│   ├── js/
│   │   └── main.js          # Main UI logic
│   ├── css/
│   │   └── style.css        # Styling
│   └── index.html           # Main window
├── src/
│   ├── server/
│   │   ├── sniffer.js       # Packet capture
│   │   └── api.js           # REST endpoints
│   └── algo/
│       └── packet.js        # Packet parsing
├── server.js                # Backend entry
├── electron-main.js         # Electron window
└── package.json             # Dependencies
```

### Key Files Changed
- `public/js/main.js` (line 1449): Removed duplicate handler
- `package.json`: Version bump 2.95.5 → 2.95.6
- `server.js`: Version string updated
- `public/index.html`: Version in title

---

## 🐛 Known Issues

### None in v2.95.6
All reported issues from v2.95.5 have been fixed.

### If You Experience Issues
1. Check console logs (F12 in app)
2. Verify running as Administrator
3. Ensure Npcap is installed
4. Check network adapter selection in logs
5. Report issues at: https://github.com/beaRSZT/BPSR_dev/issues

---

## 📊 Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| 2.95.6 | 2025-10-24 | Fixed player expansion |
| 2.95.5 | 2025-10-24 | Modal fixes, Start Menu |
| 2.95.4 | 2025-10-24 | Resize loop fix |
| 2.95.3 | 2025-10-24 | Copy buttons, sessions |
| 2.95.2 | 2025-10-24 | Session system |
| 2.95.0 | 2025-10-22 | Anti-stuck system |

See [CHANGELOG.md](CHANGELOG.md) for complete history.

---

## 🙏 Credits

**Enhanced Edition Development:**
- **beaRSZT** - v2.95.x series, bug fixes, session system

**Original Authors:**
- **dmlgzs** - StarResonanceDamageCounter base
- **MrSnakeVT** - Engine improvements
- **NeRooNx** - Modern UI design

**Community:**
- Beta testers who reported issues
- Blue Protocol players for feedback

---

## 📄 License

Licensed under AGPL-3.0. See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **Repository:** https://github.com/beaRSZT/BPSR_dev
- **Issues:** https://github.com/beaRSZT/BPSR_dev/issues
- **Wiki:** https://github.com/beaRSZT/BPSR_dev/wiki
- **Releases:** https://github.com/beaRSZT/BPSR_dev/releases

---

## 📞 Support

**Need Help?**
- Check [README.md](README.md) for installation guide
- Search [Issues](https://github.com/beaRSZT/BPSR_dev/issues) for solutions
- Open new issue with:
  - OS version
  - Console logs
  - Steps to reproduce
  - Screenshots if applicable

---

## 🎮 Enjoy the Meter!

Thank you for using Infamous BPSR DPS Meter. May your crits be high and your stats accurate! ⚔️
