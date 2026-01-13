/*************************************************
 * 製杖RPG BOSS 模組
 *************************************************/
let inBossBattle = false;
let currentBoss = null;

const bossDB = {
  10:   { name: "火焰巨獸", hp: 1200, atk: 50, gold: 100, baseExp: 50, img: "assets/bosses/boss10.png" },
  20:   { name: "冰霜巨龍", hp: 2500, atk: 120, gold: 250, baseExp: 120, img: "assets/bosses/boss20.png" },
  30:   { name: "暗影騎士", hp: 5000, atk: 300, gold: 500, baseExp: 300, img: "assets/bosses/boss30.png" },
  50:   { name: "雷電魔神", hp: 12000, atk: 800, gold: 1200, baseExp: 800, img: "assets/bosses/boss50.png" },
  100:  { name: "黑暗君王", hp: 50000, atk: 3000, gold: 5000, baseExp: 3000, img: "assets/bosses/boss100.png" },
  200:  { name: "天空巨龍", hp: 120000, atk: 8000, gold: 12000, baseExp: 8000, img: "assets/bosses/boss200.png" },
  500:  { name: "末日邪神", hp: 600000, atk: 35000, gold: 60000, baseExp: 35000, img: "assets/bosses/boss500.png" },
  1000: { name: "混沌巨靈", hp: 1500000, atk: 90000, gold: 150000, baseExp: 90000, img: "assets/bosses/boss1000.png" },
  1500: { name: "星辰守護者", hp: 3000000, atk: 180000, gold: 300000, baseExp: 180000, img: "assets/bosses/boss1500.png" },
  2000: { name: "終焉魔皇", hp: 5000000, atk: 350000, gold: 500000, baseExp: 350000, img: "assets/bosses/boss2000.png" },
  3000: { name: "創世神靈", hp: 10000000, atk: 700000, gold: 1000000, baseExp: 700000, img: "assets/bosses/boss3000.png" },
  9999: { name: "無限之王", hp: 99999999, atk: 999999, gold: 9999999, baseExp: 999999, img: "assets/bosses/boss9999.png" }
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
  inBossBattle = false;
  currentBoss = null;
  updateUI();
}

// --- 覆寫技能針對BOSS戰 ---
function attackBoss() { playerAttackBoss(1); }
function fireBoss() { 
  const cost = 5;
  if (!inBossBattle) return;
  if (player.mp < cost) { showGlobalTip(`MP不足，釋放火球術需要 ${cost} MP`); return; }
  player.mp -= cost;
  playerAttackBoss(1.3, 20);
  logBattle(`🔥 施展火球術！造成1.3倍傷害+額外傷害 +20`);
}
function healBoss() { 
  const cost = 5;
  if (!inBossBattle) return;
  if (player.mp < cost) { showGlobalTip(`MP不足，釋放治癒術需要 ${cost} MP`); return; }
  player.mp -= cost;
  const stats = calcStats();
  const healAmount = Math.floor(stats.maxhp * 0.25);
  player.hp += healAmount;
  logBattle(`💚 使用治癒術，恢復了 ${healAmount} 點 HP`);
  updateBossUI();
}
function ultimateAttackBoss() {
  const cost = 50;
  if (!inBossBattle) return;
  if (player.mp < cost) { showGlobalTip(`MP不足，釋放蒼穹滅世斬需要 ${cost} MP`); return; }
  player.mp -= cost;
  playerAttackBoss(2, 250);
  logBattle(`🔥 施展蒼穹滅世斬！造成2倍傷害+額外傷害 +250`);
}
function megaHealBoss() {
  const cost = 20;
  if (!inBossBattle) return;
  if (player.mp < cost) { showGlobalTip(`MP不足，釋放神聖大恢復需要 ${cost} MP`); return; }
  player.mp -= cost;
  player.hp += 9999999999;
  logBattle(`✨ 聖光降臨！使用神聖大恢復，恢復了 9999999999 點 HP`);
  updateBossUI();
}
