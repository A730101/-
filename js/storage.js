/**
 * Storage 模組 - 處理遊戲存檔和讀檔
 */
class GameStorage {
    constructor() {
        this.storageKey = 'brickBreakerSave';
    }

    /**
     * 儲存遊戲狀態
     */
    save(gameState) {
        try {
            const saveData = {
                timestamp: Date.now(),
                version: '1.0',
                gameState: gameState
            };

            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('儲存遊戲失敗:', error);
            return false;
        }
    }

    /**
     * 載入遊戲狀態
     */
    load() {
        try {
            const savedData = localStorage.getItem(this.storageKey);

            if (!savedData) {
                return null;
            }

            const data = JSON.parse(savedData);

            // 檢查版本相容性
            if (data.version !== '1.0') {
                console.warn('存檔版本不相容');
                return null;
            }

            return data.gameState;
        } catch (error) {
            console.error('讀取遊戲失敗:', error);
            return null;
        }
    }

    /**
     * 刪除存檔
     */
    delete() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('刪除存檔失敗:', error);
            return false;
        }
    }

    /**
     * 檢查是否有存檔
     */
    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * 獲取存檔資訊
     */
    getSaveInfo() {
        try {
            const savedData = localStorage.getItem(this.storageKey);

            if (!savedData) {
                return null;
            }

            const data = JSON.parse(savedData);

            return {
                timestamp: data.timestamp,
                date: new Date(data.timestamp).toLocaleString('zh-TW'),
                level: data.gameState.level,
                score: data.gameState.score,
                lives: data.gameState.lives
            };
        } catch (error) {
            console.error('獲取存檔資訊失敗:', error);
            return null;
        }
    }
}
