// ============================================================================
// AUTO-UPDATER MODULE
// Handles automatic updates with user settings (disable/notify/auto)
// ============================================================================

const { autoUpdater } = require('electron-updater');
const semver = require('semver'); // Will be added to package.json
const path = require('path');
const fs = require('fs');

class AutoUpdaterManager {
    constructor(app, logFn) {
        this.app = app;
        this.log = logFn || console.log;
        this.mainWindow = null;
        this.settings = null;
        
        // Configure updater
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;
        
        // Setup event listeners
        this.setupListeners();
    }
    
    setMainWindow(win) {
        this.mainWindow = win;
    }
    
    async loadSettings() {
        try {
            const userDataPath = this.app.getPath('userData');
            const settingsPath = path.join(userDataPath, 'settings.json');
            
            if (fs.existsSync(settingsPath)) {
                const data = fs.readFileSync(settingsPath, 'utf8');
                this.settings = JSON.parse(data);
                this.log(`✅ Loaded auto-update setting: ${this.settings.autoUpdate || 'notify'}`);
            } else {
                // Default to 'notify'
                this.settings = { autoUpdate: 'notify' };
                this.log('⚠️ No settings found, defaulting to notify mode');
            }
        } catch (err) {
            this.log(`❌ Error loading settings: ${err.message}`);
            this.settings = { autoUpdate: 'notify' };
        }
    }
    
    setupListeners() {
        autoUpdater.on('checking-for-update', () => {
            this.log('🔍 Checking for updates...');
        });
        
        autoUpdater.on('update-available', async (info) => {
            this.log(`✨ Update available: v${info.version}`);
            
            // CRITICAL: Compare versions - don't downgrade
            const currentVersion = this.app.getVersion();
            if (semver.lte(info.version, currentVersion)) {
                this.log(`⚠️ Remote version ${info.version} is not newer than current ${currentVersion}, skipping update`);
                return;
            }
            
            const mode = this.settings?.autoUpdate || 'notify';
            
            if (mode === 'disable') {
                this.log('⏸️ Auto-update disabled by user, skipping');
                return;
            }
            
            if (mode === 'auto') {
                // Auto-download and install
                this.log('⬇️ Auto-downloading update...');
                await autoUpdater.downloadUpdate();
            } else {
                // Notify mode (default)
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.webContents.send('update-available', {
                        currentVersion,
                        newVersion: info.version,
                        releaseDate: info.releaseDate,
                        releaseUrl: `https://github.com/ssalihsrz/InfamousBPSRDPSMeter/releases/tag/v${info.version}`
                    });
                }
            }
        });
        
        autoUpdater.on('update-not-available', () => {
            this.log('✅ App is up to date');
        });
        
        autoUpdater.on('download-progress', (progress) => {
            const percent = Math.round(progress.percent);
            this.log(`📥 Downloading update: ${percent}%`);
            
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('update-download-progress', { percent });
            }
        });
        
        autoUpdater.on('update-downloaded', (info) => {
            this.log(`✅ Update downloaded: v${info.version}`);
            
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('update-downloaded', {
                    version: info.version
                });
            }
            
            const mode = this.settings?.autoUpdate || 'notify';
            if (mode === 'auto') {
                // Automatically install on quit
                this.log('🔄 Auto-install enabled, will install on app quit');
                autoUpdater.autoInstallOnAppQuit = true;
            }
        });
        
        autoUpdater.on('error', (err) => {
            // Gracefully handle missing latest.yml (expected until first release with auto-updater)
            if (err.message && err.message.includes('latest.yml')) {
                this.log('ℹ️ Auto-updater not configured yet (no latest.yml in release)');
                return;
            }
            
            // Log other errors (but don't show to user - non-critical)
            this.log(`❌ Auto-update error: ${err.message}`);
        });
    }
    
    async checkForUpdates() {
        await this.loadSettings();
        
        const mode = this.settings?.autoUpdate || 'notify';
        if (mode === 'disable') {
            this.log('⏸️ Auto-update disabled, skipping check');
            return;
        }
        
        try {
            await autoUpdater.checkForUpdates();
        } catch (err) {
            // Gracefully handle missing latest.yml (expected until first proper release)
            if (err.message && err.message.includes('latest.yml')) {
                this.log('ℹ️ Auto-updater not ready yet (first release needs latest.yml file)');
                return;
            }
            
            this.log(`❌ Update check failed: ${err.message}`);
        }
    }
    
    async downloadUpdate() {
        try {
            await autoUpdater.downloadUpdate();
        } catch (err) {
            this.log(`❌ Download failed: ${err.message}`);
            throw err;
        }
    }
    
    quitAndInstall() {
        autoUpdater.quitAndInstall(false, true);
    }
}

module.exports = AutoUpdaterManager;
