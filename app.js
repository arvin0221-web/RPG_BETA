/* ========= 資料表 ========= */

const rarityTable = [
  { name:"普通", mul:1 },
  { name:"精良", mul:1.3 },
  { name:"稀有", mul:1.6 },
  { name:"史詩", mul:2.0 },
  { name:"傳說", mul:2.6 },
];

const wandDB = [
  { name:"木杖", lv:1,  price:50,   base:{hp:0, mp:10, atk:3, crit:0.01, critDmg:0.1}},
  { name:"鐵杖", lv:5,  price:120,  base:{hp:10, mp:20, atk:6, crit:0.015, critDmg:0.15}},
  { name:"古木杖", lv:10, price:300, base:{hp:30, mp:40, atk:12, crit:0.02, critDmg:0.2}},
  { name:"合金法杖", lv:20, price:800, base:{hp:60, mp:80, atk:25, crit:0.03, critDmg:0.3}},
  { name:"神木杖", lv:30, price:2000, base:{hp:120, mp:150, atk:45, crit:0.04, critDmg:0.4}},
  { name:"帝之權杖", lv:40, price:5000, base:{hp:200, mp:240, atk:70, crit:0.05, critDmg:0.5}},
  { name:"神之權杖", lv:50, price:12000, base:{hp:300, mp:350, atk:100, crit:0.06, critDmg:0.6}},
  { name:"神王法杖", lv:60, price:25000, base:{hp:450, mp:500, atk:140, crit:0.07, critDmg:0.7}},
  { name:"無極法杖", lv:70, price:50000, base:{hp:650, mp:700, atk:190, crit:0.08, critDmg:0.8}},
  { name:"葬神之權杖", lv:80, price:100000, base:{hp:900, mp:900, atk:260, crit:0.1, critDmg:1.0}},
];

/* ========= 玩家 ========= */

let player = JSON.parse(localStorage.getItem("player")) || {
  lv:1, exp:0, gold:200,
  hp:100, maxHp:100,
  mp:30, maxMp:30,
  atk:5,
  crit:0.01,
  critDmg:1.2,
  wand:null,
  wands:[]
};

let monster=null;

/* ========= UI ========= */

const el = id => document.getElementById(id);

function tip(t,sec=2){
  el("tip").textContent=t;
  setTimeout(()=>el("tip").textContent="",sec*1000);
}

function updatePlayer(){
  el("player").textContent=
`Lv.${player.lv} EXP:${player.exp}
Gold:${player.gold}

HP ${player.hp}/${player.maxHp}
MP ${player.mp}/${player.maxMp}
ATK ${player.atk}
Crit ${(player.crit*100).toFixed(1)}%
CritDmg ${(player.critDmg*100).toFixed(0)}%

裝備：${player.wand ? player.wand.name+"【"+player.wand.rarity+"】":"無"}`;
}

/* ========= 杖系統 ========= */

function equipWand(w){
  player.wand=w;
  player.maxHp=100+w.bonus.hp;
  player.maxMp=30+w.bonus.mp;
  player.atk=5+w.bonus.atk;
  player.crit=0.01+w.bonus.crit;
  player.critDmg=1.2+w.bonus.critDmg;
  player.hp=player.maxHp;
  player.mp=player.maxMp;
  updatePlayer();
}

function renderWandBag(){
  el("wand-list").innerHTML="";
  player.wands.forEach((w,i)=>{
    let btn=document.createElement("button");
    btn.textContent=
`${w.name}【${w.rarity}】 Lv.${w.lv}
${player.wand===w?"（已裝備）":"裝備"}`;
    btn.onclick=()=>equipWand(w);
    el("wand-list").appendChild(btn);
    el("wand-list").appendChild(document.createElement("br"));
  });
}

/* ========= 商店 ========= */

function renderShop(){
  el("shop-list").innerHTML="";
  wandDB.forEach(base=>{
    let div=document.createElement("div");
    let canBuy=player.lv>=base.lv;
    div.textContent=
`${base.name}（Lv.${base.lv}） 價格 ${base.price}
`;
    if(canBuy){
      let b=document.createElement("button");
      b.textContent="購買";
      b.onclick=()=>buyWand(base);
      div.appendChild(b);
    }else{
      div.append("（等級不足）");
    }
    el("shop-list").appendChild(div);
  });
}

function buyWand(base){
  let r=rarityTable[Math.floor(Math.random()*rarityTable.length)];
  let price=Math.floor(base.price*r.mul);
  if(player.gold<price){ tip("金幣不足"); return; }

  player.gold-=price;
  let w={
    name:base.name,
    lv:base.lv,
    rarity:r.name,
    bonus:Object.fromEntries(
      Object.entries(base.base).map(([k,v])=>[k,v*r.mul])
    )
  };
  player.wands.push(w);
  tip(`你獲得了 ${w.name}（${w.rarity}）`);
  renderWandBag();
  updatePlayer();
}

/* ========= 戰鬥 ========= */

el("btn-start").onclick=()=>{
  monster={
    lv:Math.min(player.lv+4,player.lv+Math.floor(Math.random()*5)),
    hp:60+player.lv*25,
    atk:8+player.lv*6
  };
  el("battle").style.display="block";
  el("monster").textContent=`怪物 Lv.${monster.lv}`;
  el("monster-hp").textContent=`HP ${monster.hp}`;
};

function attack(trigger=true){
  let dmg=player.atk;
  if(Math.random()<player.crit){
    dmg=Math.floor(dmg*player.critDmg);
    el("log").textContent+="爆擊！\n";
  }
  monster.hp-=dmg;
  el("log").textContent+=`造成 ${dmg}\n`;

  if(monster.hp<=0){
    player.gold+=monster.lv*20;
    player.exp+=monster.lv*10;
    player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.2);
    player.mp=Math.min(player.maxMp,player.mp+player.maxMp*0.2);
    tip("怪物被擊敗");
    return;
  }

  if(trigger){
    player.hp-=monster.atk;
    el("log").textContent+=`怪物反擊 ${monster.atk}\n`;
  }

  el("monster-hp").textContent=`HP ${monster.hp}`;
  updatePlayer();
}

el("atk").onclick=()=>attack();
el("fire").onclick=()=>{ if(player.mp>=5){player.mp-=5;attack();} };
el("heal").onclick=()=>{
  if(player.mp>=5){
    player.mp-=5;
    player.hp=Math.min(player.maxHp,player.hp+30);
    updatePlayer();
  }
};

/* ========= 面板切換 ========= */

el("btn-wand").onclick=()=>{
  el("wand-panel").style.display="block";
  el("shop-panel").style.display="none";
  renderWandBag();
};

el("btn-shop").onclick=()=>{
  el("shop-panel").style.display="block";
  el("wand-panel").style.display="none";
  renderShop();
};

el("btn-save").onclick=()=>{
  localStorage.setItem("player",JSON.stringify(player));
  tip("已存檔");
};

updatePlayer();
