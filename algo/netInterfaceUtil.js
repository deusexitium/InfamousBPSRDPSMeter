const { exec } = require('child_process');
const cap = require('cap');

// Filter ONLY truly virtual/irrelevant adapters
// Removed 'virtual', 'tap', 'wan miniport' to support VPNs like ExitLag
const VIRTUAL_KEYWORDS = ['zerotier', 'vmware', 'hyper-v', 'loopback', 'bluetooth'];

// VPN adapters that should be allowed (ExitLag, NordVPN, etc.)
const VPN_KEYWORDS = ['exitlag', 'tap-windows', 'wintun', 'nordvpn', 'expressvpn', 'protonvpn', 'wireguard'];

function isVirtual(name) {
    const lower = name.toLowerCase();
    // Don't filter if it's a known VPN adapter
    if (VPN_KEYWORDS.some((keyword) => lower.includes(keyword))) {
        return false;
    }
    return VIRTUAL_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Detect TCP traffic for 3 seconds
function detectTraffic(deviceIndex, devices) {
    return new Promise((resolve) => {
        let count = 0;
        try {
            const c = new cap.Cap();
            const buffer = Buffer.alloc(65535);

            const cleanup = () => {
                try {
                    c.close();
                } catch (e) {}
            };

            setTimeout(() => {
                cleanup();
                resolve(count);
            }, 3000);

            if (c.open(devices[deviceIndex].name, 'ip and tcp', 1024 * 1024, buffer) === 'ETHERNET') {
                c.setMinBytes && c.setMinBytes(0);
                c.on('packet', () => count++);
            } else {
                cleanup();
                resolve(0);
            }
        } catch (e) {
            resolve(0);
        }
    });
}

async function findByRoute(devices) {
    try {
        const stdout = await new Promise((resolve, reject) => {
            exec('route print 0.0.0.0', (error, stdout) => {
                if (error) reject(error);
                else resolve(stdout);
            });
        });

        const defaultInterface = stdout
            .split('\n')
            .find((line) => line.trim().startsWith('0.0.0.0'))
            ?.trim()
            .split(/\s+/)[3];

        if (!defaultInterface) return undefined;

        const targetInterface = Object.entries(devices).find(([, device]) =>
            device.addresses.find((address) => address.addr === defaultInterface),
        )?.[0];

        return parseInt(targetInterface);
    } catch (error) {
        return undefined;
    }
}

async function findDefaultNetworkDevice(devices) {
    try {
        // Log all available adapters for debugging
        console.log('\n📡 Available Network Adapters:');
        Object.entries(devices).forEach(([index, device]) => {
            const name = device.description || device.name || 'Unknown';
            const addresses = device.addresses?.map(a => a.addr).join(', ') || 'No IP';
            const virtual = isVirtual(name) ? '(Virtual)' : '';
            console.log(`  [${index}] ${name} ${virtual}`);
            console.log(`       IP: ${addresses}`);
        });
        console.log('');

        // Get ALL adapters with addresses (including VPNs)
        const validAdapters = Object.entries(devices).filter(([, device]) => {
            const name = device.description || device.name || '';
            return !isVirtual(name) && device.addresses && device.addresses.length > 0;
        });

        if (validAdapters.length === 0) {
            console.log('⚠️ No valid adapters found, falling back to route table...');
            return await findByRoute(devices);
        }

        // Detect traffic on ALL valid adapters (including VPNs)
        console.log('🔍 Detecting network traffic... (3s)');
        const results = await Promise.all(
            validAdapters.map(async ([index]) => ({
                index: parseInt(index),
                name: devices[index].description || devices[index].name,
                packets: await detectTraffic(parseInt(index), devices),
            })),
        );

        // Log traffic detection results
        console.log('\n📊 Traffic Detection Results:');
        results.forEach(r => {
            console.log(`  [${r.index}] ${r.name}: ${r.packets} packets`);
        });
        console.log('');

        // Select adapter with most traffic (prioritizes active VPN if in use)
        const best = results.filter((r) => r.packets > 0).sort((a, b) => b.packets - a.packets)[0];

        if (best) {
            console.log(`✅ Using adapter with most traffic:`);
            console.log(`   [${best.index}] ${best.name}`);
            console.log(`   Packets detected: ${best.packets}\n`);
            return best.index;
        }

        console.log('⚠️ No traffic detected, falling back to route table...');

        // Fallback to route table (but allow VPNs)
        const routeIndex = await findByRoute(devices);
        if (routeIndex !== undefined) {
            const routeName = devices[routeIndex]?.description || devices[routeIndex]?.name || 'Unknown';
            console.log(`📍 Using default route adapter: [${routeIndex}] ${routeName}`);
            return routeIndex;
        }

        // Last resort: use first valid adapter
        if (validAdapters.length > 0) {
            const firstIndex = parseInt(validAdapters[0][0]);
            const firstName = devices[firstIndex].description || devices[firstIndex].name;
            console.log(`🔧 Using first available adapter: [${firstIndex}] ${firstName}`);
            return firstIndex;
        }

        return undefined;
    } catch (error) {
        console.error('❌ Error detecting network adapter:', error.message);
        return undefined;
    }
}

module.exports = findDefaultNetworkDevice;
