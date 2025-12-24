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
  panels.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.position = "absolute";  
    // 修正：為了防止重疊，讓第二個面板稍微往下靠
    el.style.top = (index * 70) + "px"; 
    el.style.left = "0";
    el.style.width = "100%";
    el.style.zIndex = "500"; 
    el.style.backgroundImage = "linear-gradient(to right, #ff7e5f, #feb47b)";
    el.style.backgroundColor = "transparent";
    el.style.padding = "10px";
    el.style.boxSizing = "border-box";
    el.style.color = "#fff"; 
  });

  const battle = document.getElementById("battle");
  if (battle) {
    battle.style.marginTop = "200px"; 
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
      if (wand) showGlobalTip(`你已裝備 ${wand.name}（${wand.rarity}）`, 2000);
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
 * ================================================= */

function scaleAllButtons() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.id === "pet-btn-fixed") return;
    btn.style.fontSize = "20px";      
    btn.style.height = "50px";        
    btn.style.padding = "0 15px";     
    btn.style.borderRadius = "10px";  
    btn.style.marginTop = "5px";
    btn.style.boxSizing = "border-box";
  });
}

window.addEventListener("load", () => {
  scaleAllButtons();
});

/*************************************************
 * extra_save.js - 擴充存檔系統
 *************************************************/

function saveGameExtended() {
    const saveData = {
        playerBasic: {
            name: player.name,
            lv: player.lv, // 統一為 lv
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
        pets: (typeof pets !== 'undefined') ? pets.map(p => ({
            name: p.name,
            unlocked: p.unlocked,
            level: p.level
        })) : [],
        activePetIndex: (typeof activePet !== 'undefined' && typeof pets !== 'undefined') ? pets.indexOf(activePet) : null
    };

    localStorage.setItem("wand_rpg_save_extended", JSON.stringify(saveData));
}

function loadGameExtended() {
    const s = localStorage.getItem("wand_rpg_save_extended");
    if (!s) return;

    try {
        const data = JSON.parse(s);
        player.name = data.playerBasic.name;
        player.lv = data.playerBasic.lv;
        player.exp = data.playerBasic.exp;
        player.gold = data.playerBasic.gold;
        player.hp = data.playerBasic.hp;
        player.mp = data.playerBasic.mp;

        if (data.weapons && Array.isArray(data.weapons)) {
            player.weapons = data.weapons.map(w => ({
                ...w,
                img: "assets/weapons/wand_common.png"
            }));
        }

        if (data.weaponData && data.weaponData.index != null && player.weapons[data.weaponData.index]) {
            player.weapon = player.weapons[data.weaponData.index];
        }

        if (data.pets && Array.isArray(data.pets) && typeof pets !== 'undefined') {
            data.pets.forEach((pData, i) => {
                if (pets[i]) {
                    pets[i].unlocked = pData.unlocked;
                    pets[i].level = pData.level;
                }
            });
        }
    } catch (e) {
        console.error("擴充讀檔錯誤", e);
    }
}

// ====== 永久顯示可關閉的提示文字 ======
function createPersistentScrollTip() {
  const tipWrapper = document.createElement("div");
  tipWrapper.id = "scroll-tip-wrapper";

  const tipText = document.createElement("span");
  tipText.innerText = "若看不到戰鬥頁面，請往下滑";
  tipText.style.color = "#00ff00";
  tipText.style.fontSize = "18px";
  tipText.style.fontWeight = "bold";
  tipText.style.marginRight = "12px";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✖";
  closeBtn.style.background = "#444";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.width = "24px";
  closeBtn.style.height = "24px";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.cursor = "pointer";

  closeBtn.onclick = () => {
    tipWrapper.style.display = "none";
  };

  tipWrapper.appendChild(tipText);
  tipWrapper.appendChild(closeBtn);

  tipWrapper.style.position = "fixed";
  tipWrapper.style.bottom = "10%";
  tipWrapper.style.left = "50%";
  tipWrapper.style.transform = "translateX(-50%)";
  tipWrapper.style.zIndex = "900";
  tipWrapper.style.backgroundColor = "rgba(0,0,0,0.8)";
  tipWrapper.style.padding = "10px 20px";
  tipWrapper.style.borderRadius = "30px";
  tipWrapper.style.display = "flex";
  tipWrapper.style.alignItems = "center";
  
  document.body.appendChild(tipWrapper);
}

window.addEventListener("load", createPersistentScrollTip);

/*************************************************
 * extra_level_up.js
 * 功能：強制使用此處的升級屬性公式
 *************************************************/

function applyLevelBonus() {
  if (!player.base) return; // 對應 app.js 的 player.base

  const lvl = player.lv;
  const atkIncrease = 0.05;      
  const hpIncrease = 0.08;       
  const mpIncrease = 0.06;       

  // 強制覆寫當前屬性
  player.atk = Math.floor(player.base.atk * (1 + atkIncrease * (lvl - 1)));
  player.maxhp = Math.floor(player.base.hp * (1 + hpIncrease * (lvl - 1)));
  player.maxmp = Math.floor(player.base.mp * (1 + mpIncrease * (lvl - 1)));
  
  // 更新 UI 確保數值顯示
  if (typeof updateUI === "function") updateUI();
}

// 劫持 app.js 的 saveGame
const _origSave = saveGame;
saveGame = function() {
  applyLevelBonus(); 
  if (_origSave) _origSave();
  saveGameExtended();
};

// 劫持 app.js 的 loadGame
const _origLoad = loadGame;
loadGame = function() {
  if (_origLoad) _origLoad();
  loadGameExtended();
  applyLevelBonus(); 
};

// 劫持獎勵系統，確保升級後觸寫公式
// 在 app.js 中，升級邏輯是在 rewardBattle 的 while 迴圈裡
const _origReward = rewardBattle;
rewardBattle = function() {
    _origReward();
    applyLevelBonus(); // 強制應用本檔案的公式
    showGlobalTip(`🎉 屬性已依等級強化！`, 1500);
};
