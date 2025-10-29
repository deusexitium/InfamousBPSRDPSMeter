# BPSR Meter - Development TODO
**Last Updated:** v3.1.143 (Oct 29, 2025)

---

## 🎯 GUIDING PRINCIPLES
- ✅ **Low Risk First** - No major refactoring that breaks things
- ✅ **Quick Wins** - Features users will immediately notice
- ✅ **Incremental** - Small, testable changes
- ✅ **Stable** - Don't break what's working

---

## 📋 PHASE 1: Quick Wins (Low Risk, High Impact)
**Goal:** Improve UX with minimal code changes  
**Est. Time:** 3-5 hours total  
**Risk:** ⬇️ LOW

### Task 1.1: Session Manager Popup Integration ⚡ EASY
**Status:** 🟡 Infrastructure exists, needs wiring  
**Time:** 2-3 hours  
**Files:** `public/js/main.js` (2 lines to change)

**Changes Needed:**
- [ ] Line 2568: Replace `openSessionManager()` with IPC call
- [ ] Line 3435: Replace `openSessionManager()` with IPC call
- [ ] Test popup opens correctly
- [ ] Test session loading/saving works
- [ ] Test drag functionality

**Code Change:**
```javascript
// REPLACE THIS:
openSessionManager();

// WITH THIS:
if (window.electronAPI?.openSessionManagerWindow) {
    window.electronAPI.openSessionManagerWindow();
} else {
    openSessionManager(); // Fallback for non-Electron
}
```

**Benefits:**
- ✅ Better UX (larger window, not constrained)
- ✅ More professional look
- ✅ Infrastructure already exists
- ✅ Can keep old modal as fallback

**Testing Checklist:**
- [ ] Click "Manage Sessions" button
- [ ] Popup window opens (not modal)
- [ ] Can drag window around
- [ ] Session list loads correctly
- [ ] Can load a session
- [ ] Can delete a session
- [ ] Changes sync to main window
- [ ] Close button works

---

### Task 1.2: Unknown Boss ID Export UI ⚡ VERY EASY
**Status:** 🔴 Backend complete, no UI  
**Time:** 1-2 hours  
**Files:** `public/settings-popup.html`, `public/js/settings-popup.js`

**Changes Needed:**
- [ ] Add "Export Unknown IDs" button to Settings popup
- [ ] Fetch data from `/api/mappings/unknown`
- [ ] Copy JSON to clipboard
- [ ] Show success message
- [ ] Create GitHub issue template

**Steps:**

**Step 1: Add Button to Settings Popup (15 mins)**
```html
<!-- Add to settings-popup.html after other buttons -->
<div class="setting-group">
    <label>Boss Mapping Contributions</label>
    <button id="btn-export-unknown-ids" class="btn-secondary">
        <i class="fa-solid fa-upload"></i> Export Unknown Boss IDs
    </button>
    <small>Copy unknown boss/mob IDs to share with the community</small>
</div>
```

**Step 2: Add Handler to settings-popup.js (30 mins)**
```javascript
// Add click handler
document.getElementById('btn-export-unknown-ids')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/mappings/unknown');
        const { code, unknownIds } = await response.json();
        
        if (code !== 0 || !unknownIds) {
            alert('No unknown IDs found!');
            return;
        }
        
        const count = Object.keys(unknownIds).length;
        if (count === 0) {
            alert('No unknown IDs to export!');
            return;
        }
        
        // Format for GitHub issue
        const formatted = JSON.stringify(unknownIds, null, 2);
        await navigator.clipboard.writeText(formatted);
        
        alert(`✅ Copied ${count} unknown IDs to clipboard!\n\nPaste this into a GitHub issue to contribute.`);
    } catch (err) {
        console.error('Export failed:', err);
        alert('❌ Export failed: ' + err.message);
    }
});
```

**Step 3: Create GitHub Issue Template (15 mins)**
Create: `.github/ISSUE_TEMPLATE/boss-mapping.md`
```markdown
---
name: 🗺️ Boss/Mob Mapping Contribution
about: Submit unknown boss/mob IDs to help improve the mapping database
title: '[MAPPING] Unknown IDs from [Your Name]'
labels: mapping, data, community
assignees: ''
---

## Unknown Boss/Mob IDs

**Exported from:** BPSR Meter v3.1.143+  
**Date:** YYYY-MM-DD

**Instructions:**
1. Click "Export Unknown IDs" in Settings
2. Paste the JSON below
3. Submit issue

**Unknown IDs JSON:**
```json
{
  "Paste your exported JSON here"
}
\```

**Additional Context:**
- Where did you encounter these? (dungeon/raid/open world)
- Any patterns or observations?
- Boss names if you recognize them?
```

**Benefits:**
- ✅ Community can contribute easily
- ✅ Crowdsourced mapping database
- ✅ Zero risk (read-only feature)
- ✅ Takes 1-2 hours total

**Testing Checklist:**
- [ ] Button appears in Settings
- [ ] Click button
- [ ] Unknown IDs copied to clipboard
- [ ] Success message shows
- [ ] Paste works in text editor
- [ ] JSON is valid
- [ ] GitHub issue template exists

---

## 📋 PHASE 2: Polish Features (Low Risk, Nice to Have)
**Goal:** Add features that enhance gameplay experience  
**Est. Time:** 5-8 hours total  
**Risk:** ⬇️ LOW

### Task 2.1: Show Map Info in Sessions
**Status:** 🔴 Data exists, not displayed  
**Time:** 1-2 hours  
**Files:** `public/js/session-manager-popup.js`, `public/session-manager-popup.html`

**Changes Needed:**
- [ ] Display map name in session list
- [ ] Show channel count in tooltip
- [ ] Fetch mapping data on session load

**Example Display:**
```
Session: 5p - 123.4K DPS - 2m 34s
Map: Asteria Plains (400 channels)
Date: Oct 29, 2025 7:00pm
```

**Benefits:**
- ✅ Context for sessions
- ✅ Easy to identify which dungeon/raid
- ✅ Uses existing mapping data

---

### Task 2.2: Boss Respawn Timer (Optional Feature)
**Status:** 🔴 Not started  
**Time:** 4-6 hours  
**Files:** New module or add to existing

**Features:**
- [ ] Track boss death timestamp
- [ ] Calculate next respawn time
- [ ] Show countdown in UI
- [ ] Desktop notification on respawn
- [ ] Persist timers across app restart

**UI Mockup:**
```
┌──────────────────────────────┐
│  Boss Respawn Timers         │
├──────────────────────────────┤
│  Golden Juggernaut           │
│  🔥 Respawns in: 42:15       │
├──────────────────────────────┤
│  Frost Ogre                  │
│  ⏰ Respawns in: 1:23:45     │
└──────────────────────────────┘
```

**Benefits:**
- ✅ Useful for open world farming
- ✅ Competitive advantage
- ✅ Uses existing boss mapping data

**Complexity:**
- ⚠️ Needs timestamp persistence
- ⚠️ Requires UI space
- ⚠️ Must handle app restarts

---

### Task 2.3: Advanced Healer Metrics (Optional)
**Status:** 🟡 Core metrics complete, advanced missing  
**Time:** 6-8 hours  
**Files:** `src/server/dataManager.js`, packet parsers

**Missing Metrics:**
- [ ] Dispel tracking (debuff removals)
- [ ] Shield tracking (damage absorbed)
- [ ] HoT breakdown (heal over time analysis)
- [ ] Buff uptime (damage/healing buffs)

**Benefits:**
- ✅ More accurate healer analysis
- ✅ Competitive raid metrics
- ✅ Healer optimization

**Complexity:**
- ⚠️ Requires packet identification
- ⚠️ Testing needs real raid data
- ⚠️ Medium risk of bugs

---

## 📋 PHASE 3: Performance Monitoring (Low Risk, Diagnostic)
**Goal:** Add tools to monitor app performance  
**Est. Time:** 2-3 hours  
**Risk:** ⬇️ VERY LOW

### Task 3.1: Performance Stats Panel
**Status:** 🔴 Not started  
**Time:** 2-3 hours  
**Files:** New settings section

**Features:**
- [ ] Show current player count
- [ ] Show memory usage
- [ ] Show broadcast bandwidth
- [ ] Show skill tracking status
- [ ] Show packet capture rate

**UI Mockup:**
```
┌──────────────────────────────┐
│  Performance Stats           │
├──────────────────────────────┤
│  Players Tracked: 357        │
│  Players Broadcast: 30       │
│  Skills Tracked: 30          │
│  Memory Usage: 45 MB         │
│  Bandwidth: 15 KB/s          │
│  Packet Rate: 150/s          │
└──────────────────────────────┘
```

**Benefits:**
- ✅ Diagnostic tool
- ✅ Verify optimizations working
- ✅ Debug performance issues
- ✅ Zero risk (read-only)

---

## 📋 PHASE 4: Bug Fixes & Refinements
**Goal:** Address any reported issues  
**Est. Time:** Variable  
**Risk:** ⬇️ LOW

### Task 4.1: User-Reported Bugs
**Status:** 🟢 Tracking list  
**Process:**
1. User reports issue
2. Reproduce locally
3. Identify root cause
4. Fix with minimal changes
5. Test thoroughly
6. Release patch version

**Current Known Issues:**
- None reported for v3.1.143

---

## 🚫 DEFERRED ITEMS (Not Doing Now)
**Reason:** High risk or major refactoring

### Code Modularization
- **Status:** ⛔ DEFERRED
- **Reason:** High risk of breaking existing functionality
- **Decision:** Wait until codebase is stable for 2-3 months
- **Complexity:** 16-21 hours, requires extensive testing

---

## 📊 SUMMARY

### Recommended Next Steps (Pick Your Priorities):

**Option A: Quick Wins Only (3-5 hours)**
- ✅ Session Manager popup integration (2-3 hours)
- ✅ Unknown ID export UI (1-2 hours)
- Release: v3.1.144

**Option B: Quick Wins + One Polish Feature (6-9 hours)**
- ✅ Option A items (3-5 hours)
- ✅ Map info in sessions (1-2 hours)
- ✅ Performance stats panel (2-3 hours)
- Release: v3.1.145

**Option C: Full Polish Pass (12-17 hours)**
- ✅ All of Option B
- ✅ Boss respawn timers (4-6 hours)
- ✅ Advanced healer metrics (6-8 hours)
- Release: v3.2.0

---

## ✅ APPROVAL CHECKLIST

**Phase 1 Tasks (Mark which ones to do):**
- [x] Task 1.1: Session Manager Popup Integration (2-3 hrs, LOW risk) ⚡ **COMPLETED v3.1.144**
- [x] Task 1.2: Unknown Boss ID Export UI (1-2 hrs, VERY LOW risk) ⚡ **COMPLETED v3.1.144**

**Phase 2 Tasks (Optional, pick any):**
- [x] Task 2.1: Show Map Info in Sessions (1-2 hrs) **COMPLETED v3.1.144**
- [ ] Task 2.2: Boss Respawn Timer (4-6 hrs) **DEFERRED**
- [ ] Task 2.3: Advanced Healer Metrics (6-8 hrs) **DEFERRED**

**Phase 3 Tasks (Optional):**
- [ ] Task 3.1: Performance Stats Panel (2-3 hrs)

---

## 📝 NOTES FOR DEVELOPER

**Before Starting Any Task:**
1. ✅ Create new branch: `git checkout -b feature/task-name`
2. ✅ Commit frequently with clear messages
3. ✅ Test after each change
4. ✅ Keep v3.1.143 as rollback point

**Testing Checklist (Every Task):**
- [ ] Feature works as expected
- [ ] No console errors
- [ ] No breaking changes to existing features
- [ ] Build completes successfully
- [ ] Installer runs without errors

**Release Process:**
1. ✅ Update version in package.json
2. ✅ Update version in main.js console logs
3. ✅ Run build script
4. ✅ Test installer
5. ✅ Tag release in git
6. ✅ Create GitHub release with changelog

---

**Last Updated:** Oct 29, 2025  
**Current Version:** v3.1.143  
**Status:** Ready for task selection ✅
