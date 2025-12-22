const $ = id => document.getElementById(id)

const rarityMul = { 普通: 1, 稀有: 1.5, 史詩: 2, 傳說: 3 }

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
}

const monsters = [
  { name: "史萊姆", hp: 40, atk: 5, img: "assets/monsters/slime.png" },
  { name: "火焰精靈", hp: 60, atk: 8, img: "assets/monsters/fire.png" }
]

let monster = null

/* ====== 計算最終能力 ====== */
function stats() {
  const m = rarityMul[player.weapon.rarity]
  return {
    atk: Math.floor(player.base.atk + player.weapon.atk * m),
    maxhp: Math.floor(player.base.hp + player.weapon.hp * m),
    maxmp: Math.floor(player.base.mp + player.weapon.mp * m)
  }
}

/* ====== UI 更新 ====== */
function ui() {
  const s = stats()
  player.hp = Math.min(player.hp, s.maxhp)
  player.mp = Math.min(player.mp, s.maxmp)

  $("player-name").innerText = `${player.name} Lv.${player.lv}`
  $("player-stats").innerText =
    `ATK ${s.atk}\nHP ${player.hp}/${s.maxhp}\nMP ${player.mp}/${s.maxmp}`

  $("player-weapon-img").src = player.weapon.img

  if (monster) {
    $("monster-hp").innerText = `HP ${monster.hp}`
  }
}

/* ====== 戰鬥訊息 ====== */
function logMsg(text) {
  $("log").innerHTML += text + "<br>"
  $("log").scrollTop = $("log").scrollHeight
}

/* ====== 開始戰鬥 ====== */
function start() {
  monster = JSON.parse(JSON.stringify(
    monsters[Math.floor(Math.random() * monsters.length)]
  ))

  $("battle").style.display = "block"
  $("monster-name").innerText = monster.name
  $("monster-img").src = monster.img
  $("log").innerHTML = ""

  logMsg(`⚔️ 遭遇 ${monster.name}！`)
  ui()
}

/* ====== 怪物反擊 ====== */
function enemyAttack() {
  if (!monster || monster.hp <= 0) return

  player.hp -= monster.atk
  logMsg(`👿 ${monster.name} 攻擊你，造成 ${monster.atk} 傷害`)

  if (player.hp <= 0) {
    player.hp = 0
    logMsg("💀 你被擊倒了……")
  }

  ui()
}

/* ====== 玩家行動 ====== */
function attack() {
  if (!monster) return

  const dmg = stats().atk
  monster.hp -= dmg
  logMsg(`🗡️ 你造成 ${dmg} 傷害`)

  monster.hp > 0 ? enemyAttack() : logMsg("🎉 勝利！")
  ui()
}

function fire() {
  if (!monster || player.mp < 5) {
    logMsg("❌ MP 不足")
    return
  }

  player.mp -= 5
  monster.hp -= 20
  logMsg("🔥 火球術造成 20 傷害")

  monster.hp > 0 ? enemyAttack() : logMsg("🎉 勝利！")
  ui()
}

function heal() {
  if (player.mp < 5) {
    logMsg("❌ MP 不足")
    return
  }

  player.mp -= 5
  player.hp += 25
  logMsg("✨ 治癒 +25 HP")
  ui()
}

/* ====== 事件綁定 ====== */
$("btn-start").onclick = start
$("btn-attack").onclick = attack
$("btn-fire").onclick = fire
$("btn-heal").onclick = heal
$("btn-save").onclick = () => {
  localStorage.setItem("save", JSON.stringify(player))
  logMsg("💾 已存檔")
}

/* ====== 讀檔 ====== */
const save = localStorage.getItem("save")
if (save) {
  player = JSON.parse(save)
}

ui()
