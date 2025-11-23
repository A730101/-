/**
 * Story 模組 - 遊戲故事系統
 */
class StoryManager {
    constructor() {
        // 故事進度
        this.currentChapter = 0;
        this.storyUnlocked = {
            intro: false,
            chapter1: false,
            chapter2: false,
            chapter3: false,
            chapter4: false,
            chapter5: false,
            ending: false
        };

        // 故事內容
        this.stories = {
            intro: {
                title: '序章：天空之城的危機',
                character: '神秘導師',
                characterEmoji: '🧙‍♂️',
                dialogues: [
                    '歡迎來到天空之城，年輕的守護者。',
                    '這座漂浮在雲端的城市，曾經是魔法文明的巔峰...',
                    '但黑暗勢力入侵了，將城市的能量核心封印在了魔法磚塊之中。',
                    '只有擁有純淨之心的人，才能擊破這些磚塊，釋放被困的能量。',
                    '你準備好接受這個使命了嗎？',
                    '記住：每擊破一塊磚塊，就能釋放一份光明之力！'
                ],
                choices: [
                    { text: '我準備好了！', action: 'start' },
                    { text: '讓我再想想...', action: 'cancel' }
                ]
            },

            chapter1: {
                title: '第一章：初露鋒芒',
                character: '能量精靈',
                characterEmoji: '✨',
                dialogues: [
                    '太棒了！你成功解放了第一批能量核心！',
                    '我是被你喚醒的能量精靈，感謝你的幫助。',
                    '但是...黑暗勢力已經注意到了你的行動。',
                    '它們會派遣更強大的封印來阻止你。',
                    '不過別擔心，我會賦予你特殊的技能來幫助你！',
                    '繼續前進吧，守護者！天空之城需要你的力量！'
                ]
            },

            chapter2: {
                title: '第二章：黑暗降臨',
                character: '暗影使者',
                characterEmoji: '👤',
                dialogues: [
                    '哼哼...有趣的人類。',
                    '你以為擊碎幾塊磚塊就能拯救這座城市嗎？',
                    '天真！黑暗勢力的封印可不只是普通的障礙。',
                    '接下來，你將面對會爆炸的陷阱磚塊...',
                    '還有我們的 Boss 守衛者！它們可不會對你手下留情！',
                    '我等著看你失敗的那一刻...哈哈哈！'
                ]
            },

            chapter3: {
                title: '第三章：傳說中的道具',
                character: '古代工匠',
                characterEmoji: '🔨',
                dialogues: [
                    '年輕人，你的勇氣令人欽佩。',
                    '我是這座城市的古代工匠，曾經鑄造過無數神奇的道具。',
                    '看來你已經掌握了一些基本的道具使用技巧。',
                    '但我要告訴你一個秘密：傳說中還有更稀有的道具...',
                    '金色的無敵護盾、時間扭曲的魔法球、甚至是隨機祝福的神秘骰子！',
                    '繼續探索吧，這些珍貴的道具會在你最需要時出現！'
                ]
            },

            chapter4: {
                title: '第四章：技能覺醒',
                character: '天空守護者',
                characterEmoji: '🛡️',
                dialogues: [
                    '守護者啊，你的技能正在不斷進化！',
                    '我能感受到你體內蘊藏的巨大潛能。',
                    '每一次戰鬥，都讓你變得更加強大。',
                    '當你的技能達到第5級時，將會覺醒隱藏的終極力量！',
                    '時間減速會變成時間凝固...激光會分裂成三道毀滅光束...',
                    '護盾甚至能夠反彈攻擊！繼續提升你的力量吧！'
                ]
            },

            chapter5: {
                title: '第五章：終極對決',
                character: '黑暗領主',
                characterEmoji: '💀',
                dialogues: [
                    '可惡...你竟然走到了這一步！',
                    '我是黑暗領主，這座城市封印的締造者！',
                    '沒有人能夠阻止我吸收天空之城的能量！',
                    '即使你擊敗了我的眾多守衛者，也改變不了結局！',
                    '來吧，讓我看看你究竟有多強！',
                    '這將是你最後的戰鬥...準備好迎接毀滅吧！'
                ]
            },

            victory: {
                title: '尾聲：光明重臨',
                character: '神秘導師',
                characterEmoji: '🧙‍♂️',
                dialogues: [
                    '你做到了！年輕的守護者！',
                    '黑暗勢力已經被徹底驅散，天空之城重獲新生。',
                    '被封印的能量核心全部解放，城市再次充滿了光明。',
                    '這一切都要感謝你的勇氣、智慧和堅持。',
                    '但記住，這只是開始...傳說中還有更多的冒險等待著你。',
                    '天空之城將永遠記住你的名字，偉大的守護者！',
                    '✨ 恭喜通關！你的傳奇永遠流傳！ ✨'
                ]
            },

            gameover: {
                title: '暫時的失敗',
                character: '能量精靈',
                characterEmoji: '✨',
                dialogues: [
                    '不要放棄啊，守護者！',
                    '失敗只是暫時的，你已經展現出了巨大的潛力。',
                    '重新振作起來，利用你獲得的經驗和技能。',
                    '記住：每一次的失敗都是為了更強大的重生！',
                    '天空之城還在等待你的拯救！'
                ]
            },

            // 特殊事件故事
            firstBoss: {
                title: '⚠️ Boss 警告',
                character: '守衛警報',
                characterEmoji: '🚨',
                dialogues: [
                    '警告！Boss 守衛者已被激活！',
                    '這是黑暗勢力設置的強大防禦系統。',
                    '它擁有超高的血量和致命的火焰攻擊！',
                    '小心閃避它的攻擊，找準時機反擊！',
                    '擊敗它將獲得豐厚的獎勵！'
                ]
            },

            skillMaxLevel: {
                title: '🌟 技能覺醒',
                character: '技能之靈',
                characterEmoji: '⚡',
                dialogues: [
                    '恭喜！你的技能已經達到最高境界！',
                    'Lv.5 技能覺醒，解鎖終極能力！',
                    '時間減速 Lv.5：時間幾乎停止！',
                    '激光射線 Lv.5：毀滅性的三重激光！',
                    '能量護盾 Lv.5：護盾能夠加速球體！',
                    '運用這份力量，擊敗所有黑暗勢力吧！'
                ]
            },

            epicDrop: {
                title: '🎁 傳說降臨',
                character: '幸運女神',
                characterEmoji: '🍀',
                dialogues: [
                    '哇！傳說級道具出現了！',
                    '這是只有5%機率才會出現的稀有道具！',
                    '好好珍惜這份幸運的祝福吧！',
                    '也許這就是命運對你的眷顧呢！'
                ]
            }
        };

        // 當前顯示的對話
        this.currentDialogue = null;
        this.currentDialogueIndex = 0;
        this.isShowing = false;
    }

    /**
     * 檢查並觸發故事
     */
    checkStoryTrigger(level, score, stats) {
        // 遊戲開始
        if (level === 1 && score === 0 && !this.storyUnlocked.intro) {
            this.showStory('intro');
            this.storyUnlocked.intro = true;
            return true;
        }

        // 第一章 - 關卡 3
        if (level === 3 && !this.storyUnlocked.chapter1) {
            this.showStory('chapter1');
            this.storyUnlocked.chapter1 = true;
            return true;
        }

        // 第二章 - 關卡 5 (首次遇到 Boss)
        if (level === 5 && !this.storyUnlocked.chapter2) {
            this.showStory('chapter2');
            this.storyUnlocked.chapter2 = true;
            return true;
        }

        // 第三章 - 關卡 10
        if (level === 10 && !this.storyUnlocked.chapter3) {
            this.showStory('chapter3');
            this.storyUnlocked.chapter3 = true;
            return true;
        }

        // 第四章 - 關卡 15
        if (level === 15 && !this.storyUnlocked.chapter4) {
            this.showStory('chapter4');
            this.storyUnlocked.chapter4 = true;
            return true;
        }

        // 第五章 - 關卡 20
        if (level === 20 && !this.storyUnlocked.chapter5) {
            this.showStory('chapter5');
            this.storyUnlocked.chapter5 = true;
            return true;
        }

        return false;
    }

    /**
     * 顯示故事對話框
     */
    showStory(storyKey) {
        const story = this.stories[storyKey];
        if (!story) return;

        this.currentDialogue = story;
        this.currentDialogueIndex = 0;
        this.isShowing = true;

        // 創建故事 UI
        this.createStoryUI();
    }

    /**
     * 創建故事 UI
     */
    createStoryUI() {
        // 移除舊的故事框
        const oldStory = document.getElementById('story-dialog');
        if (oldStory) {
            oldStory.remove();
        }

        // 創建故事對話框
        const storyDialog = document.createElement('div');
        storyDialog.id = 'story-dialog';
        storyDialog.className = 'story-dialog';
        storyDialog.innerHTML = `
            <div class="story-content">
                <div class="story-header">
                    <span class="story-character-emoji">${this.currentDialogue.characterEmoji}</span>
                    <div class="story-title-wrapper">
                        <h3 class="story-title">${this.currentDialogue.title}</h3>
                        <p class="story-character">${this.currentDialogue.character}</p>
                    </div>
                </div>
                <div class="story-dialogue">
                    <p id="story-text">${this.currentDialogue.dialogues[0]}</p>
                </div>
                <div class="story-progress">
                    <span id="story-page">1 / ${this.currentDialogue.dialogues.length}</span>
                </div>
                <div class="story-actions">
                    ${this.currentDialogue.choices ?
                        this.currentDialogue.choices.map(choice =>
                            `<button class="story-btn story-choice-btn" data-action="${choice.action}">${choice.text}</button>`
                        ).join('') :
                        `<button class="story-btn" id="story-next">下一頁 ▶</button>
                         <button class="story-btn story-skip-btn" id="story-skip">跳過</button>`
                    }
                </div>
            </div>
        `;

        document.body.appendChild(storyDialog);

        // 綁定事件
        this.bindStoryEvents();

        // 顯示動畫
        setTimeout(() => {
            storyDialog.classList.add('show');
        }, 10);
    }

    /**
     * 綁定故事事件
     */
    bindStoryEvents() {
        const nextBtn = document.getElementById('story-next');
        const skipBtn = document.getElementById('story-skip');
        const choiceBtns = document.querySelectorAll('.story-choice-btn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextDialogue());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.closeStory());
        }

        choiceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleChoice(action);
            });
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', this.handleStoryKeypress.bind(this));
    }

    /**
     * 下一段對話
     */
    nextDialogue() {
        this.currentDialogueIndex++;

        if (this.currentDialogueIndex >= this.currentDialogue.dialogues.length) {
            this.closeStory();
            return;
        }

        const textEl = document.getElementById('story-text');
        const pageEl = document.getElementById('story-page');

        if (textEl && pageEl) {
            // 淡出效果
            textEl.style.opacity = '0';

            setTimeout(() => {
                textEl.textContent = this.currentDialogue.dialogues[this.currentDialogueIndex];
                pageEl.textContent = `${this.currentDialogueIndex + 1} / ${this.currentDialogue.dialogues.length}`;
                textEl.style.opacity = '1';
            }, 200);
        }
    }

    /**
     * 關閉故事對話框
     */
    closeStory() {
        const storyDialog = document.getElementById('story-dialog');
        if (storyDialog) {
            storyDialog.classList.remove('show');
            setTimeout(() => {
                storyDialog.remove();
                this.isShowing = false;

                // 恢復遊戲（如果game對象存在）
                if (typeof game !== 'undefined' && game) {
                    game.paused = false;
                }
            }, 300);
        }

        // 移除鍵盤監聽
        document.removeEventListener('keydown', this.handleStoryKeypress);
    }

    /**
     * 處理選擇
     */
    handleChoice(action) {
        if (action === 'start') {
            this.closeStory();
            // 遊戲繼續
        } else if (action === 'cancel') {
            this.closeStory();
            // 可能顯示主選單
        }
    }

    /**
     * 鍵盤事件處理
     */
    handleStoryKeypress(e) {
        if (!this.isShowing) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.nextDialogue();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.closeStory();
        }
    }

    /**
     * 快速故事觸發（特殊事件）
     */
    showQuickStory(storyKey) {
        this.showStory(storyKey);
    }

    /**
     * 獲取狀態
     */
    getState() {
        return {
            currentChapter: this.currentChapter,
            storyUnlocked: { ...this.storyUnlocked }
        };
    }

    /**
     * 載入狀態
     */
    loadState(state) {
        if (!state) return;
        this.currentChapter = state.currentChapter || 0;
        this.storyUnlocked = state.storyUnlocked || this.storyUnlocked;
    }

    /**
     * 重置故事進度
     */
    reset() {
        this.currentChapter = 0;
        this.storyUnlocked = {
            intro: false,
            chapter1: false,
            chapter2: false,
            chapter3: false,
            chapter4: false,
            chapter5: false,
            ending: false
        };
    }
}
