// Session Manager - Bulk management and cleanup tools

// Open Session Manager Modal
async function openSessionManager() {
    console.log('🚀 Opening Session Manager...');
    const sessions = await fetchAllSessions();
    console.log(`📋 Received ${sessions.length} sessions, showing modal...`);
    showSessionManagerModal(sessions);
}

// Fetch all sessions from backend
async function fetchAllSessions() {
    try {
        console.log('🔍 Fetching sessions from /api/sessions/all');
        const response = await fetch('/api/sessions/all');
        console.log(`📡 Response status: ${response.status}`);
        
        if (!response.ok) {
            console.error(`❌ Response not OK: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        console.log(`📊 Sessions count: ${data.sessions?.length || 0}`);
        
        if (data.code !== 0) {
            console.error('❌ API returned error code:', data);
            throw new Error(data.msg || 'API error');
        }
        
        const sessions = data.sessions || [];
        console.log(`✅ Returning ${sessions.length} sessions to modal`);
        return sessions;
    } catch (error) {
        console.error('❌ Failed to fetch sessions:', error);
        showToast(`Failed to load sessions: ${error.message}`, 'error');
        return [];
    }
}

// Show Session Manager Modal
function showSessionManagerModal(sessions) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'session-manager-modal';
    modal.style.display = 'flex';
    
    const sortedSessions = sessions.sort((a, b) => b.timestamp - a.timestamp);
    const oldNameSessions = sortedSessions.filter(s => 
        s.name.includes('Previous Battle (Auto-saved)') || 
        s.name.includes('Auto-saved')
    );
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
            <div class="modal-header">
                <h3 class="modal-title">📊 Session Manager</h3>
                <button class="modal-close" onclick="closeSessionManager()">&times;</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; max-height: 60vh;">
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,193,7,0.1); border-left: 3px solid var(--accent-gold); border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: var(--accent-gold);">📋 ${sessions.length} Total Sessions</strong>
                        <span style="font-size: 11px; color: var(--text-secondary);">
                            ${oldNameSessions.length} sessions with old names
                        </span>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                        <button class="btn-primary" onclick="retrofitOldSessions()" style="font-size: 11px; padding: 6px 12px;">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Retrofit Old Names (${oldNameSessions.length})
                        </button>
                        <button class="btn-secondary" onclick="bulkDeleteSelected()" style="font-size: 11px; padding: 6px 12px;">
                            <i class="fa-solid fa-trash"></i> Delete Selected
                        </button>
                        <button class="btn-secondary" onclick="deleteAllAutoSaved()" style="font-size: 11px; padding: 6px 12px;">
                            <i class="fa-solid fa-robot"></i> Delete All Auto-Saved
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="select-all-sessions" onchange="toggleSelectAll(this.checked)">
                        <strong>Select All</strong>
                    </label>
                </div>
                
                <div id="sessions-list" style="display: flex; flex-direction: column; gap: 8px;">
                    ${sortedSessions.map(session => createSessionItem(session)).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Create session list item HTML
function createSessionItem(session) {
    const date = new Date(session.timestamp).toLocaleString();
    const duration = formatDuration(session.duration || 0);
    const icon = session.autoSaved ? '🤖' : '📝';
    const isOldName = session.name.includes('Previous Battle') || session.name.includes('Auto-saved');
    const oldNameBadge = isOldName ? '<span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; margin-left: 8px;">OLD NAME</span>' : '';
    
    return `
        <div class="session-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
            <input type="checkbox" class="session-checkbox" data-session-id="${session.id}" style="cursor: pointer;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 16px;">${icon}</span>
                    <strong style="color: var(--text-primary);">${session.name}</strong>
                    ${oldNameBadge}
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 16px;">
                    <span><i class="fa-solid fa-clock"></i> ${date}</span>
                    <span><i class="fa-solid fa-hourglass"></i> ${duration}</span>
                    <span><i class="fa-solid fa-users"></i> ${session.playerCount || 0} players</span>
                    <span><i class="fa-solid fa-fire"></i> ${formatNumber(session.totalDps || 0)} DPS</span>
                </div>
            </div>
            <button class="btn-secondary" onclick="renameSession('${session.id}')" style="font-size: 10px; padding: 4px 8px;">
                <i class="fa-solid fa-pen"></i> Rename
            </button>
            <button class="btn-danger" onclick="deleteSingleSession('${session.id}')" style="font-size: 10px; padding: 4px 8px;">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
}

// Close Session Manager
function closeSessionManager() {
    const modal = document.getElementById('session-manager-modal');
    if (modal) {
        modal.remove();
    }
    // Reload sessions list
    loadSessions();
}

// Toggle select all checkboxes
function toggleSelectAll(checked) {
    document.querySelectorAll('.session-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
}

// Retrofit old session names to new intelligent format
async function retrofitOldSessions() {
    if (!confirm('This will rename all sessions with old names (e.g., "Previous Battle (Auto-saved)") to the new intelligent format. Continue?')) {
        return;
    }
    
    showToast('Retrofitting session names...', 'info', 5000);
    
    try {
        const response = await fetch('/api/sessions/retrofit-names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to retrofit sessions');
        
        const data = await response.json();
        showToast(`✅ Retrofitted ${data.updated} sessions!`, 'success');
        
        // Close and refresh
        closeSessionManager();
        
    } catch (error) {
        console.error('Failed to retrofit sessions:', error);
        showToast('Failed to retrofit sessions', 'error');
    }
}

// Delete selected sessions
async function bulkDeleteSelected() {
    const selectedCheckboxes = document.querySelectorAll('.session-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showToast('No sessions selected', 'warning');
        return;
    }
    
    if (!confirm(`Delete ${selectedCheckboxes.length} selected sessions? This cannot be undone.`)) {
        return;
    }
    
    const sessionIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.sessionId);
    
    try {
        const response = await fetch('/api/sessions/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionIds })
        });
        
        if (!response.ok) throw new Error('Failed to delete sessions');
        
        const data = await response.json();
        showToast(`✅ Deleted ${data.deleted} sessions!`, 'success');
        
        closeSessionManager();
        
    } catch (error) {
        console.error('Failed to delete sessions:', error);
        showToast('Failed to delete sessions', 'error');
    }
}

// Delete all auto-saved sessions
async function deleteAllAutoSaved() {
    if (!confirm('Delete ALL auto-saved sessions? Manual saves will be kept. This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/sessions/delete-auto-saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to delete auto-saved sessions');
        
        const data = await response.json();
        showToast(`✅ Deleted ${data.deleted} auto-saved sessions!`, 'success');
        
        closeSessionManager();
        
    } catch (error) {
        console.error('Failed to delete auto-saved sessions:', error);
        showToast('Failed to delete sessions', 'error');
    }
}

// Rename a single session
async function renameSession(sessionId) {
    const newName = prompt('Enter new session name:');
    if (!newName || !newName.trim()) return;
    
    try {
        const response = await fetch(`/api/sessions/${sessionId}/rename`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim() })
        });
        
        if (!response.ok) throw new Error('Failed to rename session');
        
        showToast('✅ Session renamed!', 'success');
        
        // Refresh the modal
        closeSessionManager();
        setTimeout(() => openSessionManager(), 100);
        
    } catch (error) {
        console.error('Failed to rename session:', error);
        showToast('Failed to rename session', 'error');
    }
}

// Delete single session
async function deleteSingleSession(sessionId) {
    if (!confirm('Delete this session? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete session');
        
        showToast('✅ Session deleted!', 'success');
        
        // Refresh the modal
        closeSessionManager();
        setTimeout(() => openSessionManager(), 100);
        
    } catch (error) {
        console.error('Failed to delete session:', error);
        showToast('Failed to delete session', 'error');
    }
}

// Format duration helper
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (mins < 5) return `${mins}m${secs}s`;
    return `${mins}min`;
}
