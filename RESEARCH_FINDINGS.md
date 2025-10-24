# Research Findings from Other BPSR DPS Meters

## Summary
Analyzed multiple GitHub repos to find useful features and code we can integrate.

## Key Findings

### 1. **Viemean/StarResonance.DPS** (Most Impressive)
- **Tech Stack:** WPF C# .NET 10 frontend
- **Connects to:** Same backend we use (dmlgzs/StarResonanceDamageCounter)
- **Key Features We're Missing:**
  - ✅ **Team data overview** - Shows total team DPS/HPS/damage taken
  - ✅ **Idle player detection** - Players with no data for 30s marked as idle
  - ✅ **Skill breakdown on double-click** - Shows top 6 skills per player
  - ✅ **Snapshot system** - Save/load combat data as JSON files
  - ✅ **Combat countdown timer** - 1min, 5min, or custom duration
  - ✅ **Multi-language** - Chinese, English, Japanese (machine translated)
  - ✅ **Contribution percentages** - Shows % of team total damage
  - ✅ **Tooltip on hover** - Shows detailed player stats (level, class, crit rate, etc.)
  - ✅ **Search by name or ID**
  - ✅ **System tray support**
  - ✅ **Customizable UI** - Font, size, transparency, refresh rate
  
- **What We Can Learn:**
  - Their UI refresh rate is configurable (default 500ms) - we use 2000ms which causes glitching
  - They calculate team totals and percentages
  - They have proper idle player handling
  - Snapshot feature for analyzing past fights

### 2. **anying1073/StarResonanceDps**
- **Tech Stack:** .NET 8.0, based on StarResonanceDamageCounter
- **Features:**
  - Memory optimization guide (has MEMORY_OPTIMIZATION_GUIDE.md)
  - Focus on performance and reliability
  - Uses same packet capture approach

### 3. **NeRooNx/BPSR-Meter**
- **Tech Stack:** Electron (like ours!)
- **Features:**
  - 50ms update rate (very fast!)
  - Dual view modes: Nearby (Top 10 + you) vs Solo (personal stats)
  - Channel change detection
  - Class icons, HP bars
  - Rank badges (🥇🥈🥉)
  - Click-through mode for overlay
  - Always-on-top transparent window

## Recommendations for Our Meter

### Immediate Improvements:
1. **Reduce refresh interval** from 2000ms to 500ms (like Viemean's default)
2. **Add team totals** at the top (total team DPS, damage, healing)
3. **Add contribution %** next to each player's damage
4. **Implement idle player detection** (30s no data = idle, gray out)
5. **Add snapshot save/load** for analyzing past fights

### Medium Priority:
6. **Combat countdown timer** for testing
7. **Better skill translation** - need to extract from game files
8. **Tooltip on hover** showing detailed stats
9. **Search functionality** by name/ID

### Nice to Have:
10. **System tray support**
11. **Multi-language support**
12. **Customizable refresh rate** in settings
13. **Click-through mode** when locked

## Technical Notes

### Why Skills Disappear:
- Viemean's approach: They fetch skills ONCE and cache them
- They don't re-render the entire list on every update
- They use 500ms refresh vs our 2000ms
- **Solution:** We already implemented caching, just need to stop calling renderPlayers() unnecessarily

### Team Data Calculation:
```csharp
// Viemean's approach (C#):
var teamTotal = players.Where(p => !p.IsIdle).Sum(p => p.TotalDamage);
foreach (var player in players) {
    player.Percentage = (player.TotalDamage / teamTotal) * 100;
}
```

### Idle Detection:
```csharp
// If no data change for 30 seconds
if (DateTime.Now - player.LastUpdateTime > TimeSpan.FromSeconds(30)) {
    player.IsIdle = true;
}
```

## Files to Review:
- Viemean/StarResonance.DPS/Services/ - WebSocket connection handling
- Viemean/StarResonance.DPS/Models/ - Data models
- NeRooNx/BPSR-Meter - Electron implementation similar to ours

## Conclusion
The Chinese developers have implemented significantly more features than our current version. The most impressive is Viemean's snapshot system and team statistics. We should prioritize:
1. Faster refresh rate (500ms)
2. Team totals and percentages
3. Idle player detection
4. Snapshot save/load feature
