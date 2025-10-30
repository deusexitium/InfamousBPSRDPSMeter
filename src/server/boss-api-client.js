// ============================================================================
// BOSS API CLIENT
// Handles API calls to HZRD's boss HP tracking endpoint
// ============================================================================

const https = require('https');
const http = require('http');

class BossApiClient {
    constructor(logger) {
        this.logger = logger;
        
        // API configuration
        this.apiUrl = null;
        this.apiKey = null;
        
        // Status tracking
        this.lastCallTime = null;
        this.lastCallSuccess = null;
        this.totalCalls = 0;
        this.successfulCalls = 0;
        this.failedCalls = 0;
        
        // Rate limiting
        this.minCallInterval = 1000; // Min 1 second between calls
        
        // Timeout
        this.requestTimeout = 5000; // 5 seconds
    }
    
    /**
     * Configure API endpoint and key
     */
    configure(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = this.obfuscateApiKey(apiKey);
        this.logger.info(`[Boss API] ✅ Configured endpoint: ${apiUrl ? apiUrl.substring(0, 30) + '...' : 'NOT SET'}`);
    }
    
    /**
     * Obfuscate API key (simple base64, not secure but better than plain)
     */
    obfuscateApiKey(key) {
        if (!key) return null;
        return Buffer.from(key).toString('base64');
    }
    
    /**
     * Deobfuscate API key
     */
    deobfuscateApiKey() {
        if (!this.apiKey) return null;
        return Buffer.from(this.apiKey, 'base64').toString('utf8');
    }
    
    /**
     * Send HP update to API
     * Fire and forget - don't wait for response, don't retry on failure
     */
    async sendHpUpdate(bossId, lineNumber, hpPercent) {
        // Check if configured
        if (!this.apiUrl || !this.apiKey) {
            this.logger.warn('[Boss API] ⚠️ API not configured, skipping send');
            return;
        }
        
        // Rate limiting - don't spam API
        const now = Date.now();
        if (this.lastCallTime && (now - this.lastCallTime) < this.minCallInterval) {
            this.logger.warn('[Boss API] ⏱️ Rate limited, skipping send');
            return;
        }
        
        this.lastCallTime = now;
        this.totalCalls++;
        
        // Prepare request body
        const body = JSON.stringify({
            boss_id: parseInt(bossId),
            line_number: parseInt(lineNumber),
            hp_percent: parseInt(hpPercent)
        });
        
        try {
            await this.makeRequest(body);
            this.successfulCalls++;
            this.lastCallSuccess = true;
            
        } catch (err) {
            this.failedCalls++;
            this.lastCallSuccess = false;
            
            // Log error but don't throw - fail silently
            this.logger.error(`[Boss API] ❌ Call failed: ${err.message}`);
        }
    }
    
    /**
     * Make HTTP POST request to API
     */
    makeRequest(body) {
        return new Promise((resolve, reject) => {
            // Parse URL
            const url = new URL(this.apiUrl);
            const isHttps = url.protocol === 'https:';
            const httpModule = isHttps ? https : http;
            
            // Request options
            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                    'X-API-Key': this.deobfuscateApiKey(),
                    'User-Agent': 'InfamousBPSRMeter/3.1'
                },
                timeout: this.requestTimeout
            };
            
            // Make request
            const req = httpModule.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ statusCode: res.statusCode, body: data });
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });
            
            // Error handling
            req.on('error', (err) => {
                reject(err);
            });
            
            // Timeout handling
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            // Send request
            req.write(body);
            req.end();
        });
    }
    
    /**
     * Get API status for display
     */
    getStatus() {
        return {
            configured: !!(this.apiUrl && this.apiKey),
            totalCalls: this.totalCalls,
            successfulCalls: this.successfulCalls,
            failedCalls: this.failedCalls,
            lastCallSuccess: this.lastCallSuccess,
            lastCallTime: this.lastCallTime,
            successRate: this.totalCalls > 0 ? 
                Math.round((this.successfulCalls / this.totalCalls) * 100) : 0
        };
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.totalCalls = 0;
        this.successfulCalls = 0;
        this.failedCalls = 0;
        this.lastCallSuccess = null;
        this.lastCallTime = null;
    }
}

module.exports = BossApiClient;
