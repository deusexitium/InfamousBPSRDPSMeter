const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    setWindowMovable: (movable) => ipcRenderer.send('set-window-movable', movable),
    closeWindow: () => ipcRenderer.send('close-window'),
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.send('set-always-on-top', alwaysOnTop),
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', width, height),
    resizeStart: () => ipcRenderer.send('resize-start'),
    resizeEnd: () => ipcRenderer.send('resize-end'),
    toggleLockState: () => ipcRenderer.send('toggle-lock-state'),
    forceUnlockWindow: () => ipcRenderer.send('force-unlock-window'),
    onLockStateChanged: (callback) => ipcRenderer.on('lock-state-changed', (event, isLocked) => callback(isLocked)),
    setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
    getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
    setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', x, y),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    openFolder: (folderPath) => ipcRenderer.send('open-folder', folderPath),
    // PHASE 3: New overlay control APIs
    setOverlayOpacity: (opacity) => ipcRenderer.send('set-overlay-opacity', opacity),
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});
