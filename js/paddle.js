/**
 * Paddle 模組 - 處理球拍的邏輯
 */
class Paddle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 100;
        this.height = 15;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 30;
        this.speed = 8;
        this.dx = 0;

        // 預設尺寸（用於重置）
        this.defaultWidth = 100;
        this.minWidth = 60;
        this.maxWidth = 150;

        // 效果計時器
        this.effectTimer = 0;
    }

    /**
     * 移動球拍
     */
    move() {
        this.x += this.dx;

        // 邊界檢查
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
    }

    /**
     * 繪製球拍
     */
    draw(ctx) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';

        // 繪製主體
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 繪製高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height / 3);

        ctx.shadowBlur = 0;
    }

    /**
     * 設定移動方向
     */
    moveLeft() {
        this.dx = -this.speed;
    }

    moveRight() {
        this.dx = this.speed;
    }

    stop() {
        this.dx = 0;
    }

    /**
     * 移動到特定位置（用於滑鼠控制）
     */
    moveTo(x) {
        this.x = x - this.width / 2;

        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
    }

    /**
     * 延長球拍
     */
    extend() {
        if (this.width < this.maxWidth) {
            this.width = Math.min(this.width + 30, this.maxWidth);
            this.effectTimer = 300; // 5 秒（60fps * 5）
        }
    }

    /**
     * 縮短球拍
     */
    shrink() {
        if (this.width > this.minWidth) {
            this.width = Math.max(this.width - 30, this.minWidth);
            this.effectTimer = 300;
        }
    }

    /**
     * 永久延長球拍（魔王獎勵）
     */
    permanentExtend() {
        this.defaultWidth = Math.min(this.defaultWidth + 20, 140);
        this.width = Math.min(this.width + 20, 180);
        this.maxWidth = Math.min(this.maxWidth + 20, 200);
    }

    /**
     * 速度提升（魔王獎勵）
     */
    speedBoost() {
        this.speed = Math.min(this.speed + 2, 12);
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
     * 重置球拍到預設狀態
     */
    reset() {
        this.width = this.defaultWidth;
        this.effectTimer = 0;
    }

    /**
     * 獲取球拍狀態（用於存檔）
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            effectTimer: this.effectTimer
        };
    }

    /**
     * 載入球拍狀態（用於讀檔）
     */
    loadState(state) {
        this.x = state.x;
        this.y = state.y;
        this.width = state.width;
        this.effectTimer = state.effectTimer;
    }
}
