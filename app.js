/*************************************************
 * 製杖RPG v1.0 Base Version
 * 規則：不刪功能，只加功能
 *************************************************/
function checkMaxMpLimit() {
  if (player.maxmp > 200) {
    player.maxmp = 200;
    if (player.mp > player.maxmp) player.mp = player.maxmp;
  }
}

/***********************
 * 全域常數與工具
 ***********************/
const rarityMul = {
  普通: 1,
  稀有: 1.5,
  史詩: 2,
  傳說: 3
};

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}


/***********************
 * 玩家資料（核心）
 ***********************/
let player = {
  name: prompt("請輸入你的角色名字："),
  lv: 1,
  exp: 0,
  gold: 0,

  base: {
    atk: 12,
    hp: 120,
    mp: 30,
    crit: 0.01,      // 1%
    critDmg: 1.2     // 120%
  },
  
 hp: 120,
 mp: 30,

  weapon: null,     // 當前裝備
  weapons: []       // 擁有的杖
};
// 🔥 關鍵：強制暴露給其他 JS
window.player = player;

/***********************
 * 杖資料庫（固定）
 ***********************/
const wandDB = [
  { name: "木杖", lv: 1, baseAtk: 2, baseHp: 15, baseMp: 5, baseCrit: 0.02, baseCritDmg: 0.05, price: 100 },
  { name: "外掛木杖", lv: 1, baseAtk: 1400, baseHp: 999999, baseMp: 22, baseCrit: 0.33, baseCritDmg: 1.00, price: 999999 },
  { name: "鐵杖", lv: 5, baseAtk: 6, baseHp: 30, baseMp: 6, baseCrit: 0.04, baseCritDmg: 0.11, price: 500 },
  { name: "朽木杖", lv: 10, baseAtk: 12, baseHp: 60, baseMp: 7, baseCrit: 0.06, baseCritDmg: 0.17, price: 1200 },
  { name: "上古木杖", lv: 17, baseAtk: 50, baseHp: 240, baseMp: 8, baseCrit: 0.09, baseCritDmg: 0.23, price: 2600 },
  { name: "神木杖", lv: 24, baseAtk: 180, baseHp: 720, baseMp: 9, baseCrit: 0.12, baseCritDmg: 0.29, price: 6000 },
  { name: "天金法杖", lv: 31 , baseAtk: 560, baseHp: 2400, baseMp: 10, baseCrit: 0.15, baseCritDmg: 0.35, price: 14000 },
  { name: "人皇之權杖", lv: 38, baseAtk: 1760, baseHp: 7200, baseMp: 11, baseCrit: 0.21, baseCritDmg: 0.41, price: 30000 },
  { name: "神之權杖", lv: 45, baseAtk: 3600, baseHp: 14400, baseMp: 12, baseCrit: 0.25, baseCritDmg: 0.48, price: 100000 },
  { name: "神王之權杖", lv: 52, baseAtk: 7200, baseHp: 28800, baseMp: 13, baseCrit: 0.30, baseCritDmg: 0.56, price: 300000 },
  { name: "至高權杖", lv: 59, baseAtk: 14400, baseHp: 50000, baseMp: 14, baseCrit: 0.30, baseCritDmg: 0.74, price: 900000 },
  { name: "無極法杖", lv: 66, baseAtk: 28800, baseHp: 100000, baseMp: 15, baseCrit: 0.30, baseCritDmg: 0.90, price: 3600000 },
  { name: "葬神之法杖", lv: 73, baseAtk: 50000, baseHp: 150000, baseMp: 16, baseCrit: 0.30, baseCritDmg: 1.00, price: 15000000 },
  { name: "歸真木杖", lv: 80, baseAtk: 100000, baseHp: 200000, baseMp: 17, baseCrit: 0.33, baseCritDmg: 2.00, price: 50000000 },
  { name: "星辰法杖", lv: 90, baseAtk: 150000, baseHp: 250000, baseMp: 18, baseCrit: 0.33, baseCritDmg: 2.50, price: 300000000 },
  { name: "創世神杖", lv: 115, baseAtk: 200000, baseHp: 350000, baseMp: 19, baseCrit: 0.33, baseCritDmg: 3.00, price: 1800000000 },
  { name: "永恆之杖", lv: 135, baseAtk: 250000, baseHp: 450000, baseMp: 20, baseCrit: 0.33, baseCritDmg: 3.50, price: 9000000000 },
  { name: "混沌之杖", lv: 160, baseAtk: 350000, baseHp: 600000, baseMp: 21, baseCrit: 0.33, baseCritDmg: 4.00, price: 18000000000 },
  { name: "極•歸真木杖", lv: 200, baseAtk: 350000, baseHp: 600000, baseMp: 22, baseCrit: 0.33, baseCritDmg: 6.00, price: 90000000000 },
  { name: "血•歸真木杖", lv: 500, baseAtk: 350000, baseHp: 1800000, baseMp: 22, baseCrit: 0.33, baseCritDmg: 6.00, price: 900000000000 },
  { name: "攻•歸真木杖", lv: 500, baseAtk: 700000, baseHp: 600000, baseMp: 22, baseCrit: 0.33, baseCritDmg: 6.00, price: 900000000000 },
  { name: "脆弱的銳利木杖", lv: 1500, baseAtk: 1400000, baseHp: 6000, baseMp: 22, baseCrit: 0.33, baseCritDmg: 6.00, price: 9870000000000 },
  { name: "堅固的扁平木杖", lv: 1500, baseAtk: 150000, baseHp: 6000000, baseMp: 22, baseCrit: 0.33, baseCritDmg: 6.00, price: 9870000000000 },
  { name: "至臻無上法杖", lv: 3000, baseAtk: 999999, baseHp: 9999999, baseMp: 22, baseCrit: 0.33, baseCritDmg: 9.00, price: 98765432100000 },
  
];


/***********************
 * 怪物資料
 ***********************/
const monsterPool_0_20 = [
  { name: "史萊姆", hp: 40, atk: 5, gold: 12, baseExp: 15, img: "assets/monsters/slime.png" },
  { name: "狂暴史萊姆", hp: 30, atk: 9, gold: 17, baseExp: 20, img: "assets/monsters/slime.png" },
  { name: "石甲龜", hp: 90, atk: 4, gold: 22, baseExp: 25, img: "assets/monsters/turtle.png" },
  { name: "火焰精靈", hp: 58, atk: 9, gold: 24, baseExp: 30, img: "assets/monsters/fire.png" },
  { name: "暗影騎士", hp: 125, atk: 14, gold: 42, baseExp: 50, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 1, atk: 1, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_20_40 = [
  { name: "闇•史萊姆", hp: 90, atk: 12, gold: 18, baseExp: 20, img: "assets/monsters/slime.png" },
  { name: "闇•狂暴史萊姆", hp: 68, atk: 21, gold: 25, baseExp: 26, img: "assets/monsters/slime.png" },
  { name: "闇•石甲龜", hp: 203, atk: 9, gold: 33, baseExp: 33, img: "assets/monsters/turtle.png" },
  { name: "闇•火焰精靈", hp: 135, atk: 22.5, gold: 36, baseExp: 40, img: "assets/monsters/fire.png" },
  { name: "闇•暗影騎士", hp: 293, atk: 33, gold: 63, baseExp: 63, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 1, atk: 1, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_40_60 = [
  { name: "黑金史萊姆", hp: 180, atk: 24, gold: 27, baseExp: 27, img: "assets/monsters/slime.png" },
  { name: "狂暴黑金史萊姆", hp: 134, atk: 42, gold: 37, baseExp: 34, img: "assets/monsters/slime.png" },
  { name: "黑曜甲龜", hp: 410, atk: 18, gold: 49, baseExp: 44, img: "assets/monsters/turtle.png" },
  { name: "爆炎精靈", hp: 270, atk: 46, gold: 54, baseExp: 53, img: "assets/monsters/fire.png" },
  { name: "暗影君主", hp: 600, atk: 66, gold: 95, baseExp: 84, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 2, atk: 2, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_60_80 = [
  { name: "闇•黑金史萊姆", hp: 405, atk: 54, gold: 40, baseExp: 36, img: "assets/monsters/slime.png" },
  { name: "闇•狂暴黑金史萊姆", hp: 300, atk: 96, gold: 56, baseExp: 45, img: "assets/monsters/slime.png" },
  { name: "闇•黑曜甲龜", hp: 900, atk: 45, gold: 75, baseExp: 59, img: "assets/monsters/turtle.png" },
  { name: "闇•爆炎精靈", hp: 630, atk: 105, gold: 81, baseExp: 70, img: "assets/monsters/fire.png" },
  { name: "闇•暗影君主", hp: 1350, atk: 150, gold: 150, baseExp: 110, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 3, atk: 3, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];


const monsterPool_80_100 = [
  { name: "黑金骷髏戰士", hp: 1080, atk: 144, gold: 80, baseExp: 48, img: "assets/monsters/slime.png" },
  { name: "黑金骷髏狂戰士", hp: 800, atk: 256, gold: 112, baseExp: 60, img: "assets/monsters/slime.png" },
  { name: "上古黑曜甲龜", hp: 2400, atk: 120, gold: 150, baseExp: 80, img: "assets/monsters/turtle.png" },
  { name: "上古爆炎精靈", hp: 1680, atk: 280, gold: 162, baseExp: 95, img: "assets/monsters/fire.png" },
  { name: "暗影始祖", hp: 3600, atk: 400, gold: 300, baseExp: 145, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 4, atk: 4, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_100_120 = [
  { name: "極•黑金骷髏戰士", hp: 2160, atk: 288, gold: 160, baseExp: 60, img: "assets/monsters/slime.png" },
  { name: "極•黑金骷髏狂戰士", hp: 1600, atk: 512, gold: 224, baseExp: 85, img: "assets/monsters/slime.png" },
  { name: "極•上古黑曜甲龜", hp: 4800, atk: 240, gold: 300, baseExp: 110, img: "assets/monsters/turtle.png" },
  { name: "極•上古爆炎精靈", hp: 3360, atk: 560, gold: 324, baseExp: 130, img: "assets/monsters/fire.png" },
  { name: "極•暗影始祖", hp: 7200, atk: 800, gold: 600, baseExp: 185, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 4, atk: 4, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_120_140 = [
  { name: "偽•聖光鐵騎", hp: 4800, atk: 800, gold: 400, baseExp: 80, img: "assets/monsters/slime.png" },
  { name: "偽•聖光狂鐵騎", hp: 4000, atk: 1200, gold: 500, baseExp: 110, img: "assets/monsters/slime.png" },
  { name: "偽•聖光盾龜", hp: 10000, atk: 600, gold: 700, baseExp: 140, img: "assets/monsters/turtle.png" },
  { name: "偽•聖火精靈", hp: 7200, atk: 1600, gold: 800, baseExp: 165, img: "assets/monsters/fire.png" },
  { name: "偽•聖潔戰靈", hp: 15200, atk: 2000, gold: 1000, baseExp: 220, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 4, atk: 4, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_140_160 = [
  { name: "聖光鐵騎", hp: 9600, atk: 1600, gold: 800, baseExp: 100, img: "assets/monsters/slime.png" },
  { name: "聖光狂鐵騎", hp: 8000, atk: 2400, gold: 1000, baseExp: 140, img: "assets/monsters/slime.png" },
  { name: "聖光盾龜", hp: 20000, atk: 1200, gold: 1400, baseExp: 170, img: "assets/monsters/turtle.png" },
  { name: "聖火精靈", hp: 14400, atk: 2400, gold: 1600, baseExp: 195, img: "assets/monsters/fire.png" },
  { name: "聖潔戰靈", hp: 30400, atk: 4000, gold: 2000, baseExp: 250, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 4, atk: 4, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_160_200 = [
  { name: "上古聖光鐵騎", hp: 19200, atk: 3200, gold: 1600, baseExp: 120, img: "assets/monsters/slime.png" },
  { name: "上古聖光狂鐵騎", hp: 16000, atk: 4800, gold: 2000, baseExp: 160, img: "assets/monsters/slime.png" },
  { name: "上古聖光盾龜", hp: 40000, atk: 2400, gold: 2800, baseExp: 190, img: "assets/monsters/turtle.png" },
  { name: "上古聖火精靈", hp: 28000, atk: 4800, gold: 3200, baseExp: 215, img: "assets/monsters/fire.png" },
  { name: "上古聖潔戰靈", hp: 60000, atk: 8000, gold: 4000, baseExp: 270, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 4, atk: 4, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
];

const monsterPool_200_plus = [
  { name: "白銀寶箱怪", hp: 96000, atk: 1, gold: 4500, baseExp: 200, img: "assets/monsters/slime.png" },
  { name: "上古聖光鐵騎II", hp: 96000, atk: 1600, gold: 3200, baseExp: 140, img: "assets/monsters/slime.png" },
  { name: "上古聖光狂鐵騎II", hp: 80000, atk: 2400, gold: 4000, baseExp: 180, img: "assets/monsters/slime.png" },
  { name: "上古聖光盾龜II", hp: 200000, atk: 1200, gold: 5600, baseExp: 220, img: "assets/monsters/turtle.png" },
  { name: "上古聖火精靈II", hp: 140000, atk: 2400, gold: 6400, baseExp: 250, img: "assets/monsters/fire.png" },
  { name: "上古聖潔戰靈II", hp: 300000, atk: 4000, gold: 8000, baseExp: 305, img: "assets/monsters/knight.png" },
  { name: "偽•葬神", hp: 2400000, atk: 2000, gold: 12000, baseExp: 0, img: "assets/monsters/sugarbee.png" }
];
const monsterPool_3000_plus = [
  { name: "黃金寶箱怪", hp: 126000, atk: 1, gold: 5500, baseExp: 220, img: "assets/monsters/slime.png" },
  { name: "上古聖光鐵騎III", hp: 126000, atk: 1600, gold: 4200, baseExp: 160, img: "assets/monsters/slime.png" },
  { name: "上古聖光狂鐵騎III", hp: 110000, atk: 2400, gold: 5000, baseExp: 200, img: "assets/monsters/slime.png" },
  { name: "上古聖光盾龜III", hp: 260000, atk: 1200, gold: 6600, baseExp: 240, img: "assets/monsters/turtle.png" },
  { name: "上古聖火精靈III", hp: 170000, atk: 2400, gold: 7400, baseExp: 270, img: "assets/monsters/fire.png" },
  { name: "上古聖潔戰靈III", hp: 360000, atk: 4000, gold: 9000, baseExp: 325, img: "assets/monsters/knight.png" },
  { name: "偽•葬神II", hp: 9600000, atk: 2000, gold: 14000, baseExp: 0, img: "assets/monsters/sugarbee.png" }
];

let monster = null;
let inBattle = false;
let inBossBattle = false;
let battleEnded = false;

function getMonsterPoolByPlayerLv(lv) {
  if (lv < 20)  return monsterPool_0_20;
  if (lv < 40)  return monsterPool_20_40;
  if (lv < 60)  return monsterPool_40_60;
  if (lv < 80)  return monsterPool_60_80;
  if (lv < 100) return monsterPool_80_100;
  if (lv < 120) return monsterPool_100_120;
  if (lv < 140) return monsterPool_120_140;
  if (lv < 160) return monsterPool_140_160;
  if (lv < 200) return monsterPool_160_200;
  if (lv < 3000) return monsterPool_200_plus;
  return monsterPool_3000_plus;
}



/***********************
 * 成長計算 (局部更改區)
 ***********************/
function needExp() {
  return Math.floor(50 * Math.pow(player.lv, 1.6));
}

function calcStats() {
  const lvl = player.lv;
  // 以下為強制注入的公式
  let atk = Math.floor(player.base.atk * (1 + 0.15 * (lvl - 1)));
  let maxhp = Math.floor(player.base.hp * (1 + 0.15 * (lvl - 1)));
  let maxmp = Math.floor(player.base.mp * (1 + 0.02 * (lvl - 1)));
  
  let crit = player.base.crit;
  let critDmg = player.base.critDmg;

  if (player.weapon) {
    const m = rarityMul[player.weapon.rarity];
    atk += player.weapon.atk * m;
    maxhp += player.weapon.hp * m;
    maxmp += player.weapon.mp * m;
    crit += player.weapon.crit * m;
    critDmg += player.weapon.critDmg * m;
  }

  return {
    atk: Math.floor(atk),
    maxhp: Math.floor(maxhp),
    maxmp: Math.floor(maxmp),
    crit,
    critDmg
  };
}


/***********************
 * UI 更新
 ***********************/
function updateUI() {
  const s = calcStats();

  player.hp = clamp(player.hp, 0, s.maxhp);
  player.mp = clamp(player.mp, 0, s.maxmp);
  checkMaxMpLimit();
  document.getElementById("player-name").innerText =
    `${player.name} Lv.${player.lv} EXP ${player.exp}/${needExp()} 金幣 ${player.gold}`;

  document.getElementById("player-stats").innerText =
    `ATK ${s.atk}
HP ${player.hp}/${s.maxhp}
MP ${player.mp}/${s.maxmp}
爆擊率 ${(s.crit * 100).toFixed(1)}%
爆擊傷害 ${(s.critDmg * 100).toFixed(0)}%`;

  if (player.weapon) {
    document.getElementById("player-weapon-img").src = player.weapon.img;
  }

  if (monster) {
    document.getElementById("monster-name").innerText =
      `${monster.name} Lv.${monster.lv}`;
    document.getElementById("monster-hp").innerText =
      `HP ${monster.hp}/${monster.maxHp}`;
  }
}

function logBattle(text) {
  const log = document.getElementById("battle-log");
  log.innerHTML += text + "<br>";
  log.scrollTop = log.scrollHeight;
}

function showGlobalTip(text, ms = 2000) {
  const tip = document.getElementById("global-tip");
  tip.innerText = text;
  tip.style.display = "block";
  setTimeout(() => tip.style.display = "none", ms);
}


/***********************
 * 戰鬥系統（原始簡單版）
 ***********************/
function startBattle() {
   if (inBossBattle) {
    showGlobalTip("⚠️ 正在挑戰 BOSS，無法遇怪");
    return;
   }
  if (inBattle) {
    showGlobalTip("對戰進行中");
    return;
  }
  
  const pool = getMonsterPoolByPlayerLv(player.lv);
  const base = rand(pool);

  const lv = rand([player.lv, player.lv + 1, player.lv + 2, player.lv + 3]);
  monster = {
    name: base.name,
    lv: lv,
    maxHp: Math.floor(base.hp * (1 + lv * 0.40)),
    hp: 0,
    atk: Math.floor(base.atk * (1 + lv * 0.35)),
    gold: Math.floor(base.gold * (1 + lv * 0.3)),
    expGain: Math.floor(base.baseExp * (1 + lv * 0.2)),
    img: base.img
  };
  monster.hp = monster.maxHp;
  document.getElementById("monster-img").src = monster.img;
  document.getElementById("battle").style.display = "block";
  document.getElementById("battle-log").innerHTML = "";
  logBattle(`⚔️ 遭遇 ${monster.name} Lv.${monster.lv}`);
  battleEnded = false;
  inBattle = true;
  updateUI();
}

function playerAttack(mult = 1, bonusDmg = 0) {
  if (!inBattle) return;
  const s = calcStats();
  let dmg = Math.floor(s.atk * mult) + bonusDmg;
  let isCrit = Math.random() < s.crit;
  if (isCrit) {
    dmg = Math.floor(dmg * s.critDmg);
    logBattle(`💥 爆擊！造成 ${dmg} 傷害`);
  } else {
    logBattle(`⚔️ 造成 ${dmg} 傷害`);
  }
  monster.hp -= dmg;
  if (monster.hp <= 0) {
    monster.hp = 0;
    winBattle();
    return;
  }
  enemyAttack();
  updateUI();
}

function enemyAttack() {
  player.hp -= monster.atk;
  if (player.hp < 0) player.hp = 0;
  logBattle(`😈 ${monster.name} 攻擊你，造成 ${monster.atk} 傷害`);
  if (player.hp <= 0) {
    playerDeath();
  }
}

function winBattle() {
  if (monster && monster.name === "糖bee") {
    logBattle("🩸 糖bee 被你一擊碾成肉醬");
  } else {
    logBattle("🎉 勝利！");
  }
  rewardBattle();
  inBattle = false;
  monster = null;
}

function playerDeath() {
  logBattle("💀 玩家已死亡");
  player.exp = Math.max(0, player.exp - 100);
  showGlobalTip("玩家已死亡，扣除100點經驗值並復活", 6000);
  const s = calcStats();
  player.hp = s.maxhp;
  player.mp = s.maxmp;
  inBattle = false;
}

/***********************
 * 技能
 ***********************/
function attack() {
  playerAttack(1);
}

// --- 修正後的火球術 ---
function fire() {
  const cost = 5;
  if (!inBattle) return;
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放火球術需要 ${cost} MP`, 2000);
    return;
  }
  player.mp -= cost;
  // 傷害 = 普攻傷害 + 20
  playerAttack(1.3, 20);
  logBattle(`🔥 施展火球術！造成1.3倍傷害+額外傷害 +20`);
}

// --- 修正後的治癒術 ---
function heal() {
  const cost = 5;
  if (!inBattle) return;
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放治癒術需要 ${cost} MP`, 2000);
    return;
  }
  player.mp -= cost;
  
  const stats = calcStats();                // 取得最大 HP
  const healAmount = Math.floor(stats.maxhp * 0.25); // 25%

  player.hp += healAmount;

  logBattle(`💚 使用治癒術，恢復了 ${healAmount} 點 HP`);
  updateUI();
}

// --- 新技能 1：蒼穹滅世斬 (強大攻擊) ---
function ultimateAttack() {
  const cost = 50;
  if (!inBattle) return;
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放蒼穹滅世斬需要 ${cost} MP`, 2000);
    return;
  }
  player.mp -= cost;
  // 傷害 = 普攻傷害 + 250
  playerAttack(2, 250);
  logBattle(`🔥 施展蒼穹滅世斬！造成2倍傷害+額外傷害 +250`);
}

// --- 新技能 2：神聖大恢復 (強力治療) ---
function megaHeal() {
  const cost = 20;
  if (!inBattle) return;
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放神聖大恢復需要 ${cost} MP`, 2000);
    return;
  }
  player.mp -= cost;
  player.hp += 9999999999;
  logBattle(`✨ 聖光降臨！使用神聖大恢復，恢復了 9999999999 點 HP`);
  updateUI();
}



/***********************
 * 獎勵系統 (局部更改區)
 ***********************/
function rewardBattle() {
  const s = calcStats();

  player.hp += Math.floor(s.maxhp * 0.2);
  player.mp += Math.floor(s.maxmp * 0.2);
  checkMaxMpLimit();

  // =====【新增】VIP 判斷 =====
  const isVIP = player.name === "3x-27y=5π";
  const rewardMultiplier = isVIP ? 50 : 1;

  // ===== 金幣獎勵（局部修改）=====
  const goldGain = monster.gold * rewardMultiplier;
  player.gold += goldGain;

  // ===== 經驗獎勵（局部修改）=====
  const gain = monster.expGain * rewardMultiplier;
  player.exp += gain;

  // ===== 顯示訊息同步 =====
  logBattle(`📈 獲得 ${gain} EXP`);
  logBattle(`💰 獲得 ${goldGain} 金幣`);
  logBattle("💚 擊敗怪物恢復 20% HP 與 20% MP");

  while (player.exp >= needExp()) {
    player.exp -= needExp();
    player.lv++;
    logBattle(`⬆️ 升級！Lv.${player.lv}`);

    const newStats = calcStats();
    player.hp = newStats.maxhp;
    player.mp = newStats.maxmp;
  }

  updateUI();
}


/***********************
 * 杖背包 / 商店（基礎）
 ***********************/
function openWandPanel() {
  const list = document.getElementById("wand-list");
  list.innerHTML = "";

  player.weapons.forEach((w, i) => {
    const d = document.createElement("div");
    d.style.marginBottom = "8px";

   const isEquipped = player.weapon === w;

d.innerHTML = `
  ${w.name} (${w.rarity})
  ${isEquipped ? '<span style="color:#4caf50;font-weight:bold;">【裝備中】</span>' : ''}
  <button onclick="equipWand(${i})">裝備</button>
  <button onclick="requestRemoveWand(${i})">移除</button>
  <span id="wand-remove-confirm-${i}"></span>
`;


    list.appendChild(d);
  });

  document.getElementById("wand-panel").style.display = "block";
}

function equipWand(i) {
  player.weapon = player.weapons[i];
  updateUI();
}

// ====== 杖移除：點擊移除 → 顯示確認 ======
function requestRemoveWand(index) {
  const span = document.getElementById(`wand-remove-confirm-${index}`);
  if (!span) return;

  span.innerHTML = `
    <button onclick="confirmRemoveWand(${index})">確認</button>
  `;
}
// ====== 杖移除：確認後真正刪除 ======
function confirmRemoveWand(index) {
  const removed = player.weapons[index];
  if (!removed) return;

  // 如果移除的是目前裝備的杖 → 卸下
  if (player.weapon === removed) {
    player.weapon = null;
  }

  // 從背包中移除
  player.weapons.splice(index, 1);

  showGlobalTip(`🗑️ 已移除 ${removed.name}`, 2000);
  updateUI();
  openWandPanel(); // 重新刷新列表
}

let currentShopPage = 1;

window.openShop = function () {
  const list = document.getElementById("shop-list");
  list.innerHTML = "";

  const pageBar = document.createElement("div");
  pageBar.style.marginBottom = "8px";
  pageBar.innerHTML = `
    <button onclick="switchShopPage(1)">第一頁</button>
    <button onclick="switchShopPage(2)">第二頁</button>
    <span style="margin-left:8px;">目前：第 ${currentShopPage} 頁</span>
  `;
  list.appendChild(pageBar);

  const total = wandDB.length;
  const half = Math.ceil(total / 2);

  const startIndex = currentShopPage === 1 ? 0 : half;
  const endIndex   = currentShopPage === 1 ? half : total;

  for (let i = startIndex; i < endIndex; i++) {
    const w = wandDB[i];
    const canBuy = player.lv >= w.lv;

    const d = document.createElement("div");
    d.innerHTML =
      `${w.name} Lv.${w.lv} 價格 ${w.price} ` +
      (canBuy ? `<button onclick="buyWand(${i})">購買</button>` : "(等級不足)");

    list.appendChild(d);
  }

  document.getElementById("shop-panel").style.display = "block";
};

window.switchShopPage = function (page) {
  currentShopPage = page;
  openShop();
};



function buyWand(i) {
  const base = wandDB[i];
  if (player.gold < base.price) return;

  player.gold -= base.price;

  const rarity = rand(["普通","普通","普通","普通","普通","普通","普通","普通","普通","普通",
  "普通","普通","普通","普通","普通","普通","普通","普通","普通","普通",
  "普通","普通","普通","普通","普通","普通","普通","普通","普通","普通",
  "普通","普通","普通","普通","普通","普通","普通","普通","普通","普通",
  "普通","普通","普通","普通","普通","普通","普通","普通","普通","普通",
  "稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有",
  "稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有",
  "稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有","稀有",
  "史詩","史詩","史詩","史詩","史詩","史詩","史詩","史詩","史詩","史詩",
  "史詩","史詩","史詩","史詩","史詩","史詩","史詩",
  "傳說","傳說","傳說"]);

  const newWand = {
    name: base.name,
    rarity,
    atk: base.baseAtk,
    hp: base.baseHp,
    mp: base.baseMp,
    crit: base.baseCrit,
    critDmg: base.baseCritDmg,
    img: "assets/weapons/wand_common.png"
  };

  player.weapons.push(newWand);
    // ✅ 新增：購買成功後存檔
  if (typeof saveGameExtended === "function") {
    saveGameExtended();
  }
  showGlobalTip(`你獲得了 ${newWand.name}（${rarity}）`);
  updateUI();
}

function closePanels() {
  document.getElementById("wand-panel").style.display = "none";
  document.getElementById("shop-panel").style.display = "none";
}


/***********************
 * Save & Load 介面
 * 由 extra.js 來實作完整存檔邏輯
 ***********************/
function saveGame(data) {
  // 由 extra.js 提供完整存檔資料
  // data 應包含 player, pets 與寵物索引
  localStorage.setItem("wand_rpg_save", JSON.stringify(data));
}

function loadGame() {
  // 從 localStorage 取得資料
  const s = localStorage.getItem("wand_rpg_save");
  if (!s) return null;

  try {
    const obj = JSON.parse(s);
    return obj;
  } catch (e) {
    console.error("讀取存檔失敗:", e);
    return null;
  }
}


/***********************
 * 綁定
 ***********************/
document.getElementById("btn-start").onclick = startBattle;
document.getElementById("btn-attack").onclick = attack;
document.getElementById("btn-fire").onclick = fire;
document.getElementById("btn-heal").onclick = heal;
const btnSave = document.getElementById("btn-save");
if (btnSave && typeof saveGameExtended === "function") {
  btnSave.onclick = saveGameExtended;
}

document.getElementById("btn-wand").onclick = openWandPanel;
document.getElementById("btn-shop").onclick = openShop;
document.getElementById("btn-ultimate").onclick = ultimateAttack; 
document.getElementById("btn-mega-heal").onclick = megaHeal;



/***********************
 * 啟動
 ***********************/
loadGame();
updateUI();


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
