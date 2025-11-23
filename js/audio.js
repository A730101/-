/**
 * Audio 模組 - 使用 Web Audio API 產生遊戲音效
 */
class AudioManager {
    constructor() {
        // 初始化 Audio Context
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // 主音量（30%）

        // 懶加載 Audio Context（需要用戶互動才能啟動）
        this.initAudioContext();
    }

    /**
     * 初始化 Audio Context
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支援', e);
            this.enabled = false;
        }
    }

    /**
     * 恢復 Audio Context（針對瀏覽器自動播放政策）
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 創建振盪器
     */
    createOscillator(frequency, type = 'sine') {
        if (!this.enabled || !this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        return { oscillator, gainNode };
    }

    /**
     * 播放音效的輔助方法
     */
    playSound(callback) {
        if (!this.enabled || !this.audioContext) return;

        this.resume();
        callback();
    }

    /**
     * 球撞磚塊音效
     */
    playBrickHit() {
        this.playSound(() => {
            const { oscillator, gainNode } = this.createOscillator(800, 'square');
            if (!oscillator) return;

            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        });
    }

    /**
     * 球撞牆壁音效
     */
    playWallHit() {
        this.playSound(() => {
            const { oscillator, gainNode } = this.createOscillator(400, 'square');
            if (!oscillator) return;

            gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.08);
        });
    }

    /**
     * 球撞球拍音效
     */
    playPaddleHit() {
        this.playSound(() => {
            const { oscillator, gainNode } = this.createOscillator(300, 'sine');
            if (!oscillator) return;

            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.12);
        });
    }

    /**
     * 磚塊破碎音效（最後一擊）
     */
    playBrickDestroy() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;

            // 創建多個頻率的爆炸音效
            [600, 400, 200].forEach((freq, i) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth');
                if (!oscillator) return;

                const delay = i * 0.02;
                gainNode.gain.setValueAtTime(this.volume * 0.4, time + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.15);

                oscillator.start(time + delay);
                oscillator.stop(time + delay + 0.15);
            });
        });
    }

    /**
     * 道具出現音效
     */
    playPowerUpSpawn() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;
            const { oscillator, gainNode } = this.createOscillator(800, 'sine');
            if (!oscillator) return;

            oscillator.frequency.exponentialRampToValueAtTime(1200, time + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.2, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

            oscillator.start(time);
            oscillator.stop(time + 0.15);
        });
    }

    /**
     * 道具拾取音效
     */
    playPowerUpCollect() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;

            // 上升音階
            [523, 659, 784, 1047].forEach((freq, i) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
                if (!oscillator) return;

                const delay = i * 0.05;
                gainNode.gain.setValueAtTime(this.volume * 0.25, time + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.1);

                oscillator.start(time + delay);
                oscillator.stop(time + delay + 0.1);
            });
        });
    }

    /**
     * Boss 出現音效
     */
    playBossSpawn() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;

            // 低沉的威脅音效
            const { oscillator, gainNode } = this.createOscillator(100, 'sawtooth');
            if (!oscillator) return;

            oscillator.frequency.exponentialRampToValueAtTime(50, time + 0.5);
            gainNode.gain.setValueAtTime(this.volume * 0.5, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

            oscillator.start(time);
            oscillator.stop(time + 0.5);
        });
    }

    /**
     * Boss 攻擊音效
     */
    playBossAttack() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;
            const { oscillator, gainNode } = this.createOscillator(150, 'sawtooth');
            if (!oscillator) return;

            oscillator.frequency.linearRampToValueAtTime(80, time + 0.2);
            gainNode.gain.setValueAtTime(this.volume * 0.35, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

            oscillator.start(time);
            oscillator.stop(time + 0.2);
        });
    }

    /**
     * Boss 受傷音效
     */
    playBossHit() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;
            const { oscillator, gainNode } = this.createOscillator(200, 'square');
            if (!oscillator) return;

            oscillator.frequency.linearRampToValueAtTime(100, time + 0.15);
            gainNode.gain.setValueAtTime(this.volume * 0.4, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

            oscillator.start(time);
            oscillator.stop(time + 0.15);
        });
    }

    /**
     * Boss 死亡音效
     */
    playBossDefeat() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;

            // 下降音效表示失敗
            [400, 300, 200, 100, 50].forEach((freq, i) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth');
                if (!oscillator) return;

                const delay = i * 0.1;
                gainNode.gain.setValueAtTime(this.volume * 0.5, time + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.2);

                oscillator.start(time + delay);
                oscillator.stop(time + delay + 0.2);
            });
        });
    }

    /**
     * 失去生命音效
     */
    playLifeLost() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;
            const { oscillator, gainNode } = this.createOscillator(200, 'sawtooth');
            if (!oscillator) return;

            oscillator.frequency.exponentialRampToValueAtTime(50, time + 0.5);
            gainNode.gain.setValueAtTime(this.volume * 0.4, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

            oscillator.start(time);
            oscillator.stop(time + 0.5);
        });
    }

    /**
     * 關卡完成音效
     */
    playLevelComplete() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;

            // 勝利旋律
            [523, 659, 784, 1047, 1319].forEach((freq, i) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
                if (!oscillator) return;

                const delay = i * 0.12;
                gainNode.gain.setValueAtTime(this.volume * 0.3, time + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.3);

                oscillator.start(time + delay);
                oscillator.stop(time + delay + 0.3);
            });
        });
    }

    /**
     * 遊戲結束音效
     */
    playGameOver() {
        this.playSound(() => {
            const time = this.audioContext.currentTime;

            // 失敗音效
            [392, 349, 330, 294, 262].forEach((freq, i) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
                if (!oscillator) return;

                const delay = i * 0.2;
                gainNode.gain.setValueAtTime(this.volume * 0.4, time + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.4);

                oscillator.start(time + delay);
                oscillator.stop(time + delay + 0.4);
            });
        });
    }

    /**
     * Combo 音效（連擊）
     */
    playCombo(comboCount) {
        this.playSound(() => {
            const time = this.audioContext.currentTime;
            const baseFreq = 600 + (comboCount * 50); // 連擊數越高，音調越高
            const { oscillator, gainNode } = this.createOscillator(baseFreq, 'sine');
            if (!oscillator) return;

            gainNode.gain.setValueAtTime(this.volume * 0.25, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

            oscillator.start(time);
            oscillator.stop(time + 0.15);
        });
    }

    /**
     * 切換音效開關
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * 設定音量
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}
