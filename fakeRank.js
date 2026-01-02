/*************************************************
 * ranking.js - 假排行榜系統
 * 功能：
 * 1. 顯示前五名玩家
 * 2. 顯示玩家自身排名
 * 3. 前五名名字與等級可修改
 * 4. 玩家排名顯示固定數字，6名以後顯示「排名更新中...」
 *************************************************/

// ====== 假排行榜資料 ======
let fakeRanking = [
  { rank: 1, name: "Yuhuan", level: 839 },
  { rank: 2, name: "想不到名字", level: 375 },
  { rank: 3, name: "菜菜", level: 215 },
  { rank: 4, name: "單男", level: 132 },
  { rank: 5, name: "878787", level: 101 }
];

// 玩家自身排名設定
let playerRanking = [
  { level: 1, rank: 2759 },
  { level: 2, rank: 2701 },
  { level: 3, rank: 2676 },
  { level: 4, rank: 2632 },
  { level: 5, rank: 2599 },
  { level: 6, rank: 2545 },
  { level: 7, rank: 2511 },
  { level: 8, rank: 2489 },
  { level: 9, rank: 2475 },
  { level: 10, rank: 2422 },
  { level: 11, rank: 2390 },
  { level: 12, rank: 2355 },
  { level: 13, rank: 2309 },
  { level: 14, rank: 2280 },
  { level: 15, rank: 2199 },
  { level: 16, rank: 2154 },
  { level: 17, rank: 2107 },
  { level: 18, rank: 2059 }  
];

// ====== 建立排行榜面板 ======
const rankingPanel = document.createElement("div");
rankingPanel.id = "ranking-panel";
rankingPanel.style.display = "none";
rankingPanel.style.position = "absolute";
rankingPanel.style.top = "50px";
rankingPanel.style.left = "50%";
rankingPanel.style.transform = "translateX(-50%)";
rankingPanel.style.width = "320px";
rankingPanel.style.backgroundColor = "#222";
rankingPanel.style.color = "#fff";
rankingPanel.style.padding = "12px";
rankingPanel.style.borderRadius = "10px";
rankingPanel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
rankingPanel.style.zIndex = "1000";
rankingPanel.innerHTML = `<h3 style="text-align:center;">排行榜</h3><div id="ranking-list"></div><button id="btn-close-ranking">關閉</button>`;
document.body.appendChild(rankingPanel);

// 關閉排行榜按鈕
document.getElementById("btn-close-ranking").onclick = () => {
  rankingPanel.style.display = "none";
};

// ====== 建立排行榜按鈕 ======
const btnRanking = document.createElement("button");
btnRanking.id = "btn-ranking";
btnRanking.innerText = "🏆 排行榜";
btnRanking.style.position = "fixed";
btnRanking.style.right = "12px";
btnRanking.style.top = "12px";
btnRanking.style.padding = "8px 12px";
btnRanking.style.fontSize = "16px";
btnRanking.style.background = "linear-gradient(135deg, #f7971e, #ffd200)";
btnRanking.style.color = "#000";
btnRanking.style.border = "none";
btnRanking.style.borderRadius = "8px";
btnRanking.style.cursor = "pointer";
btnRanking.style.zIndex = "9999";
document.body.appendChild(btnRanking);

// 點按按鈕時，先執行更新邏輯，再顯示介面
btnRanking.onclick = () => {
  if (typeof player !== 'undefined') { 
    updateRankingPanel(); // 確保每次點開按鈕，都會重新讀取當下的 player.level
    rankingPanel.style.display = "block";
  } else {
    console.error("找不到 player 物件，請確認玩家資料已載入");
  }
};


// ====== 更新排行榜內容 ======
function updateRankingPanel() {
  const listDiv = document.getElementById("ranking-list");
  listDiv.innerHTML = "";
  

  // 前五名
  fakeRanking.forEach(p => {
    const div = document.createElement("div");
    div.style.marginBottom = "4px";
    div.innerHTML = `第${p.rank}名: ${p.name} - Lv.${p.level}`;
    listDiv.appendChild(div);
  });

  // 玩家等級對應排名
    // 確保能即時抓到最新的 player.level，若沒定義則預設為 1
 const currentLv = (window.player && typeof player.level === "number")
  ? player.level
  : 1;

  
  let playerRank = null;

// 等級在表內才顯示實際排名
if (currentLv <= playerRanking.length) {
  playerRank = playerRanking[currentLv - 1];
}

  const divPlayer = document.createElement("div");
  divPlayer.style.marginTop = "12px";
  divPlayer.style.borderTop = "1px solid #555";
  divPlayer.style.paddingTop = "8px";

  if (playerRank) {
    divPlayer.innerHTML = `你的排名: ${playerRank.rank}`;
  } else {
    divPlayer.innerHTML = `你的排名: 排名更新中...`;
  }

  listDiv.appendChild(divPlayer);
}
console.log("排行榜抓到的玩家等級 =", currentLv);
