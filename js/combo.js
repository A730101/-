/**
 * Combo 模組 - 連擊系統
 */
class ComboManager {
    constructor() {
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 180; // 3 秒沒打到磚塊就重置（60fps）
        this.multiplier = 1.0;
    }

    /**
     * 增加連擊數
     */
    addCombo() {
        this.combo++;
        this.comboTimer = this.comboTimeout;

        // 更新最高連擊記錄
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        // 計算分數倍數（每 5 連擊增加 0.5 倍）
        this.multiplier = 1.0 + Math.floor(this.combo / 5) * 0.5;

        return this.combo;
    }

    /**
     * 重置連擊
     */
    resetCombo() {
        this.combo = 0;
        this.multiplier = 1.0;
        this.comboTimer = 0;
    }

    /**
     * 更新連擊計時器
     */
    update() {
        if (this.comboTimer > 0) {
            this.comboTimer--;

            // 連擊計時結束，重置連擊
            if (this.comboTimer === 0) {
                this.resetCombo();
            }
        }
    }

    /**
     * 獲取當前分數倍數
     */
    getMultiplier() {
        return this.multiplier;
    }

    /**
     * 獲取連擊數
     */
    getCombo() {
        return this.combo;
    }

    /**
     * 獲取最高連擊
     */
    getMaxCombo() {
        return this.maxCombo;
    }

    /**
     * 計算連擊加成後的分數
     */
    calculateScore(baseScore) {
        return Math.floor(baseScore * this.multiplier);
    }

    /**
     * 獲取連擊狀態（用於存檔）
     */
    getState() {
        return {
            combo: this.combo,
            maxCombo: this.maxCombo,
            comboTimer: this.comboTimer,
            multiplier: this.multiplier
        };
    }

    /**
     * 載入連擊狀態（用於讀檔）
     */
    loadState(state) {
        this.combo = state.combo || 0;
        this.maxCombo = state.maxCombo || 0;
        this.comboTimer = state.comboTimer || 0;
        this.multiplier = state.multiplier || 1.0;
    }
}

/**
 * Skill 模組 - 主動技能系統
 */
class SkillManager {
    constructor() {
        this.skills = {
            slowtime: {
                name: '時間減速',
                description: '減緩時間流速，讓球和磚塊移動變慢',
                cooldown: 600, // 10 秒
                duration: 300, // 5 秒
                currentCooldown: 0,
                active: false,
                activeTimer: 0,
                key: 'Q',
                effect: 0.5 // 速度倍數
            },
            laser: {
                name: '激光射線',
                description: '從球拍發射激光，摧毀路徑上的所有磚塊',
                cooldown: 480, // 8 秒
                duration: 60, // 1 秒
                currentCooldown: 0,
                active: false,
                activeTimer: 0,
                key: 'W'
            },
            shield: {
                name: '能量護盾',
                description: '在底部生成護盾，防止球掉落',
                cooldown: 720, // 12 秒
                duration: 360, // 6 秒
                currentCooldown: 0,
                active: false,
                activeTimer: 0,
                key: 'E',
                shieldY: 550
            }
        };
    }

    /**
     * 使用技能
     */
    useSkill(skillName) {
        const skill = this.skills[skillName];

        if (!skill) return false;

        // 檢查冷卻時間
        if (skill.currentCooldown > 0) return false;

        // 啟用技能
        skill.active = true;
        skill.activeTimer = skill.duration;
        skill.currentCooldown = skill.cooldown;

        return true;
    }

    /**
     * 更新技能狀態
     */
    update() {
        Object.values(this.skills).forEach(skill => {
            // 更新冷卻時間
            if (skill.currentCooldown > 0) {
                skill.currentCooldown--;
            }

            // 更新技能持續時間
            if (skill.active && skill.activeTimer > 0) {
                skill.activeTimer--;

                // 技能結束
                if (skill.activeTimer === 0) {
                    skill.active = false;
                }
            }
        });
    }

    /**
     * 檢查技能是否激活
     */
    isSkillActive(skillName) {
        return this.skills[skillName]?.active || false;
    }

    /**
     * 獲取技能冷卻進度（0-1）
     */
    getCooldownProgress(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return 1;

        if (skill.currentCooldown === 0) return 1;

        return 1 - (skill.currentCooldown / skill.cooldown);
    }

    /**
     * 獲取技能持續時間進度（0-1）
     */
    getDurationProgress(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return 0;

        if (!skill.active) return 0;

        return skill.activeTimer / skill.duration;
    }

    /**
     * 繪製護盾
     */
    drawShield(ctx, canvasWidth) {
        const shield = this.skills.shield;
        if (!shield.active) return;

        const alpha = Math.min(shield.activeTimer / 60, 0.6); // 淡入淡出效果

        ctx.save();
        ctx.globalAlpha = alpha;

        // 護盾漸變效果
        const gradient = ctx.createLinearGradient(0, shield.shieldY - 5, 0, shield.shieldY + 5);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, shield.shieldY - 5, canvasWidth, 10);

        // 閃爍效果
        if (Math.floor(shield.activeTimer / 10) % 2 === 0) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, shield.shieldY - 5, canvasWidth, 10);
        }

        ctx.restore();
    }

    /**
     * 檢查球是否碰到護盾
     */
    checkShieldCollision(ball) {
        const shield = this.skills.shield;
        if (!shield.active) return false;

        if (ball.y + ball.radius >= shield.shieldY && ball.dy > 0) {
            ball.bounceY();
            ball.y = shield.shieldY - ball.radius;
            return true;
        }

        return false;
    }

    /**
     * 繪製激光
     */
    drawLaser(ctx, paddleX, paddleY, paddleWidth, canvasHeight) {
        const laser = this.skills.laser;
        if (!laser.active) return;

        const centerX = paddleX + paddleWidth / 2;
        const alpha = Math.min(laser.activeTimer / 20, 0.8);

        ctx.save();
        ctx.globalAlpha = alpha;

        // 激光主體
        const gradient = ctx.createLinearGradient(centerX - 10, 0, centerX + 10, 0);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - 10, 0, 20, paddleY);

        // 外發光
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff0000';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, paddleY);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 檢查激光是否擊中磚塊
     */
    checkLaserHit(brick, paddleX, paddleWidth) {
        const laser = this.skills.laser;
        if (!laser.active || !brick.visible) return false;

        const centerX = paddleX + paddleWidth / 2;

        // 檢查激光是否穿過磚塊
        if (centerX >= brick.x && centerX <= brick.x + brick.width) {
            return true;
        }

        return false;
    }

    /**
     * 獲取時間減速效果
     */
    getSlowTimeEffect() {
        const slowtime = this.skills.slowtime;
        return slowtime.active ? slowtime.effect : 1.0;
    }

    /**
     * 重置所有技能
     */
    reset() {
        Object.values(this.skills).forEach(skill => {
            skill.active = false;
            skill.activeTimer = 0;
            skill.currentCooldown = 0;
        });
    }

    /**
     * 獲取技能狀態（用於存檔）
     */
    getState() {
        const state = {};
        Object.entries(this.skills).forEach(([name, skill]) => {
            state[name] = {
                currentCooldown: skill.currentCooldown,
                active: skill.active,
                activeTimer: skill.activeTimer
            };
        });
        return state;
    }

    /**
     * 載入技能狀態（用於讀檔）
     */
    loadState(state) {
        if (!state) return;

        Object.entries(state).forEach(([name, skillState]) => {
            if (this.skills[name]) {
                this.skills[name].currentCooldown = skillState.currentCooldown || 0;
                this.skills[name].active = skillState.active || false;
                this.skills[name].activeTimer = skillState.activeTimer || 0;
            }
        });
    }
}
