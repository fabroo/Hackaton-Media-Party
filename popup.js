<<<<<<< HEAD
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

=======
// --- helpers ---
>>>>>>> 360b3439159303a8c1aaeefaf32fe45190ed9158
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

<<<<<<< HEAD
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
=======
async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }
}

async function sendMessageToTab(tabId, message) {
  await ensureContentScript(tabId);
  return chrome.tabs.sendMessage(tabId, message);
}

// --- render results ---
function showResult(blocks) {
  const resultDiv = document.getElementById("result");
  if (!blocks || !blocks.length) {
    resultDiv.innerHTML = '<div class="cyber-note-text">No se encontraron frases.</div>';
    return;
  }
  resultDiv.innerHTML = blocks
    .map(
      (b) => `
        <div class="cyber-note-card block-item" data-index="${b.index}">
          <p class="cyber-note-text"><strong>[${b.index}]</strong> ${b.preview}</p>
          <p style="margin-top:6px;font-size:13px;">
            <strong>Resultado:</strong> 
            <span style="color:${
              b.resultado === "verdad"
                ? "#00ff88"
                : b.resultado === "falso"
                ? "#ff4444"
                : "#00d4ff"
            }">${(b.resultado || "NA").toUpperCase()}</span>
          </p>
          <p style="font-size:12px;color:#cbd5e1;">${b.respuesta || ""}</p>
          ${
            b.paths && b.paths.length
              ? `<ul style="font-size:11px;color:#93c5fd;margin-top:4px;">${b.paths
                  .map(
                    (p) => `<li><a href="${p}" target="_blank" style="color:#38bdf8;">${p}</a></li>`
                  )
                  .join("")}</ul>`
              : ""
          }
        </div>`
    )
    .join("");

  document.querySelectorAll(".block-item").forEach((el) => {
    el.addEventListener("click", async () => {
      const idx = parseInt(el.dataset.index, 10);
      const tab = await getActiveTab();
      if (!tab) return;
      await sendMessageToTab(tab.id, { action: "scrollToBlock", index: idx });
    });
  });
}

// --- community notes demo ---
function loadCommunityNotes() {
  const communityNotes = document.getElementById("community-notes");
  const demoNotes = [
    {
      id: 1,
      index: 3,
      user: "Analista Político",
      avatar: "https://i.pravatar.cc/40?img=68",
      note: "Esta frase parece citar el decreto oficial del gobierno sobre el Día de la Niñez.",
      support: 14,
      date: "hace 2 horas",
    },
    {
      id: 2,
      index: 12,
      user: "Verificador de Datos",
      avatar: "https://i.pravatar.cc/40?img=45",
      note: "El monto mencionado coincide con los informes del hospital Garrahan 2024.",
      support: 9,
      date: "hace 1 hora",
    },
    {
      id: 3,
      index: 25,
      user: "Observatorio UCA",
      avatar: "https://i.pravatar.cc/40?img=23",
      note: "Corresponde al informe de pobreza infantil publicado en diciembre de 2024.",
      support: 21,
      date: "hace 3 horas",
    },
  ];

  communityNotes.innerHTML = demoNotes
    .map(
      (n) => `
      <div class="cyber-note-card" style="padding: 16px;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <img src="${n.avatar}" alt="${n.user}" class="cyber-avatar" 
               style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(0, 212, 255, 0.3);">
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="cyber-note-author">${n.user}</span>
              <span style="font-size: 12px; color: rgba(226, 232, 240, 0.6);">${n.date}</span>
            </div>
            <p style="margin-top: 8px; color: #cbd5e1; font-size: 14px;">${n.note}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
              <button data-index="${n.index}" 
                class="cyber-link-button link-frase"
                style="color: #00d4ff; font-size: 12px; font-weight: 500; background: none; border: none; cursor: pointer;">
                Ir al fragmento [${n.index}]
              </button>
              <span style="font-size: 12px; color: rgba(226, 232, 240, 0.5);">👍 ${n.support}</span>
            </div>
          </div>
        </div>
      </div>`
    )
    .join("");

  document.querySelectorAll(".link-frase").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      const tab = await getActiveTab();
      if (!tab) return;
      await sendMessageToTab(tab.id, { action: "scrollToBlock", index: idx });
    });
  });
}

// --- boot ---
document.addEventListener("DOMContentLoaded", () => {
  // tabs
  const tabDetectar = document.getElementById("tab-detectar");
  const tabNotas = document.getElementById("tab-notas");
  const panelDetectar = document.getElementById("panel-detectar");
  const panelNotas = document.getElementById("panel-notas");

  function setActiveTab(name) {
    const isDetectar = name === "detectar";
    panelDetectar.classList.toggle("hidden", !isDetectar);
    panelDetectar.classList.toggle("active", isDetectar);
    panelNotas.classList.toggle("hidden", isDetectar);
    panelNotas.classList.toggle("active", !isDetectar);

    tabDetectar.classList.toggle("active", isDetectar);
    tabNotas.classList.toggle("active", !isDetectar);
  }

  tabDetectar?.addEventListener("click", () => setActiveTab("detectar"));
  tabNotas?.addEventListener("click", () => {
    setActiveTab("notas");
    loadCommunityNotes();
  });

  // detectar
  const btnShow = document.getElementById("show-blocks");
  btnShow?.addEventListener("click", async () => {
    const tab = await getActiveTab();
    if (!tab) return;
    // simple loading state
    const prev = btnShow.textContent;
    btnShow.disabled = true;
    btnShow.textContent = "Analizando…";
    try {
      await sendMessageToTab(tab.id, { action: "getBlocks" });
    } finally {
      btnShow.disabled = false;
      btnShow.textContent = prev;
    }
  });

  // slider is optional now — guard against null
  const toggleSlider = document.getElementById("toggle-highlights");
  if (toggleSlider) {
    toggleSlider.addEventListener("change", async (e) => {
      const tab = await getActiveTab();
      if (!tab) return;
      await sendMessageToTab(tab.id, {
        action: "setHighlightVisibility",
        enabled: e.target.checked,
      });
    });
  }

  // receive results
  chrome.runtime.onMessage.addListener((request) => {
    if (request && request.blocks) showResult(request.blocks);
  });

  // default tab
  setActiveTab("detectar");
>>>>>>> 360b3439159303a8c1aaeefaf32fe45190ed9158
});
