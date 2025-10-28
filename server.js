const winston = require('winston');
const readline = require('readline');
const path = require('path');
const fsPromises = require('fs').promises;
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const zlib = require('zlib');

const { UserDataManager } = require(path.join(__dirname, 'src', 'server', 'dataManager'));
const Sniffer = require(path.join(__dirname, 'src', 'server', 'sniffer'));
const initializeApi = require(path.join(__dirname, 'src', 'server', 'api'));
const PacketProcessor = require(path.join(__dirname, 'algo', 'packet'));

// Read version from package.json (works in both dev and production)
let VERSION = '3.1.33';
try {
    const packageJson = require(path.join(__dirname, 'package.json'));
    VERSION = packageJson.version;
} catch (err) {
    // In production Electron build, package.json might not be accessible
    // Version will use the default above
}

let globalSettings = {
    autoClearOnServerChange: true, // Keep enabled - needed for actual server changes
    autoClearOnTimeout: false,
    onlyRecordEliteDummy: false,
    enableFightLog: false,
    enableDpsLog: false,
    enableHistorySave: false,
    isPaused: false, // CRITICAL: Must be false for data to flow on startup
    keepDataAfterDungeon: true, // Prevent premature clearing
    networkAdapter: 'auto', // 'auto' for automatic detection, or adapter index number
};

let server_port;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf((info) => {
                return `[${info.timestamp}] [${info.level}] ${info.message}`;
            }),
        ),
        transports: [new winston.transports.Console()],
    });

    console.clear();
    console.log('###################################################');
    console.log('#                                                 #');
    console.log('#             BPSR Meter - Starting               #');
    console.log('#                                                 #');
    console.log('###################################################');
    console.log('\nStarting service...');
    console.log('Detecting network traffic, please wait...');

    // Get userData path from command line (passed by Electron)
    // Args: [port, userDataPath]
    const args = process.argv.slice(2);
    const userDataPath = args[1] || __dirname; // Fallback to __dirname if not provided
    logger.info(`User data directory: ${userDataPath}`);
    
    // Define settings path in userData directory (AppData on Windows)
    const SETTINGS_PATH = path.join(userDataPath, 'settings.json');

    // Load global configuration from userData directory
    try {
        await fsPromises.access(SETTINGS_PATH);
        const data = await fsPromises.readFile(SETTINGS_PATH, 'utf8');
        Object.assign(globalSettings, JSON.parse(data));
        logger.info('✅ Loaded settings from:', SETTINGS_PATH);
    } catch (e) {
        if (e.code === 'ENOENT') {
            logger.info('No settings.json found, using defaults. Will create on first save.');
        } else {
            logger.error('Failed to load settings:', e);
        }
    }

    const userDataManager = new UserDataManager(logger, globalSettings, VERSION, userDataPath);
    await userDataManager.initialize();

    const sniffer = new Sniffer(logger, userDataManager, globalSettings); // Pass globalSettings to sniffer

    // Parse command line arguments
    // Args format: [port, userDataPath, deviceNum (optional)]
    let current_arg_index = 0;

    // Parse port (args[0])
    if (args[current_arg_index] && !isNaN(parseInt(args[current_arg_index]))) {
        server_port = parseInt(args[current_arg_index]);
        current_arg_index++;
    }

    // Skip userData path (args[1]) - already parsed above
    current_arg_index++;

    // Get device number: prioritize command line, then settings, then auto
    let deviceNum = args[current_arg_index] || globalSettings.networkAdapter || 'auto';
    
    logger.info(`Command line args: ${JSON.stringify(args)}`);
    logger.info(`Network adapter setting: ${globalSettings.networkAdapter}`);
    logger.info(`Using network adapter: ${deviceNum}`);

    try {
        await sniffer.start(deviceNum, PacketProcessor);
    } catch (error) {
        logger.error(`Error starting sniffer: ${error.message}`);
        rl.close();
        process.exit(1);
    }

    logger.level = 'error';

    process.on('SIGINT', async () => {
        console.log('\nClosing application...');
        rl.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\nClosing application...');
        rl.close();
        process.exit(0);
    });

    setInterval(() => {
        if (!globalSettings.isPaused) {
            userDataManager.updateAllRealtimeDps();
        }
    }, 100);

    if (server_port === undefined || server_port === null) {
        server_port = 8989;
    }

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    initializeApi(app, server, io, userDataManager, logger, globalSettings, VERSION, userDataPath); // Initialize API with globalSettings and userDataPath

    server.listen(server_port, '0.0.0.0', () => {
        const localUrl = `http://localhost:${server_port}`;
        console.log(`Web server started on ${localUrl}. You can access from this PC using ${localUrl}/index.html or from another PC using http://[YOUR_LOCAL_IP]:${server_port}/index.html`);
        console.log('WebSocket server started');
    });

    console.log(`✅ Infamous BPSR DPS Meter v${VERSION} - Ready!`);
    console.log('💡 TIP: Works with VPNs like ExitLag! The adapter with most traffic is auto-selected.');
    console.log('Detecting game server, please wait...');

    // Interval to clean IP and TCP fragment cache
    setInterval(() => {
        userDataManager.checkTimeoutClear();
    }, 10000);
}

if (!zlib.zstdDecompressSync) {
    console.log('zstdDecompressSync is not available! Please update your Node.js!');
    process.exit(1);
}

main();
