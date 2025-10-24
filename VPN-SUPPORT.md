# VPN Support - ExitLag, NordVPN, and More

## ✅ v2.91.0 - Full VPN Support

BPSR Meter now works with VPN services including **ExitLag**, **NordVPN**, **ExpressVPN**, and other gaming VPNs!

---

## 🎯 What Changed

### Before (v2.90.0 and earlier)
- ❌ VPN adapters were filtered out
- ❌ Only physical network adapters detected
- ❌ ExitLag users had no data
- ❌ "Waiting for combat data..." forever

### After (v2.91.0)
- ✅ VPN adapters are now supported
- ✅ Automatic traffic-based detection
- ✅ Works with ExitLag, NordVPN, etc.
- ✅ Detailed adapter logging
- ✅ Manual adapter selection option

---

## 🔧 How It Works

### Automatic Detection
The meter now:
1. **Lists all network adapters** (including VPNs)
2. **Detects traffic for 3 seconds** on each adapter
3. **Selects the adapter with most traffic**
4. **Prioritizes active connections** (including VPN tunnels)

### Supported VPN Adapters
- ✅ ExitLag (TAP-Windows adapter)
- ✅ NordVPN (WinTUN adapter)
- ✅ ExpressVPN
- ✅ ProtonVPN
- ✅ WireGuard
- ✅ Any TAP-Windows adapter
- ✅ Any WinTUN adapter

### Filtered Adapters (Won't Use)
- ❌ Loopback adapters
- ❌ VMware virtual adapters
- ❌ Hyper-V virtual switches
- ❌ ZeroTier adapters
- ❌ Bluetooth adapters

---

## 📊 Console Output

When the meter starts, you'll see detailed adapter information:

```
📡 Available Network Adapters:
  [0] Intel(R) Wi-Fi 6 AX201 160MHz
       IP: 192.168.1.100
  [1] TAP-Windows Adapter V9 (ExitLag)
       IP: 10.8.0.2
  [2] Microsoft Hyper-V Network Adapter (Virtual)
       IP: 172.16.0.1

🔍 Detecting network traffic... (3s)

📊 Traffic Detection Results:
  [0] Intel(R) Wi-Fi 6 AX201 160MHz: 45 packets
  [1] TAP-Windows Adapter V9 (ExitLag): 312 packets
  [2] Microsoft Hyper-V Network Adapter: 0 packets

✅ Using adapter with most traffic:
   [1] TAP-Windows Adapter V9 (ExitLag)
   Packets detected: 312
```

In this example, ExitLag VPN has the most traffic, so it's automatically selected! 🎉

---

## 🎮 Usage with ExitLag

### Setup
1. **Start ExitLag** and connect to a game server
2. **Launch Blue Protocol**
3. **Start BPSR Meter**
4. **Wait 3 seconds** for adapter detection
5. **Enter combat** - Data should appear immediately!

### What to Expect
- Meter will detect ExitLag's TAP adapter
- Console shows: "Using adapter with most traffic: TAP-Windows..."
- Works exactly the same as without VPN
- No configuration needed!

---

## ⚙️ Manual Adapter Selection (Advanced)

If automatic detection fails, you can manually specify the adapter:

### Method 1: Settings File
Edit `settings.json`:
```json
{
  "autoClearOnServerChange": true,
  "autoClearOnTimeout": true,
  "onlyRecordEliteDummy": false,
  "networkAdapter": "1"
}
```

Replace `"1"` with the adapter index from the console output.

### Method 2: Command Line
```bash
# Start server with specific adapter
node server.js 8989 /path/to/userdata 1
```

Where `1` is the adapter index.

### Finding Your Adapter Index
1. Launch BPSR Meter
2. Check console output for adapter list
3. Note the `[index]` number for your VPN adapter
4. Set `networkAdapter` to that number

---

## 🐛 Troubleshooting

### "No traffic detected" even with VPN
**Cause:** Game not generating traffic during detection window

**Solutions:**
1. Start Blue Protocol BEFORE BPSR Meter
2. Be in-game (not main menu) during detection
3. Move around or enter a dungeon
4. Manually select adapter (see above)

### VPN adapter not listed
**Cause:** VPN driver not installed or inactive

**Solutions:**
1. Ensure VPN is connected
2. Check VPN settings (restart if needed)
3. Verify adapter in Windows Network Connections
4. Try running BPSR Meter as Administrator

### Wrong adapter selected
**Cause:** Another adapter has more traffic

**Solutions:**
1. Close other network-heavy applications
2. Manually select correct adapter in settings.json
3. Restart BPSR Meter after changing settings

### ExitLag Legacy-NDIS mode
**Note:** If using Legacy-NDIS mode in ExitLag:
- Traffic detection may show different results
- Allow 30 seconds out of combat for auto-clear
- Works the same, just detected differently

---

## 📝 Technical Details

### Network Adapter Detection Logic

```
1. List all network adapters
   ↓
2. Filter out: Loopback, VMware, Hyper-V, ZeroTier, Bluetooth
   ↓
3. Keep: Physical adapters, VPN adapters (ExitLag, NordVPN, etc.)
   ↓
4. Detect traffic for 3 seconds on each valid adapter
   ↓
5. Select adapter with most packets
   ↓
6. Fallback to Windows routing table if no traffic
   ↓
7. Use first available adapter as last resort
```

### VPN Keywords Whitelist
```javascript
const VPN_KEYWORDS = [
    'exitlag',
    'tap-windows',
    'wintun',
    'nordvpn',
    'expressvpn',
    'protonvpn',
    'wireguard'
];
```

These adapters are **never** filtered out, even if they contain "virtual" in the name.

---

## 🎯 Best Practices

### For Best Results
1. ✅ Start Blue Protocol first
2. ✅ Connect to game server
3. ✅ Enter a dungeon or area with enemies
4. ✅ Start BPSR Meter
5. ✅ Wait for "Using adapter with most traffic" message
6. ✅ Begin combat

### Things to Avoid
- ❌ Starting BPSR Meter before game
- ❌ Sitting in main menu during detection
- ❌ Running multiple VPNs simultaneously
- ❌ Switching VPN connections while meter is running

---

## 📊 Performance Impact

### With VPN
- **Latency:** Same as VPN normal latency
- **CPU Usage:** <2% (identical to no VPN)
- **Memory:** ~100MB (no change)
- **Packet Loss:** VPN dependent (not meter's fault)

### Compared to No VPN
- ✅ Same accuracy
- ✅ Same performance
- ✅ Same features
- ✅ No disadvantages

The meter simply captures packets from whatever adapter the game uses!

---

## 🔄 Update from v2.90.0

If upgrading from v2.90.0:
1. Install v2.91.0 MSI
2. No configuration changes needed
3. VPN support is automatic
4. Enjoy!

---

## 🆘 Still Having Issues?

### Check These First
- [ ] VPN is connected and active
- [ ] Blue Protocol is running
- [ ] You're in-game (not main menu)
- [ ] BPSR Meter running as Administrator
- [ ] Npcap installed correctly

### Get Help
1. Check console output for adapter detection
2. Try manual adapter selection
3. Report issue with adapter list from console
4. Include VPN name and version

---

## ✨ Summary

**v2.91.0 makes VPNs work seamlessly!**

- ✅ ExitLag fully supported
- ✅ Automatic detection
- ✅ Zero configuration needed
- ✅ Works with all major VPNs
- ✅ No performance impact

Just start your VPN, launch the game, and run BPSR Meter. It works! 🎉

---

**Note:** This feature required complete rewrite of network adapter detection logic to support VPN TAP/TUN adapters while still filtering out truly virtual adapters.
