/*************************************************
 * fakeRank.js
 * 偽排行榜系統（單機假資料）
 * - 不修改 app.js
 * - 不影響存檔
 * - 僅讀取 player.level
 *************************************************/

/* ===============================
 * 1. 假排行榜資料（你可自行改）
 * =============================== */
const FAKE_TOP_RANKS = [
  { name: "夜燼法皇", level: 48 },
  { name: "蒼藍賢者", level: 44 },
  { name: "紅蓮咒術師", level: 41 },
  { name: "白銀製杖師", level: 39 },
  { name: "星隕觀測者", level: 36 }
];

/* ===============================
 * 2. 玩家等級 → 排名對照
 * =============================== */
function getPlayerFakeRank(level) {
  if (level === 1) return "1748 名";
  if (level === 2) return "1644 名";
  if (level === 3) return "1512 名";
  if (level === 4) return "1402 名";
  if (level === 5) return "1222 名";
  if (level === 6) return "1181 名";
  return "排名更新中...";
}

/* ===============================
 * 3. 建立排行榜按鈕（固定）
 * =============================== */
const rankBtn = document.createElement("button");
rankBtn.innerText = "🏆 排行榜";
rankBtn.id = "rank-btn-fixed";

rankBtn.style.position = "fixed";
rankBtn.style.left = "12px";
rankBtn.style.bottom = "12px";
rankBtn.style.zIndex = "9999";

rankBtn.style.padding = "10px 16px";
rankBtn.style.fontSize = "16px";
rankBtn.style.borderRadius = "10px";
rankBtn.style.border = "none";
rankBtn.style.cursor = "pointer";
rankBtn.style.color = "#fff";
rankBtn.style.background =
  "linear-gradient(135deg, #f7971e, #ffd200)";

document.body.appendChild(rankBtn);

/* ===============================
 * 4. 排行榜面板
 * =============================== */
const rankPanel = document.createElement("div");
rankPanel.style.position = "fixed";
rankPanel.style.top = "0";
rankPanel.style.left = "0";
rankPanel.style.width = "100%";
rankPanel.style.height = "100%";
rankPanel.style.zIndex = "10000";
rankPanel.style.background = "rgba(0,0,0,0.85)";
rankPanel.style.color = "#fff";
rankPanel.style.display = "none";
rankPanel.style.overflowY = "auto";
rankPanel.style.padding = "20px";
rankPanel.style.boxSizing = "border-box";

document.body.appendChild(rankPanel);

/* ===============================
 * 5. 生成排行榜內容
 * =============================== */
function renderFakeRank() {
  let html = "";

  html += `<h2 style="text-align:center;">🏆 排行榜</h2>`;
  html += `<div style="max-width:480px;margin:0 auto;">`;

  html += `<h3>前五名</h3>`;
  html += `<ol>`;
  FAKE_TOP_RANKS.forEach(r => {
    html += `<li style="margin:6px 0;">
      ${r.name}（Lv.${r.level}）
    </li>`;
  });
  html += `</ol>`;

  html += `<hr style="margin:16px 0;">`;

  const playerLevel = (window.player && player.level) || 1;
  const playerRank = getPlayerFakeRank(playerLevel);

  html += `<h3>你的排名</h3>`;
  html += `<div style="margin-top:8px;font-size:18px;color:#7CFC98;">
    Lv.${playerLevel} → ${playerRank}
  </div>`;

  html += `<div style="margin-top:24px;text-align:center;">`;
  html += `<button id="rank-close-btn"
    style="
      font-size:18px;
      padding:8px 16px;
      border-radius:8px;
      border:none;
      cursor:pointer;
    ">關閉</button>`;
  html += `</div>`;

  html += `</div>`;

  rankPanel.innerHTML = html;

  document.getElementById("rank-close-btn").onclick = () => {
    rankPanel.style.display = "none";
  };
}

/* ===============================
 * 6. 綁定按鈕
 * =============================== */
rankBtn.onclick = () => {
  renderFakeRank();
  rankPanel.style.display = "block";
};
