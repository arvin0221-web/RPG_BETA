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
  { name: "木杖", lv: 1, baseAtk: 2, baseHp: 15, baseMp: 5, baseCrit: 0.02, baseCritDmg: 0.05, price: 100 },
  { name: "鐵杖", lv: 5, baseAtk: 6, baseHp: 30, baseMp: 10, baseCrit: 0.04, baseCritDmg: 0.11, price: 500 },
  { name: "朽木杖", lv: 10, baseAtk: 12, baseHp: 60, baseMp: 20, baseCrit: 0.06, baseCritDmg: 0.17, price: 1200 },
  { name: "上古木杖", lv: 17, baseAtk: 25, baseHp: 120, baseMp: 40, baseCrit: 0.09, baseCritDmg: 0.23, price: 2600 },
  { name: "神木杖", lv: 24, baseAtk: 45, baseHp: 180, baseMp: 60, baseCrit: 0.12, baseCritDmg: 0.29, price: 6000 },
  { name: "天金法杖", lv: 31 , baseAtk: 70, baseHp: 300, baseMp: 100, baseCrit: 0.15, baseCritDmg: 0.35, price: 14000 },
  { name: "人皇之權杖", lv: 38, baseAtk: 110, baseHp: 450, baseMp: 150, baseCrit: 0.21, baseCritDmg: 0.41, price: 30000 },
  { name: "神之權杖", lv: 45, baseAtk: 170, baseHp: 675, baseMp: 220, baseCrit: 0.25, baseCritDmg: 0.48, price: 70000 },
  { name: "神王之權杖", lv: 52, baseAtk: 260, baseHp: 975, baseMp: 300, baseCrit: 0.30, baseCritDmg: 0.56, price: 160000 },
  { name: "至高權杖", lv: 59, baseAtk: 400, baseHp: 1350, baseMp: 450, baseCrit: 0.30, baseCritDmg: 0.74, price: 400000 },
  { name: "無極法杖", lv: 66, baseAtk: 800, baseHp: 2700, baseMp: 900, baseCrit: 0.30, baseCritDmg: 0.90, price: 900000 },
  { name: "葬神之法杖", lv: 73, baseAtk: 1600, baseHp: 5400, baseMp: 1800, baseCrit: 0.30, baseCritDmg: 1.00, price: 2000000 },
  { name: "歸真木杖", lv: 80, baseAtk: 3200, baseHp: 5400, baseMp: 1800, baseCrit: 0.33, baseCritDmg: 2.00, price: 5000000 },
  { name: "星辰法杖", lv: 90, baseAtk: 5000, baseHp: 7000, baseMp: 2000, baseCrit: 0.33, baseCritDmg: 2.50, price: 12000000 },
{ name: "創世神杖", lv: 115, baseAtk: 6500, baseHp: 8500, baseMp: 2200, baseCrit: 0.33, baseCritDmg: 3.00, price: 27000000 },
{ name: "永恆之杖", lv: 135, baseAtk: 8000, baseHp: 10000, baseMp: 2400, baseCrit: 0.33, baseCritDmg: 3.50, price: 60000000 },
{ name: "混沌之杖", lv: 160, baseAtk: 10000, baseHp: 10000, baseMp: 2700, baseCrit: 0.33, baseCritDmg: 4.00, price: 260000000 },
{ name: "極•歸真木杖", lv: 200, baseAtk: 10000, baseHp: 10000, baseMp: 2700, baseCrit: 0.33, baseCritDmg: 6.00, price: 600000000 }
];


/***********************
 * 怪物資料
 ***********************/
const monsterPool = [
  { name: "史萊姆", hp: 40, atk: 5, gold: 12, baseExp: 15, img: "assets/monsters/slime.png" },
  { name: "狂暴史萊姆", hp: 30, atk: 9, gold: 17, baseExp: 20, img: "assets/monsters/slime.png" },
  { name: "石甲龜", hp: 90, atk: 4, gold: 22, baseExp: 25, img: "assets/monsters/turtle.png" },
  { name: "火焰精靈", hp: 60, atk: 10, gold: 24, baseExp: 30, img: "assets/monsters/fire.png" },
  { name: "暗影騎士", hp: 130, atk: 15, gold: 42, baseExp: 50, img: "assets/monsters/knight.png" },
  { name: "糖bee", hp: 1, atk: 1, gold: 1, baseExp: 1, img: "assets/monsters/sugarbee.png" }
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
  let atk = Math.floor(player.base.atk * (1 + 0.10 * (lvl - 1)));
  let maxhp = Math.floor(player.base.hp * (1 + 0.12 * (lvl - 1)));
  let maxmp = Math.floor(player.base.mp * (1 + 0.10 * (lvl - 1)));
  
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

  // 隨機選一個怪物
  const base = rand(monsterPool);
  const lv = rand([player.lv, player.lv + 1, player.lv + 2, player.lv + 3]);

  // 生成怪物
  function generateMonster(base, lv) {
    if (!base) {
      console.error("generateMonster: base is null或 undefined", base, lv);
      return null;
    }

    const tens = Math.floor(lv / 10);
    const boost = 0.05 * tens * (tens + 1) / 2; // 每10級累加 5%
    const multiplier = 1 + boost;

    const monster = {
      name: base.name,
      lv,
      maxHp: Math.floor(base.hp * (1 + lv * 0.35) * multiplier),
      hp: 0,
      atk: Math.floor(base.atk * (1 + lv * 0.25) * multiplier),
      gold: Math.floor(base.gold * (1 + lv * 0.3) * multiplier),
      expGain: Math.floor(base.baseExp * (1 + lv * 0.2)), // 經驗值小幅成長
      img: base.img || "" // 沒有圖片就空字串
    };

    monster.hp = monster.maxHp;
    return monster;
  }

  monster = generateMonster(base, lv);

  if (!monster) {
    showGlobalTip("⚠️ 無法生成怪物！請檢查怪物資料", 3000);
    return;
  }

  // 如果沒有圖片，就不改 src，避免 404
  if (monster.img) {
    document.getElementById("monster-img").src = monster.img;
  } else {
    document.getElementById("monster-img").src = ""; // 或你可以放一個預設空白圖
  }

  document.getElementById("battle").style.display = "block";
  document.getElementById("battle-log").innerHTML = "";

  logBattle(`⚔️ 遭遇 ${monster.name} Lv.${monster.lv}`);
  inBattle = true;
  updateUI();
}





  document.getElementById("monster-img").src = monster.img;
  document.getElementById("battle").style.display = "block";
  document.getElementById("battle-log").innerHTML = "";

  logBattle(`⚔️ 遭遇 ${monster.name} Lv.${monster.lv}`);
  inBattle = true;
  updateUI();
}

function playerAttack(mult = 1,
bonusDmg = 0) {
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
  // 判斷是否為糖bee
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
  playerAttack(1, 20);
  logBattle(`🔥 施展火球術！額外傷害 +20`);
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
  player.hp += 25;
  logBattle(`💚 使用治癒術，恢復了 25 點 HP`);
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
  playerAttack(1, 250);
  logBattle(`🔥 施展蒼穹滅世斬！額外傷害 +250`);
}

// --- 新技能 2：神聖大恢復 (強力治療) ---
function megaHeal() {
  const cost = 50;
  if (!inBattle) return;
  if (player.mp < cost) {
    showGlobalTip(`MP不足，釋放神聖大恢復需要 ${cost} MP`, 2000);
    return;
  }
  player.mp -= cost;
  player.hp += 300;
  logBattle(`✨ 聖光降臨！使用神聖大恢復，恢復了 300 點 HP`);
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

  const gain = monster.expGain; 
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
