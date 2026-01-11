/*************************************************
 * vip.js - 特權加成系統（名稱成立後才攔截）
 *************************************************/

(function () {
  if (!window.player) return;

  const VIP_NAME = "3x-27y=5π";
  const MULTIPLIER = 50;

  // 防止重複安裝
  let vipActivated = false;

  function installVipInterceptor() {
    if (vipActivated) return;
    vipActivated = true;

    // ===== EXP 攔截 =====
    let _exp = player.exp;

    Object.defineProperty(player, "exp", {
      get() {
        return _exp;
      },
      set(value) {
        let delta = value - _exp;
        if (delta > 0) delta *= MULTIPLIER;
        _exp += delta;
      }
    });

    // ===== Gold 攔截 =====
    let _gold = player.gold;

    Object.defineProperty(player, "gold", {
      get() {
        return _gold;
      },
      set(value) {
        let delta = value - _gold;
        if (delta > 0) delta *= MULTIPLIER;
        _gold += delta;
      }
    });

    console.log("VIP 已啟用：EXP / Gold x" + MULTIPLIER);
  }

  // === 情況 1：vip.js 載入時名字已經存在 ===
  if (player.name === VIP_NAME) {
    installVipInterceptor();
    return;
  }

  // === 情況 2：名字之後才設定 → 攔截 name ===
  let _name = player.name;

  Object.defineProperty(player, "name", {
    get() {
      return _name;
    },
    set(value) {
      _name = value;

      if (value === VIP_NAME) {
        installVipInterceptor();

        // 🔓 名字任務完成後，解除 name 攔截，恢復單純屬性
        delete player.name;
        player.name = value;
      }
    }
  });

})();
