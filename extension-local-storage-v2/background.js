let isExtensionValid = true;

function handleExtensionReload() {
  isExtensionValid = true;
  console.log("Extension reloaded, context restored");
}

chrome.runtime.onInstalled.addListener(handleExtensionReload);
chrome.runtime.onStartup.addListener(handleExtensionReload);

function injectContentScript(tabId) {
  if (!isExtensionValid) return;
  
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error("Error getting tab info:", chrome.runtime.lastError.message);
      return;
    }

    if (!tab || !tab.url) {
      console.log("Tab or URL is undefined. Skipping injection.");
      return;
    }

    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      console.log("Skipping injection for chrome:// or chrome-extension:// URL:", tab.url);
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['content.js']
    }).catch(error => {
      console.error("Error injecting script:", error);
      if (error.message.includes("Extension context invalidated")) {
        isExtensionValid = false;
      }
    });
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isExtensionValid) return;
  if (changeInfo.status === 'complete' && tab && tab.url) {
    injectContentScript(tabId);
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (!isExtensionValid) return;
  injectContentScript(details.tabId);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!isExtensionValid) return;
  if (request.action === "logPosition") {
    console.log("Position saved:", request.position);
  }
});

chrome.runtime.onSuspend.addListener(() => {
  isExtensionValid = false;
  console.log("Extension is being unloaded");
});

