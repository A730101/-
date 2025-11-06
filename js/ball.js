/**
 * Ball 模組 - 處理球的邏輯
 */
class Ball {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.radius = 8;
        this.x = x || canvas.width / 2;
        this.y = y || canvas.height - 50;
        this.dx = 0;
        this.dy = 0;
        this.defaultSpeed = 5;
        this.speed = this.defaultSpeed;
        this.launched = false;

        // 效果計時器
        this.effectTimer = 0;
    }

    /**
     * 發射球
     */
    launch() {
        if (!this.launched) {
            const angle = (Math.random() * 60 - 30) * Math.PI / 180; // -30 到 30 度
            this.dx = this.speed * Math.sin(angle);
            this.dy = -this.speed * Math.cos(angle);
            this.launched = true;
        }
    }

    /**
     * 移動球
     */
    move() {
        if (this.launched) {
            this.x += this.dx;
            this.y += this.dy;
        }
    }

    /**
     * 繪製球
     */
    draw(ctx) {
        // 繪製光暈
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // 繪製球體
        ctx.fillStyle = '#00c8ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00c8ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    /**
     * 檢查牆壁碰撞
     */
    checkWallCollision() {
        // 左右牆壁
        if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
            this.dx = -this.dx;
            this.x = this.x < this.canvas.width / 2 ? this.radius : this.canvas.width - this.radius;
        }

        // 上牆
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
            this.y = this.radius;
        }
    }

    /**
     * 檢查球拍碰撞
     */
    checkPaddleCollision(paddle) {
        if (
            this.y + this.radius >= paddle.y &&
            this.y - this.radius <= paddle.y + paddle.height &&
            this.x >= paddle.x &&
            this.x <= paddle.x + paddle.width
        ) {
            // 計算擊球點相對位置（-1 到 1）
            const hitPos = (this.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

            // 根據擊球點調整反彈角度
            const angle = hitPos * 60 * Math.PI / 180; // 最大 60 度
            this.dx = this.speed * Math.sin(angle);
            this.dy = -this.speed * Math.cos(angle);

            // 確保球在板子上方
            this.y = paddle.y - this.radius;

            return true;
        }
        return false;
    }

    /**
     * 檢查是否掉出畫面
     */
    isOutOfBounds() {
        return this.y - this.radius > this.canvas.height;
    }

    /**
     * 反彈（用於磚塊碰撞）
     */
    bounceX() {
        this.dx = -this.dx;
    }

    bounceY() {
        this.dy = -this.dy;
    }

    /**
     * 加速球
     */
    speedUp() {
        this.speed = this.defaultSpeed * 1.5;
        this.updateVelocity();
        this.effectTimer = 300; // 5 秒
    }

    /**
     * 減速球
     */
    slowDown() {
        this.speed = this.defaultSpeed * 0.7;
        this.updateVelocity();
        this.effectTimer = 300; // 5 秒
    }

    /**
     * 更新速度向量（保持方向，改變速度）
     */
    updateVelocity() {
        const angle = Math.atan2(this.dy, this.dx);
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
    }

    /**
     * 更新效果計時器
     */
    updateEffects() {
        if (this.effectTimer > 0) {
            this.effectTimer--;
            if (this.effectTimer === 0) {
                this.reset();
            }
        }
    }

    /**
     * 重置速度到預設值
     */
    reset() {
        this.speed = this.defaultSpeed;
        this.updateVelocity();
        this.effectTimer = 0;
    }

    /**
     * 跟隨球拍（未發射時）
     */
    followPaddle(paddle) {
        if (!this.launched) {
            this.x = paddle.x + paddle.width / 2;
            this.y = paddle.y - this.radius - 5;
        }
    }

    /**
     * 獲取球狀態（用於存檔）
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy,
            speed: this.speed,
            launched: this.launched,
            effectTimer: this.effectTimer
        };
    }

    /**
     * 載入球狀態（用於讀檔）
     */
    loadState(state) {
        this.x = state.x;
        this.y = state.y;
        this.dx = state.dx;
        this.dy = state.dy;
        this.speed = state.speed;
        this.launched = state.launched;
        this.effectTimer = state.effectTimer;
    }
}
