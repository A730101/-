/**
 * Particle 模組 - 粒子特效系統
 */
class Particle {
    constructor(x, y, color, speedX, speedY, size, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = size;
        this.life = life; // 生命值（幀數）
        this.maxLife = life;
        this.alpha = 1;
        this.gravity = 0.1; // 重力效果
    }

    /**
     * 更新粒子
     */
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity; // 應用重力
        this.life--;

        // 根據生命值調整透明度
        this.alpha = this.life / this.maxLife;

        // 粒子會逐漸縮小
        this.size *= 0.97;
    }

    /**
     * 繪製粒子
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 檢查粒子是否存活
     */
    isAlive() {
        return this.life > 0 && this.size > 0.5;
    }
}

/**
 * ParticleManager - 管理所有粒子效果
 */
class ParticleManager {
    constructor() {
        this.particles = [];
    }

    /**
     * 創建磚塊破碎效果
     */
    createBrickExplosion(x, y, width, height, color) {
        const particleCount = 15;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed;
            const size = 3 + Math.random() * 4;
            const life = 30 + Math.random() * 20;

            this.particles.push(new Particle(centerX, centerY, color, speedX, speedY, size, life));
        }

        // 添加一些額外的閃光粒子
        for (let i = 0; i < 5; i++) {
            const speedX = (Math.random() - 0.5) * 6;
            const speedY = (Math.random() - 0.5) * 6;
            const size = 2 + Math.random() * 3;
            const life = 20 + Math.random() * 15;

            this.particles.push(new Particle(centerX, centerY, '#ffffff', speedX, speedY, size, life));
        }
    }

    /**
     * 創建道具拾取效果
     */
    createPowerUpEffect(x, y, color) {
        const particleCount = 20;
        const centerX = x;
        const centerY = y;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 2;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed;
            const size = 2 + Math.random() * 3;
            const life = 25 + Math.random() * 15;

            this.particles.push(new Particle(centerX, centerY, color, speedX, speedY, size, life));
        }
    }

    /**
     * 創建連擊效果
     */
    createComboEffect(x, y, comboCount) {
        const particleCount = 5 + comboCount;
        const colors = ['#ffff00', '#ff00ff', '#00ffff', '#ff6600'];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 2;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed - 2; // 向上噴射
            const size = 3 + Math.random() * 3;
            const life = 30 + Math.random() * 20;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle(x, y, color, speedX, speedY, size, life));
        }
    }

    /**
     * 創建球拍擊球效果
     */
    createPaddleHitEffect(x, y) {
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const speedX = (Math.random() - 0.5) * 4;
            const speedY = -Math.random() * 3 - 1; // 向上
            const size = 2 + Math.random() * 2;
            const life = 15 + Math.random() * 10;

            this.particles.push(new Particle(x, y, '#00c8ff', speedX, speedY, size, life));
        }
    }

    /**
     * 創建 Boss 攻擊效果
     */
    createBossAttackEffect(x, y) {
        const particleCount = 10;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
            const speed = 2 + Math.random() * 3;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed;
            const size = 3 + Math.random() * 3;
            const life = 20 + Math.random() * 15;
            const color = Math.random() > 0.5 ? '#ff6600' : '#ff0000';

            this.particles.push(new Particle(x, y, color, speedX, speedY, size, life));
        }
    }

    /**
     * 創建 Boss 死亡效果
     */
    createBossDeathEffect(x, y, width, height) {
        const particleCount = 50;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
            const speed = 3 + Math.random() * 5;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed;
            const size = 4 + Math.random() * 5;
            const life = 40 + Math.random() * 30;
            const colors = ['#ff0066', '#990044', '#660033', '#ff6600', '#ffaa00'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle(centerX, centerY, color, speedX, speedY, size, life));
        }

        // 添加大量白色閃光
        for (let i = 0; i < 20; i++) {
            const speedX = (Math.random() - 0.5) * 10;
            const speedY = (Math.random() - 0.5) * 10;
            const size = 3 + Math.random() * 4;
            const life = 30 + Math.random() * 20;

            this.particles.push(new Particle(centerX, centerY, '#ffffff', speedX, speedY, size, life));
        }
    }

    /**
     * 創建冰凍效果
     */
    createFreezeEffect(x, y, width, height) {
        const particleCount = 12;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 1 + Math.random() * 2;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed;
            const size = 2 + Math.random() * 2;
            const life = 25 + Math.random() * 15;
            const color = Math.random() > 0.5 ? '#00ffff' : '#aaffff';

            this.particles.push(new Particle(centerX, centerY, color, speedX, speedY, size, life));
        }
    }

    /**
     * 創建技能特效（激光、護盾等）
     */
    createSkillEffect(x, y, skillType) {
        let color, particleCount;

        switch (skillType) {
            case 'laser':
                color = '#ff0000';
                particleCount = 30;
                break;
            case 'shield':
                color = '#00ffff';
                particleCount = 25;
                break;
            case 'slowtime':
                color = '#ffff00';
                particleCount = 35;
                break;
            default:
                color = '#ffffff';
                particleCount = 20;
        }

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            const speedX = Math.cos(angle) * speed;
            const speedY = Math.sin(angle) * speed;
            const size = 2 + Math.random() * 3;
            const life = 20 + Math.random() * 15;

            this.particles.push(new Particle(x, y, color, speedX, speedY, size, life));
        }
    }

    /**
     * 更新所有粒子
     */
    update() {
        this.particles.forEach(particle => particle.update());

        // 移除死亡的粒子
        this.particles = this.particles.filter(particle => particle.isAlive());
    }

    /**
     * 繪製所有粒子
     */
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    /**
     * 清除所有粒子
     */
    clear() {
        this.particles = [];
    }

    /**
     * 獲取當前粒子數量
     */
    getParticleCount() {
        return this.particles.length;
    }
}
