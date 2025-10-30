// ============================================================================
// BOSS HP TRACKER
// Tracks boss HP changes and sends to HZRD API on 5% breaks
// ============================================================================

const BossApiClient = require('./boss-api-client');

class BossHpTracker {
    constructor(mappingManager, logger) {
        this.mappingManager = mappingManager;
        this.logger = logger;
        this.apiClient = new BossApiClient(logger);
        
        // Track HP state per boss instance
        // Key: "boss_{id}_line_{num}"
        // Value: { lastSentHp, lastSeenHp, bossId, lineNumber, bossName }
        this.tracking = new Map();
        
        // Settings
        this.enabled = true;
        this.sendInterval = 5; // Send every 5% HP breaks
    }
    
    /**
     * Enable/disable HP tracking
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.logger('[HP Tracker] ⏸️ HP tracking disabled');
            this.tracking.clear();
        } else {
            this.logger('[HP Tracker] ▶️ HP tracking enabled');
        }
    }
    
    /**
     * Update boss HP and send to API if needed
     * @param {number} bossId - Official game boss ID
     * @param {number} lineNumber - Channel/line number
     * @param {number} currentHp - Current HP (0-100)
     * @param {number} maxHp - Max HP
     */
    updateBossHp(bossId, lineNumber, currentHp, maxHp) {
        if (!this.enabled) return;
        if (!bossId || !lineNumber || currentHp === undefined || maxHp === undefined) return;
        
        // Calculate HP percentage
        const hpPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 100;
        
        // Clamp to 0-100
        const clampedHp = Math.max(0, Math.min(100, hpPercent));
        
        // Get boss name for logging
        const bossName = this.mappingManager.getBossName(bossId) || `Unknown_${bossId}`;
        
        // Create tracking key
        const key = `boss_${bossId}_line_${lineNumber}`;
        
        // Get or create tracking entry
        let entry = this.tracking.get(key);
        if (!entry) {
            entry = {
                bossId,
                lineNumber,
                bossName,
                lastSentHp: null,
                lastSeenHp: clampedHp
            };
            this.tracking.set(key, entry);
        }
        
        // Update last seen HP
        entry.lastSeenHp = clampedHp;
        
        // Determine if we should send update
        if (this.shouldSendUpdate(entry, clampedHp)) {
            this.sendHpUpdate(entry, clampedHp);
        }
    }
    
    /**
     * Determine if HP update should be sent to API
     * Rules:
     * 1. Only send on 5% breaks (0, 5, 10, 15, etc.)
     * 2. Don't send duplicate HP values
     * 3. Send if we crossed a 5% threshold since last send
     */
    shouldSendUpdate(entry, currentHp) {
        // Must be on a 5% break
        if (currentHp % this.sendInterval !== 0) {
            return false;
        }
        
        // First time seeing this boss - send if on 5% break
        if (entry.lastSentHp === null) {
            return true;
        }
        
        // Don't send if same as last sent
        if (entry.lastSentHp === currentHp) {
            return false;
        }
        
        // Calculate 5% breaks
        const lastBreak = Math.floor(entry.lastSentHp / this.sendInterval) * this.sendInterval;
        const currentBreak = Math.floor(currentHp / this.sendInterval) * this.sendInterval;
        
        // Send if we crossed a 5% threshold
        return currentBreak !== lastBreak;
    }
    
    /**
     * Send HP update to API
     */
    async sendHpUpdate(entry, hpPercent) {
        try {
            // Log for debugging
            this.logger(`[HP Tracker] 📊 ${entry.bossName} (ID: ${entry.bossId}, Line: ${entry.lineNumber}) → ${hpPercent}%`);
            
            // Send to API (fire and forget)
            await this.apiClient.sendHpUpdate(
                entry.bossId,
                entry.lineNumber,
                hpPercent
            );
            
            // Update last sent HP
            entry.lastSentHp = hpPercent;
            
        } catch (err) {
            // Fail silently - don't spam logs
            this.logger(`[HP Tracker] ⚠️ API send failed: ${err.message}`);
        }
    }
    
    /**
     * Clear tracking for a specific boss instance (boss killed/despawned)
     */
    clearBoss(bossId, lineNumber) {
        const key = `boss_${bossId}_line_${lineNumber}`;
        if (this.tracking.has(key)) {
            this.tracking.delete(key);
            this.logger(`[HP Tracker] 🗑️ Cleared tracking for boss ${bossId} line ${lineNumber}`);
        }
    }
    
    /**
     * Clear all tracking (zone change, etc.)
     */
    clearAll() {
        const count = this.tracking.size;
        this.tracking.clear();
        if (count > 0) {
            this.logger(`[HP Tracker] 🗑️ Cleared ${count} tracked boss instances`);
        }
    }
    
    /**
     * Get stats for display
     */
    getStats() {
        return {
            enabled: this.enabled,
            trackedBosses: this.tracking.size,
            apiStatus: this.apiClient.getStatus()
        };
    }
    
    /**
     * Configure API client
     */
    configure(apiUrl, apiKey) {
        this.apiClient.configure(apiUrl, apiKey);
    }
}

module.exports = BossHpTracker;
