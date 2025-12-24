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

