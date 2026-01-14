window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-tutorial");
  const panel = document.getElementById("tutorial-panel");
  const contentDiv = document.getElementById("tutorial-content");
  const btnClose = document.getElementById("btn-close-tutorial");

  let tutorialText = null; // 避免每次點擊都 fetch

  btn.onclick = async function() {
    if (!tutorialText) {
      try {
        const response = await fetch("tutorial.txt"); // 讀取外部文字檔
        if (!response.ok) throw new Error("讀取文字檔失敗");
        tutorialText = await response.text();
      } catch (err) {
        console.error(err);
        tutorialText = "無法載入新手教學內容";
      }
    }
    contentDiv.textContent = tutorialText;
    panel.style.display = "block";
     // ⭐ 顯示縮放控制按鈕
    const controls = document.getElementById("tutorial-controls");
    if (controls) controls.style.display = "flex";
  };

 // 關閉新手教學
  btnClose.onclick = () => {
    panel.style.display = "none";
    if (controls) controls.style.display = "none"; // ⭐ 隱藏縮放控制按鈕
  };
});
// ===== 教學文字縮放控制 =====
let tutorialScale = 1;

function applyTutorialScale() {
  const content = document.getElementById("tutorial-content");
  if (!content) return;
  content.style.transform = `scale(${tutorialScale})`;
}

document.addEventListener("DOMContentLoaded", () => {
  const zoomIn  = document.getElementById("tutorial-zoom-in");
  const zoomOut = document.getElementById("tutorial-zoom-out");
  const reset   = document.getElementById("tutorial-zoom-reset");

  if (!zoomIn || !zoomOut || !reset) return;

  zoomIn.onclick = () => {
    tutorialScale = Math.min(tutorialScale + 0.1, 2.5);
    applyTutorialScale();
  };

  zoomOut.onclick = () => {
    tutorialScale = Math.max(tutorialScale - 0.1, 0.6);
    applyTutorialScale();
  };

  reset.onclick = () => {
    tutorialScale = 1;
    applyTutorialScale();
  };
});
