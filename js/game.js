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

        // 初始化 UI
        this.updatePattern();

        // 初始化控制器
        this.initControls();

        // 魔王獎勵相關
        this.availableRewards = [];
        this.initRewards();

        // 開始遊戲循環
        this.gameLoop();
    }

    /**
     * 初始化可用的獎勵列表
     */
    initRewards() {
        this.rewardPool = [
            {
                id: 'fireball_extend',
                icon: '🔥',
                name: '火球時間延長',
                desc: '火球效果持續時間+50%',
                apply: () => {
                    // 延長所有球的火球效果時間
                    this.balls.forEach(ball => {
                        if (ball.fireballTimer > 0) {
                            ball.fireballTimer = Math.floor(ball.fireballTimer * 1.5);
                        } else {
                            ball.enableFireball();
                        }
                    });
                }
            },
            {
                id: 'iceball_extend',
                icon: '❄️',
                name: '冰球時間延長',
                desc: '冰球效果持續時間+50%',
                apply: () => {
                    this.balls.forEach(ball => {
                        if (ball.freezeTimer > 0) {
                            ball.freezeTimer = Math.floor(ball.freezeTimer * 1.5);
                        } else {
                            ball.enableFreeze();
                        }
                    });
                }
            },
            {
                id: 'multi_ball',
                icon: '⚡',
                name: '分身球',
                desc: '立即獲得一個額外的球',
                apply: () => {
                    if (this.balls.length < 10) {
                        const sourceBall = this.balls[0];
                        const newBall = new Ball(this.canvas, sourceBall.x, sourceBall.y);
                        newBall.dx = -sourceBall.dx + (Math.random() - 0.5) * 2;
                        newBall.dy = sourceBall.dy;
                        newBall.launched = true;
                        this.balls.push(newBall);
                    }
                }
            },
            {
                id: 'paddle_extend',
                icon: '🟢',
                name: '板子延長',
                desc: '永久延長板子長度',
                apply: () => {
                    this.paddle.permanentExtend();
                }
            },
            {
                id: 'extra_life',
                icon: '❤️',
                name: '額外生命',
                desc: '獲得一條額外生命',
                apply: () => {
                    this.lives++;
                    this.updateLives();
                }
            },
            {
                id: 'speed_boost',
                icon: '🚀',
                name: '速度提升',
                desc: '板子移動速度提升',
                apply: () => {
                    this.paddle.speedBoost();
                }
            },
            {
                id: 'shield',
                icon: '🛡️',
                name: '護盾',
                desc: '下次掉球不會失去生命',
                apply: () => {
                    this.shield = true;
                }
            },
            {
                id: 'mega_ball',
                icon: '💪',
                name: '巨大球',
                desc: '球的體積增大，更容易擊中',
                apply: () => {
                    this.balls.forEach(ball => {
                        ball.radius = Math.min(ball.radius * 1.5, 15);
                    });
                }
            },
            {
                id: 'combo_freeze_fire',
                icon: '🔥❄️',
                name: '冰火雙效',
                desc: '同時獲得冰球和火球效果',
                apply: () => {
                    this.balls.forEach(ball => {
                        ball.enableFreeze();
                        ball.enableFireball();
                    });
                }
            }
        ];
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

                // 檢查是否擊敗了魔王
                if (result.hitBrick && result.hitBrick instanceof BossBrick && !result.hitBrick.visible) {
                    this.onBossDefeated();
                } else {
                    // 生成道具（普通磚塊）
                    this.powerupManager.trySpawn(result.hitBrick);
                }
            }
        });

        // 移除掉出畫面的球
        const ballsBeforeFilter = this.balls.length;
        this.balls = this.balls.filter(ball => !ball.isOutOfBounds());

        // 檢查是否有球掉出
        const ballsLost = ballsBeforeFilter - this.balls.length;

        // 如果所有球都掉出了，失去一條生命
        if (ballsLost > 0 && this.balls.length === 0) {
            this.loseLife();
        }

        // 更新道具
        this.powerupManager.update(this.canvas.height);

        // 檢查道具碰撞
        const collectedPowerups = this.powerupManager.checkCollisions(this.paddle);
        collectedPowerups.forEach(type => this.applyPowerup(type));

        // 更新魔王磚塊
        this.brickManager.updateBosses(this.paddle.x + this.paddle.width / 2);

        // 檢查魔王子彈碰撞
        if (this.brickManager.checkBossProjectileCollisions(this.paddle)) {
            this.onBossProjectileHit();
        }

        // 檢查關卡完成
        if (this.brickManager.allDestroyed()) {
            this.levelComplete();
        }
    }

    /**
     * 當魔王子彈擊中玩家
     */
    onBossProjectileHit() {
        // 縮短板子作為懲罰
        this.paddle.shrink();
        this.showMessage('被火焰擊中！板子縮短！', '#ff4400');
    }

    /**
     * 當魔王被擊敗時
     */
    onBossDefeated() {
        // 暫停遊戲
        this.paused = true;

        // 從獎勵池中隨機選擇 3 個獎勵
        this.availableRewards = [];
        const poolCopy = [...this.rewardPool];

        for (let i = 0; i < 3 && poolCopy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * poolCopy.length);
            this.availableRewards.push(poolCopy[randomIndex]);
            poolCopy.splice(randomIndex, 1);
        }

        // 顯示獎勵卡片
        this.showRewardCards();
    }

    /**
     * 顯示獎勵卡片
     */
    showRewardCards() {
        for (let i = 0; i < 3; i++) {
            const reward = this.availableRewards[i];
            document.getElementById(`rewardIcon${i}`).textContent = reward.icon;
            document.getElementById(`rewardName${i}`).textContent = reward.name;
            document.getElementById(`rewardDesc${i}`).textContent = reward.desc;
        }

        document.getElementById('bossReward').classList.remove('hidden');
    }

    /**
     * 選擇獎勵
     */
    selectReward(index) {
        const reward = this.availableRewards[index];

        // 應用獎勵效果
        reward.apply();

        // 顯示訊息
        this.showMessage(`獲得：${reward.name}！`, '#ffd700');

        // 隱藏獎勵畫面
        document.getElementById('bossReward').classList.add('hidden');

        // 繼續遊戲
        this.paused = false;
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

            case 'freeze':
                this.balls.forEach(ball => ball.enableFreeze());
                this.showMessage('冰球效果！', '#00ffff');
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
        // 檢查是否有護盾
        if (this.shield) {
            this.shield = false;
            this.showMessage('護盾保護！', '#00ffff');
            // 重置球和板子但不扣生命
            this.balls = [new Ball(this.canvas)];
            this.paddle.reset();
            return;
        }

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

        // 顯示下一關的模式
        const nextPattern = this.brickManager.getPatternName(this.level + 1);
        document.getElementById('nextPattern').textContent = nextPattern;

        document.getElementById('levelComplete').classList.remove('hidden');
    }

    /**
     * 下一關
     */
    nextLevel() {
        this.level++;
        this.updateLevel();
        this.updatePattern();

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
        this.updatePattern();

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
        this.updatePattern();

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

    updatePattern() {
        const patternName = this.brickManager.getPatternName(this.level);
        document.getElementById('pattern').textContent = patternName;
    }
}
