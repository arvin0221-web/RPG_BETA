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
 * 功能：
 * 1. 保存玩家裝備杖的狀態
 * 2. 保存寵物解鎖、等級與裝備狀態
 * 3. 讀檔後自動恢復 UI 與屬性
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
        pets: pets.map(p => ({
            name: p.name,
            unlocked: p.unlocked,
            level: p.level
        })),
        activePetIndex: activePet ? pets.indexOf(activePet) : null
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
        if (data.pets && Array.isArray(data.pets)) {
            data.pets.forEach((pData, i) => {
                if (pets[i]) {
                    pets[i].unlocked = pData.unlocked;
                    pets[i].level = pData.level;
                }

});

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
 * 功能：
 * 1. 升級後提升玩家屬性
 * 2. 存檔時包含屬性與基礎屬性
 * 3. 讀檔時恢復屬性
 * 4. 經驗值獲取公式：依怪物等級、血量與攻擊力計算
 *************************************************/

// ====== 計算升級後屬性增幅 ======
function applyLevelBonus() {
  if (!player.baseStats) {
    // 保存原始基礎屬性
    player.baseStats = {
      atk: player.atk,
      maxhp: player.maxhp,
      maxmp: player.maxmp,
      crit: player.crit,
      critDmg: player.critDmg
    };
  }

  const lvl = player.level;
  // 每級提升百分比，可以調整平衡
  const atkIncrease = 0.05;      // 每級攻擊力 +5%
  const hpIncrease = 0.08;       // 每級最大血量 +8%
  const mpIncrease = 0.06;       // 每級最大魔力 +6%
  const critIncrease = 0.00;     // 每級暴擊率 +0%
  const critDmgIncrease = 0.00;  // 每級暴擊傷害 +0%

  player.atk = Math.floor(player.baseStats.atk * (1 + atkIncrease * (lvl - 1)));
  player.maxhp = Math.floor(player.baseStats.maxhp * (1 + hpIncrease * (lvl - 1)));
  player.maxmp = Math.floor(player.baseStats.maxmp * (1 + mpIncrease * (lvl - 1)));
  player.crit = parseFloat((player.baseStats.crit + critIncrease * (lvl - 1)).toFixed(2));
  player.critDmg = parseFloat((player.baseStats.critDmg + critDmgIncrease * (lvl - 1)).toFixed(2));
}

// ====== 升級經驗值計算公式 ======
function calcExp(monster) {
  if (!monster) return 0;
  // 綜合血量與攻擊力計算
  const baseExp = 50;  // 基礎經驗值
  const hpFactor = monster.maxHp / 100;  // 依血量加成
  const atkFactor = monster.atk / 10;    // 依攻擊力加成
  const levelFactor = monster.level * 5; // 依怪物等級加成
  const expGained = Math.floor(baseExp + hpFactor + atkFactor + levelFactor);
  return expGained;
}

// ====== 存檔函式覆寫 / 擴充 ======
const _origSaveGame = typeof saveGame === "function" ? saveGame : null;
saveGame = function() {
  applyLevelBonus(); // 確保屬性更新

  const saveData = {
    name: player.name,
    level: player.level,
    gold: player.gold,
    atk: player.atk,
    maxhp: player.maxhp,
    maxmp: player.maxmp,
    crit: player.crit,
    critDmg: player.critDmg,
    baseStats: player.baseStats, // 保存基礎屬性
    weapons: player.weapons,
    equippedWeapon: player.equippedWeapon,
    pets: pets,
    activePet: activePet ? activePet.name : null,
    // 其他原存檔欄位可以加入這裡
  };
  localStorage.setItem("myGameSave", JSON.stringify(saveData));

  if (_origSaveGame) _origSaveGame();
};

// ====== 讀檔函式覆寫 / 擴充 ======
const _origLoadGame = typeof loadGame === "function" ? loadGame : null;
loadGame = function() {
  if (_origLoadGame) _origLoadGame();

  const data = JSON.parse(localStorage.getItem("myGameSave"));
  if (!data) return;

  player.name = data.name ?? player.name;
  player.level = data.level ?? player.level;
  player.gold = data.gold ?? player.gold;

  player.baseStats = data.baseStats ?? player.baseStats ?? {
    atk: player.atk,
    maxhp: player.maxhp,
    maxmp: player.maxmp,
    crit: player.crit,
    critDmg: player.critDmg
  };

  applyLevelBonus(); // 計算屬性

  // 如果原本存了屬性也覆寫
  player.atk = data.atk ?? player.atk;
  player.maxhp = data.maxhp ?? player.maxhp;
  player.maxmp = data.maxmp ?? player.maxmp;
  player.crit = data.crit ?? player.crit;
  player.critDmg = data.critDmg ?? player.critDmg;

  // 恢復武器與寵物
  player.weapons = data.weapons ?? player.weapons;
  player.equippedWeapon = data.equippedWeapon ?? player.equippedWeapon;
  pets = data.pets ?? pets;
  activePet = data.activePet ? pets.find(p => p.name === data.activePet) : null;

  updateUI();
};

// ====== 升級後呼叫 ======
const _origLevelUp = typeof levelUp === "function" ? levelUp : null;
levelUp = function() {
  if (_origLevelUp) _origLevelUp();
  applyLevelBonus();
  updateUI();
  showGlobalTip(`🎉 升級！你的屬性已提升`, 2000);
};
/*************************************************
 * tutorial.js - 新手教學浮動面板
 * 點擊按鈕即可顯示 tutorial.txt 內容
 * 面板覆蓋畫面，可關閉
 *************************************************/

// ====== 建立浮動面板 ======
const tutorialPanel = document.createElement("div");
tutorialPanel.id = "tutorial-panel";
tutorialPanel.style.display = "none";
tutorialPanel.style.position = "fixed";
tutorialPanel.style.top = "0";
tutorialPanel.style.left = "0";
tutorialPanel.style.width = "100%";
tutorialPanel.style.height = "100%";
tutorialPanel.style.backgroundColor = "rgba(0,0,0,0.9)";
tutorialPanel.style.color = "#00ff00";
tutorialPanel.style.overflowY = "auto";
tutorialPanel.style.padding = "20px";
tutorialPanel.style.boxSizing = "border-box";
tutorialPanel.style.zIndex = "10000";
tutorialPanel.style.fontSize = "18px";
tutorialPanel.style.lineHeight = "1.6";

// 內容容器
const tutorialContent = document.createElement("pre");
tutorialContent.id = "tutorial-content";
tutorialContent.style.whiteSpace = "pre-wrap";
tutorialContent.style.wordWrap = "break-word";
tutorialPanel.appendChild(tutorialContent);

// 關閉按鈕
const closeBtn = document.createElement("button");
closeBtn.innerText = "❌ 關閉";
closeBtn.style.position = "fixed";
closeBtn.style.top = "12px";
closeBtn.style.right = "12px";
closeBtn.style.fontSize = "20px";
closeBtn.style.padding = "6px 12px";
closeBtn.style.borderRadius = "8px";
closeBtn.style.cursor = "pointer";
closeBtn.style.zIndex = "10001";
closeBtn.onclick = () => { tutorialPanel.style.display = "none"; };
tutorialPanel.appendChild(closeBtn);

document.body.appendChild(tutorialPanel);

// ====== 建立新手教學按鈕（固定右上角） ======
const tutorialBtn = document.createElement("button");
tutorialBtn.id = "tutorial-btn";
tutorialBtn.innerText = "📖 新手教學";
tutorialBtn.style.position = "fixed";
tutorialBtn.style.top = "12px";
tutorialBtn.style.right = "12px";
tutorialBtn.style.fontSize = "16px";
tutorialBtn.style.padding = "6px 12px";
tutorialBtn.style.borderRadius = "8px";
tutorialBtn.style.background = "linear-gradient(135deg, #6a11cb, #2575fc)";
tutorialBtn.style.color = "#ffffff";
tutorialBtn.style.border = "none";
tutorialBtn.style.cursor = "pointer";
tutorialBtn.style.zIndex = "9999";

document.body.appendChild(tutorialBtn);

// ====== 點擊按鈕讀取 tutorial.txt 並顯示 ======
tutorialBtn.onclick = async () => {
  try {
    const response = await fetch("tutorial.txt");
    if (!response.ok) throw new Error("讀取失敗");
    const text = await response.text();
    tutorialContent.innerText = text;
    tutorialPanel.style.display = "block";
  } catch (err) {
    tutorialContent.innerText = "無法載入教學內容";
    tutorialPanel.style.display = "block";
    console.error(err);
  }
};

