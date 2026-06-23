const STORAGE_KEY = "comboio-fuel-records";
const PENDING_SYNC_STORAGE_KEY = "comboio-pending-sync-events";

/** Combustiveis padronizados (jun/2026) — mesma grafia em todo o sistema. */
const FUEL_S500 = "DIESEL S-500 ADITIVADO";
const FUEL_S10 = "DIESEL S-10";
const FUEL_GASOLINA = "GASOLINA COMUM";
const POST_FUEL_OPTIONS = [FUEL_S500, FUEL_S10, FUEL_GASOLINA];

/** Veiculos leves — placa aprovada pela gerencia (nao digitar). */
const POSTO_FLEET_LEVE = [
  { code: "SMC7D44", model: "KWID" },
  { code: "SMC8I91", model: "KWID" },
  { code: "SLZ8I55", model: "KWID" },
  { code: "RWG5D98", model: "TORO" },
  { code: "SMA6B13", model: "TORO" },
  { code: "TMH8J55", model: "SAVEIRO" },
  { code: "RUQ3C15", model: "VAN" },
  { code: "SML2C36", model: "RANGER" },
  { code: "FJY3A25", model: "GOL" },
  { code: "OOH4A79", model: "AMAROK" },
  { code: "AGH7924", model: "S10" },
  ];

/** Frota operacional no posto — planilha FROTA_POSTO.xlsx (gerencia, jun/2026). */
const POSTO_FROTA_OPERACIONAL = [
  { code: "3385", model: "CARGO 1615" },
  { code: "3315", model: "MB - 2426" },
  { code: "3355", model: "MB - 2638" },
  { code: "3383", model: "MB - 2638" },
  { code: "3267", model: "MB - 2831 AXOR" },
  { code: "3381", model: "MB - 3340 AXOR" },
  { code: "3316", model: "MB 1016" },
  { code: "3349", model: "MB 1620" },
  { code: "3272", model: "PA VOLVO" },
  { code: "3320", model: "HARVESTER" },
  { code: "3362", model: "GERADOR 13,3 KVA" },
  { code: "3365", model: "GERADOR 13,3" },
  { code: "3359", model: "GERADOR B4T 8000" },
  { code: "3372", model: "GERADOR B4T12000E3" },
  { code: "3321", model: "GERADOR MOVEL 83 KVA" },
  { code: "3149", model: "GERADOR SEDE" },
  { code: "3150", model: "GERADOR VIVEIRO" },
  { code: "3347", model: "CRF 250F" },
  { code: "3353", model: "CRF 250F" },
  { code: "3373", model: "CRF 250F" },
  { code: "3401", model: "XRE 160 BROS" },
  { code: "3379", model: "XRE 190" },
  { code: "3367", model: "XRE 300" },
  { code: "3392", model: "XRE 300" },
  { code: "Yama", model: "NEO" },
  { code: "3285", model: "PATROL G930" },
  { code: "3391", model: "QUADRICICLO" },
  { code: "3072", model: "REBOQUE" },
  { code: "3019", model: "TRATOR AGRALE" },
  { code: "3368", model: "A114L 4X4" },
  { code: "3369", model: "A114L 4X4" },
  { code: "3337", model: "BH 180 4X4" },
  { code: "3336", model: "BH 180 HI-FLOW 4X4" },
  { code: "3350", model: "BH 224I" },
  { code: "3396", model: "T6" },
  { code: "3380", model: "T7 245" },
  { code: "3402", model: "T7 260" },
  { code: "3393", model: "TL5. 100" },
  { code: "3394", model: "TL5. 100" },
  { code: "3345", model: "PA SDLG L938" },
  { code: "3354", model: "PA SDLG L936" },
  { code: "3283", model: "MF 275" },
  { code: "3281", model: "MF 4290" },
  { code: "3014", model: "TMO 1580" },
  { code: "3305", model: "BM 110" },
  { code: "3306", model: "BM 110" },
  { code: "3363", model: "BH 224" },
  { code: "3307", model: "BM 125" },
  { code: "920K", model: "Cat920" },
];

/** Itens operacionais avulsos (gasolina/equipamentos na sede). */
const POSTO_FROTA_AVULSOS = [
  { code: "DRONE", model: "DRONE" },
  { code: "ROCADEIRA", model: "ROCADEIRA" },
  { code: "MOTOPODA", model: "MOTOPODA" },
  { code: "MOTOSERRA", model: "MOTOSERRA" },
  { code: "GALAO", model: "GALAO" },
  { code: "MICHEL", model: "MICHEL" },
  { code: "EDIVALDO", model: "EDIVALDO" },
  { code: "LUIZ", model: "LUIZ" },
  { code: "AJM", model: "AJM" },
  { code: "5A60", model: "ACENIR" },
  { code: "5555", model: "AILTON" },
 ];

const POSTO_VEHICLE_GROUPS = [
  { label: "Veiculos leves (placa)", items: POSTO_FLEET_LEVE },
  { label: "Frota operacional (codigo)", items: POSTO_FROTA_OPERACIONAL },
  { label: "Itens operacionais (avulsos)", items: POSTO_FROTA_AVULSOS },
];

const POSTO_VEHICLE_CODES = POSTO_VEHICLE_GROUPS.flatMap((g) => g.items.map((i) => i.code));
const API_BASE_URL = (window.APP_API_BASE_URL || "").replace(/\/$/, "");
const SUPABASE_URL = (window.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

function usesSupabaseSync() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function syncBackendReady() {
  return usesSupabaseSync() || Boolean(API_BASE_URL);
}

function syncPostUrl() {
  if (!API_BASE_URL) return "";
  if (API_BASE_URL.indexOf("script.google.com") !== -1) return API_BASE_URL;
  return `${API_BASE_URL}/lancamentos`;
}

function supabaseHeaders(prefer) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

function mapPostoRow(payload, createdAt) {
  return {
    id: payload.id,
    vehicle: String(payload.vehicle || "").trim(),
    fuel_type: String(payload.fuelType || "").trim(),
    liters: Number(payload.liters),
    operator: String(payload.operatorDriver || "").trim() || null,
    hourmeter: String(payload.hourmeterOdometer || "").trim() || null,
    work_front: String(payload.workFront || "").trim() || null,
    work_type: String(payload.workType || "").trim() || null,
    created_at: payload.createdAt || createdAt,
    synced_at: new Date().toISOString(),
  };
}

async function supabaseInsertPosto(row) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/posto`, {
    method: "POST",
    headers: supabaseHeaders("return=minimal"),
    body: JSON.stringify(row),
  });
  if (response.ok || response.status === 409) return { ok: true };
  return { ok: false, error: await response.text() };
}

async function syncEventToSupabase(event) {
  if (event.type !== "abastecimento") {
    return { ok: false, error: "tipo de evento invalido para posto" };
  }
  return supabaseInsertPosto(mapPostoRow(event.payload || {}, event.createdAt));
}

async function syncEventToLegacyApi(event) {
  const url = syncPostUrl();
  if (!url) return { ok: false, error: "API nao configurada" };

  const bodyObj = { ...event };
  const sec = typeof window.SHEETS_SYNC_SECRET === "string" ? window.SHEETS_SYNC_SECRET.trim() : "";
  if (sec) bodyObj.secret = sec;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  });

  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: text || "resposta invalida" };
  }
  if (!response.ok || !data || data.ok === false) {
    return { ok: false, error: (data && data.error) || text };
  }
  return { ok: true };
}

async function sendSyncEvent(event) {
  if (usesSupabaseSync()) return syncEventToSupabase(event);
  return syncEventToLegacyApi(event);
}

const form = document.getElementById("fuel-form");
const fuelDateTimeInput = document.getElementById("fuelDateTime");
const recentPostoList = document.getElementById("recent-posto-list");
const connectionStatus = document.getElementById("connection-status");
const dbSyncStatus = document.getElementById("db-sync-status");
const fuelTypeSelect = document.getElementById("fuelType");
const vehicleSelect = document.getElementById("vehicle");
const vehicleSearchInput = document.getElementById("vehicleSearch");
let vehicleFilterQuery = "";
const fuelSettingsForm = document.getElementById("fuel-settings-form");
const newFuelOptionInput = document.getElementById("new-fuel-option");
const fuelOptionsList = document.getElementById("fuel-options-list");

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
  if (!fuelDateTimeInput.value) {
    fuelDateTimeInput.value = getNowLocalDateTimeInputValue();
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function getRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getPendingSyncEvents() {
  const raw = localStorage.getItem(PENDING_SYNC_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePendingSyncEvents(events) {
  localStorage.setItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(events));
}

function updateDbSyncStatus(customText) {
  const pending = getPendingSyncEvents().length;
  if (!syncBackendReady()) {
    dbSyncStatus.textContent = "Banco nao configurado (Supabase ou APP_API_BASE_URL).";
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
  if (!syncBackendReady() || !navigator.onLine) {
    updateDbSyncStatus();
    return;
  }
  let queue = getPendingSyncEvents();
  while (queue.length) {
    const event = queue[0];
    try {
      const result = await sendSyncEvent(event);
      if (!result.ok) {
        console.error("Sync recusado:", result.error);
        break;
      }
      queue = queue.slice(1);
      savePendingSyncEvents(queue);
    } catch (error) {
      console.error("Sync falhou:", error);
      break;
    }
  }
  updateDbSyncStatus();
}

function enqueueSyncEvent(type, payload) {
  const queue = getPendingSyncEvents();
  const ev = {
    id: makeId(),
    type,
    payload,
    createdAt: new Date().toISOString(),
  };
  const shSecret = typeof window.SHEETS_SYNC_SECRET === "string" ? window.SHEETS_SYNC_SECRET.trim() : "";
  if (shSecret) ev.secret = shSecret;
  queue.push(ev);
  savePendingSyncEvents(queue);
  updateDbSyncStatus();
  processPendingSyncEvents();
}

function getUniqueFuelOptions() {
  const records = getRecords();
  const dynamicOptions = records.map((record) => record.fuelType);
  return [...new Set([...POST_FUEL_OPTIONS, ...dynamicOptions])].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

function renderFuelOptionsSettings() {
  const options = getUniqueFuelOptions();
  fuelOptionsList.innerHTML = "";

  if (!options.length) {
    fuelOptionsList.innerHTML =
      "<li class='fuel-option-item'><span>Nenhum combustivel cadastrado.</span></li>";
    return;
  }

  options.forEach((fuel) => {
    const item = document.createElement("li");
    item.className = "fuel-option-item";
    item.innerHTML = `
      <span>${fuel}</span>
      <span>Regra fixa</span>
    `;
    fuelOptionsList.appendChild(item);
  });
}

function normSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function vehicleMatchesFilter(code, model, query) {
  if (!query) return true;
  const hay = normSearchText(`${code} ${model}`);
  return hay.includes(normSearchText(query));
}

function resetVehicleSearch() {
  vehicleFilterQuery = "";
  if (vehicleSearchInput) vehicleSearchInput.value = "";
}

function fillVehicleSelect() {
  if (!vehicleSelect) return;
  const selected = vehicleSelect.value;
  vehicleSelect.innerHTML = "<option value=''>Selecione a frota</option>";
  let matchCount = 0;
  POSTO_VEHICLE_GROUPS.forEach(({ label, items }) => {
    const filtered = items.filter(({ code, model }) =>
      vehicleMatchesFilter(code, model, vehicleFilterQuery)
    );
    if (!filtered.length) return;
    const group = document.createElement("optgroup");
    group.label = label;
    filtered.forEach(({ code, model }) => {
      matchCount += 1;
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${code} · ${model}`;
      group.appendChild(option);
    });
    vehicleSelect.appendChild(group);
  });
  if (!matchCount && vehicleFilterQuery) {
    const empty = document.createElement("option");
    empty.value = "";
    empty.disabled = true;
    empty.textContent = "Nenhuma frota encontrada";
    vehicleSelect.appendChild(empty);
  }
  if (selected && POSTO_VEHICLE_CODES.includes(selected)) {
    vehicleSelect.value = selected;
  }
}

function fillFuelSelects() {
  if (!fuelTypeSelect) return;
  const selectedFuelType = fuelTypeSelect.value;
  fuelTypeSelect.innerHTML = "<option value=''>Selecione</option>";
  POST_FUEL_OPTIONS.forEach((fuelType) => {
    const option = document.createElement("option");
    option.value = fuelType;
    option.textContent = fuelType;
    fuelTypeSelect.appendChild(option);
  });
  if (selectedFuelType && POST_FUEL_OPTIONS.includes(selectedFuelType)) {
    fuelTypeSelect.value = selectedFuelType;
  }
}

function renderRecentPosto() {
  const postoRecords = getRecords().filter((r) => r.source === "posto" || !r.source);
  recentPostoList.innerHTML = "";
  const last5 = postoRecords.slice(-5).reverse();
  if (!last5.length) {
    recentPostoList.innerHTML =
      "<li class='recent-item recent-empty'><span class='recent-cell'>Nenhum abastecimento ainda.</span></li>";
    return;
  }
  last5.forEach((record) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.setAttribute("role", "row");
    li.innerHTML = `
      <span class="recent-cell">${escapeHtml(String(record.vehicle || "-"))}</span>
      <span class="recent-cell">${escapeHtml(String(record.fuelType || "-"))}</span>
      <span class="recent-cell">${escapeHtml(String(record.liters || "0"))} L</span>
    `;
    recentPostoList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const fuelType = String(formData.get("fuelType") || "").trim();
  const vehicle = String(formData.get("vehicle") || "").trim();
  if (!POST_FUEL_OPTIONS.includes(fuelType)) return;
  if (!POSTO_VEHICLE_CODES.includes(vehicle)) return;

  const record = {
    id: makeId(),
    vehicle,
    fuelType,
    liters: Number(formData.get("liters")).toFixed(1),
    operatorDriver: String(formData.get("operatorDriver") || "").trim(),
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
  resetVehicleSearch();
  fillFuelSelects();
  fillVehicleSelect();
  renderFuelOptionsSettings();
  renderRecentPosto();
});

fuelSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  window.alert("Acao bloqueada: configuracoes so podem ser conciliadas pelo responsavel.");
  newFuelOptionInput.value = "";
});

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("online", processPendingSyncEvents);

const SW_URL = "./sw.js?v=27";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, {
        updateViaCache: "none",
      });
      reg.update();
    } catch (error) {
      console.error("Falha ao registrar service worker:", error);
    }
  });
}

if (vehicleSearchInput) {
  vehicleSearchInput.addEventListener("input", () => {
    vehicleFilterQuery = String(vehicleSearchInput.value || "").trim();
    fillVehicleSelect();
  });
}

fillFuelSelects();
fillVehicleSelect();
renderFuelOptionsSettings();
setDefaultDateTimes();
updateConnectionStatus();
updateDbSyncStatus();
processPendingSyncEvents();
renderRecentPosto();
