const rarityMul = { 普通: 1, 稀有: 1.5, 史詩: 2, 傳說: 3 };

let player = {
  name: "冒險者",
  base: { atk: 10, hp: 100, mp: 30 },
  hp: 100,
  mp: 30,
  lv: 1,
  weapon: {
    name: "初心之杖",
    rarity: "普通",
    atk: 2,
    hp: 10,
    mp: 5,
    img: "assets/weapons/wand_common.png"
  }
};

const monsters = [
  { name: "史萊姆", hp: 40, atk: 5, img: "assets/monsters/slime.png" },
  { name: "火焰精靈", hp: 60, atk: 8, img: "assets/monsters/fire.png" }
];

let monster = null;

function stats() {
  const m = rarityMul[player.weapon.rarity];
  return {
    atk: player.base.atk + player.weapon.atk * m,
    maxhp: player.base.hp + player.weapon.hp * m,
    maxmp: player.base.mp + player.weapon.mp * m
  };
}

function ui() {
  const s = stats();
  player.hp = Math.min(player.hp, s.maxhp);
  player.mp = Math.min(player.mp, s.maxmp);

  playerName.innerText = `${player.name} Lv.${player.lv}`;
  playerStats.innerText =
    `ATK ${s.atk}\nHP ${player.hp}/${s.maxhp}\nMP ${player.mp}/${s.maxmp}`;
  playerWeaponImg.src = player.weapon.img;

  if (monster) monsterHp.innerText = `HP ${monster.hp}`;
}

function log(text) {
  battleLog.innerHTML += text + "<br>";
}

function startBattle() {
  monster = JSON.parse(JSON.stringify(
    monsters[Math.floor(Math.random() * monsters.length)]
  ));
  battle.style.display = "block";
  monsterName.innerText = monster.name;
  monsterImg.src = monster.img;
  battleLog.innerHTML = "";
  ui();
}

function enemyTurn() {
  player.hp -= monster.atk;
  log(`怪物攻擊你，受到 ${monster.atk} 傷害`);
  ui();
}

function attack() {
  monster.hp -= stats().atk;
  if (monster.hp > 0) enemyTurn();
  else log("🎉 勝利！");
  ui();
}

function fire() {
  if (player.mp < 5) return;
  player.mp -= 5;
  monster.hp -= 20;
  if (monster.hp > 0) enemyTurn();
  else log("🔥 火球擊敗怪物！");
  ui();
}

function heal() {
  if (player.mp < 5) return;
  player.mp -= 5;
  player.hp += 25;
  log("✨ 你使用治癒術");
  ui();
}

btnStart.onclick = startBattle;
btnAttack.onclick = attack;
btnFire.onclick = fire;
btnHeal.onclick = heal;
btnSave.onclick = () =>
  localStorage.setItem("save", JSON.stringify(player));

const save = localStorage.getItem("save");
if (save) player = JSON.parse(save);
ui();
