# 🎨 Overlay Implementation Plan - Inspired by bpsr-logs

## 📊 Analysis of bpsr-logs Overlay

### **What They Do Right** ⭐⭐⭐⭐⭐

#### 1. **Perfect Transparency & Window Management**
```json
// tauri.conf.json - Their "live" overlay window
{
    "title": "BPSR Logs - Live",
    "shadow": false,           // ✅ No shadow = cleaner overlay
    "decorations": false,      // ✅ Frameless
    "transparent": true,       // ✅ True transparency
    "minWidth": 400,
    "minHeight": 120,
    "alwaysOnTop": true,
    "skipTaskbar": true        // ✅ Not in taskbar!
}
```

#### 2. **Two-Window Architecture**
- **"live" window** - Minimal overlay (always on top, transparent)
- **"main" window** - Full settings/details (hidden by default)
- Our current approach: Single window trying to do both

#### 3. **Key Features We're Missing**
- ✅ **Skip Taskbar** - Overlay doesn't appear in Alt+Tab
- ✅ **True user-resizable** - No auto-resize fighting user
- ✅ **Shadow: false** - Cleaner look
- ✅ **Minimal initial size** - 400x120 vs our 500x450
- ✅ **Separate settings window** - Clean separation of concerns

---

## 🎯 **What We Need to Implement**

### **Phase 3: Enhanced Overlay Mode** (4-6 hours)

#### A. Add Skip Taskbar (30 minutes)
**Impact:** Overlay won't appear in Alt+Tab or taskbar

```javascript
// electron-main.js
mainWindow = new BrowserWindow({
    width: 420,
    height: 400,
    // ... existing config
    skipTaskbar: true,  // ✅ NEW: Not in taskbar
});
```

#### B. Remove Window Shadow (15 minutes)
**Impact:** Cleaner overlay appearance

```javascript
mainWindow = new BrowserWindow({
    width: 420,
    height: 400,
    transparent: true,
    frame: false,
    hasShadow: false,  // ✅ NEW: No shadow
    // ... rest
});
```

#### C. Improve User Resize Experience (2 hours)
**Problem:** Our auto-resize fights with user manual resize

**Solution:** Detect when user manually resizes, disable auto-resize
```javascript
let userIsResizing = false;
let userPreferredSize = null;

mainWindow.on('will-resize', () => {
    userIsResizing = true;
    clearTimeout(autoResizeDebounce);
});

mainWindow.on('resize', () => {
    if (userIsResizing) {
        userPreferredSize = mainWindow.getSize();
        // Disable auto-resize for this session
    }
});

function autoResizeWindow() {
    // Only auto-resize if user hasn't manually resized
    if (userPreferredSize) return;
    // ... existing logic
}
```

#### D. Add Opacity Control (1 hour)
**Feature:** Let users adjust overlay transparency (like bpsr-logs)

```javascript
// Settings
overlayOpacity: 0.95  // 0.0 to 1.0

// In renderer
document.documentElement.style.opacity = settings.overlayOpacity;

// Or per-element
.meter-container {
    background: rgba(26, 26, 26, calc(var(--overlay-opacity) * 0.9));
}
```

#### E. Separate Settings Window (2 hours)
**Architecture:** Two-window approach like bpsr-logs

```javascript
let mainWindow;      // Compact overlay
let settingsWindow;  // Full settings UI

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 900,
        height: 700,
        parent: mainWindow,
        modal: true,
        show: false,
        frame: true,        // Settings window has frame
        transparent: false,
        skipTaskbar: false, // Shows in taskbar
    });
    
    settingsWindow.loadURL(`http://localhost:${port}/settings.html`);
}

// Open settings from overlay
ipcMain.on('open-settings', () => {
    if (!settingsWindow) createSettingsWindow();
    settingsWindow.show();
});
```

---

### **Phase 4: Advanced Optimizations** (6-8 hours)

#### A. Virtual Scrolling (3 hours)
**Problem:** Rendering 20+ players is slow
**Solution:** Only render visible rows + buffer

```javascript
// Virtual scrolling implementation
const VISIBLE_ROWS = 10;
const BUFFER_ROWS = 2;
const ROW_HEIGHT = 60;

function getVisibleRange(scrollTop) {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const end = start + VISIBLE_ROWS + (BUFFER_ROWS * 2);
    return { start, end };
}

function renderVirtualList(players) {
    const { start, end } = getVisibleRange(scrollContainer.scrollTop);
    const visiblePlayers = players.slice(start, end);
    
    // Only render visible players
    visiblePlayers.forEach((player, index) => {
        const actualIndex = start + index;
        renderPlayerRow(player, actualIndex);
    });
}
```

**Expected Result:** 
- CPU: 8-12% → **2-4%** (70% reduction!)
- Memory: Stable even with 50+ players
- Smooth 60 FPS always

#### B. Incremental DOM Updates (2 hours)
**Problem:** Full re-render every 500ms

**Solution:** Only update changed values
```javascript
const playerElements = new Map(); // uid -> DOM element

function updatePlayerIncremental(player) {
    let el = playerElements.get(player.uid);
    
    if (!el) {
        // First time - create full element
        el = createPlayerElement(player);
        playerElements.set(player.uid, el);
        list.appendChild(el);
    }
    
    // Only update changed values
    if (player.dps !== el.dataset.dps) {
        el.querySelector('.dps').textContent = formatNumber(player.dps);
        el.dataset.dps = player.dps;
    }
    
    if (player.total_damage !== el.dataset.damage) {
        el.querySelector('.damage').textContent = formatNumber(player.total_damage);
        el.dataset.damage = player.total_damage;
    }
    
    // ... only update what changed
}
```

**Expected Result:**
- CPU: 8-12% → **3-5%** (60% reduction)
- Render time: 50ms → **5-10ms** (80% faster)

#### C. WebSocket Delta Updates (2 hours)
**Problem:** Server sends full player data every time

**Solution:** Server sends only changes
```javascript
// Server side (in your backend)
let lastSentState = new Map();

socket.on('request-data', () => {
    const currentState = getPlayerData();
    const changes = [];
    
    currentState.forEach((player, uid) => {
        const last = lastSentState.get(uid);
        if (!last || hasChanged(player, last)) {
            changes.push({
                uid,
                changes: getChangedFields(player, last)
            });
        }
    });
    
    socket.emit('delta-update', { changes });
    lastSentState = new Map(currentState);
});

// Client side
socket.on('delta-update', ({ changes }) => {
    changes.forEach(({ uid, changes }) => {
        const player = STATE.players.get(uid);
        Object.assign(player, changes);
        markPlayerDirty(uid);
    });
    renderIncrementally();
});
```

**Expected Result:**
- Network: 50KB/s → **5-10KB/s** (90% reduction)
- CPU: Faster JSON parsing

#### D. Auto-Updater (1 hour)
**Feature:** Like bpsr-logs auto-update system

```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'ssalihsrz',
    repo: 'InfamousBPSRDPSMeter'
});

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-ready');
});

// Check for updates on startup and every 4 hours
autoUpdater.checkForUpdates();
setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);
```

---

## 🎨 **UI/UX Improvements from bpsr-logs**

### 1. **Cleaner Compact Mode**
**Their design:**
- Minimal padding
- No unnecessary borders
- Clean typography
- Subtle hover effects

**Our changes:**
```css
/* Inspired by bpsr-logs clean design */
.player-row {
    padding: 8px 12px;  /* Was 12px 16px - tighter */
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);  /* Subtle */
    transition: background 0.15s ease;
}

.player-row:hover {
    background: rgba(255, 255, 255, 0.05);  /* Subtle highlight */
}

.stat-value {
    font-variant-numeric: tabular-nums;  /* Aligned numbers */
    font-weight: 600;
}
```

### 2. **Better Column Sizing**
**Their approach:** Fixed widths for consistency

```css
.rank { width: 40px; }
.name { width: 150px; flex-shrink: 0; }
.dps { width: 100px; text-align: right; }
.damage { width: 120px; text-align: right; }
.contrib { width: 60px; text-align: right; }
```

### 3. **Gradient Backgrounds**
**Their design:** Subtle gradients for depth

```css
.meter-container {
    background: linear-gradient(
        135deg,
        rgba(26, 26, 26, 0.95) 0%,
        rgba(18, 18, 18, 0.95) 100%
    );
    backdrop-filter: blur(10px);
}
```

---

## 📋 **Implementation Order**

### **Immediate (v2.96.0)** - Phase 3 Focus
**Time: 4-6 hours**

1. ✅ Add `skipTaskbar: true` (30 min)
2. ✅ Add `hasShadow: false` (15 min)
3. ✅ Improve user resize detection (2 hours)
4. ✅ Add opacity control slider (1 hour)
5. ✅ Create separate settings window (2 hours)

**Expected Benefits:**
- Cleaner overlay (no shadow, no taskbar)
- User can freely resize without fighting auto-resize
- Professional two-window architecture
- Customizable transparency

### **Next Sprint (v2.97.0)** - Phase 4 Focus
**Time: 6-8 hours**

1. ✅ Virtual scrolling for player list (3 hours)
2. ✅ Incremental DOM updates (2 hours)
3. ✅ WebSocket delta updates (2 hours)
4. ✅ Auto-updater system (1 hour)

**Expected Benefits:**
- 70% CPU reduction (8-12% → 2-4%)
- 90% network reduction
- Smooth 60 FPS always
- One-click updates

---

## 🔧 **Technical Comparison**

| Feature | bpsr-logs | Our App (Current) | Our App (After Phase 3+4) |
|---------|-----------|-------------------|---------------------------|
| **Framework** | Tauri 2.0 + Svelte | Electron + Vanilla JS | Electron + Optimized JS |
| **Backend** | Rust | Node.js | Node.js |
| **Skip Taskbar** | ✅ Yes | ❌ No | ✅ Yes |
| **Window Shadow** | ❌ None | ✅ Has shadow | ❌ None |
| **User Resize** | ✅ Free | ⚠️ Fights user | ✅ Free |
| **Opacity Control** | ✅ Yes | ❌ No | ✅ Yes |
| **Two Windows** | ✅ Yes | ❌ Single | ✅ Yes |
| **Virtual Scrolling** | ✅ Yes | ❌ No | ✅ Yes |
| **Incremental Updates** | ✅ Yes | ⚠️ Partial | ✅ Yes |
| **Auto-Updater** | ✅ Yes | ❌ No | ✅ Yes |
| **CPU Usage** | ~2% | 8-12% | ~3-4% |
| **Memory** | Low | Medium | Low |

---

## 🎯 **Quick Wins We Can Implement Right Now**

### **1. Skip Taskbar** (5 minutes)
```javascript
// electron-main.js - Line 90
mainWindow = new BrowserWindow({
    width: 420,
    height: 400,
    skipTaskbar: true,  // ✅ ADD THIS
    // ... rest
});
```

### **2. Remove Shadow** (5 minutes)
```javascript
mainWindow = new BrowserWindow({
    width: 420,
    height: 400,
    hasShadow: false,  // ✅ ADD THIS
    // ... rest
});
```

### **3. Detect User Resize** (30 minutes)
```javascript
let userHasResized = false;

mainWindow.on('will-resize', () => {
    userHasResized = true;
});

function autoResizeWindow() {
    if (userHasResized) return; // Don't fight user
    // ... existing logic
}

// Reset on compact mode toggle
ipcMain.on('toggle-compact', () => {
    userHasResized = false; // Allow auto-resize again
});
```

---

## 💡 **Why Their Approach is Better**

### **Architecture Philosophy**

**bpsr-logs (Tauri):**
- Separate "live" and "main" windows
- Overlay = minimal, always visible
- Settings = full-featured, hidden by default
- Clear separation of concerns

**Our Current Approach:**
- Single window for everything
- Tries to be both overlay and settings UI
- Auto-resize conflicts with user control
- Window size fights between compact and detailed modes

**Our New Approach (After Phase 3):**
- Adopt their two-window architecture
- Overlay window = compact, user-controlled size
- Settings window = full-featured, separate
- Best of both worlds

---

## 🚀 **Implementation Timeline**

### **Week 1: Phase 3** (v2.96.0)
- **Monday:** Skip taskbar, remove shadow, user resize detection
- **Tuesday:** Opacity control slider
- **Wednesday:** Separate settings window
- **Thursday:** Testing and refinement
- **Friday:** Release v2.96.0

**Deliverable:** Professional overlay with user control

### **Week 2: Phase 4** (v2.97.0)
- **Monday-Tuesday:** Virtual scrolling
- **Wednesday:** Incremental DOM updates
- **Thursday:** WebSocket delta updates + Auto-updater
- **Friday:** Testing and release v2.97.0

**Deliverable:** 70% CPU reduction, buttery smooth performance

---

## 📈 **Expected Results**

### **After Phase 3** (v2.96.0)
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Overlay cleanliness | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Professional |
| User control | ⭐⭐ | ⭐⭐⭐⭐⭐ | Full control |
| Taskbar pollution | ❌ Shows | ✅ Hidden | Clean |
| Window shadow | ❌ Has | ✅ None | Cleaner |

### **After Phase 4** (v2.97.0)
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| CPU Usage | 8-12% | 2-4% | **70% less** |
| Render Time | 50ms | 5-10ms | **80% faster** |
| Network | 50KB/s | 5-10KB/s | **90% less** |
| Memory | 200MB | 120MB | **40% less** |
| FPS | 45-55 | 60 | **Smooth** |

---

## 🎨 **Visual Redesign Inspired by bpsr-logs**

### **Before (Current)**
```
┌─────────────────────────────────┐
│ [Buttons Row]                    │
│ ┌─────────────────────────────┐ │
│ │ Rank | Name | DPS | Dmg     │ │
│ │  1   | Tank | 45K | 2.3M   │ │
│ │  2   | DPS  | 42K | 2.1M   │ │
│ └─────────────────────────────┘ │
│ 0 Players | 0 DPS                │
└─────────────────────────────────┘
Large, cluttered, fighting resize
```

### **After (Phase 3+4)**
```
┌──────────────────────────┐
│ ▶ 1 Tank     45K  2.3M  │  ← Clean, minimal
│ ▶ 2 DPS      42K  2.1M  │  ← Smooth animations
│ ▶ 3 Healer   38K  1.9M  │  ← Virtual scrolling
└──────────────────────────┘
  ↑ User-controlled size
  ↑ No shadow, no taskbar
  ↑ 60 FPS smooth scrolling
```

---

## ✅ **Action Items**

### **Right Now (15 minutes)**
1. Add `skipTaskbar: true`
2. Add `hasShadow: false`
3. Test the changes

### **This Session (4 hours)**
4. Implement user resize detection
5. Add opacity control
6. Create separate settings window prototype

### **Next Session (6 hours)**
7. Implement virtual scrolling
8. Implement incremental updates
9. Add auto-updater

---

**Ready to implement Phase 3 & 4 with bpsr-logs-inspired improvements!**
