import {
  ACTION_INPUT_TO_CHATGPT,
  TEXTAREA_SELECTOR,
  INTERVAL_MS,
  INPUT_EVENT_NAME,
  ENTER_KEY_NAME,
} from "./constants.js";
import { showToast } from "./toast.js";

console.log("content script loaded");
// import { ACTION_INPUT_TO_CHATGPT, TEXTAREA_SELECTOR, INTERVAL_MS, INPUT_EVENT_NAME, ENTER_KEY_NAME } from "./constants.js";

chrome.runtime.sendMessage({ action: "contentScriptReady" });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === ACTION_INPUT_TO_CHATGPT) {
    const inputText = message.text;
    // クリップボードにコピー
    navigator.clipboard.writeText(inputText).then(() => {
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
      // 画面右下にメッセージを表示
      showToast(
        message.messageText ||
          "クリップボードにコピーしました。ChatGPTの入力欄にペーストして送信してください",
        4000
      );
    });
  }
});
