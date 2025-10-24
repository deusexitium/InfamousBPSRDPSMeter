
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec, fork } = require('child_process');
const net = require('net'); // Required for checkPort
const fs = require('fs');

// Function to log to file safely for packaged environment
function logToFile(msg) {
    try {
        const userData = app.getPath('userData');
        const logPath = path.join(userData, 'iniciar_log.txt');
        const timestamp = new Date().toISOString();
        fs.mkdirSync(userData, { recursive: true });
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        // If there's an error, show in console
        console.error('Error writing log:', e);
    }
}


let mainWindow;
let serverProcess;
let server_port = 8989; // Initial port
let isLocked = false; // Initial lock state: unlocked
logToFile('==== ELECTRON START ====');

    // Function to check if a port is in use
    const checkPort = (port) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => {
                server.close(() => resolve(true));
            });
            server.listen(port);
        });
    };

    async function findAvailablePort() {
        let port = 8989;
        while (true) {
            if (await checkPort(port)) {
                return port;
            }
            console.warn(`Port ${port} is already in use, trying next...`);
            port++;
        }
    }

    // Function to kill the process using a specific port
    async function killProcessUsingPort(port) {
        return new Promise((resolve) => {
            exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
                if (stdout) {
                    const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
                    if (lines.length > 0) {
                        const pid = lines[0].trim().split(/\s+/).pop();
                        if (pid) {
                            console.log(`Killing process ${pid} using port ${port}...`);
                            exec(`taskkill /PID ${pid} /F`, (killError, killStdout, killStderr) => {
                                if (killError) {
                                    console.error(`Error killing process ${pid}: ${killError.message}`);
                                } else {
                                    console.log(`Process ${pid} killed successfully.`);
                                }
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            });
        });
    }

    async function createWindow() {
        logToFile('Attempting to kill processes on port 8989...');
        await killProcessUsingPort(8989);

        server_port = await findAvailablePort();
        logToFile('Available port found: ' + server_port);

        mainWindow = new BrowserWindow({
            width: 1200,
            height: 700,
            minWidth: 900,
            minHeight: 400,
            transparent: true,
            frame: false,
            alwaysOnTop: true,
            resizable: true,
            show: false, // Don't show until ready
            backgroundColor: '#1a1a1a', // Fallback background
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
            icon: path.join(__dirname, 'icon.ico'),
        });

        // Configure window to always stay on top with maximum priority
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        
        // Don't use click-through - we'll resize window to match content instead
        mainWindow.setIgnoreMouseEvents(false);

        // Open external links in system browser, not in-app
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            // Only open external URLs in browser
            if (url.startsWith('http://') || url.startsWith('https://')) {
                shell.openExternal(url);
                logToFile(`Opening external link in browser: ${url}`);
            }
            return { action: 'deny' }; // Prevent opening in app
        });

        // Start the Node.js server, passing the port as argument

        // Determine absolute path to server.js based on environment
        let serverPath, nodePath;
        if (process.defaultApp || process.env.NODE_ENV === 'development') {
            // Development mode
            serverPath = path.join(__dirname, 'server.js');
            nodePath = path.join(__dirname, 'node_modules');
        } else {
            // Packaged mode: server.js is in resources/app folder
            serverPath = path.join(process.resourcesPath, 'app', 'server.js');
            // node_modules is in app.asar
            nodePath = path.join(app.getAppPath(), 'node_modules');
        }
        const userData = app.getPath('userData');
        logToFile('Launching server.js on port ' + server_port + ' with path: ' + serverPath);
        logToFile('Node modules path: ' + nodePath);
        logToFile('User data directory: ' + userData);

        // Use fork to launch the server as child process, passing port, userData, and node_modules path
        const { fork } = require('child_process');
        const serverWorkingDir = process.defaultApp || process.env.NODE_ENV === 'development' 
            ? __dirname 
            : path.join(process.resourcesPath, 'app');
        
        // Set NODE_PATH to include both asar and unpacked node_modules
        const env = Object.assign({}, process.env);
        env.NODE_PATH = nodePath + path.delimiter + path.join(app.getAppPath(), 'node_modules');
        
        serverProcess = fork(serverPath, [server_port, userData], {
            cwd: serverWorkingDir, // Set working directory to app folder
            env: env, // Include NODE_PATH
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            execArgv: []
        });

        // Variables to control server startup
        if (typeof createWindow.serverLoaded === 'undefined') createWindow.serverLoaded = false;
        if (typeof createWindow.serverTimeout === 'undefined') createWindow.serverTimeout = null;
        createWindow.serverLoaded = false;
        createWindow.serverTimeout = setTimeout(() => {
            if (!createWindow.serverLoaded) {
                logToFile('ERROR: Server did not respond in 30 seconds. Check if Npcap is installed and running.');
                const logPath = path.join(app.getPath('userData'), 'iniciar_log.txt');
                mainWindow.loadURL(`data:text/html,<div style="padding:40px;font-family:Arial;background:#1a1a1a;color:#fff;height:100vh;">
                    <h1 style="color:#ef4444;">⚠️ Server Startup Failed</h1>
                    <p style="font-size:16px;line-height:1.6;">The backend server did not start within 30 seconds.</p>
                    <h3 style="color:#f59e0b;margin-top:30px;">Common Causes:</h3>
                    <ol style="font-size:14px;line-height:1.8;">
                        <li><strong>Npcap not installed</strong> - Download from <a href="https://npcap.com/" style="color:#3b82f6;">npcap.com</a></li>
                        <li><strong>Npcap service not running</strong> - Run restart-npcap.bat as Administrator</li>
                        <li><strong>Missing Administrator rights</strong> - Right-click app → Run as Administrator</li>
                        <li><strong>Port 8989 blocked</strong> - Check firewall settings</li>
                    </ol>
                    <h3 style="color:#10b981;margin-top:30px;">📝 Check Log File:</h3>
                    <p style="font-size:14px;background:#2d2d2d;padding:15px;border-radius:8px;font-family:monospace;">${logPath}</p>
                    <p style="font-size:12px;color:#9ca3af;margin-top:30px;">Close this window and try again after fixing the issue above.</p>
                </div>`);
            }
        }, 30000); // 30 seconds timeout (increased from 10)

        serverProcess.stdout.on('data', (data) => {
            logToFile('server stdout: ' + data);
            const match = data.toString().match(/Web server started on (http:\/\/localhost:\d+)/);
            if (match && match[1]) {
                const serverUrl = match[1];
                logToFile('Loading URL in window: ' + serverUrl + '/index.html');
                mainWindow.loadURL(`${serverUrl}/index.html`);
                createWindow.serverLoaded = true;
                clearTimeout(createWindow.serverTimeout);
                
                // Show window once content is ready to load
                mainWindow.once('ready-to-show', () => {
                    mainWindow.show();
                    logToFile('Window shown');
                });
            }
        });
        serverProcess.stderr.on('data', (data) => {
            logToFile('server stderr: ' + data);
        });
        serverProcess.on('close', (code) => {
            logToFile('server process exited with code ' + code);
        });


        // Ensure window stays on top when gaining focus (fixes Alt+Tab issues)
        mainWindow.on('focus', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.setAlwaysOnTop(true, isLocked ? 'screen-saver' : 'normal');
                // Also ensure window is movable if not locked
                if (!isLocked && !mainWindow.isMovable()) {
                    mainWindow.setMovable(true);
                    logToFile('⚠️ Restored movability on focus');
                }
            }
        });

        // Handle minimize/restore events to maintain always-on-top behavior
        mainWindow.on('minimize', () => {
            // When minimized and then restored, ensure always-on-top is maintained
            setTimeout(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.setAlwaysOnTop(true, isLocked ? 'screen-saver' : 'normal');
                }
            }, 100);
        });

        mainWindow.on('restore', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.setAlwaysOnTop(true, isLocked ? 'screen-saver' : 'normal');
                // Also ensure window is movable if not locked
                if (!isLocked && !mainWindow.isMovable()) {
                    mainWindow.setMovable(true);
                    logToFile('⚠️ Restored movability on restore');
                }
            }
        });

        // Additional event handlers to catch stuck state
        mainWindow.on('blur', () => {
            // When window loses focus, ensure it's still movable
            if (mainWindow && !mainWindow.isDestroyed() && !isLocked && !mainWindow.isMovable()) {
                mainWindow.setMovable(true);
                logToFile('⚠️ Restored movability on blur');
            }
        });

        mainWindow.on('show', () => {
            // When window is shown, ensure it's movable
            if (mainWindow && !mainWindow.isDestroyed() && !isLocked && !mainWindow.isMovable()) {
                mainWindow.setMovable(true);
                logToFile('⚠️ Restored movability on show');
            }
        });

        mainWindow.on('move', () => {
            // If move event fires but window isn't movable, fix it
            if (mainWindow && !mainWindow.isDestroyed() && !isLocked && !mainWindow.isMovable()) {
                mainWindow.setMovable(true);
                logToFile('⚠️ Restored movability on move event');
            }
        });

        mainWindow.on('closed', () => {
            mainWindow = null;
            if (serverProcess) {
                // Send SIGTERM for clean shutdown
                serverProcess.kill('SIGTERM');
                // Force termination if it doesn't close after some time
                setTimeout(() => {
                    if (!serverProcess.killed) {
                        serverProcess.kill('SIGKILL');
                    }
                }, 5000);
            }
        });

    // Handle event to make window movable/unmovable
    ipcMain.on('set-window-movable', (event, movable) => {
        if (mainWindow) {
            mainWindow.setMovable(movable);
        }
    });

    // Handle event to close the window
    ipcMain.on('close-window', () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });

    // Handle event to minimize the window
    ipcMain.on('minimize-window', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    // Handle event to set always on top
    ipcMain.on('set-always-on-top', (event, alwaysOnTop) => {
        if (mainWindow) {
            mainWindow.setAlwaysOnTop(alwaysOnTop);
            console.log(`Always on Top: ${alwaysOnTop ? 'ON' : 'OFF'}`);
        }
    });

    // Handle event to resize the window
    ipcMain.on('resize-window', (event, width, height) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            // Store current movable state
            const wasMovable = mainWindow.isMovable();
            
            mainWindow.setSize(width, height);
            
            // CRITICAL: Force movability immediately after resize if not locked
            if (!isLocked) {
                // Force movability multiple times to overcome Electron bugs
                setImmediate(() => {
                    if (mainWindow && !mainWindow.isDestroyed() && !isLocked) {
                        mainWindow.setMovable(true);
                    }
                });
                
                setTimeout(() => {
                    if (mainWindow && !mainWindow.isDestroyed() && !isLocked) {
                        mainWindow.setMovable(true);
                        // Removed spammy log - only log if it was actually stuck
                    }
                }, 100);
            }
        }
    });

    // Handle events for mouse click-through control
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        if (mainWindow) {
            mainWindow.setIgnoreMouseEvents(ignore, options);
        }
    });

    // Handle window position for manual drag (fallback)
    ipcMain.handle('get-window-position', () => {
        if (mainWindow) {
            return mainWindow.getPosition();
        }
        return [0, 0];
    });

    ipcMain.on('set-window-position', (event, x, y) => {
        if (mainWindow) {
            mainWindow.setPosition(x, y);
        }
    });

    // Handle event to toggle lock state
    ipcMain.on('toggle-lock-state', () => {
        if (mainWindow) {
            isLocked = !isLocked;
            mainWindow.setMovable(!isLocked); // Make window movable or not
            // Don't use setIgnoreMouseEvents here - let CSS/JS handle click-through
            // The renderer will manage mouse event state based on lock status
            mainWindow.webContents.send('lock-state-changed', isLocked); // Notify renderer
            logToFile(`Lock toggled: ${isLocked ? 'Locked' : 'Unlocked'}`);
            console.log(`Lock: ${isLocked ? 'Locked' : 'Unlocked'}`);
        }
    });
    
    // Manual force-unlock handler (emergency fix for stuck window)
    ipcMain.on('force-unlock-window', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            isLocked = false;
            mainWindow.setMovable(true);
            logToFile('⚠️ FORCE UNLOCK - Window was manually unlocked via Ctrl+U');
            console.log('⚠️ FORCE UNLOCK - Window is now movable');
        }
    });

    // Get user data path for log location
    ipcMain.handle('get-user-data-path', () => {
        return app.getPath('userData');
    });

    // Open folder in file explorer
    ipcMain.on('open-folder', (event, folderPath) => {
        shell.openPath(folderPath);
        logToFile(`Opening folder: ${folderPath}`);
    });

    // Track if resize is in progress to avoid conflicts
    let isResizingWindow = false;
    
    ipcMain.on('resize-start', () => {
        isResizingWindow = true;
    });
    
    ipcMain.on('resize-end', () => {
        isResizingWindow = false;
        // Ensure movable after resize completes
        if (mainWindow && !mainWindow.isDestroyed() && !isLocked && !mainWindow.isMovable()) {
            mainWindow.setMovable(true);
            logToFile('⚠️ Restored movability after resize ended');
        }
    });
    
    // ULTRA AGGRESSIVE periodic check to ensure window stays movable (防止卡死)
    // Check very frequently for instant recovery
    setInterval(() => {
        if (mainWindow && !mainWindow.isDestroyed() && !isLocked && !isResizingWindow) {
            // Ensure window remains movable if not locked (and not actively resizing)
            if (!mainWindow.isMovable()) {
                mainWindow.setMovable(true);
                logToFile('⚠️ Window was stuck - restored movability (periodic check)');
                console.error('⚠️ WINDOW WAS STUCK - FORCE UNLOCKED');
            }
        }
    }, 200); // Check every 200ms for nearly instant recovery

    // Send initial lock state to renderer once window is ready
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('lock-state-changed', isLocked);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
