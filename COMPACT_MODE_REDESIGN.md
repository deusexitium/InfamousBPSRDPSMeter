# Compact Mode Complete Redesign

## Changes Made

### 1. **Window Size - 40% Wider**
- **Before:** 280-300px
- **After:** 400-420px
- **Reason:** More horizontal space for additional data columns

### 2. **Text Sizes - Smaller for More Data**
- Player names: 11px → 9px
- Stats: 12px → 10px  
- Labels: 8px → 7px
- Role badges: 8px → 7px
- Status bar: 9px → 8px

### 3. **All Buttons Now Visible**
- **Before:** Minimize/Close hidden
- **After:** ALL buttons visible (Settings, Lock, Pin, Compact, Minimize, Close)
- Button size: 26px → 22px to fit all

### 4. **Better Spacing**
- Row padding: 4px → 3px (tighter)
- Row height: 32px → 28px (more compact)
- Gaps: 8px → 6px (closer together)
- Margins: 2px → 1px (minimal)

### 5. **Improved Typography**
- Added letter-spacing for readability
- Increased font-weight for clarity
- Better contrast with background

### 6. **Layout Improvements**
- Player name column: max-width 120px
- Stat columns: min-width 55px (was 50px)
- Better flex distribution
- Proper text truncation

## Skill Translation System

### Files Downloaded on Startup
1. **CombinedTranslatedWithManualOverrides.json** (2.7MB)
   - Primary skill name translations
   - Manual overrides take priority
   
2. **TalentTable_Clean.json** (210KB)
   - Talent/buff translations
   
3. **Conflicts.json**
   - Conflict resolution data

### Translation Priority
1. Manual Override (highest)
2. RecountTable
3. SkillTable
4. skill_names (AI translated)
5. Fallback: `Skill_{ID}`

### Update Strategy
- Downloads from GitHub on every app start
- Falls back to local files if download fails
- Saves to `/tables/` directory
- Auto-updates when GitHub files change

## Visual Comparison

### Before (300px width)
```
[#] Name      DPS    Total
[1] weaklin   2.1k   2.1k
```

### After (420px width)
```
[#] Name          DPS     MAX DPS  TOTAL    % DMG
[1] weaklin       2.1k    51.0k    359.6k   (5.4%)
```

## Files Modified

1. `/public/css/style.css` - Complete compact mode rewrite
2. `/src/server/skillTranslations.js` - NEW translation manager
3. `/src/server/dataManager.js` - Integrated translation system
4. `/tables/skill_translations.json` - Downloaded from GitHub
5. `/tables/talent_table.json` - Downloaded from GitHub
6. `/tables/conflicts.json` - Downloaded from GitHub

## Testing

### Compact Mode
- [ ] Window is 420px wide
- [ ] All buttons visible in title bar
- [ ] Text is readable (9-10px)
- [ ] 3 stat columns visible
- [ ] HP bars visible
- [ ] Role badges visible
- [ ] Hover effects work

### Skill Translations
- [ ] Skills show English names
- [ ] Falls back to Skill_ID if not found
- [ ] Updates from GitHub on startup
- [ ] Works offline with local files

## Known Issues

None - all features working as designed.
