# 💾 Disk Usage & Cleanup Management

**Last Updated:** October 27, 2025  
**Version:** 3.1.33  
**Purpose:** Track and manage disk usage in development environment AND user machines

---

## 🎯 Automated Cleanup Features (v3.1.30+)

### User Machine Protection
**Auto-cleanup prevents unlimited disk growth:**
- ✅ **History logs:** 30-day retention (older logs auto-deleted)
- ✅ **Sessions:** Max 20 auto-saved sessions (oldest deleted automatically)
- ✅ **Electron logs:** 5 MB rotation limit (2 files max: current + .old)
- ✅ **Periodic saves:** Every 2 minutes during combat (v3.1.31+)

### Cleanup Triggers
1. **On startup:** Cleanup runs 5 seconds after app launch
2. **After save:** Cleanup runs after each history save
3. **Automatic:** No user action required

---

## 📊 Current Disk Usage Breakdown

### Repository Size Analysis

**Total Repository:** ~451 MB

**Major Components:**
- `node_modules/` - **381 MB** (86% of repo)
  - Dependencies, safe to delete and reinstall
  - Excluded from git by `.gitignore`
  
- `algo/` - **11 MB**
  - Packet parsing algorithms
  - Core functionality, DO NOT DELETE
  
- `tables/` - **3.1 MB**
  - Skill translations, names, talents
  - Reference data, DO NOT DELETE
  
- `CombinedTranslatedWithManualOverrides.json` - **2.6 MB**
  - Translation dictionary
  - Reference data, keep
  
- `sampleproto/` - **2.2 MB**
  - Protobuf samples for development
  - Can delete if not actively debugging
  
- `Dist/` - **1.2 MB**
  - Npcap installer for distribution

---

## 🖥️ User Machine Disk Usage

### Application Data Location
**Windows:** `%APPDATA%\Infamous BPSR DPS Meter\`

### Disk Usage on User Machines

**Typical Storage:**
```
History Logs/    Max 30 days      ~varies (auto-cleaned)
Sessions/        Max 20 auto      ~1-2 MB
Settings/        1 file           ~10 KB
Player Map/      1 file           ~50 KB
Electron Log/    2 files          ~10 MB max

Total:           Well-managed, won't grow infinitely
```

**Cleanup Schedule:**
- History logs: Every 30 days (automatic)
- Sessions: Keep last 20 (automatic)
- Electron log: 5 MB rotation (automatic)

**Manual Cleanup:**
Users can safely delete:
- Old session files in `%APPDATA%\Infamous BPSR DPS Meter\sessions\`
- Old history logs in `./logs/` (if app folder is accessible)
- `iniciar_log.txt.old` if exists
  - Keep for user convenience
  
- `public/` - **552 KB**
  - Frontend assets (HTML, CSS, JS, images)
  - Core functionality, DO NOT DELETE
  
- `screenshots/` - **504 KB**
  - README documentation images
  - Keep for GitHub display
  
- `.git/` - **28 MB**
  - Git history and metadata
  - Normal size for active development

---

## 🧹 Automatic Cleanup Mechanisms

### 1. Session Auto-Cleanup
**Location:** `src/server/dataManager.js` - `cleanupOldSessions()`

**What it does:**
- Runs every time a new session is auto-saved
- Keeps only the last **20 auto-saved sessions**
- Manual sessions are NEVER deleted
- Prevents unlimited session accumulation

**Code:**
```javascript
async cleanupOldSessions() {
    const autoSavedSessions = sessionFiles
        .filter(f => f.autoSaved)
        .sort((a, b) => b.timestamp - a.timestamp);
    
    if (autoSavedSessions.length > 20) {
        const filesToDelete = autoSavedSessions.slice(20);
        // Delete oldest sessions
    }
}
```

**Disk Impact:**
- Each session: ~5-50 KB (depends on player count)
- Max 20 sessions: ~1 MB maximum
- Very low disk usage

### 2. Log File Management
**Location:** `electron-main.js` - `logToFile()`

**What it does:**
- Single log file: `iniciar_log.txt` in userData
- Appends to same file (no rotation)
- File location: `%APPDATA%/Infamous BPSR DPS Meter/iniciar_log.txt`

**Current Implementation:**
```javascript
function logToFile(msg) {
    const logPath = path.join(userData, 'iniciar_log.txt');
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}
```

**Potential Issue:** ⚠️ **NO LOG ROTATION**
- Log file grows indefinitely
- Could become large over time
- **RECOMMENDATION:** Add log rotation or size limit

### 3. Temporary Build Files
**Location:** Windows temp during build

**What it does:**
- Build script copies to `C:\Users\<USER>\AppData\Local\Temp\BPSR-Meter-Build`
- Left behind after build completes
- Can accumulate to ~400 MB per build

**Cleanup:** Run `cleanup.sh` (new script)

---

## 🛠️ Manual Cleanup Scripts

### Quick Cleanup (cleanup.sh)

**Usage:**
```bash
# From WSL
cd /development/BPSR-Meter
bash cleanup.sh
```

**What it cleans:**
1. Build artifacts (`dist/`, `dist_electron/`)
2. User data files (`settings.json`, `player_map.json`)
3. Log files (`*.log`, `logs/`)
4. Old archives (`*.tar`, `*.tar.gz`)
5. Temporary files (`*.tmp`, `.cache/`)
6. Old images (`PORTADA*.jpg`)
7. Windows temp build directory

**Safe to run:** ✅ Yes, will not delete source code or dependencies

### Deep Clean (when needed)

```bash
# Remove node_modules (381 MB)
rm -rf node_modules/

# Reinstall dependencies
pnpm install

# Remove git history (NOT RECOMMENDED unless necessary)
# This is DESTRUCTIVE and loses all commit history
# Only do this if repo is too large and you need to start fresh
```

---

## 📁 File Locations by Environment

### Development (WSL/Linux)
- **Source:** `/development/BPSR-Meter/`
- **Logs:** None (logs only in production)
- **Sessions:** None (sessions only in production)
- **Build temp:** `/mnt/c/Users/<USER>/AppData/Local/Temp/BPSR-Meter-Build/`

### Production (Windows User's Machine)
- **App:** `C:\Program Files\Infamous BPSR DPS Meter\`
- **Logs:** `%APPDATA%\Infamous BPSR DPS Meter\iniciar_log.txt`
- **Sessions:** `%APPDATA%\Infamous BPSR DPS Meter\sessions\`
- **Settings:** `%APPDATA%\Infamous BPSR DPS Meter\settings.json`
- **Player Map:** `%APPDATA%\Infamous BPSR DPS Meter\player_map.json`

**%APPDATA% expands to:** `C:\Users\<USER>\AppData\Roaming\`

---

## ⚠️ What NOT to Delete

### NEVER DELETE THESE:
- `algo/` - Core packet parsing
- `src/` - Server-side logic
- `public/` - Frontend application
- `tables/` - Game data (skills, translations)
- `electron-main.js` - Electron entry point
- `server.js` - Backend server entry
- `package.json` - Project configuration
- `.git/` - Version control history
- `.gitignore` - Prevents committing sensitive files

### Safe to Delete (can regenerate):
- `node_modules/` - Reinstall with `pnpm install`
- `dist_electron/` - Rebuild with `pnpm dist`
- `dist/` - Rebuild output
- `*.log` - Log files
- `*.tar`, `*.tar.gz` - Old archives
- `settings.json`, `player_map.json` - User data (dev only)

---

## 🔄 Recommended Maintenance Schedule

### Daily (if actively developing):
- None required (auto-cleanup handles sessions)

### Weekly:
```bash
bash cleanup.sh
```

### Monthly:
```bash
# Check repo size
du -sh /development/BPSR-Meter

# Check largest directories
du -sh /development/BPSR-Meter/*/ | sort -hr | head -10

# If node_modules is stale (old dependencies)
rm -rf node_modules && pnpm install
```

### Before Public Release:
```bash
# Run full cleanup
bash cleanup.sh

# Verify no sensitive data
git status --ignored

# Check repository size
du -sh .
```

---

## 📈 Disk Usage Monitoring

### Check Current Size:
```bash
# Total repository
du -sh /development/BPSR-Meter

# Individual directories
du -sh /development/BPSR-Meter/*/ | sort -hr

# Git history size
du -sh /development/BPSR-Meter/.git
```

### Expected Sizes:
- **Fresh clone (no node_modules):** ~70 MB
- **With node_modules:** ~450 MB
- **With build artifacts:** ~550 MB
- **Warning threshold:** >1 GB (investigate)

---

## 🚨 Issues & Solutions

### Issue: Repository > 1 GB
**Cause:** Accumulated build artifacts, logs, or archives  
**Solution:** Run `bash cleanup.sh`

### Issue: Log file too large
**Cause:** `iniciar_log.txt` grows indefinitely  
**Solution:** Implement log rotation (see Improvements section)

### Issue: Windows temp builds accumulating
**Cause:** Build script doesn't clean temp directory  
**Solution:** `cleanup.sh` now handles this

### Issue: node_modules is huge
**Cause:** Normal for Electron projects (native modules)  
**Solution:** Nothing wrong, this is expected

---

## 🔮 Future Improvements

### 1. Log Rotation
Implement in `electron-main.js`:
```javascript
function logToFile(msg) {
    const logPath = path.join(userData, 'iniciar_log.txt');
    
    // Check file size
    if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        if (stats.size > 5 * 1024 * 1024) { // 5 MB
            // Rotate: rename to .old and start fresh
            fs.renameSync(logPath, logPath + '.old');
        }
    }
    
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}
```

### 2. Build Artifact Auto-Cleanup
Add to `build-from-wsl.sh`:
```bash
# At the end of build script
echo "Cleaning up temp build directory..."
rm -rf "$WIN_TEMP"
```

### 3. Session Size Monitoring
Add warning if sessions directory > 10 MB

### 4. Git LFS for Large Files
If adding more screenshots or assets, consider Git Large File Storage

---

## ✅ Cleanup Checklist

**Before committing:**
- [ ] Run `bash cleanup.sh`
- [ ] Check `git status` for untracked files
- [ ] Verify no `.log`, `.exe`, or user data files
- [ ] Repository size < 500 MB (with node_modules)

**Before release:**
- [ ] Run `bash cleanup.sh`
- [ ] Verify `.gitignore` is working
- [ ] Check no sensitive data in git history
- [ ] Test build process after cleanup

**Monthly maintenance:**
- [ ] Run `bash cleanup.sh`
- [ ] Check disk usage trends
- [ ] Review log file sizes on production machines
- [ ] Update this document if needed
