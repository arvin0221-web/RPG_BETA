<!-- 新手教學按鈕 -->
<button id="btn-tutorial" style="
    position: fixed;
    right: 12px;
    top: 60px;
    padding: 8px 12px;
    font-size: 16px;
    background: linear-gradient(135deg,#4caf50,#8bc34a);
    color: #000;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    z-index: 9999;
">📖 新手教學</button>
// 打開教學面板
document.getElementById("btn-tutorial").onclick = async function() {
    const panel = document.getElementById("tutorial-panel");
    const contentDiv = document.getElementById("tutorial-content");

    try {
        // 讀取 tutorial.txt
        const response = await fetch("tutorial.txt");
        if (!response.ok) throw new Error("讀取文字檔失敗");
        const text = await response.text();

        contentDiv.textContent = text; // 放入面板
        panel.style.display = "block";
    } catch (err) {
        console.error(err);
        contentDiv.textContent = "無法載入新手教學內容";
        panel.style.display = "block";
    }
};

// 關閉按鈕
document.getElementById("btn-close-tutorial").onclick = function() {
    document.getElementById("tutorial-panel").style.display = "none";
};
