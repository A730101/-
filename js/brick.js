/**
 * Brick 模組 - 處理磚塊的邏輯
 */
class Brick {
    constructor(x, y, width, height, color, points) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.points = points;
        this.visible = true;
    }

    /**
     * 繪製磚塊
     */
    draw(ctx) {
        if (!this.visible) return;

        // 磚塊主體
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height / 3);

        // 邊框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.shadowBlur = 0;
    }

    /**
     * 檢查與球的碰撞
     */
    checkCollision(ball) {
        if (!this.visible) return false;

        // AABB 碰撞檢測
        if (
            ball.x + ball.radius > this.x &&
            ball.x - ball.radius < this.x + this.width &&
            ball.y + ball.radius > this.y &&
            ball.y - ball.radius < this.y + this.height
        ) {
            // 計算重疊區域來判斷碰撞方向
            const overlapLeft = ball.x + ball.radius - this.x;
            const overlapRight = this.x + this.width - (ball.x - ball.radius);
            const overlapTop = ball.y + ball.radius - this.y;
            const overlapBottom = this.y + this.height - (ball.y - ball.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            // 判斷主要碰撞方向
            if (minOverlapX < minOverlapY) {
                ball.bounceX();
            } else {
                ball.bounceY();
            }

            this.visible = false;
            return true;
        }

        return false;
    }

    /**
     * 獲取磚塊狀態（用於存檔）
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: this.color,
            points: this.points,
            visible: this.visible
        };
    }

    /**
     * 載入磚塊狀態（用於讀檔）
     */
    loadState(state) {
        this.x = state.x;
        this.y = state.y;
        this.width = state.width;
        this.height = state.height;
        this.color = state.color;
        this.points = state.points;
        this.visible = state.visible;
    }
}

/**
 * BrickManager - 管理所有磚塊
 */
class BrickManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.bricks = [];
        this.colors = [
            { color: '#ff6b6b', points: 10 },
            { color: '#4ecdc4', points: 20 },
            { color: '#45b7d1', points: 30 },
            { color: '#f9ca24', points: 40 },
            { color: '#6c5ce7', points: 50 }
        ];
    }

    /**
     * 創建關卡磚塊
     */
    createLevel(level) {
        this.bricks = [];

        const brickWidth = 75;
        const brickHeight = 25;
        const padding = 5;
        const offsetX = 35;
        const offsetY = 60;

        const rows = Math.min(5 + level, 10); // 隨關卡增加行數
        const cols = 10;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const colorIndex = row % this.colors.length;
                const x = offsetX + col * (brickWidth + padding);
                const y = offsetY + row * (brickHeight + padding);

                const brick = new Brick(
                    x, y,
                    brickWidth, brickHeight,
                    this.colors[colorIndex].color,
                    this.colors[colorIndex].points + (level - 1) * 5
                );

                this.bricks.push(brick);
            }
        }
    }

    /**
     * 繪製所有磚塊
     */
    draw(ctx) {
        this.bricks.forEach(brick => brick.draw(ctx));
    }

    /**
     * 檢查所有磚塊與球的碰撞
     */
    checkCollisions(ball) {
        let score = 0;
        let hitBrick = null;

        for (const brick of this.bricks) {
            if (brick.checkCollision(ball)) {
                score += brick.points;
                hitBrick = brick;
                break; // 一次只處理一個碰撞
            }
        }

        return { score, hitBrick };
    }

    /**
     * 檢查是否所有磚塊都被摧毀
     */
    allDestroyed() {
        return this.bricks.every(brick => !brick.visible);
    }

    /**
     * 獲取可見磚塊數量
     */
    getVisibleCount() {
        return this.bricks.filter(brick => brick.visible).length;
    }

    /**
     * 獲取所有磚塊狀態（用於存檔）
     */
    getState() {
        return this.bricks.map(brick => brick.getState());
    }

    /**
     * 載入磚塊狀態（用於讀檔）
     */
    loadState(bricksState) {
        this.bricks = bricksState.map(state => {
            const brick = new Brick(
                state.x, state.y,
                state.width, state.height,
                state.color, state.points
            );
            brick.loadState(state);
            return brick;
        });
    }
}
