// BPSR Meter v2.5.1 - Performance-Focused Implementation
// Optimized for robustness, usability, and smooth performance

'use strict';

// ============================================================================
// ERROR BOUNDARY & PERFORMANCE MONITORING
// ============================================================================

// Global error handler - prevents blank screen crashes
window.addEventListener('error', (event) => {
    console.error('💥 Uncaught error:', event.error);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#1a1a1a;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:99999;font-family:Arial;';
    errorDiv.innerHTML = `
        <div style="max-width:600px;text-align:center;padding:40px;">
            <h1 style="color:#ef4444;margin-bottom:20px;font-size:32px;">⚠️ Something went wrong</h1>
            <p style="color:#9ca3af;font-size:16px;margin-bottom:10px;">
                ${event.error?.message || 'An unexpected error occurred'}
            </p>
            <pre style="background:#2d2d2d;padding:15px;border-radius:8px;overflow:auto;max-width:100%;text-align:left;margin:20px 0;font-size:12px;max-height:200px;">${event.error?.stack || 'No stack trace available'}</pre>
            <button onclick="location.reload()" style="margin-top:20px;padding:12px 32px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;">
                🔄 Reload Application
            </button>
        </div>
    `;
    document.body.appendChild(errorDiv);
    return false;
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
});

// Performance monitoring
const PerformanceMonitor = {
    enabled: true,
    fps: 0,
    frameCount: 0,
    lastTime: performance.now(),
    lastLog: performance.now(),
    renderCount: 0,
    lastRenderCount: 0,
    
    update() {
        if (!this.enabled) return;
        
        this.frameCount++;
        const now = performance.now();
        
        if (now >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
        
        if (now >= this.lastLog + 10000) {
            const memoryMB = performance.memory 
                ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2)
                : 'N/A';
            const domNodes = document.querySelectorAll('*').length;
            const renderRate = this.renderCount - this.lastRenderCount;
            
            console.log(`📊 Performance: FPS=${this.fps} | Memory=${memoryMB}MB | DOM=${domNodes} nodes | Renders/10s=${renderRate}`);
            this.lastRenderCount = this.renderCount;
            this.lastLog = now;
        }
    },
    
    recordRender() {
        this.renderCount++;
    }
};

// Start performance monitoring loop
function startPerformanceMonitoring() {
    requestAnimationFrame(function loop() {
        PerformanceMonitor.update();
        requestAnimationFrame(loop);
    });
}

startPerformanceMonitoring();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    refreshInterval: 1500, // 1500ms balanced performance (was 500ms - TOO FAST!)
    apiBase: '/api',
    apiData: '/api/data',
    apiSkill: '/api/skill',
    apiClear: '/api/clear',
    apiPlayerDB: '/api/player-db',
    apiPause: '/api/pause',
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const STATE = {
    players: new Map(), // uid -> player data
    currentFilter: 'all',
    localPlayerUid: null,
    startTime: null,
    lastUpdate: 0,
    refreshTimer: null,
    skillsRefreshTimer: null,
    durationTimer: null,
    viewMode: 'detailed', // 'compact' or 'detailed'
    soloMode: false, // Show only local player
    zoneChanged: false, // Track if zone changed since last combat
    alwaysOnTop: true, // Default to true since Electron window starts with alwaysOnTop: true
    inCombat: false, // Track if currently in combat
    lastPlayerCount: 0, // Track player count to detect combat start
    playerLastUpdate: new Map(), // Track last update time for idle detection
};

// ============================================================================
// SETTINGS WITH PERSISTENCE
// ============================================================================

const CONFIG_VERSION = 2; // Increment when breaking changes occur

const SETTINGS = {
    version: CONFIG_VERSION,
    highlightLocal: true,
    showGS: true,
    refreshInterval: 1.5, // 1500ms - prevents excessive renders (was 0.5s)
    rememberNames: true,
    autoClearOnZoneChange: true, // Clear data when entering combat after zone change
    keepDataAfterDungeon: true, // Don't clear immediately on zone exit
    overlayOpacity: 0.95, // PHASE 3: Overlay transparency (0.0-1.0)
    
    // Column visibility for overlay mode
    columns: {
        dps: true,
        maxDps: true,
        avgDps: true,
        totalDmg: true,
        hps: true,
        dmgTaken: true,
        gs: true,
    },
    
    load() {
        try {
            const saved = localStorage.getItem('bpsr-settings');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                if (savedSettings.version < CONFIG_VERSION) {
                    // Perform migration if version is outdated
                    // Migrating settings...
                    // Add migration logic here if needed
                }
                // Merge top-level settings
                Object.keys(savedSettings).forEach(key => {
                    if (key === 'columns' && typeof savedSettings.columns === 'object') {
                        // Deep merge columns object
                        Object.assign(this.columns, savedSettings.columns);
                    } else if (key !== 'load' && key !== 'save') {
                        this[key] = savedSettings[key];
                    }
                });
                // Settings loaded
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    },
    
    save() {
        try {
            const { load, save, ...settings } = this;
            localStorage.setItem('bpsr-settings', JSON.stringify(settings));
            // Settings saved
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
};

// ============================================================================
// PLAYER DATABASE (Persistent UID -> Name Mapping)
// ============================================================================

const PLAYER_DB = {
    data: new Map(),
    
    load() {
        try {
            const saved = localStorage.getItem('bpsr-player-db');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = new Map(Object.entries(parsed));
                // Loaded ${this.data.size} players from database
            } else {
                // No player database found
            }
        } catch (e) {
            console.error('Failed to load player database:', e);
        }
    },
    
    save() {
        if (!SETTINGS.rememberNames) {
            // Not saving player DB - disabled
            return;
        }
        try {
            const obj = Object.fromEntries(this.data);
            localStorage.setItem('bpsr-player-db', JSON.stringify(obj));
            // Saved ${this.data.size} players
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
            // Added/Updated player in DB
        }
    },
    
    get(uid) {
        return this.data.get(String(uid));
    }
};

// ============================================================================
// PROFESSION MAPPING
// ============================================================================

const PROFESSIONS = {
    '雷影剑士': { name: 'Stormblade', role: 'dps' },
    '冰魔导师': { name: 'Frost Mage', role: 'dps' },
    '涤罪恶火·战斧': { name: 'Fire Axe', role: 'dps' },
    '青岚骑士': { name: 'Wind Knight', role: 'tank' },
    '森语者': { name: 'Verdant Oracle', role: 'heal' },
    '雷霆一闪·手炮': { name: 'Gunner', role: 'dps' },
    '巨刃守护者': { name: 'Heavy Guardian', role: 'tank' },
    '暗灵祈舞·仪刀/仪仗': { name: 'Spirit Dancer', role: 'dps' },
    '神射手': { name: 'Marksman', role: 'dps' },
    '神盾骑士': { name: 'Shield Knight', role: 'tank' },
    '灵魂乐手': { name: 'Soul Musician', role: 'dps' },
    '居合': { name: 'Iaido', role: 'dps' },
    '月刃': { name: 'MoonStrike', role: 'dps' },
    '冰矛': { name: 'Icicle', role: 'dps' },
    '射线': { name: 'Frostbeam', role: 'dps' },
    '防盾': { name: 'Vanguard', role: 'tank' },
    '岩盾': { name: 'Skyward', role: 'tank' },
    '惩戒': { name: 'Smite', role: 'dps' },
    '愈合': { name: 'Lifebind', role: 'heal' },
    '格挡': { name: 'Block', role: 'tank' },
    '狼弓': { name: 'Wildpack', role: 'dps' },
    '鹰弓': { name: 'Falconry', role: 'dps' },
    '光盾': { name: 'Shield', role: 'tank' },
    '协奏': { name: 'Concerto', role: 'heal' },
    '狂音': { name: 'Dissonance', role: 'heal' },
    '空枪': { name: 'Empty Gun', role: 'dps' },
    '重装': { name: 'Heavy Armor', role: 'tank' },
    '未知': { name: 'Unknown', role: 'unknown' },  // Undetected profession
    '': { name: 'Unknown', role: 'unknown' },       // Empty profession
};

// Detect role from sub-profession or healing/tanking behavior
function detectRoleFromBehavior(player) {
    const totalDmg = player.total_damage?.total || 0;
    const totalHeal = player.total_healing?.total || 0;
    const dmgTaken = player.taken_damage || 0;
    const totalHps = player.total_hps || 0;
    const totalDps = player.total_dps || 0;
    
    // Healer detection: healing is PRIMARY role (much more healing than damage)
    // Healers typically have healing >> damage (3x+) AND high HPS
    if (totalHeal > totalDmg * 3 && totalHps > 100) {
        return 'heal';
    }
    
    // OR extremely high HPS compared to DPS (dedicated healer)
    if (totalHps > totalDps * 5 && totalHps > 500) {
        return 'heal';
    }
    
    // Tank detection: takes significant damage relative to damage dealt
    // Tanks may have self-heal but damage taken is the key indicator
    if (dmgTaken > totalDmg * 0.2 && totalDmg > 5000) {
        return 'tank';
    }
    
    // High damage taken with low damage output = pure tank
    if (dmgTaken > 50000 && totalDmg < 10000) {
        return 'tank';
    }
    
    // Default to DPS (includes tanks with self-heal that don't take much damage yet)
    return 'dps';
}

function getProfession(profStr, player = null) {
    const base = profStr?.split('-')[0];
    const sub = profStr?.split('-')[1];
    
    // Check sub-profession first (more specific)
    if (sub && PROFESSIONS[sub]) {
        return PROFESSIONS[sub];
    }
    
    // Then check base profession
    const result = PROFESSIONS[base];
    if (result && result.role !== 'unknown') {
        return result;
    }
    
    // If unknown, try to detect from behavior
    if (player && result && result.role === 'unknown') {
        const behaviorRole = detectRoleFromBehavior(player);
        return { name: 'Unknown', role: behaviorRole };
    }
    
    // Absolute fallback
    return { name: 'Unknown', role: 'dps' };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatNumber(val) {
    if (!Number.isFinite(val)) return '0';
    if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(1) + 'k';
    return Math.round(val).toString();
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getHPColor(percent) {
    if (percent >= 75) return '#22c55e';
    if (percent >= 50) return '#facc15';
    if (percent >= 25) return '#f97316';
    return '#ef4444';
}

// ============================================================================
// DATA FETCHING & MERGING
// ============================================================================

async function fetchPlayerData() {
    // Don't fetch new data when paused - maintain frozen state
    if (isPaused) {
        console.log('⏸️ Data fetch skipped - paused');
        return Array.from(STATE.players.values());
    }
    
    // Fetching player data... (reduced logging for performance)
    
    try {
        const res = await fetch(CONFIG.apiData);
        if (!res.ok) {
            console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
            throw new Error('Failed to fetch data');
        }
        
        const payload = await res.json();
        
        // Check if backend detected zone change
        if (payload.zoneChanged && !STATE.zoneChanged) {
            STATE.zoneChanged = true;
            // Zone change detected
        }
        
        // Detect combat start (new data appearing)
        const hasActivePlayers = payload.data && payload.data.length > 0 && 
            payload.data.some(p => (p.total_damage?.total || 0) > 0 || (p.total_healing?.total || 0) > 0);
        
        // Smart clear: If zone changed and now entering combat, clear old data
        if (hasActivePlayers && !STATE.inCombat && STATE.zoneChanged && SETTINGS.autoClearOnZoneChange) {
            // Clearing old data for new zone
            STATE.players.clear();
            STATE.startTime = null;
            STATE.zoneChanged = false;
            showNotification('New combat - data cleared');
        }
        
        // Update combat state and manage timer
        const wasInCombat = STATE.inCombat;
        STATE.inCombat = hasActivePlayers;
        
        // Start timer when combat begins (use frontend timestamp, not backend)
        if (!STATE.startTime && hasActivePlayers) {
            STATE.startTime = Date.now();
            startDurationCounter();
            // Combat timer started
        }
        
        // Stop timer when combat ends (no active players)
        if (wasInCombat && !hasActivePlayers && STATE.startTime) {
            stopDurationCounter();
            // Combat timer stopped
        }
        
        // Merge player data (preserve accumulated stats)
        if (payload.data && Array.isArray(payload.data)) {
            payload.data.forEach(player => {
                const uid = player.uid;
                const existing = STATE.players.get(uid);
                
                // CRITICAL: Detect and set local player UID
                if (player.isLocalPlayer && STATE.localPlayerUid !== uid) {
                    STATE.localPlayerUid = uid;
                    // Local player detected
                }
                
                if (existing) {
                    // Update existing player, but preserve name and last non-zero DPS
                    const preservedName = existing.name;
                    const lastDps = existing.current_dps || existing.realtime_dps || 0;
                    const lastMaxDps = existing.max_dps || existing.realtime_dps_max || 0;
                    
                    Object.assign(existing, player);
                    
                    if (!existing.name && preservedName) {
                        existing.name = preservedName;
                    }
                    
                    // Hold last non-zero DPS value when combat ends
                    const newDps = player.current_dps || player.realtime_dps || 0;
                    if (newDps === 0 && lastDps > 0) {
                        existing.current_dps = lastDps;
                        existing.realtime_dps = lastDps;
                    }
                    if ((player.max_dps || 0) === 0 && lastMaxDps > 0) {
                        existing.max_dps = lastMaxDps;
                        existing.realtime_dps_max = lastMaxDps;
                    }
                } else {
                    // Add new player
                    STATE.players.set(uid, player);
                }
                
                // IDLE DETECTION: Track last update time if player has activity
                const hasActivity = (player.total_damage?.total || 0) > 0 || (player.total_healing?.total || 0) > 0;
                if (hasActivity) {
                    STATE.playerLastUpdate.set(uid, Date.now());
                }
                
                // Add to player database - be more aggressive
                const nameToSave = player.name || existing?.name;
                if (nameToSave && nameToSave !== 'unknown' && nameToSave !== '') {
                    PLAYER_DB.add(uid, nameToSave);
                }
            });
            
            STATE.lastUpdate = Date.now();
        }
        
        // Track player count for combat detection
        STATE.lastPlayerCount = payload.data ? payload.data.length : 0;
        
        return Array.from(STATE.players.values());
    } catch (error) {
        console.error('Error fetching data:', error);
        return Array.from(STATE.players.values());
    }
}

// ============================================================================
// RENDERING
// ============================================================================

function renderPlayerRow(player, rank, maxDmg, isLocal, teamTotalDamage = 1) {
    const prof = getProfession(player.profession, player);
    const name = player.name || PLAYER_DB.get(player.uid) || `Unknown_${player.uid}`;
    
    const hp = player.hp || 0;
    const maxHp = player.max_hp || 1;
    const hpPercent = (hp / maxHp) * 100;
    const dmgBarPercent = ((player.total_damage?.total || 0) / maxDmg) * 100;
    
    const gs = player.fightPoint || 0;
    const currentDps = player.current_dps || player.realtime_dps || 0;
    const maxDps = player.max_dps || player.realtime_dps_max || 0;
    const avgDps = player.total_dps || 0;
    const hps = player.total_hps || 0;
    const maxHps = player.realtime_hps_max || 0;
    const totalDmg = player.total_damage?.total || 0;
    const dmgTaken = player.taken_damage || 0;
    const totalHealing = player.total_healing?.total || 0;
    const crit = (player.critRate || 0).toFixed(0);
    const luck = (player.luckyRate || 0).toFixed(0);
    const maxDmgVal = player.maxDamage || 0;
    const haste = player.haste || 0;
    
    // CONTRIBUTION PERCENTAGE
    const contributionPercent = teamTotalDamage > 0 ? ((totalDmg / teamTotalDamage) * 100).toFixed(1) : 0;
    
    const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
    const isExpanded = expandedPlayerIds.includes(player.uid);
    const isCompact = STATE.viewMode === 'compact';
    const isIdle = player.isIdle || false;
    
    // Compact view - single line with clear labels
    if (document.body.classList.contains('compact-mode')) {
        // Show different stats based on role
        const isHealer = prof.role === 'heal';
        const isTank = prof.role === 'tank';
        
        return `
            <div class="player-row ${isLocal ? 'local' : ''} ${isIdle ? 'idle' : ''}" 
                 data-uid="${player.uid}"
                 style="--dmg-percent: ${dmgBarPercent}%">
                <div class="rank ${rankClass}">${rank}</div>
                <div class="player-name-col">
                    <div class="name-line">
                        ${isLocal ? '<span class="local-star">★</span>' : ''}
                        <span class="name">${name}${isIdle ? ' <span style="opacity:0.5">(IDLE)</span>' : ''}</span>
                        <span class="role-badge ${prof.role}">${prof.role.toUpperCase()}</span>
                    </div>
                    <div class="hp-bar-mini">
                        <div class="hp-fill" style="width: ${hpPercent}%; background: ${getHPColor(hpPercent)}"></div>
                    </div>
                </div>
                ${!isHealer ? `
                    <div class="stat-col">
                        <div class="stat-value">${formatNumber(avgDps)}</div>
                        <div class="stat-label">DPS</div>
                    </div>
                    <div class="stat-col">
                        <div class="stat-value">${formatNumber(maxDps)}</div>
                        <div class="stat-label">MAX DPS</div>
                    </div>
                    <div class="stat-col">
                        <div class="stat-value">${formatNumber(totalDmg)}</div>
                        <div class="stat-label">TOTAL DMG</div>
                    </div>
                    <div class="stat-col">
                        <div class="stat-value">${formatNumber(dmgTaken)}</div>
                        <div class="stat-label">DMG TAKEN</div>
                    </div>
                ` : ''}
                ${isHealer ? `
                    <div class="stat-col heal">
                        <div class="stat-value">${formatNumber(hps)}</div>
                        <div class="stat-label">HPS</div>
                    </div>
                    <div class="stat-col heal">
                        <div class="stat-value">${formatNumber(maxHps)}</div>
                        <div class="stat-label">MAX HPS</div>
                    </div>
                    <div class="stat-col heal">
                        <div class="stat-value">${formatNumber(totalHealing)}</div>
                        <div class="stat-label">TOTAL HPS</div>
                    </div>
                    <div class="stat-col">
                        <div class="stat-value">${formatNumber(dmgTaken)}</div>
                        <div class="stat-label">DMG TAKEN</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Detailed view - FIXED: Direct grid children for perfect alignment
    return `
        <div class="player-row-wrapper">
            <div class="player-row ${isLocal ? 'local' : ''} ${isExpanded ? 'expanded' : ''} ${isIdle ? 'idle' : ''}" 
                 style="--dmg-percent: ${dmgBarPercent}%"
                 data-uid="${player.uid}"
                 title="${isIdle ? 'IDLE - No activity for 30+ seconds' : ''}">
                <div class="rank ${rankClass}">${rank}</div>
                <div class="player-name-col">
                    <div class="name-line">
                        ${isLocal ? '<span class="local-star">★</span>' : ''}
                        <span class="name">${name}${isIdle ? ' <span style="opacity:0.5">(IDLE)</span>' : ''}</span>
                        <span class="role-badge ${prof.role}">${prof.role.toUpperCase()}</span>
                    </div>
                    <div class="hp-bar-mini">
                        <div class="hp-fill" style="width: ${hpPercent}%; background: ${getHPColor(hpPercent)}"></div>
                    </div>
                </div>
                <div class="cell-value">${formatNumber(currentDps)}</div>
                <div class="cell-value">${formatNumber(maxDps)}</div>
                <div class="cell-value">${formatNumber(avgDps)}</div>
                <div class="cell-value">${formatNumber(totalDmg)} <span class="contribution-percent">(${contributionPercent}%)</span></div>
                <div class="cell-value">${formatNumber(hps)}${maxHps > 0 ? ` / ${formatNumber(maxHps)}` : ''}</div>
                <div class="cell-value">${formatNumber(dmgTaken)}</div>
                <div class="cell-value">${gs > 0 ? formatNumber(gs) : '-'}</div>
            </div>
            ${isExpanded ? renderPlayerDetails(player) : ''}
        </div>
    `;
}

function renderPlayerDetails(player) {
    return `
        <div class="player-details">
            <div class="details-row">
                <div class="detail-stat">
                    <span class="detail-label">Crit Rate:</span>
                    <span class="detail-value">${(player.critRate || 0).toFixed(1)}%</span>
                </div>
                <div class="detail-stat">
                    <span class="detail-label">Lucky Rate:</span>
                    <span class="detail-value">${(player.luckyRate || 0).toFixed(1)}%</span>
                </div>
                <div class="detail-stat">
                    <span class="detail-label">Max Damage:</span>
                    <span class="detail-value">${formatNumber(player.maxDamage || 0)}</span>
                </div>
                <div class="detail-stat">
                    <span class="detail-label">Haste:</span>
                    <span class="detail-value">${player.haste > 0 ? player.haste : 'N/A'}</span>
                </div>
                <div class="detail-stat">
                    <span class="detail-label">Mastery:</span>
                    <span class="detail-value">${player.mastery > 0 ? player.mastery : 'N/A'}</span>
                </div>
            </div>
            <div class="skills-title">Skills</div>
            <div id="skills-${player.uid}" class="skills-container">Loading...</div>
        </div>
    `;
}

function updateStatusBar(activeNonIdlePlayers = []) {
    const players = Array.from(STATE.players.values());
    const activePlayers = players.filter(p => {
        const hasDamage = (p.total_damage?.total || 0) > 0;
        const hasHealing = (p.total_healing?.total || 0) > 0;
        return hasDamage || hasHealing;
    });
    
    // Update player count
    const playerCountEl = document.getElementById('status-players');
    if (playerCountEl) {
        playerCountEl.textContent = `${activePlayers.length} Player${activePlayers.length !== 1 ? 's' : ''}`;
    }
    
    // Update network status
    const networkEl = document.getElementById('status-network');
    if (networkEl) {
        const timeSinceUpdate = Date.now() - STATE.lastUpdate;
        if (timeSinceUpdate > 10000) {
            networkEl.textContent = 'No Data';
            networkEl.style.color = 'var(--accent-dps)';
        } else {
            networkEl.textContent = 'Capturing Packets';
            networkEl.style.color = 'var(--text-secondary)';
        }
    }
    
    // Update footer DPS - Show LOCAL PLAYER DPS, not team DPS
    const dpsEl = document.getElementById('status-dps');
    if (dpsEl) {
        const localPlayer = activeNonIdlePlayers.find(p => p.isLocalPlayer || p.uid === STATE.localPlayerUid);
        const myDPS = localPlayer ? (localPlayer.current_dps || localPlayer.realtime_dps || 0) : 0;
        dpsEl.textContent = `My DPS: ${formatNumber(myDPS)}`;
    }
}

// Track which players have changed for incremental updates
const dirtyPlayers = new Set();
let lastPlayerState = new Map();

function markPlayerDirty(uid) {
    dirtyPlayers.add(uid);
}

function renderPlayers() {
    PerformanceMonitor.recordRender();
    
    const players = Array.from(STATE.players.values());
    
    // Filter out players with no meaningful data (in town, no combat)
    const activePlayers = players.filter(p => {
        const hasDamage = (p.total_damage?.total || 0) > 0;
        const hasHealing = (p.total_healing?.total || 0) > 0;
        const hasDPS = (p.total_dps || 0) > 0;
        const hasHPS = (p.total_hps || 0) > 0;
        
        return hasDamage || hasHealing || hasDPS || hasHPS;
    });
    
    // If no players have data, show placeholder
    if (activePlayers.length === 0) {
        const list = document.getElementById('player-list');
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-users-slash"></i>
                    <p>No combat data yet</p>
                    <small>Change instance/zone to start tracking</small>
                </div>
            `;
        }
        // Update status bar with empty data
        updateStatusBar([]);
        return;
    }
    
    // Apply current filters
    const filtered = activePlayers.filter(p => {
        // ... filter logic
    });
    
    const sorted = sortPlayers(filtered);
    
    // TEAM TOTALS: Calculate for non-idle players only
    const activeNonIdlePlayers = sorted.filter(p => !p.isIdle);
    
    // Update status bar with active players
    updateStatusBar(activeNonIdlePlayers);
    const teamTotalDamage = activeNonIdlePlayers.reduce((sum, p) => sum + (p.total_damage?.total || 0), 0);
    const teamTotalHealing = activeNonIdlePlayers.reduce((sum, p) => sum + (p.total_healing?.total || 0), 0);
    const teamTotalDPS = activeNonIdlePlayers.reduce((sum, p) => sum + (p.total_dps || 0), 0);
    const teamTotalHPS = activeNonIdlePlayers.reduce((sum, p) => sum + (p.total_hps || 0), 0);
    
    const list = document.getElementById('player-list');
    if (!list) {
        console.error('❌ player-list element not found!');
        return;
    }
    // Players: ${STATE.players.size} (reduced logging)
    
    if (sorted.length === 0) {
        // Check if server is responsive
        const connectionStatus = STATE.lastUpdate > 0 
            ? `Connected • Last update: ${Math.floor((Date.now() - STATE.lastUpdate) / 1000)}s ago`
            : 'Connecting to server...';
        
        list.innerHTML = `
            <div class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Waiting for combat data...</span>
                <div style="margin-top:10px;font-size:12px;color:#9ca3af;">${connectionStatus}</div>
                <div style="margin-top:5px;font-size:11px;color:#6b7280;">Server port: ${window.location.port || '8989'}</div>
            </div>
        `;
        // CRITICAL: Resize IMMEDIATELY after DOM updates
        requestAnimationFrame(() => {
            requestAnimationFrame(() => autoResizeWindow());
        });
        return;
    }
    
    const maxDmg = Math.max(...sorted.map(p => p.total_damage?.total || 0), 1);
    
    // Find local player and their rank
    let localPlayer = null;
    let localPlayerRank = 0;
    sorted.forEach((p, idx) => {
        if (p.isLocalPlayer || p.uid === STATE.localPlayerUid) {
            localPlayer = p;
            localPlayerRank = idx + 1;
        }
    });
    
    // Separate local player from others
    const otherPlayers = sorted.filter(p => !(p.isLocalPlayer || p.uid === STATE.localPlayerUid));
    
    // Render local player first, then others
    let html = '';
    
    // Add compact mode column headers
    const isCompact = STATE.viewMode === 'compact';
    if (isCompact) {
        html += `
            <div class="compact-headers">
                <div class="compact-header-rank">#</div>
                <div class="compact-header-name">PLAYER</div>
                <div class="compact-header-stat">CUR</div>
                <div class="compact-header-stat">MAX</div>
                <div class="compact-header-stat">AVG</div>
                <div class="compact-header-stat">TOTAL</div>
                <div class="compact-header-stat">%</div>
            </div>
        `;
    }
    
    // TEAM TOTALS ROW - Only show if in actual party (2+ players)
    // Use sorted.length to match displayed players
    if (sorted.length >= 2) {
        html += `
            <div class="team-totals-row">
                <div class="team-totals-label">
                    <i class="fa-solid fa-users"></i> Team Totals (${sorted.length} active)
                </div>
                <div class="team-totals-stats">
                    <span title="Total Team DPS"><i class="fa-solid fa-bolt"></i> ${formatNumber(teamTotalDPS)} DPS</span>
                    <span title="Total Team Damage"><i class="fa-solid fa-fire"></i> ${formatNumber(teamTotalDamage)}</span>
                    <span title="Total Team Healing"><i class="fa-solid fa-heart"></i> ${formatNumber(teamTotalHealing)}</span>
                </div>
            </div>
        `;
    }
    
    // Render local player at top if exists
    if (localPlayer) {
        html += renderPlayerRow(localPlayer, localPlayerRank, maxDmg, true, teamTotalDamage);
        if (otherPlayers.length > 0) {
            html += '<div class="separator">Rankings</div>';
        }
    }
    
    // Render other players
    otherPlayers.forEach((player, idx) => {
        // Get actual rank from full sorted list
        const actualRank = sorted.findIndex(p => p.uid === player.uid) + 1;
        html += renderPlayerRow(player, actualRank, maxDmg, false, teamTotalDamage);
    });
    
    list.innerHTML = html;
    
    // CRITICAL: Add click handlers to all player rows
    document.querySelectorAll('.player-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            // Player row clicked (reduced logging)
            // Don't toggle if clicking on a button or link
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button')) {
                // Clicked on button, ignoring
                return;
            }
            const uid = parseInt(row.dataset.uid);
            // Toggle player details
            togglePlayerDetails(uid, e);
        });
    });
    
    // Restore skills from cache for expanded players (don't refetch - that happens only on expand)
    expandedPlayerIds.forEach(uid => {
        if (skillsCache.has(uid)) {
            renderSkillsFromCache(uid);
        }
    });
    
    // Auto-resize IMMEDIATELY after render completes
    requestAnimationFrame(() => {
        requestAnimationFrame(() => autoResizeWindow());
    });
}

// Debounce timer for resize operations
let resizeDebounceTimer = null;
let isResizing = false;
let lastResizeTime = 0;

function autoResizeWindow() {
    if (!window.electronAPI?.resizeWindow) return;
    if (isResizing) return; // Skip if already resizing

    const container = document.querySelector('.meter-container');
    if (!container) return;

    // Clear any pending resize
    if (resizeDebounceTimer) {
        clearTimeout(resizeDebounceTimer);
    }

    // Debounce with longer delay to prevent resize fighting
    resizeDebounceTimer = setTimeout(() => {
        // Force browser to calculate actual layout
        const rect = container.getBoundingClientRect();
        const actualHeight = Math.ceil(rect.height);
        const actualWidth = Math.ceil(rect.width);
        
        // Different constraints for compact vs full mode
        const isCompact = document.body.classList.contains('compact-mode');
        let targetHeight, targetWidth, finalHeight, finalWidth;
        
        if (isCompact) {
            // Compact mode: tight fit, minimal padding
            targetHeight = actualHeight + 5;
            targetWidth = actualWidth + 5;
            finalHeight = Math.max(200, Math.min(targetHeight, 600));
            finalWidth = Math.max(400, Math.min(targetWidth, 450));
        } else {
            // Full mode: generous padding
            targetHeight = actualHeight + 10;
            targetWidth = actualWidth + 10;
            finalHeight = Math.max(250, Math.min(targetHeight, 1200));
            finalWidth = Math.max(800, Math.min(targetWidth, 1600));
        }

        // Only resize if difference is significant (not every pixel)
        const currentHeight = window.innerHeight;
        const currentWidth = window.innerWidth;
        const heightDiff = Math.abs(finalHeight - currentHeight);
        const widthDiff = Math.abs(finalWidth - currentWidth);
        
        if (heightDiff > 10 || widthDiff > 10) {
            isResizing = true;
            lastResizeTime = Date.now();
            
            window.electronAPI.resizeWindow(finalWidth, finalHeight);
            
            setTimeout(() => {
                isResizing = false;
            }, 150);
        }
    }, 100); // Slower debounce to prevent resize spam
}

function filterPlayers(players) {
    if (STATE.currentFilter === 'all') return players;
    return players.filter(p => {
        const prof = getProfession(p.profession, p);
        return prof.role === STATE.currentFilter;
    });
}

function sortPlayers(players) {
    return [...players].sort((a, b) => {
        const dmgA = a.total_damage?.total || 0;
        const dmgB = b.total_damage?.total || 0;
        return dmgB - dmgA;
    });
}

// ============================================================================
// PLAYER DETAILS MODAL
// ============================================================================

async function openPlayerDetails(uid) {
    try {
        const res = await fetch(`${CONFIG.apiSkill}/${uid}`);
        if (!res.ok) throw new Error('Failed to fetch player details');
        
        const data = await res.json();
        const player = STATE.players.get(uid);
        if (!player) return;
        
        const prof = getProfession(player.profession, player);
        const name = player.name || PLAYER_DB.get(uid) || `Player ${uid}`;
        
        document.getElementById('details-title').textContent = name;
        
        const skills = data.data?.skills || data.skills || {};
        
        document.getElementById('details-body').innerHTML = `
            <div class="details-grid">
                <div class="details-card">
                    <h4>Basic Info</h4>
                    <div class="detail-row">
                        <span class="detail-label">Class:</span>
                        <span class="detail-value">${prof.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Role:</span>
                        <span class="detail-value">${prof.role.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Haste:</span>
                        <span class="detail-value">${player.haste > 0 ? player.haste : 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Mastery:</span>
                        <span class="detail-value">${player.mastery > 0 ? player.mastery : 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Gear Score:</span>
                        <span class="detail-value">${formatNumber(player.fightPoint || 0)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Level:</span>
                        <span class="detail-value">${player.attr?.level || 'N/A'}</span>
                    </div>
                </div>
                <div class="details-card">
                    <h4>Combat Stats</h4>
                    <div class="detail-row">
                        <span class="detail-label">Crit Rate:</span>
                        <span class="detail-value">${(player.critRate || 0).toFixed(1)}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Lucky Rate:</span>
                        <span class="detail-value">${(player.luckyRate || 0).toFixed(1)}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Max Damage:</span>
                        <span class="detail-value">${formatNumber(player.maxDamage || 0)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total DPS:</span>
                        <span class="detail-value">${formatNumber(player.total_dps || 0)}</span>
                    </div>
                </div>
            </div>
            
            <h4 style="margin: 16px 0 8px; font-size: 11px; color: var(--text-secondary); text-transform: uppercase;">Skill Breakdown</h4>
            <table class="skills-table">
                <thead>
                    <tr>
                        <th>Skill ID</th>
                        <th>Total DMG</th>
                        <th>Hits</th>
                        <th>Crit%</th>
                        <th>Avg DMG</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderSkillRows(skills)}
                </tbody>
            </table>
            
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <button class="btn-primary" onclick="copyPlayerToClipboard('${uid}', false)" style="flex: 1;">
                    <i class="fa-solid fa-copy"></i> Copy Stats Only
                </button>
                <button class="btn-primary" onclick="copyPlayerToClipboard('${uid}', true)" style="flex: 1;">
                    <i class="fa-solid fa-copy"></i> Copy with Skills
                </button>
                <button class="btn-secondary" onclick="exportPlayerData('${uid}')" style="flex: 0;">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        `;
        
        document.getElementById('modal-details').classList.add('active');
    } catch (error) {
        console.error('Error loading player details:', error);
    }
}

function renderSkillRows(skills) {
    const entries = Object.entries(skills);
    if (entries.length === 0) {
        return '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No skill data available</td></tr>';
    }
    
    return entries
        .sort((a, b) => b[1].total - a[1].total)
        .map(([skillId, skill]) => {
            const avg = skill.count > 0 ? skill.total / skill.count : 0;
            const critRate = skill.count > 0 ? (skill.critCount / skill.count * 100) : 0;
            
            return `
                <tr>
                    <td>${skillId}</td>
                    <td>${formatNumber(skill.total)}</td>
                    <td>${skill.count}</td>
                    <td>${critRate.toFixed(1)}%</td>
                    <td>${formatNumber(avg)}</td>
                </tr>
            `;
        })
        .join('');
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

function copyToClipboard() {
    // Filter out inactive players (no damage or healing)
    const activePlayers = Array.from(STATE.players.values()).filter(p => {
        const hasDamage = (p.total_damage?.total || 0) > 0;
        const hasHealing = (p.total_healing?.total || 0) > 0;
        return hasDamage || hasHealing;
    });
    
    const players = sortPlayers(activePlayers);
    const duration = STATE.startTime ? Math.floor((Date.now() - STATE.startTime) / 1000) : 0;
    
    let text = `⚔️ Infamous BPSR DPS Meter - ${formatDuration(duration)} | ${players.length} Active Players\n\n`;
    text += `═══════════════════════════════════════════════════════════════════════════════════════════\n`;
    text += `Rank  Name              Role    DPS     Total DMG   %   GS    Crit  Mast  Haste  HPS   DMG Taken\n`;
    text += `═══════════════════════════════════════════════════════════════════════════════════════════\n`;
    
    players.forEach((p, idx) => {
        const prof = getProfession(p.profession, p);
        const name = (p.name || PLAYER_DB.get(p.uid) || `Player_${p.uid}`).padEnd(16, ' ').substring(0, 16);
        const role = prof.role.toUpperCase().padEnd(6, ' ');
        const dps = formatNumber(p.total_dps || 0).padStart(7, ' ');
        const totalDmg = formatNumber(p.total_damage?.total || 0).padStart(11, ' ');
        const dmgPercent = ((p.total_damage?.total || 0) / players.reduce((sum, pl) => sum + (pl.total_damage?.total || 0), 1) * 100).toFixed(0).padStart(3, ' ');
        const gs = (p.fightPoint ? formatNumber(p.fightPoint) : '-').padStart(5, ' ');
        const crit = `${(p.critRate || 0).toFixed(0)}%`.padStart(5, ' ');
        const mastery = (p.mastery ? formatNumber(p.mastery) : '-').padStart(5, ' ');
        const haste = (p.haste ? formatNumber(p.haste) : '-').padStart(6, ' ');
        const hps = (prof.role === 'heal' ? formatNumber(p.total_hps || 0) : '-').padStart(5, ' ');
        const dmgTaken = formatNumber(p.taken_damage || 0).padStart(11, ' ');
        
        text += `${String(idx + 1).padStart(2, ' ')}.  ${name} ${role} ${dps} ${totalDmg} ${dmgPercent}% ${gs} ${crit} ${mastery} ${haste} ${hps} ${dmgTaken}\n`;
    });
    
    text += `═══════════════════════════════════════════════════════════════════════════════════════════\n`;
    
    // Use execCommand as fallback for Electron
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        // Copied to clipboard
        // Show a temporary notification instead of alert
        showNotification('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

async function copyPlayerToClipboard(uid, includeSkills = false) {
    const player = STATE.players.get(uid);
    if (!player) {
        showNotification('Player not found', 'error');
        return;
    }
    
    const prof = getProfession(player.profession, player);
    const name = player.name || PLAYER_DB.get(uid) || `Player_${uid}`;
    const duration = STATE.startTime ? Math.floor((Date.now() - STATE.startTime) / 1000) : 0;
    
    // Get player's rank
    const activePlayers = Array.from(STATE.players.values()).filter(p => {
        const hasDamage = (p.total_damage?.total || 0) > 0;
        const hasHealing = (p.total_healing?.total || 0) > 0;
        return hasDamage || hasHealing;
    });
    const sortedPlayers = sortPlayers(activePlayers);
    const rank = sortedPlayers.findIndex(p => p.uid === uid) + 1;
    const totalDmg = sortedPlayers.reduce((sum, p) => sum + (p.total_damage?.total || 0), 0);
    const contribution = totalDmg > 0 ? ((player.total_damage?.total || 0) / totalDmg * 100).toFixed(1) : '0.0';
    
    let text = `⚔️ ${name} - Rank #${rank} | ${formatDuration(duration)}\n`;
    text += `═══════════════════════════════════════════════════════════════════\n\n`;
    
    text += `📊 Basic Info:\n`;
    text += `  Class: ${prof.name} (${prof.role.toUpperCase()})\n`;
    text += `  Gear Score: ${formatNumber(player.fightPoint || 0)}\n`;
    text += `  Level: ${player.attr?.level || 'N/A'}\n\n`;
    
    text += `⚔️ Combat Stats:\n`;
    text += `  DPS: ${formatNumber(player.total_dps || 0)}\n`;
    text += `  Max DPS: ${formatNumber(player.max_dps || 0)}\n`;
    text += `  Total DMG: ${formatNumber(player.total_damage?.total || 0)} (${contribution}%)\n`;
    text += `  Max Hit: ${formatNumber(player.maxDamage || 0)}\n`;
    text += `  DMG Taken: ${formatNumber(player.taken_damage || 0)}\n\n`;
    
    if (prof.role === 'heal') {
        text += `💚 Healing Stats:\n`;
        text += `  HPS: ${formatNumber(player.total_hps || 0)}\n`;
        text += `  Max HPS: ${formatNumber(player.max_hps || 0)}\n`;
        text += `  Total Healing: ${formatNumber(player.total_healing?.total || 0)}\n\n`;
    }
    
    text += `🎯 Advanced Stats:\n`;
    text += `  Crit Rate: ${(player.critRate || 0).toFixed(1)}%\n`;
    text += `  Lucky Rate: ${(player.luckyRate || 0).toFixed(1)}%\n`;
    text += `  Mastery: ${player.mastery || 'N/A'}\n`;
    text += `  Haste: ${player.haste || 'N/A'}\n`;
    
    // Include skills if requested
    if (includeSkills) {
        try {
            const res = await fetch(`${CONFIG.apiSkill}/${uid}`);
            if (res.ok) {
                const data = await res.json();
                const skills = data.data?.skills || data.skills || {};
                const skillEntries = Object.entries(skills)
                    .filter(([_, skill]) => (skill.totalDamage || 0) > 0) // Only skills with damage
                    .sort((a, b) => (b[1].totalDamage || 0) - (a[1].totalDamage || 0))
                    .slice(0, 10); // Top 10 skills
                
                if (skillEntries.length > 0) {
                    text += `\n\n📜 SKILLS:\n`;
                    text += `${'─'.repeat(80)}\n`;
                    text += `${'SKILL'.padEnd(30)} ${'TOTAL DMG'.padStart(12)} ${'HITS'.padStart(6)} ${'CRIT%'.padStart(7)} ${'AVG DMG'.padStart(10)}\n`;
                    text += `${'─'.repeat(80)}\n`;
                    
                    skillEntries.forEach(([skillId, skill]) => {
                        // Translate skill ID to name
                        const translatedName = skillNamesMap[skillId] || skill.displayName || `Skill ${skillId}`;
                        const skillName = translatedName.length > 28 ? translatedName.substring(0, 28) + '..' : translatedName;
                        const dmg = formatNumber(skill.totalDamage || 0);
                        const hits = String(skill.totalCount || 0);
                        const critRate = ((skill.critRate || 0) * 100).toFixed(1) + '%';
                        const avgDmg = formatNumber(Math.floor((skill.totalDamage || 0) / Math.max(skill.totalCount || 1, 1)));
                        
                        text += `${skillName.padEnd(30)} ${dmg.padStart(12)} ${hits.padStart(6)} ${critRate.padStart(7)} ${avgDmg.padStart(10)}\n`;
                    });
                } else {
                    text += `\n\n📜 SKILLS: No damage recorded\n`;
                }
            }
        } catch (err) {
            console.error('Failed to fetch skills:', err);
            text += `\n\n📜 SKILLS: Error loading data\n`;
        }
    }
    
    text += `\n═══════════════════════════════════════════════════════════════════\n`;
    text += `Generated by Infamous BPSR Meter at ${new Date().toLocaleTimeString()}\n`;
    
    // Copy to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        // Copied player data
        showNotification(`Copied ${name}'s stats${includeSkills ? ' with skills' : ''}!`);
    } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

function exportAllCSV() {
    // Filter out inactive players
    const activePlayers = Array.from(STATE.players.values()).filter(p => {
        const hasDamage = (p.total_damage?.total || 0) > 0;
        const hasHealing = (p.total_healing?.total || 0) > 0;
        return hasDamage || hasHealing;
    });
    
    const players = sortPlayers(activePlayers);
    const headers = ['Rank', 'Name', 'Class', 'Role', 'GS', 'Current DPS', 'Max DPS', 'Avg DPS', 'Total DMG', '% DMG', 'HPS', 'Max HPS', 'Total Heal', 'DMG Taken', 'Crit%', 'Lucky%', 'Mastery', 'Haste', 'Max Hit'];
    const rows = [headers];
    
    players.forEach((p, idx) => {
        const prof = getProfession(p.profession, p);
        const name = p.name || PLAYER_DB.get(p.uid) || `Player_${p.uid}`;
        const dmgPercent = ((p.total_damage?.total || 0) / players.reduce((sum, pl) => sum + (pl.total_damage?.total || 0), 1) * 100).toFixed(1);
        rows.push([
            idx + 1,
            name,
            prof.name,
            prof.role,
            p.fightPoint || 0,
            p.current_dps || p.realtime_dps || 0,
            p.max_dps || p.realtime_dps_max || 0,
            p.total_dps || 0,
            p.total_damage?.total || 0,
            dmgPercent,
            p.total_hps || 0,
            p.realtime_hps_max || 0,
            p.total_healing?.total || 0,
            p.taken_damage || 0,
            (p.critRate || 0).toFixed(1),
            (p.luckyRate || 0).toFixed(1),
            p.mastery || 0,
            p.haste || 0,
            p.maxDamage || 0,
        ]);
    });
    
    const csv = rows.map(row => row.join(',')).join('\n');
    downloadFile(csv, 'bpsr-meter-all.csv', 'text/csv');
}

function exportAllMarkdown() {
    // Filter out inactive players
    const activePlayers = Array.from(STATE.players.values()).filter(p => {
        const hasDamage = (p.total_damage?.total || 0) > 0;
        const hasHealing = (p.total_healing?.total || 0) > 0;
        return hasDamage || hasHealing;
    });
    
    const players = sortPlayers(activePlayers);
    const duration = STATE.startTime ? Math.floor((Date.now() - STATE.startTime) / 1000) : 0;
    
    let md = `# ⚔️ Infamous BPSR DPS Meter Export\n\n`;
    md += `**Duration:** ${formatDuration(duration)}\n`;
    md += `**Active Players:** ${players.length}\n`;
    md += `**Timestamp:** ${new Date().toLocaleString()}\n\n`;
    md += `## Rankings\n\n`;
    md += `| Rank | Name | Class | Role | GS | Current DPS | Max DPS | Avg DPS | Total DMG | % | HPS | Max HPS | Total Heal | DMG Taken | Crit% | Lucky% | Mastery | Haste | Max Hit |\n`;
    md += `|------|------|-------|------|----|-----------|---------|---------|-----------|----|-----|---------|------------|-----------|-------|--------|---------|--------|----------|\n`;
    
    players.forEach((p, idx) => {
        const prof = getProfession(p.profession, p);
        const name = p.name || PLAYER_DB.get(p.uid) || `Player_${p.uid}`;
        const dmgPercent = ((p.total_damage?.total || 0) / players.reduce((sum, pl) => sum + (pl.total_damage?.total || 0), 1) * 100).toFixed(0);
        const currentDps = p.current_dps || p.realtime_dps || 0;
        const maxDps = p.max_dps || p.realtime_dps_max || 0;
        const maxHps = p.realtime_hps_max || 0;
        
        md += `| ${idx + 1} | ${name} | ${prof.name} | ${prof.role} | ${formatNumber(p.fightPoint || 0)} | ${formatNumber(currentDps)} | ${formatNumber(maxDps)} | ${formatNumber(p.total_dps || 0)} | ${formatNumber(p.total_damage?.total || 0)} | ${dmgPercent}% | ${formatNumber(p.total_hps || 0)} | ${formatNumber(maxHps)} | ${formatNumber(p.total_healing?.total || 0)} | ${formatNumber(p.taken_damage || 0)} | ${(p.critRate || 0).toFixed(1)}% | ${(p.luckyRate || 0).toFixed(1)}% | ${formatNumber(p.mastery || 0)} | ${formatNumber(p.haste || 0)} | ${formatNumber(p.maxDamage || 0)} |\n`;
    });
    
    downloadFile(md, 'bpsr-meter-all.md', 'text/markdown');
}

function exportPlayerData(uid) {
    const player = STATE.players.get(uid);
    if (!player) return;
    
    const prof = getProfession(player.profession, player);
    const name = player.name || PLAYER_DB.get(uid) || `Player_${uid}`;
    
    const data = {
        name,
        uid,
        class: prof.name,
        role: prof.role,
        gearScore: player.fightPoint || 0,
        level: player.attr?.level || 0,
        stats: {
            dps: player.total_dps || 0,
            hps: player.total_hps || 0,
            totalDamage: player.total_damage?.total || 0,
            damageTaken: player.taken_damage || 0,
            totalHealing: player.total_healing?.total || 0,
            critRate: player.critRate || 0,
            luckyRate: player.luckyRate || 0,
            maxDamage: player.maxDamage || 0,
        },
        exportTime: new Date().toISOString(),
    };
    
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `bpsr-${name}-${uid}.json`, 'application/json');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================================================
// DURATION COUNTER
// ============================================================================

function startDurationCounter() {
    if (STATE.durationTimer) clearInterval(STATE.durationTimer);
    
    STATE.durationTimer = setInterval(() => {
        // Don't update timer when paused
        if (isPaused) return;
        
        if (STATE.startTime) {
            const elapsed = Math.floor((Date.now() - STATE.startTime) / 1000);
            document.getElementById('duration').textContent = formatDuration(elapsed);
        }
    }, 1000);
}

function stopDurationCounter() {
    if (STATE.durationTimer) {
        clearInterval(STATE.durationTimer);
        STATE.durationTimer = null;
    }
}

// ============================================================================
// AUTO REFRESH
// ============================================================================

function startAutoRefresh() {
    if (STATE.refreshTimer) clearInterval(STATE.refreshTimer);
    
    const interval = SETTINGS.refreshInterval * 1000;
    
    let lastPlayerCount = 0;
    let lastRenderHash = '';
    
    STATE.refreshTimer = setInterval(async () => {
        try {
            const players = await fetchPlayerData();
            const currentCount = players?.length || 0;
            
            // Only render if data actually changed
            const currentHash = STATE.players.size + ':' + Array.from(STATE.players.values()).map(p => p.total_damage?.total || 0).join(',');
            
            if (currentHash !== lastRenderHash || currentCount !== lastPlayerCount) {
                lastPlayerCount = currentCount;
                lastRenderHash = currentHash;
                STATE.lastUpdate = Date.now();
                renderPlayers();
            }
        } catch (error) {
            console.error('❌ Failed to fetch player data:', error);
            console.error('❌ Error stack:', error.stack);
            // Update connection status in UI
            const statusElement = document.querySelector('.loading div');
            if (statusElement) {
                statusElement.textContent = `Connection error: ${error.message}`;
            }
        }
    }, interval);
    
    // Refresh skills for expanded players every 5 seconds
    if (STATE.skillsRefreshTimer) clearInterval(STATE.skillsRefreshTimer);
    STATE.skillsRefreshTimer = setInterval(() => {
        expandedPlayerIds.forEach(uid => {
            loadAndShowPlayerDetails(uid);
        });
    }, 5000);
}

function stopAutoRefresh() {
    if (STATE.refreshTimer) {
        clearInterval(STATE.refreshTimer);
        STATE.refreshTimer = null;
    }
    if (STATE.skillsRefreshTimer) {
        clearInterval(STATE.skillsRefreshTimer);
        STATE.skillsRefreshTimer = null;
    }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function setupEventListeners() {
    // Setting up event listeners...
    
    // Filter tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Tab changed (reduced logging)
            STATE.currentFilter = tab.dataset.filter;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderPlayers();
        });
    });
    
    // Header buttons - with explicit event handling
    const settingsBtn = document.getElementById('btn-settings');
    // Settings button found
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Settings modal opening...
            
            // Load current settings
            document.getElementById('setting-highlight').checked = SETTINGS.highlightLocal;
            document.getElementById('setting-refresh').value = SETTINGS.refreshInterval;
            document.getElementById('setting-remember-names').checked = SETTINGS.rememberNames;
            document.getElementById('setting-auto-clear-zone').checked = SETTINGS.autoClearOnZoneChange;
            document.getElementById('setting-keep-after-dungeon').checked = SETTINGS.keepDataAfterDungeon;
            
            // Load opacity slider value
            const opacitySlider = document.getElementById('setting-overlay-opacity');
            const opacityValue = document.getElementById('opacity-value');
            if (opacitySlider && opacityValue) {
                const currentOpacity = SETTINGS.overlayOpacity || 1.0;
                opacitySlider.value = currentOpacity;
                opacityValue.textContent = Math.round(currentOpacity * 100) + '%';
            }
        
        // Load column visibility settings
        document.getElementById('setting-col-dps').checked = SETTINGS.columns.dps;
        document.getElementById('setting-col-max-dps').checked = SETTINGS.columns.maxDps;
        document.getElementById('setting-col-avg-dps').checked = SETTINGS.columns.avgDps;
        document.getElementById('setting-col-total-dmg').checked = SETTINGS.columns.totalDmg;
        document.getElementById('setting-col-hps').checked = SETTINGS.columns.hps;
        document.getElementById('setting-col-dmg-taken').checked = SETTINGS.columns.dmgTaken;
        document.getElementById('setting-col-gs').checked = SETTINGS.columns.gs;
        
            const modal = document.getElementById('modal-settings');
            console.log('📋 Opening settings modal:', modal ? 'Found' : 'NOT FOUND');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }
    
    document.getElementById('btn-export')?.addEventListener('click', () => {
        document.getElementById('modal-export').classList.add('active');
    });
    
    document.getElementById('btn-reset')?.addEventListener('click', async () => {
        confirmAction('Reset all DPS data?', async () => {
            try {
                await fetch(CONFIG.apiClear, { method: 'POST' });
                STATE.players.clear();
                
                // Clear skills cache and expanded players
                skillsCache.clear();
                expandedPlayerIds = [];
                
                // Reset timer
                STATE.startTime = null;
                stopDurationCounter();
                document.getElementById('duration').textContent = '00:00';
                
                renderPlayers();
                // CRITICAL: Resize window after clearing data
                setTimeout(() => autoResizeWindow(), 100);
                showToast('All data cleared successfully', 'success');
            } catch (e) {
                console.error('Reset failed:', e);
                showToast('Failed to reset data', 'error');
            }
        });
    });
    
    // View mode toggle
    const compactBtn = document.getElementById('btn-compact');
    if (compactBtn) {
        compactBtn.addEventListener('click', () => {
            STATE.viewMode = STATE.viewMode === 'compact' ? 'detailed' : 'compact';
            const btn = document.getElementById('btn-compact');
            if (btn) {
                btn.title = STATE.viewMode === 'compact' ? 'Switch to Detailed View' : 'Switch to Compact View';
                btn.querySelector('i').className = STATE.viewMode === 'compact' ? 'fa-solid fa-list' : 'fa-solid fa-table-columns';
            }
            
            renderPlayers();
            showNotification(`${STATE.viewMode.charAt(0).toUpperCase() + STATE.viewMode.slice(1)} view enabled`);
        });
    } else {
        console.warn('⚠️ btn-compact not found in DOM');
    }
    
    // Solo mode toggle
    document.getElementById('btn-solo-mode')?.addEventListener('click', () => {
        STATE.soloMode = !STATE.soloMode;
        const btn = document.getElementById('btn-solo-mode');
        if (btn) {
            btn.style.background = STATE.soloMode ? 'rgba(251, 191, 36, 0.2)' : '';
            btn.style.borderColor = STATE.soloMode ? 'var(--accent-gold)' : '';
        }
        renderPlayers();
        // CRITICAL: Resize window after solo mode toggle
        setTimeout(() => autoResizeWindow(), 100);
        showNotification(STATE.soloMode ? 'Solo mode enabled' : 'Solo mode disabled');
    });
    
    // Compact Mode (Overlay Mode) toggle
    document.getElementById('btn-compact-mode')?.addEventListener('click', () => {
        const compactMode = document.body.classList.toggle('compact-mode');
        const btn = document.getElementById('btn-compact-mode');
        
        // Update button tooltip
        if (btn) {
            btn.title = compactMode ? 'Exit Overlay Mode (Full View)' : 'Toggle Overlay Mode (In-Game)';
        }
        
        // Save preference
        SETTINGS.save('compactMode', compactMode);
        
        // Force immediate re-render to update DOM
        renderPlayers();
        
        // CRITICAL: Multiple resize triggers to ensure it works
        setTimeout(() => autoResizeWindow(), 50);
        setTimeout(() => autoResizeWindow(), 150);
        setTimeout(() => autoResizeWindow(), 300);
        
        showToast(
            compactMode 
                ? 'Compact Mode: Max 6 players' 
                : 'Full Mode: All players',
            'info',
            2000
        );
    });
    
    // Always on Top toggle
    document.getElementById('btn-always-on-top')?.addEventListener('click', () => {
        STATE.alwaysOnTop = !STATE.alwaysOnTop;
        const btn = document.getElementById('btn-always-on-top');
        if (btn) {
            btn.title = STATE.alwaysOnTop ? 'Always on Top: ON' : 'Always on Top: OFF';
            btn.style.background = STATE.alwaysOnTop ? 'rgba(251, 191, 36, 0.2)' : '';
            btn.style.borderColor = STATE.alwaysOnTop ? 'var(--accent-gold)' : '';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.style.opacity = STATE.alwaysOnTop ? '1' : '0.5';
            }
        }
        if (window.electronAPI?.setAlwaysOnTop) {
            window.electronAPI.setAlwaysOnTop(STATE.alwaysOnTop);
        }
        showToast(`Always on Top ${STATE.alwaysOnTop ? 'enabled' : 'disabled'}`, 'info');
    });
    
    // Click-through mode toggle
    let clickThroughEnabled = false;
    const titleBar = document.querySelector('.title-bar');
    
    document.getElementById('btn-click-through')?.addEventListener('click', () => {
        clickThroughEnabled = !clickThroughEnabled;
        const btn = document.getElementById('btn-click-through');
        if (btn) {
            btn.title = clickThroughEnabled ? 'Click-Through: ON (Click me to disable)' : 'Click-Through Mode: OFF';
            btn.style.background = clickThroughEnabled ? 'rgba(251, 191, 36, 0.2)' : '';
            btn.style.borderColor = clickThroughEnabled ? 'var(--accent-gold)' : '';
        }
        
        // Make title bar always clickable even in click-through mode
        if (titleBar) {
            if (clickThroughEnabled) {
                titleBar.style.pointerEvents = 'auto';
                // Make rest of window click-through
                document.body.style.pointerEvents = 'none';
                titleBar.style.position = 'relative';
                titleBar.style.zIndex = '9999';
            } else {
                titleBar.style.pointerEvents = '';
                document.body.style.pointerEvents = '';
                titleBar.style.position = '';
                titleBar.style.zIndex = '';
            }
        }
        
        if (window.electronAPI?.setClickThrough) {
            window.electronAPI.setClickThrough(clickThroughEnabled);
        }
        showToast(
            clickThroughEnabled 
                ? 'Click-Through ON - Title bar still clickable!' 
                : 'Click-Through OFF', 
            'info',
            3000
        );
    });

    // Transparency adjustment
    let currentOpacity = 1.0;
    document.getElementById('btn-transparency')?.addEventListener('click', () => {
        // Cycle: 100% → 90% → 80% → 70% → 100%
        currentOpacity = currentOpacity > 0.7 ? currentOpacity - 0.1 : 1.0;
        if (window.electronAPI?.setOpacity) {
            window.electronAPI.setOpacity(currentOpacity);
        }
        showToast(`Opacity: ${Math.round(currentOpacity * 100)}%`, 'info');
    });

    document.getElementById('btn-lock')?.addEventListener('click', () => {
        if (window.electronAPI) {
            window.electronAPI.toggleLockState();
        }
    });
    
    if (window.electronAPI) {
        window.electronAPI.onLockStateChanged((locked) => {
            const icon = document.querySelector('#btn-lock i');
            if (icon) icon.className = locked ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
            
            // Enable click-through when locked in compact mode
            if (locked) {
                document.body.classList.add('locked');
            } else {
                document.body.classList.remove('locked');
            }
        });
    }
    
    // Expand/Collapse player list in compact mode
    document.getElementById('btn-expand-list')?.addEventListener('click', () => {
        const playerList = document.getElementById('player-list');
        const button = document.getElementById('btn-expand-list');
        const icon = button?.querySelector('i');
        const text = button?.querySelector('span');
        
        if (playerList && button) {
            const isExpanded = playerList.classList.toggle('expanded');
            
            if (icon) {
                icon.className = isExpanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
            }
            if (text) {
                text.textContent = isExpanded ? 'Show Less' : 'Show More';
            }
            
            // Trigger resize after animation
            setTimeout(() => autoResizeWindow(), 250);
        }
    });
    
    // Minimize button
    document.getElementById('btn-minimize')?.addEventListener('click', () => {
        if (window.electronAPI) {
            window.electronAPI.minimizeWindow();
        }
    });
    
    // Pause button
    document.getElementById('btn-pause')?.addEventListener('click', async () => {
        console.log('⏸️ Pause button clicked!');
        await togglePause();
    });
    
    document.getElementById('btn-close')?.addEventListener('click', () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Export buttons
    document.getElementById('export-copy')?.addEventListener('click', () => {
        copyToClipboard();
        // Don't close modal immediately so user sees the success message
        setTimeout(() => {
            document.getElementById('modal-export').classList.remove('active');
        }, 1500);
    });
    
    document.getElementById('export-all-csv')?.addEventListener('click', () => {
        exportAllCSV();
        document.getElementById('modal-export').classList.remove('active');
    });
    
    document.getElementById('export-all-md')?.addEventListener('click', () => {
        exportAllMarkdown();
        document.getElementById('modal-export').classList.remove('active');
    });
    
    // Manual name save
    document.getElementById('btn-save-my-name')?.addEventListener('click', () => {
        const nameInput = document.getElementById('setting-my-name');
        const myName = nameInput.value.trim();
        
        if (!myName) {
            showNotification('Please enter your character name', 'error');
            return;
        }
        
        // Find local player UID from current data
        const localPlayer = Array.from(STATE.players.values()).find(p => p.isLocalPlayer);
        
        if (localPlayer) {
            PLAYER_DB.add(localPlayer.uid, myName);
            showNotification(`Saved name: ${myName} for UID ${localPlayer.uid}`);
            renderPlayers(); // Refresh to show new name
        } else if (STATE.localPlayerUid) {
            PLAYER_DB.add(STATE.localPlayerUid, myName);
            showNotification(`Saved name: ${myName} for UID ${STATE.localPlayerUid}`);
        } else {
            // Save for next time we detect local player
            localStorage.setItem('bpsr-my-pending-name', myName);
            showNotification('Name saved! Will be applied when you enter combat.');
        }
        
        nameInput.value = '';
    });
    
    // Save settings
    document.getElementById('save-settings').addEventListener('click', () => {
        // General settings
        SETTINGS.highlightLocal = document.getElementById('setting-highlight').checked;
        SETTINGS.rememberNames = document.getElementById('setting-remember-names').checked;
        SETTINGS.autoClearOnZoneChange = document.getElementById('setting-auto-clear-zone').checked;
        SETTINGS.keepDataAfterDungeon = document.getElementById('setting-keep-after-dungeon').checked;
        const refreshVal = document.getElementById('setting-refresh').value;
        SETTINGS.refreshInterval = parseFloat(refreshVal) || 1.5;
        
        // Overlay settings (from "Overlay" tab)
        SETTINGS.showGS = document.getElementById('setting-show-gs')?.checked ?? true;
        
        // PHASE 3: Opacity control
        const opacityVal = document.getElementById('setting-overlay-opacity')?.value;
        if (opacityVal) {
            SETTINGS.overlayOpacity = parseFloat(opacityVal) || 0.95;
            if (window.electronAPI?.setOverlayOpacity) {
                window.electronAPI.setOverlayOpacity(SETTINGS.overlayOpacity);
            }
        }
        
        SETTINGS.columns.dps = document.getElementById('setting-col-dps').checked;
        SETTINGS.columns.maxDps = document.getElementById('setting-col-max-dps').checked;
        SETTINGS.columns.avgDps = document.getElementById('setting-col-avg-dps').checked;
        SETTINGS.columns.totalDmg = document.getElementById('setting-col-total-dmg').checked;
        SETTINGS.columns.hps = document.getElementById('setting-col-hps').checked;
        SETTINGS.columns.dmgTaken = document.getElementById('setting-col-dmg-taken').checked;
        SETTINGS.columns.gs = document.getElementById('setting-col-gs').checked;
        
        SETTINGS.save();
        
        // Apply new refresh interval
        stopAutoRefresh();
        startAutoRefresh();
        
        // Re-render
        renderPlayers();
        
        // Resize after settings change
        autoResizeWindow();
        
        showNotification('Settings saved successfully');
        document.getElementById('modal-settings').classList.remove('active');
    });
    
    // REMOVED: Old event delegation handler - now using per-row click handlers in renderPlayers()
    
    // PHASE 3: Initialize opacity from settings
    if (SETTINGS.overlayOpacity && window.electronAPI?.setOverlayOpacity) {
        window.electronAPI.setOverlayOpacity(SETTINGS.overlayOpacity);
    }
}

// ============================================================================
// FILE LOGGING SYSTEM
// ============================================================================

const LOG_BUFFER = [];
let logEnabled = true;

function writeLog(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    console.log(logLine);
    
    if (logEnabled) {
        LOG_BUFFER.push(logLine);
        
        // Keep only last 1000 lines
        if (LOG_BUFFER.length > 1000) {
            LOG_BUFFER.shift();
        }
        
        // Don't auto-save - only save when manually called
        // Auto-save can break Electron's rendering
    }
}

async function saveLogsToFile() {
    try {
        const logContent = LOG_BUFFER.join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        
        // Try to save via download (will save to Downloads folder)
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bpsr-debug.log';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to save logs:', error);
    }
}

// Make saveLogsToFile available globally for manual export
window.saveDebugLogs = saveLogsToFile;

// ============================================================================
// VPN DETECTION & MANAGEMENT
// ============================================================================

async function checkVPNCompatibility() {
    try {
        const res = await fetch(`${CONFIG.apiBase}/vpn/detect`);
        if (!res.ok) return; // Silently fail if VPN detection not available
        
        const result = await res.json();
        if (result.code !== 0) return;
        
        const { detection, guidance } = result.data;
        
        // Show warning if problematic VPN detected
        if (detection.hasProblematicVPN && guidance.type === 'warning') {
            showVPNWarning(guidance);
        } else if (detection.compatibleVPNs && detection.compatibleVPNs.length > 0) {
            console.log('✅ Compatible VPN detected:', detection.compatibleVPNs.map(v => v.name).join(', '));
        }
    } catch (error) {
        console.warn('VPN detection unavailable:', error.message);
    }
}

function showVPNWarning(guidance) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal vpn-warning-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: var(--bg-dark);
            border: 2px solid var(--accent-gold);
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        ">
            <h2 style="
                margin: 0 0 16px;
                color: var(--accent-gold);
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            ">
                ${guidance.title}
            </h2>
            <p style="
                margin: 0 0 24px;
                color: var(--text-primary);
                line-height: 1.6;
                white-space: pre-line;
            ">${guidance.message}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${guidance.actions.map(action => `
                    <button 
                        class="btn-${action.action === 'dismiss' ? 'secondary' : 'primary'}" 
                        onclick="handleVPNAction('${action.action}')"
                        style="flex: 1; min-width: 120px;"
                    >
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.handleVPNAction = function(action) {
    const modal = document.querySelector('.vpn-warning-modal');
    
    switch (action) {
        case 'show_vpn_docs':
            // Open VPN compatibility documentation
            window.open('https://github.com/YOUR_REPO/blob/main/VPN-COMPATIBILITY.md', '_blank');
            break;
        case 'dismiss':
            // Just close the modal
            break;
    }
    
    if (modal) {
        modal.remove();
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initialize() {
    console.log('🚀 Infamous BPSR Meter v2.99.6 - Initializing...');
    
    // Check VPN compatibility on startup
    checkVPNCompatibility();
    
    // Load persistent data
    SETTINGS.load();
    PLAYER_DB.load();
    
    // Restore compact mode preference
    const savedCompactMode = SETTINGS.compactMode;
    if (savedCompactMode) {
        document.body.classList.add('compact-mode');
        const btn = document.getElementById('btn-compact-mode');
        if (btn) {
            btn.title = 'Exit Overlay Mode (Full View)';
        }
    }
    
    // Sync pause state from backend - CRITICAL: Ensure data flows
    try {
        const res = await fetch(CONFIG.apiPause);
        const data = await res.json();
        isPaused = data.paused || false; // Default to false (NOT paused)
        
        // Force unpause if backend says paused (startup issue)
        if (isPaused) {
            console.warn('⚠️ Backend was paused on startup - forcing unpause for data flow');
            await fetch(CONFIG.apiPause, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paused: false })
            });
            isPaused = false;
        }
        
        const btn = document.getElementById('btn-pause');
        const icon = btn?.querySelector('i');
        if (btn && icon) {
            icon.className = 'fa-solid fa-pause';
            btn.title = 'Pause';
        }
    } catch (e) {
        console.warn('Could not sync pause state:', e);
        // Default to NOT paused if we can't connect
        isPaused = false;
        const btn = document.getElementById('btn-pause');
        const icon = btn?.querySelector('i');
        if (btn && icon) {
            icon.className = 'fa-solid fa-pause';
            btn.title = 'Pause';
        }
    }
    
    // Setup UI
    setupEventListeners();
    initializeSessionManagement(); // Add session management
    
    // Initial fetch
    await fetchPlayerData();
    renderPlayers();
    
    // Initial resize after loading
    autoResizeWindow();
    
    // Start auto-refresh (unless paused)
    if (!isPaused) {
        startAutoRefresh();
    }
    
    console.log('✅ Infamous BPSR Meter v2.99.6 - Ready!');
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM - NO MORE BROWSER ALERTS!
// ============================================================================

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = document.createElement('i');
    icon.className = getToastIcon(type);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'toast-message';
    messageDiv.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(messageDiv);
    container.appendChild(toast);
    
    // Auto-dismiss
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-solid fa-circle-check',
        error: 'fa-solid fa-circle-exclamation',
        warning: 'fa-solid fa-triangle-exclamation',
        info: 'fa-solid fa-circle-info'
    };
    return icons[type] || icons.info;
}

// Backward compatibility
function showNotification(message, type = 'success') {
    showToast(message, type);
}

// Replace confirm() dialogs
function confirmAction(message, onConfirm, onCancel = null) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-warning';
    toast.style.cssText = 'cursor:pointer;padding:16px 20px;border:2px solid var(--accent-gold);';
    
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-triangle-exclamation';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'toast-message';
    messageDiv.innerHTML = `<strong>${message}</strong><br><small style="opacity:0.8">Click anywhere to CONFIRM or X to cancel</small>`;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    cancelBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:none;color:#fff;cursor:pointer;margin-left:auto;padding:8px 12px;border-radius:4px;font-size:16px;';
    cancelBtn.onmouseover = () => cancelBtn.style.background = 'rgba(255,255,255,0.2)';
    cancelBtn.onmouseout = () => cancelBtn.style.background = 'rgba(255,255,255,0.1)';
    cancelBtn.onclick = (e) => {
        e.stopPropagation();
        toast.remove();
        if (onCancel) onCancel();
    };
    
    toast.appendChild(icon);
    toast.appendChild(messageDiv);
    toast.appendChild(cancelBtn);
    container.appendChild(toast);
    
    toast.addEventListener('click', () => {
        toast.remove();
        onConfirm();
        showToast('Action confirmed', 'success');
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 10000);
}

// ============================================================================
// INLINE PLAYER DETAILS (NO POPUP)
// ============================================================================

let expandedPlayerIds = []; // Track up to 2 expanded players

function togglePlayerDetails(uid, event) {
    console.log('🔄 Toggle details for UID:', uid);
    
    const index = expandedPlayerIds.indexOf(uid);
    
    if (index !== -1) {
        // Collapse this player
        expandedPlayerIds.splice(index, 1);
        renderPlayers();
        // Resize after collapse
        setTimeout(() => autoResizeWindow(), 100);
    } else {
        // Expand this player
        expandedPlayerIds.push(uid);
        
        // MAX 2 EXPANDED: Remove oldest if we have 3
        if (expandedPlayerIds.length > 2) {
            expandedPlayerIds.shift(); // Remove first (oldest)
        }
        
        renderPlayers(); // Show expanded state with "Loading..."
        console.log(`🔍 Loading skills for UID: ${uid}`);
        loadAndShowPlayerDetails(uid).catch(err => {
            console.error(`❌ Failed to load skills for ${uid}:`, err);
        }); // Then load the skills (which will trigger resize)
    }
}

// Cache skills data to prevent re-fetching on every render
const skillsCache = new Map();

// Load skill names mapping
let skillNamesMap = {};
fetch('/tables/skill_names.json')
    .then(res => res.json())
    .then(data => {
        skillNamesMap = data.skill_names || {};
        console.log(`✅ Loaded ${Object.keys(skillNamesMap).length} skill name translations`);
    })
    .catch(err => console.error('Failed to load skill names:', err));

function renderSkillsTable(uid, top10) {
    const skillsContainer = document.getElementById(`skills-${uid}`);
    if (!skillsContainer) return;
    
    skillsContainer.innerHTML = `
        <table class="skills-table">
            <thead>
                <tr>
                    <th>Skill</th>
                    <th>Total DMG</th>
                    <th>Hits</th>
                    <th>Crit%</th>
                    <th>Avg DMG</th>
                </tr>
            </thead>
            <tbody>
                ${top10.map(skill => {
                    const avg = skill.count > 0 ? skill.total / skill.count : 0;
                    const critPercent = ((skill.critRate || 0) * 100).toFixed(1);
                    
                    // Translate skill name using mapping
                    let skillName = skillNamesMap[skill.id] || skill.displayName || `Skill ${skill.id}`;
                    
                    return `
                        <tr>
                            <td>${skillName}</td>
                            <td>${formatNumber(skill.total)}</td>
                            <td>${skill.count}</td>
                            <td>${critPercent}%</td>
                            <td>${formatNumber(avg)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        
        <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: center;">
            <button class="btn-secondary" onclick="copyPlayerToClipboard(${uid}, false)" style="font-size: 11px; padding: 6px 12px;">
                <i class="fa-solid fa-copy"></i> Copy Stats Only
            </button>
            <button class="btn-secondary" onclick="copyPlayerToClipboard(${uid}, true)" style="font-size: 11px; padding: 6px 12px;">
                <i class="fa-solid fa-clipboard-list"></i> Copy with Skills
            </button>
        </div>
    `;
}

function renderSkillsFromCache(uid) {
    const cached = skillsCache.get(uid);
    if (cached) {
        renderSkillsTable(uid, cached);
        // Resize window after rendering cached skills
        setTimeout(() => autoResizeWindow(), 100);
    }
}

async function loadAndShowPlayerDetails(uid) {
    try {
        const apiUrl = `${CONFIG.apiSkill}/${uid}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw new Error(`Failed to fetch player details: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data || data.code !== 0) {
            throw new Error(data?.msg || 'Invalid API response');
        }
        
        const skills = data.data?.skills || data.skills || {};
        
        // Convert to array and sort by total damage
        const skillArray = Object.entries(skills).map(([id, skill]) => {
            return {
                id,
                ...skill,
                total: skill.totalDamage || skill.total || 0,
                count: skill.totalCount || skill.count || 0,
                critRate: skill.critRate || 0
            };
        });
        
        skillArray.sort((a, b) => b.total - a.total);
        const top10 = skillArray.slice(0, 10);
        
        // Only log when successfully loaded
        console.log(`✅ Loaded ${skillArray.length} skills for UID ${uid}`);
        
        // Render top 10 skills (includes imagine skills)
        const skillsContainer = document.getElementById(`skills-${uid}`);
        
        if (!skillsContainer) {
            return;
        }
        
        if (top10.length === 0) {
            skillsContainer.innerHTML = '<div class="no-data" style="padding:20px;text-align:center;color:#9ca3af;">No skill data yet - deal some damage first!</div>';
            return;
        }
        
        // Cache the skills data
        skillsCache.set(uid, top10);
        
        // Render skills table
        renderSkillsTable(uid, top10);
        
        // Resize window after skills are loaded and rendered
        setTimeout(() => autoResizeWindow(), 100);
    } catch (error) {
        // Don't spam error toasts - players zoning/changing maps causes temporary API failures
        console.warn(`⚠️ Could not load skills for UID ${uid}:`, error.message);
        const skillsContainer = document.getElementById(`skills-${uid}`);
        if (skillsContainer) {
            // Show silent message instead of error toast
            skillsContainer.innerHTML = '<div class="no-data" style="padding:20px;text-align:center;color:#9ca3af;">Skill data unavailable</div>';
        }
        
        // Still resize even if skills failed to load
        setTimeout(() => autoResizeWindow(), 100);
    }
}

// Pause functionality
let isPaused = false;

async function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('btn-pause');
    const icon = btn.querySelector('i');
    
    try {
        // Tell backend to pause/resume data collection
        await fetch(CONFIG.apiPause, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paused: isPaused })
        });
        
        if (isPaused) {
            stopAutoRefresh();
            icon.className = 'fa-solid fa-play';
            btn.title = 'Resume';
            showToast('⏸️ Paused - All data frozen', 'info', 5000);
        } else {
            startAutoRefresh();
            icon.className = 'fa-solid fa-pause';
            btn.title = 'Pause';
            showToast('▶️ Resumed - Data collection active', 'success', 3000);
        }
    } catch (error) {
        console.error('Failed to toggle pause:', error);
        showToast('Failed to toggle pause', 'error');
        // Revert state on error
        isPaused = !isPaused;
    }
}

// Make functions globally available
window.renderPlayers = renderPlayers;
window.togglePlayerDetails = togglePlayerDetails;
window.exportPlayerData = exportPlayerData;
window.copyToClipboard = copyToClipboard;
window.copyPlayerToClipboard = copyPlayerToClipboard;
window.showNotification = showNotification;
window.togglePause = togglePause;
window.updateOpacitySlider = updateOpacitySlider;

// Opacity slider real-time update function
function updateOpacitySlider(value) {
    const percent = Math.round(value * 100);
    document.getElementById('opacity-value').textContent = percent + '%';
    
    // Apply immediately via IPC
    if (window.electronAPI?.setOpacity) {
        window.electronAPI.setOpacity(parseFloat(value));
    }
}

// ============================================================================
// V2.12.0 - NEW FEATURES
// ============================================================================

// Settings Modal Close Handler
document.getElementById('settings-close')?.addEventListener('click', () => {
    document.getElementById('modal-settings')?.classList.remove('active');
});

// Settings Tab Switching
function initializeSettingsTabs() {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.dataset.tab;
            
            // Update tabs
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update panels
            document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
            document.querySelector(`[data-panel="${targetPanel}"]`).style.display = 'block';
            
            // Load user data path when About tab is opened
            if (targetPanel === 'about') {
                loadUserDataPath();
            }
        });
    });
}

// Load and display user data path
async function loadUserDataPath() {
    if (!window.electronAPI?.getUserDataPath) return;
    
    try {
        const userDataPath = await window.electronAPI.getUserDataPath();
        const pathElement = document.getElementById('user-data-path');
        if (pathElement) {
            pathElement.textContent = userDataPath;
            pathElement.dataset.path = userDataPath; // Store for openDataFolder
        }
    } catch (error) {
        console.error('Failed to get user data path:', error);
    }
}

// Open data folder in file explorer
function openDataFolder() {
    const pathElement = document.getElementById('user-data-path');
    const folderPath = pathElement?.dataset.path;
    
    if (folderPath && window.electronAPI?.openFolder) {
        window.electronAPI.openFolder(folderPath);
        showNotification('Opening data folder...', 'success');
    }
}

// Make functions global
window.openDataFolder = openDataFolder;

// Initialize tabs after DOM is ready
setTimeout(initializeSettingsTabs, 100);

// Sortable Column Headers
let currentSort = { column: 'totalDmg', direction: 'desc' };

document.querySelectorAll('.column-headers > div[data-sort]').forEach(header => {
    header.addEventListener('click', () => {
        const column = header.dataset.sort;
        
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'desc';
        }
        
        // Update UI
        document.querySelectorAll('.column-headers > div').forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });
        header.classList.add(`sorted-${currentSort.direction}`);
        
        // Re-render with new sort
        renderPlayers();
        
        showToast(`Sorted by ${header.textContent.trim()}`, 'info', 1500);
    });
});

// Enhanced sortPlayers to use currentSort
const originalSortPlayers = sortPlayers;
function sortPlayers(players) {
    const getValueForSort = (p, col) => {
        switch (col) {
            case 'name': return (p.name || PLAYER_DB.get(p.uid) || `Unknown_${p.uid}`).toLowerCase();
            case 'dps': return p.total_dps || p.current_dps || 0;
            case 'maxDps': return p.max_dps || 0;
            case 'avgDps': return p.total_dps || 0;
            case 'totalDmg': return p.total_damage?.total || 0;
            case 'hps': return p.total_hps || 0;
            case 'dmgTaken': return p.taken_damage || 0;
            case 'gs': return p.fightPoint || 0;
            case 'rank': return 0; // Will be set by index
            default: return p.total_damage?.total || 0;
        }
    };
    
    const sorted = [...players].sort((a, b) => {
        const aVal = getValueForSort(a, currentSort.column);
        const bVal = getValueForSort(b, currentSort.column);
        
        if (currentSort.column === 'name') {
            return currentSort.direction === 'asc' 
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }
        
        return currentSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return sorted;
}

// Inline Export Buttons (replace modal)
document.getElementById('btn-copy')?.addEventListener('click', () => {
    copyToClipboard();
});

document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    exportAllCSV();
});

// Opacity slider
const opacitySlider = document.getElementById('setting-opacity');
const opacityValue = document.getElementById('opacity-value');

if (opacitySlider && opacityValue) {
    opacitySlider.addEventListener('input', (e) => {
        opacityValue.textContent = e.target.value + '%';
        document.querySelector('.meter-container').style.opacity = e.target.value / 100;
    });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

let savedSessions = [];

// Load saved sessions and populate dropdown
async function loadSessions() {
    try {
        const response = await fetch('/api/sessions');
        const data = await response.json();

        if (data.code === 0) {
            savedSessions = data.sessions || [];
            updateSessionDropdown();
        } else {
            console.error('Failed to load sessions:', data.msg);
            savedSessions = [];
            updateSessionDropdown();
        }
    } catch (error) {
        console.error('Failed to load sessions:', error);
        savedSessions = [];
        updateSessionDropdown();
    }
}

// Update session dropdown with loaded sessions
function updateSessionDropdown() {
    const dropdown = document.getElementById('session-select');
    if (!dropdown) return;

    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Current Session</option>';

    // Sort all sessions by timestamp (most recent first)
    const sortedSessions = [...savedSessions].sort((a, b) => b.timestamp - a.timestamp);
    
    // Separate manual and auto-saved
    const manualSaved = sortedSessions.filter(s => !s.autoSaved);
    const autoSaved = sortedSessions.filter(s => s.autoSaved);

    // Add manual sessions first (more important), sorted by most recent
    manualSaved.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        const date = new Date(session.timestamp).toLocaleString();
        option.textContent = `📝 ${session.name} (${session.playerCount}p, ${formatNumber(session.totalDps)} DPS) - ${date}`;
        dropdown.appendChild(option);
    });

    // Add auto-saved sessions, sorted by most recent
    autoSaved.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        const date = new Date(session.timestamp).toLocaleString();
        option.textContent = `🤖 ${session.name} (${session.playerCount}p, ${formatNumber(session.totalDps)} DPS)`;
        dropdown.appendChild(option);
    });
    
    // Update session count display
    updateSessionCount();
}

// Update session count and add manage button
function updateSessionCount() {
    const container = document.querySelector('.session-selector');
    if (!container) return;
    
    let countDisplay = document.getElementById('session-count-display');
    if (!countDisplay) {
        countDisplay = document.createElement('div');
        countDisplay.id = 'session-count-display';
        countDisplay.style.cssText = 'font-size: 10px; color: var(--text-secondary); margin-top: 4px;';
        container.appendChild(countDisplay);
    }
    
    const manual = savedSessions.filter(s => !s.autoSaved).length;
    const auto = savedSessions.filter(s => s.autoSaved).length;
    countDisplay.textContent = `${manual} manual, ${auto} auto-saved sessions`;
    
    // Add manage sessions button if not exists
    if (!document.getElementById('btn-manage-sessions')) {
        const manageBtn = document.createElement('button');
        manageBtn.id = 'btn-manage-sessions';
        manageBtn.className = 'btn-secondary';
        manageBtn.style.cssText = 'font-size: 10px; padding: 4px 8px; margin-top: 4px;';
        manageBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Manage Sessions';
        manageBtn.onclick = () => showManageSessionsModal();
        container.appendChild(manageBtn);
    }
}

// Show manage sessions modal with delete options
function showManageSessionsModal() {
    if (savedSessions.length === 0) {
        showToast('No saved sessions to manage', 'info');
        return;
    }
    
    const sortedSessions = [...savedSessions].sort((a, b) => b.timestamp - a.timestamp);
    
    const modalHTML = `
        <div id="manage-sessions-modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
             background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; 
             box-shadow: 0 4px 16px rgba(0,0,0,0.4); z-index: 999999; min-width: 500px; max-width: 700px; max-height: 80vh; overflow-y: auto; pointer-events: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 15px; color: var(--accent-gold);">Manage Saved Sessions</h3>
                <button onclick="closeManageSessionsModal()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px;">&times;</button>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
                ${savedSessions.length} total sessions (${savedSessions.filter(s => !s.autoSaved).length} manual, ${savedSessions.filter(s => s.autoSaved).length} auto-saved)
            </div>
            <div id="sessions-list" style="display: flex; flex-direction: column; gap: 8px;">
                ${sortedSessions.map(session => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg-darker); border-radius: 4px; border-left: 3px solid ${session.autoSaved ? 'var(--accent-tank)' : 'var(--accent-gold)'};">
                        <div style="flex: 1; font-size: 12px;">
                            <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 4px;">
                                ${session.autoSaved ? '🤖' : '📝'} ${session.name}
                            </div>
                            <div style="color: var(--text-secondary); font-size: 10px;">
                                ${session.playerCount} players • ${formatNumber(session.totalDps)} DPS • ${new Date(session.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <button onclick="deleteSession(${session.id})" style="padding: 6px 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); 
                                border-radius: 4px; color: #ef4444; font-size: 11px; cursor: pointer; white-space: nowrap;">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="closeManageSessionsModal()" style="padding: 8px 16px; background: var(--bg-darker); border: 1px solid var(--border); 
                        border-radius: 4px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">Close</button>
            </div>
        </div>
        <div id="manage-sessions-backdrop" onclick="closeManageSessionsModal()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
             background: rgba(0,0,0,0.7); z-index: 999998; backdrop-filter: blur(2px); pointer-events: auto;"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close manage sessions modal
window.closeManageSessionsModal = function() {
    document.getElementById('manage-sessions-modal')?.remove();
    document.getElementById('manage-sessions-backdrop')?.remove();
};

// Delete a session
window.deleteSession = async function(sessionId) {
    if (!confirm('Delete this session? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.code === 0) {
            showToast('Session deleted successfully', 'success');
            await loadSessions(); // Refresh list
            
            // Update the modal content
            closeManageSessionsModal();
            if (savedSessions.length > 0) {
                showManageSessionsModal();
            }
        } else {
            showToast(`Failed to delete session: ${data.msg}`, 'error');
        }
    } catch (error) {
        console.error('Failed to delete session:', error);
        showToast('Failed to delete session', 'error');
    }
};

// Save current session
async function saveCurrentSession() {
    if (STATE.players.size === 0) {
        showToast('No data to save - wait for combat data first', 'warning');
        return;
    }

    // Create compact inline modal for session name (prompt() doesn't work in Electron)
    const modalHTML = `
        <div id="save-session-modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
             background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 16px 20px; 
             box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; min-width: 320px; max-width: 400px;">
            <div style="margin-bottom: 12px; font-size: 13px; font-weight: 600; color: var(--text-primary);">Save Session</div>
            <input type="text" id="session-name-input" value="Session ${new Date().toLocaleString()}" 
                   style="width: 100%; padding: 6px 10px; background: var(--bg-darker); border: 1px solid var(--border); 
                   border-radius: 4px; color: var(--text-primary); font-size: 12px; margin-bottom: 12px; box-sizing: border-box;">
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button id="cancel-save-btn" style="padding: 5px 12px; background: var(--bg-darker); border: 1px solid var(--border); 
                        border-radius: 4px; color: var(--text-secondary); font-size: 11px; cursor: pointer;">Cancel</button>
                <button id="confirm-save-btn" style="padding: 5px 12px; background: var(--accent-gold); border: none; 
                        border-radius: 4px; color: #000; font-size: 11px; font-weight: 600; cursor: pointer;">Save</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const input = document.getElementById('session-name-input');
    const confirmBtn = document.getElementById('confirm-save-btn');
    const cancelBtn = document.getElementById('cancel-save-btn');
    const modal = document.getElementById('save-session-modal');
    
    // Focus and select input text
    input.focus();
    input.select();
    
    // Cancel handler
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Handle Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmBtn.click();
        } else if (e.key === 'Escape') {
            modal.remove();
        }
    });
    
    confirmBtn.addEventListener('click', async () => {
        const sessionName = input.value.trim();
        if (!sessionName) {
            showToast('Please enter a session name', 'warning');
            return;
        }
        
        modal.remove();
        
        try {
            console.log('📤 Sending save request...');
            const response = await fetch('/api/sessions/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: sessionName })
            });

            console.log('📥 Response status:', response.status, response.statusText);
            const data = await response.json();
            console.log('📊 Response data:', data);
            
            if (data.code === 0) {
                showToast(`Session "${data.session.name}" saved!`, 'success');
                await loadSessions(); // Refresh dropdown
            } else {
                console.error('❌ Save failed - Server returned:', data);
                showToast(`Failed to save session: ${data.msg}`, 'error');
            }
        } catch (error) {
            console.error('❌ Save failed - Exception:', error);
            showToast(`Failed to save session: ${error.message}`, 'error');
        }
    });
}

// Load selected session
async function loadSelectedSession(sessionId) {
    if (!sessionId) {
        // Switching back to live mode - CRITICAL: Clear session data and resume
        STATE.players.clear();
        showToast('📡 Resuming live data...', 'info', 2000);
        
        // Force immediate refresh to get live data
        await refreshData();
        renderPlayers(); // renderPlayers() calls updateStatusBar() internally
        
        // Resume auto-refresh
        if (!isPaused) {
            startAutoRefresh();
        }
        return;
    }

    try {
        // Stop auto-refresh to prevent live data from overwriting session
        stopAutoRefresh();
        
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();
        
        if (data.code === 0) {
            const session = data.session;
            
            // Load session data into STATE (don't clear backend)
            STATE.players.clear();
            session.players.forEach(player => {
                STATE.players.set(player.uid, player);
            });
            
            // Update UI
            renderPlayers(); // renderPlayers() calls updateStatusBar() internally
            
            // Show success message with instructions
            showToast(`📂 Viewing: ${session.name} (Select "Current Session" to return to live)`, 'info', 5000);
            
        } else {
            showToast('Failed to load session', 'error');
            // Resume auto-refresh on error
            if (!isPaused) {
                startAutoRefresh();
            }
        }
    } catch (error) {
        console.error('Failed to load session:', error);
        showToast('Failed to load session', 'error');
        // Resume auto-refresh on error
        if (!isPaused) {
            startAutoRefresh();
        }
    }
}

// Clear current data (for loading sessions)
async function clearData() {
    try {
        const response = await fetch('/api/clear', { method: 'POST' });
        const data = await response.json();
        if (data.code === 0) {
            STATE.players.clear();
            renderPlayers(); // renderPlayers() calls updateStatusBar() internally
        }
    } catch (error) {
        console.error('Failed to clear data:', error);
    }
}

// Initialize session management
function initializeSessionManagement() {
    // Load sessions on startup
    loadSessions();
    
    // Save session button
    const saveBtn = document.getElementById('btn-save-session');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentSession);
    }
    
    // Session selector
    const dropdown = document.getElementById('session-select');
    if (dropdown) {
        dropdown.addEventListener('change', (e) => {
            loadSelectedSession(e.target.value);
        });
    }
}

// ============================================================================
// EMERGENCY UNSTICK HOTKEY
// ============================================================================

// Add global keyboard shortcut for force unlock (Ctrl+U)
document.addEventListener('keydown', (e) => {
    // Ctrl+U or Cmd+U - Force unlock window if stuck
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        if (window.electronAPI?.forceUnlockWindow) {
            window.electronAPI.forceUnlockWindow();
            showNotification('🔓 Window force unlocked!', 'success');
            console.log('🚨 User triggered force unlock (Ctrl+U)');
        }
    }
});

// ============================================================================
// START THE APP!
// ============================================================================

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already loaded
    initialize();
}
