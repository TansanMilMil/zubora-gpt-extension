const STORAGE_KEY_PROMPT = "prompt";
const SAVE_BUTTON_ID = "save";
const STATUS_ID = "status";
const STATUS_TIMEOUT_MS = 1500;
const STORAGE_KEY_AI_SERVICES = "ai_services";
const STORAGE_KEY_DEFAULT_AI = "default_ai_service";
const AI_STATUS_ID = "ai-status";
// import { STORAGE_KEY_PROMPT, SAVE_BUTTON_ID, STATUS_ID, STATUS_TIMEOUT_MS } from "./constants.js";

function renderAIServiceList(services) {
  const list = document.getElementById("ai-service-list");
  list.innerHTML = "";
  services.forEach((service, idx) => {
    const li = document.createElement("li");
    li.textContent = `${service.name}（${service.url}）`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      services.splice(idx, 1);
      chrome.storage.sync.set({ [STORAGE_KEY_AI_SERVICES]: services }, () => {
        renderAIServiceList(services);
        renderAIDefaultSelect(services);
        showAIStatus("削除しました");
      });
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function renderAIDefaultSelect(services, selected) {
  const select = document.getElementById("default-ai-service");
  select.innerHTML = "";
  services.forEach((service, idx) => {
    const opt = document.createElement("option");
    opt.value = service.url;
    opt.textContent = service.name;
    if (selected && selected === service.url) opt.selected = true;
    select.appendChild(opt);
  });
}

function showAIStatus(msg) {
  const status = document.getElementById(AI_STATUS_ID);
  status.textContent = msg;
  setTimeout(() => {
    status.textContent = "";
  }, STATUS_TIMEOUT_MS);
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get({ prompt: "" }, (data) => {
    document.getElementById("prompt").value = data.prompt;
  });

  chrome.storage.sync.get(
    { [STORAGE_KEY_AI_SERVICES]: [], [STORAGE_KEY_DEFAULT_AI]: "" },
    (data) => {
      renderAIServiceList(data[STORAGE_KEY_AI_SERVICES]);
      renderAIDefaultSelect(
        data[STORAGE_KEY_AI_SERVICES],
        data[STORAGE_KEY_DEFAULT_AI]
      );
    }
  );

  document.getElementById("save").addEventListener("click", () => {
    const prompt = document.getElementById("prompt").value;
    chrome.storage.sync.set({ prompt }, () => {
      document.getElementById("status").textContent = "保存しました";
      setTimeout(() => {
        document.getElementById("status").textContent = "";
      }, STATUS_TIMEOUT_MS);
    });
  });

  // 「AIサービスを追加」ボタンでフォーム表示時にイベントバインド
  const showBtn = document.getElementById("show-add-ai-form");
  const form = document.getElementById("add-ai-form");
  if (showBtn && form) {
    showBtn.addEventListener("click", () => {
      form.style.display = "";
      showBtn.style.display = "none";
      // 追加ボタンのイベントを毎回バインドし直す
      const addBtn = document.getElementById("add-ai-service");
      if (addBtn) {
        const newHandler = () => {
          const name = document.getElementById("ai-service-name").value.trim();
          const url = document.getElementById("ai-service-url").value.trim();
          if (!name || !url) {
            showAIStatus("サービス名とURLを入力してよ");
            return;
          }
          chrome.storage.sync.get({ [STORAGE_KEY_AI_SERVICES]: [] }, (data) => {
            const services = data[STORAGE_KEY_AI_SERVICES];
            if (services.some((s) => s.name === name || s.url === url)) {
              showAIStatus("同じ名前かURLのサービスがあるよ");
              return;
            }
            services.push({ name, url });
            chrome.storage.sync.set(
              { [STORAGE_KEY_AI_SERVICES]: services },
              () => {
                renderAIServiceList(services);
                renderAIDefaultSelect(services);
                showAIStatus("追加したよ");
                document.getElementById("ai-service-name").value = "";
                document.getElementById("ai-service-url").value = "";
                form.style.display = "none";
                showBtn.style.display = "";
              }
            );
          });
        };
        // 既存のイベントリスナーをremoveしてからadd
        addBtn.replaceWith(addBtn.cloneNode(true));
        const newAddBtn = document.getElementById("add-ai-service");
        newAddBtn.addEventListener("click", newHandler);
      }
    });
  }

  document.getElementById("save-ai-settings").addEventListener("click", () => {
    const select = document.getElementById("default-ai-service");
    const url = select.value;
    chrome.storage.sync.set({ [STORAGE_KEY_DEFAULT_AI]: url }, () => {
      showAIStatus("デフォルトAIを保存したよ");
    });
  });

  // キャンセルボタンのイベントバインド
  const cancelBtn = document.getElementById("cancel-add-ai-service");
  if (cancelBtn && form && showBtn) {
    cancelBtn.addEventListener("click", () => {
      form.style.display = "none";
      showBtn.style.display = "";
      document.getElementById("ai-service-name").value = "";
      document.getElementById("ai-service-url").value = "";
    });
  }
});
