(() => {
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
})();
