const rarityMul = { 普通: 1, 稀有: 1.5, 史詩: 2, 傳說: 3 }

let player = {
  name: "冒險者",
  lv: 1,
  exp: 0,
  nextExp: 50,
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
}

const monsters = [
  { name: "史萊姆", hp: 40, atk: 5, exp: 20, img: "assets/monsters/slime.png" },
  { name: "火焰精靈", hp: 60, atk: 8, exp: 30, img: "assets/monsters/fire.png" }
]

let monster = null
let inBattle = false
let tipTimer = null

const $ = id => document.getElementById(id)

function showTip(text) {
  $("tip").innerText = text
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => $("tip").innerText = "", 2000)
}

function stats() {
  const m = rarityMul[player.weapon.rarity]
  return {
    atk: Math.floor(player.base.atk + player.weapon.atk * m),
    maxhp: Math.floor(player.base.hp + player.weapon.hp * m),
    maxmp: Math.floor(player.base.mp + player.weapon.mp * m)
  }
}

function logMsg(t) {
  $("log").innerHTML += t + "<br>"
  $("log").scrollTop = $("log").scrollHeight
}

function ui() {
  const s = stats()
  player.hp = Math.min(player.hp, s.maxhp)
  player.mp = Math.min(player.mp, s.maxmp)

  $("player-name").innerText = `${player.name} Lv.${player.lv}`
  $("player-stats").innerText =
    `ATK ${s.atk}\n` +
    `HP ${player.hp}/${s.maxhp}\n` +
    `MP ${player.mp}/${s.maxmp}\n` +
    `EXP ${player.exp}/${player.nextExp}`

  $("player-weapon-img").src = player.weapon.img

  if (monster) {
    $("monster-hp").innerText = `HP ${Math.max(0, monster.hp)}`
  }
}

function start() {
  if (inBattle) {
    showTip("對戰進行中")
    return
  }

  monster = JSON.parse(JSON.stringify(
    monsters[Math.floor(Math.random() * monsters.length)]
  ))
  inBattle = true
  $("battle").style.display = "block"
  $("monster-name").innerText = monster.name
  $("monster-img").src = monster.img
  $("log").innerHTML = ""
  logMsg(`⚔️ 遭遇 ${monster.name}！`)
  ui()
}

function enemyAttack() {
  if (!inBattle) return
  player.hp -= monster.atk
  logMsg(`😈 ${monster.name} 攻擊你，造成 ${monster.atk} 傷害`)
  if (player.hp <= 0) {
    player.hp = 0
    inBattle = false
    logMsg("💀 你倒下了……")
  }
  ui()
}

function gainExp(exp) {
  player.exp += exp
  while (player.exp >= player.nextExp) {
    player.exp -= player.nextExp
    player.lv++
    player.base.atk += 2
    player.base.hp += 10
    player.base.mp += 5
    player.nextExp = Math.floor(50 * Math.pow(1.6, player.lv - 1))
    logMsg(`🎉 升級至 Lv.${player.lv}`)
  }
}

function recoverAfterWin() {
  const s = stats()
  const hpRec = Math.floor(s.maxhp * 0.2)
  const mpRec = Math.floor(s.maxmp * 0.2)
  player.hp += hpRec
  player.mp += mpRec
  logMsg(`✨ 回復 ${hpRec} HP、${mpRec} MP`)
}

function win() {
  inBattle = false
  logMsg("🎉 勝利！")
  gainExp(monster.exp)
  recoverAfterWin()
  ui()
}

function attack() {
  if (!inBattle) return
  const dmg = stats().atk
  monster.hp -= dmg
  logMsg(`🗡️ 你造成 ${dmg} 傷害`)
  monster.hp <= 0 ? win() : enemyAttack()
  ui()
}

function fire() {
  if (!inBattle || player.mp < 5) return
  player.mp -= 5
  monster.hp -= 20
  logMsg("🔥 火球術造成 20 傷害")
  monster.hp <= 0 ? win() : enemyAttack()
  ui()
}

function heal() {
  if (!inBattle || player.mp < 5) return
  player.mp -= 5
  player.hp += 25
  logMsg("✨ 治癒 +25 HP")
  ui()
}

$("btn-start").onclick = start
$("btn-attack").onclick = attack
$("btn-fire").onclick = fire
$("btn-heal").onclick = heal
$("btn-save").onclick = () =>
  localStorage.setItem("save", JSON.stringify(player))

const save = localStorage.getItem("save")
if (save) player = JSON.parse(save)
ui()
