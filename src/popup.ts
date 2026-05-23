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
        // Remove whitespace characters for a more accurate reading time estimate
        return text.replace(/\s/g, "").length;
      },
    });

    const count = results[0].result;
    const app = document.getElementById("app");
    if (app) {
      app.innerText = `文字数: ${count}`;
    }
  } catch (error) {
    console.error("Failed to execute script:", error);
    const app = document.getElementById("app");
    if (app) {
      app.innerText = "エラーが発生しました";
    }
  }
}

getTabCount();
