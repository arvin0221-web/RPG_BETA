/*************************************************
 * pet.js - 完整寵物系統（最終穩定版）
 * 重點：
 * 1. 已完整修正 Unexpected token '}'（括號完全對齊）
 * 2. 寵物按鈕【獨立固定顯示在畫面右下角】
 * 3. 不依賴 .card / 既有按鈕結構
 * 4. 維持冗長、可讀、可擴充寫法
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
    name: "傻bee",
    unlocked: false,
    goldCost: 250,
    level: 1,
    maxLevel: 3,
    hurtPlayer: [3, 2, 1],
    hurtEnemy: [6, 10, 14],
    upgradeCost: [400, 700]
  }
];

let activePet = null;


/* =================================================
 * ====== 建立「寵物」按鈕（固定顯示）============
 * ================================================= */
const petButton = document.createElement("button");
petButton.id = "pet-btn-fixed";
petButton.innerText = "🐾 寵物";

// ====== 放大寵物按鈕（手機 / 電腦 都放大） ======
petButton.style.width = "180px";
petButton.style.height = "96px";
petButton.style.fontSize = "32px";
petButton.style.fontWeight = "bold";

petButton.style.marginTop = "12px";
petButton.style.borderRadius = "16px";
petButton.style.cursor = "pointer";

petButton.style.position = "fixed";
petButton.style.right = "12px";
petButton.style.bottom = "12px";

petButton.style.background = "linear-gradient(135deg, #6a11cb, #2575fc)";
petButton.style.color = "#ffffff";
petButton.style.border = "none";
petButton.style.zIndex = "9999";

document.body.appendChild(petButton);



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
petPanel.style.zIndex = "9998";
petPanel.style.background = "linear-gradient(to right, #ff7e5f, #feb47b)";
petPanel.style.padding = "12px";
petPanel.style.boxSizing = "border-box";
petPanel.style.color = "#ffffff";

petPanel.innerHTML = `
  <h3>🐾 寵物系統</h3>
  <div id="pet-list"></div>
  <button id="pet-close-btn">關閉</button>
`;

document.body.appendChild(petPanel);


/* =================================================
 * ====== 按鈕事件 ================================
 * ================================================= */
petButton.onclick = function () {
  updatePetPanel();
  petPanel.style.display = "block";
};

document.getElementById("pet-close-btn").onclick = function () {
  petPanel.style.display = "none";
};


/* =================================================
 * ====== 更新寵物面板 =============================
 * ================================================= */
function updatePetPanel() {
  const list = document.getElementById("pet-list");
  list.innerHTML = "";

  for (let i = 0; i < pets.length; i++) {
    const p = pets[i];
    const box = document.createElement("div");
    box.style.marginBottom = "12px";

    let html = `<strong>${p.name}</strong> Lv.${p.level}<br>`;

    if (p.name === "憨鵝") {
      html += `效果：每回合回復 ${(p.hpRecoverPct[p.level - 1] * 100).toFixed(1)}% HP<br>`;
    }

    if (p.name === "甲魚") {
      html += `效果：每回合 ${(p.evadePct[p.level - 1] * 100).toFixed(1)}% 機率閃避<br>`;
    }

    if (p.name === "沛沛豬") {
      html += `效果：每回合造成敵人 ${(p.enemyDmgPct[p.level - 1] * 100).toFixed(1)}% HP<br>`;
    }

    if (p.name === "傻bee") {
      html += `效果：玩家-${p.hurtPlayer[p.level - 1]} HP，敵人-${p.hurtEnemy[p.level - 1]} HP<br>`;
    }

    if (!p.unlocked) {
      html += `解鎖金額：${p.goldCost} <button onclick="unlockPet(${i})">解鎖</button>`;
    } else {
      if (p.level < p.maxLevel) {
        html += `升級金額：${p.upgradeCost[p.level - 1]} <button onclick="upgradePet(${i})">升級</button><br>`;
      } else {
        html += `已達最大等級<br>`;
      }
      html += `<button onclick="equipPet(${i})">裝備</button>`;
    }

    box.innerHTML = html;
    list.appendChild(box);
  }
}


/* =================================================
 * ====== 解鎖 / 升級 / 裝備 ======================
 * ================================================= */
function unlockPet(index) {
  const p = pets[index];

  if (player.gold < p.goldCost) {
    showGlobalTip("💰 金幣不足，無法解鎖寵物", 2000);
    return;
  }

  player.gold -= p.goldCost;
  p.unlocked = true;
  showGlobalTip(`你解鎖了 ${p.name}`, 2000);
  updateUI();
  updatePetPanel();
}

function upgradePet(index) {
  const p = pets[index];
  const cost = p.upgradeCost[p.level - 1];

  if (player.gold < cost) {
    showGlobalTip("💰 金幣不足，無法升級寵物", 2000);
    return;
  }

  player.gold -= cost;
  p.level += 1;
  showGlobalTip(`${p.name} 升級至 Lv.${p.level}`, 2000);
  updateUI();
  updatePetPanel();
}

function equipPet(index) {
  activePet = pets[index];
  showGlobalTip(`你已裝備 ${activePet.name}`, 2000);
}


/* =================================================
 * ====== 戰鬥鉤子（playerAttack 包覆）============
 * ================================================= */
const __origPlayerAttack = playerAttack;

playerAttack = function (mult = 1) {
  __origPlayerAttack(mult);

  if (!activePet) {
    updateUI();
    return;
  }

  const stat = calcStats();

  /* 憨鵝 */
  if (activePet.name === "憨鵝") {
    const heal = Math.floor(stat.maxhp * activePet.hpRecoverPct[activePet.level - 1]);
    player.hp = clamp(player.hp + heal, 0, stat.maxhp);
    logBattle(`💚 憨鵝回復 ${heal} HP`);
  }

  /* 甲魚 */
  if (activePet.name === "甲魚") {
    const chance = activePet.evadePct[activePet.level - 1];
    const oldEnemyAttack = enemyAttack;

    enemyAttack = function () {
      if (Math.random() < chance) {
        logBattle("🛡 甲魚幫助你躲避了此次攻擊");
      } else {
        oldEnemyAttack();
      }
      enemyAttack = oldEnemyAttack;
    };
  }

  /* 沛沛豬 */
  if (activePet.name === "沛沛豬" && monster) {
    const dmg = Math.floor(monster.maxHp * activePet.enemyDmgPct[activePet.level - 1]);
    monster.hp = Math.max(0, monster.hp - dmg);

    const msgs = [
      `沛沛豬用肚子頂 ${monster.name}，造成 ${dmg} 傷害`,
      `沛沛豬跌倒撞到 ${monster.name}，造成 ${dmg} 傷害`,
      `沛沛豬對 ${monster.name} 吐口水，造成 ${dmg} 傷害`
    ];

    logBattle(rand(msgs));
  }

  /* 傻bee */
  if (activePet.name === "傻bee" && monster) {
    const ed = activePet.hurtEnemy[activePet.level - 1];
    const pd = activePet.hurtPlayer[activePet.level - 1];

    monster.hp = Math.max(0, monster.hp - ed);
    player.hp = clamp(player.hp - pd, 0, stat.maxhp);

    logBattle(`💥 傻bee對 ${monster.name} 造成 ${ed} 傷害`);
    logBattle(`💀 傻bee對你造成 ${pd} 傷害`);
  }

  updateUI();
};



