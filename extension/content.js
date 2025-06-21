// content.js
console.log("📡 Gmail Pixel Tracker content script active (send‑only mode)");

// On Send click, insert pixel
document.body.addEventListener("click", (e) => {
  const sendBtn = e.target.closest('div[role="button"][aria-label^="Send"]');
  if (!sendBtn) return;
  const composeDialog = sendBtn.closest('div[role="dialog"]');
  if (!composeDialog) return;
  const bodyDiv = composeDialog.querySelector('div[aria-label="Message Body"]');
  if (!bodyDiv) return;
  if (composeDialog.dataset.pixelInjected) return;
  composeDialog.dataset.pixelInjected = "true";

  const uniqueId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.floor(Math.random()*1e6));
  console.log(`🛫 [Send] injecting pixel with ID: ${uniqueId}`);

  const img = document.createElement("img");
  img.src = `render url/pixel?uid=${uniqueId}`;
  img.width = 1;
  img.height = 1;
  img.style.opacity = "0.001";
  img.alt = "";
  bodyDiv.appendChild(img);
  console.log(`✅ Tracking pixel injected for ID: ${uniqueId}`);
});

// Listen for UID requests from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_CURRENT_UID') {
    // Find pixel img in opened email view
    const img = document.querySelector('img[src*="/pixel?uid="]');
    if (!img) return sendResponse({uid: null});
    const url = new URL(img.src);
    const uid = url.searchParams.get('uid');
    sendResponse({uid});
  }
});