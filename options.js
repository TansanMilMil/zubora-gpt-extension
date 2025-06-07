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
      }, 1500);
    });
  });
});
