const fs = require('fs');
const path = require('path');
const https = require('https');

class SkillTranslationManager {
    constructor(logger, userDataPath) {
        this.logger = logger;
        this.translations = new Map();
        this.talentTable = new Map();
        this.conflicts = new Map();
        
        // Installation directory paths (READ-ONLY)
        this.installTranslationsPath = path.join(__dirname, '../../tables/skill_translations.json');
        this.installTalentPath = path.join(__dirname, '../../tables/talent_table.json');
        this.installConflictsPath = path.join(__dirname, '../../tables/conflicts.json');
        
        // User data directory paths (WRITABLE)
        this.userDataPath = userDataPath;
        this.translationsPath = path.join(userDataPath, 'skill_translations.json');
        this.talentPath = path.join(userDataPath, 'talent_table.json');
        this.conflictsPath = path.join(userDataPath, 'conflicts.json');
        
        // Remote URLs
        this.translationsUrl = 'https://raw.githubusercontent.com/winjwinj/bpsr-logs/refs/heads/main/raw-game-files/4_Final/CombinedTranslatedWithManualOverrides.json';
        this.talentUrl = 'https://raw.githubusercontent.com/winjwinj/bpsr-logs/refs/heads/main/raw-game-files/4_Final/TalentTable_Clean.json';
        this.conflictsUrl = 'https://raw.githubusercontent.com/winjwinj/bpsr-logs/refs/heads/main/raw-game-files/4_Final/Conflicts.json';
    }

    /**
     * Initialize - load local files and update from remote
     */
    async initialize() {
        this.logger.info('🌐 Initializing skill translation system...');
        
        // Load local files first (fallback)
        this.loadLocalFiles();
        
        // Try to update from remote
        await this.updateFromRemote();
        
        this.logger.info(`✅ Skill translations loaded: ${this.translations.size} entries`);
    }

    /**
     * Load local translation files (try userData first, fall back to installation directory)
     */
    loadLocalFiles() {
        try {
            // Load main translations (try userData first, then installation)
            const translationsPath = fs.existsSync(this.translationsPath) ? this.translationsPath : this.installTranslationsPath;
            if (fs.existsSync(translationsPath)) {
                const data = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
                this.parseTranslations(data);
                this.logger.info(`📖 Loaded ${this.translations.size} skill translations from local file`);
            }
            
            // Load talent table (try userData first, then installation)
            const talentPath = fs.existsSync(this.talentPath) ? this.talentPath : this.installTalentPath;
            if (fs.existsSync(talentPath)) {
                const data = JSON.parse(fs.readFileSync(talentPath, 'utf8'));
                this.parseTalentTable(data);
                this.logger.info(`📖 Loaded talent table from local file`);
            }
            
            // Load conflicts (try userData first, then installation)
            const conflictsPath = fs.existsSync(this.conflictsPath) ? this.conflictsPath : this.installConflictsPath;
            if (fs.existsSync(conflictsPath)) {
                const data = JSON.parse(fs.readFileSync(conflictsPath, 'utf8'));
                this.parseConflicts(data);
                this.logger.info(`📖 Loaded conflicts from local file`);
            }
        } catch (error) {
            this.logger.error('Failed to load local translation files:', error.message);
        }
    }

    /**
     * Update translations from remote GitHub
     */
    async updateFromRemote() {
        this.logger.info('🔄 Checking for translation updates from GitHub...');
        
        try {
            // Download and save all three files with timeout
            const downloadPromises = [
                this.downloadFile(this.translationsUrl, this.translationsPath),
                this.downloadFile(this.talentUrl, this.talentPath),
                this.downloadFile(this.conflictsUrl, this.conflictsPath)
            ];
            
            // Add 10 second timeout
            await Promise.race([
                Promise.all(downloadPromises),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 10000))
            ]);
            
            // Reload from updated files
            this.loadLocalFiles();
            
            this.logger.info('✅ Translation files updated from GitHub');
        } catch (error) {
            this.logger.warn('⚠️ Failed to update from GitHub, using local files:', error.message);
        }
    }

    /**
     * Download file from URL
     */
    downloadFile(url, dest) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        });
    }

    /**
     * Parse main translation data
     */
    parseTranslations(data) {
        this.translations.clear();
        
        for (const [id, entry] of Object.entries(data)) {
            const skillId = parseInt(id, 10);
            if (isNaN(skillId)) continue;
            
            // Priority: Manual Override > RecountTable > SkillTable > skill_names
            let name = entry.EnglishShortManualOverride;
            
            if (!name && entry['RecountTable_Clean.json']) {
                name = entry['RecountTable_Clean.json'].EnglishShort;
            }
            
            if (!name && entry['SkillTable_Clean.json']) {
                name = entry['SkillTable_Clean.json'].EnglishShort;
            }
            
            if (!name && entry['skill_names_Clean.json']) {
                name = entry['skill_names_Clean.json'].AIEnglishShort;
            }
            
            if (name) {
                this.translations.set(skillId, {
                    name: name,
                    chinese: entry['skill_names_Clean.json']?.ChineseShort || '',
                    comment: entry.Comment || null
                });
            }
        }
    }

    /**
     * Parse talent table
     */
    parseTalentTable(data) {
        this.talentTable.clear();
        
        for (const [id, entry] of Object.entries(data)) {
            const talentId = parseInt(id, 10);
            if (isNaN(talentId)) continue;
            
            this.talentTable.set(talentId, {
                name: entry.EnglishShort || entry.AIEnglishShort || '',
                chinese: entry.ChineseShort || ''
            });
        }
    }

    /**
     * Parse conflicts
     */
    parseConflicts(data) {
        this.conflicts.clear();
        
        for (const [id, entry] of Object.entries(data)) {
            const conflictId = parseInt(id, 10);
            if (isNaN(conflictId)) continue;
            
            this.conflicts.set(conflictId, entry);
        }
    }

    /**
     * Get translated skill name
     * @param {number} skillId - Skill ID
     * @returns {string} Translated name or fallback
     */
    getSkillName(skillId) {
        const translation = this.translations.get(skillId);
        if (translation && translation.name) {
            return translation.name;
        }
        
        // Fallback to skill ID
        return `Skill_${skillId}`;
    }

    /**
     * Get talent name
     * @param {number} talentId - Talent ID
     * @returns {string} Talent name or fallback
     */
    getTalentName(talentId) {
        const talent = this.talentTable.get(talentId);
        if (talent && talent.name) {
            return talent.name;
        }
        
        return `Talent_${talentId}`;
    }

    /**
     * Get all translations as object (for API export)
     */
    getAllTranslations() {
        const result = {};
        for (const [id, data] of this.translations.entries()) {
            result[id] = data.name;
        }
        return result;
    }
}

module.exports = SkillTranslationManager;
