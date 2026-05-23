interface CountRequest {
  action: "getCount";
}

function isCountRequest(request: unknown): request is CountRequest {
  return (
    typeof request === "object" &&
    request !== null &&
    "action" in request &&
    request.action === "getCount"
  );
}

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

chrome.runtime.onMessage.addListener((request: unknown, _sender, sendResponse) => {
  if (isCountRequest(request)) {
    const text = getArticleText();

    sendResponse({ count: countCharacters(text) });
  }
  return true;
});
