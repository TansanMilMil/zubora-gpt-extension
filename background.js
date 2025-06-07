import {
  ACTION_INPUT_TO_CHATGPT,
  CONTEXT_MENU_ID,
  CHATGPT_URL,
} from "./constants.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "選択テキストをChatGPTに尋ねる",
    contexts: ["selection"],
  });
});

// ChatGPTタブを開いてテキストを送信する共通関数
function openChatGPTWithText(query) {
  chrome.tabs.create({ url: CHATGPT_URL }, (newTab) => {
    function onUpdated(tabId, info) {
      if (tabId === newTab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        chrome.scripting.executeScript(
          {
            target: { tabId: newTab.id },
            files: ["content.js"],
          },
          () => {
            function readyListener(message, sender) {
              if (
                message.action === "contentScriptReady" &&
                sender.tab &&
                sender.tab.id === newTab.id
              ) {
                chrome.tabs.sendMessage(newTab.id, {
                  action: ACTION_INPUT_TO_CHATGPT,
                  text: query,
                });
                chrome.runtime.onMessage.removeListener(readyListener);
              }
            }
            chrome.runtime.onMessage.addListener(readyListener);
          }
        );
      }
    }
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const selectedText = info.selectionText;
    chrome.storage.sync.get({ prompt: "" }, (data) => {
      const prompt = data.prompt || "";
      const query = prompt + selectedText;
      openChatGPTWithText(query);
    });
  }
});

// ショートカットキー対応
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "run-chatgpt") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          func: () => window.getSelection().toString(),
        },
        (results) => {
          const selectedText = results && results[0] ? results[0].result : "";
          if (!selectedText) {
            return;
          }
          chrome.storage.sync.get({ prompt: "" }, (data) => {
            const prompt = data.prompt || "";
            const query = prompt + selectedText;
            openChatGPTWithText(query);
          });
        }
      );
    });
  }
});
