/*************************************************
 * vip.js - 特權加成系統（EXP / Gold ×50）
 *************************************************/
(function() {
  const VIP_NAME = "3x-27y=5π";
  const MULTIPLIER = 50;

  // 如果是 VIP 玩家，直接修改怪物屬性
  if (player.name === VIP_NAME) {
    monster.expGain *= MULTIPLIER;
    monster.gold *= MULTIPLIER;
  }

})();
(function() {
  const VIP_NAMEE = "菜菜";
  const MULTIPLIERR = 10;

  // 如果是 VIP 玩家，直接修改怪物屬性
  if (player.name === VIP_NAMEE) {
    monster.expGain *= MULTIPLIERR;
    monster.gold *= MULTIPLIERR;
  }

})();
