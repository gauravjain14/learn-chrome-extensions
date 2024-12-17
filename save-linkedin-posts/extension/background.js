chrome.runtime.onInstalled.addListener(() => {
    console.log('LinkedIn Post Saver installed');
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clearDatabases") {
      fetch("http://localhost:3000/clear-database", { method: "DELETE" })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  console.log("Database cleared successfully.");
                  sendResponse({ success: true });
              } else {
                  console.error("Failed to clear database:", data.message);
                  sendResponse({ success: false });
              }
          })
          .catch(error => {
              console.error("Error communicating with backend:", error);
              sendResponse({ success: false });
          });

      // Indicate asynchronous response
      return true;
  }

  if (message.action === 'clearChromaDB') {
    // Handle ChromaDB clearing
    fetch("http://localhost:8000/clear-chroma-db", { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("ChromaDB cleared successfully.");
                sendResponse({ success: true });
            } else {
                console.error("Failed to clear ChromaDB:", data.message);
                sendResponse({ success: false });
            }
        })
        .catch(error => {
            console.error("Error clearing ChromaDB:", error);
            sendResponse({ success: false });
        });

    return true; // Indicates async response
}
});