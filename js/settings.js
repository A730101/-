/**
 * Settings 模組 - 遊戲設定系統
 */
class SettingsManager {
    constructor() {
        this.storageKey = 'brickBreaker_settings';

        // 預設設定
        this.defaults = {
            audio: {
                enabled: true,
                volume: 0.7,
                musicVolume: 0.5
            },
            graphics: {
                particles: true,
                particleDensity: 1.0, // 0.5 = 低, 1.0 = 中, 1.5 = 高
                shadows: true,
                animations: true
            },
            gameplay: {
                difficulty: 'normal', // easy, normal, hard
                showTutorial: true,
                autoSave: true,
                vibration: false
            },
            controls: {
                mouseControl: true,
                keyboardControl: true,
                touchControl: true
            }
        };

        // 載入設定
        this.settings = this.loadSettings();
    }

    /**
     * 載入設定
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const loaded = JSON.parse(saved);
                // 合併預設值（以防新版本增加新設定）
                return this.mergeSettings(this.defaults, loaded);
            }
        } catch (e) {
            console.error('載入設定失敗:', e);
        }
        return JSON.parse(JSON.stringify(this.defaults));
    }

    /**
     * 合併設定（深度合併）
     */
    mergeSettings(defaults, loaded) {
        const result = { ...defaults };
        for (const key in loaded) {
            if (typeof loaded[key] === 'object' && !Array.isArray(loaded[key])) {
                result[key] = { ...defaults[key], ...loaded[key] };
            } else {
                result[key] = loaded[key];
            }
        }
        return result;
    }

    /**
     * 儲存設定
     */
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (e) {
            console.error('儲存設定失敗:', e);
        }
    }

    /**
     * 獲取設定值
     */
    get(category, key) {
        return this.settings[category]?.[key];
    }

    /**
     * 設定值
     */
    set(category, key, value) {
        if (this.settings[category]) {
            this.settings[category][key] = value;
            this.saveSettings();
            this.applySettings(category, key, value);
        }
    }

    /**
     * 應用設定到遊戲
     */
    applySettings(category, key, value) {
        // 這裡可以立即應用設定
        if (category === 'audio' && key === 'enabled') {
            // 切換音效
            if (typeof game !== 'undefined' && game.audioManager) {
                if (value) {
                    game.audioManager.enable();
                } else {
                    game.audioManager.disable();
                }
            }
        }

        if (category === 'audio' && key === 'volume') {
            // 設定音量
            if (typeof game !== 'undefined' && game.audioManager) {
                game.audioManager.setVolume(value);
            }
        }
    }

    /**
     * 獲取難度係數
     */
    getDifficultyMultiplier() {
        const difficulty = this.settings.gameplay.difficulty;
        switch (difficulty) {
            case 'easy':
                return { speed: 0.8, damage: 0.7, score: 0.8 };
            case 'normal':
                return { speed: 1.0, damage: 1.0, score: 1.0 };
            case 'hard':
                return { speed: 1.3, damage: 1.5, score: 1.5 };
            default:
                return { speed: 1.0, damage: 1.0, score: 1.0 };
        }
    }

    /**
     * 顯示設定UI
     */
    showSettings() {
        // 移除舊的設定面板
        const oldSettings = document.getElementById('settings-modal');
        if (oldSettings) oldSettings.remove();

        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2>⚙️ 遊戲設定</h2>
                    <button class="close-btn" onclick="this.closest('.settings-modal').remove()">✕</button>
                </div>

                <div class="settings-body">
                    <!-- 音效設定 -->
                    <div class="settings-section">
                        <h3>🔊 音效設定</h3>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="audio-enabled" ${this.settings.audio.enabled ? 'checked' : ''}>
                                <span>啟用音效</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <span>音效音量</span>
                                <input type="range" id="audio-volume" min="0" max="1" step="0.1" value="${this.settings.audio.volume}">
                                <span class="setting-value">${Math.round(this.settings.audio.volume * 100)}%</span>
                            </label>
                        </div>
                    </div>

                    <!-- 圖形設定 -->
                    <div class="settings-section">
                        <h3>🎨 圖形設定</h3>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="graphics-particles" ${this.settings.graphics.particles ? 'checked' : ''}>
                                <span>粒子效果</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <span>粒子密度</span>
                                <select id="graphics-particleDensity">
                                    <option value="0.5" ${this.settings.graphics.particleDensity === 0.5 ? 'selected' : ''}>低</option>
                                    <option value="1.0" ${this.settings.graphics.particleDensity === 1.0 ? 'selected' : ''}>中</option>
                                    <option value="1.5" ${this.settings.graphics.particleDensity === 1.5 ? 'selected' : ''}>高</option>
                                </select>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="graphics-shadows" ${this.settings.graphics.shadows ? 'checked' : ''}>
                                <span>陰影效果</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="graphics-animations" ${this.settings.graphics.animations ? 'checked' : ''}>
                                <span>動畫效果</span>
                            </label>
                        </div>
                    </div>

                    <!-- 遊戲設定 -->
                    <div class="settings-section">
                        <h3>🎮 遊戲設定</h3>
                        <div class="setting-item">
                            <label class="setting-label">
                                <span>難度等級</span>
                                <select id="gameplay-difficulty">
                                    <option value="easy" ${this.settings.gameplay.difficulty === 'easy' ? 'selected' : ''}>簡單 (速度↓ 傷害↓)</option>
                                    <option value="normal" ${this.settings.gameplay.difficulty === 'normal' ? 'selected' : ''}>普通 (標準)</option>
                                    <option value="hard" ${this.settings.gameplay.difficulty === 'hard' ? 'selected' : ''}>困難 (速度↑ 傷害↑ 分數↑)</option>
                                </select>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="gameplay-showTutorial" ${this.settings.gameplay.showTutorial ? 'checked' : ''}>
                                <span>顯示教學提示</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="gameplay-autoSave" ${this.settings.gameplay.autoSave ? 'checked' : ''}>
                                <span>自動儲存</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="gameplay-vibration" ${this.settings.gameplay.vibration ? 'checked' : ''}>
                                <span>震動反饋 (手機)</span>
                            </label>
                        </div>
                    </div>

                    <!-- 控制設定 -->
                    <div class="settings-section">
                        <h3>🕹️ 控制設定</h3>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="controls-mouseControl" ${this.settings.controls.mouseControl ? 'checked' : ''}>
                                <span>滑鼠控制</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="controls-keyboardControl" ${this.settings.controls.keyboardControl ? 'checked' : ''}>
                                <span>鍵盤控制</span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="setting-label">
                                <input type="checkbox" id="controls-touchControl" ${this.settings.controls.touchControl ? 'checked' : ''}>
                                <span>觸控控制</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="settings-footer">
                    <button class="btn-secondary" onclick="if(typeof settingsManager !== 'undefined') { settingsManager.resetToDefaults(); this.closest('.settings-modal').remove(); }">重置預設</button>
                    <button class="btn-primary" onclick="this.closest('.settings-modal').remove()">確定</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 綁定事件
        this.bindSettingsEvents(modal);

        // 顯示動畫
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * 綁定設定事件
     */
    bindSettingsEvents(modal) {
        // 音效開關
        modal.querySelector('#audio-enabled')?.addEventListener('change', (e) => {
            this.set('audio', 'enabled', e.target.checked);
        });

        // 音量
        modal.querySelector('#audio-volume')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.set('audio', 'volume', value);
            const valueSpan = e.target.nextElementSibling;
            if (valueSpan) valueSpan.textContent = Math.round(value * 100) + '%';
        });

        // 粒子效果
        modal.querySelector('#graphics-particles')?.addEventListener('change', (e) => {
            this.set('graphics', 'particles', e.target.checked);
        });

        // 粒子密度
        modal.querySelector('#graphics-particleDensity')?.addEventListener('change', (e) => {
            this.set('graphics', 'particleDensity', parseFloat(e.target.value));
        });

        // 陰影
        modal.querySelector('#graphics-shadows')?.addEventListener('change', (e) => {
            this.set('graphics', 'shadows', e.target.checked);
        });

        // 動畫
        modal.querySelector('#graphics-animations')?.addEventListener('change', (e) => {
            this.set('graphics', 'animations', e.target.checked);
        });

        // 難度
        modal.querySelector('#gameplay-difficulty')?.addEventListener('change', (e) => {
            this.set('gameplay', 'difficulty', e.target.value);
            alert('難度設定將在下次遊戲生效！');
        });

        // 教學提示
        modal.querySelector('#gameplay-showTutorial')?.addEventListener('change', (e) => {
            this.set('gameplay', 'showTutorial', e.target.checked);
        });

        // 自動儲存
        modal.querySelector('#gameplay-autoSave')?.addEventListener('change', (e) => {
            this.set('gameplay', 'autoSave', e.target.checked);
        });

        // 震動
        modal.querySelector('#gameplay-vibration')?.addEventListener('change', (e) => {
            this.set('gameplay', 'vibration', e.target.checked);
        });

        // 控制設定
        modal.querySelector('#controls-mouseControl')?.addEventListener('change', (e) => {
            this.set('controls', 'mouseControl', e.target.checked);
        });

        modal.querySelector('#controls-keyboardControl')?.addEventListener('change', (e) => {
            this.set('controls', 'keyboardControl', e.target.checked);
        });

        modal.querySelector('#controls-touchControl')?.addEventListener('change', (e) => {
            this.set('controls', 'touchControl', e.target.checked);
        });
    }

    /**
     * 重置為預設值
     */
    resetToDefaults() {
        if (confirm('確定要重置所有設定為預設值嗎？')) {
            this.settings = JSON.parse(JSON.stringify(this.defaults));
            this.saveSettings();
            alert('設定已重置！');
            // 重新顯示設定面板
            this.showSettings();
        }
    }

    /**
     * 獲取所有設定
     */
    getAllSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }
}
