(function() {
  let lastPosition = { x: 0, y: 0 };
  let isInitialized = false;

  function initializeTracker() {
    if (isInitialized) return;
    
    try {
      document.addEventListener('mousemove', function(mouseEvent) {
        lastPosition.x = mouseEvent.clientX;
        lastPosition.y = mouseEvent.clientY;
      }, { passive: true });

      document.addEventListener('keydown', function(keyboardEvent) {
        if (keyboardEvent.ctrlKey && keyboardEvent.key.toLowerCase() === 'b') {
          keyboardEvent.preventDefault();
          savePosition();
        }
      }, { capture: true });

      isInitialized = true;
      console.log("Mouse Position Tracker initialized in:", window.location.href);
    } catch (error) {
      console.error("Error initializing tracker:", error);
      isInitialized = false;
    }
  }

  function savePosition() {
    const position = {
      x: lastPosition.x,
      y: lastPosition.y,
      url: window.location.href,
      timestamp: new Date().toLocaleString()
    };

    try {
      chrome.storage.local.get(['positions'], function(result) {
        const positions = result.positions || [];
        positions.push(position);
        chrome.storage.local.set({ positions }, function() {
          showNotification();
          chrome.runtime.sendMessage({ action: "loadPositions" });
          chrome.runtime.sendMessage({ action: "logPosition", position: position });
        });
      });
    } catch (error) {
      console.error("Error saving position:", error);
      if (error.message.includes("Extension context invalidated")) {
        isInitialized = false;
      }
    }
  }

  function showNotification() {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      z-index: 2147483647;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;  
    div.textContent = 'Posição salva!';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  }

  function reinitialize() {
    isInitialized = false;
    initializeTracker();
  }

  initializeTracker();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "reinitialize") {
      reinitialize();
    }
  });

  const observer = new MutationObserver(() => {
    if (!isInitialized) {
      initializeTracker();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  setInterval(() => {
    if (!isInitialized) {
      initializeTracker();
    }
  }, 5000);

  window.addEventListener('error', function(event) {
    if (event.error.message.includes("Extension context invalidated")) {
      isInitialized = false;
      console.log("Extension context invalidated, attempting to reinitialize");
      setTimeout(initializeTracker, 1000);
    }
  });
})();

