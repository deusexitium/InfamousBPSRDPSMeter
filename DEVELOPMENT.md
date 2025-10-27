# 🛠️ BPSR Meter Development Guidelines

**Last Updated:** October 26, 2025  
**Version:** 3.0.0  
**Status:** 🟢 Living Document

---

## 📋 Table of Contents

1. [Critical Rules](#critical-rules)
2. [Architecture Overview](#architecture-overview)
3. [Code Patterns](#code-patterns)
4. [Common Pitfalls](#common-pitfalls)
5. [Testing Checklist](#testing-checklist)
6. [Deployment](#deployment)

---

## 🚨 CRITICAL RULES

### **NEVER DO THESE:**

1. **❌ Add Frontend Filters on Backend Data**
   - Backend already filters meaningful combat data
   - Frontend should DISPLAY, not filter again
   - **Why:** Aggressive filters hide players with 0 damage (early combat)
   - **Pattern:** `const activePlayers = players;` (trust backend!)

2. **❌ Remove Variable Declarations**
   - Always check for `let html = '';` before `html += ...`
   - **Why:** `ReferenceError: html is not defined`
   - **Pattern:** Declare at function start, append later

3. **❌ Use Placeholder Comments as Code**
   ```javascript
   // WRONG:
   const filtered = players.filter(p => {
       // ... filter logic  ← Returns empty array!
   });
   
   // RIGHT:
   let filtered = filterPlayers(activePlayers);
   ```

4. **❌ Add async/await in autoResizeWindow()**
   - **Why:** Blocks window dragging, makes UI unresponsive
   - **Pattern:** Keep resize functions synchronous

5. **❌ Add Manual Resize Tracking**
   - **Why:** Locks window, causes resize fighting
   - **Pattern:** Let auto-resize handle all sizing

6. **❌ Use SETTINGS.get()**
   - **Why:** SETTINGS is object, not Map
   - **Pattern:** Use `SETTINGS.property` (dot notation)

7. **❌ Skip Null Checks on addEventListener**
   - **Why:** Elements may not exist, causes init crash
   - **Pattern:** `if (element) element.addEventListener(...)`

8. **❌ Add Scrollbars to Settings**
   - **Why:** Poor UX, user explicitly requested no scrollbars
   - **Pattern:** `overflow-y: visible; max-height: none;`

9. **❌ Change skipTaskbar Setting**
   - **Why:** Removes app from taskbar (user complained)
   - **Pattern:** `skipTaskbar: false` always

10. **❌ Modify window.setIgnoreMouseEvents Logic**
    - **Why:** Breaks drag/click functionality
    - **Pattern:** Leave click-through mode as-is

---

## 🏗️ ARCHITECTURE OVERVIEW

### **Frontend → Backend Flow:**

```
┌─────────────┐
│   Frontend  │  Display Layer (main.js, index.html, style.css)
└──────┬──────┘
       │ fetch('/api/data')
       ↓
┌─────────────┐
│   Backend   │  Filtering Layer (api.js, userDataManager)
└──────┬──────┘
       │ getAllUsersData()
       ↓
┌─────────────┐
│   Parser    │  Packet Capture (decoder.js, parser.js)
└─────────────┘
```

### **Separation of Concerns:**

| Layer | Responsibility | DON'T Do Here |
|-------|---------------|---------------|
| **Frontend** | Display, UI interactions | ❌ Data filtering, business logic |
| **Backend** | Filtering, aggregation, API | ❌ UI rendering, styling |
| **Parser** | Packet parsing, decoding | ❌ Data presentation, filtering |

---

## ✅ CODE PATTERNS

### **1. Player Rendering**

```javascript
function renderPlayers() {
    // 1. Get players from STATE
    const players = Array.from(STATE.players.values());
    
    // 2. Trust backend - no frontend filtering!
    const activePlayers = players;
    
    // 3. Apply UI-only filters (solo mode, role tabs)
    let filtered = filterPlayers(activePlayers);
    if (STATE.soloMode) {
        filtered = filtered.filter(p => p.isLocalPlayer || p.uid === STATE.localPlayerUid);
    }
    
    // 4. Mark idle players (30s threshold)
    const now = Date.now();
    const IDLE_THRESHOLD = 30000;
    filtered.forEach(p => {
        const lastUpdate = STATE.playerLastUpdate.get(p.uid) || now;
        p.isIdle = (now - lastUpdate) > IDLE_THRESHOLD;
    });
    
    // 5. Sort and render
    const sorted = sortPlayers(filtered);
    
    // 6. ALWAYS declare html before appending
    let html = '';
    html += `<div>...</div>`;
    
    list.innerHTML = html;
}
```

### **2. Auto Resize (MUST be Synchronous)**

```javascript
function autoResizeWindow() {
    // NO async/await - blocks dragging!
    
    const list = document.getElementById('player-list');
    if (!list) return;
    
    const contentHeight = list.scrollHeight;
    const newHeight = Math.max(minHeight, contentHeight + padding);
    
    // Threshold prevents micro-adjustments
    if (Math.abs(newHeight - currentHeight) > 10) {
        window.resizeTo(currentWidth, newHeight);
    }
}
```

### **3. Settings Object Access**

```javascript
// ✅ CORRECT:
const value = SETTINGS.compactMode;
SETTINGS.compactMode = true;

// ❌ WRONG:
const value = SETTINGS.get('compactMode');  // Not a Map!
```

### **4. Event Listeners**

```javascript
// ✅ CORRECT:
const button = document.getElementById('btn-clear');
if (button) {
    button.addEventListener('click', handleClear);
}

// ❌ WRONG:
document.getElementById('btn-clear').addEventListener('click', handleClear);
// Crashes if button doesn't exist!
```

### **5. CSS No-Scrollbar Pattern**

```css
.settings-panel {
    display: none;
    padding: 12px;
    max-height: none;  /* No height limit */
    overflow-y: visible;  /* No scrollbars */
}
```

---

## ⚠️ COMMON PITFALLS

### **Symptom → Root Cause → Solution**

| Symptom | Root Cause | Solution |
|---------|-----------|----------|
| **"Waiting for combat data..." forever** | Frontend filter too aggressive | Remove filter, trust backend |
| **`ReferenceError: html is not defined`** | Missing `let html = '';` | Always declare before use |
| **`ReferenceError: X is not defined`** | Comment placeholder as code | Replace comment with actual code |
| **Window won't drag** | async/await in resize function | Remove async/await |
| **Window unresponsive** | Manual resize tracking | Remove tracking, use auto-resize |
| **Buttons don't work** | Init crash, listeners not attached | Check console for errors, add null checks |
| **Settings have scrollbars** | `max-height` + `overflow: auto` | Remove max-height, use `overflow: visible` |
| **White borders** | Transparent background | Set `backgroundColor: '#1a1d29'` |
| **Not in taskbar** | `skipTaskbar: true` | Set `skipTaskbar: false` |

---

## 🧪 TESTING CHECKLIST

### **Before Every Commit:**

- [ ] App launches without errors
- [ ] Console has no red errors
- [ ] Players display when in combat
- [ ] Compact mode toggles correctly
- [ ] Window can be dragged
- [ ] Window resizes automatically
- [ ] Settings open without scrollbars
- [ ] No white borders visible
- [ ] App appears in Windows taskbar
- [ ] Click-through mode works

### **Before Every Release:**

- [ ] All above checks pass
- [ ] Remove all debug console.log statements
- [ ] Update version in 5 files:
  - package.json
  - public/index.html (3 locations)
  - public/js/main.js (2 locations)
  - server.js
- [ ] Update CHANGELOG.md
- [ ] Update README.md
- [ ] Test installer on clean Windows install
- [ ] Verify Npcap compatibility

---

## 📦 DEPLOYMENT

### **Version Number Format:**

- **Major (X.0.0):** Breaking changes, major features
- **Minor (X.Y.0):** New features, backwards compatible
- **Patch (X.Y.Z):** Bug fixes only

### **Release Checklist:**

1. **Update Version Numbers:**
   ```bash
   # Update all 5 files with new version
   grep -r "v2.99.8" . --include="*.js" --include="*.json" --include="*.html"
   ```

2. **Remove Debug Code:**
   - Remove console.log() for performance
   - Remove debug logging in renderPlayers()
   - Keep error logging (console.error)

3. **Build:**
   ```bash
   bash build-from-wsl.sh
   ```

4. **Test Installer:**
   - Install on clean Windows 10/11
   - Verify Npcap compatibility
   - Test all features

5. **Git Tag:**
   ```bash
   git tag -a v3.0.0 -m "v3.0.0 - Stable Release"
   git push origin v3.0.0
   ```

6. **GitHub Release:**
   - Upload installer (.exe)
   - Copy changelog
   - Mark as latest release

---

## 📝 CODE REVIEW CHECKLIST

### **Before Approving Changes:**

- [ ] No aggressive frontend filters on backend data
- [ ] All variables declared before use
- [ ] No placeholder comments as code
- [ ] All event listeners have null checks
- [ ] No async/await in resize functions
- [ ] SETTINGS uses dot notation, not .get()
- [ ] No scrollbars in settings
- [ ] backgroundColor set in electron-main.js
- [ ] Body background matches window background
- [ ] skipTaskbar is false
- [ ] Console errors handled appropriately

---

## 🐛 DEBUGGING GUIDE

### **Data Not Showing:**

1. Check backend logs: "Game server detected"
2. Check frontend console: No errors?
3. Check fetchPlayerData: Returns players?
4. Check renderPlayers: Players in STATE?
5. **Most Common:** Aggressive filter hiding players
   - Solution: Remove frontend filter, trust backend

### **Window Issues:**

1. **Can't drag:** Check for async/await in resize
2. **Unresponsive:** Check for resize tracking
3. **Slow expansion:** Check debounce timing (100ms minimum)
4. **White borders:** Check backgroundColor in electron-main.js and body CSS

### **UI Issues:**

1. **Buttons broken:** Init crash, check console
2. **Scrollbars:** Check max-height and overflow settings
3. **Invisible space:** Check resize threshold (>10px)
4. **Not in taskbar:** Check skipTaskbar setting

---

## 🔄 VERSION HISTORY LESSONS

### **v2.99.5:** Fixed window close crash
- **Lesson:** Always check if window exists before calling methods
- **Pattern:** `if (!mainWindow || mainWindow.isDestroyed()) return;`

### **v2.99.6:** Fixed activeNonIdlePlayers error
- **Lesson:** Pass variables as parameters, don't rely on scope
- **Pattern:** `function updateStatusBar(activeNonIdlePlayers = []) { ... }`

### **v2.99.7:** Restored filter logic
- **Lesson:** Placeholder comments are not code!
- **Pattern:** Replace comments with actual implementation

### **v2.99.8:** Multiple fix attempts
- **Lesson:** Test after EVERY change, not after multiple changes
- **Lesson:** Incremental fixes safer than large refactors
- **Lesson:** Always declare variables before use

---

## 📚 RESOURCES

### **Key Files:**

- `electron-main.js` - Window configuration, Electron settings
- `public/js/main.js` - Frontend logic, rendering
- `src/server/api.js` - Backend API, data filtering
- `public/css/style.css` - UI styling
- `CHANGELOG.md` - Version history

### **Important Functions:**

- `renderPlayers()` - Main rendering logic
- `autoResizeWindow()` - Window sizing (MUST be sync!)
- `filterPlayers()` - UI-only filtering (role tabs)
- `updateStatusBar()` - Status bar updates
- `fetchPlayerData()` - API data fetching

### **Documentation:**

- Electron: https://www.electronjs.org/docs
- Npcap: https://npcap.com/
- Node.js: https://nodejs.org/docs

---

## ✨ BEST PRACTICES

1. **Trust the Backend** - It knows what data is meaningful
2. **Declare Before Use** - Always declare variables at function start
3. **Test Incrementally** - One change at a time
4. **Keep Sync** - No async/await in UI-critical functions
5. **Null Check Everything** - Elements may not exist
6. **No Scrollbars** - Poor UX, design for fixed content
7. **Match Colors** - body background = window background
8. **Minimal Debounce** - 100ms minimum for stability
9. **Log Errors** - Keep console.error for debugging
10. **Version Everywhere** - Update all 5 files consistently

---

**Remember:** This is a living document. Update it whenever you encounter a new pattern or pitfall!

**Last Major Update:** v3.0.0 - October 26, 2025  
**Next Review:** v3.1.0 or when major issues arise
