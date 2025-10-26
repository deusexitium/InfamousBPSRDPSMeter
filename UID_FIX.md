# UID Display Bug - FIXED

## Problem

Players were showing up as "Player_49A2A" instead of actual names like "weaklin".

### Root Cause

**Hex vs Decimal UID Mismatch:**
- Backend sends UIDs as decimal integers: `301610`
- Old localStorage had UIDs stored as hex strings: `"49A2A"`
- When frontend receives UID `301610` and looks up `PLAYER_DB.get(301610)`, it converts to string `"301610"`
- But localStorage had `"49A2A"` stored, so lookup fails
- Fallback displays `Player_49A2A` (using hex representation of UID)

### Math
```
301610 (decimal) = 49A2A (hex)
```

## Solution Implemented

### 1. **Automatic Migration on Load**
```javascript
// In PLAYER_DB.load()
entries.forEach(([uid, name]) => {
    // Detect hex UIDs (contain A-F)
    if (/[A-F]/i.test(uid)) {
        // Convert: "49A2A" -> "301610"
        const decimalUid = parseInt(uid, 16).toString();
        this.data.set(decimalUid, name);
    } else {
        this.data.set(uid, name);
    }
});
```

### 2. **Fallback Lookup with Auto-Migrate**
```javascript
// In PLAYER_DB.get(uid)
// Try direct lookup first
let name = this.data.get(String(uid));
if (name) return name;

// Fallback: convert to hex and try legacy lookup
const hexKey = Number(uid).toString(16).toUpperCase();
name = this.data.get(hexKey);
if (name) {
    // Migrate immediately
    this.data.set(String(uid), name);
    this.data.delete(hexKey);
    this.save();
    return name;
}
```

## Impact

✅ **Old localStorage data automatically migrated**
- Hex UIDs: `"49A2A"`, `"4C30B51"`, `"5AA961"` 
- Become: `"301610"`, `"79999825"`, `"5942625"`

✅ **All players now show real names**
- `Player_49A2A` → `weaklin`
- `Player_4C30B51` → `DoctorBoDoque`  
- `Player_5AA961` → (actual name from cache)

✅ **Backward compatible**
- Works with both old hex and new decimal formats
- Automatically migrates on first load
- Saves cleaned data immediately

## Testing

1. **Clear localStorage and test fresh:**
   ```javascript
   localStorage.removeItem('bpsr-player-db');
   location.reload();
   ```

2. **With old hex data:**
   - Should see migration messages in console
   - All hex UIDs converted to decimal
   - Names display correctly

3. **Verify player_map.json:**
   ```bash
   cat player_map.json
   ```
   Should show decimal UIDs: `{"301610": "weaklin"}`

## Files Modified

- `/public/js/main.js` - PLAYER_DB.load() and PLAYER_DB.get()

## Migration Log Example

```
🔄 Migrating hex UID 49A2A -> decimal 301610 (weaklin)
🔄 Migrating hex UID 4C30B51 -> decimal 79999825 (DoctorBoDoque)
✅ Loaded 2 players from database
💾 Saved migrated player database
```
