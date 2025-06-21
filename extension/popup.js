// Utility to send a message to the content script and receive current UID
function getCurrentUid(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: 'GET_CURRENT_UID' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message error:', chrome.runtime.lastError.message);
          document.getElementById('logs').innerHTML = '<p class="empty">Please open Gmail and view a tracked email first.</p>';
          return resolve(null);
        }
        resolve(response && response.uid ? response.uid : null);
      }
    );
  });
}

(async () => {
  const container = document.getElementById('logs');
  const domain = 'your domian'; // e.g. xyz.onrender.com

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      container.innerHTML = '<p class="empty">No active tab</p>';
      return;
    }

    // Ask content script for the current email's UID
    const uid = await getCurrentUid(tab.id);
    if (!uid) {
      container.innerHTML = '<p class="empty">No tracking pixel found on this page.</p>';
      return;
    }

    // Fetch only logs for this UID
    const res = await fetch(`https://${domain}/logs?uid=${uid}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p class="empty">No opens logged yet.</p>';
      return;
    }

    // Build table
    const table = document.createElement('table');
    table.innerHTML = `
      <tr><th>Time</th><th>IP</th></tr>
      ${data.map(log => `
        <tr>
          <td>${new Date(log.time).toLocaleString()}</td>
          <td>${log.ip}</td>
        </tr>
      `).join('')}
    `;
    container.innerHTML = '';
    container.appendChild(table);
  } catch (err) {
    console.error('Popup error:', err);
    container.innerHTML = '<p class="empty">Error loading logs</p>';
  }
})();