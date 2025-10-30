/**
 * Interactive Packet Explorer
 * 
 * Takes captured packet hex dumps and lets you explore them interactively.
 * 
 * Usage:
 *   node tools/packet-explorer.js <hex_string>
 *   node tools/packet-explorer.js --file packets.log
 */

const pb = require('../algo/pb');
const readline = require('readline');

class PacketExplorer {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.currentPacket = null;
        this.currentDecoded = null;
    }
    
    async start() {
        console.log('🔍 Packet Explorer');
        console.log('Commands:');
        console.log('  load <hex>     - Load packet from hex string');
        console.log('  show           - Show decoded packet');
        console.log('  tree           - Show packet structure as tree');
        console.log('  search <term>  - Search for field/value');
        console.log('  field <id>     - Show specific field details');
        console.log('  arrays         - List all array fields');
        console.log('  exit           - Exit explorer\n');
        
        this.prompt();
    }
    
    prompt() {
        this.rl.question('> ', async (input) => {
            await this.handleCommand(input.trim());
            this.prompt();
        });
    }
    
    async handleCommand(input) {
        const [cmd, ...args] = input.split(' ');
        
        switch (cmd.toLowerCase()) {
            case 'load':
                this.loadPacket(args.join(''));
                break;
            case 'show':
                this.showPacket();
                break;
            case 'tree':
                this.showTree();
                break;
            case 'search':
                this.search(args.join(' '));
                break;
            case 'field':
                this.showField(args[0]);
                break;
            case 'arrays':
                this.showArrays();
                break;
            case 'exit':
                this.rl.close();
                process.exit(0);
                break;
            default:
                console.log('Unknown command. Type "help" for commands.');
        }
    }
    
    loadPacket(hex) {
        try {
            this.currentPacket = Buffer.from(hex, 'hex');
            this.currentDecoded = pb.decode(this.currentPacket);
            console.log(`✅ Loaded packet (${this.currentPacket.length} bytes)`);
            this.showTree();
        } catch (error) {
            console.log(`❌ Failed to load packet: ${error.message}`);
        }
    }
    
    showPacket() {
        if (!this.currentDecoded) {
            console.log('No packet loaded. Use "load <hex>" first.');
            return;
        }
        
        console.log(JSON.stringify(this.currentDecoded, this.replacer, 2));
    }
    
    showTree(obj = this.currentDecoded, indent = 0) {
        if (!obj) {
            console.log('No packet loaded.');
            return;
        }
        
        const prefix = '  '.repeat(indent);
        
        for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
                if (Array.isArray(value)) {
                    console.log(`${prefix}📦 Field ${key}: Array[${value.length}]`);
                    if (value.length <= 5) {
                        value.forEach((item, i) => {
                            console.log(`${prefix}  [${i}]:`);
                            if (item && typeof item === 'object') {
                                this.showTree(item, indent + 2);
                            } else {
                                console.log(`${prefix}    ${item}`);
                            }
                        });
                    } else {
                        console.log(`${prefix}  ... (showing first 2 of ${value.length})`);
                        value.slice(0, 2).forEach((item, i) => {
                            console.log(`${prefix}  [${i}]:`);
                            if (item && typeof item === 'object') {
                                this.showTree(item, indent + 2);
                            }
                        });
                    }
                } else {
                    console.log(`${prefix}📁 Field ${key}: Object`);
                    this.showTree(value, indent + 1);
                }
            } else if (Buffer.isBuffer(value)) {
                console.log(`${prefix}🔢 Field ${key}: Buffer(${value.length} bytes) = ${value.toString('hex').substring(0, 20)}...`);
            } else {
                console.log(`${prefix}✨ Field ${key}: ${value}`);
            }
        }
    }
    
    search(term) {
        if (!this.currentDecoded) {
            console.log('No packet loaded.');
            return;
        }
        
        const results = [];
        const searchTerm = term.toLowerCase();
        
        function searchObj(obj, path = '') {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                // Check key
                if (key.toLowerCase().includes(searchTerm)) {
                    results.push({ path: currentPath, type: 'key', value });
                }
                
                // Check value
                if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
                    results.push({ path: currentPath, type: 'value', value });
                } else if (typeof value === 'number' && value.toString().includes(searchTerm)) {
                    results.push({ path: currentPath, type: 'value', value });
                } else if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
                    searchObj(value, currentPath);
                }
            }
        }
        
        searchObj(this.currentDecoded);
        
        if (results.length === 0) {
            console.log(`No results for "${term}"`);
        } else {
            console.log(`Found ${results.length} results for "${term}":`);
            results.forEach(r => {
                console.log(`  ${r.path} (${r.type}): ${JSON.stringify(r.value).substring(0, 50)}`);
            });
        }
    }
    
    showField(fieldId) {
        if (!this.currentDecoded) {
            console.log('No packet loaded.');
            return;
        }
        
        if (!this.currentDecoded[fieldId]) {
            console.log(`Field ${fieldId} not found.`);
            return;
        }
        
        const value = this.currentDecoded[fieldId];
        console.log(`Field ${fieldId}:`);
        console.log(JSON.stringify(value, this.replacer, 2));
    }
    
    showArrays() {
        if (!this.currentDecoded) {
            console.log('No packet loaded.');
            return;
        }
        
        console.log('Array fields in packet:');
        
        function findArrays(obj, path = '') {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (Array.isArray(value)) {
                    console.log(`  ${currentPath}: Array[${value.length}]`);
                    if (value.length > 0) {
                        const first = value[0];
                        const type = Buffer.isBuffer(first) ? 'Buffer' : typeof first;
                        console.log(`    Elements: ${type}`);
                    }
                } else if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
                    findArrays(value, currentPath);
                }
            }
        }
        
        findArrays(this.currentDecoded);
    }
    
    replacer(key, value) {
        if (value instanceof Buffer) {
            return `<Buffer ${value.length}B: ${value.toString('hex').substring(0, 20)}...>`;
        }
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }
}

// CLI
if (require.main === module) {
    const explorer = new PacketExplorer();
    explorer.start();
}

module.exports = { PacketExplorer };
