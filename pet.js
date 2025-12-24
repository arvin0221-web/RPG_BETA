/*************************************************
 * pet.js - 完整寵物系統（修正版）
 * 修正內容：
 * 1. 修正括號錯誤（Unexpected token '}'）
 * 2. 確保「寵物」按鈕一定會顯示（即使 .card 不存在）
 * 3. 保留你既有的設計邏輯與寫法（不精簡、偏冗長）
 *************************************************/


/* =================================================
 * ====== 寵物資料定義 =============================
 * ================================================= */
let pets = [
  {
    name: "憨鵝",
    unlocked: false,
    goldCost: 2500,
    level: 1,
    maxLevel: 3,
    hpRecoverPct: [0.03, 0.04, 0.05],
    upgradeCost: [4000, 7000]
  },
  {
    name: "甲魚",
    unlocked: false,
    goldCost: 2500,
    level: 1,
    maxLevel: 3,
    evadePct: [0.13, 0.16, 0.20],
    upgradeCost: [4000, 7000]
  },
  {
    name: "沛沛豬",
    unlocked: false,
    goldCost: 2500,
    level: 1,
    maxLevel: 3,
    enemyDmgPct: [0.03, 0.04, 0.05],
    upgradeCost: [4000, 7000]
  },
  {
    name: "傻碧",
    unlocked: false,
    goldCost: 250,
    level: 1,
    maxLevel: 3,
    hurtPlayer: [3, 2, 1],
    hurtEnemy: [4, 7, 10],
    upgradeCost: [400, 700]
  }
];

let activePet = null;


/* =================================================
 * ====== 建立寵物面板 =============================
 * ================================================= */
const petPanel = document.createElement("div");
petPanel.id = "pet-panel";
petPanel.style.display = "none";
petPanel.style.position = "fixed";
petPanel.style.top = "0";
petPanel.style.left = "0";
petPanel.style.width = "100%";
petPanel.style.zIndex = "999";
petPanel.style.backgroundImage = "linear-gradient(to right, #ff7e5f, #feb47b)";
petPanel.style.padding = "12px";
petPanel.style.boxSizing = "border-box";
petPanel.style.color = "#fff";

petPanel.innerHTML = `
  <h3>🐾 寵物</h3>
  <div id="pet-list"></div>
  <button id="btn-close-pet">關閉</button>
`;

document.body.appendChild(petPanel);

/* 關閉按鈕 */
document.getElementById("btn-close-pet").onclick = function () {
  petPanel.style.display = "none";
};


/* =================================================
 * ====== 建立「寵物」按鈕（保證顯示）=============
 * ================================================= */
const btnPet = document.createElement("button");
btnPet.id = "btn-pet";
btnPet.innerText = "寵物";

/* 若 .card 不存在，直接加在 body */
const card = document.querySelector(".card");
if (card) {
  card.appendChild(btnPet);
} else {
  btnPet.style.position = "fixed";
  btnPet.style.bottom = "10px";
  btnPet.style.right = "10px";
  btnPet.style.zIndex = "1000";
  document.body.appendChild(btnPet);
}

/* 點擊打開寵物面板 */
btnPet.onclick = function () {
  updatePetPanel();
  petPanel.style.display = "block";
};


/* =================================================
 * ====== 更新寵物面板 =============================
 * ================================================= */
function updatePetPanel() {
  const listDiv = document.getElementById("pet-list");
  listDiv.innerHTML = "";

  pets.forEach(function (p, i) {
    const div = document.createElement("div");
    div.style.marginBottom = "12px";

    let html = `<strong>${p.name}</strong> Lv.${p.level}<br>`;

    if (p.name === "憨鵝") {
      html += `效果：每回合回復 ${(p.hpRecoverPct[p.level - 1] * 100).toFixed(1)}% HP<br>`;
    }

    if (p.name === "甲魚") {
      html += `效果：每回合有 ${(p.evadePct[p.level - 1] * 100).toFixed(1)}% 機率閃避攻擊<br>`;
    }

    if (p.name === "沛沛豬") {
      html += `效果：每回合造成敵人 ${(p.enemyDmgPct[p.level - 1] * 100).toFixed(1)}% HP 傷害<br>`;
    }

    if (p.name === "傻碧") {
      html += `效果：每回合對玩家 ${p.hurtPlayer[p.level - 1]} 傷害，敵人 ${p.hurtEnemy[p.level - 1]} 傷害<br>`;
    }

    if (!p.unlocked) {
      html += `解鎖金額：${p.goldCost} <button onclick="unlockPet(${i})">解鎖</button><br>`;
    } else {
      if (p.level < p.maxLevel) {
        html += `升級金額：${p.upgradeCost[p.level - 1]} <button onclick="upgradePet(${i})">升級</button><br>`;
      } else {
        html += `已達最大等級<br>`;
      }
      html += `<button onclick="equipPet(${i})">裝備</button>`;
    }

    div.innerHTML = html;
    listDiv.appendChild(div);
  });
}


/* =================================================
 * ====== 解鎖寵物 ================================
 * ================================================= */
function unlockPet(i) {
  const p = pets[i];

  if (player.gold < p.goldCost) {
    showGlobalTip("💰 金幣不足，無法解鎖寵物", 2000);
    return;
  }

  player.gold -= p.goldCost;
  p.unlocked = true;

  showGlobalTip(`你解鎖了寵物 ${p.name}`, 2000);
  updateUI();
  updatePetPanel();
}


/* =================================================
 * ====== 升級寵物 ================================
 * ================================================= */
function upgradePet(i) {
  const p = pets[i];
  const cost = p.upgradeCost[p.level - 1];

  if (player.gold < cost) {
    showGlobalTip("💰 金幣不足，無法升級寵物", 2000);
    return;
  }

  player.gold -= cost;
  p.level += 1;

  showGlobalTip(`${p.name} 升級到 Lv.${p.level}`, 2000);
  updateUI();
  updatePetPanel();
}


/* =================================================
 * ====== 裝備寵物 ================================
 * ================================================= */
function equipPet(i) {
  activePet = pets[i];
  showGlobalTip(`你已裝備寵物 ${activePet.name}`, 2000);
  updatePetPanel();
}


/* =================================================
 * ====== 戰鬥鉤子（包覆 playerAttack）============
 * ================================================= */
const _origPlayerAttack = playerAttack;

playerAttack = function (mult = 1) {
  _origPlayerAttack(mult);

  if (!activePet) {
    updateUI();
    return;
  }

  const stats = calcStats();

  /* ===== 憨鵝 ===== */
  if (activePet.name === "憨鵝") {
    const heal = Math.floor(stats.maxhp * activePet.hpRecoverPct[activePet.level - 1]);
    player.hp = clamp(player.hp + heal, 0, stats.maxhp);
    logBattle(`💚 憨鵝幫你回復 ${heal} HP`);
  }

  /* ===== 甲魚 ===== */
  if (activePet.name === "甲魚") {
    const evadeChance = activePet.evadePct[activePet.level - 1];
    const originalEnemyAttack = enemyAttack;

    enemyAttack = function () {
      if (Math.random() < evadeChance) {
        logBattle("🛡 甲魚幫助你躲避了此次攻擊");
      } else {
        originalEnemyAttack();
      }
      enemyAttack = originalEnemyAttack;
    };
  }

  /* ===== 沛沛豬 ===== */
  if (activePet.name === "沛沛豬" && monster) {
    const dmg = Math.floor(monster.maxHp * activePet.enemyDmgPct[activePet.level - 1]);
    monster.hp = Math.max(0, monster.hp - dmg);

    const msgs = [
      `沛沛豬用肚子頂 ${monster.name}，造成了 ${dmg} 傷害`,
      `沛沛豬跌倒了，撞到 ${monster.name}，造成了 ${dmg} 傷害`,
      `沛沛豬對 ${monster.name} 吐口水，造成了 ${dmg} 傷害`
    ];

    logBattle(rand(msgs));
  }

  /* ===== 傻碧 ===== */
  if (activePet.name === "傻碧" && monster) {
    const dmgEnemy = activePet.hurtEnemy[activePet.level - 1];
    monster.hp = Math.max(0, monster.hp - dmgEnemy);
    logBattle(`💥 傻碧對 ${monster.name} 造成 ${dmgEnemy} 傷害`);

    const dmgPlayer = activePet.hurtPlayer[activePet.level - 1];
    player.hp = clamp(player.hp - dmgPlayer, 0, stats.maxhp);
    logBattle(`💀 傻碧對你造成 ${dmgPlayer} 傷害`);
  }

  updateUI();
};
