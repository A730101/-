/**
 * Achievement 模組 - 成就系統
 */
class Achievement {
    constructor(id, name, description, icon, condition) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.condition = condition; // 完成條件函數
        this.unlocked = false;
        this.unlockedDate = null;
        this.progress = 0; // 進度（0-100）
    }

    /**
     * 檢查是否達成成就
     */
    check(gameState) {
        if (this.unlocked) return false;

        const result = this.condition(gameState);

        if (typeof result === 'boolean') {
            if (result) {
                this.unlock();
                return true;
            }
        } else if (typeof result === 'object') {
            // 支援進度追蹤
            this.progress = Math.min(100, result.progress || 0);
            if (result.unlocked) {
                this.unlock();
                return true;
            }
        }

        return false;
    }

    /**
     * 解鎖成就
     */
    unlock() {
        this.unlocked = true;
        this.unlockedDate = new Date().toISOString();
        this.progress = 100;
    }

    /**
     * 獲取狀態
     */
    getState() {
        return {
            id: this.id,
            unlocked: this.unlocked,
            unlockedDate: this.unlockedDate,
            progress: this.progress
        };
    }

    /**
     * 載入狀態
     */
    loadState(state) {
        this.unlocked = state.unlocked || false;
        this.unlockedDate = state.unlockedDate || null;
        this.progress = state.progress || 0;
    }
}

/**
 * AchievementManager - 成就管理器
 */
class AchievementManager {
    constructor() {
        this.achievements = [];
        this.newUnlocks = []; // 新解鎖的成就（用於顯示通知）
        this.initAchievements();
    }

    /**
     * 初始化成就列表
     */
    initAchievements() {
        this.achievements = [
            // 基礎成就
            new Achievement(
                'first_blood',
                '首次擊破',
                '摧毀第一個磚塊',
                '🎯',
                (state) => state.stats.bricksDestroyed >= 1
            ),
            new Achievement(
                'first_win',
                '初次勝利',
                '完成第一關',
                '🏆',
                (state) => state.level >= 2
            ),
            new Achievement(
                'survivor',
                '生存者',
                '生命值從未低於 2',
                '❤️',
                (state) => state.level >= 5 && state.lives >= 2
            ),

            // 分數成就
            new Achievement(
                'score_1k',
                '得分新手',
                '累積分數達到 1,000',
                '⭐',
                (state) => state.score >= 1000
            ),
            new Achievement(
                'score_5k',
                '得分高手',
                '累積分數達到 5,000',
                '🌟',
                (state) => state.score >= 5000
            ),
            new Achievement(
                'score_10k',
                '得分大師',
                '累積分數達到 10,000',
                '💫',
                (state) => state.score >= 10000
            ),

            // 關卡成就
            new Achievement(
                'level_5',
                '初出茅廬',
                '到達第 5 關',
                '🎮',
                (state) => state.level >= 5
            ),
            new Achievement(
                'level_10',
                '漸入佳境',
                '到達第 10 關',
                '🎯',
                (state) => state.level >= 10
            ),
            new Achievement(
                'level_20',
                '遊戲達人',
                '到達第 20 關',
                '👑',
                (state) => state.level >= 20
            ),

            // 連擊成就
            new Achievement(
                'combo_5',
                '連擊新手',
                '達成 5 連擊',
                '🔥',
                (state) => state.combo.maxCombo >= 5
            ),
            new Achievement(
                'combo_10',
                '連擊高手',
                '達成 10 連擊',
                '💥',
                (state) => state.combo.maxCombo >= 10
            ),
            new Achievement(
                'combo_20',
                '連擊大師',
                '達成 20 連擊',
                '⚡',
                (state) => state.combo.maxCombo >= 20
            ),

            // 道具成就
            new Achievement(
                'collector',
                '道具收集者',
                '收集 10 個道具',
                '🎁',
                (state) => state.stats.powerupsCollected >= 10
            ),
            new Achievement(
                'lucky',
                '幸運星',
                '獲得 5 個生命道具',
                '🍀',
                (state) => state.stats.lifeCount >= 5
            ),

            // Boss 成就
            new Achievement(
                'boss_killer',
                'Boss 殺手',
                '擊敗第一個 Boss',
                '⚔️',
                (state) => state.stats.bossesDefeated >= 1
            ),
            new Achievement(
                'boss_slayer',
                'Boss 屠夫',
                '擊敗 5 個 Boss',
                '🗡️',
                (state) => state.stats.bossesDefeated >= 5
            ),

            // 技能成就
            new Achievement(
                'skill_master',
                '技能大師',
                '使用技能 20 次',
                '✨',
                (state) => state.stats.skillsUsed >= 20
            ),

            // 特殊成就
            new Achievement(
                'perfectionist',
                '完美主義者',
                '用一顆球完成一關',
                '💎',
                (state) => state.stats.oneBallClear
            ),
            new Achievement(
                'speed_runner',
                '速通玩家',
                '在 30 秒內完成一關',
                '⚡',
                (state) => state.stats.fastestClear <= 30
            ),
            new Achievement(
                'no_damage',
                '毫髮無傷',
                '連續完成 3 關不失去生命',
                '🛡️',
                (state) => state.stats.noDamageStreak >= 3
            ),

            // 磚塊成就
            new Achievement(
                'destroyer',
                '破壞者',
                '摧毀 100 個磚塊',
                '💣',
                (state) => ({
                    unlocked: state.stats.bricksDestroyed >= 100,
                    progress: (state.stats.bricksDestroyed / 100) * 100
                })
            ),
            new Achievement(
                'annihilator',
                '殲滅者',
                '摧毀 500 個磚塊',
                '💥',
                (state) => ({
                    unlocked: state.stats.bricksDestroyed >= 500,
                    progress: (state.stats.bricksDestroyed / 500) * 100
                })
            )
        ];
    }

    /**
     * 檢查所有成就
     */
    checkAchievements(gameState) {
        this.newUnlocks = [];

        this.achievements.forEach(achievement => {
            if (achievement.check(gameState)) {
                this.newUnlocks.push(achievement);
            }
        });

        return this.newUnlocks;
    }

    /**
     * 獲取新解鎖的成就
     */
    getNewUnlocks() {
        const unlocks = [...this.newUnlocks];
        this.newUnlocks = [];
        return unlocks;
    }

    /**
     * 獲取已解鎖的成就
     */
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }

    /**
     * 獲取解鎖進度
     */
    getProgress() {
        const total = this.achievements.length;
        const unlocked = this.getUnlockedAchievements().length;
        return {
            unlocked,
            total,
            percentage: Math.floor((unlocked / total) * 100)
        };
    }

    /**
     * 獲取所有成就
     */
    getAllAchievements() {
        return this.achievements;
    }

    /**
     * 重置所有成就
     */
    reset() {
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            achievement.unlockedDate = null;
            achievement.progress = 0;
        });
        this.newUnlocks = [];
    }

    /**
     * 獲取狀態（用於存檔）
     */
    getState() {
        return this.achievements.map(a => a.getState());
    }

    /**
     * 載入狀態（用於讀檔）
     */
    loadState(state) {
        if (!state || !Array.isArray(state)) return;

        state.forEach(achievementState => {
            const achievement = this.achievements.find(a => a.id === achievementState.id);
            if (achievement) {
                achievement.loadState(achievementState);
            }
        });
    }
}

/**
 * GameStats - 遊戲統計數據
 */
class GameStats {
    constructor() {
        this.bricksDestroyed = 0;
        this.powerupsCollected = 0;
        this.lifeCount = 0;
        this.bossesDefeated = 0;
        this.skillsUsed = 0;
        this.oneBallClear = false;
        this.fastestClear = Infinity;
        this.noDamageStreak = 0;
        this.currentLevelTime = 0;
        this.currentLevelBalls = 1;
    }

    /**
     * 重置關卡統計
     */
    resetLevelStats() {
        this.currentLevelTime = 0;
        this.currentLevelBalls = 1;
        this.oneBallClear = false;
    }

    /**
     * 獲取狀態
     */
    getState() {
        return {
            bricksDestroyed: this.bricksDestroyed,
            powerupsCollected: this.powerupsCollected,
            lifeCount: this.lifeCount,
            bossesDefeated: this.bossesDefeated,
            skillsUsed: this.skillsUsed,
            oneBallClear: this.oneBallClear,
            fastestClear: this.fastestClear,
            noDamageStreak: this.noDamageStreak
        };
    }

    /**
     * 載入狀態
     */
    loadState(state) {
        if (!state) return;

        this.bricksDestroyed = state.bricksDestroyed || 0;
        this.powerupsCollected = state.powerupsCollected || 0;
        this.lifeCount = state.lifeCount || 0;
        this.bossesDefeated = state.bossesDefeated || 0;
        this.skillsUsed = state.skillsUsed || 0;
        this.oneBallClear = state.oneBallClear || false;
        this.fastestClear = state.fastestClear || Infinity;
        this.noDamageStreak = state.noDamageStreak || 0;
    }
}
