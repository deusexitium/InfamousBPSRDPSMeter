# Changelog

All notable changes to Infamous BPSR DPS Meter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.96.4] - 2025-10-26 🔧 HOTFIX 4 - Restore Taskbar Visibility

### Fixed
- **CRITICAL:** App not showing in taskbar
  - Changed `skipTaskbar: true` → `skipTaskbar: false`
  - User needs to see app in taskbar (Alt+Tab)
  - Was removed in Phase 3 (bpsr-logs inspiration) but users expect it

### Note
- User reverted to v2.96.3 sizing (900x350, min 800x250)
- Core functionality preserved from previous working version
- **skipTaskbar was the ONLY change needed**

---

## [2.96.3] - 2025-10-26 🔧 HOTFIX 3 - Fix Too Narrow Width

### Fixed
- **CRITICAL:** Window was TOO NARROW - right side buttons cut off
- Initial width: 450px → 900px (show full UI)
- Min width: 350px → 800px (ensure all buttons visible)
- Min height: 150px → 250px
- Max width restored: 1400px → 1600px

### The Real Problem
- Previous versions made window too narrow
- Header buttons (settings, lock, pin, etc) were cut off on right side
- User couldn't see or click critical UI controls
- Window needs minimum 800px width to show complete interface

---

## [2.96.2] - 2025-10-26 🔧 HOTFIX 2 - Width & Responsiveness

### Fixed
- **Width too wide:** Initial width 600→450px, min 400→350px
- **Window constraints:** max 1600→1400px, min height 200→150px
- **Width calculation:** Allow narrower windows (350px minimum)
- **Added debug logging:** Track data fetching for troubleshooting
- **UI responsiveness:** Ensure buttons visible at smaller widths

### Changed
- Initial window: 600x300 → 450x250
- Min width: 400px → 350px
- Max width: 1600px → 1400px
- Min height: 200px → 150px
- Width constraint in auto-resize: 400px → 350px minimum

---

## [2.96.1] - 2025-10-26 🔧 HOTFIX - Accurate Window Sizing

### Fixed
- **CRITICAL:** Window sizing now matches ACTUAL visible content precisely
  - Using `getBoundingClientRect()` for exact measurements
  - Reduced padding from 40px to 10px (minimal safety margin)
  - Debounce reduced from 50ms to 10ms (faster response)
  - Uses `requestAnimationFrame` for immediate DOM-ready resizing
  - Initial window size: 600x300 (smaller, will grow to content)

### Changed
- Window measurement: `container.scrollHeight` → `container.getBoundingClientRect().height`
- Padding: 40px → 10px
- Debounce: 50ms → 10ms  
- Resize trigger: After DOM paint completes
- Min constraints: 400x200 (allows smaller windows)

### Technical
- Force layout calculation before measurement
- Double requestAnimationFrame ensures DOM is painted
- Resize on ANY size difference (not just >20px)
- Faster response time for dynamic content

---

## [2.96.0] - 2025-10-26 🚀 PHASE 3 & 4 - Overlay Perfection

### **Inspired by bpsr-logs Professional Overlay**

#### Major Improvements
- **Skip Taskbar** ✅ Overlay no longer appears in Alt+Tab or taskbar
- **No Window Shadow** ✅ Cleaner, more professional overlay appearance  
- **User Resize Respect** ✅ Auto-resize disabled when user manually resizes
- **Opacity Control** ✅ Adjustable transparency slider (50-100%)
- **Performance Monitoring** ✅ Real-time FPS, memory, DOM tracking

### Added
- **Skip Taskbar** (`skipTaskbar: true`)
  - Overlay doesn't clutter Alt+Tab menu
  - Professional overlay-only experience
  - Not visible in Windows taskbar switcher

- **Shadow Removal** (`hasShadow: false`)
  - Clean overlay without drop shadow
  - Better transparency appearance
  - Matches bpsr-logs aesthetic

- **User Resize Detection**
  - Detects when user manually resizes window
  - Automatically disables auto-resize to respect user preference
  - Resets when toggling compact/detailed mode
  - Saved user-preferred size

- **Opacity Control Slider**
  - Settings UI: 50% to 100% transparency
  - Real-time preview as you slide
  - Persists across sessions
  - Window-level opacity (cleaner than CSS)

### Changed
- Auto-resize now checks `shouldAutoResize()` before resizing
- Window configuration optimized for overlay use case
- Better user experience - no more fighting with auto-resize
- Performance monitoring runs continuously in console

### Technical
- `skipTaskbar: true` - Professional overlay mode
- `hasShadow: false` - Cleaner appearance
- User resize tracking via `will-resize` and `resize` events
- `window.setOpacity()` for true window-level transparency
- IPC channels: `reset-manual-resize`, `should-auto-resize`, `set-overlay-opacity`

### Performance Gains
- ✅ No taskbar pollution (cleaner UX)
- ✅ No shadow rendering (minor CPU savings)
- ✅ User control preserved (no resize fighting)
- ✅ Window-level opacity (better than CSS filters)
- ✅ Foundation for Phase 4 (virtual scrolling, incremental updates)

### What's Next (Phase 4 - v2.97.0)
- Virtual scrolling for large raids (70% CPU reduction)
- Incremental DOM updates (surgical updates only)
- WebSocket delta updates (90% network reduction)
- Auto-updater system (one-click updates)

---

## [2.95.31] - 2025-10-26 ⚡ PHASE 2 OPTIMIZATION + UI FIX

### Fixed
- **CRITICAL:** Invisible window border blocking clicks on other applications
  - Window now resizes to match actual content size (not hardcoded 1000px minimum)
  - Initial window size reduced from 1200x700 to 500x450
  - Auto-resize now checks both width AND height differences
  - Minimum width reduced from 900px to 420px to match compact mode

- **UI responsiveness issues**
  - Added connection status indicator when waiting for combat data
  - Shows last update timestamp and server port info
  - Better error handling for failed API requests
  - Non-responsive buttons fixed by proper window sizing

### Added
- **Phase 2 Performance Optimizations** (60% CPU reduction target)
  - Global error boundary to prevent blank screen crashes
  - Performance monitoring (FPS, Memory, DOM nodes, Render rate)
  - Logs performance metrics every 10 seconds in console
  - Incremental DOM update infrastructure (dirtyPlayers tracking)
  - requestAnimationFrame-based monitoring loop

- **Security enhancements**
  - Content Security Policy (CSP) headers
  - Sandbox mode enabled in renderer process
  - Remote module explicitly disabled
  - XSS protection via CSP

### Changed
- Window initial size optimized for typical use case
- Auto-resize now measures actual content width, not just height
- Performance monitoring runs continuously in background
- Better error messages with stack traces and reload button

### Technical
- CSP: `default-src 'self'; script-src 'self' 'unsafe-inline'; ...`
- Window resize logic: `targetWidth = Math.max(420, Math.min(actualWidth + 40, 1600))`
- Removed hardcoded 1000px minimum width
- Added PerformanceMonitor with FPS and memory tracking
- Global error/unhandledrejection handlers

### Performance Gains (Expected)
- ✅ No more invisible borders consuming screen space
- ✅ Window size matches content (saves memory)
- ✅ Real-time performance visibility in console
- ✅ Graceful error recovery instead of blank screens
- 🎯 Foundation for 60% CPU reduction in future updates

---

## [2.95.30] - 2025-10-26 🔧 CRITICAL FIX

### Fixed
- **CRITICAL:** App crash with exit code 3221225477 (Access Violation) during startup
- Added try-catch wrapper around `Cap.open()` to prevent hard crashes
- Comprehensive error messages now show Node.js version mismatch and troubleshooting steps
- Rebuilt cap native module for compatibility

### Changed
- Packet capture initialization now gracefully handles failures
- Error messages include current vs required Node.js version
- Troubleshooting guide shows Npcap restart and reinstall instructions

### Technical
- Wrapped `this.capInstance.open()` in try-catch block
- Crash caused by Node.js version mismatch (v20.x vs required v22.15.0)
- Native module access violations now caught and reported clearly
- Exit code 3221225477 = Windows Access Violation (0xC0000005)

### Requirements
- **Node.js v22.15.0 or higher** - Critical for native module stability
- Npcap must be running properly
- After Node.js update: run `pnpm install && pnpm rebuild cap`

---

## [2.95.29] - 2025-10-26 ✅ STABLE

### Fixed
- **Windows Electron Transparency Bug** - Implemented "resize trick" to prevent title bar appearing
- Title bar no longer appears when window loses/gains focus on Windows 11
- Transparent frameless window now maintains proper transparency

### Technical - Resize Trick Implementation
- Added focus/blur event handlers that slightly resize window to force redraw
- On focus: +1px width, then restore after 10ms
- On blur: -1px width, then restore after 10ms
- Merged with existing always-on-top focus handler
- Known Windows/Electron bug with `transparent: true` + `frame: false`

### References
- Windows Electron transparency bug affects Windows 10/11
- Exacerbated by Windows 11 Mica effect
- Resize trick forces OS to redraw window correctly

---

## [2.95.28] - 2025-10-26 ✅ STABLE

### Fixed
- **CRITICAL:** Version reading now works in both development and production Electron builds
- Added try/catch fallback for package.json loading
- Hardcoded fallback version if package.json is not accessible in Electron asar

### Technical
- Uses `path.join(__dirname, 'package.json')` with try/catch
- Falls back to hardcoded version in production Electron builds
- Prevents "Cannot find module './package.json'" error

---

## [2.95.27] - 2025-10-26 (BROKEN - DO NOT USE)

### Fixed
- **CRITICAL:** Fixed broken require paths in server.js that prevented app from starting
- Restored correct paths: `PacketProcessor` from `algo/packet.js`
- Restored correct paths: `UserDataManager` from `src/server/dataManager.js`
- App now starts properly without MODULE_NOT_FOUND errors

### Known Issues
- ❌ Cannot find module './package.json' in production Electron build (fixed in v2.95.28)

### Technical
- My previous edit accidentally changed the require paths
- Restored to use `path.join(__dirname, ...)` for proper module resolution

---

## [2.95.26] - 2025-10-26 (BROKEN - DO NOT USE)

### Fixed
- **CRITICAL:** Version number now reads from package.json instead of hardcoded value
- **CRITICAL:** Skill translations no longer initialize in constructor (was causing multiple loads)
- Skill translations now only initialize once in `initialize()` method
- Version number will auto-update with each build

### Changed
- `server.js` now uses `require('./package.json').version`
- Removed duplicate skill translation initialization from constructor

### Known Issues
- ❌ Broken require paths prevent app from starting (fixed in v2.95.27)

---

## [2.95.25] - 2025-10-26

### Added
- **Column headers for compact mode** - Now shows clear labels: #, PLAYER, CUR, MAX, AVG, TOTAL, %
- Headers displayed at top of player list in compact mode

### Changed
- Stat value font size: 9px → 8px for better proportions
- Stat label opacity reduced for better visual hierarchy
- Headers use 7px font with proper spacing

### Fixed
- Missing column headers making compact mode confusing
- Text size imbalance between values and labels

---

## [2.95.24] - 2025-10-26

### Fixed
- **CRITICAL:** Skill translation system initializing multiple times causing crash (exit code 3221225477)
- Added initialization guard to prevent duplicate loads
- Made remote download non-blocking with 10s timeout
- Proper error handling for GitHub download failures

### Changed
- Skill translations now load once and cache the initialized state
- Remote updates happen in background without blocking startup

---

## [2.95.23] - 2025-10-26

### Fixed
- Compact mode stat columns now show proper labels (DPS, MAX, AVG, TOTAL, CONTRIB)
- Added 5 stat columns instead of 3 for more data
- Text scaling improved with proper font sizes (9px values, 6px labels)
- Column sizing fixed with flex-shrink: 0 to prevent squishing

### Changed
- Stat columns: 55px → 48px min-width for better fit
- Added white-space: nowrap to prevent text wrapping
- Better letter-spacing for readability at small sizes

---

## [2.95.22] - 2025-10-26

### Added
- **Skill Translation System** - Auto-downloads English translations from GitHub on startup
  - Downloads 3 files: CombinedTranslatedWithManualOverrides.json (2.7MB), TalentTable_Clean.json (210KB), Conflicts.json
  - Falls back to local files if GitHub unavailable
  - Updates on every app start
  - Translation priority: Manual Override > RecountTable > SkillTable > AI Translation

### Changed
- **Compact Mode Complete Redesign**
  - Width: 300px → 420px (40% wider)
  - Text sizes reduced to 9-10px for more data density
  - All buttons now visible (Settings, Lock, Pin, Compact, Minimize, Close)
  - Shows more stats: Rank, Name, Role, DPS, Max DPS, Total DMG, % contribution
  - Better flexbox layout with proper scaling
  - Smaller gaps and padding for tighter layout

### Fixed
- Constructor initialization errors in UserDataManager
- Missing playerMapPath causing undefined errors
- Removed non-existent loadUserCache() function call
- Duplicate property declarations cleaned up

---

## [2.95.6] - 2025-10-24

### Fixed
- **CRITICAL:** Removed duplicate click handler causing player details to expand then immediately collapse
- Player rows now properly expand when clicked
- Click event handlers no longer conflict with each other

### Technical Details
- Removed old event delegation handler that was interfering with new per-row handlers
- Single-toggle behavior restored for player expansion

---

## [2.95.5] - 2025-10-24

### Fixed
- Manage Sessions modal z-index increased to prevent interaction blocking
- Modal pointer-events explicitly enabled for full interactivity
- Start Menu shortcut creation fixed (removed menuCategory config)

### Changed
- Modal z-index: 9999 → 999999
- Backdrop z-index: 9998 → 999998
- Start Menu shortcut now created at root level instead of Games folder

---

## [2.95.4] - 2025-10-24

### Fixed
- **CRITICAL:** Removed infinite resize loop causing window to be unmovable
- Removed excessive "Forced movability after resize" logging spam
- Window auto-resize now only triggered when content actually changes

### Changed
- `autoResizeWindow()` removed from end of `renderPlayers()` function
- Resize only triggered on explicit events (expand/collapse, solo mode toggle, data clear)
- Window drag behavior restored to normal functionality

### Technical Details
- Previous implementation called resize on every render (50ms intervals)
- New implementation: resize only on state changes
- Log spam reduced from hundreds per second to zero

---

## [2.95.3] - 2025-10-24

### Added
- Click handlers for player row expansion
- Player details expansion with stats and skills
- Two copy buttons per player:
  - "Copy Stats Only" - Basic player statistics
  - "Copy with Skills" - Stats + top 15 skill breakdown

### Fixed
- Settings About tab scrollbar (removed inner overflow)
- Session switching to live mode now properly refreshes data
- Session dropdown return to "Current Session" clears saved data

### Changed
- About panel CSS: `overflow-y: visible` to remove double scrollbar
- Session loading clears previous session data before refreshing

---

## [2.95.2] - 2025-10-24

### Added
- Session management system
  - Save current session with custom name
  - Load saved sessions from dropdown
  - Auto-save on character switch
  - Session deletion via "Manage Sessions" modal
- Local player auto-detection from packets
- Character switch auto-clear functionality

### Fixed
- Solo mode window resizing (properly adjusts height)
- Session sorting (most recent first)
- Manage Sessions button visibility

---

## [2.95.1] - 2025-10-23

### Added
- Session count display showing manual vs auto-saved sessions
- "Manage Sessions" button with deletion modal
- Session list sorting by timestamp

### Fixed
- Session management modal styling
- Delete confirmation dialogs
- Session dropdown refresh after deletion

---

## [2.95.0] - 2025-10-22

### Added
- Window anti-stuck system
  - Detects if window is stuck off-screen
  - Auto-repositions to center when stuck
  - Validates window position on startup
- Forced movability system for Electron window bugs
- Position caching and restoration

### Fixed
- Window getting stuck off-screen
- Dragging issues in lock mode
- Window position not persisting

---

## [2.94.0] - 2025-10-20

### Added
- Team totals row showing aggregate stats
- Player contribution percentage display
- Enhanced player row highlighting for local player

### Changed
- UI layout improvements for better readability
- Team totals only show for 2+ players
- Contribution % displayed next to total damage

---

## [2.93.0] - 2025-10-18

### Added
- Player details expansion with skill breakdown
- Top 10 skills display per player
- Skill translation support
- Skills caching system for performance

### Technical Details
- Skill data fetched from `/api/skill/:uid` endpoint
- Skills cached to avoid redundant API calls
- Skills preserved when collapsing/expanding players

---

## [2.92.0] - 2025-10-15

### Added
- Export system improvements
- CSV export functionality
- Markdown export support
- Copy all players to clipboard

### Changed
- Export modal redesigned
- Better data formatting for exports

---

## [2.91.0] - 2025-10-12

### Added
- Settings persistence with localStorage
- Multiple tab support in Settings modal
- Display customization options

### Changed
- Settings UI completely redesigned
- About page made compact and readable

---

## [2.90.0] - 2025-10-10

### Added
- VPN compatibility with auto-detection
- Network adapter auto-selection
- ExitLag, WTFast, NoPing support

### Changed
- Packet capture now detects adapter with most traffic
- No more manual adapter configuration needed

### Fixed
- VPN compatibility issues
- Network adapter detection failures

---

## [2.85.0] - 2025-09-28

### Added
- Solo mode toggle
- View mode persistence
- Compact display for solo play

### Changed
- Default view mode: Nearby (top 10)
- Solo mode: Shows only local player

---

## [2.80.0] - 2025-09-20

### Added
- Rank badges (Gold, Silver, Bronze) for top 3
- Local player highlighting with star icon
- HP bars with color coding
- Idle player detection

### Changed
- Player row styling improved
- Visual feedback enhanced

---

## [2.75.0] - 2025-09-15

### Added
- Modern glassmorphism UI
- Smooth animations and transitions
- Hover effects on interactive elements

### Changed
- Complete UI redesign
- Professional color scheme
- Better typography

---

## [2.70.0] - 2025-09-10

### Added
- DPS/HPS tracking
- Damage taken display
- Gear score (GS) display

### Fixed
- Data accuracy improvements
- Packet parsing bugs

---

## [2.60.0] - 2025-09-05

### Added
- Basic real-time combat tracking
- Player list display
- Window dragging
- Always-on-top mode

### Changed
- Initial enhanced version with improved UI and performance

---

## Earlier Versions

### [1.0.0 - 2.59.0] - 2025-01 to 2025-08
- Original versions by dmlgzs, MrSnakeVT, and NeRooNx
- Base functionality established
- Multiple community forks and improvements

---

## Version Numbering

- **Major** (2.x.x): Significant architecture changes
- **Minor** (x.Y.x): New features, UI changes
- **Patch** (x.x.Z): Bug fixes, small improvements

---

## Migration Notes

### From v2.95.5 to v2.95.6
- No data migration needed
- Player expansion feature now works correctly
- Saved sessions remain compatible

### From v2.95.0 to v2.95.5
- Sessions system added - old data preserved
- Settings format unchanged
- No breaking changes

### From v2.90.x to v2.95.x
- New session management features
- Auto-save functionality added
- Backward compatible with old save format

---

## Known Issues

### Current (v2.95.6)
- None reported

### Historical Issues (Fixed)
- ✅ Player expansion double-toggle (v2.95.6)
- ✅ Modal interaction blocking (v2.95.5)
- ✅ Window unmovable due to resize loop (v2.95.4)
- ✅ About tab double scrollbar (v2.95.3)
- ✅ Session switching not refreshing (v2.95.3)

---

## Credits

**Original Foundation:**
- **dmlgzs** - [StarResonanceDamageCounter](https://github.com/dmlgzs/StarResonanceDamageCounter)

**Engine & Data:**
- **MrSnakeVT** - Engine improvements and packet parsing enhancements

**UI Design:**
- **NeRooNx** - [Modern UI Design](https://github.com/NeRooNx/BPSR-Meter)

**Skill Data & Translations:**
- **winjwinj** - [bpsr-logs](https://github.com/winjwinj/bpsr-logs) - Comprehensive skill data and translations

**Enhanced Edition (v2.95.x):**
- Session management system
- Player detail expansion
- Performance optimizations
- Complete English localization

**Special Thanks:**
- Blue Protocol community for testing and feedback
- All contributors who reported bugs and suggested features

---

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

## Links

- **Repository:** https://github.com/beaRSZT/BPSR_dev
- **Issues:** https://github.com/beaRSZT/BPSR_dev/issues
- **Releases:** https://github.com/beaRSZT/BPSR_dev/releases
- **Documentation:** [README.md](README.md)
