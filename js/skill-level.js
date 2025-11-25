/**
 * SkillLevel 模組 - 技能等級系統
 */
class SkillLevelManager {
    constructor() {
        // 技能等級數據
        this.skills = {
            slowtime: {
                level: 1,
                exp: 0,
                maxLevel: 5
            },
            laser: {
                level: 1,
                exp: 0,
                maxLevel: 5
            },
            shield: {
                level: 1,
                exp: 0,
                maxLevel: 5
            }
        };

        // 每級所需經驗值
        this.expRequired = [0, 100, 250, 500, 1000, 2000];
    }

    /**
     * 添加經驗值
     */
    addExp(skillName, amount) {
        const skill = this.skills[skillName];
        if (!skill || skill.level >= skill.maxLevel) return false;

        skill.exp += amount;

        // 檢查是否升級
        const requiredExp = this.expRequired[skill.level];
        if (skill.exp >= requiredExp) {
            skill.exp -= requiredExp;
            skill.level++;
            return true; // 返回 true 表示升級了
        }

        return false;
    }

    /**
     * 獲取技能等級
     */
    getLevel(skillName) {
        return this.skills[skillName]?.level || 1;
    }

    /**
     * 獲取技能經驗值
     */
    getExp(skillName) {
        return this.skills[skillName]?.exp || 0;
    }

    /**
     * 獲取升級所需經驗值
     */
    getRequiredExp(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level >= skill.maxLevel) return 0;
        return this.expRequired[skill.level];
    }

    /**
     * 獲取經驗值進度（0-1）
     */
    getExpProgress(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level >= skill.maxLevel) return 1;

        const required = this.expRequired[skill.level];
        return required > 0 ? skill.exp / required : 0;
    }

    /**
     * 計算技能效果（基於等級）
     */
    getSkillEffect(skillName, baseEffect) {
        const level = this.getLevel(skillName);

        // 每級增加 15% 效果
        const bonus = 1 + (level - 1) * 0.15;

        return baseEffect * bonus;
    }

    /**
     * 計算冷卻時間（基於等級）
     */
    getCooldownReduction(skillName) {
        const level = this.getLevel(skillName);

        // 每級減少 10% 冷卻時間
        const reduction = 1 - (level - 1) * 0.10;

        return Math.max(reduction, 0.5); // 最多減少 50%
    }

    /**
     * 計算持續時間（基於等級）
     */
    getDurationBonus(skillName) {
        const level = this.getLevel(skillName);

        // 每級增加 10% 持續時間
        const bonus = 1 + (level - 1) * 0.10;

        return Math.min(bonus, 1.5); // 最多增加 50%
    }

    /**
     * 檢查是否為最大等級
     */
    isMaxLevel(skillName) {
        const skill = this.skills[skillName];
        return skill ? skill.level >= skill.maxLevel : false;
    }

    /**
     * 獲取技能等級資訊
     */
    getSkillInfo(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return null;

        return {
            level: skill.level,
            exp: skill.exp,
            requiredExp: this.getRequiredExp(skillName),
            progress: this.getExpProgress(skillName),
            isMaxLevel: this.isMaxLevel(skillName),
            cooldownReduction: this.getCooldownReduction(skillName),
            durationBonus: this.getDurationBonus(skillName)
        };
    }

    /**
     * 獲取技能等級描述
     */
    getLevelDescription(skillName, level) {
        const descriptions = {
            slowtime: [
                '減緩時間流速',
                '時間減速效果增強',
                '更長的持續時間',
                '極致的時間控制',
                '時間幾乎停止！'
            ],
            laser: [
                '發射強力激光',
                '激光範圍增大',
                '激光威力增強',
                '雙重激光射線',
                '毀滅性的激光風暴！'
            ],
            shield: [
                '生成能量護盾',
                '護盾更加堅固',
                '延長護盾時間',
                '護盾可反彈球',
                '無敵護盾領域！'
            ]
        };

        const skillDescriptions = descriptions[skillName];
        if (!skillDescriptions) return '';

        return skillDescriptions[level - 1] || '';
    }

    /**
     * 重置所有技能等級
     */
    reset() {
        Object.values(this.skills).forEach(skill => {
            skill.level = 1;
            skill.exp = 0;
        });
    }

    /**
     * 獲取狀態（用於存檔）
     */
    getState() {
        return {
            skills: JSON.parse(JSON.stringify(this.skills))
        };
    }

    /**
     * 載入狀態（用於讀檔）
     */
    loadState(state) {
        if (!state || !state.skills) return;

        Object.entries(state.skills).forEach(([name, skillData]) => {
            if (this.skills[name]) {
                this.skills[name].level = skillData.level || 1;
                this.skills[name].exp = skillData.exp || 0;
            }
        });
    }
}

/**
 * 擴展 SkillManager 以支持技能等級
 */
if (typeof SkillManager !== 'undefined') {
    const originalUseSkill = SkillManager.prototype.useSkill;
    const originalUpdate = SkillManager.prototype.update;

    // 擴展 useSkill 方法以應用等級效果
    SkillManager.prototype.useSkillWithLevel = function(skillName, levelManager) {
        const skill = this.skills[skillName];
        if (!skill || !levelManager) return originalUseSkill.call(this, skillName);

        // 檢查冷卻時間
        if (skill.currentCooldown > 0) return false;

        // 獲取等級加成
        const cooldownReduction = levelManager.getCooldownReduction(skillName);
        const durationBonus = levelManager.getDurationBonus(skillName);

        // 啟用技能（應用等級加成）
        skill.active = true;
        skill.activeTimer = Math.floor(skill.duration * durationBonus);
        skill.currentCooldown = Math.floor(skill.cooldown * cooldownReduction);

        // 特殊的 Lv5 效果
        const level = levelManager.getLevel(skillName);
        if (level === 5) {
            this.applyLevel5Effect(skillName, skill);
        }

        return true;
    };

    // Lv5 特殊效果
    SkillManager.prototype.applyLevel5Effect = function(skillName, skill) {
        switch(skillName) {
            case 'slowtime':
                // Lv5: 時間減速效果更強
                skill.effect = 0.3; // 原本 0.5，現在 0.3（更慢）
                break;
            case 'laser':
                // Lv5: 雙重激光（在 drawLaser 中處理）
                skill.doubleLaser = true;
                break;
            case 'shield':
                // Lv5: 護盾可以加速球（在 checkShieldCollision 中處理）
                skill.boostBall = true;
                break;
        }
    };

    // 擴展繪製激光方法以支持雙重激光
    const originalDrawLaser = SkillManager.prototype.drawLaser;
    SkillManager.prototype.drawLaser = function(ctx, paddleX, paddleY, paddleWidth, canvasHeight) {
        const laser = this.skills.laser;
        if (!laser.active) return;

        // 繪製主激光
        originalDrawLaser.call(this, ctx, paddleX, paddleY, paddleWidth, canvasHeight);

        // Lv5 雙重激光
        if (laser.doubleLaser) {
            const offset = 40;
            // 左側激光
            this.drawSingleLaser(ctx, paddleX + paddleWidth / 2 - offset, paddleY, canvasHeight);
            // 右側激光
            this.drawSingleLaser(ctx, paddleX + paddleWidth / 2 + offset, paddleY, canvasHeight);
        }
    };

    // 繪製單個激光
    SkillManager.prototype.drawSingleLaser = function(ctx, centerX, paddleY, canvasHeight) {
        const laser = this.skills.laser;
        const alpha = Math.min(laser.activeTimer / 20, 0.6);

        ctx.save();
        ctx.globalAlpha = alpha;

        const gradient = ctx.createLinearGradient(centerX - 5, 0, centerX + 5, 0);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - 5, 0, 10, paddleY);

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, paddleY);
        ctx.stroke();

        ctx.restore();
    };

    // 擴展護盾碰撞檢查以支持加速效果
    const originalCheckShieldCollision = SkillManager.prototype.checkShieldCollision;
    SkillManager.prototype.checkShieldCollision = function(ball) {
        const shield = this.skills.shield;
        if (!shield.active) return false;

        if (ball.y + ball.radius >= shield.shieldY && ball.dy > 0) {
            ball.bounceY();
            ball.y = shield.shieldY - ball.radius;

            // Lv5 效果：護盾加速球
            if (shield.boostBall) {
                ball.dy *= 1.2;
            }

            return true;
        }

        return false;
    };

    // 擴展激光檢測以支持雙重激光
    const originalCheckLaserHit = SkillManager.prototype.checkLaserHit;
    SkillManager.prototype.checkLaserHit = function(brick, paddleX, paddleWidth) {
        const laser = this.skills.laser;
        if (!laser.active || !brick.visible) return false;

        const centerX = paddleX + paddleWidth / 2;

        // 檢查主激光
        if (centerX >= brick.x && centerX <= brick.x + brick.width) {
            return true;
        }

        // Lv5 雙重激光檢查
        if (laser.doubleLaser) {
            const offset = 40;
            const leftX = centerX - offset;
            const rightX = centerX + offset;

            if ((leftX >= brick.x && leftX <= brick.x + brick.width) ||
                (rightX >= brick.x && rightX <= brick.x + brick.width)) {
                return true;
            }
        }

        return false;
    };
}
