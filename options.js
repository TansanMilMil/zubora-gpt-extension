const STORAGE_KEY_PROMPT = "prompt";
const SAVE_BUTTON_ID = "save";
const STATUS_ID = "status";
const STATUS_TIMEOUT_MS = 1500;
// import { STORAGE_KEY_PROMPT, SAVE_BUTTON_ID, STATUS_ID, STATUS_TIMEOUT_MS } from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get({ prompt: "" }, (data) => {
    document.getElementById("prompt").value = data.prompt;
  });

  document.getElementById("save").addEventListener("click", () => {
    const prompt = document.getElementById("prompt").value;
    chrome.storage.sync.set({ prompt }, () => {
      document.getElementById("status").textContent = "保存しました";
      setTimeout(() => {
        document.getElementById("status").textContent = "";
      }, STATUS_TIMEOUT_MS);
    });
  });
});
