/**
 * Main 模組 - 初始化遊戲
 */

let game;

// 當 DOM 載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    // 初始化遊戲
    game = new Game(canvas);

    // 檢查是否有存檔
    const storage = new GameStorage();
    if (storage.hasSave()) {
        const saveInfo = storage.getSaveInfo();
        if (saveInfo) {
            const loadSave = confirm(
                `發現存檔！\n` +
                `日期: ${saveInfo.date}\n` +
                `關卡: ${saveInfo.level}\n` +
                `分數: ${saveInfo.score}\n` +
                `生命: ${saveInfo.lives}\n\n` +
                `是否載入存檔？`
            );

            if (loadSave) {
                game.loadGame();
            }
        }
    }

    console.log('🎮 打磚塊遊戲已載入！');
    console.log('控制說明:');
    console.log('- 移動: 滑鼠或方向鍵 ← →');
    console.log('- 發射: 滑鼠點擊或空白鍵');
    console.log('- 暫停: P 鍵');
    console.log('- 儲存: S 鍵');
    console.log('- 載入: L 鍵');
    console.log('- 重新開始: R 鍵');
});

// 防止頁面滾動（方向鍵）
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});
