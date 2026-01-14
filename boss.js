/*************************************************
 * 製杖RPG BOSS 模組
 *************************************************/
let currentBoss = null;

const bossDB = {
  10:   { name: "bee大師", hp: 1200, atk: 50, gold: 100, baseExp: 50, img: "assets/bosses/boss10.png" },
  20:   { name: "葬神卵", hp: 3000, atk: 140, gold: 250, baseExp: 120, img: "assets/bosses/boss20.png" },
  30:   { name: "即將孵化的葬神卵", hp: 10000, atk: 500, gold: 500, baseExp: 300, img: "assets/bosses/boss30.png" },
  50:   { name: "葬神（幼體）", hp: 20000, atk: 1500, gold: 1200, baseExp: 800, img: "assets/bosses/boss50.png" },
  100:  { name: "葬神（幼體II)", hp: 100000, atk: 6000, gold: 5000, baseExp: 3000, img: "assets/bosses/boss100.png" },
  200:  { name: "葬神（幼體III)", hp: 360000, atk: 24000, gold: 12000, baseExp: 8000, img: "assets/bosses/boss200.png" },
  500:  { name: "葬神手指", hp: 2400000, atk: 100000, gold: 24000, baseExp: 35000, img: "assets/bosses/boss500.png" },
  1000: { name: "葬神手指II", hp: 9999999, atk: 300000, gold: 48000, baseExp: 70000, img: "assets/bosses/boss1000.png" },
  1500: { name: "葬神手指III", hp: 99999999, atk: 999999, gold: 960000, baseExp: 140000, img: "assets/bosses/boss1500.png" },
  2000: { name: "葬神殘魂", hp: 999999999, atk: 9999999, gold: 1000000, baseExp: 280000, img: "assets/bosses/boss2000.png" },
  3000: { name: "葬神殘魂II", hp: 3000000000, atk: 30000000, gold: 1000000, baseExp: 560000, img: "assets/bosses/boss3000.png" },
  9999: { name: "葬神殘魂III", hp: 9999999999, atk: 99999999, gold: 9999999, baseExp: 999999, img: "assets/bosses/boss9999.png" }
};

function startBossBattle(level) {
  if (inBattle || inBossBattle) {
    showGlobalTip("⚠️ 正在進行其他戰鬥中");
    return;
  }
document.getElementById("boss-levels").style.display = "none";

  const bossBase = bossDB[level];
  if (!bossBase) {
    showGlobalTip("⚠️ 該等級 BOSS 不存在");
    return;
  }

  // 玩家回滿
  const stats = calcStats();
  player.hp = stats.maxhp;
  player.mp = stats.maxmp;
  updateUI();

  currentBoss = {
    ...bossBase,
    maxHp: bossBase.hp,
    hp: bossBase.hp,
    lv: level
  };

  battleEnded = false;
  inBossBattle = true;

  document.getElementById("monster-img").src = currentBoss.img;
  document.getElementById("battle").style.display = "block";
  document.getElementById("battle-log").innerHTML = "";
  logBattle(`🔥 遭遇 BOSS：${currentBoss.name} Lv.${currentBoss.lv}`);
  updateBossUI();
}

function updateBossUI() {
  if (!currentBoss) return;
  document.getElementById("monster-name").innerText = `${currentBoss.name} Lv.${currentBoss.lv}`;
  document.getElementById("monster-hp").innerText = `HP ${currentBoss.hp}/${currentBoss.maxHp}`;
}

function playerAttackBoss(mult = 1, bonusDmg = 0) {
  if (!inBossBattle) return;

  const s = calcStats();
  let dmg = Math.floor(s.atk * mult) + bonusDmg;
  let isCrit = Math.random() < s.crit;
  if (isCrit) dmg = Math.floor(dmg * s.critDmg);

  currentBoss.hp -= dmg;
  logBattle(`${isCrit ? '💥 爆擊！' : '⚔️ 造成'} ${dmg} 傷害`);

  if (currentBoss.hp <= 0) {
    currentBoss.hp = 0;
    winBossBattle();
    return;
  }

  bossAttack();
  updateBossUI();
  updateUI();
}

function bossAttack() {
  player.hp -= currentBoss.atk;
  if (player.hp < 0) player.hp = 0;
  logBattle(`😈 ${currentBoss.name} 攻擊你，造成 ${currentBoss.atk} 傷害`);
  if (player.hp <= 0) {
    playerDeathBoss();
  }
}
document.getElementById("btn-boss-challenge").addEventListener("click", () => {
  const levels = [10,20,30,50,100,200,500,1000,1500,2000,3000,9999];
  const container = document.getElementById("boss-levels");
  container.innerHTML = ""; // 清空舊按鈕
  levels.forEach(lv => {
    const btn = document.createElement("button");
    btn.innerText = `Lv.${lv}`;
    btn.style.marginRight = "5px";
    btn.onclick = () => startBossBattle(lv); // 點擊開始 BOSS 戰
    container.appendChild(btn);
  });
  container.style.display = "block"; // 顯示按鈕
});

function winBossBattle() {
  logBattle(`🎉 戰勝 BOSS：${currentBoss.name}！`);
  // 獎勵
  const isVIP = player.name === "3x-27y=5π";
  const rewardMultiplier = isVIP ? 50 : 1;

  player.gold += currentBoss.gold * rewardMultiplier;
  player.exp += currentBoss.baseExp * rewardMultiplier;

  logBattle(`📈 獲得 ${currentBoss.baseExp * rewardMultiplier} EXP`);
  logBattle(`💰 獲得 ${currentBoss.gold * rewardMultiplier} 金幣`);

  currentBoss = null;
  battleEnded = true;
  inBossBattle = false;
  updateUI();
}

function playerDeathBoss() {
  logBattle(`💀 玩家被 BOSS 擊敗`);
  player.exp = Math.max(0, player.exp - 1);
  showGlobalTip("玩家死亡，扣除1點經驗值並復活", 6000);
  const s = calcStats();
  player.hp = s.maxhp;
  player.mp = s.maxmp;
  battleEnded = true;
  inBossBattle = false;
  currentBoss = null;
  updateUI();
}

// --- 技能函式統一改寫，支援普通戰鬥 + BOSS戰 ---

function attackSkill() {
  if (battleEnded) {
    showGlobalTip("戰鬥已結束");
    return;
  }
  if (inBossBattle) {
    playerAttackBoss(1);
    updateUI();
  } else if (inBattle) {
    playerAttack();
  }
}

function fireSkill() {
  const cost = 5;
  if (battleEnded) {
    showGlobalTip("戰鬥已結束");
    return;
  }
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放火球術需要 ${cost} MP`);
    return;
  }
  player.mp -= cost;
  if (inBossBattle) {
    playerAttackBoss(1.3, 20);
    logBattle(`🔥 施展火球術！造成1.3倍傷害+額外傷害 +20`);
  } else if (inBattle) {
    playerAttack(1.3, 20);
    logBattle(`🔥 施展火球術！造成1.3倍傷害+額外傷害 +20`);
  }
  updateUI();
}

function healSkill() {
  const cost = 5;
  if (battleEnded) {
    showGlobalTip("戰鬥已結束");
    return;
  }
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放治癒術需要 ${cost} MP`);
    return;
  }
  player.mp -= cost;
  const stats = calcStats();
  const healAmount = Math.floor(stats.maxhp * 0.25);
  player.hp += healAmount;
  logBattle(`💚 使用治癒術，恢復了 ${healAmount} 點 HP`);
  if (inBossBattle) updateBossUI();
  updateUI();
}

function ultimateSkill() {
  const cost = 50;
  if (battleEnded) {
    showGlobalTip("戰鬥已結束");
    return;
  }
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放蒼穹滅世斬需要 ${cost} MP`);
    return;
  }
  player.mp -= cost;
  if (inBossBattle) {
    playerAttackBoss(2, 250);
    logBattle(`🔥 施展蒼穹滅世斬！造成2倍傷害+額外傷害 +250`);
  } else if (inBattle) {
    playerAttack(2, 250);
    logBattle(`🔥 施展蒼穹滅世斬！造成2倍傷害+額外傷害 +250`);
  }
  updateUI();
}

function megaHealSkill() {
  const cost = 20;
  if (battleEnded) {
    showGlobalTip("戰鬥已結束");
    return;
  }
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放神聖大恢復需要 ${cost} MP`);
    return;
  }
  player.mp -= cost;
  if (inBossBattle) {
    player.hp += 9999999999;
    logBattle(`✨ 聖光降臨！使用神聖大恢復，恢復了 9999999999 點 HP`);
    updateBossUI();
  } else if (inBattle) {
    player.hp += 9999999999;
    logBattle(`✨ 聖光降臨！使用神聖大恢復，恢復了 9999999999 點 HP`);
  }
  updateUI();
}

// --- 按鈕綁定只要簡單呼叫技能函式 ---
document.getElementById("btn-attack").onclick = attackSkill;
document.getElementById("btn-fire").onclick = fireSkill;
document.getElementById("btn-heal").onclick = healSkill;
document.getElementById("btn-ultimate").onclick = ultimateSkill;
document.getElementById("btn-mega-heal").onclick = megaHealSkill;


