// ===== 基本設定 =====
const rarityMul = { 普通: 1, 稀有: 1.5, 史詩: 2, 傳說: 3 };

// ===== 玩家 =====
let player = {
  name: "冒險者",
  lv: 1,
  exp: 0,
  base: { atk: 10, hp: 100, mp: 30 },
  hp: 100,
  mp: 30,
  weapon: {
    name: "初心之杖",
    rarity: "普通",
    atk: 2,
    hp: 10,
    mp: 5,
    img: "assets/weapons/wand_common.png"
  }
};

// ===== 怪物模板 =====
const monsterPool = [
  { name: "史萊姆", baseHp: 40, baseAtk: 5, img: "assets/monsters/slime.png" },
  { name: "狂暴史萊姆", baseHp: 30, baseAtk: 9, img: "assets/monsters/slime.png" },
  { name: "石甲龜", baseHp: 90, baseAtk: 4, img: "assets/monsters/turtle.png" },
  { name: "火焰精靈", baseHp: 60, baseAtk: 10, img: "assets/monsters/fire.png" },
  { name: "吸血蝙蝠", baseHp: 50, baseAtk: 7, img: "assets/monsters/bat.png" },
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

  document.getElementById("player-name").innerText =
    `${player.name} Lv.${player.lv} (EXP ${player.exp}/${needExp()})`;

  document.getElementById("player-stats").innerText =
    `ATK ${s.atk}\nHP ${player.hp}/${s.maxhp}\nMP ${player.mp}/${s.maxmp}`;

  document.getElementById("player-weapon-img").src = player.weapon.img;

  if (monster) {
    document.getElementById("monster-name").innerText =
      `${monster.name} Lv.${monster.lv}`;
    document.getElementById("monster-hp").innerText =
      `HP ${monster.hp}/${monster.maxHp}`;
  }
}

function logMsg(t) {
  const log = document.getElementById("log");
  log.innerHTML += t + "<br>";
  log.scrollTop = log.scrollHeight;
}

// ===== 遭遇怪物 =====
function startBattle() {
  if (inBattle) {
    showTip("對戰進行中");
    return;
  }

  const minLv = Math.max(1, player.lv - 2);
  const maxLv = player.lv + 4;
  const lv = Math.floor(Math.random() * (maxLv - minLv + 1)) + minLv;

  const base = monsterPool[Math.floor(Math.random() * monsterPool.length)];

  monster = {
    name: base.name,
    lv,
    maxHp: Math.floor(base.baseHp * (1 + lv * 0.35)),
    hp: 0,
    atk: Math.floor(base.baseAtk * (1 + lv * 0.25)),
    img: base.img
  };
  monster.hp = monster.maxHp;

  document.getElementById("monster-img").src = monster.img;
  document.getElementById("battle").style.display = "block";
  document.getElementById("log").innerHTML = "";

  logMsg(`⚔️ 遭遇 ${monster.name} Lv.${monster.lv}`);
  inBattle = true;
  ui();
}

// ===== 戰鬥 =====
function enemyTurn() {
  if (!inBattle) return;
  player.hp -= monster.atk;
  logMsg(`😈 ${monster.name} 攻擊你，造成 ${monster.atk} 傷害`);
  if (player.hp <= 0) {
    player.hp = 0;
    logMsg("💀 你被擊敗了...");
    inBattle = false;
  }
  ui();
}

function checkWin() {
  if (monster.hp <= 0) {
    monster.hp = 0;
    logMsg("🎉 勝利！");
    gainReward();
    inBattle = false;
    monster = null;
    document.getElementById("battle").style.display = "none";
  }
}

function attack() {
  if (!inBattle) return;
  const dmg = stats().atk;
  monster.hp -= dmg;
  logMsg(`⚔️ 你造成 ${dmg} 傷害`);
  checkWin();
  if (inBattle) enemyTurn();
  ui();
}

function fire() {
  if (!inBattle || player.mp < 5) return;
  player.mp -= 5;
  monster.hp -= 20;
  logMsg("🔥 火球術造成 20 傷害");
  checkWin();
  if (inBattle) enemyTurn();
  ui();
}

function heal() {
  if (!inBattle || player.mp < 5) return;
  player.mp -= 5;
  player.hp += 25;
  logMsg("✨ 治癒 +25 HP");
  ui();
}

// ===== 獎勵 =====
function gainReward() {
  const s = stats();
  player.hp += Math.floor(s.maxhp * 0.2);
  player.mp += Math.floor(s.maxmp * 0.2);

  const expGain = monster.lv * 20;
  player.exp += expGain;
  logMsg(`📈 獲得 ${expGain} EXP`);
  logMsg("💚 擊敗怪物可恢復20% HP 與30% MP");

  while (player.exp >= needExp()) {
    player.exp -= needExp();
    player.lv++;
    logMsg(`⬆️ 升級！現在 Lv.${player.lv}`);
  }
}

// ===== 提示 =====
function showTip(text) {
  const tip = document.getElementById("tip");
  tip.innerText = text;
  tip.style.display = "block";
  setTimeout(() => (tip.style.display = "none"), 2000);
}

// ===== 綁定 =====
btn-start.onclick = startBattle;
btn-attack.onclick = attack;
btn-fire.onclick = fire;
btn-heal.onclick = heal;
btn-save.onclick = () =>
  localStorage.setItem("save", JSON.stringify(player));

const save = localStorage.getItem("save");
if (save) player = JSON.parse(save);

ui();
