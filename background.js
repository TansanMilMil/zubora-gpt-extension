chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ask-chatgpt",
    title: "選択テキストをChatGPTに尋ねる",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "ask-chatgpt") {
    const selectedText = info.selectionText;
    chrome.storage.sync.get({ prompt: "" }, (data) => {
      const prompt = data.prompt || "";
      const query = prompt + selectedText;
      chrome.tabs.create({ url: "https://chat.openai.com/" }, (newTab) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: newTab.id },
            files: ["content.js"],
          },
          () => {
            chrome.tabs.sendMessage(newTab.id, {
              action: "inputToChatGPT",
              text: query,
            });
          }
        );
      });
    });
  }
});
