# VPN Compatibility Issues

## ⚠️ Known Limitation

**BPSR Meter cannot work with VPNs that use "Lightweight Filter" or kernel-level encryption.**

---

## ❌ Incompatible VPNs

### ExitLag (Lightweight Filter Mode)
- **Status:** Incompatible
- **Reason:** Encrypts packets before Npcap can inspect them
- **Solution:** Turn off ExitLag when using meter, or check if TAP mode is available

### Other Gaming VPNs with Filter Drivers
- WTFast (filter mode)
- Haste (filter mode)  
- NoPing (filter mode)

**Why:** These VPNs intercept and encrypt traffic at kernel level, before Npcap capture point.

---

## ✅ Compatible VPNs

### VPNs Using TAP-Windows Adapters
- **WireGuard** ✅
- **OpenVPN** ✅ (TAP mode)
- **NordVPN** ✅ (NordLynx/WireGuard mode)
- **ProtonVPN** ✅ (WireGuard mode)

**Why:** TAP adapters create virtual network cards that Npcap can capture from BEFORE encryption.

---

## 🧪 How to Test Your VPN

1. Start VPN and connect
2. Launch BPSR Meter
3. Check console for:

```
📡 Available Network Adapters:
  [0] Physical Adapter
  [1] TAP-Windows Adapter V9    ← If you see this, might work!
```

4. If you only see physical adapter → VPN is incompatible
5. If you see TAP/TUN adapter → Enter combat and test

---

## 💡 Solutions

### Option 1: Check VPN Settings
Some VPNs offer multiple modes. Look for:
- "TAP Adapter Mode"
- "Virtual Network Adapter"  
- "TUN/TAP Mode"

### Option 2: Use Different VPN
Switch to a TAP-based VPN if compatibility is important.

### Option 3: Toggle VPN
- Use VPN for competitive/ranked
- Turn off for casual play with meter

### Option 4: Contact VPN Support
Ask if they have a "compatibility mode" for packet inspection tools.

---

## 🔬 Technical Explanation

```
Why ExitLag Doesn't Work:

Game → ExitLag Filter (encrypts) → Npcap (❌ sees encrypted data) → Internet

Why OpenVPN Works:

Game → Npcap (✅ sees game packets) → TAP Adapter → OpenVPN → Internet
```

ExitLag's Lightweight Filter encrypts packets BEFORE Npcap can read them.
TAP adapters let Npcap capture BEFORE encryption happens.

---

## 📋 Confirmed Test Results

| VPN | Mode | Status | Tested |
|-----|------|--------|--------|
| ExitLag | Lightweight Filter | ❌ Incompatible | ✅ Yes |
| WireGuard | Default | ✅ Compatible | ⚠️ Needs testing |
| OpenVPN | TAP | ✅ Compatible | ⚠️ Needs testing |

---

## 🆘 Need Help?

If your VPN is incompatible:
1. Check VPN settings for alternative modes
2. Contact VPN support about TAP adapter compatibility
3. Use meter without VPN for now
4. Report your VPN/results so we can update this list

---

**Note:** This is a fundamental limitation of kernel-level packet encryption, not a bug in BPSR Meter. The meter works correctly - it just can't decrypt VPN tunnels.
