/**
 * Packet Analysis Tool
 * 
 * Captures and logs ALL packets (not just damage/heal) to help reverse engineer
 * party/raid information, buffs, debuffs, and other game mechanics.
 * 
 * Usage:
 *   node tools/packet-analyzer.js --output packets.log --filter party
 */

const pb = require('../algo/pb');
const fs = require('fs');

class PacketAnalyzer {
    constructor(outputPath = 'packets.log', filterKeywords = []) {
        this.outputPath = outputPath;
        this.filterKeywords = filterKeywords.map(k => k.toLowerCase());
        this.packetCounts = new Map();
        this.interestingPackets = [];
        this.stream = fs.createWriteStream(outputPath, { flags: 'a' });
        
        console.log(`📊 Packet Analyzer Started`);
        console.log(`📝 Logging to: ${outputPath}`);
        if (filterKeywords.length > 0) {
            console.log(`🔍 Filtering for keywords: ${filterKeywords.join(', ')}`);
        }
    }
    
    analyzePacket(buffer, metadata = {}) {
        try {
            // Decode protobuf
            const decoded = pb.decode(buffer);
            
            // Generate packet signature (field IDs)
            const signature = this.getPacketSignature(decoded);
            
            // Count occurrences
            const count = (this.packetCounts.get(signature) || 0) + 1;
            this.packetCounts.set(signature, count);
            
            // Check if interesting
            if (this.isInteresting(decoded, buffer)) {
                const packet = {
                    timestamp: Date.now(),
                    signature,
                    count,
                    hex: buffer.toString('hex'),
                    decoded: JSON.stringify(decoded, this.replacer, 2),
                    metadata
                };
                
                this.interestingPackets.push(packet);
                this.logPacket(packet);
            }
            
        } catch (error) {
            // Log decode failures
            this.stream.write(`[ERROR] ${new Date().toISOString()} - Decode failed: ${error.message}\n`);
            this.stream.write(`Hex: ${buffer.toString('hex').substring(0, 100)}...\n\n`);
        }
    }
    
    getPacketSignature(decoded) {
        // Get top-level field IDs to identify packet type
        const fields = Object.keys(decoded).sort().join('-');
        return fields;
    }
    
    isInteresting(decoded, buffer) {
        // Always log packets with unusual signatures
        const signature = this.getPacketSignature(decoded);
        const count = this.packetCounts.get(signature) || 0;
        if (count === 0) {
            return true; // First time seeing this packet type
        }
        
        // Check for filter keywords in hex/decoded data
        if (this.filterKeywords.length > 0) {
            const hex = buffer.toString('hex').toLowerCase();
            const json = JSON.stringify(decoded).toLowerCase();
            
            for (const keyword of this.filterKeywords) {
                if (hex.includes(keyword) || json.includes(keyword)) {
                    return true;
                }
            }
        }
        
        // Check for interesting field counts (likely party/raid data)
        const fieldCount = Object.keys(decoded).length;
        
        // Packets with 5, 10, or 20 sub-elements might be party/raid lists
        for (const field in decoded) {
            if (Array.isArray(decoded[field])) {
                const len = decoded[field].length;
                if (len === 5 || len === 10 || len === 20) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    logPacket(packet) {
        this.stream.write('='.repeat(80) + '\n');
        this.stream.write(`[${new Date(packet.timestamp).toISOString()}]\n`);
        this.stream.write(`Signature: ${packet.signature} (seen ${packet.count} times)\n`);
        if (Object.keys(packet.metadata).length > 0) {
            this.stream.write(`Metadata: ${JSON.stringify(packet.metadata)}\n`);
        }
        this.stream.write(`Decoded:\n${packet.decoded}\n`);
        this.stream.write(`Hex: ${packet.hex.substring(0, 200)}...\n`);
        this.stream.write('='.repeat(80) + '\n\n');
    }
    
    replacer(key, value) {
        // Custom JSON replacer to handle Buffers and BigInts
        if (value instanceof Buffer) {
            return `<Buffer ${value.toString('hex').substring(0, 40)}...>`;
        }
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }
    
    printSummary() {
        console.log('\n📊 Packet Analysis Summary:');
        console.log(`Total interesting packets: ${this.interestingPackets.length}`);
        console.log(`\nTop 10 packet types by occurrence:`);
        
        const sorted = Array.from(this.packetCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        for (const [signature, count] of sorted) {
            console.log(`  ${signature.substring(0, 50)}: ${count} times`);
        }
        
        console.log(`\n📝 Full log written to: ${this.outputPath}`);
    }
    
    close() {
        this.printSummary();
        this.stream.end();
    }
}

// Example integration into sniffer
function integrateIntoSniffer(sniffer) {
    const analyzer = new PacketAnalyzer('packets-analysis.log', ['party', 'team', 'group', 'member', 'raid']);
    
    // Hook into packet processing
    const originalProcess = sniffer.processEthPacket.bind(sniffer);
    sniffer.processEthPacket = function(frameBuffer) {
        // Analyze raw packet
        analyzer.analyzePacket(frameBuffer, {
            source: 'eth_packet',
            length: frameBuffer.length
        });
        
        // Continue normal processing
        return originalProcess(frameBuffer);
    };
    
    // Cleanup on exit
    process.on('SIGINT', () => {
        analyzer.close();
        process.exit();
    });
    
    return analyzer;
}

module.exports = { PacketAnalyzer, integrateIntoSniffer };
