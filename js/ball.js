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

        // 冰凍效果
        this.freezeEffect = false;
        this.freezeTimer = 0;
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
            // 檢查並修正極端角度
            this.normalizeAngle();

            this.x += this.dx;
            this.y += this.dy;
        }
    }

    /**
     * 規範化球的移動角度，防止太平或太陡
     */
    normalizeAngle() {
        // 計算當前角度
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

        // 如果速度太小，重置為預設速度
        if (speed < 1) {
            this.dx = 0;
            this.dy = -this.defaultSpeed;
            return;
        }

        // 限制最小垂直速度分量（防止太平）
        const minVerticalSpeed = 1.0;
        if (Math.abs(this.dy) < minVerticalSpeed) {
            // 保持原有方向符號，只調整速度大小
            const targetAngle = Math.PI / 6; // 30度

            // 計算新的速度分量（保持總速度不變）
            const newDy = speed * Math.sin(targetAngle);
            const newDx = speed * Math.cos(targetAngle);

            // 保持原有方向
            this.dy = Math.abs(newDy) * (this.dy >= 0 ? 1 : -1);
            this.dx = Math.abs(newDx) * (this.dx >= 0 ? 1 : -1);
        }

        // 限制最小水平速度分量（防止太陡）
        const minHorizontalSpeed = 0.5;
        if (Math.abs(this.dx) < minHorizontalSpeed && Math.abs(this.dy) > minVerticalSpeed) {
            // 添加小的水平分量，保持或隨機選擇方向
            const direction = this.dx !== 0 ? Math.sign(this.dx) : (Math.random() > 0.5 ? 1 : -1);
            this.dx = minHorizontalSpeed * direction;
        }
    }

    /**
     * 繪製球
     */
    draw(ctx) {
        // 根據冰凍效果選擇顏色
        const ballColor = this.freezeEffect ? '#00ffff' : '#00c8ff';
        const glowColor = this.freezeEffect ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 200, 255, 0.6)';

        // 繪製光暈
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, glowColor);
        gradient.addColorStop(1, this.freezeEffect ? 'rgba(0, 255, 255, 0)' : 'rgba(0, 200, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // 繪製球體
        ctx.fillStyle = ballColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ballColor;
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

            // 防止完全垂直運動 - 添加小角度偏移
            if (Math.abs(this.dx) < 0.5) {
                this.dx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
            }
        }

        // 上牆
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
            this.y = this.radius;

            // 防止完全水平運動 - 添加小角度偏移
            if (Math.abs(this.dy) < 0.5) {
                this.dy = 1.5;
            }
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

            // 根據擊球點調整反彈角度（限制在 -60 到 60 度之間）
            const angle = hitPos * 60 * Math.PI / 180; // 最大 60 度
            this.dx = this.speed * Math.sin(angle);
            this.dy = -this.speed * Math.cos(angle);

            // 確保有最小垂直速度，避免太平
            if (Math.abs(this.dy) < 2) {
                this.dy = -2;
            }

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
        return this.y > this.canvas.height;
    }

    /**
     * 反彈（用於磚塊碰撞）
     */
    bounceX() {
        this.dx = -this.dx;

        // 防止完全垂直運動 - 添加小角度偏移
        if (Math.abs(this.dx) < 0.5) {
            this.dx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
        }
    }

    bounceY() {
        this.dy = -this.dy;

        // 防止完全水平運動 - 添加小角度偏移
        if (Math.abs(this.dy) < 0.5) {
            this.dy = (this.dy > 0 ? 1 : -1) * 1.5;
        }
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
     * 啟用冰凍效果
     */
    enableFreeze() {
        this.freezeEffect = true;
        this.freezeTimer = 600; // 10 秒（比其他效果更長）
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

        // 更新冰凍效果計時器
        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            if (this.freezeTimer === 0) {
                this.freezeEffect = false;
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
            effectTimer: this.effectTimer,
            freezeEffect: this.freezeEffect,
            freezeTimer: this.freezeTimer
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
        this.freezeEffect = state.freezeEffect || false;
        this.freezeTimer = state.freezeTimer || 0;
    }
}
