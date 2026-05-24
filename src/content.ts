import { countTextStats } from "./core/reading";

interface CountRequest {
  action: "getCount";
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function isCountRequest(request: unknown): request is CountRequest {
  return isRecord(request) && request.action === "getCount";
}

function getArticleText(): string {
  const article =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;

  return article ? article.innerText || "" : "";
}

chrome.runtime.onMessage.addListener((request: unknown, _sender, sendResponse) => {
  if (isCountRequest(request)) {
    const text = getArticleText();

    sendResponse({ count: countTextStats(text).charCount });
  }
  return true;
});
