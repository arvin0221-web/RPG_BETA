/*************************************************
 * extra.js - 綜合擴充插件 (完整整合版)
 * 1. UI 樣式優化與自動位移
 * 2. 存存檔系統增強 (含寵物與詳細裝備)
 * 3. 強制性屬性成長公式 (覆蓋 app.js 的提升效果)
 * 4. 提示系統整合
 *************************************************/

// ====== 1. 介面與樣式調整 ======

function adjustPanels() {
  const panels = ["wand-panel", "shop-panel"];
  panels.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.position = "fixed"; // 改為 fixed 確保在最上方
    el.style.top = (index * 60) + "px"; // 避免兩個面板重疊，稍微錯開
    el.style.left = "0";
    el.style.width = "100%";
    el.style.zIndex = "500"; 
    el.style.backgroundImage = "linear-gradient(to right, #ff7e5f, #feb47b)";
    el.style.backgroundColor = "transparent";
    el.style.padding = "10px";
    el.style.boxSizing = "border-box";
    el.style.color = "#fff";
    el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  });

  // 將戰鬥區往下移，避免被面板遮住
  const battle = document.getElementById("battle");
  if (battle) {
    battle.style.marginTop = "220px"; 
  }
}

function centerGlobalTip() {
  const tip = document.getElementById("global-tip");
  if (!tip) return;
  // 強制覆寫原本隱藏的樣式
  tip.style.position = "fixed";
  tip.style.top = "50%";
  tip.style.left = "50%";
  tip.style.transform = "translate(-50%, -50%)";
  tip.style.zIndex = "1000";
  tip.style.backgroundColor = "rgba(0,0,0,0.8)";
  tip.style.color = "#fff";
  tip.style.padding = "15px 30px";
  tip.style.borderRadius = "12px";
  tip.style.textAlign = "center";
  tip.style.fontSize = "1.2rem";
  tip.style.pointerEvents = "none"; 
  tip.style.border = "2px solid #feb47b";
}

// ====== 2. 強制性屬性成長系統 ======

/**
 * 這是你要求的唯一屬性提升邏輯。
 * 它會根據玩家當前等級 (player.lv)，基於 player.base 強制重新計算數值。
 */
function applyCustomEnhancedStats() {
  if (!player.base) return;

  const lvl = player.lv;
  // 你設定的成長率
  const atkIncrease = 0.05;      // 每級攻擊力 +5%
  const hpIncrease = 0.08;       // 每級最大血量 +8%
  const mpIncrease = 0.06;       // 每級最大魔力 +6%

  // 強制覆寫當前屬性 (基於 app.js 定義的 player.base)
  // 公式：基礎值 * (1 + 成長率 * (等級-1))
  player.atk = Math.floor(player.base.atk * (1 + atkIncrease * (lvl - 1)));
  player.maxhp = Math.floor(player.base.hp * (1 + hpIncrease * (lvl - 1)));
  player.maxmp = Math.floor(player.base.mp * (1 + mpIncrease * (lvl - 1)));
  
  // 保持暴擊率
  player.crit = player.base.crit;
  player.critDmg = player.base.critDmg;

  // 如果有裝備杖，app.js 的 updateUI 會再次呼叫 calcStats()
  // 但因為我們修改了 player 本身的數值，所以會疊加生效
}

// ====== 3. 存檔系統增強 (Fix 語法錯誤) ======

function saveGameExtended() {
    const saveData = {
        playerData: {
            name: player.name,
            lv: player.lv,
            exp: player.exp,
            gold: player.gold,
            hp: player.hp,
            mp: player.mp,
            // 存入當前強制計算後的屬性
            atk: player.atk,
            maxhp: player.maxhp,
            maxmp: player.maxmp
        },
        // 紀錄武器庫
        weapons: player.weapons,
        equippedWeaponIndex: player.weapon ? player.weapons.indexOf(player.weapon) : -1,
        // 紀錄寵物 (如果 pets 變數存在於全域)
        petsData: (typeof pets !== 'undefined') ? pets.map(p => ({
            name: p.name,
            unlocked: p.unlocked,
            level: p.level || 1
        })) : []
    };

    localStorage.setItem("wand_rpg_save_extended", JSON.stringify(saveData));
    showGlobalTip("💾 擴充存檔已保存", 1000);
}

function loadGameExtended() {
    const s = localStorage.getItem("wand_rpg_save_extended");
    if (!s) return;

    try {
        const data = JSON.parse(s);
        
        // 恢復基礎資料
        player.name = data.playerData.name;
        player.lv = data.playerData.lv;
        player.exp = data.playerData.exp;
        player.gold = data.playerData.gold;
        player.hp = data.playerData.hp;
        player.mp = data.playerData.mp;

        // 恢復武器清單
        if (data.weapons) player.weapons = data.weapons;
        if (data.equippedWeaponIndex !== -1) {
            player.weapon = player.weapons[data.equippedWeaponIndex];
        }

        // 恢復寵物
        if (data.petsData && typeof pets !== 'undefined') {
            data.petsData.forEach((pData, i) => {
                if (pets[i]) {
                    pets[i].unlocked = pData.unlocked;
                    pets[i].level = pData.level;
                }
            });
        }

        // 讀檔後立即應用強制屬性公式
        applyCustomEnhancedStats();
        if (typeof updateUI === "function") updateUI();
        
    } catch (e) {
        console.error("讀檔出錯:", e);
    }
}

// ====== 4. 函式劫持 (Hooking) - 不刪除原功能，只增加邏輯 ======

function bindExtraHooks() {
  // 1. 劫持裝備功能：加入提示
  if (typeof equipWand === "function") {
    const _origEquip = equipWand;
    equipWand = function(i) {
      _origEquip(i);
      const w = player.weapons[i];
      if (w) showGlobalTip(`✨ 已裝備：${w.name} (${w.rarity})`);
    };
  }

  // 2. 劫持購買功能：加入金幣判斷提示
  if (typeof buyWand === "function") {
    const _origBuy = buyWand;
    buyWand = function(i) {
      const base = wandDB[i];
      if (player.gold < base.price) {
        showGlobalTip("💰 金幣不足，去戰鬥賺錢吧！", 2000);
        return; 
      }
      _origBuy(i);
    };
  }

  // 3. 劫持存檔功能：同時執行擴充存檔
  if (typeof saveGame === "function") {
    const _origSave = saveGame;
    saveGame = function() {
      _origSave();
      saveGameExtended();
    };
  }

  // 4. 劫持讀檔功能：讀取後應用新公式
  if (typeof loadGame === "function") {
    const _origLoad = loadGame;
    loadGame = function() {
      _origLoad();
      loadGameExtended();
    };
  }
}

// ====== 5. 按鈕統一樣式調整 ======

function scaleAllButtons() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.id === "pet-btn-fixed") return;
    btn.style.fontSize = "18px";
    btn.style.padding = "10px 15px";
    btn.style.margin = "5px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "8px";
    btn.style.transition = "all 0.2s";
  });
}

// ====== 6. 永久提示 (防遮擋) ======

function createPersistentScrollTip() {
  if (document.getElementById("scroll-tip-wrapper")) return;
  
  const tipWrapper = document.createElement("div");
  tipWrapper.id = "scroll-tip-wrapper";
  tipWrapper.innerHTML = `
    <div style="display:flex; align-items:center; background:rgba(0,0,0,0.6); padding:8px 15px; border-radius:20px; border:1px solid #00ff00;">
      <span style="color:#00ff00; font-weight:bold; margin-right:10px;">💡 若看不到戰鬥區請往下捲動</span>
      <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; color:#fff; cursor:pointer; font-size:16px;">✖</button>
    </div>
  `;
  
  tipWrapper.style.position = "fixed";
  tipWrapper.style.bottom = "20px";
  tipWrapper.style.left = "50%";
  tipWrapper.style.transform = "translateX(-50%)";
  tipWrapper.style.zIndex = "999";
  document.body.appendChild(tipWrapper);
}

// ====== 7. 初始化啟動 ======

window.addEventListener("load", () => {
  // 1. 執行介面調整
  adjustPanels();
  centerGlobalTip();
  
  // 2. 綁定擴充邏輯 (劫持)
  bindExtraHooks();
  
  // 3. 調整按鈕
  scaleAllButtons();
  
  // 4. 建立常駐提示
  createPersistentScrollTip();
  
  // 5. 每秒強制檢查一次屬性 (確保升級後立即更新，且不受 app.js 覆蓋)
  setInterval(() => {
    applyCustomEnhancedStats();
  }, 1000);
});
