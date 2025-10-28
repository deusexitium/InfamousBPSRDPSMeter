const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const skillNames = require('../../tables/skill_names.json');
const SkillTranslationManager = require('./skillTranslations');

class Lock {
    constructor() {
        this.queue = [];
        this.locked = false;
    }

    async acquire() {
        if (this.locked) {
            return new Promise((resolve) => this.queue.push(resolve));
        }
        this.locked = true;
    }

    release() {
        if (this.queue.length > 0) {
            const nextResolve = this.queue.shift();
            nextResolve();
        } else {
            this.locked = false;
        }
    }
}

// Server change tracking - set by sniffer when server changes
let serverChangeDetected = false;

function getSubProfessionBySkillId(skillId) {
    switch (skillId) {
        case 1241:
            return '射线';
        case 2307:
        case 2361:
        case 55302:
            return '协奏';
        case 20301:
            return '愈合';
        case 1518:
        case 1541:
        case 21402:
            return '惩戒';
        case 2306:
            return '狂音';
        case 120901:
        case 120902:
            return '冰矛';
        case 1714:
        case 1734:
            return '居合';
        case 44701:
        case 179906:
            return '月刃';
        case 220112:
        case 2203622:
            return '鹰弓';
        case 2292:
        case 1700820:
        case 1700825:
        case 1700827:
            return '狼弓';
        case 1419:
            return '空枪';
        case 1405:
        case 1418:
            return '重装';
        case 2405:
            return '光盾';  // Recovery (uses Valor Bash)
        case 2406:
            return '防盾';  // Shield (uses Vanguard Strike)
        case 199902:
            return '岩盾';
        case 1930:
        case 1931:
        case 1934:
        case 1935:
            return '格挡';
        default:
            return '';
    }
}

class StatisticData {
    constructor(user, type, element) {
        this.user = user;
        this.type = type || '';
        this.element = element || '';
        this.stats = {
            normal: 0,
            critical: 0,
            lucky: 0,
            crit_lucky: 0,
            hpLessen: 0, 
            total: 0,
        };
        this.count = {
            normal: 0,
            critical: 0,
            lucky: 0,
            crit_lucky: 0,
            total: 0,
        };
        this.realtimeWindow = [];
        this.timeRange = [];
        this.realtimeStats = {
            value: 0,
            max: 0,
        };
        this.damageTimeline = [];
        this.maxTimelineSize = 600;
        this.maxDamage = 0;
        this.totalCrits = 0;
        this.totalLuckies = 0;
    }

    /** 添加数据记录
     * @param {number} value - 数值
     * @param {boolean} isCrit - 是否为暴击
     * @param {boolean} isLucky - 是否为幸运
     * @param {number} hpLessenValue - 生命值减少量（仅伤害使用）
     */
    addRecord(value, isCrit, isLucky, hpLessenValue = 0) {
        const now = Date.now();


        if (isCrit) {
            if (isLucky) {
                this.stats.crit_lucky += value;
            } else {
                this.stats.critical += value;
            }
        } else if (isLucky) {
            this.stats.lucky += value;
        } else {
            this.stats.normal += value;
        }
        this.stats.total += value;
        this.stats.hpLessen += hpLessenValue;

        if (isCrit) {
            this.count.critical++;
        }
        if (isLucky) {
            this.count.lucky++;
        }
        if (!isCrit && !isLucky) {
            this.count.normal++;
        }
        if (isCrit && isLucky) {
            this.count.crit_lucky++;
        }
        this.count.total++;

        this.realtimeWindow.push({
            time: now,
            value,
        });

        this.damageTimeline.push({
            time: now,
            value,
            isCrit,
            isLucky
        });

        if (this.damageTimeline.length > this.maxTimelineSize) {
            this.damageTimeline.shift();
        }

        if (value > this.maxDamage) {
            this.maxDamage = value;
        }

        if (isCrit) {
            this.totalCrits++;
        }

        if (isLucky) {
            this.totalLuckies++;
        }

        if (this.timeRange[0]) {
            this.timeRange[1] = now;
        } else {
            this.timeRange[0] = now;
        }
    }

    updateRealtimeStats() {
        const now = Date.now();
        
        // Calculate delta damage since last update
        const currentTotal = this.stats.total;
        const lastTotal = this.lastRealtimeTotal || 0;
        const deltaDamage = currentTotal - lastTotal;
        this.lastRealtimeTotal = currentTotal;
        
        // Add delta damage entry with current timestamp
        if (deltaDamage > 0) {
            this.realtimeWindow.push({ time: now, value: deltaDamage });
        }
        
        // Remove entries older than 1 second (1000ms)
        while (this.realtimeWindow.length > 0 && (now - this.realtimeWindow[0].time) > 1000) {
            this.realtimeWindow.shift();
        }

        // Sum all delta damage in the 1-second window = current DPS
        // DPS = Damage Per Second, so summing all deltas in last 1 second = current DPS
        this.realtimeStats.value = 0;
        for (const entry of this.realtimeWindow) {
            this.realtimeStats.value += entry.value;
        }
        
        // Track maximum DPS spike ever reached
        if (this.realtimeStats.value > this.realtimeStats.max) {
            this.realtimeStats.max = this.realtimeStats.value;
        }
    }


    getTotalPerSecond() {
        if (!this.timeRange[0] || !this.timeRange[1]) {
            return 0;
        }
        const totalPerSecond = (this.stats.total / (this.timeRange[1] - this.timeRange[0])) * 1000 || 0;
        if (!Number.isFinite(totalPerSecond)) return 0;
        return totalPerSecond;
    }

    reset() {
        this.stats = {
            normal: 0,
            critical: 0,
            lucky: 0,
            crit_lucky: 0,
            hpLessen: 0,
            total: 0,
        };
        this.count = {
            normal: 0,
            critical: 0,
            lucky: 0,
            crit_lucky: 0,
            total: 0,
        };
        this.realtimeWindow = [];
        this.timeRange = [];
        this.realtimeStats = {
            value: 0,
            max: 0,
        };
        this.damageTimeline = [];
        this.maxDamage = 0;
        this.totalCrits = 0;
        this.totalLuckies = 0;
    }
}

class UserData {
    constructor(uid) {
        this.uid = uid;
        this.name = '';
        this.damageStats = new StatisticData(this, '伤害');
        this.healingStats = new StatisticData(this, '治疗');
        this.takenDamage = 0;
        this.deadCount = 0;
        this.profession = '未知';
        this.skillUsage = new Map();
        this.fightPoint = 0;
        this.subProfession = '';
        this.attr = {};
        this.buffTracker = new Map();
        this.skillSequence = [];
        this.combatLog = [];
        this.combatStartTime = null;
        this.maxSkillSequence = 120;
        this.maxCombatLog = 1000;
    }

    /** 添加伤害记录
     * @param {number} skillId - 技能ID/Buff ID
     * @param {string} element - 技能元素属性
     * @param {number} damage - 伤害值
     * @param {boolean} isCrit - 是否为暴击
     * @param {boolean} [isLucky] - 是否为幸运
     * @param {boolean} [isCauseLucky] - 是否造成幸运
     * @param {number} hpLessenValue - 生命值减少量
     */
    addDamage(skillId, element, damage, isCrit, isLucky, isCauseLucky, hpLessenValue = 0) {
        this.damageStats.addRecord(damage, isCrit, isLucky, hpLessenValue);
        if (!this.skillUsage.has(skillId)) {
            this.skillUsage.set(skillId, new StatisticData(this, '伤害', element));
        }
        this.skillUsage.get(skillId).addRecord(damage, isCrit, isCauseLucky, hpLessenValue);
        this.skillUsage.get(skillId).realtimeWindow.length = 0;

        this.logSkillSequence(skillId, element, damage, isCrit);

        const subProfession = getSubProfessionBySkillId(skillId);
        if (subProfession) {
            this.setSubProfession(subProfession);
        }
    }

    /** 添加治疗记录
     * @param {number} skillId - 技能ID/Buff ID
     * @param {string} element - 技能元素属性
     * @param {number} healing - 治疗值
     * @param {boolean} isCrit - 是否为暴击
     * @param {boolean} [isLucky] - 是否为幸运
     * @param {boolean} [isCauseLucky] - 是否造成幸运
     */
    addHealing(skillId, element, healing, isCrit, isLucky, isCauseLucky) {
        this.healingStats.addRecord(healing, isCrit, isLucky);
        // 记录技能使用情况
        skillId = skillId + 1000000000;
        if (!this.skillUsage.has(skillId)) {
            this.skillUsage.set(skillId, new StatisticData(this, '治疗', element));
        }
        this.skillUsage.get(skillId).addRecord(healing, isCrit, isCauseLucky);
        this.skillUsage.get(skillId).realtimeWindow.length = 0;

        this.logSkillSequence(skillId, element, healing, isCrit);

        const subProfession = getSubProfessionBySkillId(skillId - 1000000000);
        if (subProfession) {
            this.setSubProfession(subProfession);
        }
    }

    /** 添加承伤记录
     * @param {number} damage - 承受的伤害值
     * @param {boolean} isDead - 是否致死伤害
     * */
    addTakenDamage(damage, isDead) {
        this.takenDamage += damage;
        if (isDead) this.deadCount++;
    }

    updateRealtimeDps() {
        this.damageStats.updateRealtimeStats();
        this.healingStats.updateRealtimeStats();
    }

    getTotalDps() {
        return this.damageStats.getTotalPerSecond();
    }

    getTotalHps() {
        return this.healingStats.getTotalPerSecond();
    }

    getTotalCount() {
        return {
            normal: this.damageStats.count.normal + this.healingStats.count.normal,
            critical: this.damageStats.count.critical + this.healingStats.count.critical,
            lucky: this.damageStats.count.lucky + this.healingStats.count.lucky,
            crit_lucky: this.damageStats.count.crit_lucky + this.healingStats.count.crit_lucky,
            total: this.damageStats.count.total + this.healingStats.count.total,
        };
    }

    getSummary() {
        return {
            realtime_dps: this.damageStats.realtimeStats.value,
            realtime_dps_max: this.damageStats.realtimeStats.max,
            max_dps: this.damageStats.realtimeStats.max, // Max DPS ever reached
            current_dps: this.damageStats.realtimeStats.value, // Current DPS
            total_dps: this.getTotalDps(), // Average DPS
            total_damage: { ...this.damageStats.stats },
            total_count: this.getTotalCount(),
            realtime_hps: this.healingStats.realtimeStats.value,
            realtime_hps_max: this.healingStats.realtimeStats.max,
            total_hps: this.getTotalHps(),
            total_healing: { ...this.healingStats.stats },
            taken_damage: this.takenDamage,
            profession: this.profession + (this.subProfession ? `-${this.subProfession}` : ''),
            name: this.name,
            fightPoint: this.fightPoint,
            hp: this.attr.hp,
            max_hp: this.attr.max_hp,
            dead_count: this.deadCount,
            critRate: this.damageStats.count.total > 0 ? ((this.damageStats.totalCrits / this.damageStats.count.total) * 100) : 0,
            luckyRate: this.damageStats.count.total > 0 ? ((this.damageStats.totalLuckies / this.damageStats.count.total) * 100) : 0,
            maxDamage: this.damageStats.maxDamage,
            haste: this.attr.haste || 0, // Add haste stat
            mastery: this.attr.mastery || 0, // Add mastery stat
            attr: { ...this.attr },
        };
    }

    getSkillSummary() {
        const skills = {};
        for (const [skillId, stat] of this.skillUsage) {
            const total = stat.stats.normal + stat.stats.critical + stat.stats.lucky + stat.stats.crit_lucky;
            const critCount = stat.count.critical;
            const luckyCount = stat.count.lucky;
            const critRate = stat.count.total > 0 ? critCount / stat.count.total : 0;
            const luckyRate = stat.count.total > 0 ? luckyCount / stat.count.total : 0;
            const name = skillNames.skill_names?.[skillId % 1000000000] ?? skillId % 1000000000;
            const elementype = stat.element;

            skills[skillId] = {
                displayName: name,
                type: stat.type,
                elementype: elementype,
                totalDamage: stat.stats.total,
                totalCount: stat.count.total,
                critCount: stat.count.critical,
                luckyCount: stat.count.lucky,
                critRate: critRate,
                luckyRate: luckyRate,
                damageBreakdown: { ...stat.stats },
                countBreakdown: { ...stat.count },
            };
        }
        return skills;
    }

    logSkillSequence(skillId, displayName, amount, isCrit) {
        const now = Date.now();
        if (!this.combatStartTime) {
            this.combatStartTime = now;
        }

        this.skillSequence.push({
            skillId,
            name: displayName || `Skill_${skillId}`,
            amount,
            isCrit,
            time: now,
            relativeTime: now - this.combatStartTime
        });

        if (this.skillSequence.length > this.maxSkillSequence) {
            this.skillSequence.shift();
        }

        this.combatLog.push({
            type: 'skill',
            skillId,
            name: displayName || `Skill_${skillId}`,
            amount,
            isCrit,
            time: now
        });

        if (this.combatLog.length > this.maxCombatLog) {
            this.combatLog.shift();
        }
    }

    addBuff(buffId, buffName, duration, stacks = 1) {
        const now = Date.now();
        if (!this.combatStartTime) {
            this.combatStartTime = now;
        }

        const existing = this.buffTracker.get(buffId) || {
            name: buffName,
            totalUptime: 0,
            applications: 0,
            lastApplied: now,
            stacks,
            duration
        };

        existing.applications += 1;
        existing.lastApplied = now;
        existing.stacks = stacks;
        existing.duration = duration ?? existing.duration;

        this.buffTracker.set(buffId, existing);

        this.combatLog.push({
            type: 'buff_applied',
            buffId,
            buffName,
            stacks,
            duration,
            time: now
        });

        if (this.combatLog.length > this.maxCombatLog) {
            this.combatLog.shift();
        }
    }

    removeBuff(buffId) {
        const buff = this.buffTracker.get(buffId);
        if (!buff) return;

        const now = Date.now();
        const uptime = now - buff.lastApplied;
        buff.totalUptime += uptime;
        buff.lastApplied = now;

        this.combatLog.push({
            type: 'buff_removed',
            buffId,
            buffName: buff.name,
            uptime,
            time: now
        });

        if (this.combatLog.length > this.maxCombatLog) {
            this.combatLog.shift();
        }
    }

    getDamageTimeline(interval = 1000) {
        const buckets = new Map();
        for (const entry of this.damageStats.damageTimeline) {
            const bucket = Math.floor(entry.time / interval) * interval;
            if (!buckets.has(bucket)) {
                buckets.set(bucket, {
                    time: bucket,
                    damage: 0,
                    hits: 0,
                    crits: 0,
                    luckies: 0
                });
            }

            const bucketData = buckets.get(bucket);
            bucketData.damage += entry.value;
            bucketData.hits += 1;
            if (entry.isCrit) bucketData.crits += 1;
            if (entry.isLucky) bucketData.luckies += 1;
        }

        return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
    }

    getBuffAnalysis() {
        const now = Date.now();
        const duration = this.combatStartTime ? now - this.combatStartTime : 0;
        const report = {};

        for (const [buffId, buff] of this.buffTracker.entries()) {
            const uptime = duration > 0 ? ((buff.totalUptime / duration) * 100) : 0;
            report[buffId] = {
                name: buff.name,
                uptimePercent: uptime,
                totalApplications: buff.applications,
                stacks: buff.stacks,
                averageDuration: buff.applications > 0 ? buff.totalUptime / buff.applications : 0
            };
        }

        return report;
    }

    getOpenerAnalysis(windowMs = 30000) {
        return this.skillSequence.filter((entry) => entry.relativeTime <= windowMs);
    }

    getCombatLog() {
        return [...this.combatLog];
    }

    /** 设置职业
     * @param {string} profession - 职业名称
     * */
    setProfession(profession) {
        if (profession !== this.profession) this.setSubProfession('');
        this.profession = profession;
    }

    /** 设置子职业
     * @param {string} subProfession - 子职业名称
     * */
    setSubProfession(subProfession) {
        this.subProfession = subProfession;
    }

    /** 设置姓名
     * @param {string} name - 姓名
     * */
    setName(name) {
        this.name = name;
    }

    /** 设置用户总评分
     * @param {number} fightPoint - 总评分
     */
    setFightPoint(fightPoint) {
        this.fightPoint = fightPoint;
    }

    /** 设置额外数据
     * @param {string} key
     * @param {any} value
     */
    setAttrKV(key, value) {
        this.attr[key] = value;
    }

    /** 重置数据 预留 */
    reset() {
        this.damageStats.reset();
        this.healingStats.reset();
        this.takenDamage = 0;
        this.skillUsage.clear();
        this.fightPoint = 0;
        this.buffTracker.clear();
        this.skillSequence = [];
        this.combatLog = [];
        this.combatStartTime = null;
    }
}

class UserDataManager {
    constructor(logger, globalSettings, appVersion, userDataPath) {
        this.logger = logger;
        this.globalSettings = globalSettings; // Almacenar globalSettings
        this.appVersion = appVersion;
        // Use userDataPath if provided (from Electron), otherwise fall back to __dirname
        const basePath = userDataPath || path.join(__dirname, '..', '..');
        this.userDataPath = basePath;
        this.playerMapPath = path.join(basePath, 'player_map.json');
        
        this.users = new Map();
        this.enemies = new Map();
        this.partyMembers = new Set();
        this.raidGroups = new Map();
        this.startTime = Date.now();
        this.lastAutoSaveTime = 0; // Track last periodic auto-save time
        this.playerMap = new Map(); // UID -> Name cache
        this.playerMapDirty = false;
        this.playerMapLock = new Lock();
        this.userCache = new Map(); // UID -> cached user data (profession, fightPoint)
        this.localPlayerUid = null;
        this.lastPlayerCount = 0;
        this.zoneChangeDetected = false;
        
        this.hpCache = new Map();
        
        // Initialize skill translation manager (will be loaded in initialize())
        this.skillTranslations = new SkillTranslationManager(logger, userDataPath);

        this.logLock = new Lock();
        this.logDirExist = new Set();

        this.enemyCache = {
            name: new Map(),
            hp: new Map(),
            maxHp: new Map(),
        };
        this.localPlayerUid = null; // Track local player UID for solo mode
        this.partyMembers = new Set(); // Track party member UIDs
        this.raidMembers = new Map(); // Map of raid groups: groupId -> Set of UIDs
    }

    async initialize() {
        // Initialize skill translations first
        try {
            await this.skillTranslations.initialize();
        } catch (err) {
            this.logger.error('Failed to initialize skill translations:', err);
        }
        
        // Load player_map.json for name caching (async, non-blocking)
        this.loadPlayerMap(); // Don't await - load in background
        
        // Save player map periodically (every 30 seconds if dirty)
        setInterval(async () => {
            if (this.playerMapDirty) {
                await this.savePlayerMap();
            }
        }, 30000);
        
        // Cleanup old history logs on startup (once per app launch)
        setTimeout(async () => {
            // Safety check in case method doesn't exist in older versions
            if (typeof this.cleanupOldHistoryLogs === 'function') {
                await this.cleanupOldHistoryLogs();
            }
        }, 5000); // Wait 5 seconds after startup to avoid blocking
        
        // CRITICAL: Periodic auto-save every 2 minutes if there's active combat data
        // This ensures sessions are saved even without character switches
        setInterval(async () => {
            const now = Date.now();
            const timeSinceStart = now - this.startTime;
            const timeSinceLastSave = now - (this.lastAutoSaveTime || this.startTime);
            
            this.logger.info(`⏱️ Auto-save check: users=${this.users.size}, timeSinceStart=${Math.floor(timeSinceStart/1000)}s, timeSinceLastSave=${Math.floor(timeSinceLastSave/1000)}s`);
            
            if (this.users.size > 0) {
                // Auto-save if:
                // 1. At least 30 seconds have passed since combat started (not just random hits)
                // 2. At least 2 minutes since last auto-save
                if (timeSinceStart > 30000 && timeSinceLastSave > 120000) {
                    this.logger.info(`⏰ Periodic auto-save triggered (2min interval) - Saving ${this.users.size} players`);
                    // Safety check in case method doesn't exist
                    if (typeof this.autoSaveSession === 'function') {
                        try {
                            await this.autoSaveSession();
                            this.lastAutoSaveTime = now;
                            this.logger.info(`✅ Periodic auto-save completed successfully`);
                        } catch (error) {
                            this.logger.error(`❌ Periodic auto-save failed:`, error);
                        }
                    } else {
                        this.logger.error(`❌ autoSaveSession is not a function!`);
                    }
                } else {
                    this.logger.info(`⏸️ Auto-save skipped: timeSinceStart=${Math.floor(timeSinceStart/1000)}s (need >30s), timeSinceLastSave=${Math.floor(timeSinceLastSave/1000)}s (need >120s)`);
                }
            }
        }, 60000); // Check every 60 seconds
    }
    
    /** Load player names from player_map.json */
    async loadPlayerMap() {
        try {
            this.logger.debug(`Loading player map from: ${this.playerMapPath}`);
            const data = await fsPromises.readFile(this.playerMapPath, 'utf8');
            const playerMapObj = JSON.parse(data);
            for (const [uid, name] of Object.entries(playerMapObj)) {
                this.playerMap.set(uid, name);
            }
            this.logger.info(`✅ Loaded ${this.playerMap.size} player names from cache (${this.playerMapPath})`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.logger.info(`No player_map.json found at ${this.playerMapPath}, starting fresh`);
            } else if (error instanceof SyntaxError) {
                this.logger.error(`Failed to parse player_map.json (corrupted JSON): ${error.message}`);
                this.logger.info('Starting with empty player map');
            } else {
                this.logger.error(`Failed to load player_map.json from ${this.playerMapPath}:`, error.message);
            }
        }
    }
    
    /** Save player names to player_map.json */
    async savePlayerMap() {
        try {
            const playerMapObj = {};
            for (const [uid, name] of this.playerMap.entries()) {
                playerMapObj[uid] = name;
            }
            await fsPromises.writeFile(this.playerMapPath, JSON.stringify(playerMapObj, null, 2), 'utf8');
            this.playerMapDirty = false;
            this.logger.info(`💾 Saved ${this.playerMap.size} player names to ${this.playerMapPath}`);
        } catch (error) {
            this.logger.error(`Failed to save player_map.json to ${this.playerMapPath}:`, error.message);
        }
    }
    /** Get or create user
     * @param {number} uid - User ID
     * @returns {UserData} - User data instance
     */
    getUser(uid) {
        if (!this.users.has(uid)) {
            const user = new UserData(uid);
            const uidStr = String(uid);
            const cachedData = this.userCache.get(uidStr);
            if (this.playerMap.has(uidStr)) {
                user.setName(this.playerMap.get(uidStr));
            }
            if (cachedData) {
                if (cachedData.name) {
                    user.setName(cachedData.name);
                }
                // Profession is no longer loaded from user cache
                if (cachedData.fightPoint !== undefined && cachedData.fightPoint !== null) {
                    user.setFightPoint(cachedData.fightPoint);
                }
                if (cachedData.maxHp !== undefined && cachedData.maxHp !== null) {
                    user.setAttrKV('max_hp', cachedData.maxHp);
                }
            }
            if (this.hpCache.has(uid)) {
                user.setAttrKV('hp', this.hpCache.get(uid));
            }

            this.users.set(uid, user);
        }
        return this.users.get(uid);
    }

    /** Add damage record
     * @param {number} uid - ID of the user dealing damage
     * @param {number} skillId - Skill/Buff ID
     * @param {string} element - Skill's elemental attribute
     * @param {number} damage - Damage value
     * @param {boolean} isCrit - If it's critical
     * @param {boolean} [isLucky] - If it's lucky
     * @param {boolean} [isCauseLucky] - If it causes luck
     * @param {number} hpLessenValue - Real HP reduction
     * @param {number} targetUid - Target's ID
     */
    addDamage(uid, skillId, element, damage, isCrit, isLucky, isCauseLucky, hpLessenValue = 0, targetUid) {
        // isPaused and globalSettings.onlyRecordEliteDummy will be handled in the sniffer or entry point
        this.checkCombatTimeout();
        const user = this.getUser(uid);
        user.addDamage(skillId, element, damage, isCrit, isLucky, isCauseLucky, hpLessenValue);
    }

    /** Add healing record
     * @param {number} uid - ID of the user performing healing
     * @param {number} skillId - Skill/Buff ID
     * @param {string} element - Skill's elemental attribute
     * @param {number} healing - Healing value
     * @param {boolean} isCrit - If it's critical
     * @param {boolean} [isLucky] - If it's lucky
     * @param {boolean} [isCauseLucky] - If it causes luck
     * @param {number} targetUid - Target's ID
     */
    addHealing(uid, skillId, element, healing, isCrit, isLucky, isCauseLucky, targetUid) {
        // isPaused will be handled in the sniffer or entry point
        this.checkCombatTimeout();
        if (uid !== 0) {
            const user = this.getUser(uid);
            user.addHealing(skillId, element, healing, isCrit, isLucky, isCauseLucky);
        }
    }

    /** Add taken damage record
     * @param {number} uid - ID of the user receiving damage
     * @param {number} damage - Damage received value
     * @param {boolean} isDead - If it's lethal damage
     * */
    addTakenDamage(uid, damage, isDead) {
        // isPaused will be handled in the sniffer or entry point
        this.checkCombatTimeout();
        const user = this.getUser(uid);
        user.addTakenDamage(damage, isDead);
    }

    /** Add log record
     * @param {string} log - Log content
     * */
    async addLog(log) {
        if (!this.globalSettings.enableFightLog) return;

        const logDir = path.join('./logs', String(this.startTime));
        const logFile = path.join(logDir, 'fight.log');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${log}\n`;

        await this.logLock.acquire();
        try {
            if (!this.logDirExist.has(logDir)) {
                try {
                    await fsPromises.access(logDir);
                } catch (error) {
                    await fsPromises.mkdir(logDir, { recursive: true });
                }
                this.logDirExist.add(logDir);
            }
            await fsPromises.appendFile(logFile, logEntry, 'utf8');
        } catch (error) {
            this.logger.error('Failed to save log:', error);
        }
        this.logLock.release();
    }

    /** Set user profession
     * @param {number} uid - User ID
     * @param {string} profession - Profession name
     * */
    setProfession(uid, profession) {
        const user = this.getUser(uid);
        if (user.profession !== profession) {
            user.setProfession(profession);
            this.logger.info(`Found profession ${profession} for uid ${uid}`);
        }
    }

    /** Set username
     * @param {number} uid - User ID
     * @param {string} name - Name
     * */
    setName(uid, name) {
        const user = this.getUser(uid);
        if (user.name !== name) {
            user.setName(name);
            this.logger.info(`Found player name ${name} for uid ${uid}`);
            
            // Cache the name in playerMap for future sessions (LRU - most recent at end)
            const uidStr = String(uid);
            if (!this.playerMap.has(uidStr) || this.playerMap.get(uidStr) !== name) {
                // Delete and re-add to move to end (LRU)
                if (this.playerMap.has(uidStr)) {
                    this.playerMap.delete(uidStr);
                }
                this.playerMap.set(uidStr, name);
                
                // Enforce max size (LRU eviction)
                if (this.playerMap.size > this.playerMapMaxSize) {
                    const firstKey = this.playerMap.keys().next().value;
                    this.playerMap.delete(firstKey);
                }
                
                this.playerMapDirty = true;
            }
        }
    }

    /** Set user fight score
     * @param {number} uid - User ID
     * @param {number} fightPoint - Fight score
     */
    setFightPoint(uid, fightPoint) {
        const user = this.getUser(uid);
        if (user.fightPoint != fightPoint) {
            user.setFightPoint(fightPoint);
            this.logger.info(`Found fight point ${fightPoint} for uid ${uid}`);
        }
    }

    /** Set additional data
     * @param {number} uid - User ID
     * @param {string} key
     * @param {any} value
     */
    setAttrKV(uid, key, value) {
        const user = this.getUser(uid);
        user.attr[key] = value;
    }

    /** Update real-time DPS and HPS for all users */
    updateAllRealtimeDps() {
        for (const user of this.users.values()) {
            user.updateRealtimeDps();
        }
    }

    /** Get user skill data
     * @param {number} uid - User ID
     */
    getUserSkillData(uid) {
        const user = this.users.get(uid);
        if (!user) return null;

        return {
            uid: user.uid,
            name: user.name,
            profession: user.profession + (user.subProfession ? `-${user.subProfession}` : ''),
            skills: user.getSkillSummary(),
            attr: user.attr,
        };
    }

    /** Get all users data */
    getAllUsersData() {
        const result = {};
        for (const [uid, user] of this.users.entries()) {
            const summary = user.getSummary();
            summary.isPartyMember = this.isPartyMember(uid);
            summary.raidGroup = this.getRaidGroup(uid);
            summary.isLocalPlayer = (uid === this.localPlayerUid);
            summary.damagePercent = this.calculateDamagePercent(uid);
            result[uid] = summary;
        }
        return result;
    }

    /** Set local player UID for solo mode */
    setLocalPlayerUid(uid) {
        if (this.localPlayerUid !== uid) {
            this.localPlayerUid = uid;
        }
    }

    /** Get solo user data (only local player) */
    getSoloUserData() {
        const result = {};

        if (this.localPlayerUid) {
            const localUser = this.users.get(this.localPlayerUid);
            if (localUser) {
                const summary = localUser.getSummary();
                summary.isLocalPlayer = true;
                summary.damagePercent = this.calculateDamagePercent(this.localPlayerUid);
                result[this.localPlayerUid] = summary;
            }
        }

        return result;
    }

    calculateDamagePercent(uid) {
        let total = 0;
        for (const user of this.users.values()) {
            total += user.damageStats.stats.total || 0;
        }

        if (total === 0) return 0;

        const user = this.users.get(uid);
        if (!user) return 0;

        return ((user.damageStats.stats.total || 0) / total) * 100;
    }

    /** Add party member */
    addPartyMember(uid) {
        this.partyMembers.add(uid);
    }

    /** Remove party member */
    removePartyMember(uid) {
        this.partyMembers.delete(uid);
    }

    /** Check if UID is party member */
    isPartyMember(uid) {
        return this.partyMembers.has(uid);
    }

    /** Clear party members */
    clearParty() {
        this.partyMembers.clear();
    }

    /** Set raid group */
    setRaidGroup(groupId, members) {
        this.raidMembers.set(groupId, new Set(members));
    }

    /** Get raid group for UID */
    getRaidGroup(uid) {
        for (const [groupId, members] of this.raidMembers.entries()) {
            if (members.has(uid)) {
                return groupId;
            }
        }
        return null;
    }

    /** Get all enemy cache data */
    getAllEnemiesData() {
        const result = {};
        const enemyIds = new Set([...this.enemyCache.name.keys(), ...this.enemyCache.hp.keys(), ...this.enemyCache.maxHp.keys()]);
        enemyIds.forEach((id) => {
            result[id] = {
                name: this.enemyCache.name.get(id),
                hp: this.enemyCache.hp.get(id),
                max_hp: this.enemyCache.maxHp.get(id),
            };
        });
        return result;
    }

    /** Clear enemy cache */
    refreshEnemyCache() {
        this.enemyCache.name.clear();
        this.enemyCache.hp.clear();
        this.enemyCache.maxHp.clear();
    }

    /** Get combat duration in milliseconds */
    getDuration() {
        return Date.now() - this.startTime;
    }

    /** Format duration in human-readable format */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /** Detect zone/map change based on player count */
    detectZoneChange(currentPlayerCount) {
        const now = Date.now();
        
        // Initialize tracking if not exists
        if (!this.zoneChangeTracking) {
            this.zoneChangeTracking = {
                lastPlayerCount: currentPlayerCount,
                highestPlayerCount: currentPlayerCount,
                lastSignificantDrop: 0,
                dropStartTime: 0
            };
        }
        
        // Track highest player count seen
        if (currentPlayerCount > this.zoneChangeTracking.highestPlayerCount) {
            this.zoneChangeTracking.highestPlayerCount = currentPlayerCount;
        }
        
        // Detect significant drop (dungeon entrance scenario)
        // Example: Open world 15+ players → Dungeon 5 players
        const hadManyPlayers = this.zoneChangeTracking.highestPlayerCount >= 8;
        const nowFewPlayers = currentPlayerCount > 0 && currentPlayerCount <= 5;
        const significantDrop = hadManyPlayers && nowFewPlayers;
        
        // If we detect a significant drop, wait 3 seconds to confirm it's stable
        if (significantDrop && this.zoneChangeTracking.dropStartTime === 0) {
            this.zoneChangeTracking.dropStartTime = now;
            this.logger.info(`🚪 Possible dungeon entrance detected: ${this.zoneChangeTracking.highestPlayerCount} → ${currentPlayerCount} players`);
        }
        
        // Confirm zone change if drop is sustained for 3 seconds
        const dropDuration = now - this.zoneChangeTracking.dropStartTime;
        const dropSustained = this.zoneChangeTracking.dropStartTime > 0 && dropDuration >= 3000;
        
        if (significantDrop && dropSustained && currentPlayerCount <= 5) {
            // Prevent spam - only trigger once per 30 seconds
            const timeSinceLastClear = now - this.zoneChangeTracking.lastSignificantDrop;
            if (timeSinceLastClear > 30000) {
                this.zoneChangeDetected = true;
                this.zoneChangeTracking.lastSignificantDrop = now;
                this.zoneChangeTracking.highestPlayerCount = currentPlayerCount;
                this.zoneChangeTracking.dropStartTime = 0;
                this.logger.info(`✅ Dungeon entrance confirmed - clearing old data (${currentPlayerCount} players now)`);
                return true;
            }
        }
        
        // Reset drop timer if player count increases again
        if (currentPlayerCount > 5) {
            this.zoneChangeTracking.dropStartTime = 0;
        }
        
        this.zoneChangeTracking.lastPlayerCount = currentPlayerCount;
        return false;
    }
    
    /** Reset zone change flag */
    resetZoneChangeFlag() {
        this.zoneChangeDetected = false;
    }
    
    /** Mark that server changed (called by sniffer) */
    markServerChanged() {
        serverChangeDetected = true;
        this.logger.info('🌐 Server change marked for frontend notification');
    }
    
    /** Check if server changed and reset flag */
    checkAndResetServerChange() {
        const changed = serverChangeDetected;
        if (changed) {
            serverChangeDetected = false;
            this.logger.info('✅ Server change flag sent to frontend and reset');
        }
        return changed;
    }

    /** Detect zone/boss from enemy data */
    detectZoneContext() {
        const enemies = this.getAllEnemiesData();
        const enemyNames = Object.values(enemies)
            .map(e => e.name)
            .filter(name => name && name !== '');
        
        if (enemyNames.length === 0) return null;
        
        // Check for training dummies
        if (enemyNames.some(name => name.includes('木桩') || name.includes('Dummy'))) {
            return '🎯 Training Dummy';
        }
        
        // Check for major bosses by name
        const bosses = [
            { names: ['利奥雷乌斯', 'Leorius'], label: '🔥 Leorius' },
            { names: ['卡特格里夫', 'Katergriff'], label: '⚔️ Katergriff' },
            { names: ['超级主战机像99型', 'Super Battle Mech'], label: '🤖 Super Battle Mech 99' },
            { names: ['哥布林王', 'Goblin King'], label: '👑 Goblin King' },
            { names: ['杰克', 'Jack'], label: '💀 Jack' }
        ];
        
        for (const boss of bosses) {
            if (enemyNames.some(name => boss.names.some(b => name.includes(b)))) {
                return boss.label;
            }
        }
        
        // Check for common enemy types to infer zone
        const hasGoblins = enemyNames.some(name => name.includes('哥布林') || name.includes('Goblin'));
        const hasMechs = enemyNames.some(name => name.includes('机像') || name.includes('Mech') || name.includes('保卫者') || name.includes('Defender'));
        const hasUndead = enemyNames.some(name => name.includes('亡灵') || name.includes('灵魂') || name.includes('Undead') || name.includes('Soul'));
        
        if (hasMechs) return '🏭 Machine Zone';
        if (hasUndead) return '💀 Undead Zone';
        if (hasGoblins) return '🗡️ Goblin Territory';
        
        // Return first enemy name if no pattern matched
        return `⚔️ ${enemyNames[0]}`;
    }

    /** Automatically save current session before clearing */
    async autoSaveSession() {
        try {
            const timestamp = Date.now();
            const userData = this.getAllUsersData();
            const players = Object.entries(userData).map(([uid, summary]) => ({
                uid: Number(uid),
                ...summary
            }));

            if (players.length === 0) return; // Don't save empty sessions

            // Detect zone/boss context
            const zoneContext = this.detectZoneContext();
            const duration = this.getDuration();
            
            // Format: MM/DD HH:MM AM/PM - Zone/Boss - Duration (X players)
            const date = new Date(timestamp);
            const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const durationStr = duration > 0 ? this.formatDuration(duration) : '0s';
            const zoneName = zoneContext || 'Battle';
            const sessionName = `${dateStr} ${timeStr} - ${zoneName} - ${durationStr} (${players.length}p)`;
            
            const sessionData = {
                id: timestamp,
                name: sessionName,
                timestamp: timestamp,
                players: players,
                totalDps: players.reduce((sum, p) => sum + (p.total_dps || 0), 0),
                playerCount: players.length,
                duration: duration,
                autoSaved: true,
                zoneContext: zoneContext // Store for future filtering
            };

            // Use userDataPath for packaged app compatibility
            const sessionsDir = path.join(this.userDataPath, 'sessions');
            
            // Ensure sessions directory exists
            await fsPromises.mkdir(sessionsDir, { recursive: true });

            // Save session
            const filePath = path.join(sessionsDir, `${timestamp}.json`);
            await fsPromises.writeFile(filePath, JSON.stringify(sessionData, null, 2));

            // Clean up old auto-saved sessions (keep only 20)
            await this.cleanupOldSessions();

            this.logger.info(`💾 Auto-saved session: ${players.length} players, ${sessionData.totalDps.toLocaleString()} DPS`);
        } catch (error) {
            this.logger.error('Failed to auto-save session:', error.message, error.stack);
        }
    }

    /** Clean up old auto-saved sessions, keeping only the last 20 */
    async cleanupOldSessions() {
        try {
            const sessionsDir = path.join(this.userDataPath, 'sessions');
            const files = await fsPromises.readdir(sessionsDir);
            
            // Read all session files and separate auto-saved from manual
            const sessionFiles = [];
            for (const file of files) {
                if (!file.endsWith('.json')) continue;
                
                try {
                    const filePath = path.join(sessionsDir, file);
                    const data = JSON.parse(await fsPromises.readFile(filePath, 'utf8'));
                    sessionFiles.push({
                        name: file,
                        timestamp: parseInt(file.replace('.json', '')),
                        autoSaved: data.autoSaved || false
                    });
                } catch (error) {
                    // Skip corrupted files
                    continue;
                }
            }
            
            // Only cleanup auto-saved sessions (keep last 20)
            const autoSavedSessions = sessionFiles
                .filter(f => f.autoSaved)
                .sort((a, b) => b.timestamp - a.timestamp);

            if (autoSavedSessions.length > 20) {
                const filesToDelete = autoSavedSessions.slice(20);
                for (const file of filesToDelete) {
                    await fsPromises.unlink(path.join(sessionsDir, file.name));
                }
                this.logger.debug(`Cleaned up ${filesToDelete.length} old auto-saved sessions (keeping last 20)`);
            }
        } catch (error) {
            this.logger.warn('Failed to cleanup old sessions:', error);
        }
    }

    /** Limpiar todos los datos de usuario */
    async clearAll() {
        // CRITICAL: Must AWAIT auto-save before resetting startTime to avoid race condition
        // Otherwise getDuration() reads the NEW startTime and duration becomes 0!
        if (this.users.size > 0 && this.globalSettings.keepDataAfterDungeon !== false) {
            try {
                await this.autoSaveSession();
            } catch (error) {
                this.logger.warn('Failed to auto-save session before clearing:', error.message);
            }
        }
        
        this.users = new Map();
        this.startTime = Date.now();
        this.lastAutoSaveTime = 0; // Reset auto-save timer
        this.resetZoneChangeFlag();
    }

    /** Get list of user IDs */
    getUserIds() {
        return Array.from(this.users.keys());
    }

    /** Save all user data to history
     * @param {Map} usersToSave - Map of user data to save
     * @param {number} startTime - Start time of the data
     */
    async saveAllUserData(usersToSave = null, startTime = null) {
        if (!this.globalSettings.enableHistorySave) return; // Don't save history if setting is disabled

        try {
            const endTime = Date.now();
            const users = usersToSave || this.users;
            const timestamp = startTime || this.startTime;
            const logDir = path.join('./logs', String(timestamp));
            const usersDir = path.join(logDir, 'users');
            const summary = {
                startTime: timestamp,
                endTime,
                duration: endTime - timestamp,
                userCount: users.size,
                version: this.appVersion,
            };

            const allUsersData = {};
            const userDatas = new Map();
            for (const [uid, user] of users.entries()) {
                allUsersData[uid] = user.getSummary();

                const userData = {
                    uid: user.uid,
                    name: user.name,
                    profession: user.profession + (user.subProfession ? `-${user.subProfession}` : ''),
                    skills: user.getSkillSummary(),
                    attr: user.attr,
                };
                userDatas.set(uid, userData);
            }

            try {
                await fsPromises.access(usersDir);
            } catch (error) {
                await fsPromises.mkdir(usersDir, { recursive: true });
            }

            // Guardar resumen de todos los datos de usuario
            const allUserDataPath = path.join(logDir, 'allUserData.json');
            await fsPromises.writeFile(allUserDataPath, JSON.stringify(allUsersData, null, 2), 'utf8');

            // Guardar datos detallados de cada usuario
            for (const [uid, userData] of userDatas.entries()) {
                const userDataPath = path.join(usersDir, `${uid}.json`);
                await fsPromises.writeFile(userDataPath, JSON.stringify(userData, null, 2), 'utf8');
            }

            await fsPromises.writeFile(path.join(logDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');

            this.logger.debug(`Saved data for ${summary.userCount} users to ${logDir}`);
            
            // Cleanup old history logs after saving new one
            if (typeof this.cleanupOldHistoryLogs === 'function') {
                await this.cleanupOldHistoryLogs();
            }
        } catch (error) {
            this.logger.error('Failed to save all user data:', error);
            throw error;
        }
    }

    /** Check if combat has timed out and clear data if needed */
    async checkCombatTimeout() {
        if (this.users.size === 0) return; // No data to check
        
        const currentTime = Date.now();
        
        // CRITICAL FIX: Changed from 20s to 60s to prevent mid-combat clears
        // Boss mechanics, transitions, and brief pauses should NOT clear data
        const COMBAT_TIMEOUT = 60000; // 60 seconds
        
        if (this.lastLogTime && currentTime - this.lastLogTime > COMBAT_TIMEOUT) {
            // Additional safety: Only clear if we have no recent activity
            const hasRecentActivity = Array.from(this.users.values()).some(user => {
                return user.combatStartTime && (currentTime - user.combatStartTime) < COMBAT_TIMEOUT;
            });
            
            if (!hasRecentActivity) {
                await this.clearAll();
                this.logger.info(`⏱️ Combat timeout (${COMBAT_TIMEOUT/1000}s idle) - Statistics cleared`);
            } else {
                this.logger.debug('Combat timeout check: Recent activity detected, skipping clear');
            }
        }
    }
}

module.exports = { StatisticData, UserData, UserDataManager, Lock, getSubProfessionBySkillId };
