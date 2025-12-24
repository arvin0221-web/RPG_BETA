/*************************************************
 * pet.js - 完整寵物系統
 * 包含：
 * 1. 憨鵝
 * 2. 甲魚
 * 3. 沛沛豬
 * 4. 傻碧
 * 支援解鎖、升級、裝備、戰鬥增益
 *************************************************/

// ====== 寵物資料 ======
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

// ====== 創建寵物面板 ======
const petPanel = document.createElement("div");
petPanel.id = "pet-panel";
petPanel.style.display = "none";
petPanel.style.position = "absolute";
petPanel.style.top = "0px";
petPanel.style.left = "0";
petPanel.style.width = "100%";
petPanel.style.zIndex = "500";
petPanel.style.backgroundImage = "linear-gradient(to right, #ff7e5f, #feb47b)";
petPanel.style.padding = "10px";
petPanel.style.boxSizing = "border-box";
petPanel.style.color = "#fff";
petPanel.innerHTML = `<h3>寵物</h3><div id="pet-list"></div><button id="btn-close-pet">關閉</button>`;
document.body.appendChild(petPanel);

// 關閉按鈕
document.getElementById("btn-close-pet").onclick = () => { petPanel.style.display = "none"; };

// ====== 增加寵物按鈕到主頁 ======
const btnPet = document.createElement("button");
btnPet.id = "btn-pet";
btnPet.innerText = "寵物";
document.querySelector(".card").appendChild(btnPet);

// 打開寵物面板
btnPet.onclick = () => {
  updatePetPanel();
  petPanel.style.display = "block";
};

// ====== 更新寵物面板 ======
function updatePetPanel() {
  const listDiv = document.getElementById("pet-list");
  listDiv.innerHTML = "";
  pets.forEach((p, i) => {
    const div = document.createElement("div");
    let html = `<strong>${p.name}</strong> Lv.${p.level} - `;

    if (p.name === "憨鵝") {
      html += `效果: 每回合恢復 ${(p.hpRecoverPct[p.level-1]*100).toFixed(1)}% HP<br>`;
    } else if (p.name === "甲魚") {
      html += `效果: 每回合閃避敵人攻擊 ${(p.evadePct[p.level-1]*100).toFixed(1)}%<br>`;
    } else if (p.name === "沛沛豬") {
      html += `效果: 每回合使敵人損失 ${(p.enemyDmgPct[p.level-1]*100).toFixed(1)}% HP<br>`;
    } else if (p.name === "傻碧") {
      html += `效果: 每回合對玩家造成 ${p.hurtPlayer[p.level-1]} 傷害，對敵人造成 ${p.hurtEnemy[p.level-1]} 傷害<br>`;
    }

    if (!p.unlocked) {
      html += `解鎖金額: ${p.goldCost} <button onclick="unlockPet(${i})">解鎖</button>`;
    } else if (p.level < p.maxLevel) {
      html += `升級金額: ${p.upgradeCost[p.level-1]} <button onclick="upgradePet(${i})">升級</button>`;
    } else {
      html += `已達最大等級<br>`;
    }

    if (p.unlocked) {
      html += `<button onclick="equipPet(${i})">裝備</button>`;
    }

    div.innerHTML = html;
    div.style.marginBottom = "10px";
    listDiv.appendChild(div);
  });
}

// ====== 解鎖寵物 ======
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

// ====== 升級寵物 ======
function upgradePet(i) {
  const p = pets[i];
  const cost = p.upgradeCost[p.level-1];
  if (player.gold < cost) {
    showGlobalTip("💰 金幣不足，無法升級寵物", 2000);
    return;
  }
  player.gold -= cost;
  p.level++;
  showGlobalTip(`${p.name} 升級到 Lv.${p.level}`, 2000);
  updateUI();
  updatePetPanel();
}

// ====== 裝備寵物 ======
function equipPet(i) {
  activePet = pets[i];
  showGlobalTip(`你已裝備寵物 ${activePet.name}`, 2000);
  updatePetPanel();
}

// ====== 每回合戰鬥增益覆寫 playerAttack ======
const _origPlayerAttack = playerAttack;
playerAttack = function(mult = 1) {
  _origPlayerAttack(mult);

  if (activePet) {
    const s = calcStats();

    if (activePet.name === "憨鵝") {
      const recover = Math.floor(s.maxhp * activePet.hpRecoverPct[activePet.level-1]);
      player.hp = clamp(player.hp + recover, 0, s.maxhp);
      logBattle(`💚 ${activePet.name}幫你回復 ${recover} HP`);
    }

    if (activePet.name === "甲魚") {
      // 判斷是否閃避敵人攻擊
      const evadeChance = activePet.evadePct[activePet.level-1];
      const origEnemyAttack = enemyAttack;
      enemyAttack = function() {
        if (Math.random() < evadeChance) {
          logBattle(`🛡 ${activePet.name}幫助你躲避了此次攻擊`);
        } else {
          origEnemyAttack();
        }
        // 恢復原函式，避免覆蓋影響下回合
        enemyAttack = origEnemyAttack;
      };
    }

    if (activePet.name === "沛沛豬") {
      if (monster) {
        const dmg = Math.floor(monster.maxHp * activePet.enemyDmgPct[activePet.level-1]);
        monster.hp = Math.max(0, monster.hp - dmg);
        const msgs = [
          `沛沛豬用肚子頂 ${monster.name}，造成了 ${dmg} 傷害`,
          `沛沛豬跌倒了，撞到 ${monster.name}，造成了 ${dmg} 傷害`,
          `沛沛豬對 ${monster.name} 吐口水，造成了 ${dmg} 傷害`
        ];
        logBattle(rand(msgs));
      }
    }

    if (activePet.name === "傻碧") {
  if (monster) {
    // 傷害敵人
    const dmgEnemy = activePet.hurtEnemy[activePet.level-1];
    monster.hp = Math.max(0, monster.hp - dmgEnemy);
    logBattle(`💥 ${activePet.name} 對 ${monster.name} 造成 ${dmgEnemy} 傷害`);

    // 傷害玩家
    const dmgPlayer = activePet.hurtPlayer[activePet.level-1];
    player.hp = clamp(player.hp - dmgPlayer, 0, s.maxhp);
    logBattle(`💀 ${activePet.name} 對玩家造成 ${dmgPlayer} 傷害`);
  }
}

      }
    }

  }

  updateUI();
};
