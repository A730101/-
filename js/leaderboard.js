/**
 * Leaderboard 模組 - 排行榜系統
 */
class LeaderboardManager {
    constructor() {
        this.storageKey = 'brickBreaker_leaderboard';

        // 初始化排行榜數據
        this.records = this.loadRecords() || {
            highScore: {
                score: 0,
                level: 1,
                date: null,
                playerName: '未命名'
            },
            fastestClear: {
                time: Infinity,
                level: 1,
                date: null,
                playerName: '未命名'
            },
            maxCombo: {
                combo: 0,
                level: 1,
                date: null,
                playerName: '未命名'
            },
            noDamageStreak: {
                streak: 0,
                date: null,
                playerName: '未命名'
            },
            maxLevel: {
                level: 1,
                score: 0,
                date: null,
                playerName: '未命名'
            },
            totalBricksDestroyed: 0,
            totalGamesPlayed: 0,
            totalPlayTime: 0, // 秒
            skillsUsed: {
                slowtime: 0,
                laser: 0,
                shield: 0
            },
            powerupsCollected: 0,
            bossesDefeated: 0,
            achievementsUnlocked: 0,
            // 前10名最高分記錄
            topScores: []
        };

        this.currentPlayerName = this.loadPlayerName() || '玩家';
    }

    /**
     * 載入記錄
     */
    loadRecords() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('載入排行榜失敗:', e);
            return null;
        }
    }

    /**
     * 儲存記錄
     */
    saveRecords() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.records));
        } catch (e) {
            console.error('儲存排行榜失敗:', e);
        }
    }

    /**
     * 載入玩家名稱
     */
    loadPlayerName() {
        try {
            return localStorage.getItem('brickBreaker_playerName') || '玩家';
        } catch (e) {
            return '玩家';
        }
    }

    /**
     * 設定玩家名稱
     */
    setPlayerName(name) {
        this.currentPlayerName = name || '玩家';
        try {
            localStorage.setItem('brickBreaker_playerName', this.currentPlayerName);
        } catch (e) {
            console.error('儲存玩家名稱失敗:', e);
        }
    }

    /**
     * 更新最高分
     */
    updateHighScore(score, level) {
        if (score > this.records.highScore.score) {
            this.records.highScore = {
                score: score,
                level: level,
                date: new Date().toISOString(),
                playerName: this.currentPlayerName
            };
            this.saveRecords();
            return true;
        }
        return false;
    }

    /**
     * 更新最快通關
     */
    updateFastestClear(time, level) {
        if (time < this.records.fastestClear.time) {
            this.records.fastestClear = {
                time: time,
                level: level,
                date: new Date().toISOString(),
                playerName: this.currentPlayerName
            };
            this.saveRecords();
            return true;
        }
        return false;
    }

    /**
     * 更新最高連擊
     */
    updateMaxCombo(combo, level) {
        if (combo > this.records.maxCombo.combo) {
            this.records.maxCombo = {
                combo: combo,
                level: level,
                date: new Date().toISOString(),
                playerName: this.currentPlayerName
            };
            this.saveRecords();
            return true;
        }
        return false;
    }

    /**
     * 更新無傷連勝
     */
    updateNoDamageStreak(streak) {
        if (streak > this.records.noDamageStreak.streak) {
            this.records.noDamageStreak = {
                streak: streak,
                date: new Date().toISOString(),
                playerName: this.currentPlayerName
            };
            this.saveRecords();
            return true;
        }
        return false;
    }

    /**
     * 更新最高關卡
     */
    updateMaxLevel(level, score) {
        if (level > this.records.maxLevel.level) {
            this.records.maxLevel = {
                level: level,
                score: score,
                date: new Date().toISOString(),
                playerName: this.currentPlayerName
            };
            this.saveRecords();
            return true;
        }
        return false;
    }

    /**
     * 添加到前10名
     */
    addToTopScores(score, level) {
        const entry = {
            score: score,
            level: level,
            date: new Date().toISOString(),
            playerName: this.currentPlayerName
        };

        this.records.topScores.push(entry);
        this.records.topScores.sort((a, b) => b.score - a.score);
        this.records.topScores = this.records.topScores.slice(0, 10);
        this.saveRecords();
    }

    /**
     * 遊戲結束時更新統計
     */
    updateGameStats(gameState, stats) {
        // 基本統計
        this.records.totalGamesPlayed++;
        this.records.totalBricksDestroyed += stats.bricksDestroyed || 0;
        this.records.totalPlayTime += Math.floor(stats.totalTime / 60) || 0;
        this.records.powerupsCollected += stats.powerupsCollected || 0;
        this.records.bossesDefeated += stats.bossesDefeated || 0;

        // 技能使用統計
        this.records.skillsUsed.slowtime += stats.skillsUsed || 0;
        this.records.skillsUsed.laser += stats.skillsUsed || 0;
        this.records.skillsUsed.shield += stats.skillsUsed || 0;

        // 檢查各項記錄
        const newHighScore = this.updateHighScore(gameState.score, gameState.level);
        this.updateMaxLevel(gameState.level, gameState.score);
        this.updateMaxCombo(stats.maxCombo || 0, gameState.level);
        this.updateNoDamageStreak(stats.noDamageStreak || 0);

        if (stats.fastestClear && stats.fastestClear < Infinity) {
            this.updateFastestClear(stats.fastestClear, gameState.level);
        }

        // 添加到前10名
        this.addToTopScores(gameState.score, gameState.level);

        this.saveRecords();

        return newHighScore;
    }

    /**
     * 獲取排行榜數據
     */
    getLeaderboard() {
        return {
            highScore: this.records.highScore,
            fastestClear: this.records.fastestClear,
            maxCombo: this.records.maxCombo,
            noDamageStreak: this.records.noDamageStreak,
            maxLevel: this.records.maxLevel,
            topScores: this.records.topScores,
            stats: {
                totalGamesPlayed: this.records.totalGamesPlayed,
                totalBricksDestroyed: this.records.totalBricksDestroyed,
                totalPlayTime: this.records.totalPlayTime,
                skillsUsed: this.records.skillsUsed,
                powerupsCollected: this.records.powerupsCollected,
                bossesDefeated: this.records.bossesDefeated
            }
        };
    }

    /**
     * 格式化時間
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 格式化日期
     */
    formatDate(isoString) {
        if (!isoString) return '---';
        const date = new Date(isoString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    /**
     * 顯示排行榜UI
     */
    showLeaderboard() {
        // 移除舊的排行榜
        const oldBoard = document.getElementById('leaderboard-modal');
        if (oldBoard) oldBoard.remove();

        const leaderboard = this.getLeaderboard();

        const modal = document.createElement('div');
        modal.id = 'leaderboard-modal';
        modal.className = 'leaderboard-modal';
        modal.innerHTML = `
            <div class="leaderboard-content">
                <div class="leaderboard-header">
                    <h2>🏆 排行榜</h2>
                    <button class="close-btn" onclick="this.closest('.leaderboard-modal').remove()">✕</button>
                </div>

                <div class="leaderboard-tabs">
                    <button class="tab-btn active" data-tab="records">個人記錄</button>
                    <button class="tab-btn" data-tab="top10">前10名</button>
                    <button class="tab-btn" data-tab="stats">統計數據</button>
                </div>

                <div class="leaderboard-body">
                    <!-- 個人記錄 -->
                    <div class="tab-content active" id="records-tab">
                        <div class="record-grid">
                            <div class="record-card">
                                <div class="record-icon">🎯</div>
                                <div class="record-info">
                                    <div class="record-label">最高分</div>
                                    <div class="record-value">${leaderboard.highScore.score.toLocaleString()}</div>
                                    <div class="record-detail">關卡 ${leaderboard.highScore.level} • ${this.formatDate(leaderboard.highScore.date)}</div>
                                </div>
                            </div>

                            <div class="record-card">
                                <div class="record-icon">⚡</div>
                                <div class="record-info">
                                    <div class="record-label">最快通關</div>
                                    <div class="record-value">${leaderboard.fastestClear.time === Infinity ? '---' : this.formatTime(leaderboard.fastestClear.time)}</div>
                                    <div class="record-detail">關卡 ${leaderboard.fastestClear.level} • ${this.formatDate(leaderboard.fastestClear.date)}</div>
                                </div>
                            </div>

                            <div class="record-card">
                                <div class="record-icon">🔥</div>
                                <div class="record-info">
                                    <div class="record-label">最高連擊</div>
                                    <div class="record-value">${leaderboard.maxCombo.combo}連擊</div>
                                    <div class="record-detail">關卡 ${leaderboard.maxCombo.level} • ${this.formatDate(leaderboard.maxCombo.date)}</div>
                                </div>
                            </div>

                            <div class="record-card">
                                <div class="record-icon">🛡️</div>
                                <div class="record-info">
                                    <div class="record-label">無傷連勝</div>
                                    <div class="record-value">${leaderboard.noDamageStreak.streak}關</div>
                                    <div class="record-detail">${this.formatDate(leaderboard.noDamageStreak.date)}</div>
                                </div>
                            </div>

                            <div class="record-card">
                                <div class="record-icon">🏔️</div>
                                <div class="record-info">
                                    <div class="record-label">最高關卡</div>
                                    <div class="record-value">第 ${leaderboard.maxLevel.level} 關</div>
                                    <div class="record-detail">${leaderboard.maxLevel.score.toLocaleString()} 分 • ${this.formatDate(leaderboard.maxLevel.date)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 前10名 -->
                    <div class="tab-content" id="top10-tab">
                        <div class="top10-list">
                            ${leaderboard.topScores.length === 0 ?
                                '<div class="empty-message">還沒有記錄，開始遊戲吧！</div>' :
                                leaderboard.topScores.map((entry, index) => `
                                    <div class="top10-item ${index < 3 ? 'medal-' + (index + 1) : ''}">
                                        <div class="rank">${index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1)}</div>
                                        <div class="player-info">
                                            <div class="player-name">${entry.playerName}</div>
                                            <div class="player-detail">Lv.${entry.level} • ${this.formatDate(entry.date)}</div>
                                        </div>
                                        <div class="score">${entry.score.toLocaleString()}</div>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>

                    <!-- 統計數據 -->
                    <div class="tab-content" id="stats-tab">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-icon">🎮</div>
                                <div class="stat-label">遊戲場次</div>
                                <div class="stat-value">${leaderboard.stats.totalGamesPlayed}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-icon">🧱</div>
                                <div class="stat-label">擊破磚塊</div>
                                <div class="stat-value">${leaderboard.stats.totalBricksDestroyed.toLocaleString()}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-icon">⏱️</div>
                                <div class="stat-label">遊戲時間</div>
                                <div class="stat-value">${this.formatTime(leaderboard.stats.totalPlayTime)}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-icon">🎁</div>
                                <div class="stat-label">收集道具</div>
                                <div class="stat-value">${leaderboard.stats.powerupsCollected}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-icon">💀</div>
                                <div class="stat-label">擊敗Boss</div>
                                <div class="stat-value">${leaderboard.stats.bossesDefeated}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-icon">⚡</div>
                                <div class="stat-label">技能使用</div>
                                <div class="stat-value">${leaderboard.stats.skillsUsed.slowtime + leaderboard.stats.skillsUsed.laser + leaderboard.stats.skillsUsed.shield}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="leaderboard-footer">
                    <button class="btn-secondary" onclick="if(confirm('確定要清除所有排行榜記錄嗎？')) { if(typeof leaderboard !== 'undefined') leaderboard.reset(); this.closest('.leaderboard-modal').remove(); }">清除記錄</button>
                    <button class="btn-primary" onclick="this.closest('.leaderboard-modal').remove()">關閉</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 綁定標籤切換
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;

                // 切換按鈕狀態
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 切換內容
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                modal.querySelector(`#${tabName}-tab`).classList.add('active');
            });
        });

        // 顯示動畫
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * 重置所有記錄
     */
    reset() {
        if (confirm('確定要清除所有排行榜記錄嗎？這個操作無法復原！')) {
            localStorage.removeItem(this.storageKey);
            this.records = {
                highScore: { score: 0, level: 1, date: null, playerName: '未命名' },
                fastestClear: { time: Infinity, level: 1, date: null, playerName: '未命名' },
                maxCombo: { combo: 0, level: 1, date: null, playerName: '未命名' },
                noDamageStreak: { streak: 0, date: null, playerName: '未命名' },
                maxLevel: { level: 1, score: 0, date: null, playerName: '未命名' },
                totalBricksDestroyed: 0,
                totalGamesPlayed: 0,
                totalPlayTime: 0,
                skillsUsed: { slowtime: 0, laser: 0, shield: 0 },
                powerupsCollected: 0,
                bossesDefeated: 0,
                achievementsUnlocked: 0,
                topScores: []
            };
            alert('排行榜記錄已清除！');
        }
    }
}
