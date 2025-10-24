# BPSR Meter v2.5.1 - Quick Start Guide

## 🚀 Ready to Share Your DPS!

This is the **ultimate unified DPS meter** with **Discord-ready export** functionality!

---

## ⚡ Quick Start (3 Steps)

### 1. Build the Application
```bash
cd /development/BPSR-Meter
pnpm install
pnpm dist
```

### 2. Install & Run
- Find installer: `dist_electron/BPSR Meter Setup 2.5.1.exe`
- Run as Administrator
- Launch BPSR Meter

### 3. Share Your DPS!
- Click **Export** button (download icon)
- Click **Copy to Clipboard**
- Paste in Discord (Ctrl+V)
- Done! 🎉

---

## 📊 What You'll See

### Compact UI (Like Screenshot 1)
```
┌─────────────────────────────────────────────────────┐
│ [≡] [⚙] [↓] [↻]         00:00  [🔓] [✕]           │
├─────────────────────────────────────────────────────┤
│  ALL  │  DPS  │  TANK  │  HEAL                     │
├─────────────────────────────────────────────────────┤
│ 1 ★ YourName [DPS]    6.8k  1.3k  66k  2.7k  94%  │
│   ████████████░░░░                                  │
├─────────────────────────────────────────────────────┤
│ 2   Player2 [TANK]    5.2k  1.7k  30k  0    0%    │
│   ██████░░░░░░░░░░                                  │
└─────────────────────────────────────────────────────┘
```

### Stats Displayed
- **DPS** - Damage per second
- **HPS** - Healing per second  
- **TOTAL DMG** - Total damage
- **DMG TAKEN** - Damage received
- **% DMG** - Your contribution ⭐
- **TOTAL HEAL** - Healing done

---

## 🎯 Key Features

### 1. Copy to Clipboard (Discord Ready!)
**Output:**
```
📊 BPSR Meter - 05:23

1. YourName (DPS)
   DPS: 12.7k | Total: 2.1M | 34% DMG
2. Teammate (TANK)
   DPS: 8.3k | Total: 1.4M | 23% DMG
```

### 2. Export Options
- **Copy to Clipboard** - For Discord/chat
- **Export CSV** - For spreadsheets
- **Export Markdown** - For documentation

### 3. Player Details
- Click any player row
- See complete skill breakdown
- Export individual player data

### 4. Filter Tabs
- **ALL** - View everyone
- **DPS** - Only DPS classes
- **TANK** - Only tanks
- **HEAL** - Only healers

### 5. Smart Features
- ✅ Data persists (no clearing on refresh)
- ✅ Player database (remembers names)
- ✅ Duration counter
- ✅ Settings persistence
- ✅ Local player highlighting (★)

---

## 🎮 Usage Examples

### Share in Discord
1. Finish dungeon
2. Click Export → Copy to Clipboard
3. Paste in Discord channel
4. Everyone sees the rankings!

### Analyze Performance
1. Click any player
2. See skill-by-skill breakdown
3. Export individual data
4. Compare with teammates

### Track Progress
1. Export CSV after each run
2. Open in Excel/Sheets
3. Compare runs over time
4. See improvement!

---

## ⚙️ Settings

Click the **gear icon** to configure:
- Highlight local player
- Show/hide Gear Score
- Refresh interval (1-10 seconds)
- Remember player names

All settings persist across restarts!

---

## 🔧 Controls

| Button | Function |
|--------|----------|
| ≡ | Drag to move window |
| ⚙ | Open settings |
| ↓ | Export data |
| ↻ | Reset data |
| 🔓/🔒 | Lock/unlock position |
| ✕ | Close application |

---

## 💡 Tips

### For Best Results:
1. Run as Administrator
2. Install Npcap (WinPcap mode)
3. Start game before meter
4. Change instance once if no data

### For Sharing:
1. Use "Copy to Clipboard" for quick sharing
2. Use CSV for detailed analysis
3. Use Markdown for documentation

### For Performance:
1. Adjust refresh interval in settings
2. Use filter tabs to reduce clutter
3. Reset data between encounters

---

## 🎊 What Makes This Special

### vs. Other Meters:
- ✅ **Export functionality** - Share your DPS easily!
- ✅ **Copy to clipboard** - Discord-ready format
- ✅ **Compact UI** - Minimal screen space
- ✅ **All stats visible** - Complete information
- ✅ **Data persistence** - No more loss
- ✅ **Player database** - Gets smarter over time

### Combines Best Of:
- **mrsnakke** - Compact layout + % DMG
- **winjwinj** - Detailed stats + analytics
- **NEW** - Export system + sharing

---

## 📝 Quick Reference

### Keyboard Shortcuts
- None currently (all mouse-driven)

### File Locations
- **Settings:** localStorage (browser)
- **Player DB:** localStorage (browser)
- **Exports:** Downloads folder

### Data Persistence
- Data accumulates until manual reset
- Player names saved permanently
- Settings saved permanently

---

## 🐛 Troubleshooting

### No Data Showing?
1. Install Npcap
2. Run as Administrator
3. Change instance once
4. Check firewall

### "Unknown" Players?
- Database grows over time
- Change instance to trigger name packets
- Names saved for future encounters

### Export Not Working?
- Check browser permissions
- Allow clipboard access
- Try different export format

---

## 🎉 You're Ready!

**That's it!** You now have the **ultimate DPS meter** with:
- ✅ Compact, professional UI
- ✅ All stats visible
- ✅ Discord-ready export
- ✅ Data persistence
- ✅ Growing player database

**Go show off your DPS!** 🎮✨📊

---

**Version:** 2.5.1  
**Status:** Ready to Use  
**Support:** See README.md for details

**Happy Gaming!** 🎮
