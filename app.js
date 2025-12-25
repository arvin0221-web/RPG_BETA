/*************************************************
 * 製杖RPG v1.0 Base Version
 * 規則：不刪功能，只加功能
 *************************************************/


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
    atk: 10,
    hp: 100,
    mp: 30,
    crit: 0.01,      // 1%
    critDmg: 1.2     // 120%
  },

  hp: 100,
  mp: 30,

  weapon: null,     // 當前裝備
  weapons: []       // 擁有的杖
};


/***********************
 * 杖資料庫（固定）
 ***********************/
const wandDB = [
  { name: "木杖", lv: 1, baseAtk: 2, baseHp: 10, baseMp: 5, baseCrit: 0.01, baseCritDmg: 0.05, price: 50 },
  { name: "鐵杖", lv: 5, baseAtk: 6, baseHp: 20, baseMp: 10, baseCrit: 0.02, baseCritDmg: 0.1, price: 250 },
  { name: "古木杖", lv: 10, baseAtk: 12, baseHp: 40, baseMp: 20, baseCrit: 0.03, baseCritDmg: 0.15, price: 600 },
  { name: "合金法杖", lv: 20, baseAtk: 25, baseHp: 80, baseMp: 40, baseCrit: 0.04, baseCritDmg: 0.2, price: 1300 },
  { name: "神木杖", lv: 30, baseAtk: 45, baseHp: 120, baseMp: 60, baseCrit: 0.05, baseCritDmg: 0.25, price: 3000 },
  { name: "帝之權杖", lv: 40, baseAtk: 70, baseHp: 200, baseMp: 100, baseCrit: 0.06, baseCritDmg: 0.3, price: 7000 },
  { name: "神之權杖", lv: 50, baseAtk: 110, baseHp: 300, baseMp: 150, baseCrit: 0.07, baseCritDmg: 0.35, price: 15000 },
  { name: "神王法杖", lv: 60, baseAtk: 170, baseHp: 450, baseMp: 220, baseCrit: 0.08, baseCritDmg: 0.4, price: 35000 },
  { name: "無極法杖", lv: 70, baseAtk: 260, baseHp: 650, baseMp: 300, baseCrit: 0.09, baseCritDmg: 0.45, price: 80000 },
  { name: "葬神之權杖", lv: 80, baseAtk: 400, baseHp: 900, baseMp: 450, baseCrit: 0.1, baseCritDmg: 0.5, price: 200000 }
];


/***********************
 * 怪物資料
 ***********************/
const monsterPool = [
  { name: "史萊姆", hp: 40, atk: 5, gold: 10, img: "assets/monsters/slime.png" },
  { name: "狂暴史萊姆", hp: 30, atk: 9, gold: 14, img: "assets/monsters/slime.png" },
  { name: "石甲龜", hp: 90, atk: 4, gold: 18, img: "assets/monsters/turtle.png" },
  { name: "火焰精靈", hp: 60, atk: 10, gold: 20, img: "assets/monsters/fire.png" },
  { name: "暗影騎士", hp: 140, atk: 15, gold: 35, img: "assets/monsters/knight.png" }
];

let monster = null;
let inBattle = false;


/***********************
 * 成長計算 (局部更改區)
 ***********************/
function needExp() {
  return Math.floor(50 * Math.pow(player.lv, 1.6));
}

function calcStats() {
  const lvl = player.lv;
  // 以下為強制注入的公式
  let atk = Math.floor(player.base.atk * (1 + 0.05 * (lvl - 1)));
  let maxhp = Math.floor(player.base.hp * (1 + 0.08 * (lvl - 1)));
  let maxmp = Math.floor(player.base.mp * (1 + 0.06 * (lvl - 1)));
  
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
 * 戰鬥系統
 ***********************/
function startBattle() {
  if (inBattle) {
    showGlobalTip("對戰進行中");
    return;
  }

  const base = rand(monsterPool);
  const lv = rand([player.lv, player.lv + 1, player.lv + 2, player.lv + 3, player.lv + 4]);

  monster = {
    name: base.name,
    lv,
    maxHp: Math.floor(base.hp * (1 + lv * 0.35)),
    hp: 0,
    atk: Math.floor(base.atk * (1 + lv * 0.25)),
    gold: Math.floor(base.gold * (1 + lv * 0.3)),
    img: base.img
  };
  monster.hp = monster.maxHp;

  document.getElementById("monster-img").src = monster.img;
  document.getElementById("battle").style.display = "block";
  document.getElementById("battle-log").innerHTML = "";

  logBattle(`⚔️ 遭遇 ${monster.name} Lv.${monster.lv}`);
  inBattle = true;
  updateUI();
}

function playerAttack(mult = 1) {
  if (!inBattle) return;

  const s = calcStats();
  let dmg = Math.floor(s.atk * mult);
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
  logBattle("🎉 勝利！");
  rewardBattle();
  inBattle = false;
  monster = null;
}

function playerDeath() {
  logBattle("💀 玩家已死亡");
  player.exp = Math.max(0, player.exp - 100);
  showGlobalTip("玩家已死亡，扣除經驗值並復活", 6000);

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

function fire() {
  if (!inBattle || player.mp < 5) return;
  player.mp -= 5;
  playerAttack(1.5);
}

function heal() {
  if (!inBattle || player.mp < 5) return;
  player.mp -= 5;
  player.hp += 25;
  updateUI();
}


/***********************
 * 獎勵系統 (局部更改區)
 ***********************/
function rewardBattle() {
  const s = calcStats();

  player.hp += Math.floor(s.maxhp * 0.2);
  player.mp += Math.floor(s.maxmp * 0.2);

  player.gold += monster.gold;

  const gain = monster.lv * 20;
  player.exp += gain;

  logBattle(`📈 獲得 ${gain} EXP`);
  logBattle(`💰 獲得 ${monster.gold} 金幣`);
  logBattle("💚 擊敗怪物恢復 20% HP 與 20% MP");

  while (player.exp >= needExp()) {
    player.exp -= needExp();
    player.lv++;
    logBattle(`⬆️ 升級！Lv.${player.lv}`);
    // 補滿血魔邏輯
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
    d.innerHTML = `${w.name} (${w.rarity}) <button onclick="equipWand(${i})">裝備</button>`;
    list.appendChild(d);
  });

  document.getElementById("wand-panel").style.display = "block";
}

function equipWand(i) {
  player.weapon = player.weapons[i];
  updateUI();
}

function openShop() {
  const list = document.getElementById("shop-list");
  list.innerHTML = "";

  wandDB.forEach((w, i) => {
    const canBuy = player.lv >= w.lv;
    const d = document.createElement("div");
    d.innerHTML =
      `${w.name} Lv.${w.lv} 價格 ${w.price} ` +
      (canBuy ? `<button onclick="buyWand(${i})">購買</button>` : "(等級不足)");
    list.appendChild(d);
  });

  document.getElementById("shop-panel").style.display = "block";
}

function buyWand(i) {
  const base = wandDB[i];
  if (player.gold < base.price) return;

  player.gold -= base.price;

  const rarity = rand(["普通", "稀有", "史詩", "傳說"]);

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
document.getElementById("btn-save").onclick = saveGameExtended;
document.getElementById("btn-wand").onclick = openWandPanel;
document.getElementById("btn-shop").onclick = openShop;


/***********************
 * 啟動
 ***********************/
loadGame();
updateUI();
