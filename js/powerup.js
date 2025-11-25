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
            extend: { color: '#00ff00', emoji: '🟢', name: '延長板子', rarity: 'common' },
            shrink: { color: '#ff0000', emoji: '🔴', name: '縮短板子', rarity: 'common' },
            slow: { color: '#0000ff', emoji: '🔵', name: '減速球', rarity: 'common' },
            fast: { color: '#ffff00', emoji: '🟡', name: '加速球', rarity: 'common' },
            multi: { color: '#ff00ff', emoji: '🟣', name: '多球', rarity: 'uncommon' },
            life: { color: '#ffd700', emoji: '⭐', name: '額外生命', rarity: 'rare' },
            freeze: { color: '#00ffff', emoji: '❄️', name: '冰球', rarity: 'uncommon' },
            magnet: { color: '#ff69b4', emoji: '🧲', name: '磁力吸附', rarity: 'uncommon' },
            penetrate: { color: '#ff8800', emoji: '⚡', name: '穿透球', rarity: 'uncommon' },
            giant: { color: '#00ff66', emoji: '🎾', name: '巨大球', rarity: 'uncommon' },
            lightning: { color: '#9400d3', emoji: '⚡', name: '閃電鏈', rarity: 'rare' },
            // 新道具
            triple: { color: '#ff1493', emoji: '🔮', name: '三倍球', rarity: 'rare' },
            explosive: { color: '#ff4500', emoji: '💣', name: '爆炸球', rarity: 'rare' },
            ghost: { color: '#9370db', emoji: '👻', name: '幽靈球', rarity: 'rare' },
            fire: { color: '#ff6347', emoji: '🔥', name: '火焰球', rarity: 'rare' },
            sticky: { color: '#ffa500', emoji: '🎯', name: '黏性板', rarity: 'uncommon' },
            invincible: { color: '#ffd700', emoji: '🛡️', name: '無敵', rarity: 'epic' },
            coin: { color: '#ffff00', emoji: '💰', name: '金幣', rarity: 'common' },
            doublescore: { color: '#ff69ff', emoji: '⭐', name: '雙倍分數', rarity: 'rare' },
            random: { color: '#rainbow', emoji: '🎲', name: '隨機增益', rarity: 'epic' }
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
            const randomType = this.getRandomPowerupType();

            const powerup = new PowerUp(
                brick.x + brick.width / 2 - 15,
                brick.y,
                randomType
            );

            this.powerups.push(powerup);
        }
    }

    /**
     * 根據稀有度隨機選擇道具類型
     */
    getRandomPowerupType() {
        const rand = Math.random();

        // 定義稀有度權重
        // common: 50%, uncommon: 30%, rare: 15%, epic: 5%
        const commonTypes = ['extend', 'shrink', 'slow', 'fast', 'coin'];
        const uncommonTypes = ['multi', 'freeze', 'magnet', 'penetrate', 'giant', 'sticky'];
        const rareTypes = ['life', 'lightning', 'triple', 'explosive', 'ghost', 'fire', 'doublescore'];
        const epicTypes = ['invincible', 'random'];

        if (rand < 0.5) {
            // 50% - common
            return commonTypes[Math.floor(Math.random() * commonTypes.length)];
        } else if (rand < 0.8) {
            // 30% - uncommon
            return uncommonTypes[Math.floor(Math.random() * uncommonTypes.length)];
        } else if (rand < 0.95) {
            // 15% - rare
            return rareTypes[Math.floor(Math.random() * rareTypes.length)];
        } else {
            // 5% - epic
            return epicTypes[Math.floor(Math.random() * epicTypes.length)];
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
