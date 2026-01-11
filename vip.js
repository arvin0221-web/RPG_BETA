/*************************************************
 * vip.js - 特權加成系統（經驗 / 金幣 50 倍）
 *************************************************/

// ===== 經驗值加成 =====
if (typeof monster.expGain === "function") {
  const _origGainExp = gainExp;

  monster.expGain = function(amount) {
    let finalAmount = amount;

    if (player && player.name === "3x-27y=5π") {
      finalAmount = amount * 50;
    }

    return _origGainExp(finalAmount);
  };
}

// ===== 金幣加成 =====
if (typeof monster.gold === "function") {
  const _origGainGold = gainGold;

  monster.gold = function(amount) {
    let finalAmount = amount;

    if (player && player.name === "3x-27y=5π") {
      finalAmount = amount * 50;
    }

    return _origGainGold(finalAmount);
  };
}

// 執行完畢後強制更新一次介面
if (typeof updateUI === "function") updateUI();
