const ACTION_INPUT_TO_CHATGPT = "inputToChatGPT";
const TEXTAREA_SELECTOR = "textarea";
const INTERVAL_MS = 500;
const INPUT_EVENT_NAME = "input";
const ENTER_KEY_NAME = "Enter";
// import { ACTION_INPUT_TO_CHATGPT, TEXTAREA_SELECTOR, INTERVAL_MS, INPUT_EVENT_NAME, ENTER_KEY_NAME } from "./constants.js";

chrome.runtime.sendMessage({ action: "contentScriptReady" });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === ACTION_INPUT_TO_CHATGPT) {
    const inputText = message.text;
    // クリップボードにコピー
    navigator.clipboard.writeText(inputText).then(() => {
      // 画面右下にメッセージを表示
      const msg = document.createElement("div");
      msg.textContent =
        "クリップボードにコピーしました。ChatGPTの入力欄にペーストして送信してください";
      msg.style.position = "fixed";
      msg.style.right = "24px";
      msg.style.bottom = "24px";
      msg.style.background = "#222";
      msg.style.color = "#fff";
      msg.style.padding = "12px 20px";
      msg.style.borderRadius = "8px";
      msg.style.fontSize = "16px";
      msg.style.zIndex = 9999;
      msg.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
      document.body.appendChild(msg);
      setTimeout(() => {
        msg.remove();
      }, 4000);
    });
  }
});
