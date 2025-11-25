/**
 * Enhancements 模組 - 遊戲增強功能
 */

/**
 * BallEnhancement - 球的增強效果管理
 */
class BallEnhancement {
    constructor(ball) {
        this.ball = ball;

        // 效果狀態
        this.penetrate = { active: false, timer: 0, duration: 300 }; // 穿透效果
        this.giant = { active: false, timer: 0, duration: 300 }; // 巨大球
        this.lightning = { active: false, timer: 0, duration: 300 }; // 閃電鏈

        // 尾迹效果
        this.trail = [];
        this.maxTrailLength = 10;

        // 原始半徑
        this.originalRadius = ball.radius;
    }

    /**
     * 啟用穿透效果
     */
    enablePenetrate() {
        this.penetrate.active = true;
        this.penetrate.timer = this.penetrate.duration;
    }

    /**
     * 啟用巨大球
     */
    enableGiant() {
        this.giant.active = true;
        this.giant.timer = this.giant.duration;
        this.ball.radius = this.originalRadius * 2.5; // 增大球體
    }

    /**
     * 啟用閃電鏈
     */
    enableLightning() {
        this.lightning.active = true;
        this.lightning.timer = this.lightning.duration;
    }

    /**
     * 更新效果
     */
    update() {
        // 更新穿透效果
        if (this.penetrate.active) {
            this.penetrate.timer--;
            if (this.penetrate.timer <= 0) {
                this.penetrate.active = false;
            }
        }

        // 更新巨大球效果
        if (this.giant.active) {
            this.giant.timer--;
            if (this.giant.timer <= 0) {
                this.giant.active = false;
                this.ball.radius = this.originalRadius; // 恢復原始大小
            }
        }

        // 更新閃電鏈效果
        if (this.lightning.active) {
            this.lightning.timer--;
            if (this.lightning.timer <= 0) {
                this.lightning.active = false;
            }
        }

        // 更新尾迹
        if (this.ball.launched) {
            this.trail.push({ x: this.ball.x, y: this.ball.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
    }

    /**
     * 繪製增強效果
     */
    draw(ctx) {
        // 繪製尾迹
        if (this.trail.length > 1) {
            ctx.save();
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i + 1) / this.trail.length * 0.5;
                const size = this.ball.radius * (i + 1) / this.trail.length;

                ctx.fillStyle = `rgba(0, 200, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // 穿透效果光環
        if (this.penetrate.active) {
            ctx.save();
            const gradient = ctx.createRadialGradient(
                this.ball.x, this.ball.y, this.ball.radius,
                this.ball.x, this.ball.y, this.ball.radius * 2
            );
            gradient.addColorStop(0, 'rgba(255, 136, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 閃電鏈效果
        if (this.lightning.active) {
            ctx.save();
            ctx.strokeStyle = '#9400d3';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#9400d3';

            // 繪製電弧
            const arcs = 8;
            for (let i = 0; i < arcs; i++) {
                const angle = (Math.PI * 2 * i) / arcs;
                const endX = this.ball.x + Math.cos(angle) * this.ball.radius * 2;
                const endY = this.ball.y + Math.sin(angle) * this.ball.radius * 2;

                ctx.beginPath();
                ctx.moveTo(this.ball.x, this.ball.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    /**
     * 檢查是否穿透
     */
    isPenetrating() {
        return this.penetrate.active;
    }

    /**
     * 檢查是否有閃電鏈
     */
    hasLightning() {
        return this.lightning.active;
    }

    /**
     * 重置所有效果
     */
    reset() {
        this.penetrate.active = false;
        this.giant.active = false;
        this.lightning.active = false;
        this.ball.radius = this.originalRadius;
        this.trail = [];
    }
}

/**
 * PaddleEnhancement - 球拍增強系統
 */
class PaddleEnhancement {
    constructor(paddle) {
        this.paddle = paddle;

        // 磁力效果
        this.magnet = { active: false, timer: 0, duration: 300, range: 150 };

        // 充能系統
        this.charge = 0; // 0-100
        this.maxCharge = 100;
        this.chargeRate = 1; // 每幀充能速度
        this.chargeDecayRate = 0.5; // 充能衰減速度

        // 自動充能
        this.autoCharging = true;
    }

    /**
     * 啟用磁力效果
     */
    enableMagnet() {
        this.magnet.active = true;
        this.magnet.timer = this.magnet.duration;
    }

    /**
     * 更新球拍增強
     */
    update() {
        // 更新磁力效果
        if (this.magnet.active) {
            this.magnet.timer--;
            if (this.magnet.timer <= 0) {
                this.magnet.active = false;
            }
        }

        // 自動充能
        if (this.autoCharging && this.charge < this.maxCharge) {
            this.charge = Math.min(this.charge + this.chargeRate, this.maxCharge);
        } else if (!this.autoCharging && this.charge > 0) {
            this.charge = Math.max(this.charge - this.chargeDecayRate, 0);
        }
    }

    /**
     * 使用充能
     */
    useCharge(amount) {
        if (this.charge >= amount) {
            this.charge -= amount;
            return true;
        }
        return false;
    }

    /**
     * 檢查球是否在磁力範圍內
     */
    checkMagnetAttraction(ball) {
        if (!this.magnet.active || !ball.launched) return null;

        const paddleCenter = this.paddle.x + this.paddle.width / 2;
        const paddleTop = this.paddle.y;

        const dx = ball.x - paddleCenter;
        const dy = ball.y - paddleTop;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.magnet.range) {
            // 計算吸引力
            const force = (1 - distance / this.magnet.range) * 0.5;
            return {
                x: -dx * force,
                y: -dy * force
            };
        }

        return null;
    }

    /**
     * 繪製增強效果
     */
    draw(ctx) {
        const paddleCenter = this.paddle.x + this.paddle.width / 2;
        const paddleTop = this.paddle.y;

        // 繪製磁力場
        if (this.magnet.active) {
            ctx.save();
            const gradient = ctx.createRadialGradient(
                paddleCenter, paddleTop, 0,
                paddleCenter, paddleTop, this.magnet.range
            );
            gradient.addColorStop(0, 'rgba(255, 105, 180, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(paddleCenter, paddleTop, this.magnet.range, 0, Math.PI * 2);
            ctx.fill();

            // 磁力線
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12 + Date.now() / 1000;
                const startX = paddleCenter + Math.cos(angle) * (this.magnet.range * 0.7);
                const startY = paddleTop + Math.sin(angle) * (this.magnet.range * 0.7);
                const endX = paddleCenter + Math.cos(angle) * this.magnet.range;
                const endY = paddleTop + Math.sin(angle) * this.magnet.range;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            ctx.restore();
        }

        // 繪製充能條
        if (this.charge > 0) {
            const barWidth = this.paddle.width;
            const barHeight = 3;
            const barX = this.paddle.x;
            const barY = this.paddle.y - 8;

            // 背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // 充能進度
            const chargeWidth = (this.charge / this.maxCharge) * barWidth;
            const gradient = ctx.createLinearGradient(barX, barY, barX + chargeWidth, barY);
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00c8ff');

            ctx.fillStyle = gradient;
            ctx.fillRect(barX, barY, chargeWidth, barHeight);
        }
    }

    /**
     * 重置增強效果
     */
    reset() {
        this.magnet.active = false;
        this.charge = 0;
    }
}

/**
 * RandomEvent - 隨機事件系統
 */
class RandomEventSystem {
    constructor() {
        this.events = [
            {
                name: '隕石雨',
                description: '天降隕石！小心閃避！',
                icon: '☄️',
                trigger: () => this.meteorShower()
            },
            {
                name: '時間扭曲',
                description: '時空扭曲，一切變慢！',
                icon: '🌀',
                trigger: () => this.timeWarp()
            },
            {
                name: '幸運時刻',
                description: '道具掉落率翻倍！',
                icon: '🍀',
                trigger: () => this.luckyMoment()
            },
            {
                name: '重力反轉',
                description: '重力反轉！',
                icon: '🔄',
                trigger: () => this.gravityReverse()
            }
        ];

        this.activeEvent = null;
        this.eventTimer = 0;
        this.nextEventTime = this.getRandomEventTime();
        this.gameTime = 0;
    }

    /**
     * 獲取隨機事件觸發時間
     */
    getRandomEventTime() {
        return 1800 + Math.random() * 1800; // 30-60 秒
    }

    /**
     * 更新事件系統
     */
    update() {
        this.gameTime++;

        if (this.activeEvent) {
            this.eventTimer--;
            if (this.eventTimer <= 0) {
                this.activeEvent = null;
            }
        } else {
            if (this.gameTime >= this.nextEventTime) {
                this.triggerRandomEvent();
                this.gameTime = 0;
                this.nextEventTime = this.getRandomEventTime();
            }
        }
    }

    /**
     * 觸發隨機事件
     */
    triggerRandomEvent() {
        const event = this.events[Math.floor(Math.random() * this.events.length)];
        this.activeEvent = event;
        this.eventTimer = 600; // 10 秒
        return event;
    }

    /**
     * 隕石雨事件
     */
    meteorShower() {
        return {
            type: 'meteor',
            particles: 20,
            duration: 600
        };
    }

    /**
     * 時間扭曲事件
     */
    timeWarp() {
        return {
            type: 'timewarp',
            slowFactor: 0.5,
            duration: 300
        };
    }

    /**
     * 幸運時刻事件
     */
    luckyMoment() {
        return {
            type: 'lucky',
            multiplier: 2,
            duration: 600
        };
    }

    /**
     * 重力反轉事件
     */
    gravityReverse() {
        return {
            type: 'gravity',
            reversed: true,
            duration: 300
        };
    }

    /**
     * 繪製事件通知
     */
    drawNotification(ctx, canvasWidth) {
        if (!this.activeEvent || this.eventTimer > 540) return; // 前1秒淡入

        ctx.save();
        const alpha = this.eventTimer > 60 ? 1 : this.eventTimer / 60; // 最後1秒淡出
        ctx.globalAlpha = alpha;

        const text = `${this.activeEvent.icon} ${this.activeEvent.name}`;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // 背景
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvasWidth / 2 - textWidth / 2 - 20, 10, textWidth + 40, 40);

        // 文字
        ctx.fillStyle = '#ffd700';
        ctx.fillText(text, canvasWidth / 2, 20);

        ctx.restore();
    }
}
