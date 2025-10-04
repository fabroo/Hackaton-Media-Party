function showResult(blocks) {
  const resultDiv = document.getElementById('result');
  if (!blocks || !blocks.length) {
    resultDiv.innerHTML = '<div style="padding:10px;color:#999;">No se encontraron bloques</div>';
    return;
  }
  resultDiv.innerHTML = blocks
    .map(
      (b) =>
        `<div class="block ${b.tag}" data-index="${b.index}">
           <span><strong>[${b.index}]</strong> ${b.preview}</span>
         </div>`
    )
    .join('');
  // add listeners
  resultDiv.querySelectorAll('.block').forEach((el) => {
    el.addEventListener('click', async () => {
      const idx = parseInt(el.dataset.index);
      const tab = await getActiveTab();
      await sendMessageToTab(tab.id, { action: 'scrollToBlock', index: idx });
    });
  });
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendMessageToTab(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    console.warn('Error sending message to tab', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnShow = document.getElementById('show-blocks');
  const toggleSlider = document.getElementById('toggle-highlights');

  btnShow.addEventListener('click', async () => {
    const tab = await getActiveTab();
    if (!tab) return;
    await sendMessageToTab(tab.id, { action: 'getBlocks' });
  });

  toggleSlider.addEventListener('change', async (e) => {
    const tab = await getActiveTab();
    if (!tab) return;
    await sendMessageToTab(tab.id, { action: 'setHighlights', enabled: e.target.checked });
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request && request.blocks) {
      showResult(request.blocks);
    }
  });
});
