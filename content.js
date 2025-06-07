chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "inputToChatGPT") {
    window.alert("inputToChatGPT");
    const inputText = message.text;
    // ChatGPTの入力欄が出現するまで待つ
    const interval = setInterval(() => {
      window.alert("search textarea...");
      const textarea = document.querySelector("textarea");
      if (textarea) {
        window.alert("textarea found");
        textarea.value = inputText;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        // Enterキー送信
        const enterEvent = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
          code: "Enter",
        });
        textarea.dispatchEvent(enterEvent);
        clearInterval(interval);
      }
    }, 500);
  }
});
