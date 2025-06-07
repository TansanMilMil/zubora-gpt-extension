type AIService = { name: string; url: string };

const STORAGE_KEY_PROMPT = "prompt";
const SAVE_BUTTON_ID = "save";
const STATUS_ID = "status";
const STATUS_TIMEOUT_MS = 1500;
const STORAGE_KEY_AI_SERVICES = "ai_services";
const STORAGE_KEY_DEFAULT_AI = "default_ai_service";
const AI_STATUS_ID = "ai-status";
// import { STORAGE_KEY_PROMPT, SAVE_BUTTON_ID, STATUS_ID, STATUS_TIMEOUT_MS } from "./constants.js";

function renderAIServiceList(services: AIService[]): void {
  const list = document.getElementById(
    "ai-service-list"
  ) as HTMLUListElement | null;
  if (!list) return;
  list.innerHTML = "";
  services.forEach((service: AIService, idx: number) => {
    const li = document.createElement("li");
    li.textContent = `${service.name}（${service.url}）`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      services.splice(idx, 1);
      chrome.storage.sync.set({ [STORAGE_KEY_AI_SERVICES]: services }, () => {
        renderAIServiceList(services);
        renderAIDefaultSelect(services, undefined);
        showAIStatus("削除しました");
      });
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function renderAIDefaultSelect(services: AIService[], selected?: string): void {
  const select = document.getElementById(
    "default-ai-service"
  ) as HTMLSelectElement | null;
  if (!select) return;
  select.innerHTML = "";
  services.forEach((service: AIService) => {
    const opt = document.createElement("option");
    opt.value = service.url;
    opt.textContent = service.name;
    if (selected && selected === service.url) opt.selected = true;
    select.appendChild(opt);
  });
}

function showAIStatus(msg: string): void {
  // 既存のトーストがあれば消す
  const oldToast = document.getElementById("zubora-toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.id = "zubora-toast";
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.right = "24px";
  toast.style.bottom = "24px";
  toast.style.background = "#222";
  toast.style.color = "#fff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "16px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s, transform 0.3s";
  toast.style.transform = "translateY(20px) scale(0.98)";
  document.body.appendChild(toast);
  // アニメーションでふわっと表示
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0) scale(1)";
  }, 10);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px) scale(0.98)";
    setTimeout(() => toast.remove(), 300);
  }, STATUS_TIMEOUT_MS + 800);
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get({ prompt: "" }, (data: { prompt: string }) => {
    const promptInput = document.getElementById(
      "prompt"
    ) as HTMLTextAreaElement | null;
    if (promptInput) promptInput.value = data.prompt;
  });

  chrome.storage.sync.get(
    { [STORAGE_KEY_AI_SERVICES]: [], [STORAGE_KEY_DEFAULT_AI]: "" },
    (data: {
      [STORAGE_KEY_AI_SERVICES]: AIService[];
      [STORAGE_KEY_DEFAULT_AI]: string;
    }) => {
      renderAIServiceList(data[STORAGE_KEY_AI_SERVICES]);
      renderAIDefaultSelect(
        data[STORAGE_KEY_AI_SERVICES],
        data[STORAGE_KEY_DEFAULT_AI]
      );
    }
  );

  const saveBtn = document.getElementById("save") as HTMLButtonElement | null;
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const promptInput = document.getElementById(
        "prompt"
      ) as HTMLTextAreaElement | null;
      if (!promptInput) return;
      const prompt = promptInput.value;
      chrome.storage.sync.set({ prompt }, () => {
        showAIStatus("保存しました");
      });
    });
  }

  // 「AIサービスを追加」ボタンでフォーム表示時にイベントバインド
  const showBtn = document.getElementById(
    "show-add-ai-form"
  ) as HTMLButtonElement | null;
  const form = document.getElementById("add-ai-form") as HTMLDivElement | null;
  if (showBtn && form) {
    showBtn.addEventListener("click", () => {
      form.style.display = "";
      showBtn.style.display = "none";
      // 追加ボタンのイベントを毎回バインドし直す
      const addBtn = document.getElementById(
        "add-ai-service"
      ) as HTMLButtonElement | null;
      if (addBtn) {
        const newHandler = () => {
          const nameInput = document.getElementById(
            "ai-service-name"
          ) as HTMLInputElement | null;
          const urlInput = document.getElementById(
            "ai-service-url"
          ) as HTMLInputElement | null;
          if (!nameInput || !urlInput) return;
          const name = nameInput.value.trim();
          const url = urlInput.value.trim();
          if (!name || !url) {
            showAIStatus("サービス名とURLを入力してよ");
            return;
          }
          chrome.storage.sync.get(
            { [STORAGE_KEY_AI_SERVICES]: [] },
            (data: { [STORAGE_KEY_AI_SERVICES]: AIService[] }) => {
              const services = data[STORAGE_KEY_AI_SERVICES];
              if (
                services.some(
                  (s: AIService) => s.name === name || s.url === url
                )
              ) {
                showAIStatus("同じ名前かURLのサービスがあるよ");
                return;
              }
              services.push({ name, url });
              chrome.storage.sync.set(
                { [STORAGE_KEY_AI_SERVICES]: services },
                () => {
                  renderAIServiceList(services);
                  renderAIDefaultSelect(services, undefined);
                  showAIStatus("追加したよ");
                  nameInput.value = "";
                  urlInput.value = "";
                  form.style.display = "none";
                  showBtn.style.display = "";
                }
              );
            }
          );
        };
        addBtn.replaceWith(addBtn.cloneNode(true));
        const newAddBtn = document.getElementById(
          "add-ai-service"
        ) as HTMLButtonElement | null;
        if (newAddBtn) newAddBtn.addEventListener("click", newHandler);
      }
    });
  }

  const saveAISettingsBtn = document.getElementById(
    "save-ai-settings"
  ) as HTMLButtonElement | null;
  if (saveAISettingsBtn) {
    saveAISettingsBtn.addEventListener("click", () => {
      const select = document.getElementById(
        "default-ai-service"
      ) as HTMLSelectElement | null;
      if (!select) return;
      const url = select.value;
      chrome.storage.sync.set({ [STORAGE_KEY_DEFAULT_AI]: url }, () => {
        showAIStatus("デフォルトAIを保存したよ");
      });
    });
  }

  // キャンセルボタンのイベントバインド
  const cancelBtn = document.getElementById(
    "cancel-add-ai-service"
  ) as HTMLButtonElement | null;
  if (cancelBtn && form && showBtn) {
    cancelBtn.addEventListener("click", () => {
      form.style.display = "none";
      showBtn.style.display = "";
      const nameInput = document.getElementById(
        "ai-service-name"
      ) as HTMLInputElement | null;
      const urlInput = document.getElementById(
        "ai-service-url"
      ) as HTMLInputElement | null;
      if (nameInput) nameInput.value = "";
      if (urlInput) urlInput.value = "";
    });
  }
});
