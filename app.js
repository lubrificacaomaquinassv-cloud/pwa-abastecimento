const STORAGE_KEY = "comboio-fuel-records";
const RECEIPTS_STORAGE_KEY = "comboio-fuel-receipts";
const PENDING_SYNC_STORAGE_KEY = "comboio-pending-sync-events";
const ORDER_SEQ_KEY = "comboio-order-seq";
const POST_FUEL_OPTIONS = [
  "Gasolina Comum",
  "Etanol Comum",
  "Diesel S-10",
  "Diesel S-500 Aditivado",
  "Diesel S-500 Comum",
];
const RECEIPT_FUEL_OPTIONS = [...POST_FUEL_OPTIONS];
const API_BASE_URL = (window.APP_API_BASE_URL || "").replace(/\/$/, "");

function syncPostUrl() {
  if (!API_BASE_URL) return "";
  if (API_BASE_URL.indexOf("script.google.com") !== -1) return API_BASE_URL;
  return `${API_BASE_URL}/lancamentos`;
}

const form = document.getElementById("fuel-form");
const receiptForm = document.getElementById("receipt-form");
const workspacePosto = document.getElementById("workspace-posto");
const workspaceComboio = document.getElementById("workspace-comboio");
const trailingConfig = document.getElementById("trailing-config");
const trailingInforme = document.getElementById("trailing-informe");
const gateScreen = document.getElementById("gate-screen");
const appScreen = document.getElementById("app-screen");
const gatePostoButton = document.getElementById("gate-posto");
const gateComboioButton = document.getElementById("gate-comboio");
const changeAreaButton = document.getElementById("change-area");
const areaLabel = document.getElementById("area-label");
const appWorkflowHeading = document.getElementById("app-workflow-heading");
const appWorkflowSub = document.getElementById("app-workflow-sub");
const DOCUMENT_TITLE_DEFAULT = "CONTROLE DE ABASTECIMENTO DE FROTA";
const fuelDateTimeInput = document.getElementById("fuelDateTime");
const receiptDateTimeInput = document.getElementById("receiptDateTime");
const recentPostoList = document.getElementById("recent-posto-list");
const recentComboioList = document.getElementById("recent-comboio-list");
const nextOrderPreview = document.getElementById("next-order-preview");
const connectionStatus = document.getElementById("connection-status");
const dbSyncStatus = document.getElementById("db-sync-status");
const fuelTypeSelect = document.getElementById("fuelType");
const receiptFuelTypeSelect = document.getElementById("receiptFuelType");
const fuelSettingsForm = document.getElementById("fuel-settings-form");
const newFuelOptionInput = document.getElementById("new-fuel-option");
const fuelOptionsList = document.getElementById("fuel-options-list");
const lubeObservationWrap = document.getElementById("lube-observation-wrap");
const lubeObservationInput = document.getElementById("lubeObservation");
const secaoCombustivel = document.getElementById("secao-combustivel");
const secaoLubrificacao = document.getElementById("secao-lubrificacao");

// ── Tipo de servico ──────────────────────────────────────────
function getTipoServico() {
  const checked = receiptForm.querySelector('input[name="tipoServico"]:checked');
  return checked ? checked.value : "abastecimento";
}

function atualizarSecoesPorTipo() {
  const tipo = getTipoServico();
  const isAbast = tipo === "abastecimento";
  const isLub   = tipo === "lubrificacao";
  const isAmbos = tipo === "ambos";

  // Combustivel: aparece em abastecimento e ambos
  secaoCombustivel.classList.toggle("hidden", isLub);
  receiptFuelTypeSelect.required = !isLub;
  document.getElementById("receiptLiters").required = !isLub;

  // Lubrificacao: aparece em lubrificacao e ambos
  secaoLubrificacao.classList.toggle("hidden", isAbast);
}

receiptForm.querySelectorAll('input[name="tipoServico"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    atualizarSecoesPorTipo();
    toggleLubeObservationField();
  });
});

// ── Trailing blocks ──────────────────────────────────────────
function attachTrailingBlocks(mode) {
  if (mode === "posto") {
    workspacePosto.appendChild(trailingConfig);
    workspacePosto.appendChild(trailingInforme);
  } else {
    workspaceComboio.appendChild(trailingConfig);
    workspaceComboio.appendChild(trailingInforme);
  }
}

function showGate() {
  document.title = DOCUMENT_TITLE_DEFAULT;
  gateScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
  window.scrollTo(0, 0);
}

function enterWorkspace(mode) {
  gateScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  const isPosto = mode === "posto";
  workspacePosto.classList.toggle("hidden", !isPosto);
  workspaceComboio.classList.toggle("hidden", isPosto);
  attachTrailingBlocks(mode);
  if (!isPosto) {
    updateOrderPreview();
    atualizarSecoesPorTipo();
  }
  areaLabel.textContent = isPosto
    ? "Fluxo do posto (escolhido no inicio). Nada do comboio nesta tela."
    : "Fluxo do comboio (escolhido no inicio). Nada do posto nesta tela.";
  if (appWorkflowHeading && appWorkflowSub) {
    appWorkflowHeading.textContent = isPosto ? "Posto de abastecimento" : "Comboio";
    appWorkflowSub.textContent = isPosto
      ? "Voce escolheu posto no inicio. Abaixo so entra lancamento do posto fixo."
      : "Voce escolheu comboio no inicio. Abaixo so entra recebimento e servico no campo.";
  }
  document.title = isPosto ? "Posto | Abastecimento frota" : "Comboio | Abastecimento frota";
  fillFuelSelects();
  renderFuelOptionsSettings();
  window.scrollTo(0, 0);
}

// ── Data/hora ────────────────────────────────────────────────
function getNowLocalDateTimeInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoFromDateTimeLocal(value) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function setDefaultDateTimes() {
  if (!fuelDateTimeInput.value) fuelDateTimeInput.value = getNowLocalDateTimeInputValue();
  if (!receiptDateTimeInput.value) receiptDateTimeInput.value = getNowLocalDateTimeInputValue();
}

// ── Ordem ────────────────────────────────────────────────────
function peekNextOrderNumber() {
  const n = Number(localStorage.getItem(ORDER_SEQ_KEY) || "0") + 1;
  return `COM-${String(n).padStart(5, "0")}`;
}

function assignNextOrderNumber() {
  const n = Number(localStorage.getItem(ORDER_SEQ_KEY) || "0") + 1;
  localStorage.setItem(ORDER_SEQ_KEY, String(n));
  return `COM-${String(n).padStart(5, "0")}`;
}

function updateOrderPreview() {
  nextOrderPreview.textContent = `Proxima ordem ao salvar: ${peekNextOrderNumber()}`;
}

// ── Observacao lubrificacao ──────────────────────────────────
function toggleLubeObservationField() {
  const tipo = getTipoServico();
  if (tipo === "abastecimento") {
    lubeObservationWrap.classList.add("hidden");
    lubeObservationInput.required = false;
    return;
  }
  const actions = [...receiptForm.querySelectorAll('input[name="lubeActions"]:checked')].map(n => n.value);
  const requiresObs = actions.includes("corretiva") || actions.includes("completar_nivel");
  lubeObservationWrap.classList.toggle("hidden", !requiresObs);
  lubeObservationInput.required = requiresObs;
  if (!requiresObs) lubeObservationInput.value = "";
}

// ── ID ───────────────────────────────────────────────────────
function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// ── Storage ──────────────────────────────────────────────────
function getRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveRecords(r) { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); }

function getReceipts() {
  try { return JSON.parse(localStorage.getItem(RECEIPTS_STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveReceipts(r) { localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(r)); }

function getPendingSyncEvents() {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_SYNC_STORAGE_KEY) || "[]");
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}
function savePendingSyncEvents(e) { localStorage.setItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(e)); }

// ── Sync status ──────────────────────────────────────────────
function updateDbSyncStatus(customText) {
  const pending = getPendingSyncEvents().length;
  if (!API_BASE_URL) {
    dbSyncStatus.textContent = "Banco nao configurado.";
    dbSyncStatus.className = "connection-status offline";
    return;
  }
  if (pending === 0) {
    dbSyncStatus.textContent = customText || "Sincronizacao com banco em dia.";
    dbSyncStatus.className = "connection-status online";
    return;
  }
  dbSyncStatus.textContent = `${pending} lancamento(s) aguardando envio ao banco.`;
  dbSyncStatus.className = "connection-status offline";
}

async function processPendingSyncEvents() {
  if (!API_BASE_URL || !navigator.onLine) { updateDbSyncStatus(); return; }
  let queue = getPendingSyncEvents();
  while (queue.length) {
    const event = queue[0];
    try {
      const url = syncPostUrl() + "?payload=" + encodeURIComponent(JSON.stringify(event));
      const response = await fetch(url);
      const text = await response.text();
      let data = null;
      try { data = JSON.parse(text); } catch { break; }
      if (!data || data.ok === false) { console.error("Sync recusado:", data && data.error); break; }
      queue = queue.slice(1);
      savePendingSyncEvents(queue);
    } catch { break; }
  }
  updateDbSyncStatus();
}

function enqueueSyncEvent(type, payload) {
  const queue = getPendingSyncEvents();
  const ev = { id: makeId(), type, payload, createdAt: new Date().toISOString() };
  const shSecret = typeof window !== "undefined" && window.SHEETS_SYNC_SECRET;
  if (shSecret && String(shSecret).trim()) ev.secret = String(shSecret).trim();
  queue.push(ev);
  savePendingSyncEvents(queue);
  updateDbSyncStatus();
  processPendingSyncEvents();
}

// ── Combustiveis ─────────────────────────────────────────────
function getUniqueFuelOptions() {
  return [...new Set([...POST_FUEL_OPTIONS, ...RECEIPT_FUEL_OPTIONS])].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function renderFuelOptionsSettings() {
  const options = getUniqueFuelOptions();
  fuelOptionsList.innerHTML = "";
  options.forEach((fuel) => {
    const item = document.createElement("li");
    item.className = "fuel-option-item";
    item.innerHTML = `<span>${fuel}</span><span>Regra fixa</span>`;
    fuelOptionsList.appendChild(item);
  });
}

function fillFuelSelects() {
  if (!fuelTypeSelect || !receiptFuelTypeSelect) return;
  const selPosto = fuelTypeSelect.value;
  const selComboio = receiptFuelTypeSelect.value;

  fuelTypeSelect.innerHTML = "<option value=''>Selecione</option>";
  POST_FUEL_OPTIONS.forEach((f) => {
    const o = document.createElement("option");
    o.value = o.textContent = f;
    fuelTypeSelect.appendChild(o);
  });

  receiptFuelTypeSelect.innerHTML = "<option value=''>Selecione</option>";
  RECEIPT_FUEL_OPTIONS.forEach((f) => {
    const o = document.createElement("option");
    o.value = o.textContent = f;
    receiptFuelTypeSelect.appendChild(o);
  });

  if (selPosto && POST_FUEL_OPTIONS.includes(selPosto)) fuelTypeSelect.value = selPosto;
  if (selComboio && RECEIPT_FUEL_OPTIONS.includes(selComboio)) receiptFuelTypeSelect.value = selComboio;
}

// ── Render listas recentes ───────────────────────────────────
function renderRecentPosto() {
  const last5 = getRecords().filter(r => r.source === "posto" || !r.source).slice(-5).reverse();
  recentPostoList.innerHTML = "";
  if (!last5.length) {
    recentPostoList.innerHTML = "<li class='recent-item recent-empty'><span class='recent-cell'>Nenhum abastecimento ainda.</span></li>";
    return;
  }
  last5.forEach((r) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.setAttribute("role", "row");
    li.innerHTML = `
      <span class="recent-cell">${escapeHtml(String(r.vehicle || "-"))}</span>
      <span class="recent-cell">${escapeHtml(String(r.fuelType || "-"))}</span>
      <span class="recent-cell">${escapeHtml(String(r.liters || "0"))} L</span>
    `;
    recentPostoList.appendChild(li);
  });
}

function renderRecentComboio() {
  const last5 = getReceipts().slice(-5).reverse();
  recentComboioList.innerHTML = "";
  if (!last5.length) {
    recentComboioList.innerHTML = "<li class='recent-item recent-item-4 recent-empty'><span class='recent-cell'>Nenhum servico ainda.</span></li>";
    return;
  }
  last5.forEach((r) => {
    const li = document.createElement("li");
    li.className = "recent-item recent-item-4";
    li.setAttribute("role", "row");
    const tipo = r.tipoServico === "lubrificacao" ? "Lub" : r.tipoServico === "ambos" ? "Ambos" : "Abast";
    const qty = r.tipoServico === "lubrificacao" ? "-" : `${escapeHtml(String(r.liters || "0"))} L`;
    li.innerHTML = `
      <span class="recent-cell">${escapeHtml(String(r.orderNumber || "-"))}</span>
      <span class="recent-cell">${escapeHtml(String(r.vehicle || "-"))}</span>
      <span class="recent-cell">${tipo}</span>
      <span class="recent-cell">${qty}</span>
    `;
    recentComboioList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderAll() {
  renderRecentPosto();
  renderRecentComboio();
}

function updateConnectionStatus() {
  if (navigator.onLine) {
    connectionStatus.textContent = "Online";
    connectionStatus.className = "connection-status online";
  } else {
    connectionStatus.textContent = "Offline - os dados continuam salvos localmente";
    connectionStatus.className = "connection-status offline";
  }
}

// ── Submit Posto ─────────────────────────────────────────────
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const fuelType = String(formData.get("fuelType") || "").trim();
  if (!POST_FUEL_OPTIONS.includes(fuelType)) return;

  const record = {
    id: makeId(),
    vehicle: formData.get("vehicle"),
    fuelType,
    liters: Number(formData.get("liters")).toFixed(1),
    hourmeterOdometer: String(formData.get("hourmeterOdometer") || "").trim(),
    workFront: String(formData.get("workFront") || "").trim(),
    workType: String(formData.get("workType") || "").trim(),
    source: "posto",
    createdAt: toIsoFromDateTimeLocal(String(formData.get("fuelDateTime") || "")),
  };

  const records = getRecords();
  records.push(record);
  saveRecords(records);
  enqueueSyncEvent("abastecimento", record);
  form.reset();
  fuelDateTimeInput.value = getNowLocalDateTimeInputValue();
  fillFuelSelects();
  renderFuelOptionsSettings();
  renderAll();
});

// ── Submit Comboio ───────────────────────────────────────────
receiptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(receiptForm);
  const tipo = getTipoServico();

  // Validacao combustivel (somente se nao for só lubrificacao)
  if (tipo !== "lubrificacao") {
    const fuelType = String(formData.get("receiptFuelType") || "").trim();
    if (!RECEIPT_FUEL_OPTIONS.includes(fuelType)) return;
  }

  // Validacao observacao lubrificacao
  const lubeActions = formData.getAll("lubeActions");
  if (tipo !== "abastecimento") {
    const requiresObs = lubeActions.includes("corretiva") || lubeActions.includes("completar_nivel");
    const lubeObservation = String(formData.get("lubeObservation") || "").trim();
    if (requiresObs && !lubeObservation) return;
  }

  const orderNumber = assignNextOrderNumber();
  const fuelType = tipo !== "lubrificacao" ? String(formData.get("receiptFuelType") || "").trim() : "";
  const litersRaw = formData.get("receiptLiters");
  const liters = tipo !== "lubrificacao" && litersRaw ? Number(litersRaw).toFixed(1) : "0.0";

  const receipt = {
    id: makeId(),
    orderNumber,
    tipoServico: tipo,
    vehicle: String(formData.get("receiptVehicle") || "").trim(),
    fuelType,
    liters,
    location: String(formData.get("receiptLocation") || "").trim(),
    workType: String(formData.get("receiptWorkType") || "").trim(),
    hourmeterOdometer: String(formData.get("receiptHourmeter") || "").trim(),
    lubrication: tipo !== "abastecimento" ? {
      actions: lubeActions,
      oilLine1: String(formData.get("lubeOilType1") || "").trim(),
      oilLine2: String(formData.get("lubeOilType2") || "").trim(),
      oilLine3: String(formData.get("lubeOilType3") || "").trim(),
      filterLine1: String(formData.get("lubeFilterType1") || "").trim(),
      filterLine2: String(formData.get("lubeFilterType2") || "").trim(),
      observation: String(formData.get("lubeObservation") || "").trim(),
    } : null,
    source: "comboio",
    createdAt: toIsoFromDateTimeLocal(String(formData.get("receiptDateTime") || "")),
  };

  const receipts = getReceipts();
  receipts.push(receipt);
  saveReceipts(receipts);
  enqueueSyncEvent("recebimento", receipt);
  receiptForm.reset();
  receiptDateTimeInput.value = getNowLocalDateTimeInputValue();
  atualizarSecoesPorTipo();
  toggleLubeObservationField();
  updateOrderPreview();
  fillFuelSelects();
  renderFuelOptionsSettings();
  renderAll();
});

fuelSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  window.alert("Acao bloqueada: configuracoes so podem ser conciliadas pelo responsavel.");
  newFuelOptionInput.value = "";
});

gatePostoButton.addEventListener("click", () => enterWorkspace("posto"));
gateComboioButton.addEventListener("click", () => enterWorkspace("comboio"));
changeAreaButton.addEventListener("click", () => showGate());

receiptForm.querySelectorAll('input[name="lubeActions"]').forEach((checkbox) => {
  checkbox.addEventListener("change", toggleLubeObservationField);
});

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("online", processPendingSyncEvents);

// ── Service Worker ───────────────────────────────────────────
const SW_URL = "./sw.js?v=17";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { updateViaCache: "none" });
      reg.update();
    } catch (error) {
      console.error("Falha ao registrar service worker:", error);
    }
  });
}

// ── Init ─────────────────────────────────────────────────────
fillFuelSelects();
renderFuelOptionsSettings();
setDefaultDateTimes();
atualizarSecoesPorTipo();
toggleLubeObservationField();
updateOrderPreview();
updateConnectionStatus();
updateDbSyncStatus();
processPendingSyncEvents();
renderAll();
