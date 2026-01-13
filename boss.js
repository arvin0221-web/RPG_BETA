/*************************************************
 * BOSS.js - 製杖RPG BOSS挑戰系統
 *************************************************/

let boss = null;
let inBossBattle = false;

// BOSS 等級資料庫
const bossDB = {
  10:   { name: "狂暴石像", hp: 1000, atk: 50, gold: 100, exp: 50 },
  20:   { name: "火焰巨魔", hp: 3000, atk: 120, gold: 300, exp: 120 },
  30:   { name: "暗影巨狼", hp: 6000, atk: 250, gold: 600, exp: 250 },
  50:   { name: "冰霜魔龍", hp: 15000, atk: 600, gold: 1500, exp: 600 },
  100:  { name: "雷霆天神", hp: 50000, atk: 2000, gold: 5000, exp: 2000 },
  200:  { name: "地獄炎帝", hp: 120000, atk: 4500, gold: 12000, exp: 4500 },
  500:  { name: "混沌巨神", hp: 500000, atk: 15000, gold: 50000, exp: 15000 },
  1000: { name: "終焉魔王", hp: 2000000, atk: 50000, gold: 200000, exp: 50000 },
  1500: { name: "暗黑始祖", hp: 5000000, atk: 120000, gold: 500000, exp: 120000 },
  2000: { name: "永恆巨神", hp: 10000000, atk: 250000, gold: 1000000, exp: 250000 },
  3000: { name: "創世魔神", hp: 30000000, atk: 800000, gold: 3000000, exp: 800000 },
  9999: { name: "無限之王", hp: 99999999, atk: 999999, gold: 9999999, exp: 9999999 }
};

// 開啟 BOSS 選單
function openBossPanel() {
  if (inBattle) {
    showGlobalTip("⚠️ 正在遭遇怪物，無法挑戰 BOSS", 3000);
    return;
  }
  
  const panel = document.getElementById("boss-panel");
  panel.innerHTML = "<h3>選擇 BOSS 等級</h3>";
  
  Object.keys(bossDB).forEach(lv => {
    const b = bossDB[lv];
    const btn = document.createElement("button");
    btn.innerText = `${lv} - ${b.name}`;
    btn.onclick = () => startBossBattle(parseInt(lv));
    btn.style.margin = "4px";
    panel.appendChild(btn);
  });
  
  panel.style.display = "block";
}

// 開始 BOSS 戰
function startBossBattle(lv) {
  if (inBattle) {
    showGlobalTip("⚠️ 正在遭遇怪物，無法挑戰 BOSS", 3000);
    return;
  }
  if (inBossBattle) {
    showGlobalTip("⚠️ BOSS 戰已進行中", 3000);
    return;
  }

  const b = bossDB[lv];
  if (!b) return;

  // 初始化 BOSS
  boss = {
    name: b.name,
    lv: lv,
    maxHp: b.hp,
    hp: b.hp,
    atk: b.atk,
    gold: b.gold,
    expGain: b.exp
  };

  // 玩家滿血滿MP
  const stats = calcStats();
  player.hp = stats.maxhp;
  player.mp = stats.maxmp;

  document.getElementById("monster-img").src = ""; // BOSS 可設自訂圖
  document.getElementById("battle").style.display = "block";
  document.getElementById("battle-log").innerHTML = "";
  logBattle(`⚔️ 挑戰 BOSS：${boss.name} Lv.${boss.lv}`);
  inBossBattle = true;

  updateBossUI();
}

// 更新 BOSS UI
function updateBossUI() {
  if (!boss) return;

  document.getElementById("monster-name").innerText = `${boss.name} Lv.${boss.lv}`;
  document.getElementById("monster-hp").innerText = `HP ${boss.hp}/${boss.maxHp}`;
  updateUI();
}

// 玩家攻擊 BOSS
function playerAttackBoss(mult = 1, bonusDmg = 0) {
  if (!inBossBattle) return;
  if (!boss) return;

  const s = calcStats();
  let dmg = Math.floor(s.atk * mult) + bonusDmg;
  let isCrit = Math.random() < s.crit;
  if (isCrit) dmg = Math.floor(dmg * s.critDmg);

  boss.hp -= dmg;
  boss.hp = Math.max(0, boss.hp);

  logBattle(`⚔️ 對 BOSS ${boss.name} 造成 ${dmg}${isCrit ? " 💥 爆擊！" : ""} 傷害`);

  if (boss.hp <= 0) {
    winBossBattle();
  } else {
    bossAttack();
  }

  updateBossUI();
}

// BOSS 攻擊玩家
function bossAttack() {
  player.hp -= boss.atk;
  if (player.hp < 0) player.hp = 0;
  logBattle(`😈 BOSS ${boss.name} 攻擊你，造成 ${boss.atk} 傷害`);

  if (player.hp <= 0) {
    playerDeathBoss();
  }
}

// 玩家死亡（BOSS戰）
function playerDeathBoss() {
  logBattle("💀 玩家在 BOSS 戰中死亡");
  showGlobalTip("玩家死亡！BOSS戰結束", 5000);
  inBossBattle = false;
  boss = null;

  const stats = calcStats();
  player.hp = stats.maxhp;
  player.mp = stats.maxmp;
  updateUI();
}

// 玩家勝利 BOSS
function winBossBattle() {
  logBattle(`🏆 勝利！擊敗 BOSS ${boss.name}`);
  player.gold += boss.gold;
  player.exp += boss.expGain;
  showGlobalTip(`🏆 勝利！獲得 ${boss.gold} 金幣，${boss.expGain} EXP`, 4000);

  inBossBattle = false;
  boss = null;

  // 玩家升級判定
  while (player.exp >= needExp()) {
    player.exp -= needExp();
    player.lv++;
    logBattle(`⬆️ 升級！Lv.${player.lv}`);
  }

  updateUI();
}
