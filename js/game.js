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

        // 新系統
        this.audioManager = new AudioManager();
        this.particleManager = new ParticleManager();
        this.comboManager = new ComboManager();
        this.skillManager = new SkillManager();
        this.skillLevelManager = typeof SkillLevelManager !== 'undefined' ? new SkillLevelManager() : null;
        this.achievementManager = new AchievementManager();
        this.stats = new GameStats();

        // 道具效果計時器
        this.powerupTimers = {
            invincible: 0,
            doublescore: 0,
            sticky: false,
            fire: [],
            explosive: false,
            ghost: false
        };

        // 增強系統
        this.ballEnhancements = [];
        this.paddleEnhancement = typeof PaddleEnhancement !== 'undefined' ? new PaddleEnhancement(this.paddle) : null;
        this.randomEventSystem = typeof RandomEventSystem !== 'undefined' ? new RandomEventSystem() : null;

        // 為每個球初始化增強
        if (typeof BallEnhancement !== 'undefined') {
            this.balls.forEach(ball => {
                this.ballEnhancements.push(new BallEnhancement(ball));
            });
        }

        // 初始化關卡
        this.brickManager.createLevel(this.level);

        // 控制
        this.keys = {};
        this.mouseX = 0;

        // 動畫
        this.animationId = null;

        // 初始化 UI
        this.updatePattern();
        this.updateComboUI();
        this.updateSkillsUI();

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

            // Q 鍵使用時間減速技能
            if (e.key === 'q' || e.key === 'Q') {
                const success = this.skillLevelManager ?
                    this.skillManager.useSkillWithLevel('slowtime', this.skillLevelManager) :
                    this.skillManager.useSkill('slowtime');

                if (success) {
                    this.audioManager.resume();
                    this.particleManager.createSkillEffect(this.paddle.x + this.paddle.width / 2, this.paddle.y, 'slowtime');
                    this.stats.skillsUsed++;
                    this.updateSkillsUI();
                }
            }

            // W 鍵使用激光技能
            if (e.key === 'w' || e.key === 'W') {
                const success = this.skillLevelManager ?
                    this.skillManager.useSkillWithLevel('laser', this.skillLevelManager) :
                    this.skillManager.useSkill('laser');

                if (success) {
                    this.audioManager.resume();
                    this.particleManager.createSkillEffect(this.paddle.x + this.paddle.width / 2, this.paddle.y, 'laser');
                    this.stats.skillsUsed++;
                    this.updateSkillsUI();
                }
            }

            // E 鍵使用護盾技能
            if (e.key === 'e' || e.key === 'E') {
                const success = this.skillLevelManager ?
                    this.skillManager.useSkillWithLevel('shield', this.skillLevelManager) :
                    this.skillManager.useSkill('shield');

                if (success) {
                    this.audioManager.resume();
                    this.particleManager.createSkillEffect(this.paddle.x + this.paddle.width / 2, this.paddle.y, 'shield');
                    this.stats.skillsUsed++;
                    this.updateSkillsUI();
                }
            }

            // M 鍵切換音效
            if (e.key === 'm' || e.key === 'M') {
                const enabled = this.audioManager.toggle();
                this.showMessage(enabled ? '音效已開啟' : '音效已關閉', '#ffffff');
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
        // 獲取時間減速效果
        const timeScale = this.skillManager.getSlowTimeEffect();

        // 更新所有系統
        this.particleManager.update();
        this.comboManager.update();
        this.skillManager.update();
        this.stats.currentLevelTime++;

        // 更新增強系統
        if (this.paddleEnhancement) {
            this.paddleEnhancement.update();
        }

        this.ballEnhancements.forEach((enhancement, index) => {
            if (enhancement && this.balls[index]) {
                enhancement.update();

                // 處理磁力吸附
                if (this.paddleEnhancement) {
                    const magnetForce = this.paddleEnhancement.checkMagnetAttraction(this.balls[index]);
                    if (magnetForce) {
                        this.balls[index].dx += magnetForce.x;
                        this.balls[index].dy += magnetForce.y;
                    }
                }
            }
        });

        // 更新隨機事件系統
        if (this.randomEventSystem) {
            this.randomEventSystem.update();
        }

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

        // 更新球（應用時間減速）
        this.balls.forEach(ball => {
            ball.followPaddle(this.paddle);

            // 應用時間減速效果
            const originalDx = ball.dx;
            const originalDy = ball.dy;
            ball.dx *= timeScale;
            ball.dy *= timeScale;

            ball.move();
            ball.checkWallCollision();

            // 恢復原始速度
            ball.dx = originalDx;
            ball.dy = originalDy;

            // 檢查球拍碰撞
            if (ball.checkPaddleCollision(this.paddle)) {
                this.audioManager.playPaddleHit();
                this.particleManager.createPaddleHitEffect(ball.x, ball.y);
            }

            // 檢查護盾碰撞
            if (this.skillManager.checkShieldCollision(ball)) {
                this.audioManager.playPaddleHit();
            }

            ball.updateEffects();

            // 檢查磚塊碰撞
            const result = this.brickManager.checkCollisions(ball);
            if (result.score > 0) {
                // 連擊系統
                const combo = this.comboManager.addCombo();
                let multipliedScore = this.comboManager.calculateScore(result.score);

                // 應用雙倍分數效果
                if (this.powerupTimers.doublescore > 0) {
                    multipliedScore *= 2;
                }

                this.score += multipliedScore;
                this.updateScore();

                // 技能經驗值獲取
                if (this.skillLevelManager) {
                    const expAmount = Math.max(1, Math.floor(result.score / 10));
                    ['slowtime', 'laser', 'shield'].forEach(skillName => {
                        const leveledUp = this.skillLevelManager.addExp(skillName, expAmount);
                        if (leveledUp) {
                            const level = this.skillLevelManager.getLevel(skillName);
                            const desc = this.skillLevelManager.getLevelDescription(skillName, level);
                            this.showMessage(`技能升級！${skillName} Lv.${level} - ${desc}`, '#ffff00');
                            this.audioManager.playLevelUp();
                        }
                    });
                    this.updateSkillsUI();
                }

                // 統計
                this.stats.bricksDestroyed++;

                // 播放音效
                if (result.hitBrick && !result.hitBrick.visible) {
                    this.audioManager.playBrickDestroy();
                    this.particleManager.createBrickExplosion(
                        result.hitBrick.x, result.hitBrick.y,
                        result.hitBrick.width, result.hitBrick.height,
                        result.hitBrick.baseColor || result.hitBrick.color
                    );

                    // 處理特殊磚塊
                    this.handleSpecialBrick(result.hitBrick);

                    // 處理閃電鏈效果
                    const ballIndex = this.balls.indexOf(ball);
                    if (ballIndex >= 0 && this.ballEnhancements[ballIndex] &&
                        this.ballEnhancements[ballIndex].hasLightning()) {
                        this.applyLightningChain(result.hitBrick);
                    }
                } else {
                    this.audioManager.playBrickHit();
                }

                // 連擊特效和音效
                if (combo >= 5) {
                    this.audioManager.playCombo(combo);
                    this.particleManager.createComboEffect(ball.x, ball.y, combo);
                }

                this.updateComboUI();

                // 生成道具
                const dropChance = result.hitBrick && result.hitBrick.type === 'gold' ?
                    result.hitBrick.powerupDropChance : this.powerupManager.dropChance;

                if (Math.random() < dropChance) {
                    this.powerupManager.trySpawn(result.hitBrick);
                    this.audioManager.playPowerUpSpawn();
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
        collectedPowerups.forEach(type => {
            this.applyPowerup(type);
            this.audioManager.playPowerUpCollect();
            this.stats.powerupsCollected++;
            if (type === 'life') {
                this.stats.lifeCount++;
            }
        });

        // 檢查激光技能
        if (this.skillManager.isSkillActive('laser')) {
            this.brickManager.bricks.forEach(brick => {
                if (brick.visible && this.skillManager.checkLaserHit(brick, this.paddle.x, this.paddle.width)) {
                    brick.visible = false;
                    this.score += brick.points;
                    this.stats.bricksDestroyed++;
                    this.particleManager.createBrickExplosion(brick.x, brick.y, brick.width, brick.height, brick.color);
                    this.audioManager.playBrickDestroy();
                }
            });
        }

        // 更新魔王磚塊
        this.brickManager.updateBosses();

        // 檢查魔王子彈碰撞
        if (this.brickManager.checkBossProjectileCollisions(this.paddle)) {
            this.onBossProjectileHit();
        }

        // 更新技能 UI
        this.updateSkillsUI();

        // 檢查成就
        const newAchievements = this.achievementManager.checkAchievements({
            score: this.score,
            level: this.level,
            lives: this.lives,
            stats: this.stats.getState(),
            combo: this.comboManager.getState()
        });

        // 顯示新解鎖的成就
        newAchievements.forEach(achievement => {
            this.showAchievement(achievement);
        });

        // 更新道具計時器
        this.updatePowerupTimers();

        // 檢查關卡完成
        if (this.brickManager.allDestroyed()) {
            this.levelComplete();
        }
    }

    /**
     * 更新道具計時器
     */
    updatePowerupTimers() {
        // 無敵時間
        if (this.powerupTimers.invincible > 0) {
            this.powerupTimers.invincible--;
            if (this.powerupTimers.invincible === 0) {
                this.showMessage('無敵結束', '#888');
            }
        }

        // 雙倍分數
        if (this.powerupTimers.doublescore > 0) {
            this.powerupTimers.doublescore--;
            if (this.powerupTimers.doublescore === 0) {
                this.showMessage('雙倍分數結束', '#888');
            }
        }

        // 爆炸球
        if (this.powerupTimers.explosive > 0) {
            this.powerupTimers.explosive--;
        }

        // 幽靈球
        if (this.powerupTimers.ghost > 0) {
            this.powerupTimers.ghost--;
        }

        // 火焰球
        this.powerupTimers.fire = this.powerupTimers.fire.filter(fire => {
            fire.timer--;
            return fire.timer > 0;
        });
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
     * 繪製遊戲畫面
     */
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製星空背景
        this.drawStars();

        // 繪製護盾（在遊戲物件下方）
        this.skillManager.drawShield(this.ctx, this.canvas.width);

        // 繪製球拍增強效果（磁力場等）
        if (this.paddleEnhancement) {
            this.paddleEnhancement.draw(this.ctx);
        }

        // 繪製遊戲物件
        this.brickManager.draw(this.ctx);
        this.powerupManager.draw(this.ctx);
        this.paddle.draw(this.ctx);

        // 繪製球的增強效果（尾迹等）
        this.ballEnhancements.forEach((enhancement, index) => {
            if (enhancement && this.balls[index]) {
                enhancement.draw(this.ctx);
            }
        });

        this.balls.forEach(ball => ball.draw(this.ctx));

        // 繪製激光（在遊戲物件上方）
        this.skillManager.drawLaser(this.ctx, this.paddle.x, this.paddle.y, this.paddle.width, this.canvas.height);

        // 繪製粒子特效
        this.particleManager.draw(this.ctx);

        // 繪製隨機事件通知
        if (this.randomEventSystem) {
            this.randomEventSystem.drawNotification(this.ctx, this.canvas.width);
        }

        // 繪製連擊提示
        if (this.comboManager.getCombo() >= 5) {
            this.drawComboText();
        }
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

            case 'magnet':
                if (this.paddleEnhancement) {
                    this.paddleEnhancement.enableMagnet();
                    this.showMessage('磁力吸附！', '#ff69b4');
                }
                break;

            case 'penetrate':
                this.ballEnhancements.forEach(enhancement => {
                    if (enhancement) enhancement.enablePenetrate();
                });
                this.showMessage('穿透球！', '#ff8800');
                break;

            case 'giant':
                this.ballEnhancements.forEach(enhancement => {
                    if (enhancement) enhancement.enableGiant();
                });
                this.showMessage('巨大球！', '#00ff66');
                break;

            case 'lightning':
                this.ballEnhancements.forEach(enhancement => {
                    if (enhancement) enhancement.enableLightning();
                });
                this.showMessage('閃電鏈！', '#9400d3');
                break;

            // 新道具
            case 'triple':
                // 一次增加3個球
                if (this.balls.length < 10) {
                    for (let i = 0; i < 3; i++) {
                        const sourceBall = this.balls[0];
                        const newBall = new Ball(this.canvas, sourceBall.x, sourceBall.y);
                        newBall.dx = (Math.random() - 0.5) * 8;
                        newBall.dy = -Math.abs(newBall.dy);
                        newBall.launched = true;
                        this.balls.push(newBall);

                        if (typeof BallEnhancement !== 'undefined') {
                            this.ballEnhancements.push(new BallEnhancement(newBall));
                        }
                    }
                    this.showMessage('三倍球！', '#ff1493');
                }
                break;

            case 'explosive':
                // 爆炸球效果
                this.powerupTimers.explosive = 600; // 10秒
                this.showMessage('爆炸球！', '#ff4500');
                break;

            case 'ghost':
                // 幽靈球（穿牆）
                this.powerupTimers.ghost = 600; // 10秒
                this.showMessage('幽靈球！', '#9370db');
                break;

            case 'fire':
                // 火焰球
                this.balls.forEach(ball => {
                    this.powerupTimers.fire.push({ ball: ball, timer: 600, damage: 2 });
                });
                this.showMessage('火焰球！', '#ff6347');
                break;

            case 'sticky':
                // 黏性板
                this.powerupTimers.sticky = true;
                this.showMessage('黏性板！', '#ffa500');
                break;

            case 'invincible':
                // 無敵時間
                this.powerupTimers.invincible = 360; // 6秒
                this.showMessage('無敵時間！', '#ffd700');
                break;

            case 'coin':
                // 金幣獎勵
                const coinBonus = 500 + this.level * 100;
                this.score += coinBonus;
                this.updateScore();
                this.showMessage(`+${coinBonus} 分！`, '#ffff00');
                break;

            case 'doublescore':
                // 雙倍分數
                this.powerupTimers.doublescore = 600; // 10秒
                this.showMessage('雙倍分數！', '#ff69ff');
                break;

            case 'random':
                // 隨機正面效果
                const positiveEffects = ['extend', 'multi', 'life', 'slow', 'magnet', 'penetrate', 'giant', 'lightning'];
                const randomEffect = positiveEffects[Math.floor(Math.random() * positiveEffects.length)];
                this.applyPowerup(randomEffect);
                this.showMessage('隨機增益！', 'rainbow');
                break;
        }

        // 播放音效
        if (this.audioManager) {
            this.audioManager.playPowerUp();
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
        this.loseLifeEffects();

        if (this.lives <= 0) {
            this.endGame();
        } else {
            // 重置球和板子
            this.balls = [new Ball(this.canvas)];
            this.paddle.reset();
            this.stats.noDamageStreak = 0; // 重置無傷連勝
        }
    }

    /**
     * 關卡完成
     */
    levelComplete() {
        this.paused = true;

        // 播放關卡完成音效
        this.audioManager.playLevelComplete();

        // 更新統計
        this.stats.noDamageStreak++;
        const levelTime = this.stats.currentLevelTime / 60; // 轉換為秒
        if (levelTime < this.stats.fastestClear) {
            this.stats.fastestClear = levelTime;
        }
        if (this.stats.currentLevelBalls === 1) {
            this.stats.oneBallClear = true;
        }

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
        this.particleManager.clear();
        this.brickManager.createLevel(this.level);
        this.stats.resetLevelStats();

        // 隱藏關卡完成畫面
        document.getElementById('levelComplete').classList.add('hidden');
        this.paused = false;
    }

    /**
     * 遊戲結束
     */
    endGame() {
        this.gameOver = true;
        this.audioManager.playGameOver();
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

        // 重置新系統
        this.particleManager.clear();
        this.comboManager.resetCombo();
        this.skillManager.reset();
        this.stats = new GameStats();

        // 更新 UI
        this.updateScore();
        this.updateLives();
        this.updateLevel();
        this.updatePattern();
        this.updateComboUI();
        this.updateSkillsUI();

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
            powerups: this.powerupManager.getState(),
            combo: this.comboManager.getState(),
            skills: this.skillManager.getState(),
            stats: this.stats.getState(),
            achievements: this.achievementManager.getState()
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

        // 載入新系統狀態
        if (gameState.combo) {
            this.comboManager.loadState(gameState.combo);
        }
        if (gameState.skills) {
            this.skillManager.loadState(gameState.skills);
        }
        if (gameState.stats) {
            this.stats.loadState(gameState.stats);
        }
        if (gameState.achievements) {
            this.achievementManager.loadState(gameState.achievements);
        }

        // 清空粒子
        this.particleManager.clear();

        // 更新 UI
        this.updateScore();
        this.updateLives();
        this.updateLevel();
        this.updatePattern();
        this.updateComboUI();
        this.updateSkillsUI();

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

    /**
     * 更新連擊 UI
     */
    updateComboUI() {
        const comboEl = document.getElementById('combo');
        const multiplierEl = document.getElementById('multiplier');

        if (comboEl) {
            comboEl.textContent = this.comboManager.getCombo();
        }
        if (multiplierEl) {
            multiplierEl.textContent = this.comboManager.getMultiplier().toFixed(1) + 'x';
        }
    }

    /**
     * 更新技能 UI
     */
    updateSkillsUI() {
        ['slowtime', 'laser', 'shield'].forEach(skillName => {
            const btn = document.getElementById(`skill-${skillName}`);
            if (btn) {
                const progress = this.skillManager.getCooldownProgress(skillName);
                const isActive = this.skillManager.isSkillActive(skillName);

                // 更新按鈕狀態
                btn.disabled = progress < 1;
                btn.classList.toggle('active', isActive);

                // 更新冷卻顯示（如果有）
                const cooldownEl = btn.querySelector('.cooldown');
                if (cooldownEl) {
                    cooldownEl.style.width = `${progress * 100}%`;
                }

                // 更新技能等級顯示
                if (this.skillLevelManager) {
                    const skillInfo = this.skillLevelManager.getSkillInfo(skillName);
                    if (skillInfo) {
                        // 更新等級標籤
                        let levelEl = btn.querySelector('.skill-level');
                        if (!levelEl) {
                            levelEl = document.createElement('span');
                            levelEl.className = 'skill-level';
                            btn.appendChild(levelEl);
                        }
                        levelEl.textContent = `Lv.${skillInfo.level}`;

                        // 更新經驗值條
                        let expBarEl = btn.querySelector('.skill-exp-bar');
                        if (!expBarEl) {
                            const expContainer = document.createElement('div');
                            expContainer.className = 'skill-exp-container';
                            expBarEl = document.createElement('div');
                            expBarEl.className = 'skill-exp-bar';
                            expContainer.appendChild(expBarEl);
                            btn.appendChild(expContainer);
                        }
                        expBarEl.style.width = `${skillInfo.progress * 100}%`;

                        // 更新 title 顯示技能詳情
                        const desc = this.skillLevelManager.getLevelDescription(skillName, skillInfo.level);
                        btn.title = `${desc}\nLv.${skillInfo.level} | EXP: ${skillInfo.exp}/${skillInfo.requiredExp}`;
                    }
                }
            }
        });
    }

    /**
     * 繪製連擊文字
     */
    drawComboText() {
        const combo = this.comboManager.getCombo();
        const x = this.canvas.width / 2;
        const y = 100;

        this.ctx.save();
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 外發光
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffff00';

        // 描邊
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(`${combo} COMBO!`, x, y);

        // 填充
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(`${combo} COMBO!`, x, y);

        // 倍數
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`${this.comboManager.getMultiplier().toFixed(1)}x`, x, y + 40);

        this.ctx.restore();
    }

    /**
     * 處理特殊磚塊效果
     */
    handleSpecialBrick(brick) {
        if (!brick || !brick.type) return;

        switch (brick.type) {
            case 'explosive':
                // 爆炸效果
                const explosionInfo = brick.getExplosionInfo();
                this.brickManager.bricks.forEach(otherBrick => {
                    if (otherBrick.visible && otherBrick !== brick) {
                        const dx = (otherBrick.x + otherBrick.width / 2) - explosionInfo.x;
                        const dy = (otherBrick.y + otherBrick.height / 2) - explosionInfo.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= explosionInfo.radius) {
                            otherBrick.visible = false;
                            this.score += otherBrick.points;
                            this.stats.bricksDestroyed++;
                            this.particleManager.createBrickExplosion(
                                otherBrick.x, otherBrick.y,
                                otherBrick.width, otherBrick.height,
                                otherBrick.color
                            );
                        }
                    }
                });
                // 爆炸粒子特效
                this.particleManager.createBossDeathEffect(
                    explosionInfo.x - 50, explosionInfo.y - 50, 100, 100
                );
                break;

            case 'freeze':
                // 冰凍效果已在 Brick 類中處理
                break;

            case 'teleport':
                // 傳送效果已在 TeleportBrick 類中處理
                break;
        }
    }

    /**
     * 顯示成就通知
     */
    showAchievement(achievement) {
        this.audioManager.playLevelComplete();

        // 創建通知元素（如果不存在）
        let notification = document.getElementById('achievement-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'achievement-notification';
            notification.className = 'achievement-notification';
            document.body.appendChild(notification);
        }

        // 設置通知內容
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">成就解鎖！</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

        // 顯示通知
        notification.classList.add('show');

        // 3 秒後隱藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * 失去生命時播放音效和特效
     */
    loseLifeEffects() {
        this.audioManager.playLifeLost();
        this.comboManager.resetCombo();
        this.updateComboUI();
    }

    /**
     * 應用閃電鏈效果
     */
    applyLightningChain(originBrick) {
        const chainRange = 100; // 閃電鏈範圍
        const maxChains = 3; // 最多連鎖3次

        let currentBricks = [originBrick];
        let chainedBricks = new Set([originBrick]);

        for (let chain = 0; chain < maxChains; chain++) {
            let nextBricks = [];

            currentBricks.forEach(brick => {
                // 找到範圍內的其他磚塊
                this.brickManager.bricks.forEach(otherBrick => {
                    if (otherBrick.visible && !chainedBricks.has(otherBrick)) {
                        const dx = (brick.x + brick.width / 2) - (otherBrick.x + otherBrick.width / 2);
                        const dy = (brick.y + brick.height / 2) - (otherBrick.y + otherBrick.height / 2);
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= chainRange) {
                            // 傷害磚塊
                            otherBrick.health--;
                            if (otherBrick.health <= 0) {
                                otherBrick.visible = false;
                                this.score += otherBrick.points;
                                this.stats.bricksDestroyed++;
                                this.particleManager.createBrickExplosion(
                                    otherBrick.x, otherBrick.y,
                                    otherBrick.width, otherBrick.height,
                                    otherBrick.color
                                );
                            } else {
                                otherBrick.updateColor();
                            }

                            chainedBricks.add(otherBrick);
                            nextBricks.push(otherBrick);

                            // 繪製閃電效果
                            this.drawLightningBolt(
                                brick.x + brick.width / 2,
                                brick.y + brick.height / 2,
                                otherBrick.x + otherBrick.width / 2,
                                otherBrick.y + otherBrick.height / 2
                            );
                        }
                    }
                });
            });

            currentBricks = nextBricks;
            if (currentBricks.length === 0) break;
        }

        // 播放閃電音效
        if (chainedBricks.size > 1) {
            this.audioManager.playCombo(chainedBricks.size);
        }
    }

    /**
     * 繪製閃電線
     */
    drawLightningBolt(x1, y1, x2, y2) {
        // 這個方法會在下一幀繪製，所以我們添加到粒子系統
        // 暫時使用粒子特效來表示閃電
        const segments = 5;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
            const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
            this.particleManager.createComboEffect(x, y, 1);
        }
    }
}
