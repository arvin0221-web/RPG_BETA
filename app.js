// ================== 稀有度 ==================
const RARITY = [
  { name: "普通", mul: 1, rate: 0.6 },
  { name: "稀有", mul: 1.5, rate: 0.25 },
  { name: "史詩", mul: 2, rate: 0.12 },
  { name: "傳說", mul: 3, rate: 0.03 }
];

// ================== 玩家 ==================
let player = {
  name: "冒險者",
  lv: 1,
  exp: 0,
  gold: 100,
  base: { atk: 10, hp: 100, mp: 30 },
  hp: 100,
  mp: 30,
  crit: 0.01,
  critDmg: 1.2,
  weapon: null,
  wandBag: []
};

// ================== 杖清單 ==================
const WANDS = [
  { name:"木杖", minLv:1, price:50, base:{atk:2,hp:10,mp:5,crit:0.005,critDmg:0.05}, img:"assets/weapons/wand_wood.png" },
  { name:"鐵杖", minLv:5, price:150, base:{atk:4,hp:15,mp:8,crit:0.008,critDmg:0.1}, img:"assets/weapons/wand_iron.png" },
  { name:"古木杖", minLv:10, price:300, base:{atk:7,hp:25,mp:12,crit:0.01,critDmg:0.15}, img:"assets/weapons/wand_old.png" },
  { name:"合金法杖", minLv:20, price:800, base:{atk:12,hp:40,mp:20,crit:0.015,critDmg:0.2}, img:"assets/weapons/wand_alloy.png" },
  { name:"神木杖", minLv:30, price:1600, base:{atk:18,hp:60,mp:30,crit:0.02,critDmg:0.25}, img:"assets/weapons/wand_divine.png" },
  { name:"帝之權杖", minLv:40, price:3000, base:{atk:26,hp:90,mp:45,crit:0.025,critDmg:0.3}, img:"assets/weapons/wand_emperor.png" },
  { name:"神之權杖", minLv:50, price:6000, base:{atk:36,hp:130,mp:65,crit:0.03,critDmg:0.35}, img:"assets/weapons/wand_god.png" },
  { name:"神王法杖", minLv:60, price:12000, base:{atk:50,hp:180,mp:90,crit:0.035,critDmg:0.4}, img:"assets/weapons/wand_king.png" },
  { name:"無極法杖", minLv:70, price:25000, base:{atk:70,hp:250,mp:120,crit:0.04,critDmg:0.45}, img:"assets/weapons/wand_infinite.png" },
  { name:"葬神之權杖", minLv:80, price:50000, base:{atk:100,hp:350,mp:180,crit:0.05,critDmg:0.6}, img:"assets/weapons/wand_destroy.png" }
];

// ================== 工具 ==================
function randRarity() {
  let r = Math.random(), sum = 0;
  for (let rar of RARITY) {
    sum += rar.rate;
    if (r <= sum) return rar;
  }
  return RARITY[0];
}

// ================== 計算 ==================
function stats() {
  let atk = player.base.atk;
  let hp = player.base.hp;
  let mp = player.base.mp;
  let crit = player.crit;
  let critDmg = player.critDmg;

  if (player.weapon) {
    atk += player.weapon.atk;
    hp += player.weapon.hp;
    mp += player.weapon.mp;
    crit += player.weapon.crit;
    critDmg += player.weapon.critDmg;
  }

  return {
    atk: Math.floor(atk),
    maxhp: Math.floor(hp),
    maxmp: Math.floor(mp),
    crit,
    critDmg
  };
}

// ================== UI ==================
function ui() {
  const s = stats();
  player.hp = Math.min(player.hp, s.maxhp);
  player.mp = Math.min(player.mp, s.maxmp);

  document.getElementById("player-name").innerText =
    `${player.name} Lv.${player.lv} | EXP ${player.exp} | 💰${player.gold}`;

  document.getElementById("player-stats").innerText =
`ATK ${s.atk}
HP ${player.hp}/${s.maxhp}
MP ${player.mp}/${s.maxmp}
爆擊率 ${(s.crit*100).toFixed(1)}%
爆傷 ${(s.critDmg*100).toFixed(0)}%`;

  document.getElementById("player-weapon-img").src =
    player.weapon ? player.weapon.img : "assets/weapons/wand_common.png";
}

// ================== 杖背包 ==================
function openWands() {
  const panel = document.getElementById("wand-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
  const list = document.getElementById("wand-list");
  list.innerHTML = "";

  player.wandBag.forEach((w, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${w.name}（${w.rarity}）Lv.${w.minLv}
      <button onclick="equipWand(${i})">裝備</button>
    `;
    list.appendChild(div);
  });
}

function equipWand(i) {
  player.weapon = player.wandBag[i];
  showTip(`已裝備 ${player.weapon.name}`);
  ui();
}

// ================== 商店 ==================
function openShop() {
  const panel = document.getElementById("shop-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
  const list = document.getElementById("shop-list");
  list.innerHTML = "";

  WANDS.forEach((w, i) => {
    const canBuy = player.lv >= w.minLv;
    const div = document.createElement("div");
    div.innerHTML = `
      ${w.name} Lv.${w.minLv} 💰${w.price}
      <button ${canBuy?"":"disabled"} onclick="buyWand(${i})">購買</button>
    `;
    list.appendChild(div);
  });
}

function buyWand(i) {
  const base = WANDS[i];
  if (player.gold < base.price) return;

  const rar = randRarity();
  const m = rar.mul;

  const wand = {
    name: base.name,
    minLv: base.minLv,
    rarity: rar.name,
    atk: Math.floor(base.base.atk * m),
    hp: Math.floor(base.base.hp * m),
    mp: Math.floor(base.base.mp * m),
    crit: base.base.crit * m,
    critDmg: base.base.critDmg * m,
    img: base.img
  };

  player.gold -= base.price;
  player.wandBag.push(wand);
  showTip(`你獲得了 ${wand.name}（${wand.rarity}）`);
  ui();
}

// ================== 提示 ==================
function showTip(t) {
  const tip = document.getElementById("tip");
  tip.innerText = t;
  tip.style.display = "block";
  setTimeout(() => tip.style.display = "none", 2000);
}

// ================== 綁定 ==================
btn-wands.onclick = openWands;
btn-shop.onclick = openShop;
btn-save.onclick = () => localStorage.setItem("save", JSON.stringify(player));

const save = localStorage.getItem("save");
if (save) player = JSON.parse(save);

ui();
