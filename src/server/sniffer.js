const cap = require('cap');
const decoders = cap.decoders;
const PROTOCOL = decoders.PROTOCOL;
const Readable = require('stream').Readable;
const findDefaultNetworkDevice = require('../../algo/netInterfaceUtil'); // Adjust path
const { Lock } = require('./dataManager'); // Import Lock from dataManager

const Cap = cap.Cap;

const NPCAP_INSTALLER_PATH = require('path').join(__dirname, '..', '..', 'Dist', 'npcap-1.83.exe'); // Adjust path
const fs = require('fs');
const { spawn } = require('child_process');

async function checkAndInstallNpcap(logger) {
    try {
        const devices = Cap.deviceList();
        if (!devices || devices.length === 0 || devices.every(d => d.name.includes('Loopback'))) {
            throw new Error('Npcap not detected or not functional.');
        }
        logger.info('Npcap detected and functional.');
        return true;
    } catch (e) {
        logger.warn(`Npcap not detected or not functional: ${e.message}`);
        logger.info('Attempting to install Npcap...');

        if (!fs.existsSync(NPCAP_INSTALLER_PATH)) {
            logger.error(`╔════════════════════════════════════════════════════════════╗`);
            logger.error(`║  NPCAP REQUIRED - PACKET CAPTURE DRIVER NOT FOUND         ║`);
            logger.error(`╚════════════════════════════════════════════════════════════╝`);
            logger.error(``);
            logger.error(`Npcap is required for the DPS meter to capture game packets.`);
            logger.error(``);
            logger.error(`📥 DOWNLOAD NPCAP:`);
            logger.error(`   https://npcap.com/#download`);
            logger.error(``);
            logger.error(`📋 INSTALLATION STEPS:`);
            logger.error(`   1. Download Npcap from the link above`);
            logger.error(`   2. Run the installer as Administrator`);
            logger.error(`   3. Use default settings (WinPcap compatibility mode)`);
            logger.error(`   4. Restart this application`);
            logger.error(``);
            logger.error(`⚠️  The application cannot function without Npcap!`);
            logger.error(``);
            return false;
        }

        try {
            logger.info('╔════════════════════════════════════════════════════════════╗');
            logger.info('║  LAUNCHING NPCAP INSTALLER                                 ║');
            logger.info('╚════════════════════════════════════════════════════════════╝');
            logger.info('');
            logger.info('The Npcap installer will open in a moment...');
            logger.info('');
            logger.info('📋 INSTALLATION INSTRUCTIONS:');
            logger.info('   1. Click "I Agree" to accept the license');
            logger.info('   2. Keep "WinPcap API-compatible Mode" CHECKED');
            logger.info('   3. Click "Install"');
            logger.info('   4. Wait for installation to complete');
            logger.info('   5. Restart this application');
            logger.info('');
            
            const npcapProcess = spawn(NPCAP_INSTALLER_PATH, [], { detached: true, stdio: 'ignore' });
            npcapProcess.unref();

            logger.info('✅ Npcap installer launched successfully!');
            logger.info('⚠️  Please complete the installation and restart the app.');
            logger.info('');
            return false;
        } catch (spawnError) {
            logger.error(`╔════════════════════════════════════════════════════════════╗`);
            logger.error(`║  ERROR LAUNCHING NPCAP INSTALLER                           ║`);
            logger.error(`╚════════════════════════════════════════════════════════════╝`);
            logger.error(``);
            logger.error(`Could not launch installer: ${spawnError.message}`);
            logger.error(``);
            logger.error(`📥 MANUAL INSTALLATION:`);
            logger.error(`   1. Download from: https://npcap.com/#download`);
            logger.error(`   2. Run as Administrator`);
            logger.error(`   3. Enable "WinPcap API-compatible Mode"`);
            logger.error(`   4. Restart this application`);
            logger.error(``);
            return false;
        }
    }
}

class Sniffer {
    constructor(logger, userDataManager, globalSettings) {
        this.logger = logger;
        this.userDataManager = userDataManager;
        this.globalSettings = globalSettings; // Pass globalSettings to sniffer
        this.current_server = '';
        this._data = Buffer.alloc(0);
        this.tcp_next_seq = -1;
        this.tcp_cache = new Map();
        this.tcp_last_time = 0;
        this.tcp_lock = new Lock();
        this.fragmentIpCache = new Map();
        this.FRAGMENT_TIMEOUT = 30000;
        this.eth_queue = [];
        this.capInstance = null;
        this.packetProcessor = null;
        this.isPaused = false; // Pause state for sniffer
        
        // Performance optimization settings
        this.MAX_QUEUE_SIZE = 10000; // Prevent memory overflow
        this.BATCH_SIZE = 50; // Process packets in batches
        this.droppedPackets = 0;
        this.processedPackets = 0;
        this.lastStatsLog = Date.now();
    }

    setPaused(paused) {
        this.isPaused = paused;
    }

    clearTcpCache() {
        this._data = Buffer.alloc(0);
        this.tcp_next_seq = -1;
        this.tcp_last_time = 0;
        this.tcp_cache.clear();
        this.logger.debug('TCP cache cleared');
    }
    
    // OPTIMIZED: Auto-cleanup stale TCP cache entries
    cleanupTcpCache() {
        const MAX_CACHE_SIZE = 100;
        if (this.tcp_cache.size > MAX_CACHE_SIZE) {
            const entriesToDelete = this.tcp_cache.size - MAX_CACHE_SIZE;
            let deleted = 0;
            for (const [seq] of this.tcp_cache) {
                if (deleted >= entriesToDelete) break;
                this.tcp_cache.delete(seq);
                deleted++;
            }
            this.logger.debug(`Cleaned up ${deleted} stale TCP cache entries`);
        }
    }

    getTCPPacket(frameBuffer, ethOffset) {
        const ipPacket = decoders.IPV4(frameBuffer, ethOffset);
        const ipId = ipPacket.info.id;
        const isFragment = (ipPacket.info.flags & 0x1) !== 0;
        const _key = `${ipId}-${ipPacket.info.srcaddr}-${ipPacket.info.dstaddr}-${ipPacket.info.protocol}`;
        const now = Date.now();

        if (isFragment || ipPacket.info.fragoffset > 0) {
            if (!this.fragmentIpCache.has(_key)) {
                this.fragmentIpCache.set(_key, {
                    fragments: [],
                    timestamp: now,
                });
            }

            const cacheEntry = this.fragmentIpCache.get(_key);
            const ipBuffer = Buffer.from(frameBuffer.subarray(ethOffset));
            cacheEntry.fragments.push(ipBuffer);
            cacheEntry.timestamp = now;

            if (isFragment) {
                return null;
            }

            const fragments = cacheEntry.fragments;
            if (!fragments) {
                this.logger.error(`Can't find fragments for ${_key}`);
                return null;
            }

            let totalLength = 0;
            const fragmentData = [];

            for (const buffer of fragments) {
                const ip = decoders.IPV4(buffer);
                const fragmentOffset = ip.info.fragoffset * 8;
                const payloadLength = ip.info.totallen - ip.hdrlen;
                const payload = Buffer.from(buffer.subarray(ip.offset, ip.offset + payloadLength));

                fragmentData.push({
                    offset: fragmentOffset,
                    payload: payload,
                });

                const endOffset = fragmentOffset + payloadLength;
                if (endOffset > totalLength) {
                    totalLength = endOffset;
                }
            }

            const fullPayload = Buffer.alloc(totalLength);
            for (const fragment of fragmentData) {
                fragment.payload.copy(fullPayload, fragment.offset);
            }

            this.fragmentIpCache.delete(_key);
            return fullPayload;
        }

        return Buffer.from(frameBuffer.subarray(ipPacket.offset, ipPacket.offset + (ipPacket.info.totallen - ipPacket.hdrlen)));
    }

    async processEthPacket(frameBuffer) {
        if (this.isPaused) return; // Do not process packets if paused

        var ethPacket = decoders.Ethernet(frameBuffer);

        if (ethPacket.info.type !== PROTOCOL.ETHERNET.IPV4) return;

        const ipPacket = decoders.IPV4(frameBuffer, ethPacket.offset);
        const srcaddr = ipPacket.info.srcaddr;
        const dstaddr = ipPacket.info.dstaddr;

        const tcpBuffer = this.getTCPPacket(frameBuffer, ethPacket.offset);
        if (tcpBuffer === null) return;
        const tcpPacket = decoders.TCP(tcpBuffer);

        const buf = Buffer.from(tcpBuffer.subarray(tcpPacket.hdrlen));

        const srcport = tcpPacket.info.srcport;
        const dstport = tcpPacket.info.dstport;
        const src_server = srcaddr + ':' + srcport + ' -> ' + dstaddr + ':' + dstport;

        await this.tcp_lock.acquire();
        try {
            if (this.current_server !== src_server) {
                try {
                    if (buf[4] == 0) {
                        const data = buf.subarray(10);
                        if (data.length) {
                            const stream = Readable.from(data, { objectMode: false });
                            let data1;
                            do {
                                const len_buf = stream.read(4);
                                if (!len_buf) break;
                                data1 = stream.read(len_buf.readUInt32BE() - 4);
                                const signature = Buffer.from([0x00, 0x63, 0x33, 0x53, 0x42, 0x00]);
                                if (Buffer.compare(data1.subarray(5, 5 + signature.length), signature)) break;
                                try {
                                    if (this.current_server !== src_server) {
                                        this.current_server = src_server;
                                        this.clearTcpCache();
                                        this.tcp_next_seq = tcpPacket.info.seqno + buf.length;
                                        this.userDataManager.refreshEnemyCache();
                                        if (this.globalSettings.autoClearOnServerChange && this.userDataManager.lastLogTime !== 0 && this.userDataManager.users.size !== 0) {
                                            this.userDataManager.clearAll(this.globalSettings);
                                            console.log('Server changed, statistics cleared!');
                                        }
                                        console.log('Game server detected. Measuring DPS...');
                                    }
                                } catch (e) {}
                            } while (data1 && data1.length);
                        }
                    }
                    if (buf.length === 0x62) {
                        const signature = Buffer.from([
                            0x00, 0x00, 0x00, 0x62,
                            0x00, 0x03,
                            0x00, 0x00, 0x00, 0x01,
                            0x00, 0x11, 0x45, 0x14,
                            0x00, 0x00, 0x00, 0x00,
                            0x0a, 0x4e, 0x08, 0x01, 0x22, 0x24
                        ]);
                        if (
                            Buffer.compare(buf.subarray(0, 10), signature.subarray(0, 10)) === 0 &&
                            Buffer.compare(buf.subarray(14, 14 + 6), signature.subarray(14, 14 + 6)) === 0
                        ) {
                            if (this.current_server !== src_server) {
                                this.current_server = src_server;
                                this.clearTcpCache();
                                this.tcp_next_seq = tcpPacket.info.seqno + buf.length;
                                this.userDataManager.refreshEnemyCache();
                                if (this.globalSettings.autoClearOnServerChange && this.userDataManager.lastLogTime !== 0 && this.userDataManager.users.size !== 0) {
                                    this.userDataManager.clearAll(this.globalSettings);
                                    console.log('Server changed, statistics cleared!');
                                }
                                console.log('Game server detected by login packet. Measuring DPS...');
                            }
                        }
                    }
                } catch (e) {}
                return;
            }

            if (this.tcp_next_seq === -1) {
                this.logger.error('Unexpected TCP capture error! tcp_next_seq is -1');
                if (buf.length > 4 && buf.readUInt32BE() < 0x0fffff) {
                    this.tcp_next_seq = tcpPacket.info.seqno;
                }
            }

            if ((this.tcp_next_seq - tcpPacket.info.seqno) << 0 <= 0 || this.tcp_next_seq === -1) {
                this.tcp_cache.set(tcpPacket.info.seqno, buf);
            }
            while (this.tcp_cache.has(this.tcp_next_seq)) {
                const seq = this.tcp_next_seq;
                const cachedTcpData = this.tcp_cache.get(seq);
                this._data = this._data.length === 0 ? cachedTcpData : Buffer.concat([this._data, cachedTcpData]);
                this.tcp_next_seq = (seq + cachedTcpData.length) >>> 0;
                this.tcp_cache.delete(seq);
                this.tcp_last_time = Date.now();
            }

            while (this._data.length > 4) {
                let packetSize = this._data.readUInt32BE();

                if (this._data.length < packetSize) break;

                if (this._data.length >= packetSize) {
                    const packet = this._data.subarray(0, packetSize);
                    this._data = this._data.subarray(packetSize);
                    if (this.packetProcessor) {
                        this.packetProcessor.processPacket(packet, this.isPaused, this.globalSettings); // Pasar isPaused y globalSettings
                    }
                } else if (packetSize > 0x0fffff) {
                    this.logger.error(`Invalid Length!! ${this._data.length},${packetSize},${this._data.toString('hex')},${this.tcp_next_seq}`);
                    process.exit(1);
                    break;
                }
            }
        } finally {
            this.tcp_lock.release();
        }
    }

    async start(deviceNum, PacketProcessorClass) {
        const npcapReady = await checkAndInstallNpcap(this.logger);
        if (!npcapReady) {
            throw new Error('Npcap is not ready. The application must exit.');
        }

        const devices = Cap.deviceList();

        let num = deviceNum;
        if (num === undefined || num === 'auto') {
            let deviceFound = false;
            while (!deviceFound) {
                const device_num = await findDefaultNetworkDevice(devices);
                if (device_num !== undefined) {
                    num = device_num;
                    deviceFound = true;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }

        if (num === undefined || !devices[num]) {
            this.logger.error('Could not automatically detect a valid network interface.');
            this.logger.error('Make sure the game is running and try again.');
            throw new Error('Could not detect a valid network interface.');
        }

        this.packetProcessor = new PacketProcessorClass({ logger: this.logger, userDataManager: this.userDataManager });

        const device = devices[num].name;
        const filter = 'ip and tcp';
        
        // OPTIMIZED: 32MB buffer for high-traffic scenarios
        const bufSize = 32 * 1024 * 1024;
        
        // OPTIMIZED: Larger packet buffer
        const buffer = Buffer.alloc(65535);
        
        this.capInstance = new Cap();
        const linkType = this.capInstance.open(device, filter, bufSize, buffer);
        
        if (linkType !== 'ETHERNET') {
            this.logger.error('The device seems to be WRONG! Please check the device! Device type: ' + linkType);
        }
        
        this.capInstance.setMinBytes && this.capInstance.setMinBytes(0);
        
        // OPTIMIZED: Queue overflow protection
        this.capInstance.on('packet', async (nbytes, trunc) => {
            if (this.eth_queue.length < this.MAX_QUEUE_SIZE) {
                this.eth_queue.push(Buffer.from(buffer.subarray(0, nbytes)));
            } else {
                this.droppedPackets++;
                // Log warning every 100 dropped packets
                if (this.droppedPackets % 100 === 0) {
                    this.logger.warn(`Packet queue full! Dropped ${this.droppedPackets} packets. Processing may be slow.`);
                }
            }
        });

        // OPTIMIZED: Batch packet processing for better performance
        (async () => {
            while (true) {
                if (this.eth_queue.length) {
                    // Process up to BATCH_SIZE packets per iteration
                    const batchSize = Math.min(this.BATCH_SIZE, this.eth_queue.length);
                    
                    for (let i = 0; i < batchSize; i++) {
                        const pkt = this.eth_queue.shift();
                        if (pkt) {
                            try {
                                this.processEthPacket(pkt);
                                this.processedPackets++;
                            } catch (error) {
                                this.logger.error(`Error processing packet: ${error.message}`);
                            }
                        }
                    }
                    
                    // Log performance stats every 30 seconds
                    const now = Date.now();
                    if (now - this.lastStatsLog > 30000) {
                        const queueSize = this.eth_queue.length;
                        this.logger.info(`📊 Packet Stats: Processed=${this.processedPackets}, Dropped=${this.droppedPackets}, Queue=${queueSize}`);
                        
                        if (this.droppedPackets > 0) {
                            this.logger.warn(`⚠️ ${this.droppedPackets} packets were dropped - consider closing other network apps`);
                        }
                        
                        this.lastStatsLog = now;
                    }
                    
                    // Yield CPU briefly after batch
                    await new Promise((r) => setImmediate(r));
                } else {
                    // Wait longer when queue is empty to reduce CPU usage
                    await new Promise((r) => setTimeout(r, 5));
                }
            }
        })();

        // OPTIMIZED: Periodic maintenance with better monitoring
        setInterval(async () => {
            const now = Date.now();
            
            // Clean up expired IP fragment caches
            let clearedFragments = 0;
            for (const [key, cacheEntry] of this.fragmentIpCache) {
                if (now - cacheEntry.timestamp > this.FRAGMENT_TIMEOUT) {
                    this.fragmentIpCache.delete(key);
                    clearedFragments++;
                }
            }
            if (clearedFragments > 0) {
                this.logger.debug(`Cleared ${clearedFragments} expired IP fragment caches`);
            }

            // Auto-cleanup TCP cache if growing too large
            this.cleanupTcpCache();

            // Check for connection timeout with auto-recovery
            if (this.tcp_last_time && now - this.tcp_last_time > this.FRAGMENT_TIMEOUT) {
                this.logger.warn('⚠️ Connection timeout detected! Game may be closed or disconnected.');
                this.logger.info('🔄 Resetting connection state for auto-recovery...');
                this.current_server = '';
                this.clearTcpCache();
                
                // Reset dropped packet counter on disconnect
                if (this.droppedPackets > 0) {
                    this.logger.info(`Session stats: ${this.processedPackets} processed, ${this.droppedPackets} dropped`);
                    this.droppedPackets = 0;
                    this.processedPackets = 0;
                }
            }
        }, 10000);
    }
}

module.exports = Sniffer;
