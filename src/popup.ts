let charCount = 0;
let wordCount = 0;
let speedJa = 400;
let speedEn = 200;
let currentTabId: number | undefined;
let currentDomain: string | undefined;
let isPremium = false;
let trialStartTs = 0;

const TRIAL_DAYS = 7;

async function loadSettings() {
  const result = await chrome.storage.local.get([
    "speedJa", 
    "speedEn", 
    "isPremium", 
    "trialStartTs",
    "siteSpeeds"
  ]);

  isPremium = result.isPremium || false;
  trialStartTs = result.trialStartTs || 0;

  if (!trialStartTs) {
    trialStartTs = Date.now();
    await chrome.storage.local.set({ trialStartTs });
  }

  speedJa = result.speedJa || 400;
  speedEn = result.speedEn || 200;

  // Check if we have site-specific speeds
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      currentDomain = new URL(tab.url).hostname;
      if (currentDomain && result.siteSpeeds && result.siteSpeeds[currentDomain]) {
        const siteSpeed = result.siteSpeeds[currentDomain];
        if (siteSpeed.speedJa) speedJa = siteSpeed.speedJa;
        if (siteSpeed.speedEn) speedEn = siteSpeed.speedEn;
      }
    } catch (e) {
      console.error("Failed to parse URL", e);
    }
  }

  (document.getElementById("speed-ja") as HTMLInputElement).value = speedJa.toString();
  (document.getElementById("speed-en") as HTMLInputElement).value = speedEn.toString();

  localizeUI();
  updatePremiumUI();
}

function updatePremiumUI() {
  const statusEl = document.getElementById("premium-status");
  if (!statusEl) return;

  const now = Date.now();
  const trialElapsed = now - trialStartTs;
  const trialRemaining = Math.max(0, TRIAL_DAYS - (trialElapsed / (1000 * 60 * 60 * 24)));
  
  const hasAccess = isPremium || trialRemaining > 0;

  if (isPremium) {
    statusEl.innerText = chrome.i18n.getMessage("premiumStatus");
    statusEl.style.color = "gold";
  } else if (trialRemaining > 0) {
    statusEl.innerText = chrome.i18n.getMessage("trialStatus", [Math.ceil(trialRemaining).toString()]);
    statusEl.style.color = "green";
  } else {
    statusEl.innerText = "Free Version (Trial Ended)";
    statusEl.style.color = "red";
    // Show upgrade button
    const upgradeBtn = document.getElementById("upgrade-btn");
    if (upgradeBtn) upgradeBtn.style.display = "inline-block";
  }
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
  speedJa = parseInt((document.getElementById("speed-ja") as HTMLInputElement).value) || 400;
  speedEn = parseInt((document.getElementById("speed-en") as HTMLInputElement).value) || 200;
  
  const now = Date.now();
  const trialRemaining = Math.max(0, TRIAL_DAYS - ((now - trialStartTs) / (1000 * 60 * 60 * 24)));
  const hasAccess = isPremium || trialRemaining > 0;

  if (hasAccess && currentDomain) {
    // Premium feature: site-specific speed
    const result = await chrome.storage.local.get("siteSpeeds");
    const siteSpeeds = result.siteSpeeds || {};
    siteSpeeds[currentDomain] = { speedJa, speedEn };
    await chrome.storage.local.set({ siteSpeeds, speedJa, speedEn });
  } else {
    // Normal save
    await chrome.storage.local.set({ speedJa, speedEn });
  }
  
  updateDisplay();
}

async function getTabCount() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
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
  const langEl = document.querySelector('input[name="lang"]:checked') as HTMLInputElement;
  if (!langEl) return;
  const lang = langEl.value;
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

document.getElementById("upgrade-btn")?.addEventListener("click", () => {
  // Stripe placeholder logic: just set premium to true for now as a "mock" or open a URL
  // For the sake of this task, I'll just set it to true in storage to simulate successful payment
  chrome.storage.local.set({ isPremium: true }).then(() => {
    isPremium = true;
    updatePremiumUI();
    const upgradeBtn = document.getElementById("upgrade-btn");
    if (upgradeBtn) upgradeBtn.style.display = "none";
  });
});

// Initial load
(async () => {
  await loadSettings();
  await getTabCount();
})();
