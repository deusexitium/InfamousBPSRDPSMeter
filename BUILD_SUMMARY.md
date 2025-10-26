# Build Summary - v2.95.21

## ✅ Electron Build Complete

**Location:** `F:\dps\Infamous BPSR DPS Meter-Setup-2.95.21.exe`  
**Size:** 89 MB  
**Type:** Windows Installer (NSIS)

## 🎯 Major Changes in This Build

### 1. Compact Mode Complete Redesign
- **40% wider:** 300px → 420px
- **Smaller text:** 9-10px fonts for more data density
- **All buttons visible:** Settings, Lock, Pin, Compact, Minimize, Close
- **More stats:** Shows DPS, Max DPS, Total DMG, % contribution
- **Better scaling:** Proper flexbox layout, no overflow issues

### 2. Skill Translation System
- **Auto-downloads** latest translations from GitHub on startup
- **3 translation files:**
  - `CombinedTranslatedWithManualOverrides.json` (2.7MB)
  - `TalentTable_Clean.json` (210KB)
  - `Conflicts.json`
- **Fallback:** Uses local files if GitHub unavailable
- **Priority:** Manual Override > RecountTable > SkillTable > AI Translation

### 3. Previous Fixes (Still Included)
- ✅ Pointer-events blocking clicks
- ✅ Window movability issues  
- ✅ Lock mode CSS
- ✅ Hex UID bug (49A2A → weaklin)

## 📦 What's Included

### Features
- Real-time DPS tracking
- Player name detection
- Session save/load
- Export (Copy/CSV/Markdown)
- Compact overlay mode
- Always-on-top
- Click-through when locked
- Auto-clear on zone change
- Skill translations (English)

### Files
- Electron app (38.3.0)
- Node.js backend
- Express API server
- Socket.io for real-time updates
- Npcap for packet capture
- Skill translation tables

## 🚫 WPF Version

**Note:** This project does not have a WPF version. It's Electron-only.

If you need a WPF build, that would require:
1. Complete rewrite in C#/WPF
2. Different packet capture library
3. Different UI framework
4. Separate codebase

## 🧪 Testing Checklist

### Compact Mode
- [ ] Window is 420px wide (not 300px)
- [ ] All 6 buttons visible in title bar
- [ ] Text readable at 9-10px
- [ ] Shows: Rank, Name, Role, DPS, Max DPS, Total, % DMG
- [ ] HP bars visible (2px height)
- [ ] Hover effects work
- [ ] Click to expand player details

### Skill Translations
- [ ] Skills show English names (not Chinese/Skill_ID)
- [ ] Downloads from GitHub on first launch
- [ ] Works offline after first download
- [ ] Falls back to Skill_ID if translation missing

### General
- [ ] Your name shows correctly (not hex UID)
- [ ] All buttons clickable
- [ ] Window draggable when unlocked
- [ ] Lock mode enables click-through
- [ ] Sessions save/load correctly

## 📝 Installation

1. Navigate to `F:\dps\`
2. Run `Infamous BPSR DPS Meter-Setup-2.95.21.exe`
3. Follow installer wizard
4. Launch from desktop shortcut

## 🔄 First Launch

On first launch, the app will:
1. Download skill translations from GitHub (~3MB)
2. Save to `%APPDATA%/infamous-bpsr-dps-meter/tables/`
3. Load player name cache from localStorage
4. Migrate any hex UIDs to decimal
5. Start packet capture (requires Npcap)

## 🐛 Known Issues

None currently - all reported issues fixed.

## 📊 File Sizes

- Installer: 89 MB
- Installed: ~250 MB
- Skill translations: 2.9 MB
- Player cache: <1 KB
- Session files: ~10 KB each

## 🔗 Translation Sources

- https://github.com/winjwinj/bpsr-logs/tree/main/raw-game-files/4_Final
- Auto-updates on every app launch
- Cached locally for offline use
