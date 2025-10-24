const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * VPN Detection and Management Utility
 * Detects problematic VPN configurations that interfere with packet capture
 */
class VPNDetector {
    constructor(logger) {
        this.logger = logger;
        this.detectedVPNs = [];
        this.isWindows = process.platform === 'win32';
    }

    /**
     * Detect VPN adapters on the system
     */
    async detectVPNs() {
        if (!this.isWindows) {
            this.logger.warn('VPN detection only supported on Windows');
            return {
                hasProblematicVPN: false,
                vpns: []
            };
        }

        try {
            // Get network adapters using netsh
            const { stdout } = await execPromise('netsh interface show interface');
            
            const problematicVPNs = [];
            const compatibleVPNs = [];

            // Known problematic VPN patterns (kernel-level encryption)
            const problematicPatterns = [
                { pattern: /exitlag/i, name: 'ExitLag', type: 'kernel' },
                { pattern: /wtfast/i, name: 'WTFast', type: 'kernel' },
                { pattern: /haste/i, name: 'Haste', type: 'kernel' },
                { pattern: /noping/i, name: 'NoPing', type: 'kernel' }
            ];

            // Known compatible VPN patterns (TAP adapters)
            const compatiblePatterns = [
                { pattern: /wireguard/i, name: 'WireGuard', type: 'tap' },
                { pattern: /openvpn/i, name: 'OpenVPN', type: 'tap' },
                { pattern: /nordvpn|nordlynx/i, name: 'NordVPN', type: 'tap' },
                { pattern: /proton/i, name: 'ProtonVPN', type: 'tap' },
                { pattern: /tap-windows/i, name: 'TAP Adapter', type: 'tap' }
            ];

            // Parse netsh output
            const lines = stdout.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('-')) continue;

                // Check for problematic VPNs
                for (const vpn of problematicPatterns) {
                    if (vpn.pattern.test(trimmed)) {
                        // Check if adapter is enabled (Connected/Dedicated)
                        const isEnabled = /Connected|Enabled|Dedicated/i.test(trimmed);
                        problematicVPNs.push({
                            name: vpn.name,
                            type: vpn.type,
                            enabled: isEnabled,
                            adapter: trimmed
                        });
                    }
                }

                // Check for compatible VPNs
                for (const vpn of compatiblePatterns) {
                    if (vpn.pattern.test(trimmed)) {
                        const isEnabled = /Connected|Enabled|Dedicated/i.test(trimmed);
                        compatibleVPNs.push({
                            name: vpn.name,
                            type: vpn.type,
                            enabled: isEnabled,
                            adapter: trimmed
                        });
                    }
                }
            }

            this.detectedVPNs = [...problematicVPNs, ...compatibleVPNs];

            const hasProblematicVPN = problematicVPNs.some(vpn => vpn.enabled);

            if (hasProblematicVPN) {
                this.logger.warn(`⚠️ Detected problematic VPN: ${problematicVPNs.filter(v => v.enabled).map(v => v.name).join(', ')}`);
            }

            return {
                hasProblematicVPN,
                vpns: this.detectedVPNs,
                problematicVPNs,
                compatibleVPNs
            };
        } catch (error) {
            this.logger.error('Failed to detect VPNs:', error.message);
            return {
                hasProblematicVPN: false,
                vpns: [],
                error: error.message
            };
        }
    }

    /**
     * Get VPN status for frontend display
     */
    async getVPNStatus() {
        const detection = await this.detectVPNs();
        
        return {
            compatible: !detection.hasProblematicVPN,
            detected: detection.vpns.filter(v => v.enabled),
            warning: detection.hasProblematicVPN ? 
                'Kernel-level VPN detected. Packet capture may not work. Consider disabling VPN while using the meter.' : 
                null
        };
    }

    /**
     * Get user-friendly VPN guidance message
     */
    getGuidanceMessage(vpnInfo) {
        if (!vpnInfo.hasProblematicVPN) {
            return {
                type: 'success',
                title: '✅ VPN Compatible',
                message: 'Your VPN configuration is compatible with the DPS meter.'
            };
        }

        const vpnNames = vpnInfo.problematicVPNs
            .filter(v => v.enabled)
            .map(v => v.name)
            .join(', ');

        return {
            type: 'warning',
            title: '⚠️ VPN May Interfere',
            message: `Detected: ${vpnNames}\n\nThis VPN uses kernel-level encryption that prevents packet capture.\n\nSolutions:\n1. Disable VPN while using the meter\n2. Check if your VPN has "TAP adapter mode"\n3. Use VPN for ranked, meter for casual`,
            actions: [
                {
                    label: 'Disable VPN',
                    action: 'disable_vpn'
                },
                {
                    label: 'Learn More',
                    action: 'show_vpn_docs'
                },
                {
                    label: 'Continue Anyway',
                    action: 'dismiss'
                }
            ]
        };
    }
}

module.exports = VPNDetector;
