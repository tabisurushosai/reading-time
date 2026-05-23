/**
 * Get the text content of the main article or body.
 */
function getArticleText(): string {
  const article = document.querySelector('article') || document.querySelector('main') || document.body;
  return article ? article.innerText || "" : "";
}

/**
 * Count characters in the text.
 */
function countCharacters(text: string): number {
  // Remove whitespace characters for a more accurate reading time estimate
  return text.replace(/\s/g, '').length;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    const text = getArticleText();
    const count = countCharacters(text);
    sendResponse({ count });
  }
  return true;
});
