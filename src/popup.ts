let charCount = 0;
let wordCount = 0;

async function getTabCount() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;

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
    charCount = result.charCount;
    wordCount = result.wordCount;
    
    updateDisplay();
  } catch (error) {
    console.error("Failed to execute script:", error);
    const stats = document.getElementById("stats");
    if (stats) {
      stats.innerText = "エラーが発生しました";
    }
  }
}

function updateDisplay() {
  const lang = (document.querySelector('input[name="lang"]:checked') as HTMLInputElement).value;
  const stats = document.getElementById("stats");
  const readingTime = document.getElementById("reading-time");

  if (!stats || !readingTime) return;

  if (lang === "ja") {
    stats.innerText = `文字数: ${charCount}`;
    const minutes = Math.ceil(charCount / 400);
    readingTime.innerText = `読了時間: 約${minutes}分`;
  } else {
    stats.innerText = `Word count: ${wordCount}`;
    const minutes = Math.ceil(wordCount / 200);
    readingTime.innerText = `Reading time: approx. ${minutes} min`;
  }
}

// Event listeners for radio buttons
document.querySelectorAll('input[name="lang"]').forEach(radio => {
  radio.addEventListener('change', updateDisplay);
});

getTabCount();
