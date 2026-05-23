function getArticleText(): string {
  const article =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;

  return article ? article.innerText || "" : "";
}

function countCharacters(text: string): number {
  return text.replace(/\s/g, "").length;
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "getCount") {
    const text = getArticleText();

    sendResponse({ count: countCharacters(text) });
  }
  return true;
});
