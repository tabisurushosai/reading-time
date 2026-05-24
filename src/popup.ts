import {
  countTextStats,
  DEFAULT_READING_SPEEDS,
  estimateReadingMinutes,
  type ReadingLanguage,
  type ReadingSpeeds,
  type TextStats,
} from "./core/reading";
import {
  applySiteSpeeds,
  getTrialRemainingDays,
  hasPremiumAccess,
  normalizeStoredSettings,
  setDomainSpeeds,
  type SiteSpeeds,
} from "./core/settings";
import { chromeLocalStorageAdapter } from "./storage/chromeLocalStorage";

type SpeedInputId = "speed-ja" | "speed-en";

let textStats: TextStats = { charCount: 0, wordCount: 0 };
let speeds: ReadingSpeeds = { ...DEFAULT_READING_SPEEDS };
let currentTabId: number | undefined;
let currentDomain: string | undefined;
let isPremium = false;
let trialStartTs = 0;
let siteSpeeds: SiteSpeeds = {};

type ResultState = "loading" | "ready" | "empty" | "error";

const resultStateMessageKeys: Record<ResultState, string> = {
  loading: "loadingStatus",
  ready: "readyStatus",
  empty: "emptyStatus",
  error: "errorOccurred",
};

const uiLocale = chrome.i18n.getUILanguage().toLowerCase().startsWith("ja")
  ? "ja-JP"
  : "en-US";
const numberFormatter = new Intl.NumberFormat(uiLocale);

function formatDisplayNumber(value: number): string {
  return numberFormatter.format(value);
}

function getSpeedInput(id: SpeedInputId): HTMLInputElement {
  const input = document.getElementById(id);

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Missing speed input: ${id}`);
  }

  return input;
}

function parseSpeedInput(id: SpeedInputId, fallback: number): number {
  return parseInt(getSpeedInput(id).value) || fallback;
}

function collectPageTextStats(): TextStats {
  const article =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;
  const text = article ? article.innerText || "" : "";

  return countTextStats(text);
}

function getTrialStatusMessage(trialRemainingDays: number): string {
  const days = Math.ceil(trialRemainingDays);
  const messageKey = days === 1 ? "trialStatusOne" : "trialStatus";

  return chrome.i18n.getMessage(messageKey, [formatDisplayNumber(days)]);
}

function setResultState(state: ResultState) {
  const card = document.getElementById("result-card");
  const statusLabel = document.getElementById("status-label");

  if (card) {
    card.classList.remove("is-loading", "is-ready", "is-empty", "is-error");
    card.classList.add(`is-${state}`);
    card.setAttribute("aria-busy", state === "loading" ? "true" : "false");
  }

  if (statusLabel) {
    statusLabel.innerText = chrome.i18n.getMessage(resultStateMessageKeys[state]);
  }
}

async function loadSettings() {
  const storedSettings = await chromeLocalStorageAdapter.get();
  const settings = normalizeStoredSettings(storedSettings, Date.now());

  isPremium = settings.isPremium;
  trialStartTs = settings.trialStartTs;
  siteSpeeds = settings.siteSpeeds;

  if (!storedSettings.trialStartTs) {
    await chromeLocalStorageAdapter.set({ trialStartTs });
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      currentDomain = new URL(tab.url).hostname;
    } catch (e) {
      console.error("Failed to parse URL", e);
    }
  }

  speeds = applySiteSpeeds(settings, siteSpeeds, currentDomain);

  getSpeedInput("speed-ja").value = speeds.speedJa.toString();
  getSpeedInput("speed-en").value = speeds.speedEn.toString();

  localizeUI();
  updatePremiumUI();
}

function updatePremiumUI() {
  const statusEl = document.getElementById("premium-status");
  if (!statusEl) return;

  const trialRemaining = getTrialRemainingDays(trialStartTs, Date.now());
  
  if (isPremium) {
    statusEl.innerText = chrome.i18n.getMessage("premiumStatus");
    statusEl.className = "premium-status premium-status--premium";
  } else if (trialRemaining > 0) {
    statusEl.innerText = getTrialStatusMessage(trialRemaining);
    statusEl.className = "premium-status premium-status--trial";
  } else {
    statusEl.innerText = chrome.i18n.getMessage("freeStatus");
    statusEl.className = "premium-status premium-status--free";
    // Show upgrade button
    const upgradeBtn = document.getElementById("upgrade-btn");
    if (upgradeBtn) upgradeBtn.style.display = "inline-block";
  }
}

function localizeUI() {
  document.documentElement.lang = uiLocale;
  document.title = chrome.i18n.getMessage("extName");

  const elements = {
    "app-title": "extName",
    "label-lang-ja": "langJa",
    "label-lang-en": "langEn",
    "language-legend": "languageLegend",
    "settings-legend": "settingsLegend",
    "label-speed-ja": "speedJaLabel",
    "label-speed-en": "speedEnLabel",
    "unit-speed-ja": "unitCharsPerMin",
    "unit-speed-en": "unitWordsPerMin",
    "upgrade-btn": "upgradeButton",
  };

  for (const [id, key] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = chrome.i18n.getMessage(key);
    }
  }
}

async function saveSettings() {
  speeds = {
    speedJa: parseSpeedInput("speed-ja", DEFAULT_READING_SPEEDS.speedJa),
    speedEn: parseSpeedInput("speed-en", DEFAULT_READING_SPEEDS.speedEn),
  };

  const now = Date.now();
  const hasAccess = hasPremiumAccess(isPremium, trialStartTs, now);

  if (hasAccess && currentDomain) {
    const result = await chromeLocalStorageAdapter.get("siteSpeeds");
    siteSpeeds = setDomainSpeeds(result.siteSpeeds || {}, currentDomain, speeds);
    await chromeLocalStorageAdapter.set({
      siteSpeeds,
      speedJa: speeds.speedJa,
      speedEn: speeds.speedEn,
    });
  } else {
    await chromeLocalStorageAdapter.set({
      speedJa: speeds.speedJa,
      speedEn: speeds.speedEn,
    });
  }

  updateDisplay();
}

async function getTabCount() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  currentTabId = tab.id;
  setResultState("loading");

  try {
    const results = await chrome.scripting.executeScript<[], TextStats>({
      target: { tabId: tab.id },
      func: collectPageTextStats,
    });

    const result = results[0].result;
    if (result) {
      textStats = result;
    }

    updateDisplay();
  } catch (error) {
    console.error("Failed to execute script:", error);
    setResultState("error");
    const stats = document.getElementById("stats");
    const readingTime = document.getElementById("reading-time");
    if (stats) {
      stats.innerText = chrome.i18n.getMessage("errorOccurred");
    }
    if (readingTime) {
      readingTime.innerText = "";
    }
  }
}

function updateDisplay() {
  const langEl = document.querySelector('input[name="lang"]:checked') as HTMLInputElement;
  if (!langEl) return;
  const lang: ReadingLanguage = langEl.value === "en" ? "en" : "ja";
  const stats = document.getElementById("stats");
  const readingTime = document.getElementById("reading-time");

  if (!stats || !readingTime) return;

  const minutes = estimateReadingMinutes(textStats, lang, speeds);
  readingTime.innerText = chrome.i18n.getMessage("readingTimeResult", [formatDisplayNumber(minutes)]);

  if (lang === "ja") {
    stats.innerText = chrome.i18n.getMessage("charCount", [formatDisplayNumber(textStats.charCount)]);
  } else {
    stats.innerText = chrome.i18n.getMessage("wordCount", [formatDisplayNumber(textStats.wordCount)]);
  }
  setResultState(minutes > 0 ? "ready" : "empty");

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

document.getElementById("upgrade-btn")?.addEventListener("click", () => {
  console.warn("Premium upgrade flow is not configured.");
});

// Initial load
(async () => {
  await loadSettings();
  await getTabCount();
})();
