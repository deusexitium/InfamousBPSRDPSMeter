// Auto-Update Handler for Frontend

const { ipcRenderer } = require('electron');

let updateInfo = null;
let downloadProgress = 0;

// Listen for SIMPLIFIED update events from main process
ipcRenderer.on('update-available-simple', (event, data) => {
    console.log(`✨ Update available: v${data.version}`);
    showSimpleUpdateNotification(data);
});

// Keep old handler for backwards compatibility (will be removed later)
ipcRenderer.on('update-available', (event, info) => {
    console.log('Update available (old):', info.version);
    showSimpleUpdateNotification({
        version: info.version,
        releaseUrl: 'https://github.com/ssalihsrz/InfamousBPSRDPSMeter/releases/latest'
    });
});

ipcRenderer.on('download-progress', (event, progress) => {
    downloadProgress = progress.percent;
    updateDownloadProgress(progress);
});

ipcRenderer.on('update-downloaded', (event, info) => {
    console.log('Update downloaded, ready to install');
    showUpdateReadyNotification(info);
});

// Show SIMPLIFIED update notification - just notify + link
function showSimpleUpdateNotification(data) {
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        z-index: 999999;
        min-width: 320px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <i class="fa-solid fa-download" style="font-size: 24px;"></i>
            <div>
                <strong style="font-size: 14px;">Update Available!</strong>
                <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
                    v${data.version} is ready to download
                </div>
            </div>
        </div>
        <div style="font-size: 11px; margin-bottom: 12px; opacity: 0.95; line-height: 1.4;">
            Click below to download the latest version from GitHub
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="openReleasePage()" style="
                flex: 1;
                padding: 8px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            ">
                <i class="fa-solid fa-external-link-alt"></i> Download Update
            </button>
            <button onclick="closeUpdateNotification()" style="
                padding: 8px 12px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
            ">
                Later
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    window.updateReleaseUrl = data.releaseUrl;
}

// Show update available notification (OLD - complex version)
function showUpdateNotification(info) {
    const currentVersion = document.querySelector('.status-right span:last-child')?.textContent || '';
    const newVersion = `v${info.version}`;
    
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        z-index: 999999;
        min-width: 320px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <i class="fa-solid fa-download" style="font-size: 24px;"></i>
            <div>
                <strong style="font-size: 14px;">Update Available!</strong>
                <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
                    ${currentVersion} → ${newVersion}
                </div>
            </div>
        </div>
        <div style="font-size: 11px; margin-bottom: 12px; opacity: 0.95; line-height: 1.4;">
            A new version is available with bug fixes and improvements.
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="downloadUpdate()" style="
                flex: 1;
                padding: 8px 12px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
            ">
                <i class="fa-solid fa-download"></i> Download Update
            </button>
            <button onclick="closeUpdateNotification()" style="
                padding: 8px 12px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
            ">
                Later
            </button>
        </div>
        <div id="download-progress-container" style="display: none; margin-top: 12px;">
            <div style="font-size: 11px; margin-bottom: 4px;">Downloading...</div>
            <div style="background: rgba(255,255,255,0.3); height: 6px; border-radius: 3px; overflow: hidden;">
                <div id="download-progress-bar" style="
                    background: white;
                    height: 100%;
                    width: 0%;
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div id="download-progress-text" style="font-size: 10px; margin-top: 4px; opacity: 0.9;">0%</div>
        </div>
    `;
    
    document.body.appendChild(notification);
}

// Download update
window.downloadUpdate = function() {
    const progressContainer = document.getElementById('download-progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
    
    const buttons = document.querySelectorAll('#update-notification button');
    buttons.forEach(btn => btn.disabled = true);
    
    ipcRenderer.send('download-update');
};

// Update download progress
function updateDownloadProgress(progress) {
    const progressBar = document.getElementById('download-progress-bar');
    const progressText = document.getElementById('download-progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress.percent}%`;
    }
    if (progressText) {
        const speed = (progress.bytesPerSecond / 1024 / 1024).toFixed(2);
        progressText.textContent = `${Math.round(progress.percent)}% - ${speed} MB/s`;
    }
}

// Show update ready notification
function showUpdateReadyNotification(info) {
    const notification = document.getElementById('update-notification');
    if (!notification) return;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <i class="fa-solid fa-check-circle" style="font-size: 24px; color: #10b981;"></i>
            <div>
                <strong style="font-size: 14px;">Update Ready!</strong>
                <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
                    v${info.version} downloaded
                </div>
            </div>
        </div>
        <div style="font-size: 11px; margin-bottom: 12px; opacity: 0.95; line-height: 1.4;">
            The update has been downloaded. Restart the app to install.
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="installUpdate()" style="
                flex: 1;
                padding: 8px 12px;
                background: white;
                color: #10b981;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
            ">
                <i class="fa-solid fa-sync"></i> Restart & Install
            </button>
            <button onclick="closeUpdateNotification()" style="
                padding: 8px 12px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
            ">
                Later
            </button>
        </div>
    `;
}

// Open releases page in browser
window.openReleasePage = function() {
    if (window.updateReleaseUrl) {
        ipcRenderer.send('open-release-page');
        closeUpdateNotification();
    }
};

// Close notification
window.closeUpdateNotification = function() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }
};

// Manual check for updates (for settings button)
window.checkForUpdates = function() {
    showToast('Checking for updates...', 'info');
    ipcRenderer.send('check-for-updates');
    
    // Show "up to date" message if no update found after 5 seconds
    setTimeout(() => {
        if (!document.getElementById('update-notification')) {
            showToast('You are using the latest version!', 'success');
        }
    }, 5000);
};

// Add slideIn/slideOut animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Auto-updater initialized');
