// ============================================================================
// PLAYER DATABASE MODULE (Persistent UID -> Name Mapping)
// ============================================================================

'use strict';

export const PLAYER_DB = {
    data: new Map(),
    
    load() {
        try {
            const saved = localStorage.getItem('bpsr-player-db');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = new Map(Object.entries(parsed));
            }
        } catch (e) {
            console.error('Failed to load player database:', e);
        }
    },
    
    save() {
        // Check if rememberNames is enabled (will be passed from settings)
        try {
            const obj = Object.fromEntries(this.data);
            localStorage.setItem('bpsr-player-db', JSON.stringify(obj));
        } catch (e) {
            console.error('❌ Failed to save player database:', e);
        }
    },
    
    add(uid, name) {
        if (!name || name === 'unknown' || name === '') return;
        const key = String(uid);
        const existing = this.data.get(key);
        if (existing !== name) {
            this.data.set(key, name);
            this.save();
        }
    },
    
    get(uid) {
        return this.data.get(String(uid));
    },
    
    clear() {
        this.data.clear();
        localStorage.removeItem('bpsr-player-db');
    }
};
