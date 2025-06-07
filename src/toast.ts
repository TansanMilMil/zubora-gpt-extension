export function showToast(msg: string, duration: number = 2300) {
  // 既存のトーストがあれば消す
  const oldToast = document.getElementById("zubora-toast");
  if (oldToast) oldToast.remove();

  // アニメーション用CSSを1度だけ注入
  if (!document.getElementById("zubora-gpt-msg-anim")) {
    const style = document.createElement("style");
    style.id = "zubora-gpt-msg-anim";
    style.textContent = `
      @keyframes zuboraFadeSlideIn {
        0% { opacity: 0; transform: translateY(40px) scale(0.95); background: #ffd700; color: #222; }
        40% { opacity: 1; background: #ffe066; color: #222; }
        60% { opacity: 1; transform: translateY(-8px) scale(1.03); background: #4f8cff; color: #fff; }
        80% { opacity: 1; transform: translateY(0) scale(1); background: #222; color: #fff; }
        100% { opacity: 1; transform: translateY(0) scale(1); background: #222; color: #fff; }
      }
      .zubora-gpt-anim {
        animation: zuboraFadeSlideIn 0.9s cubic-bezier(.23,1.1,.32,1) both;
      }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement("div");
  toast.id = "zubora-toast";
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.right = "24px";
  toast.style.bottom = "24px";
  toast.style.background = "#222";
  toast.style.color = "#fff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "16px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s, transform 0.3s";
  toast.style.transform = "translateY(20px) scale(0.98)";
  toast.classList.add("zubora-gpt-anim");
  document.body.appendChild(toast);
  // アニメーションでふわっと表示
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0) scale(1)";
  }, 10);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px) scale(0.98)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
