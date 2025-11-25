/**
 * SpecialBrick 模組 - 特殊磚塊類型
 */

/**
 * ExplosiveBrick - 爆炸磚塊（打破後會炸掉周圍的磚塊）
 */
class ExplosiveBrick extends Brick {
    constructor(x, y, width, height, health = 1) {
        super(x, y, width, height, '#ff4500', 100, health);
        this.type = 'explosive';
        this.explosionRadius = 120; // 爆炸半徑
    }

    draw(ctx) {
        if (!this.visible) return;

        // 脈動紅色
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 69, 0, ${pulse})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4500';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 爆炸圖示
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', this.x + this.width / 2, this.y + this.height / 2);
    }

    getExplosionInfo() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            radius: this.explosionRadius
        };
    }
}

/**
 * GoldBrick - 金磚（高分、多道具）
 */
class GoldBrick extends Brick {
    constructor(x, y, width, height, health = 3) {
        super(x, y, width, height, '#ffd700', 500, health);
        this.type = 'gold';
        this.powerupDropChance = 0.8; // 80% 道具掉落率
    }

    draw(ctx) {
        if (!this.visible) return;

        // 閃亮的金色漸變
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#ffed4e');
        gradient.addColorStop(0.5, '#ffd700');
        gradient.addColorStop(1, '#ffaa00');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 閃光效果
        const flash = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.5})`;
        ctx.fillRect(this.x, this.y, this.width / 3, this.height / 3);

        // 金幣圖示
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💰', this.x + this.width / 2, this.y + this.height / 2);
    }
}

/**
 * InvisibleBrick - 隱形磚塊（被球打過才會顯示）
 */
class InvisibleBrick extends Brick {
    constructor(x, y, width, height, health = 2) {
        super(x, y, width, height, '#9370db', 150, health);
        this.type = 'invisible';
        this.revealed = false;
        this.revealProgress = 0;
    }

    draw(ctx) {
        if (!this.visible) return;

        // 只有被揭露後才顯示
        if (this.revealed || this.revealProgress > 0) {
            const alpha = this.revealed ? 1 : this.revealProgress;

            ctx.save();
            ctx.globalAlpha = alpha;

            // 神秘的紫色
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#9370db';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // 問號圖示
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❓', this.x + this.width / 2, this.y + this.height / 2);

            ctx.restore();
        } else {
            // 未揭露時顯示微弱輪廓
            ctx.strokeStyle = 'rgba(147, 112, 219, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    checkCollision(ball) {
        if (!this.visible) return false;

        // 被擊中時揭露
        if (super.checkCollision(ball)) {
            if (!this.revealed) {
                this.revealed = true;
                this.revealProgress = 1;
            }
            return true;
        }

        return false;
    }
}

/**
 * TeleportBrick - 傳送門磚塊（打到後球會傳送）
 */
class TeleportBrick extends Brick {
    constructor(x, y, width, height, linkedBrick = null) {
        super(x, y, width, height, '#00ced1', 200, 2);
        this.type = 'teleport';
        this.linkedBrick = linkedBrick; // 連結的另一個傳送門
        this.teleportCooldown = 0;
    }

    draw(ctx) {
        if (!this.visible) return;

        // 旋轉的傳送門效果
        const time = Date.now() / 500;
        const colors = ['#00ced1', '#40e0d0', '#00ffff'];
        const colorIndex = Math.floor(time) % colors.length;

        ctx.fillStyle = colors[colorIndex];
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ced1';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 傳送門圖示
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌀', this.x + this.width / 2, this.y + this.height / 2);

        // 顯示血量
        if (this.health > 1) {
            ctx.font = 'bold 12px Arial';
            ctx.fillText(this.health, this.x + this.width / 2, this.y + this.height - 5);
        }
    }

    checkCollision(ball) {
        if (!this.visible) return false;

        if (super.checkCollision(ball)) {
            // 如果有連結的傳送門且冷卻時間已過，執行傳送
            if (this.linkedBrick && this.linkedBrick.visible && this.teleportCooldown === 0) {
                this.teleport(ball);
            }
            return true;
        }

        return false;
    }

    teleport(ball) {
        if (!this.linkedBrick) return;

        // 傳送球到另一個傳送門
        ball.x = this.linkedBrick.x + this.linkedBrick.width / 2;
        ball.y = this.linkedBrick.y + this.linkedBrick.height + ball.radius + 5;

        // 設置冷卻時間防止無限傳送
        this.teleportCooldown = 60; // 1 秒
        this.linkedBrick.teleportCooldown = 60;
    }

    update() {
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
        }
    }

    setLinkedBrick(brick) {
        this.linkedBrick = brick;
    }
}

/**
 * MultiHitBrick - 需要多次擊打的超硬磚塊
 */
class MultiHitBrick extends Brick {
    constructor(x, y, width, height, health = 10) {
        super(x, y, width, height, '#4169e1', 300, health);
        this.type = 'multiHit';
    }

    draw(ctx) {
        if (!this.visible) return;

        // 根據剩餘血量改變顏色
        const healthRatio = this.health / this.maxHealth;
        const r = Math.floor(65 + (1 - healthRatio) * 190);
        const g = Math.floor(105);
        const b = Math.floor(225);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 超粗邊框表示硬度
        ctx.strokeStyle = '#000080';
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 顯示剩餘血量
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = this.x + this.width / 2;
        const textY = this.y + this.height / 2;

        ctx.strokeText(this.health, textX, textY);
        ctx.fillText(this.health, textX, textY);
    }
}

/**
 * RegeneratingBrick - 再生磚塊（會恢復血量）
 */
class RegeneratingBrick extends Brick {
    constructor(x, y, width, height, health = 5) {
        super(x, y, width, height, '#32cd32', 250, health);
        this.type = 'regenerating';
        this.regenerateRate = 300; // 5 秒恢復 1 點血量
        this.regenerateTimer = 0;
    }

    draw(ctx) {
        if (!this.visible) return;

        // 綠色脈動效果
        const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(50, 205, 50, ${pulse})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#32cd32';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 加號表示再生
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('➕', this.x + this.width / 2, this.y + this.height / 2);

        // 顯示血量
        if (this.health > 1) {
            ctx.font = 'bold 14px Arial';
            ctx.fillText(this.health, this.x + this.width / 2, this.y + this.height - 5);
        }
    }

    update() {
        if (!this.visible) return;

        this.regenerateTimer++;

        // 恢復血量（不超過最大值）
        if (this.regenerateTimer >= this.regenerateRate && this.health < this.maxHealth) {
            this.health++;
            this.regenerateTimer = 0;
            this.updateColor();
        }
    }
}

/**
 * SpecialBrickFactory - 特殊磚塊工廠
 */
class SpecialBrickFactory {
    /**
     * 創建特殊磚塊
     */
    static create(type, x, y, width, height, ...args) {
        switch (type) {
            case 'explosive':
                return new ExplosiveBrick(x, y, width, height, ...args);
            case 'gold':
                return new GoldBrick(x, y, width, height, ...args);
            case 'invisible':
                return new InvisibleBrick(x, y, width, height, ...args);
            case 'teleport':
                return new TeleportBrick(x, y, width, height, ...args);
            case 'multiHit':
                return new MultiHitBrick(x, y, width, height, ...args);
            case 'regenerating':
                return new RegeneratingBrick(x, y, width, height, ...args);
            default:
                return new Brick(x, y, width, height, '#ffffff', 10);
        }
    }

    /**
     * 隨機生成特殊磚塊（基於關卡）
     */
    static createRandom(x, y, width, height, level) {
        const chance = Math.random();

        // 根據關卡增加特殊磚塊出現機率
        const threshold = Math.min(0.15 + (level * 0.01), 0.35); // 最高 35%

        if (chance > threshold) {
            return null; // 不生成特殊磚塊
        }

        // 特殊磚塊類型權重
        const types = [
            { type: 'explosive', weight: 15 },
            { type: 'gold', weight: 5 },
            { type: 'invisible', weight: 10 },
            { type: 'multiHit', weight: 8 },
            { type: 'regenerating', weight: 7 }
        ];

        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;

        for (const typeInfo of types) {
            random -= typeInfo.weight;
            if (random <= 0) {
                return this.create(typeInfo.type, x, y, width, height);
            }
        }

        return null;
    }
}
