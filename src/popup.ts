let charCount = 0;
let wordCount = 0;
let speedJa = 400;
let speedEn = 200;
let currentTabId: number | undefined;

async function loadSettings() {
  const result = await chrome.storage.local.get(["speedJa", "speedEn"]);
  if (result.speedJa) {
    speedJa = result.speedJa;
    (document.getElementById("speed-ja") as HTMLInputElement).value = speedJa.toString();
  }
  if (result.speedEn) {
    speedEn = result.speedEn;
    (document.getElementById("speed-en") as HTMLInputElement).value = speedEn.toString();
  }
  localizeUI();
}

function localizeUI() {
  const elements = {
    "app-title": "extName",
    "label-lang-ja": "langJa",
    "label-lang-en": "langEn",
    "label-speed-ja": "speedJaLabel",
    "label-speed-en": "speedEnLabel",
    "unit-speed-ja": "unitCharsPerMin",
    "unit-speed-en": "unitWordsPerMin",
  };

  for (const [id, key] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = chrome.i18n.getMessage(key);
    }
  }
}

async function saveSettings() {
  speedJa = parseInt((document.getElementById("speed-ja") as HTMLInputElement).value) || 400;
  speedEn = parseInt((document.getElementById("speed-en") as HTMLInputElement).value) || 200;
  await chrome.storage.local.set({ speedJa, speedEn });
  updateDisplay();
}

async function getTabCount() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;
  currentTabId = tab.id;

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const article =
          document.querySelector("article") ||
          document.querySelector("main") ||
          document.body;
        const text = article ? article.innerText || "" : "";
        const charCount = text.replace(/\s/g, "").length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        return { charCount, wordCount };
      },
    });

    const result = results[0].result;
    if (result) {
      charCount = result.charCount;
      wordCount = result.wordCount;
    }
    
    updateDisplay();
  } catch (error) {
    console.error("Failed to execute script:", error);
    const stats = document.getElementById("stats");
    if (stats) {
      stats.innerText = chrome.i18n.getMessage("errorOccurred");
    }
  }
}

function updateDisplay() {
  const lang = (document.querySelector('input[name="lang"]:checked') as HTMLInputElement).value;
  const stats = document.getElementById("stats");
  const readingTime = document.getElementById("reading-time");

  if (!stats || !readingTime) return;

  let minutes = 0;
  if (lang === "ja") {
    stats.innerText = chrome.i18n.getMessage("charCount", [charCount.toString()]);
    minutes = Math.ceil(charCount / speedJa);
    readingTime.innerText = chrome.i18n.getMessage("readingTimeResult", [minutes.toString()]);
  } else {
    stats.innerText = chrome.i18n.getMessage("wordCount", [wordCount.toString()]);
    minutes = Math.ceil(wordCount / speedEn);
    readingTime.innerText = chrome.i18n.getMessage("readingTimeResult", [minutes.toString()]);
  }

  // Update action badge
  const badgeText = minutes > 0 ? minutes.toString() : "";
  chrome.action.setBadgeText({ 
    text: badgeText,
    tabId: currentTabId
  });
  chrome.action.setBadgeBackgroundColor({ 
    color: "#4682B4",
    tabId: currentTabId
  });
}

// Event listeners
document.querySelectorAll('input[name="lang"]').forEach(radio => {
  radio.addEventListener('change', updateDisplay);
});

document.getElementById("speed-ja")?.addEventListener("change", saveSettings);
document.getElementById("speed-en")?.addEventListener("change", saveSettings);

// Initial load
(async () => {
  await loadSettings();
  await getTabCount();
})();
