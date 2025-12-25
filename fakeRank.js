/*************************************************
 * fakeRank.js - 假排行榜按鈕（沿用第一次生成樣式）
 *************************************************/

// ====== 建立排行榜按鈕 ======
const rankButton = document.createElement("button");
rankButton.id = "rank-btn-fixed";
rankButton.innerText = "🏆 排行榜";

// ====== 按鈕樣式（與第一次生成的 fakeRank 按鈕完全相同） ======
rankButton.style.position = "fixed";
rankButton.style.left = "12px";
rankButton.style.bottom = "12px";
rankButton.style.right = "auto"; // 清除右邊位置，確保固定在左下角
rankButton.style.padding = "10px 16px";
rankButton.style.fontSize = "16px";
rankButton.style.fontWeight = "bold";
rankButton.style.background = "linear-gradient(135deg, #f9d423, #ff4e50)";
rankButton.style.color = "#ffffff";
rankButton.style.border = "none";
rankButton.style.borderRadius = "10px";
rankButton.style.zIndex = "9999";
rankButton.style.cursor = "pointer";

// ====== 排行榜面板 ======
const rankPanel = document.createElement("div");
rankPanel.id = "rank-panel";
rankPanel.style.display = "none";
rankPanel.style.position = "fixed";
rankPanel.style.right = "12px";
rankPanel.style.bottom = "60px"; // 排行榜面板高於按鈕，避免遮擋
rankPanel.style.width = "220px";
rankPanel.style.backgroundColor = "rgba(0,0,0,0.8)";
rankPanel.style.color = "#fff";
rankPanel.style.padding = "10px";
rankPanel.style.borderRadius = "10px";
rankPanel.style.zIndex = "9999";
rankPanel.style.fontSize = "14px";
rankPanel.style.boxSizing = "border-box";
document.body.appendChild(rankPanel);

// ====== 假資料設定 ======
const fakeTop5 = [
  { name: "玩家A", level: 50 },
  { name: "玩家B", level: 46 },
  { name: "玩家C", level: 43 },
  { name: "玩家D", level: 40 },
  { name: "玩家E", level: 35 }
];

// ====== 更新排行榜內容 ======
function updateFakeRank() {
  if (!player || typeof player.level !== "number") return;
  let html = "<strong>前五名</strong><br>";
  fakeTop5.forEach((p, i) => {
    html += `${i + 1}. ${p.name} Lv.${p.level}<br>`;
  });

  // 玩家名次判定
  let playerRank = "排名更新中...";
  if (player.level === 1) playerRank = "1748 名";
  else if (player.level === 2) playerRank = "1644 名";
  else if (player.level === 3) playerRank = "1512 名";
  else if (player.level === 4) playerRank = "1402 名";
  else if (player.level === 5) playerRank = "1222 名";
  else if (player.level === 6) playerRank = "1181 名";

  html += `<br><strong>你的排名</strong><br>Lv.${player.level} - ${playerRank}`;
  rankPanel.innerHTML = html;
}

// ====== 點擊按鈕切換顯示 ======
rankButton.onclick = () => {
  rankPanel.style.display = rankPanel.style.display === "none" ? "block" : "none";
  updateFakeRank();
};

// ====== 加入按鈕到頁面 ======
document.body.appendChild(rankButton);

// ====== 定時更新玩家名次 ======
setInterval(updateFakeRank, 1000);
