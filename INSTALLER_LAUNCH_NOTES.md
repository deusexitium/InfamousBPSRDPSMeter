# Installer Launch Issue

## Problem
User reports: "when i install and click launch the game it doesnt launch"
After closing and opening from dir directly it works.

## Current NSIS Config
```json
"runAfterFinish": true,  // Enabled
"requestedExecutionLevel": "requireAdministrator"  // Requires admin
```

## Root Cause
The app requires Administrator rights to run (for Npcap packet capture).
When NSIS tries to launch the app after install with `runAfterFinish: true`,
it may not be launching with elevated permissions, causing silent failure.

## Workaround for Users
1. Install the app (installer runs as admin)
2. Skip the "Launch" checkbox (or it fails silently)
3. Launch from Start Menu / Desktop shortcut (these have admin rights set)

## Potential Fixes (Not Implemented)
1. Set `runAfterFinish: false` - Removes launch option (safest)
2. Add NSIS script to launch with admin elevation
3. Add visible error message if launch fails

## Current Status
- `runAfterFinish: true` is enabled but may fail silently
- Users should launch from Start Menu / Desktop after install
- App works fine when launched normally
