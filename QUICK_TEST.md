# Quick Test - UID Fix

## How to Test the Fix

### 1. **Open DevTools** (`F12`)

### 2. **Check Console for Migration Messages**

When you reload the app, you should see:
```
🔄 Migrating hex UID 49A2A -> decimal 301610 (weaklin)
🔄 Migrating hex UID 4C30B51 -> decimal 79999825 (DoctorBoDoque)
✅ Loaded 2 players from database
💾 Saved migrated player database
```

### 3. **Verify Player Names Show Correctly**

Your name should now appear as **"weaklin"** instead of **"Player_49A2A"**

### 4. **Check localStorage** (Optional)

```javascript
// In browser console:
JSON.parse(localStorage.getItem('bpsr-player-db'))
```

**Before fix:**
```json
{
  "49A2A": "weaklin",
  "4C30B51": "DoctorBoDoque"
}
```

**After fix:**
```json
{
  "301610": "weaklin",
  "79999825": "DoctorBoDoque"
}
```

### 5. **Force Clean Test** (If Needed)

If you want to test from scratch:
```javascript
// Clear localStorage
localStorage.removeItem('bpsr-player-db');
localStorage.removeItem('bpsr-settings');

// Reload
location.reload();
```

## Expected Results

✅ All player names display correctly
✅ No "Player_XXXXX" hex UIDs
✅ localStorage automatically migrated
✅ Future sessions work normally

## If It Still Shows Hex

1. **Hard refresh:** `Ctrl+F5` or `Cmd+Shift+R`
2. **Clear app cache:** Settings → Clear application cache
3. **Check browser console for errors**
4. **Report issue with console logs**
