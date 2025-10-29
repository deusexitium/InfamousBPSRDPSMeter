// ============================================================================
// SETTINGS MODULE WITH PERSISTENCE
// ============================================================================

'use strict';

const CONFIG_VERSION = 2; // Increment when breaking changes occur

export const SETTINGS = {
    version: CONFIG_VERSION,
    highlightLocal: true,
    showGS: true,
    refreshInterval: 0.3, // 300ms - faster updates for responsive DPS/HPS
    rememberNames: true,
    autoClearOnZoneChange: true, // Clear data when entering combat after zone change
    keepDataAfterDungeon: true, // Don't clear immediately on zone exit
    overlayOpacity: 0.95, // Overlay transparency (0.0-1.0)
    compactMode: false, // Persist compact vs full mode
    compactHealerMode: false, // Show healing metrics in compact mode
    fullHealerMode: false, // Show healing metrics in full mode
    compactScale: 100, // Compact mode scale percentage (70-150%)
    fullModeScale: 100, // Full mode scale percentage (70-150%)
    windowOpacity: 100, // Window opacity percentage (0-100)
    defaultSort: 'totalDmg', // Default column for ranking
    
    // AUTO-UPDATER SETTINGS (NEW)
    autoUpdate: 'notify', // 'disable', 'notify', 'auto'
    // - disable: No update checks
    // - notify: Check and show notification (default)
    // - auto: Automatically download and install updates
    
    // Column visibility for COMPACT mode
    columnsCompact: {
        dps: true,
        maxDps: true,
        avgDps: false,
        totalDmg: true,
        hps: true,
        dmgTaken: false,
        gs: false
    },
    
    // Column visibility for FULL mode
    columnsFull: {
        dps: true,
        maxDps: true,
        avgDps: true,
        totalDmg: true,
        hps: true,
        dmgTaken: true,
        gs: true,
    },
    
    async load() {
        try {
            // PRIORITY 1: Load from AppData settings.json (permanent storage)
            try {
                const res = await fetch('/api/settings/load');
                const data = await res.json();
                if (data.code === 0 && data.settings) {
                    const savedSettings = data.settings;
                    this.mergeSettings(savedSettings);
                    console.log('✅ Settings loaded from AppData (permanent storage)');
                    return; // Successfully loaded from permanent storage
                }
            } catch (err) {
                console.warn('Could not load from AppData, falling back to localStorage:', err);
            }
            
            // FALLBACK: Load from localStorage (can be cleared)
            const saved = localStorage.getItem('bpsr-settings');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                this.mergeSettings(savedSettings);
                console.log('⚠️ Settings loaded from localStorage (not permanent)');
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    },
    
    mergeSettings(savedSettings) {
        if (savedSettings.version < CONFIG_VERSION) {
            // Perform migration if version is outdated
        }
        // Merge top-level settings
        Object.keys(savedSettings).forEach(key => {
            if (key === 'columnsCompact' && typeof savedSettings.columnsCompact === 'object') {
                Object.assign(this.columnsCompact, savedSettings.columnsCompact);
            } else if (key === 'columnsFull' && typeof savedSettings.columnsFull === 'object') {
                Object.assign(this.columnsFull, savedSettings.columnsFull);
            } else if (key === 'columns' && typeof savedSettings.columns === 'object') {
                // Backward compatibility
                Object.assign(this.columnsCompact, savedSettings.columns);
                Object.assign(this.columnsFull, savedSettings.columns);
            } else if (key !== 'load' && key !== 'save' && key !== 'mergeSettings') {
                this[key] = savedSettings[key];
            }
        });
    },
    
    save() {
        try {
            const { load, save, mergeSettings, ...settings } = this;
            
            // Save to localStorage (quick access)
            localStorage.setItem('bpsr-settings', JSON.stringify(settings));
            
            // CRITICAL: Save to AppData settings.json (PERMANENT - survives cache clear)
            fetch('/api/settings/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            }).then(res => res.json())
              .then(data => {
                  if (data.code === 0) {
                      console.log('✅ Settings saved to AppData');
                  }
              })
              .catch(err => console.error('❌ Failed to save settings to AppData:', err));
            
            // Also sync relevant settings to globalSettings (backend)
            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    autoClearOnZoneChange: settings.autoClearOnZoneChange,
                    keepDataAfterDungeon: settings.keepDataAfterDungeon,
                    autoUpdate: settings.autoUpdate // Sync auto-update setting
                })
            }).catch(err => console.error('Failed to sync globalSettings:', err));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    },
};
