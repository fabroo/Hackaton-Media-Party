(() => {
  console.log('Content script loaded on:', window.location.href);

  const STYLE_ID = 'simple-extension-style';
  const HIGHLIGHT_CLASS = 'simple-extension-highlight';
  const SUP_CLASS = 'simple-extension-sup';
  let highlightsVisible = false; // default OFF

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        outline: 2px solid #ff4081 !important;
        background: rgba(255,64,129,0.1) !important;
        scroll-margin-top: 100px;
        position: relative;
      }
      .${SUP_CLASS} {
        color: #ff4081;
        font-weight: bold;
        font-size: 0.75em;
        margin-left: 4px;
        user-select: none;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || !request.action) return;

    if (request.action === 'getBlocks') {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, p')).filter((el) => {
        const text = (el.textContent || '').trim();
        return text.length > 10 && isVisible(el);
      });

      const blockData = elements.map((el, i) => ({
        index: i + 1,
        tag: el.tagName.toLowerCase(),
        preview: el.textContent.trim().slice(0, 200) + (el.textContent.length > 200 ? '…' : '')
      }));

      chrome.runtime.sendMessage({ blocks: blockData });
      sendResponse({ success: true, count: elements.length });
      return true;
    }

    if (request.action === 'setHighlights') {
      highlightsVisible = request.enabled;
      if (highlightsVisible) {
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, p')).filter((el) => {
          const text = (el.textContent || '').trim();
          return text.length > 10 && isVisible(el);
        });
        injectMarkers(elements);
      } else {
        clearHighlights();
      }
    }

    if (request.action === 'scrollToBlock') {
      const el = document.querySelector(`[data-simple-block-index="${request.index}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        flash(el);
      }
    }
  });

  function injectMarkers(elements) {
    clearHighlights();
    elements.forEach((el, i) => {
      const index = i + 1;
      el.classList.add(HIGHLIGHT_CLASS);
      el.setAttribute('data-simple-block-index', index);

      const sup = document.createElement('sup');
      sup.textContent = `[${index}]`;
      sup.className = SUP_CLASS;
      sup.title = `${el.tagName} #${index}`;
      el.appendChild(sup);
    });
  }

  function clearHighlights() {
    document.querySelectorAll(`.${SUP_CLASS}`).forEach((el) => el.remove());
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
      el.classList.remove(HIGHLIGHT_CLASS);
      el.removeAttribute('data-simple-block-index');
      el.style.outlineStyle = 'none';
      el.style.background = 'none';
    });
  }

  function flash(el) {
    if (!highlightsVisible) return;
    el.style.transition = 'background 0.5s ease';
    el.style.background = '#fff59d';
    setTimeout(() => {
      el.style.background = 'rgba(255,64,129,0.1)';
    }, 1000);
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.height > 10 && rect.width > 50 && window.getComputedStyle(el).display !== 'none';
  }
})();
