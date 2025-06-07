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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const selectedText = info.selectionText;
    chrome.storage.sync.get({ prompt: "" }, (data) => {
      const prompt = data.prompt || "";
      const query = prompt + selectedText;
      chrome.tabs.create({ url: CHATGPT_URL }, (newTab) => {
        // ページの読み込み完了を待つ
        function onUpdated(tabId, info) {
          if (tabId === newTab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            chrome.scripting.executeScript(
              {
                target: { tabId: newTab.id },
                files: ["content.js"],
              },
              () => {
                // content scriptからの「準備OK」メッセージを待つ
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
    });
  }
});
