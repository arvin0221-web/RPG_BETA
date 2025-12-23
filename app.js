// ===== 抓 DOM 元素 =====
const playerNameEl = document.getElementById("player-name");
const playerStatsEl = document.getElementById("player-stats");
const playerWeaponImgEl = document.getElementById("player-weapon-img");

const monsterNameEl = document.getElementById("monster-name");
const monsterHpEl = document.getElementById("monster-hp");
const monsterImgEl = document.getElementById("monster-img");

const logEl = document.getElementById("log");
const tipEl = document.getElementById("tip");
const battleEl = document.getElementById("battle");

// 按鈕
const btnStart = document.getElementById("btn-start");
const btnAttack = document.getElementById("btn-attack");
const btnFire = document.getElementById("btn-fire");
const btnHeal = document.getElementById("btn-heal");
const btnWand = document.getElementById("btn-wand");
const btnShop = document.getElementById("btn-shop");
const btnSave = document.getElementById("btn-save");

// ===== 基本設定 =====
const rarityMul = { 普通: 1, 稀有: 1.6, 史詩: 2.3, 傳說: 3.5 };
const rarityWeightBase = [
  { r: "普通", w: 60 },
  { r: "稀有", w: 25 },
  { r: "史詩", w: 12 },
  { r: "傳說", w: 3 }
];

// ===== 玩家 =====
let player = {
  name: "冒險者",
  lv: 1,
  exp: 0,
  gold: 0,
  base: { atk: 10, hp: 100, mp: 30 },
  hp: 100,
  mp: 30,
  weapon: null
};

// ===== 預設新手杖 =====
player.weapon = {
  name: "初心之杖",
  rarity: "普通",
  lvReq: 1,
  atk: 2,
  hp: 10,
  mp: 5,
  price: 0,
  img: "assets/weapons/wand_common.png"
};

// ===== 怪物 =====
const monsterPool = [
  { name: "史萊姆", baseHp: 40, baseAtk: 5, img: "assets/monsters/slime.png" },
  { name: "狂暴史萊姆", baseHp: 30, baseAtk: 9, img: "assets/monsters/slime.png" },
  { name: "石甲龜", baseHp: 90, baseAtk: 4, img: "assets/monsters/turtle.png" },
  { name: "火焰精靈", baseHp: 60, baseAtk: 10, img: "assets/monsters/fire.png" },
  { name: "暗影騎士", baseHp: 120, baseAtk: 14, img: "assets/monsters/knight.png" }
];

let monster = null;
let inBattle = false;

// ===== 計算 =====
function stats() {
  const m = rarityMul[player.weapon.rarity];
  return {
    atk: Math.floor(player.base.atk + player.weapon.atk * m),
    maxhp: Math.floor(player.base.hp + player.weapon.hp * m),
    maxmp: Math.floor(player.base.mp + player.weapon.mp * m)
  };
}

function needExp() {
  return Math.floor(50 * Math.pow(player.lv, 1.6));
}

// ===== UI =====
function ui() {
  const s = stats();
  player.hp = Math.min(player.hp, s.maxhp);
  player.mp = Math.min(player.mp, s.maxmp);

  playerNameEl.innerText = `${player.name} Lv.${player.lv} 💰${player.gold}`;
  playerStatsEl.innerText =
    `ATK ${s.atk}\nHP ${player.hp}/${s.maxhp}\nMP ${player.mp}/${s.maxmp}\n\n武器：${player.weapon.name}\n稀有度：${player.weapon.rarity}`;
  playerWeaponImgEl.src = player.weapon.img;

  if (monster) {
    monsterNameEl.innerText = `${monster.name} Lv.${monster.lv}`;
    monsterHpEl.innerText = `HP ${monster.hp}/${monster.maxHp}`;
    monsterImgEl.src = monster.img;
  }
}

function logMsg(t) {
  logEl.innerHTML += t + "<br>";
  logEl.scrollTop = logEl.scrollHeight;
}

function showTip(t, ms = 2000) {
  tipEl.innerText = t;
  tipEl.style.display = "block";
  setTimeout(() => tipEl.style.display = "none", ms);
}

// ===== 遭遇怪物 =====
function startBattle() {
  if (inBattle) return showTip("對戰進行中");

  logEl.innerHTML = "";

  const lv = Math.floor(Math.random() * 5) + Math.max(1, player.lv - 2);
  const base = monsterPool[Math.floor(Math.random() * monsterPool.length)];

  monster = {
    name: base.name,
    lv,
    maxHp: Math.floor(base.baseHp * (1 + lv * 0.35)),
    atk: Math.floor(base.baseAtk * (1 + lv * 0.25)),
    img: base.img
  };
  monster.hp = monster.maxHp;

  battleEl.style.display = "block";
  inBattle = true;

  logMsg(`⚔️ 遭遇 ${monster.name} Lv.${monster.lv}`);
  ui();
}

// ===== 戰鬥 =====
function enemyTurn() {
  player.hp -= monster.atk;
  logMsg(`😈 怪物攻擊造成 ${monster.atk} 傷害`);
  if (player.hp <= 0) playerDead();
  ui();
}

function playerDead() {
  player.exp = Math.max(0, player.exp - 100);
  const s = stats();
  player.hp = s.maxhp;
  player.mp = s.maxmp;
  inBattle = false;
  showTip("玩家已死亡，扣損經驗值並復活", 6000);
}

function attack() {
  if (!inBattle) return;
  monster.hp -= stats().atk;
  logMsg(`⚔️ 你造成 ${stats().atk} 傷害`);
  if (monster.hp <= 0) return win();
  enemyTurn();
}

function fire() {
  if (!inBattle || player.mp < 5) return;
  player.mp -= 5;
  monster.hp -= 20;
  logMsg("🔥 火球術造成 20 傷害");
  if (monster.hp <= 0) return win();
  enemyTurn();
}

function heal() {
  if (!inBattle || player.mp < 5) return;
  player.mp -= 5;
  player.hp += 25;
  logMsg("✨ 治癒 +25 HP");
  ui();
}

// ===== 勝利 =====
function win() {
  monster.hp = 0;
  logMsg("🎉 勝利！");

  const s = stats();
  player.hp += Math.floor(s.maxhp * 0.2);
  player.mp += Math.floor(s.maxmp * 0.2);

  const gold = monster.lv * (10 + Math.floor(Math.random() * 8));
  player.gold += gold;

  const exp = monster.lv * 20;
  player.exp += exp;

  logMsg(`💰 金幣 +${gold}`);
  logMsg(`📈 EXP +${exp}`);

  while (player.exp >= needExp()) {
    player.exp -= needExp();
    player.lv++;
    logMsg(`⬆️ 升級至 Lv.${player.lv}`);
  }

  inBattle = false;
  ui();
}

// ===== 商店 =====
function randRarity() {
  const pool = rarityWeightBase.map(x => ({
    r: x.r,
    w: Math.max(1, x.w - player.lv * 2)
  }));
  const sum = pool.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * sum;
  for (let p of pool) {
    if ((r -= p.w) <= 0) return p.r;
  }
  return "普通";
}

function buyWand() {
  const rarity = randRarity();
  const lvReq = Math.max(1, player.lv + Math.floor(Math.random() * 3) - 1);
  const mul = rarityMul[rarity];

  const wand = {
    name: `魔杖 Lv.${lvReq}`,
    rarity,
    lvReq,
    atk: Math.floor(4 * lvReq),
    hp: Math.floor(20 * lvReq),
    mp: Math.floor(10 * lvReq),
    price: Math.floor(80 * lvReq * mul),
    img: "assets/weapons/wand_common.png"
  };

  if (player.lv < wand.lvReq) return showTip("等級不足，無法使用");
  if (player.gold < wand.price) return showTip("金幣不足");

  player.gold -= wand.price;
  player.weapon = wand;

  showTip(`你獲得了 ${wand.name}（稀有度：${wand.rarity}）`, 4000);
  ui();
}

// ===== 杖按鈕顯示武器 =====
btnWand.onclick = () => showTip(`${player.weapon.name}（${player.weapon.rarity}）`);

// ===== 綁定其他按鈕 =====
btnStart.onclick = startBattle;
btnAttack.onclick = attack;
btnFire.onclick = fire;
btnHeal.onclick = heal;
btnShop.onclick = buyWand;
btnSave.onclick = () => localStorage.setItem("save", JSON.stringify(player));

// ===== 載入存檔 =====
const save = localStorage.getItem("save");
if (save) player = JSON.parse(save);

// ===== 初始 UI =====
ui();
