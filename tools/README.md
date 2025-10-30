# 🔬 Packet Analysis Tools

Tools for reverse engineering Blue Protocol packets to discover party/raid information, buffs, debuffs, and other game mechanics.

## 🎯 Goal

Find packets that contain:
- **Party/Raid membership** (list of 5/10/20 UIDs)
- **Party leader** information
- **Buff/debuff** data
- **Target selection** (who you're targeting)
- **Character states** (mounted, dead, loading, etc.)

---

## 📊 Tool 1: Packet Analyzer

**Captures and logs ALL packets with intelligent filtering.**

### Features:
- Logs new/unusual packet types
- Filters by keywords (party, team, group, raid, member)
- Detects arrays of size 5, 10, 20 (likely party/raid lists)
- Counts packet occurrences
- Generates summary statistics

### Usage:

**Basic logging:**
```bash
node tools/packet-analyzer.js
```

**Filter for party-related keywords:**
```bash
node tools/packet-analyzer.js --output party-packets.log --filter party,team,group
```

**Integration in sniffer.js:**
```javascript
const { integrateIntoSniffer } = require('./tools/packet-analyzer');

// In Sniffer constructor:
if (process.env.DEBUG_PACKETS === 'true') {
    this.analyzer = integrateIntoSniffer(this);
}
```

Then run with:
```bash
DEBUG_PACKETS=true npm start
```

---

## 🔍 Tool 2: Packet Explorer

**Interactive exploration of captured packets.**

### Features:
- Load packet from hex string
- Show decoded structure as JSON or tree
- Search for fields/values
- Find all array fields (potential party lists)
- Navigate complex nested structures

### Usage:

**Start explorer:**
```bash
node tools/packet-explorer.js
```

**Commands:**
```
> load a0b3c4d5e6f7...    # Load packet from hex
> show                     # Show full decoded JSON
> tree                     # Show as tree structure
> arrays                   # List all arrays (look for size 5/10/20!)
> search party             # Search for "party" in fields/values
> field 15                 # Show details of field 15
> exit                     # Exit
```

**Example session:**
```bash
$ node tools/packet-explorer.js
🔍 Packet Explorer
> load a0b3c4d5e6f7808182838485868788898a8b8c8d8e8f
✅ Loaded packet (20 bytes)
📦 Field 1: Array[5]
  [0]: 2273301
  [1]: 64205
  [2]: 33794575
  [3]: 223560
  [4]: 4341

> arrays
Array fields in packet:
  1: Array[5]
    Elements: number

> search 2273301
Found 1 results for "2273301":
  1[0] (value): 2273301
```

---

## 🎯 Discovery Strategy

### Step 1: Capture Packets While in Party

1. **Start analyzer with party filter:**
   ```bash
   DEBUG_PACKETS=true npm start
   ```

2. **Join a 5-man party**

3. **Do some actions:**
   - Talk in party chat
   - Change party leader
   - Someone joins/leaves
   - Target party members

4. **Check logs:** `packets-analysis.log`
   - Look for arrays of size 5
   - Look for your UID + 4 other UIDs
   - Look for packets that appear when you join/leave party

### Step 2: Compare with Solo Play

1. **Capture packets while solo** (same actions)
2. **Diff the logs:**
   ```bash
   diff party-packets.log solo-packets.log
   ```
3. **Packets that only appear in party = party-related!**

### Step 3: Reverse Engineer Fields

Once you find a party packet:

1. **Load in explorer:**
   ```
   > load <hex_from_log>
   > tree
   ```

2. **Identify fields:**
   - Array of 5 numbers → Party member UIDs
   - Single number at top → Party leader UID?
   - Nested objects → Member details (HP, position, etc.)

3. **Test hypothesis:**
   - Compare UIDs with known party members
   - Have someone leave → UID disappears?
   - Change leader → different UID at position 0?

### Step 4: Implement Parser

Once identified, add to `packet.js`:
```javascript
case PARTY_PACKET_ID:
    const partyInfo = {
        leader: decoded[1], // Leader UID
        members: decoded[5], // Array of member UIDs
        size: decoded[5].length
    };
    this.userDataManager.setPartyInfo(partyInfo);
    break;
```

---

## 🚀 Quick Win: Heuristic Detection (No Packets Needed!)

While we reverse engineer packets, **we can detect parties NOW** using heuristics:

**Logic:**
- Same 5 players doing damage together for 5+ minutes = 5-man party
- Same 20 players for 10+ minutes = raid
- No one else joins/leaves = confirmed

**Implementation:** See `PartyDetector` class in code memory.

**Benefits:**
- ✅ Works immediately
- ✅ High accuracy after 5-10 minutes
- ✅ Can show party tags in UI
- ✅ Better session naming

---

## 📝 Notes

### Packet Structure Hints

Blue Protocol uses Protocol Buffers with custom wire format:
- **Field IDs** are integers (1, 2, 3, etc.)
- **Wire types:** 0=int, 1=fixed64, 2=bytes, 5=fixed32
- **Nested messages** are type 2 (bytes)
- **Repeated fields** (arrays) appear multiple times with same field ID

### Common Patterns

**Player list (likely party):**
```
Field 5: Array[5]
  [0]: 2273301  (UID)
  [1]: 64205    (UID)
  ...
```

**Player details:**
```
Field 10: Object
  1: 2273301  (UID)
  2: "kenshin" (Name)
  3: 65000 (HP)
  5: true (IsPartyMember?)
```

**Hierarchical:**
```
Field 20: Object (Party Info)
  1: 2273301 (Leader UID)
  5: Array[5] (Members)
    [0]: Object
      1: 2273301 (UID)
      2: "kenshin" (Name)
    [1]: Object
      ...
```

---

## 🤝 Contributing

Found a party packet? **Share your findings!**

1. Capture hex dump
2. Note game state (in party, party size, your role)
3. Share in issue/PR with analysis
4. Help implement parser

**Together we can decode the full protocol!** 🚀
