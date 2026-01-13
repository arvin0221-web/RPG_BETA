// boss.js

let isBossBattle = false;
let currentBoss = null;

// BOSS 資料庫
const bossDB = {
  10:   { name: "狂暴石像", hp: 1000, atk: 50, gold: 100, exp: 50 },
  20:   { name: "火焰巨魔", hp: 3000, atk: 120, gold: 300, exp: 120 },
  30:   { name: "暗影巨狼", hp: 6000, atk: 250, gold: 600, exp: 250 },
  50:   { name: "冰霜魔龍", hp: 15000, atk: 600, gold: 1500, exp: 600 },
  100:  { name: "雷霆天神", hp: 50000, atk: 2000, gold: 5000, exp: 2000 },
  200:  { name: "地獄炎帝", hp: 120000, atk: 4500, gold: 12000, exp: 4500 },
  500:  { name: "混沌巨神", hp: 500000, atk: 15000, gold: 50000, exp: 15000 },
  1000: { name: "終焉魔王", hp: 2000000, atk: 50000, gold: 200000, exp: 50000 },
  1500: { name: "暗黑始祖", hp: 5000000, atk: 120000, gold: 500000, exp: 120000 },
  2000: { name: "永恆巨神", hp: 10000000, atk: 250000, gold: 1000000, exp: 250000 },
  3000: { name: "創世魔神", hp: 30000000, atk: 800000, gold: 3000000, exp: 800000 },
  9999: { name: "無限之王", hp: 99999999, atk: 999999, gold: 9999999, exp: 9999999 }
};

// BOSS 等級列表
const bossLevels = Object.keys(bossDB).map(k => parseInt(k));

// 生成挑戰 BOSS 按鈕
const bossBtnContainer = document.createElement("div");
bossBtnContainer.style.marginTop = "12px";
bossBtnContainer.style.display = "flex";
bossBtnContainer.style.flexWrap = "wrap";
bossBtnContainer.style.gap = "6px";

const bossBtn = document.createElement("button");
bossBtn.textContent = "挑戰BOSS";
bossBtn.style.padding = "8px 12px";
bossBtn.style.fontSize = "16px";
bossBtn.style.background = "linear-gradient(135deg,#f44336,#ff7961)";
bossBtn.style.color = "#fff";
bossBtn.style.border = "none";
bossBtn.style.borderRadius = "8px";
bossBtn.style.cursor = "pointer";
bossBtn.style.zIndex = "9999";

// 插入到玩家資訊區塊 btn-start 後面
const startBtn = document.getElementById("btn-start");
startBtn.insertAdjacentElement("afterend", bossBtn);
bossBtn.insertAdjacentElement("afterend", bossBtnContainer);

// 點擊挑戰 BOSS
bossBtn.addEventListener("click", () => {
    if (isEncountering) { // 避免遇怪與 BOSS 同時進行
        alert("正在遇怪中，無法挑戰BOSS！");
        return;
    }

    // 生成等級按鈕
    bossBtnContainer.innerHTML = ""; // 清空
    bossLevels.forEach(lv => {
        const lvBtn = document.createElement("button");
        lvBtn.textContent = lv;
        lvBtn.style.padding = "6px 10px";
        lvBtn.style.fontSize = "14px";
        lvBtn.style.borderRadius = "6px";
        lvBtn.style.border = "1px solid #fff";
        lvBtn.style.background = "#333";
        lvBtn.style.color = "#fff";
        lvBtn.style.cursor = "pointer";
        lvBtn.addEventListener("click", () => startBossBattle(lv));
        bossBtnContainer.appendChild(lvBtn);
    });
});

// 開始 BOSS 戰
function startBossBattle(level){
    const boss = bossDB[level];
    currentBoss = {
        ...boss,
        hp: boss.hp,
        level: level
    };

    isBossBattle = true;

    // 回滿玩家
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    updatePlayerStats();

    // 顯示戰鬥區
    document.getElementById("battle").style.display = "block";
    document.getElementById("monster-name").textContent = `${currentBoss.name} (Lv.${level})`;
    document.getElementById("monster-img").src = "assets/boss.png"; // 可自行換圖片
    document.getElementById("monster-hp").textContent = `HP: ${currentBoss.hp} / ${boss.hp}`;
    document.getElementById("battle-log").innerHTML = `挑戰BOSS ${currentBoss.name}！<br>`;

    // 隱藏等級按鈕
    bossBtnContainer.innerHTML = "";
}

// 包覆 playerAttack 函數，BOSS 戰不觸發寵物
const originalPlayerAttack = playerAttack;
playerAttack = function(type){
    let damage = 0;
    switch(type){
        case "attack":
            damage = player.atk;
            break;
        case "fire":
            damage = player.atk + 20;
            player.mp -= 10;
            break;
        case "heal":
            player.hp = Math.min(player.maxHp, player.hp + 50);
            player.mp -= 8;
            updatePlayerStats();
            logBattle("你使用了治癒術！");
            return;
        case "ultimate":
            damage = player.atk * 3;
            player.mp -= 30;
            break;
        case "megaHeal":
            player.hp = player.maxHp;
            player.mp = player.maxMp;
            logBattle("你使用了神聖大恢復！");
            updatePlayerStats();
            return;
        default:
            damage = player.atk;
    }

    if(isBossBattle){
        currentBoss.hp -= damage;
        logBattle(`你對 BOSS 造成 ${damage} 傷害！`);
        updateBossHp();
        if(currentBoss.hp <= 0){
            logBattle(`你擊敗了 BOSS ${currentBoss.name}！ 獲得 ${currentBoss.gold} 金幣與 ${currentBoss.exp} 經驗！`);
            player.gold += currentBoss.gold;
            player.exp += currentBoss.exp;
            updatePlayerStats();
            endBossBattle();
        } else {
            // BOSS 攻擊玩家
            player.hp -= currentBoss.atk;
            logBattle(`${currentBoss.name} 對你造成 ${currentBoss.atk} 傷害！`);
            updatePlayerStats();
            if(player.hp <=0){
                logBattle("你被 BOSS 擊敗了...");
                endBossBattle();
            }
        }
    } else {
        originalPlayerAttack(type);
    }
};

function updateBossHp(){
    document.getElementById("monster-hp").textContent = `HP: ${currentBoss.hp} / ${bossDB[currentBoss.level].hp}`;
}

function endBossBattle(){
    isBossBattle = false;
    currentBoss = null;
    document.getElementById("battle").style.display = "none";
}
