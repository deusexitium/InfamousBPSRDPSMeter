// ============================================================================
// UTILITY FUNCTIONS MODULE
// ============================================================================

'use strict';

// ============================================================================
// PROFESSION MAPPING
// ============================================================================

export const PROFESSIONS = {
    '雷影剑士': { name: 'Stormblade', role: 'dps' },
    '冰魔导师': { name: 'Frost Mage', role: 'dps' },
    '涤罪恶火·战斧': { name: 'Fire Axe', role: 'dps' },
    '青岚骑士': { name: 'Wind Knight', role: 'tank' },
    '森语者': { name: 'Verdant Oracle', role: 'heal' },
    '雷霆一闪·手炮': { name: 'Gunner', role: 'dps' },
    '巨刃守护者': { name: 'Heavy Sword', role: 'dps' },
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
    '重装': { name: 'Vanguard Spec', role: 'dps' },
    '未知': { name: 'Unknown', role: 'unknown' },
    '': { name: 'Unknown', role: 'unknown' },
};

// Detect role from sub-profession or healing/tanking behavior
function detectRoleFromBehavior(player) {
    const totalDmg = player.total_damage?.total || 0;
    const totalHeal = player.total_healing?.total || 0;
    const dmgTaken = player.taken_damage || 0;
    const totalHps = player.total_hps || 0;
    const totalDps = player.total_dps || 0;
    
    // Healer detection
    if (totalHeal > totalDmg * 3 && totalHps > 100) {
        return 'heal';
    }
    
    if (totalHps > totalDps * 5 && totalHps > 500) {
        return 'heal';
    }
    
    // Tank detection
    if (dmgTaken > totalDmg * 0.2 && totalDmg > 5000) {
        return 'tank';
    }
    
    if (dmgTaken > 50000 && totalDmg < 10000) {
        return 'tank';
    }
    
    return 'dps';
}

export function getProfession(profStr, player = null) {
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
    
    // Default to DPS
    return { name: base || 'Unknown', role: 'dps' };
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export function formatNumber(val) {
    if (!Number.isFinite(val)) return '0';
    if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(1) + 'k';
    return Math.round(val).toString();
}

export function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

// ============================================================================
// HP COLOR
// ============================================================================

export function getHPColor(percent) {
    if (percent > 70) return '#22c55e'; // Green
    if (percent > 30) return '#eab308'; // Yellow
    return '#ef4444'; // Red
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
    return container;
}
