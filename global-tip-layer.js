// =================================================
// ====== 全域最高層提示容器 =======================
// =================================================
const globalTipLayer = document.createElement("div");
globalTipLayer.id = "global-tip-layer";

globalTipLayer.style.position = "fixed";
globalTipLayer.style.left = "0";
globalTipLayer.style.top = "0";
globalTipLayer.style.width = "100%";
globalTipLayer.style.height = "100%";

globalTipLayer.style.pointerEvents = "none";
globalTipLayer.style.zIndex = "999999";

document.body.appendChild(globalTipLayer);
// =================================================
// ====== 接管 showGlobalTip（顯示層級最高）========
// =================================================
const __origShowGlobalTip = window.showGlobalTip;

window.showGlobalTip = function (text, duration = 2000) {
  const tip = document.createElement("div");

  tip.innerText = text;
  tip.style.position = "fixed";
  tip.style.left = "50%";
  tip.style.top = "20%";
  tip.style.transform = "translateX(-50%)";

  tip.style.background = "rgba(0,0,0,0.75)";
  tip.style.color = "#ffffff";
  tip.style.padding = "12px 20px";
  tip.style.borderRadius = "12px";
  tip.style.fontSize = "18px";
  tip.style.fontWeight = "bold";
  tip.style.boxShadow = "0 0 12px rgba(0,0,0,0.4)";
  tip.style.whiteSpace = "nowrap";

  tip.style.pointerEvents = "none";

  globalTipLayer.appendChild(tip);

  setTimeout(() => {
    tip.remove();
  }, duration);
};
