// BPSR Meter v2.5.1 - Performance-Focused Implementation
// Optimized for robustness, usability, and smooth performance

'use strict';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    refreshInterval: 2000,
    apiData: '/api/data',
    apiSkill: '/api/skill',
    apiClear: '/api/clear',
    apiPlayerDB: '/api/player-db',
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
    durationTimer: null,
};

// ============================================================================
// SETTINGS WITH PERSISTENCE
// ============================================================================

const SETTINGS = {
    highlightLocal: true,
    showGS: true,
    refreshInterval: 2,
    rememberNames: true,
    
    load() {
        try {
            const saved = localStorage.getItem('bpsr-settings');
            if (saved) Object.assign(this, JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    },
    
    save() {
        try {
            const { load, save, ...settings } = this;
            localStorage.setItem('bpsr-settings', JSON.stringify(settings));
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
                console.log(`Loaded ${this.data.size} players from database`);
            }
        } catch (e) {
            console.error('Failed to load player database:', e);
        }
    },
    
    save() {
        if (!SETTINGS.rememberNames) return;
        try {
            const obj = Object.fromEntries(this.data);
            localStorage.setItem('bpsr-player-db', JSON.stringify(obj));
        } catch (e) {
            console.error('Failed to save player database:', e);
        }
    },
    
    add(uid, name) {
        if (!name || name === 'unknown') return;
        const key = String(uid);
        if (!this.data.has(key)) {
            this.data.set(key, name);
            this.save();
            console.log(`Added player to DB: ${name} (${uid})`);
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
    '协奏': { name: 'Concerto', role: 'dps' },
    '狂音': { name: 'Dissonance', role: 'dps' },
    '空枪': { name: 'Empty Gun', role: 'dps' },
    '重装': { name: 'Heavy Armor', role: 'tank' },
};

function getProfession(profStr) {
    const base = profStr?.split('-')[0];
    return PROFESSIONS[base] || { name: 'Unknown', role: 'dps' };
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
    try {
        const res = await fetch(CONFIG.apiData);
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const payload = await res.json();
        
        // Initialize start time
        if (!STATE.startTime && payload.startTime) {
            STATE.startTime = payload.startTime;
            startDurationCounter();
        }
        
        // Merge player data (preserve accumulated stats)
        if (payload.data && Array.isArray(payload.data)) {
            payload.data.forEach(player => {
                const uid = player.uid;
                const existing = STATE.players.get(uid);
                
                if (existing) {
                    // Update existing player
                    Object.assign(existing, player);
                } else {
                    // Add new player
                    STATE.players.set(uid, player);
                }
                
                // Add to player database
                if (player.name && player.name !== 'unknown') {
                    PLAYER_DB.add(uid, player.name);
                }
            });
            
            STATE.lastUpdate = Date.now();
        }
        
        return Array.from(STATE.players.values());
    } catch (error) {
        console.error('Error fetching data:', error);
        return Array.from(STATE.players.values());
    }
}

// ============================================================================
// RENDERING
// ============================================================================

function renderPlayers() {
    const players = Array.from(STATE.players.values());
    const filtered = filterPlayers(players);
    const sorted = sortPlayers(filtered);
    
    const list = document.getElementById('player-list');
    
    if (sorted.length === 0) {
        list.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Waiting for combat data...</span></div>';
        return;
    }
    
    const maxDmg = Math.max(...sorted.map(p => p.total_damage?.total || 0), 1);
    
    list.innerHTML = sorted.map((player, idx) => {
        const rank = idx + 1;
        const prof = getProfession(player.profession);
        const isLocal = player.uid === STATE.localPlayerUid || player.isLocalPlayer;
        
        const name = player.name || PLAYER_DB.get(player.uid) || `Player_${player.uid}`;
        const hp = player.hp || 0;
        const maxHp = player.max_hp || 1;
        const hpPercent = (hp / maxHp) * 100;
        const dmgPercent = ((player.total_damage?.total || 0) / maxDmg) * 100;
        
        const gs = player.fightPoint || 0;
        const dps = player.total_dps || 0;
        const hps = player.total_hps || 0;
        const totalDmg = player.total_damage?.total || 0;
        const dmgTaken = player.taken_damage || 0;
        const totalHeal = player.total_healing?.total || 0;
        const crit = (player.critRate || 0).toFixed(1);
        const luck = (player.luckyRate || 0).toFixed(1);
        const maxDmgVal = player.maxDamage || 0;
        
        // TODO: Add haste and mastery when backend provides them
        const haste = player.attr?.haste || 0;
        const mastery = player.attr?.mastery || 0;
        
        const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
        
        return `
            <div class="player-row ${isLocal ? 'local' : ''}" 
                 style="--dmg-percent: ${dmgPercent}%"
                 onclick="openPlayerDetails(${player.uid})">
                <div class="player-left">
                    <div class="rank ${rankClass}">${rank}</div>
                    <div class="player-info">
                        <div class="player-name-row">
                            <span class="player-name">${isLocal ? '★ ' : ''}${name}</span>
                            <span class="player-class ${prof.role}">${prof.role}</span>
                            ${SETTINGS.showGS ? `<span class="stat-label">GS ${formatNumber(gs)}</span>` : ''}
                        </div>
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${hpPercent}%; background: ${getHPColor(hpPercent)}"></div>
                            <div class="hp-text">${formatNumber(hp)}/${formatNumber(maxHp)}</div>
                        </div>
                    </div>
                </div>
                <div class="player-stats">
                    <div class="stat">
                        <div class="stat-value">${formatNumber(dps)}</div>
                        <div class="stat-label">DPS</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatNumber(hps)}</div>
                        <div class="stat-label">HPS</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatNumber(dmgTaken)}</div>
                        <div class="stat-label">DT</div>
                    </div>
                    <div class="stat crit">
                        <div class="stat-value">${crit}%</div>
                        <div class="stat-label">CRIT</div>
                    </div>
                    <div class="stat luck">
                        <div class="stat-value">${luck}%</div>
                        <div class="stat-label">LUCK</div>
                    </div>
                    <div class="stat highlight">
                        <div class="stat-value">${formatNumber(maxDmgVal)}</div>
                        <div class="stat-label">MAX</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatNumber(totalDmg)}</div>
                        <div class="stat-label">TOTAL</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatNumber(totalHeal)}</div>
                        <div class="stat-label">HEAL</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${SETTINGS.showGS ? formatNumber(gs) : '-'}</div>
                        <div class="stat-label">GS</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterPlayers(players) {
    if (STATE.currentFilter === 'all') return players;
    return players.filter(p => {
        const prof = getProfession(p.profession);
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
        
        const prof = getProfession(player.profession);
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
            
            <button class="btn-primary" onclick="exportPlayerData(${uid})">
                <i class="fa-solid fa-download"></i> Export This Player
            </button>
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

function exportAllCSV() {
    const players = sortPlayers(Array.from(STATE.players.values()));
    const headers = ['Rank', 'Name', 'Class', 'Role', 'GS', 'DPS', 'HPS', 'Total DMG', 'DMG Taken', 'Total Heal', 'Crit%', 'Lucky%', 'Max DMG'];
    const rows = [headers];
    
    players.forEach((p, idx) => {
        const prof = getProfession(p.profession);
        const name = p.name || PLAYER_DB.get(p.uid) || `Player_${p.uid}`;
        rows.push([
            idx + 1,
            name,
            prof.name,
            prof.role,
            p.fightPoint || 0,
            p.total_dps || 0,
            p.total_hps || 0,
            p.total_damage?.total || 0,
            p.taken_damage || 0,
            p.total_healing?.total || 0,
            (p.critRate || 0).toFixed(2),
            (p.luckyRate || 0).toFixed(2),
            p.maxDamage || 0,
        ]);
    });
    
    const csv = rows.map(row => row.join(',')).join('\n');
    downloadFile(csv, 'bpsr-meter-all.csv', 'text/csv');
}

function exportAllMarkdown() {
    const players = sortPlayers(Array.from(STATE.players.values()));
    const duration = STATE.startTime ? Math.floor((Date.now() - STATE.startTime) / 1000) : 0;
    
    let md = `# BPSR Meter Export\n\n`;
    md += `**Duration:** ${formatDuration(duration)}\n`;
    md += `**Players:** ${players.length}\n`;
    md += `**Timestamp:** ${new Date().toLocaleString()}\n\n`;
    md += `## Rankings\n\n`;
    md += `| Rank | Name | Class | Role | GS | DPS | HPS | Total DMG | DMG Taken | Total Heal | Crit% | Lucky% | Max DMG |\n`;
    md += `|------|------|-------|------|----|----|-----|-----------|-----------|------------|-------|--------|----------|\n`;
    
    players.forEach((p, idx) => {
        const prof = getProfession(p.profession);
        const name = p.name || PLAYER_DB.get(p.uid) || `Player_${p.uid}`;
        md += `| ${idx + 1} | ${name} | ${prof.name} | ${prof.role} | ${formatNumber(p.fightPoint || 0)} | ${formatNumber(p.total_dps || 0)} | ${formatNumber(p.total_hps || 0)} | ${formatNumber(p.total_damage?.total || 0)} | ${formatNumber(p.taken_damage || 0)} | ${formatNumber(p.total_healing?.total || 0)} | ${(p.critRate || 0).toFixed(1)}% | ${(p.luckyRate || 0).toFixed(1)}% | ${formatNumber(p.maxDamage || 0)} |\n`;
    });
    
    downloadFile(md, 'bpsr-meter-all.md', 'text/markdown');
}

function exportPlayerData(uid) {
    const player = STATE.players.get(uid);
    if (!player) return;
    
    const prof = getProfession(player.profession);
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
    
    STATE.refreshTimer = setInterval(async () => {
        await fetchPlayerData();
        renderPlayers();
    }, interval);
}

function stopAutoRefresh() {
    if (STATE.refreshTimer) {
        clearInterval(STATE.refreshTimer);
        STATE.refreshTimer = null;
    }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            STATE.currentFilter = tab.dataset.filter;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderPlayers();
        });
    });
    
    // Header buttons
    document.getElementById('btn-settings')?.addEventListener('click', () => {
        // Load current settings
        document.getElementById('setting-highlight').checked = SETTINGS.highlightLocal;
        document.getElementById('setting-show-gs').checked = SETTINGS.showGS;
        document.getElementById('setting-refresh').value = SETTINGS.refreshInterval;
        document.getElementById('setting-remember-names').checked = SETTINGS.rememberNames;
        
        document.getElementById('modal-settings').classList.add('active');
    });
    
    document.getElementById('btn-export')?.addEventListener('click', () => {
        document.getElementById('modal-export').classList.add('active');
    });
    
    document.getElementById('btn-reset')?.addEventListener('click', async () => {
        if (confirm('Reset all data?')) {
            try {
                await fetch(CONFIG.apiClear, { method: 'POST' });
                STATE.players.clear();
                STATE.startTime = null;
                stopDurationCounter();
                document.getElementById('duration').textContent = '00:00';
                renderPlayers();
            } catch (error) {
                console.error('Error resetting:', error);
            }
        }
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
        });
    }
    
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
    document.getElementById('export-all-csv')?.addEventListener('click', () => {
        exportAllCSV();
        document.getElementById('modal-export').classList.remove('active');
    });
    
    document.getElementById('export-all-md')?.addEventListener('click', () => {
        exportAllMarkdown();
        document.getElementById('modal-export').classList.remove('active');
    });
    
    // Save settings
    document.getElementById('save-settings')?.addEventListener('click', () => {
        SETTINGS.highlightLocal = document.getElementById('setting-highlight').checked;
        SETTINGS.showGS = document.getElementById('setting-show-gs').checked;
        SETTINGS.refreshInterval = parseInt(document.getElementById('setting-refresh').value) || 2;
        SETTINGS.rememberNames = document.getElementById('setting-remember-names').checked;
        
        SETTINGS.save();
        
        // Restart refresh
        stopAutoRefresh();
        startAutoRefresh();
        
        // Re-render
        renderPlayers();
        
        document.getElementById('modal-settings').classList.remove('active');
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initialize() {
    console.log('BPSR Meter v2.5.1 - Initializing...');
    
    // Load persistent data
    SETTINGS.load();
    PLAYER_DB.load();
    
    // Setup UI
    setupEventListeners();
    
    // Initial fetch
    await fetchPlayerData();
    renderPlayers();
    
    // Start auto-refresh
    startAutoRefresh();
    
    console.log('BPSR Meter v2.5.1 - Ready!');
}

// Make functions globally available
window.openPlayerDetails = openPlayerDetails;
window.exportPlayerData = exportPlayerData;

// Start the application
initialize();
