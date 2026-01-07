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
  };

  btnClose.onclick = () => panel.style.display = "none";
});
