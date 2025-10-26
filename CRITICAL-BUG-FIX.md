# CRITICAL BUG: DATA NOT SHOWING

## Root Cause Found
**Socket.IO client library was MISSING from index.html**

## What Was Broken
1. Server emits WebSocket events with player data
2. UI has NO Socket.IO client library loaded
3. UI can't receive any real-time updates
4. Data never appears even though server captures it

## The Fix
Added `<script src="/socket.io/socket.io.js"></script>` to index.html

## How This Happened
- Socket.IO client was removed or never added during refactoring
- UI only uses HTTP polling (fetch API) which doesn't get real-time updates
- WebSocket connection was broken the whole time

## Evidence
Server logs show: `✅ CAPTURED NAME FROM PACKET`
UI shows: `Waiting for combat data...`

This proves server works but UI can't receive the data.
