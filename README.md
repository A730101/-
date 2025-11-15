# 打磚塊遊戲 (Brick Breaker Game)

一個使用原生 JavaScript 開發的經典打磚塊遊戲，具有模組化架構、道具系統和存檔功能。

## 🎮 遊戲特色

- **模組化設計**: 每個遊戲元件（球拍、球、磚塊、道具）都是獨立的模組，易於維護和擴展
- **10 種關卡模式**: 每關都有不同的磚塊排列模式
  - 🔲 矩形 - 經典排列
  - 🔺 金字塔 - 三角形排列
  - 💎 鑽石 - 菱形排列
  - 🔻 倒金字塔 - 倒三角排列
  - ♟️ 棋盤 - 交錯排列
  - ⭕ 圓形 - 環形排列
  - ❤️ 愛心 - 心形排列
  - 〰️ 之字形 - 波浪排列
  - ➕ 十字 - 十字排列
  - 🎲 隨機 - 隨機分散
- **漸進式難度系統**:
  - 每完成 10 關，所有模式難度提升一級
  - 難度影響磚塊數量和排列密度
  - 無限循環關卡，挑戰無極限
- **磚塊生命值系統** (v1.4 新增):
  - 從第 6 關開始，磚塊擁有生命值
  - 生命值計算方式：每 5 關增加 1 點 HP
    - 第 1-5 關：1 HP (一擊破壞)
    - 第 6-10 關：2 HP (需要擊中兩次)
    - 第 11-15 關：3 HP
    - 第 16-20 關：4 HP
    - 第 21+ 關：5 HP (最高上限)
  - 視覺反饋：
    - 多生命磚塊顯示生命值數字
    - 被擊中後顏色變暗
    - 邊框更粗表示更高生命值
- **道具系統**: 7 種不同效果的道具
  - 🟢 延長板子
  - 🔴 縮短板子
  - 🔵 減速球
  - 🟡 加速球
  - 🟣 多球
  - ⭐ 額外生命
  - ❄️ 冰球 (v1.5 新增) - 打中磚塊後冰凍，再打一次直接摧毀（無視生命值）
- **存檔功能**: 使用 localStorage 實現遊戲進度保存和載入
- **響應式設計**: 支援鍵盤、滑鼠和觸控操作

## 🕹️ 操作說明

### 鍵盤控制
- `← →` 方向鍵: 移動球拍
- `空白鍵`: 發射球
- `P`: 暫停/繼續
- `S`: 儲存遊戲
- `L`: 載入遊戲
- `R`: 重新開始

### 滑鼠/觸控控制
- 移動滑鼠: 控制球拍位置
- 點擊: 發射球

## 📁 專案結構

```
.
├── index.html          # 主 HTML 檔案
├── css/
│   └── style.css       # 遊戲樣式
└── js/
    ├── paddle.js       # 球拍模組
    ├── ball.js         # 球模組
    ├── brick.js        # 磚塊模組
    ├── powerup.js      # 道具模組
    ├── storage.js      # 存檔模組
    ├── game.js         # 主遊戲邏輯
    └── main.js         # 遊戲初始化
```

## 🚀 如何運行

### 本地測試
1. 下載或 clone 此專案
2. 使用瀏覽器開啟 `index.html`
3. 開始遊戲！

### GitHub Pages
此遊戲已設定為可透過 GitHub Pages 線上遊玩。

#### 設定步驟：
1. 前往 Repository Settings
2. 找到 "Pages" 選項
3. 在 "Source" 下選擇主分支 (main/master)
4. 選擇 "/ (root)" 作為資料夾
5. 點擊 "Save"
6. 等待幾分鐘後，遊戲將可在以下網址訪問：
   ```
   https://[你的使用者名稱].github.io/[repository-name]/
   ```

## 🛠️ 技術架構

### 模組化設計
每個遊戲元件都被設計為獨立的類別：

- **Paddle**: 處理球拍的移動、尺寸變化和效果
- **Ball**: 處理球的物理運動、碰撞檢測和速度調整
- **Brick & BrickManager**: 管理磚塊的創建、碰撞和關卡生成
- **PowerUp & PowerUpManager**: 處理道具的生成、移動和效果應用
- **GameStorage**: 處理遊戲狀態的序列化、儲存和載入
- **Game**: 主遊戲邏輯，協調所有模組的運作

### 存檔系統
使用 `localStorage` API 實現：
- 自動序列化遊戲狀態
- 版本控制確保存檔相容性
- 支援完整的遊戲狀態保存（分數、生命、關卡、所有物件狀態）

## 🔧 擴展與修改

### 新增關卡模式
在 `js/brick.js` 的 `BrickManager` 類別中新增關卡模式：

1. 在 `patterns` 陣列中新增你的模式名稱
2. 在 `createPattern()` 的 switch 中新增對應的 case
3. 實作模式生成方法

```javascript
// 1. 新增模式名稱
this.patterns = [
    'rectangle', 'pyramid', /* ... */ 'yourPattern'
];

// 2. 新增 case
case 'yourPattern':
    this.createYourPattern(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level);
    break;

// 3. 實作方法
createYourPattern(brickWidth, brickHeight, padding, offsetX, offsetY, difficulty, level) {
    // 你的磚塊排列邏輯
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            this.addBrick(row, col, brickWidth, brickHeight, padding, offsetX, offsetY, level);
        }
    }
}
```

### 新增道具類型
在 `js/powerup.js` 的 `PowerUp` 類別中新增：

```javascript
this.types = {
    extend: { color: '#00ff00', emoji: '🟢', name: '延長板子' },
    // 新增你的道具類型
    newType: { color: '#yourColor', emoji: '🆕', name: '你的道具' }
};
```

然後在 `js/game.js` 的 `applyPowerup()` 方法中實作效果。

### 調整難度系統
在各個模式的生成方法中，`difficulty` 參數會隨著關卡提升：
- 難度 1: 關卡 1-10
- 難度 2: 關卡 11-20
- 難度 3: 關卡 21-30
- 以此類推...

你可以根據 `difficulty` 參數調整磚塊數量、密度或特殊排列。

## 📝 授權

此專案為開源專案，歡迎自由使用和修改。

## 🎯 未來改進計畫

- [ ] 新增音效和背景音樂
- [ ] 更多道具類型（穿透球、雷射炮、磁吸等）
- [ ] 排行榜系統（本地或線上）
- [ ] 特殊磚塊類型（需要多次擊打、移動磚塊、不可破壞磚塊等）
- [ ] 關卡編輯器（讓玩家自訂關卡）
- [ ] 多人對戰模式
- [ ] 成就系統
- [ ] 粒子效果和動畫增強

---

玩得開心！ 🎮✨
