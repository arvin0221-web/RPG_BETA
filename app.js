const rarityMul={普通:1,稀有:1.5,史詩:2,傳說:3}
let player={name:"冒險者",base:{atk:10,hp:100,mp:30},hp:100,mp:30,lv:1,weapon:{name:"初心之杖",rarity:"普通",atk:2,hp:10,mp:5,img:"assets/weapons/wand_common.png"}}
const monsters=[{name:"史萊姆",hp:40,atk:5,img:"assets/monsters/slime.png"},{name:"火焰精靈",hp:60,atk:8,img:"assets/monsters/fire.png"}]
let monster=null
function stats(){let m=rarityMul[player.weapon.rarity];return{atk:player.base.atk+player.weapon.atk*m,maxhp:player.base.hp+player.weapon.hp*m,maxmp:player.base.mp+player.weapon.mp*m}}
function ui(){let s=stats();player.hp=Math.min(player.hp,s.maxhp);player.mp=Math.min(player.mp,s.maxmp);player-name.innerText=`${player.name} Lv.${player.lv}`;player-stats.innerText=`ATK ${s.atk}\nHP ${player.hp}/${s.maxhp}\nMP ${player.mp}/${s.maxmp}`;player-weapon-img.src=player.weapon.img;if(monster)monster-hp.innerText=`HP ${monster.hp}`}
function log(t){log.innerHTML+=t+"<br>"}
function start(){monster=JSON.parse(JSON.stringify(monsters[Math.floor(Math.random()*monsters.length)]));battle.style.display="block";monster-name.innerText=monster.name;monster-img.src=monster.img;log.innerHTML="";ui()}
function enemy(){player.hp-=monster.atk;ui()}
function atk(){monster.hp-=stats().atk;monster.hp>0?enemy():log("勝利");ui()}
function fire(){if(player.mp<5)return;player.mp-=5;monster.hp-=20;monster.hp>0?enemy():log("勝利");ui()}
function heal(){if(player.mp<5)return;player.mp-=5;player.hp+=25;ui()}
btn-start.onclick=start;btn-attack.onclick=atk;btn-fire.onclick=fire;btn-heal.onclick=heal;btn-save.onclick=()=>localStorage.setItem("save",JSON.stringify(player));
let s=localStorage.getItem("save");if(s)player=JSON.parse(s);ui();