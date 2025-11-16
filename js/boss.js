/**
 * BossProjectile - 魔王磚塊發射的子彈
 */
class BossProjectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 20;
        this.speed = 4;
        this.active = true;
    }

    /**
     * 移動子彈
     */
    move() {
        this.y += this.speed;
    }

    /**
     * 繪製子彈
     */
    draw(ctx) {
        if (!this.active) return;

        // 繪製火焰子彈效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff4400';

        // 子彈主體
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // 內部亮光
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 5);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height - 5);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    /**
     * 檢查與球拍的碰撞
     */
    checkPaddleCollision(paddle) {
        if (!this.active) return false;

        if (
            this.x >= paddle.x &&
            this.x <= paddle.x + paddle.width &&
            this.y + this.height >= paddle.y &&
            this.y <= paddle.y + paddle.height
        ) {
            this.active = false;
            return true;
        }

        return false;
    }

    /**
     * 檢查是否超出畫面
     */
    isOutOfBounds(canvasHeight) {
        return this.y > canvasHeight;
    }

    /**
     * 獲取狀態（用於存檔）
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            active: this.active
        };
    }

    /**
     * 載入狀態（用於讀檔）
     */
    loadState(state) {
        this.x = state.x;
        this.y = state.y;
        this.active = state.active;
    }
}

/**
 * BossBrick - 魔王磚塊
 */
class BossBrick {
    constructor(x, y, width, height, health = 10) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxHealth = health;
        this.health = health;
        this.visible = true;
        this.points = health * 50; // 高分獎勵

        // 攻擊相關
        this.attackCooldown = 0;
        this.attackInterval = 120; // 每 2 秒攻擊一次（60fps）
        this.projectiles = [];

        // 動畫
        this.pulseTimer = 0;
        this.pulseDirection = 1;
    }

    /**
     * 更新魔王磚塊
     */
    update() {
        if (!this.visible) return;

        // 更新脈動動畫
        this.pulseTimer += this.pulseDirection * 0.05;
        if (this.pulseTimer > 1 || this.pulseTimer < 0) {
            this.pulseDirection *= -1;
        }

        // 更新攻擊冷卻
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        } else {
            this.attack();
            this.attackCooldown = this.attackInterval;
        }

        // 更新子彈
        this.projectiles.forEach(p => p.move());

        // 移除超出畫面的子彈
        this.projectiles = this.projectiles.filter(p => p.active && !p.isOutOfBounds(600));
    }

    /**
     * 發射攻擊
     */
    attack() {
        // 從魔王磚塊底部發射子彈
        const projectile = new BossProjectile(
            this.x + this.width / 2,
            this.y + this.height
        );
        this.projectiles.push(projectile);
    }

    /**
     * 繪製魔王磚塊
     */
    draw(ctx) {
        if (!this.visible) return;

        // 脈動效果
        const pulse = 0.8 + this.pulseTimer * 0.2;

        // 外發光效果
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = '#ff0066';

        // 魔王磚塊主體 - 暗紅色
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#660033');
        gradient.addColorStop(0.5, '#990044');
        gradient.addColorStop(1, '#660033');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 邪惡的裝飾
        ctx.strokeStyle = '#ff0066';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 內部紋路
        ctx.strokeStyle = 'rgba(255, 0, 102, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 5);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height - 5);
        ctx.moveTo(this.x + this.width - 10, this.y + 5);
        ctx.lineTo(this.x + 10, this.y + this.height - 5);
        ctx.stroke();

        // 顯示血量
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ff0066';
        ctx.lineWidth = 3;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = this.x + this.width / 2;
        const textY = this.y + this.height / 2;

        // 繪製 BOSS 標記和血量
        ctx.strokeText(`💀${this.health}`, textX, textY);
        ctx.fillText(`💀${this.health}`, textX, textY);

        // 繪製子彈
        this.projectiles.forEach(p => p.draw(ctx));
    }

    /**
     * 檢查與球的碰撞
     */
    checkCollision(ball) {
        if (!this.visible) return false;

        if (
            ball.x + ball.radius > this.x &&
            ball.x - ball.radius < this.x + this.width &&
            ball.y + ball.radius > this.y &&
            ball.y - ball.radius < this.y + this.height
        ) {
            // 計算碰撞方向
            const overlapLeft = ball.x + ball.radius - this.x;
            const overlapRight = this.x + this.width - (ball.x - ball.radius);
            const overlapTop = ball.y + ball.radius - this.y;
            const overlapBottom = this.y + this.height - (ball.y - ball.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
                ball.bounceX();
            } else {
                ball.bounceY();
            }

            // 魔王受傷
            this.health--;

            if (this.health <= 0) {
                this.visible = false;
            }

            return true;
        }

        return false;
    }

    /**
     * 檢查子彈是否擊中球拍
     */
    checkProjectileCollision(paddle) {
        let hit = false;
        this.projectiles.forEach(p => {
            if (p.checkPaddleCollision(paddle)) {
                hit = true;
            }
        });
        return hit;
    }

    /**
     * 獲取狀態（用於存檔）
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            maxHealth: this.maxHealth,
            health: this.health,
            visible: this.visible,
            attackCooldown: this.attackCooldown,
            projectiles: this.projectiles.map(p => p.getState())
        };
    }

    /**
     * 載入狀態（用於讀檔）
     */
    loadState(state) {
        this.x = state.x;
        this.y = state.y;
        this.width = state.width;
        this.height = state.height;
        this.maxHealth = state.maxHealth;
        this.health = state.health;
        this.visible = state.visible;
        this.attackCooldown = state.attackCooldown || 0;

        if (state.projectiles) {
            this.projectiles = state.projectiles.map(pState => {
                const p = new BossProjectile(pState.x, pState.y);
                p.loadState(pState);
                return p;
            });
        }
    }
}
