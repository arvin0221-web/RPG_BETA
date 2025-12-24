/*************************************************
 * extra.js
 * 功能：
 * 1. 商店 / 杖面板固定在頁面最上方
 * 2. 戰鬥區自動下移
 * 3. 全局提示文字居中顯示
 *************************************************/

// ====== 調整商店與杖面板顯示位置 ======
function adjustPanels() {
  const panels = ["wand-panel", "shop-panel"];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.position = "absolute";   // 固定在頁面頂部
    el.style.top = "0px";
    el.style.left = "0";
    el.style.width = "100%";
    el.style.zIndex = "500";          // 確保在戰鬥區上層
    el.style.backgroundImage = "linear-gradient(to right, #ff7e5f, #feb47b)";
    el.style.backgroundColor = "transparent"; // 清空原本顏色
    el.style.color = "#fff"; // 白色文字

    el.style.padding = "10px";
    el.style.boxSizing = "border-box";
  });

  // 將戰鬥區往下移，避免被面板遮住
  const battle = document.getElementById("battle");
  if (battle) {
    battle.style.marginTop = "200px"; // 可依 panel 高度調整
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
  tip.style.pointerEvents = "none"; // 不擋點擊

  // 加入淡入淡出效果
  tip.style.transition = "opacity 0.3s";
}

// ====== 初始化 ======
window.addEventListener("load", () => {
  adjustPanels();
  centerGlobalTip();
});


