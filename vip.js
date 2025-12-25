/*************************************************
 * vip.js - 特權加成系統
 *************************************************/
if (typeof calcStats === "function") {
  // 1. 先把原本的計算函式存起來
  const _origCalcStats = calcStats;

  // 2. 覆寫原本的函式
  calcStats = function() {
    // 執行原本的計算，取得基礎結果
    let stats = _origCalcStats();

    // 3. 判斷名字並進行額外加成
    if (player.name === "3x-27y=5π") {
      stats.atk += 50;
      stats.maxhp += 10000;
      stats.maxmp += 10000;
    }

    // 回傳加成後的結果
    return stats;
  };
}

// 執行完畢後強制更新一次介面
if (typeof updateUI === "function") updateUI();
