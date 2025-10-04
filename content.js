(() => {
<<<<<<< HEAD
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
=======
  console.log("💡 Content script loaded — fixed version");

  const HIGHLIGHT_CLASS = "highlighted-frase";
  const COLORS = {
    verdad: "rgba(0, 255, 100, 0.35)", // verde suave
    falso: "rgba(255, 80, 80, 0.35)",  // rojo suave
    NA: "rgba(221, 212, 39, 0.4)"          // celeste
  };

  let highlightsVisible = true;
  let analisis = [];

  // ---- Loaders ----
  async function loadFrases() {
    const url = chrome.runtime.getURL("frases-originales.json");
    const res = await fetch(url);
    const data = await res.json();
    return data.frases_originales_detectadas || [];
  }

  async function loadAnalisis() {
    const url = chrome.runtime.getURL("frases-analisis.json");
    const res = await fetch(url);
    const data = await res.json();
    analisis = data.analisis || [];
    return analisis;
  }

  // ---- Utils ----
  function stripAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Ignora acentos, mayúsculas y puntuación final
  function buildAccentInsensitiveRegex(phrase) {
    const clean = phrase.replace(/[.!?;:,]+$/, "");
    const pattern = stripAccents(clean)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/a/g, "[aáàäâAÁÀÄÂ]")
      .replace(/e/g, "[eéèëêEÉÈËÊ]")
      .replace(/i/g, "[iíìïîIÍÌÏÎ]")
      .replace(/o/g, "[oóòöôOÓÒÖÔ]")
      .replace(/u/g, "[uúùüûUÚÙÜÛ]")
      .replace(/n/g, "[nñNÑ]")
      .replace(/c/g, "[cçCÇ]");
    return new RegExp(pattern, "gi");
  }

  function clearHighlights() {
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
      el.replaceWith(document.createTextNode(el.textContent));
    });
  }

  // ---- Core logic ----
  async function highlightAllPhrases() {
    clearHighlights();

    const frases = await loadFrases();
    await loadAnalisis();

    // Precompila todos los regex para eficiencia
    const regexData = frases.map((f, i) => ({
      regex: buildAccentInsensitiveRegex(f),
      index: i,
      color: COLORS[analisis[i]?.resultado || "NA"]
    }));

    // Recolectar nodos de texto
    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (
        node.nodeValue.trim().length > 0 &&
        node.parentNode &&
        node.parentNode.nodeName !== "SCRIPT" &&
        node.parentNode.nodeName !== "STYLE"
      ) {
        textNodes.push(node);
      }
    }

    console.log(`🧩 Analizando ${textNodes.length} nodos de texto...`);

    textNodes.forEach((node) => {
      const text = node.nodeValue;
      let modified = false;
      let replaced = text;

      // aplicar todos los regex sobre el texto original
      regexData.forEach(({ regex, index, color }) => {
        replaced = replaced.replace(regex, (match) => {
          modified = true;
          return `<span class="${HIGHLIGHT_CLASS}" data-frase-index="${index + 1}" 
            style="background:${highlightsVisible ? color : "none"};
                   border-radius:3px; padding:2px;">${match}</span>`;
        });
      });

      if (modified) {
        const span = document.createElement("span");
        span.innerHTML = replaced;
        node.parentNode.replaceChild(span, node);
      }
    });

    // --- Send info back to popup ---
    const blocks = frases.map((f, i) => ({
      index: i + 1,
      preview: f.slice(0, 200) + (f.length > 200 ? "…" : ""),
      resultado: analisis[i]?.resultado,
      respuesta: analisis[i]?.respuesta,
      paths: analisis[i]?.paths
    }));

    chrome.runtime.sendMessage({ blocks });
    console.log(`✅ ${blocks.length} frases analizadas y resaltadas.`);
    return frases.length;
  }

  // ---- Message handling ----
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "getBlocks") {
      await highlightAllPhrases();
      sendResponse({ success: true });
      return true;
    }

    if (request.action === "setHighlightVisibility") {
      highlightsVisible = request.enabled;
      document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
        const idx = parseInt(el.dataset.fraseIndex) - 1;
        const color = COLORS[analisis[idx]?.resultado || "NA"];
        el.style.background = highlightsVisible ? color : "none";
      });
    }

    if (request.action === "scrollToBlock") {
      const el = document.querySelector(
        `.${HIGHLIGHT_CLASS}[data-frase-index="${request.index}"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transition = "background 0.5s ease";
        el.style.background = "yellow";
        setTimeout(() => {
          const color = COLORS[analisis[request.index - 1]?.resultado || "NA"];
          el.style.background = color;
        }, 1000);
      }
    }
  });
>>>>>>> 360b3439159303a8c1aaeefaf32fe45190ed9158
})();
