console.log("MAGIC BACKGROUND LOADED");

const magicBg = document.getElementById("magic-bg");

/* 魔法光圈 */
for (let i = 0; i < 3; i++) {
  const circle = document.createElement("div");
  circle.className = "magic-circle";
  circle.style.left = Math.random() * 80 + "%";
  circle.style.top  = Math.random() * 80 + "%";
  circle.style.animationDuration = (15 + Math.random() * 20) + "s";
  circle.style.animationDelay = Math.random() * 10 + "s";
  magicBg.appendChild(circle);
}

/* 漂浮魔法粒子 */
for (let i = 0; i < 60; i++) {
  const p = document.createElement("div");
  p.className = "magic-particle";
  p.style.left = Math.random() * 100 + "vw";
  p.style.top = Math.random() * 100 + "vh";
  p.style.animationDuration = (8 + Math.random() * 10) + "s";
  p.style.animationDelay = Math.random() * 10 + "s";
  magicBg.appendChild(p);
}
