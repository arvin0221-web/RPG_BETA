// ================================
// Boss System (addon only)
// ================================

(function () {

  const BOSS_LEVELS = [10,20,30,50,100,200,500,1000,1500,2000,3000,9999];

  let originalPlayerAttack = window.playerAttack;
  let bossActive = false;

  // ===== 建立 Boss =====
  function createBoss(level) {
    let title = "試煉";
    if (level >= 50) title = "甦醒";
    if (level >= 200) title = "暴走";
    if (level >= 1000) title = "滅世";
    if (level >= 9999) title = "終焉";

    return {
      name: `深淵監視者（${title}）`,
      level: level,
      maxHp: level * level * 50,
      hp: level * level * 50,
      atk: level * 12,
      def: level * 5,
      expGain: level * 100,
      gold: level * 200,
      isBoss: true
    };
  }

  // ===== 顯示等級選擇 =====
  function openBossSelect() {
    if (window.__inBossBattle) return;

    let html = `<div style="margin-top:8px;">`;
    BOSS_LEVELS.forEach(lv => {
      html += `<button onclick="startBossBattle(${lv})" style="margin:4px;">Lv.${lv}</button>`;
    });
    html += `</div>`;

    document.getElementById("shop-panel").style.display = "block";
    document.getElementById("shop-panel").innerHTML = `
      <h3>Boss 挑戰</h3>
      ${html}
      <button onclick="closePanels()">關閉</button>
    `;
  }

  // ===== 開始 Boss 戰 =====
  window.startBossBattle = function (level) {
    closePanels();

    window.__inBossBattle = true;
    bossActive = true;

    // 回滿玩家
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    updatePlayerUI?.();

    // 建立 Boss
    window.monster = createBoss(level);

    // 顯示戰鬥畫面
    document.getElementById("battle").style.display = "block";
    document.getElementById("monster-name").textContent = monster.name;
    updateMonsterUI?.();

    // ===== 禁用寵物效果 =====
    window.playerAttack = function () {
      originalPlayerAttack.call(this);
    };
  };

  // ===== Boss 戰結束 =====
  const originalRewardBattle = window.rewardBattle;
  window.rewardBattle = function () {

    if (bossActive) {
      bossActive = false;
      window.__inBossBattle = false;

      // 恢復 playerAttack
      window.playerAttack = originalPlayerAttack;
    }

    originalRewardBattle.call(this);
  };

  // ===== 攔截一般遇怪 =====
  const btnStart = document.getElementById("btn-start");
  if (btnStart) {
    btnStart.addEventListener("click", function (e) {
      if (window.__inBossBattle) {
        e.stopImmediatePropagation();
        return;
      }
    }, true);
  }

  // ===== Boss 按鈕 =====
  const btnBoss = document.getElementById("btn-boss");
  if (btnBoss) {
    btnBoss.addEventListener("click", openBossSelect);
  }

})();
