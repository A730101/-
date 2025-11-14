/**
 * Brick 模組 - 處理磚塊的邏輯
 */
class Brick {
    constructor(x, y, width, height, color, points, health = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.baseColor = color; // 保存基礎顏色
        this.color = color;
        this.points = points;
        this.visible = true;
        this.maxHealth = health;
        this.health = health;
    }

    /**
     * 更新磚塊顏色（根據生命值）
     */
    updateColor() {
        if (this.health <= 0) {
            this.visible = false;
            return;
        }

        // 根據生命值比例調整顏色透明度和亮度
        const healthRatio = this.health / this.maxHealth;

        // 將顏色轉換為帶透明度的版本
        // 生命值越低，顏色越暗
        const brightness = 0.5 + (healthRatio * 0.5); // 50% - 100% 亮度

        // 如果生命值大於 1，添加更強的視覺效果
        if (this.maxHealth > 1) {
            // 提取 RGB 值並調整亮度
            const hex = this.baseColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            const adjustedR = Math.floor(r * brightness);
            const adjustedG = Math.floor(g * brightness);
            const adjustedB = Math.floor(b * brightness);

            this.color = `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
        } else {
            this.color = this.baseColor;
        }
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

        // 邊框（生命值越高，邊框越粗）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = this.maxHealth > 1 ? 3 : 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 如果生命值大於 1，顯示生命值數字
        if (this.maxHealth > 1) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textX = this.x + this.width / 2;
            const textY = this.y + this.height / 2;

            // 繪製描邊文字（更清晰）
            ctx.strokeText(this.health, textX, textY);
            ctx.fillText(this.health, textX, textY);
        }

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

            // 減少生命值
            this.health--;
            this.updateColor();

            // 如果生命值歸零，隱藏磚塊
            if (this.health <= 0) {
                this.visible = false;
            }

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
            baseColor: this.baseColor,
            points: this.points,
            visible: this.visible,
            health: this.health,
            maxHealth: this.maxHealth
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
        this.baseColor = state.baseColor || state.color;
        this.points = state.points;
        this.visible = state.visible;
        this.health = state.health || 1;
        this.maxHealth = state.maxHealth || 1;
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

        // 關卡模式定義
        this.patterns = [
            'rectangle',    // 1. 矩形（經典）
            'pyramid',      // 2. 金字塔
            'diamond',      // 3. 鑽石
            'inverted',     // 4. 倒金字塔
            'checkerboard', // 5. 棋盤
            'circle',       // 6. 圓形
            'heart',        // 7. 心形
            'zigzag',       // 8. 之字形
            'cross',        // 9. 十字形
            'random'        // 10. 隨機分散
        ];
    }

    /**
     * 創建關卡磚塊
     */
    createLevel(level) {
        this.bricks = [];

        // 根據關卡選擇模式（循環使用）
        const patternIndex = (level - 1) % this.patterns.length;
        const pattern = this.patterns[patternIndex];

        // 根據關卡增加難度
        const difficulty = Math.floor((level - 1) / this.patterns.length) + 1;

        // 呼叫對應的模式生成器
        this.createPattern(pattern, difficulty, level);
    }

    /**
     * 根據模式創建磚塊
     */
    createPattern(pattern, difficulty, level) {
        const brickWidth = 75;
        const brickHeight = 25;
        const padding = 5;
        // 調整 offsetX 使 10 列磚塊能正確居中：(800 - (10*75 + 9*5)) / 2 = 2.5
        const offsetX = 3;
        const offsetY = 60;
        const maxCols = 10;
        const maxRows = 10;

        switch (pattern) {
            case 'rectangle':
                this.createRectangle(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'pyramid':
                this.createPyramid(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'diamond':
                this.createDiamond(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'inverted':
                this.createInvertedPyramid(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'checkerboard':
                this.createCheckerboard(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'circle':
                this.createCircle(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'heart':
                this.createHeart(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'zigzag':
                this.createZigzag(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'cross':
                this.createCross(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;

            case 'random':
                this.createRandom(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
                break;
        }
    }

    /**
     * 矩形模式（經典）
     */
    createRectangle(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const rows = Math.min(4 + difficulty, 10);
        const cols = 10;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
            }
        }
    }

    /**
     * 金字塔模式
     */
    createPyramid(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const maxRows = Math.min(8 + difficulty, 12);

        for (let row = 0; row < maxRows; row++) {
            const bricksInRow = maxRows - row;
            const startCol = Math.floor((10 - bricksInRow) / 2);

            for (let col = 0; col < bricksInRow; col++) {
                this.addBrick(row, startCol + col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
            }
        }
    }

    /**
     * 鑽石模式
     */
    createDiamond(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        // 限制 size 以確保不超出畫布（最多 16 行）
        const size = Math.min(5 + difficulty, 8);
        const centerRow = size - 1;
        const maxRows = size * 2 - 1; // 最多 15 行

        for (let row = 0; row < maxRows; row++) {
            let bricksInRow;
            if (row < size) {
                bricksInRow = row + 1;
            } else {
                bricksInRow = size * 2 - 1 - row;
            }

            const startCol = Math.floor((10 - bricksInRow) / 2);

            for (let col = 0; col < bricksInRow; col++) {
                this.addBrick(row, startCol + col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
            }
        }
    }

    /**
     * 倒金字塔模式
     */
    createInvertedPyramid(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const maxRows = Math.min(8 + difficulty, 12);

        for (let row = 0; row < maxRows; row++) {
            const bricksInRow = row + 1;
            const startCol = Math.floor((10 - bricksInRow) / 2);

            for (let col = 0; col < bricksInRow; col++) {
                this.addBrick(row, startCol + col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
            }
        }
    }

    /**
     * 棋盤模式
     */
    createCheckerboard(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const rows = Math.min(6 + difficulty, 10);
        const cols = 10;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if ((row + col) % 2 === 0) {
                    this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
                }
            }
        }
    }

    /**
     * 圓形模式
     */
    createCircle(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const centerRow = 5;
        const centerCol = 5;
        const radius = 3 + difficulty;

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
                if (distance <= radius && distance >= radius - 3) {
                    this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
                }
            }
        }
    }

    /**
     * 心形模式
     */
    createHeart(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const pattern = [
            [0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
            [1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        ];

        const maxRows = Math.min(pattern.length + difficulty - 1, 10);

        for (let row = 0; row < maxRows && row < pattern.length; row++) {
            for (let col = 0; col < 10 && col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
                }
            }
        }
    }

    /**
     * 之字形模式
     */
    createZigzag(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const rows = Math.min(8 + difficulty, 16);

        for (let row = 0; row < rows; row++) {
            const offset = Math.floor(Math.abs(Math.sin(row * 0.8) * 3));
            for (let col = offset; col < Math.min(offset + 7, 10); col++) {
                this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
            }
        }
    }

    /**
     * 十字形模式
     */
    createCross(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const size = Math.min(8 + difficulty, 16);

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < 10; col++) {
                // 垂直線
                if (col === 4 || col === 5) {
                    this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
                }
                // 水平線（動態調整中心位置）
                const centerRow = Math.floor(size / 2);
                if ((row === centerRow - 1 || row === centerRow) && col >= 1 && col <= 8) {
                    this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
                }
            }
        }
    }

    /**
     * 隨機分散模式
     */
    createRandom(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
        const rows = Math.min(10 + difficulty, 16);
        const cols = 10;
        const density = Math.min(0.5 + (difficulty * 0.03), 0.8); // 密度隨難度增加，最高 80%

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (Math.random() < density) {
                    this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
                }
            }
        }
    }

    /**
     * 新增單個磚塊的輔助方法
     */
    addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level) {
        const colorIndex = row % this.colors.length;
        const x = offsetX + col * (brickWidth + padding);
        const y = offsetY + row * (brickHeight + padding);

        // 邊界檢查：確保磚塊不會超出畫布
        if (x < 0 || x + brickWidth > this.canvas.width) {
            console.warn(`Brick out of horizontal bounds: x=${x}, width=${brickWidth}`);
            return;
        }
        if (y < 0 || y + brickHeight > this.canvas.height) {
            console.warn(`Brick out of vertical bounds: y=${y}, height=${brickHeight}`);
            return;
        }

        // 計算磚塊生命值（從第 6 關開始有生命值）
        let health = 1;
        if (level >= 6) {
            // 每 5 關增加 1 點生命值
            // 第 6-10 關: 2 HP
            // 第 11-15 關: 3 HP
            // 第 16-20 關: 4 HP
            // 以此類推，最高 5 HP
            health = Math.min(Math.floor((level - 1) / 5) + 1, 5);
        }

        const brick = new Brick(
            x, y,
            brickWidth, brickHeight,
            this.colors[colorIndex].color,
            this.colors[colorIndex].points + (level - 1) * 5,
            health
        );

        this.bricks.push(brick);
    }

    /**
     * 獲取當前關卡的模式名稱
     */
    getPatternName(level) {
        const patternIndex = (level - 1) % this.patterns.length;
        const patternNames = {
            rectangle: '矩形',
            pyramid: '金字塔',
            diamond: '鑽石',
            inverted: '倒金字塔',
            checkerboard: '棋盤',
            circle: '圓形',
            heart: '愛心',
            zigzag: '之字形',
            cross: '十字',
            random: '隨機'
        };
        return patternNames[this.patterns[patternIndex]] || '未知';
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
                state.color, state.points,
                state.maxHealth || 1
            );
            brick.loadState(state);
            return brick;
        });
    }
}
