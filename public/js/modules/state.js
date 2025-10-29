// ============================================================================
// STATE MANAGEMENT MODULE
// ============================================================================

'use strict';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const CONFIG = {
    refreshInterval: 1500, // 1500ms balanced performance
    apiBase: '/api',
    apiData: '/api/data',
    apiSkill: '/api/skill',
    apiClear: '/api/clear',
    apiPlayerDB: '/api/player-db',
    apiPause: '/api/pause',
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

export const STATE = {
    players: new Map(), // uid -> player data
    currentFilter: 'all',
    localPlayerUid: null,
    startTime: null,
    lastUpdate: 0,
    refreshTimer: null,
    showingAllPlayers: false, // Track Show More state
    skillsRefreshTimer: null,
    durationTimer: null,
    viewMode: 'detailed', // 'compact' or 'detailed'
    soloMode: false, // Show only local player
    zoneChanged: false, // Track if zone changed since last combat
    alwaysOnTop: true, // Default to true
    inCombat: false, // Track if currently in combat
    lastPlayerCount: 0, // Track player count to detect combat start
    playerLastUpdate: new Map(), // Track last update time for idle detection
};
