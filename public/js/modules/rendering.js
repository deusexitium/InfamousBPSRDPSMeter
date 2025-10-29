// ============================================================================
// RENDERING MODULE
// Player row rendering, details panel, and main render loop
// ============================================================================

import { SETTINGS } from './settings.js';
import { STATE } from './state.js';
import { PLAYER_DB } from './player-db.js';
import { 
    formatNumber, 
    formatDuration, 
    getProfession, 
    getHPColor,
    calculateCritRate,
    calculateLuckRate 
} from './utils.js';

// PERFORMANCE: Cache for role badges to avoid recalculation
const ROLE_BADGE_CACHE = {
    heal: { color: '#22c55e', text: 'H' },
    tank: { color: '#3b82f6', text: 'T' },
    dps: { color: '#ef4444', text: 'D' }
};

// Store expanded player IDs
export const expandedPlayerIds = [];

/**
 * Render a single player row
 */
export function renderPlayerRow(player, rank, maxDmg, isLocal, teamTotalDamage = 1) {
    const prof = getProfession(player.profession, player);
    
    // CRITICAL FIX: Detect and save local player UID when we see Unknown_UID pattern
    const savedName = PLAYER_DB.get(player.uid);
    let name = player.name || savedName || `Unknown_${player.uid}`;
    
    // If this is the local player (detected by Unknown_ pattern and no saved name), remember the UID
    if (!savedName && name.startsWith('Unknown_') && (player.isLocalPlayer || player.uid === STATE.localPlayerUid)) {
        // This is local player - save UID for future sessions
        if (!STATE.localPlayerUid) {
            STATE.localPlayerUid = player.uid;
            console.log(`🎯 Detected local player UID: ${player.uid}`);
        }
    }
    
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
    
    const contributionPercent = teamTotalDamage > 0 ? ((totalDmg / teamTotalDamage) * 100).toFixed(1) : 0;
    
    const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
    const isExpanded = expandedPlayerIds.includes(player.uid);
    const isCompact = STATE.viewMode === 'compact';
    const isIdle = player.isIdle || false;
    
    if (document.body.classList.contains('compact-mode')) {
        // Compact mode: Simple 6-column grid (rank + name + 4 stats)
        // Grid: 25px | minmax(80px,120px) | 65px | 65px | 65px | 65px
        
        // PERFORMANCE: Use cached role badge values
        const badge = ROLE_BADGE_CACHE[prof.role] || ROLE_BADGE_CACHE.dps;
        const roleBadge = `<span class="role-badge-compact" style="background: ${badge.color}">${badge.text}</span>`;
        
        if (SETTINGS.compactHealerMode) {
            // HEALER MODE: Show HPS, MAX HPS, TOTAL HEAL, OVERHEAL
            // Use real backend values if available, otherwise estimate
            const effectiveHealing = player.total_healing?.effective ?? (totalHealing * 0.75);
            const overheal = player.total_healing?.overheal ?? (totalHealing - effectiveHealing);
            const overhealDisplay = overheal > 0 ? formatNumber(overheal) : '-';
            
            return `
                <div class="player-row ${isLocal ? 'local-player' : ''} ${isIdle ? 'idle' : ''}" data-uid="${player.uid}">
                    <div class="cell-rank">${rank}</div>
                    <div class="cell-name">
                        ${roleBadge}
                        <span class="${prof.class}">${name}</span>
                    </div>
                    <div class="cell-value">${formatNumber(hps)}</div>
                    <div class="cell-value">${formatNumber(maxHps)}</div>
                    <div class="cell-value">${formatNumber(totalHealing)}</div>
                    <div class="cell-value">${overhealDisplay}</div>
                </div>
            `;
        } else {
            // DPS MODE: Show DPS, MAX DPS, TOTAL DMG, DMG TAKEN
            // Always show values, use 0 instead of dash
            const dmgTakenDisplay = formatNumber(dmgTaken);
            
            return `
                <div class="player-row ${isLocal ? 'local-player' : ''} ${isIdle ? 'idle' : ''}" data-uid="${player.uid}">
                    <div class="cell-rank">${rank}</div>
                    <div class="cell-name">
                        ${roleBadge}
                        <span class="${prof.class}">${name}</span>
                    </div>
                    <div class="cell-value">${formatNumber(currentDps)}</div>
                    <div class="cell-value">${formatNumber(maxDps)}</div>
                    <div class="cell-value">${formatNumber(totalDmg)}</div>
                    <div class="cell-value">${dmgTakenDisplay}</div>
                </div>
            `;
        }
    }
    
    // CRITICAL FIX: Full mode needs to respect fullHealerMode setting
    if (SETTINGS.fullHealerMode) {
        // HEALER MODE: Show HPS, MAX HPS, TOTAL HEAL, OVERHEAL instead of DPS columns
        const effectiveHealing = player.total_healing?.effective ?? (totalHealing * 0.75);
        const overheal = player.total_healing?.overheal ?? (totalHealing - effectiveHealing);
        
        return `
            <div class="player-row-wrapper">
                <div class="player-row ${isLocal ? 'local' : ''} ${isExpanded ? 'expanded' : ''} ${isIdle ? 'idle' : ''}" 
                     style="--dmg-percent: ${dmgBarPercent}%"
                     data-uid="${player.uid}"
                     title="${isIdle ? 'IDLE - No activity for 30+ seconds' : ''}">
                    <div class="rank ${rankClass}">${rank}</div>
                    <div class="player-name-col">
                        <div class="name-line">
                            ${isLocal && (player.isLocalPlayer || player.uid === STATE.localPlayerUid) ? '<span class="local-star">★</span>' : ''}
                            <span class="name">${name}${isIdle ? ' <span style="opacity:0.5">(IDLE)</span>' : ''}</span>
                            <span class="role-badge ${prof.role}">${prof.role.toUpperCase()}</span>
                        </div>
                        <div class="hp-bar-mini">
                            <div class="hp-fill" style="width: ${hpPercent}%; background: ${getHPColor(hpPercent)}"></div>
                        </div>
                    </div>
                    <div class="cell-value">${formatNumber(hps)}</div>
                    <div class="cell-value">${formatNumber(maxHps)}</div>
                    <div class="cell-value">${formatNumber(totalHealing)}</div>
                    <div class="cell-value">${formatNumber(overheal)}</div>
                    <div class="cell-value">${formatNumber(hps)}${maxHps > 0 ? ` / ${formatNumber(maxHps)}` : ''}</div>
                    <div class="cell-value">${formatNumber(dmgTaken)}</div>
                    <div class="cell-value">${gs > 0 ? formatNumber(gs) : '-'}</div>
                </div>
                ${isExpanded ? renderPlayerDetails(player) : ''}
            </div>
        `;
    }
    
    // DPS MODE (default): Show DPS columns
    return `
        <div class="player-row-wrapper">
            <div class="player-row ${isLocal ? 'local' : ''} ${isExpanded ? 'expanded' : ''} ${isIdle ? 'idle' : ''}" 
                 style="--dmg-percent: ${dmgBarPercent}%"
                 data-uid="${player.uid}"
                 title="${isIdle ? 'IDLE - No activity for 30+ seconds' : ''}">
                <div class="rank ${rankClass}">${rank}</div>
                <div class="player-name-col">
                    <div class="name-line">
                        ${isLocal && (player.isLocalPlayer || player.uid === STATE.localPlayerUid) ? '<span class="local-star">★</span>' : ''}
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
                <div class="cell-value">${formatNumber(totalDmg)} <span class="contribution">(${contributionPercent}%)</span></div>
                <div class="cell-value">${formatNumber(hps)}${maxHps > 0 ? ` / ${formatNumber(maxHps)}` : ''}</div>
                <div class="cell-value">${formatNumber(dmgTaken)}</div>
                <div class="cell-value">${gs > 0 ? formatNumber(gs) : '-'}</div>
            </div>
            ${isExpanded ? renderPlayerDetails(player) : ''}
        </div>
    `;
}

/**
 * Render player details panel (expanded view)
 */
export function renderPlayerDetails(player) {
    const prof = getProfession(player.profession, player);
    const gs = player.g_score || player.gs || 0;
    
    const critRateValue = calculateCritRate(player);
    const luckRateValue = calculateLuckRate(player);
    const dps = player.current_dps || player.realtime_dps || 0;
    const maxDps = player.max_dps || player.realtime_dps_max || 0;
    const totalDmg = player.total_damage?.total || 0;
    const dmgTaken = player.taken_damage || 0;
    const hps = player.total_hps || 0;
    const maxHps = player.realtime_hps_max || 0;
    const totalHealing = player.total_healing?.total || 0;
    const maxDmgVal = player.maxDamage || 0;
    const haste = player.haste || 0;
    
    // Calculate efficiency if available
    const healingEfficiency = player.total_healing?.efficiency || 0;
    const effectiveHealing = player.total_healing?.effective || 0;
    const overheal = player.total_healing?.overheal || 0;
    const deathsPrevented = player.total_healing?.deathsPrevented || 0;
    
    return `
        <div class="player-details">
            <div class="details-row">
                <div class="detail-group">
                    <div class="detail-label">Profession</div>
                    <div class="detail-value">${prof.name}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Gearscore</div>
                    <div class="detail-value">${gs > 0 ? formatNumber(gs) : '-'}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Crit Rate</div>
                    <div class="detail-value">${critRateValue}%</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Lucky Rate</div>
                    <div class="detail-value">${luckRateValue}%</div>
                </div>
            </div>
            <div class="details-row">
                <div class="detail-group">
                    <div class="detail-label">Current DPS</div>
                    <div class="detail-value">${formatNumber(dps)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Max DPS</div>
                    <div class="detail-value">${formatNumber(maxDps)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Total Damage</div>
                    <div class="detail-value">${formatNumber(totalDmg)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Damage Taken</div>
                    <div class="detail-value">${formatNumber(dmgTaken)}</div>
                </div>
            </div>
            ${totalHealing > 0 ? `
            <div class="details-row">
                <div class="detail-group">
                    <div class="detail-label">Current HPS</div>
                    <div class="detail-value">${formatNumber(hps)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Max HPS</div>
                    <div class="detail-value">${formatNumber(maxHps)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Total Healing</div>
                    <div class="detail-value">${formatNumber(totalHealing)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Healing Efficiency</div>
                    <div class="detail-value">${healingEfficiency.toFixed(1)}%</div>
                </div>
            </div>
            ` : ''}
            ${effectiveHealing > 0 || overheal > 0 ? `
            <div class="details-row">
                <div class="detail-group">
                    <div class="detail-label">Effective Healing</div>
                    <div class="detail-value">${formatNumber(effectiveHealing)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Overheal</div>
                    <div class="detail-value">${formatNumber(overheal)}</div>
                </div>
                ${deathsPrevented > 0 ? `
                <div class="detail-group">
                    <div class="detail-label">Deaths Prevented</div>
                    <div class="detail-value">${deathsPrevented}</div>
                </div>
                ` : ''}
            </div>
            ` : ''}
            <div class="details-row">
                <div class="detail-group">
                    <div class="detail-label">Max Single Hit</div>
                    <div class="detail-value">${formatNumber(maxDmgVal)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Haste</div>
                    <div class="detail-value">${haste > 0 ? haste : '-'}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle player details panel
 */
export function togglePlayerDetails(uid) {
    const index = expandedPlayerIds.indexOf(uid);
    if (index > -1) {
        expandedPlayerIds.splice(index, 1);
    } else {
        expandedPlayerIds.push(uid);
    }
    // Trigger re-render in main.js
    if (window.renderPlayers) {
        window.renderPlayers();
    }
}
