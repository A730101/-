/**
 * PowerUp 模組 - 處理道具的邏輯
 */
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.speed = 2;
        this.active = true;

        // 道具類型配置
        this.types = {
            extend: { color: '#00ff00', emoji: '🟢', name: '延長板子' },
            shrink: { color: '#ff0000', emoji: '🔴', name: '縮短板子' },
            slow: { color: '#0000ff', emoji: '🔵', name: '減速球' },
            fast: { color: '#ffff00', emoji: '🟡', name: '加速球' },
            multi: { color: '#ff00ff', emoji: '🟣', name: '多球' },
            life: { color: '#ffd700', emoji: '⭐', name: '額外生命' },
            freeze: { color: '#00ffff', emoji: '❄️', name: '冰球' },
            magnet: { color: '#ff69b4', emoji: '🧲', name: '磁力吸附' },
            penetrate: { color: '#ff8800', emoji: '⚡', name: '穿透球' },
            giant: { color: '#00ff66', emoji: '🎾', name: '巨大球' },
            lightning: { color: '#9400d3', emoji: '⚡', name: '閃電鏈' }
        };

        this.config = this.types[type] || this.types.extend;
    }

    /**
     * 移動道具
     */
    move() {
        this.y += this.speed;
    }

    /**
     * 繪製道具
     */
    draw(ctx) {
        if (!this.active) return;

        // 繪製光暈
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.config.color;

        // 繪製圓形背景
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // 繪製 emoji（使用文字）
        ctx.shadowBlur = 0;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
            this.config.emoji,
            this.x + this.width / 2,
            this.y + this.height / 2
        );
    }

    /**
     * 檢查是否與球拍碰撞
     */
    checkPaddleCollision(paddle) {
        if (!this.active) return false;

        if (
            this.x < paddle.x + paddle.width &&
            this.x + this.width > paddle.x &&
            this.y < paddle.y + paddle.height &&
            this.y + this.height > paddle.y
        ) {
            this.active = false;
            return true;
        }

        return false;
    }

    /**
     * 檢查是否掉出畫面
     */
    isOutOfBounds(canvasHeight) {
        return this.y > canvasHeight;
    }

    /**
     * 獲取道具狀態（用於存檔）
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            active: this.active
        };
    }

    /**
     * 載入道具狀態（用於讀檔）
     */
    loadState(state) {
        this.x = state.x;
        this.y = state.y;
        this.type = state.type;
        this.active = state.active;
        this.config = this.types[this.type];
    }
}

/**
 * PowerUpManager - 管理所有道具
 */
class PowerUpManager {
    constructor() {
        this.powerups = [];
        this.dropChance = 0.3; // 30% 掉落機率
    }

    /**
     * 嘗試生成道具（當磚塊被摧毀時）
     */
    trySpawn(brick) {
        if (Math.random() < this.dropChance) {
            const types = ['extend', 'shrink', 'slow', 'fast', 'multi', 'life', 'freeze',
                          'magnet', 'penetrate', 'giant', 'lightning'];
            const randomType = types[Math.floor(Math.random() * types.length)];

            const powerup = new PowerUp(
                brick.x + brick.width / 2 - 15,
                brick.y,
                randomType
            );

            this.powerups.push(powerup);
        }
    }

    /**
     * 更新所有道具
     */
    update(canvasHeight) {
        this.powerups.forEach(powerup => {
            if (powerup.active) {
                powerup.move();
            }
        });

        // 移除已失效或掉出畫面的道具
        this.powerups = this.powerups.filter(
            powerup => powerup.active || !powerup.isOutOfBounds(canvasHeight)
        );
    }

    /**
     * 繪製所有道具
     */
    draw(ctx) {
        this.powerups.forEach(powerup => powerup.draw(ctx));
    }

    /**
     * 檢查所有道具與球拍的碰撞
     */
    checkCollisions(paddle) {
        const collected = [];

        this.powerups.forEach(powerup => {
            if (powerup.checkPaddleCollision(paddle)) {
                collected.push(powerup.type);
            }
        });

        return collected;
    }

    /**
     * 清除所有道具
     */
    clear() {
        this.powerups = [];
    }

    /**
     * 獲取所有道具狀態（用於存檔）
     */
    getState() {
        return this.powerups.map(powerup => powerup.getState());
    }

    /**
     * 載入道具狀態（用於讀檔）
     */
    loadState(powerupsState) {
        this.powerups = powerupsState.map(state => {
            const powerup = new PowerUp(state.x, state.y, state.type);
            powerup.loadState(state);
            return powerup;
        });
    }
}
