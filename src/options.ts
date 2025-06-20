import {
  STORAGE_KEY_PROMPT,
  SAVE_BUTTON_ID,
  STATUS_ID,
  STATUS_TIMEOUT_MS,
  STORAGE_KEY_AI_SERVICES,
  STORAGE_KEY_DEFAULT_AI,
  AI_STATUS_ID,
} from "./constants.js";
import { AIService } from "./types.js";
import { showToast } from "./toast.js";
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
  showToast(msg);
}

document.addEventListener("DOMContentLoaded", () => {
  initPromptInput();
  initAIServiceSettings();
  bindSavePromptButton();
  bindShowAddAIFormButton();
  bindSaveAISettingsButton();
  bindCancelAddAIServiceButton();
});

function initPromptInput() {
  chrome.storage.sync.get({ prompt: "" }, (data: { prompt: string }) => {
    const promptInput = document.getElementById(
      "prompt"
    ) as HTMLTextAreaElement | null;
    if (promptInput) promptInput.value = data.prompt;
  });
}

function initAIServiceSettings() {
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
}

function bindSavePromptButton() {
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
}

function bindShowAddAIFormButton() {
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
}

function bindSaveAISettingsButton() {
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
}

function bindCancelAddAIServiceButton() {
  const showBtn = document.getElementById(
    "show-add-ai-form"
  ) as HTMLButtonElement | null;
  const form = document.getElementById("add-ai-form") as HTMLDivElement | null;
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
}
