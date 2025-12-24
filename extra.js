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
        }

        // 恢復裝備寵物
        if (data.activePetIndex != null && pets[data.activePetIndex]) {
            activePet = pets[data.activePetIndex];
        }

        // 更新 UI
        updateUI();
        if (typeof updatePetPanel === "function") updatePetPanel();

    } catch (err) {
        console.error("讀取存檔錯誤：", err);
    }
}

// ====== 綁定按鈕 ======
const btnSave = document.getElementById("btn-save");
if (btnSave) {
    btnSave.onclick = saveGameExtended;
}

// ====== 初始化時讀檔 ======
window.addEventListener("load", () => {
    loadGameExtended();
});

// ====== 顯示中間偏上的提示文字，每 12 秒出現 2.5 秒 ======
function showScrollTip() {
  const tip = document.createElement("div");
  tip.id = "scroll-tip";
  tip.innerText = "若看不到戰鬥頁面，請往下滑";

  tip.style.position = "fixed";
  tip.style.top = "15%";
  tip.style.left = "50%";
  tip.style.transform = "translateX(-50%)";
  tip.style.color = "#00ff00";
  tip.style.fontSize = "20px";
  tip.style.fontWeight = "bold";
  tip.style.zIndex = "900";
  tip.style.pointerEvents = "none";
  tip.style.backgroundColor = "transparent";
  tip.style.display = "none"; // 初始隱藏

  document.body.appendChild(tip);

  // 每 12 秒顯示一次，持續 2.5 秒
  setInterval(() => {
    tip.style.display = "block";
    setTimeout(() => {
      tip.style.display = "none";
    }, 2500);
  }, 12000);
}

// 載入頁面後啟動
window.addEventListener("load", showScrollTip);

