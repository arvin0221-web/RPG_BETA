/*************************************************
 * extra.js
 * 功能整合：
 * 1. 商店 / 杖面板固定在頁面最上方，彩色背景
 * 2. 戰鬥區自動下移
 * 3. 全局提示文字居中顯示
 * 4. 裝備杖時顯示提示
 * 5. 金幣不足購買杖時顯示提示
 *************************************************/

// ====== 調整商店與杖面板顯示位置與背景 ======
function adjustPanels() {
  const panels = ["wand-panel", "shop-panel"];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.position = "absolute";  
    el.style.top = "0px";
    el.style.left = "0";
    el.style.width = "100%";
    el.style.zIndex = "500"; 
    // 彩色漸層背景
    el.style.backgroundImage = "linear-gradient(to right, #ff7e5f, #feb47b)";
    el.style.backgroundColor = "transparent";
    el.style.padding = "10px";
    el.style.boxSizing = "border-box";
    el.style.color = "#fff"; // 保證文字可讀
  });

  // 將戰鬥區往下移，避免被面板遮住
  const battle = document.getElementById("battle");
  if (battle) {
    battle.style.marginTop = "200px"; // 根據 panel 高度可調整
  }
}

// ====== 調整全局提示文字 ======
function centerGlobalTip() {
  const tip = document.getElementById("global-tip");
  if (!tip) return;

  tip.style.position = "fixed";
  tip.style.top = "50%";
  tip.style.left = "50%";
  tip.style.transform = "translate(-50%, -50%)";
  tip.style.zIndex = "1000";
  tip.style.backgroundColor = "rgba(0,0,0,0.7)";
  tip.style.color = "#fff";
  tip.style.padding = "10px 20px";
  tip.style.borderRadius = "8px";
  tip.style.textAlign = "center";
  tip.style.fontSize = "1rem";
  tip.style.pointerEvents = "none"; 
  tip.style.transition = "opacity 0.3s";
}

// ====== 延遲覆寫函式，確保提示可用 ======
function bindExtraTips() {
  // 裝備杖提示
  if (typeof equipWand === "function") {
    const _origEquipWand = equipWand;
    equipWand = function(i) {
      _origEquipWand(i);
      const wand = player.weapons[i];
      showGlobalTip(`你已裝備 ${wand.name}（${wand.rarity}）`, 2000);
    };
  }

  // 金幣不足購買提示
  if (typeof buyWand === "function") {
    const _origBuyWand = buyWand;
    buyWand = function(i) {
      const base = wandDB[i];
      if (player.gold < base.price) {
        showGlobalTip("💰 金幣不足，無法購買", 2000);
        return;
      }
      _origBuyWand(i);
    };
  }
}

// ====== 初始化 ======
window.addEventListener("load", () => {
  adjustPanels();
  centerGlobalTip();
  bindExtraTips();
});

/* =================================================
 * ====== 全遊戲按鈕統一放大 1.5 倍（排除寵物鍵）=====
 * 不修改 app.js / HTML
 * ================================================= */

function scaleAllButtons() {
  const buttons = document.querySelectorAll("button");

  buttons.forEach(btn => {
    // 排除固定寵物按鈕
    if (btn.id === "pet-btn-fixed") return;

    // ====== 1.25 倍設定（以原始常見尺寸為基準） ======
    btn.style.fontSize = "20px";      // 16 × 1.25
    btn.style.height = "50px";        // 固定高度，避免 minHeight + padding 疊加
    btn.style.padding = "0 15px";     // 只留左右 padding
    btn.style.borderRadius = "10px";  // 原本 ~8 → 1.25 倍
    btn.style.marginTop = "5px";
    btn.style.boxSizing = "border-box";
  });
}

// 確保所有按鈕（含商店 / 杖 / 戰鬥後生成的）都已出現
window.addEventListener("load", () => {
  scaleAllButtons();
});

/*************************************************
 * extra_save.js - 擴充存檔系統
 *************************************************/

// ====== 擴充存檔 ======
function saveGameExtended() {
    const saveData = {
        playerBasic: {
            name: player.name,
            lv: player.lv,
            exp: player.exp,
            gold: player.gold,
            hp: player.hp,
            mp: player.mp
        },
        weaponData: player.weapon ? {
            index: player.weapons.indexOf(player.weapon),
            rarity: player.weapon.rarity
        } : null,
        weapons: player.weapons.map(w => ({
            name: w.name,
            rarity: w.rarity,
            atk: w.atk,
            hp: w.hp,
            mp: w.mp,
            crit: w.crit,
            critDmg: w.critDmg
        })),
        pets: (typeof pets !== "undefined") ? pets.map(p => ({
            name: p.name,
            unlocked: p.unlocked,
            level: p.level
        })) : [],
        activePetIndex: (typeof activePet !== "undefined") ? pets.indexOf(activePet) : null
    };

    localStorage.setItem("wand_rpg_save_extended", JSON.stringify(saveData));
    showGlobalTip("💾 遊戲已保存", 2000);
}

// ====== 擴充讀檔 ======
function loadGameExtended() {
    const s = localStorage.getItem("wand_rpg_save_extended");
    if (!s) return;

    try {
        const data = JSON.parse(s);

        // 恢復玩家基本資料
        player.name = data.playerBasic.name;
        player.lv = data.playerBasic.lv;
        player.exp = data.playerBasic.exp;
        player.gold = data.playerBasic.gold;
        player.hp = data.playerBasic.hp;
        player.mp = data.playerBasic.mp;

        // 恢復武器列表
        if (data.weapons && Array.isArray(data.weapons)) {
            player.weapons = data.weapons.map(w => ({
                name: w.name,
                rarity: w.rarity,
                atk: w.atk,
                hp: w.hp,
                mp: w.mp,
                crit: w.crit,
                critDmg: w.critDmg,
                img: "assets/weapons/wand_common.png" // 保持預設圖示
            }));
        }

        // 恢復當前裝備武器
        if (data.weaponData && data.weaponData.index != null && player.weapons[data.weaponData.index]) {
            player.weapon = player.weapons[data.weaponData.index];
            player.weapon.rarity = data.weaponData.rarity;
        }

        // 恢復寵物狀態
        if (data.pets && Array.isArray(data.pets) && typeof pets !== "undefined") {
            data.pets.forEach((pData, i) => {
                if (pets[i]) {
                    pets[i].unlocked = pData.unlocked;
                    pets[i].level = pData.level;
                }
            });
        }
    } catch (e) {
        console.error("讀檔錯誤:", e);
    }
}

// ====== 永久顯示可關閉的提示文字 ======
function createPersistentScrollTip() {
  const tipWrapper = document.createElement("div");
  tipWrapper.id = "scroll-tip-wrapper";

  // 包含文字
  const tipText = document.createElement("span");
  tipText.innerText = "若看不到戰鬥頁面，請往下滑";
  tipText.style.color = "#00ff00";
  tipText.style.fontSize = "18px";
  tipText.style.fontWeight = "bold";
  tipText.style.marginRight = "12px";

  // 叉叉按鈕
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✖";
  closeBtn.style.background = "transparent";
  closeBtn.style.color = "#00ff00";
  closeBtn.style.border = "none";
  closeBtn.style.fontSize = "16px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontWeight = "bold";
  closeBtn.style.padding = "0";

  // 點擊叉叉隱藏整個提示
  closeBtn.onclick = () => {
    tipWrapper.style.display = "none";
  };

  tipWrapper.appendChild(tipText);
  tipWrapper.appendChild(closeBtn);

  // 設定固定位置，不擋戰鬥區
  tipWrapper.style.position = "fixed";
  tipWrapper.style.top = "10%";
  tipWrapper.style.left = "50%";
  tipWrapper.style.transform = "translateX(-50%)";
  tipWrapper.style.zIndex = "900";
  tipWrapper.style.backgroundColor = "rgba(0,0,0,0.5)";
  tipWrapper.style.padding = "6px 12px";
  tipWrapper.style.borderRadius = "8px";
  tipWrapper.style.display = "flex";
  tipWrapper.style.alignItems = "center";
  tipWrapper.style.pointerEvents = "auto";

  document.body.appendChild(tipWrapper);
}

// 載入頁面後啟動
window.addEventListener("load", createPersistentScrollTip);

/*************************************************
 * extra_level_up.js
 * 功能：強制覆蓋 app.js 升級公式
 *************************************************/

// ====== 計算升級後屬性增幅 ======
function applyLevelBonus() {
  if (!player.base) return;

  const lvl = player.lv;
  const atkIncrease = 0.05;      // 每級攻擊力 +5%
  const hpIncrease = 0.08;       // 每級最大血量 +8%
  const mpIncrease = 0.06;       // 每級最大魔力 +6%

  // 基於 app.js 的 player.base 強制覆寫當前屬性
  player.atk = Math.floor(player.base.atk * (1 + atkIncrease * (lvl - 1)));
  player.maxhp = Math.floor(player.base.hp * (1 + hpIncrease * (lvl - 1)));
  player.maxmp = Math.floor(player.base.mp * (1 + mpIncrease * (lvl - 1)));
  
  if (typeof updateUI === "function") updateUI();
}

// 覆寫存檔與讀檔，確保連動擴充內容與公式
const _origSaveGame = typeof saveGame === "function" ? saveGame : null;
saveGame = function() {
  applyLevelBonus(); 
  if (_origSaveGame) _origSaveGame();
  saveGameExtended();
};

const _origLoadGame = typeof loadGame === "function" ? loadGame : null;
loadGame = function() {
  if (_origLoadGame) _origLoadGame();
  loadGameExtended();
  applyLevelBonus();
};

// 劫持 rewardBattle 確保升級後強制使用本公式
if (typeof rewardBattle === "function") {
  const _origReward = rewardBattle;
  rewardBattle = function() {
    _origReward();
    applyLevelBonus();
  };
              }
