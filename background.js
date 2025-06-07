import {
  ACTION_INPUT_TO_CHATGPT,
  CONTEXT_MENU_ID,
  CHATGPT_URL,
} from "./constants.js";

const CONTEXT_MENU_ROOT_ID = "ask-ai-root";

// デフォルトAIサービス名を取得して右クリックメニューのタイトルを更新
function updateContextMenuTitle() {
  chrome.storage.sync.get(
    { ai_services: [], default_ai_service: "" },
    (data) => {
      const aiServices = data.ai_services || [];
      const defaultUrl = data.default_ai_service;
      const found = aiServices.find((s) => s.url === defaultUrl);
      const aiName = found ? found.name : "AI";
      chrome.contextMenus.update(CONTEXT_MENU_ID, {
        title: `${aiName} でサクッと質問`,
      });
    }
  );
}

// サブメニューを含む右クリックメニューを再生成
function recreateContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // デフォルト（今まで通りの）メニュー
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "AIにサクッと質問", // 初期値。あとでupdateContextMenuTitleで上書き
      contexts: ["selection"],
    });
    updateContextMenuTitle();

    // サブメニューの親
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ROOT_ID,
      title: "AIサービスを選んで質問",
      contexts: ["selection"],
    });

    // サブメニューの子（AIサービスごと）
    chrome.storage.sync.get({ ai_services: [] }, (data) => {
      const aiServices = data.ai_services || [];
      aiServices.forEach((service, idx) => {
        chrome.contextMenus.create({
          id: `ask-ai-${idx}`,
          parentId: CONTEXT_MENU_ROOT_ID,
          title: service.name,
          contexts: ["selection"],
        });
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  recreateContextMenus();
});

// AIサービスでタブを開く共通関数（service指定時はそのサービス、なければデフォルト）
function openAIServiceWithText(query, service) {
  if (service) {
    const url = service.url;
    const aiName = service.name;
    const messageText = aiName
      ? `クリップボードにコピーしました。${aiName}の入力欄にペーストして送信してください`
      : "クリップボードにコピーしました。AIサービスの入力欄にペーストして送信してください";
    chrome.tabs.create({ url }, (newTab) => {
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
                    messageText,
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
  } else {
    // デフォルトAIサービス
    chrome.storage.sync.get(
      { default_ai_service: CHATGPT_URL, ai_services: [] },
      (data) => {
        const url = data.default_ai_service || CHATGPT_URL;
        const aiServices = data.ai_services || [];
        const found = aiServices.find((s) => s.url === url);
        const aiName = found ? found.name : "";
        const messageText = aiName
          ? `クリップボードにコピーしました。${aiName}の入力欄にペーストして送信してください`
          : "クリップボードにコピーしました。AIサービスの入力欄にペーストして送信してください";
        chrome.tabs.create({ url }, (newTab) => {
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
                        messageText,
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
    );
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const selectedText = info.selectionText;
    chrome.storage.sync.get({ prompt: "" }, (data) => {
      const prompt = data.prompt || "";
      const query = prompt + selectedText;
      openAIServiceWithText(query);
    });
  } else if (info.menuItemId.startsWith("ask-ai-")) {
    // サブメニューで選択されたAIサービスで開く
    const idx = parseInt(info.menuItemId.replace("ask-ai-", ""), 10);
    const selectedText = info.selectionText;
    chrome.storage.sync.get({ prompt: "", ai_services: [] }, (data) => {
      const prompt = data.prompt || "";
      const query = prompt + selectedText;
      const aiServices = data.ai_services || [];
      const service = aiServices[idx];
      if (service) {
        openAIServiceWithText(query, service);
      }
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
            openAIServiceWithText(query);
          });
        }
      );
    });
  }
});

// ツールバーアイコンをクリックしたらオプションページを新しいタブで開く
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

// AI設定が変わったときもメニューを再生成
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && (changes.ai_services || changes.default_ai_service)) {
    recreateContextMenus();
  }
});
