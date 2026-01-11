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
  { rank: 1, name: "單女", level: 3167 },
  { rank: 2, name: "Yuhuan", level: 1474 },
  { rank: 3, name: "想不到名字", level: 375 },
  { rank: 4, name: "菜菜", level: 215 },
  { rank: 5, name: "單男", level: 132 }
];

// 玩家自身排名設定
let playerRanking = [
  { lv: 1, rank: 3104 },
  { lv: 2, rank: 3054 },
  { lv: 3, rank: 3012 },
  { lv: 4, rank: 2998 },
  { lv: 5, rank: 2986 },
  { lv: 6, rank: 2973 },
  { lv: 7, rank: 2955 },
  { lv: 8, rank: 2932 },
  { lv: 9, rank: 2920 },
  { lv: 10, rank: 2913 },
  { lv: 11, rank: 2899 },
  { lv: 12, rank: 2885 },
  { lv: 13, rank: 2877 },
  { lv: 14, rank: 2862 },
  { lv: 15, rank: 2850 },
  { lv: 16, rank: 2841 },
  { lv: 17, rank: 2824 },
  { lv: 18, rank: 2811 },
  { lv: 19, rank: 2800 },
  { lv: 20, rank: 2775 },
  { lv: 21, rank: 2759 },
  { lv: 22, rank: 2701 },
  { lv: 23, rank: 2676 },
  { lv: 24, rank: 2632 },
  { lv: 25, rank: 2599 },
  { lv: 26, rank: 2545 },
  { lv: 27, rank: 2511 },
  { lv: 28, rank: 2489 },
  { lv: 29, rank: 2475 },
  { lv: 30, rank: 2422 },
  { lv: 31, rank: 2390 },
  { lv: 32, rank: 2355 },
  { lv: 33, rank: 2309 },
  { lv: 34, rank: 2280 },
  { lv: 35, rank: 2199 },
  { lv: 36, rank: 2154 },
  { lv: 37, rank: 2107 },
  { lv: 38, rank: 2059 },
  { lv: 39, rank: 2011 },
  { lv: 40, rank: 1960 }
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
 const currentLv = (window.player && typeof player.lv === "number")
  ? player.lv
  : 1;
  
  console.log("排行榜抓到的玩家等級 =", currentLv);
  
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
