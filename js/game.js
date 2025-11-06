/**
 * Game 模組 - 主遊戲邏輯
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paused = false;
        this.gameOver = false;

        // 遊戲物件
        this.paddle = new Paddle(canvas);
        this.balls = [new Ball(canvas)];
        this.brickManager = new BrickManager(canvas);
        this.powerupManager = new PowerUpManager();
        this.storage = new GameStorage();

        // 初始化關卡
        this.brickManager.createLevel(this.level);

        // 控制
        this.keys = {};
        this.mouseX = 0;

        // 動畫
        this.animationId = null;

        // 初始化控制器
        this.initControls();

        // 開始遊戲循環
        this.gameLoop();
    }

    /**
     * 初始化控制器
     */
    initControls() {
        // 鍵盤控制
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // 空白鍵發射
            if (e.code === 'Space') {
                e.preventDefault();
                this.balls.forEach(ball => ball.launch());
            }

            // P 鍵暫停
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }

            // S 鍵儲存
            if (e.key === 's' || e.key === 'S') {
                this.saveGame();
            }

            // L 鍵載入
            if (e.key === 'l' || e.key === 'L') {
                this.loadGame();
            }

            // R 鍵重新開始
            if (e.key === 'r' || e.key === 'R') {
                this.restart();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // 滑鼠控制
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });

        this.canvas.addEventListener('click', () => {
            this.balls.forEach(ball => ball.launch());
        });

        // 觸控支援
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.balls.forEach(ball => ball.launch());
        });
    }

    /**
     * 遊戲主循環
     */
    gameLoop() {
        if (!this.paused && !this.gameOver) {
            this.update();
            this.draw();
        }

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * 更新遊戲狀態
     */
    update() {
        // 更新球拍
        if (this.keys['ArrowLeft']) {
            this.paddle.moveLeft();
        } else if (this.keys['ArrowRight']) {
            this.paddle.moveRight();
        } else {
            this.paddle.stop();
            this.paddle.moveTo(this.mouseX);
        }

        this.paddle.move();
        this.paddle.updateEffects();

        // 更新球
        this.balls.forEach(ball => {
            ball.followPaddle(this.paddle);
            ball.move();
            ball.checkWallCollision();
            ball.checkPaddleCollision(this.paddle);
            ball.updateEffects();

            // 檢查磚塊碰撞
            const result = this.brickManager.checkCollisions(ball);
            if (result.score > 0) {
                this.score += result.score;
                this.updateScore();

                // 生成道具
                this.powerupManager.trySpawn(result.hitBrick);
            }
        });

        // 移除掉出畫面的球
        this.balls = this.balls.filter(ball => {
            if (ball.isOutOfBounds()) {
                if (this.balls.length > 1) {
                    return false; // 移除這顆球
                } else {
                    // 最後一顆球掉出，失去一條生命
                    this.loseLife();
                    return false;
                }
            }
            return true;
        });

        // 更新道具
        this.powerupManager.update(this.canvas.height);

        // 檢查道具碰撞
        const collectedPowerups = this.powerupManager.checkCollisions(this.paddle);
        collectedPowerups.forEach(type => this.applyPowerup(type));

        // 檢查關卡完成
        if (this.brickManager.allDestroyed()) {
            this.levelComplete();
        }
    }

    /**
     * 繪製遊戲畫面
     */
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製星空背景
        this.drawStars();

        // 繪製遊戲物件
        this.brickManager.draw(this.ctx);
        this.powerupManager.draw(this.ctx);
        this.paddle.draw(this.ctx);
        this.balls.forEach(ball => ball.draw(this.ctx));
    }

    /**
     * 繪製星空背景
     */
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.canvas.width;
            const y = (i * 217.3) % this.canvas.height;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    /**
     * 應用道具效果
     */
    applyPowerup(type) {
        switch (type) {
            case 'extend':
                this.paddle.extend();
                this.showMessage('板子延長！', '#00ff00');
                break;

            case 'shrink':
                this.paddle.shrink();
                this.showMessage('板子縮短！', '#ff0000');
                break;

            case 'slow':
                this.balls.forEach(ball => ball.slowDown());
                this.showMessage('球速減慢！', '#0000ff');
                break;

            case 'fast':
                this.balls.forEach(ball => ball.speedUp());
                this.showMessage('球速加快！', '#ffff00');
                break;

            case 'multi':
                // 複製當前的球
                if (this.balls.length < 5) {
                    const newBalls = this.balls.map(ball => {
                        const newBall = new Ball(this.canvas, ball.x, ball.y);
                        newBall.dx = -ball.dx + (Math.random() - 0.5) * 2;
                        newBall.dy = ball.dy;
                        newBall.launched = true;
                        return newBall;
                    });
                    this.balls = this.balls.concat(newBalls);
                    this.showMessage('多球！', '#ff00ff');
                }
                break;

            case 'life':
                this.lives++;
                this.updateLives();
                this.showMessage('額外生命！', '#ffd700');
                break;
        }
    }

    /**
     * 顯示訊息（簡單實現）
     */
    showMessage(text, color) {
        // 可以擴展為更好的視覺效果
        console.log(text);
    }

    /**
     * 失去一條生命
     */
    loseLife() {
        this.lives--;
        this.updateLives();

        if (this.lives <= 0) {
            this.endGame();
        } else {
            // 重置球和板子
            this.balls = [new Ball(this.canvas)];
            this.paddle.reset();
        }
    }

    /**
     * 關卡完成
     */
    levelComplete() {
        this.paused = true;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('levelComplete').classList.remove('hidden');
    }

    /**
     * 下一關
     */
    nextLevel() {
        this.level++;
        this.updateLevel();

        // 重置遊戲物件
        this.balls = [new Ball(this.canvas)];
        this.paddle.reset();
        this.powerupManager.clear();
        this.brickManager.createLevel(this.level);

        // 隱藏關卡完成畫面
        document.getElementById('levelComplete').classList.add('hidden');
        this.paused = false;
    }

    /**
     * 遊戲結束
     */
    endGame() {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    /**
     * 重新開始
     */
    restart() {
        // 重置所有狀態
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paused = false;
        this.gameOver = false;

        // 重置遊戲物件
        this.paddle = new Paddle(this.canvas);
        this.balls = [new Ball(this.canvas)];
        this.brickManager = new BrickManager(this.canvas);
        this.powerupManager = new PowerUpManager();
        this.brickManager.createLevel(this.level);

        // 更新 UI
        this.updateScore();
        this.updateLives();
        this.updateLevel();

        // 隱藏所有覆蓋層
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
    }

    /**
     * 暫停/繼續
     */
    togglePause() {
        if (this.gameOver) return;

        this.paused = !this.paused;

        if (this.paused) {
            document.getElementById('pauseScreen').classList.remove('hidden');
        } else {
            document.getElementById('pauseScreen').classList.add('hidden');
        }
    }

    /**
     * 繼續遊戲
     */
    resume() {
        this.paused = false;
        document.getElementById('pauseScreen').classList.add('hidden');
    }

    /**
     * 儲存遊戲
     */
    saveGame() {
        const gameState = {
            score: this.score,
            lives: this.lives,
            level: this.level,
            paddle: this.paddle.getState(),
            balls: this.balls.map(ball => ball.getState()),
            bricks: this.brickManager.getState(),
            powerups: this.powerupManager.getState()
        };

        if (this.storage.save(gameState)) {
            alert('遊戲已儲存！');
        } else {
            alert('儲存失敗！');
        }
    }

    /**
     * 載入遊戲
     */
    loadGame() {
        const gameState = this.storage.load();

        if (!gameState) {
            alert('沒有找到存檔！');
            return;
        }

        // 載入狀態
        this.score = gameState.score;
        this.lives = gameState.lives;
        this.level = gameState.level;

        // 載入遊戲物件
        this.paddle.loadState(gameState.paddle);

        this.balls = gameState.balls.map(ballState => {
            const ball = new Ball(this.canvas);
            ball.loadState(ballState);
            return ball;
        });

        this.brickManager.loadState(gameState.bricks);
        this.powerupManager.loadState(gameState.powerups);

        // 更新 UI
        this.updateScore();
        this.updateLives();
        this.updateLevel();

        // 重置遊戲狀態
        this.paused = false;
        this.gameOver = false;

        // 隱藏所有覆蓋層
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');

        alert('遊戲已載入！');
    }

    /**
     * 更新 UI
     */
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateLives() {
        document.getElementById('lives').textContent = this.lives;
    }

    updateLevel() {
        document.getElementById('level').textContent = this.level;
    }
}
