"use strict";

/* ═══════════ DATA CONSTANTS & DATASETS ═══════════ */
const HOURS = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
let TA   = [26.1,26.5,27.8,29.5,31.2,32.8,34.1,35.0,35.8,36.2,35.9,35.0,33.6,31.8,30.0,28.6,27.6];
let RH   = [82,80,76,70,63,57,52,48,45,44,45,48,53,59,66,72,77];
let APP  = [28.0,28.5,30.1,32.0,33.9,35.4,36.6,37.4,38.1,38.5,38.2,37.4,36.1,34.3,32.5,30.9,29.6];
let BASE = [24.0,24.5,25.8,27.2,28.6,29.8,30.8,31.5,32.0,32.3,32.0,31.2,30.0,28.4,26.8,25.5,24.6];

/* 8 Core Military Activity Master Database */
const UNIT_ACTIVITIES = [
  { id: "act_range", name: "🎯 사격 훈련", task: "easy", gear: "single", pax: 240, desc: "단독군장(전투복·방탄헬멧) 착용 영점/사격술 (+1.5°C 가산, 경작업 250W)" },
  { id: "act_fitness", name: "🏃 체력 측정", task: "vhard", gear: "pt", pax: 300, desc: "체육복/PT복 착용 3km 뜀걸음 및 훈련 (통풍 우수 -1.0°C 보정, 고강도 800W)" },
  { id: "act_march10", name: "🎒 10km 급속행군", task: "heavy", gear: "single", pax: 450, desc: "단독군장 전술 부하 행군 (중작업 600W, 단독군장 +1.5°C)" },
  { id: "act_march40", name: "⚔️ 40km 전술행군", task: "heavy", gear: "iba", pax: 600, desc: "45lb 완전군장 행군 (고부하 야외 노출, 완전군장/방탄복 +2.8°C)" },
  { id: "act_gaekae", name: "💥 각개전투 / 포복", task: "mod", gear: "single", pax: 350, desc: "장애물 극복 및 단독군장 전술 포복 (중등작업 425W, +1.5°C)" },
  { id: "act_cbrn", name: "☣️ 화생방 제독", task: "mod", gear: "cbrn", pax: 180, desc: "MOPP 4단계 전신 보호의 착용 (+11.1°C 가산)" },
  { id: "act_obstacle", name: "🧗 유격 / 장애물", task: "vhard", gear: "scu", pax: 280, desc: "전투복 착용 코스 장애물 극복 및 극기 훈련 (+0.0°C, 고강도 800W)" },
  /* 정적 과업 — 혹한기 한랭손상이 집중되는 과업군 (TB MED 508 표 3-1 Sedentary) */
  { id: "act_sentry", name: "🥶 경계 · 보초 근무", task: "static", gear: "ecwcs", pax: 60, desc: "정적 노출 지속 (1 MET) · 혹한기 한랭손상 최다 발생 과업 (방한복 3.4 clo)" },
  { id: "act_gate", name: "🚧 위병소 근무", task: "static", gear: "ecwcs", pax: 20, desc: "정적 노출 지속 (1 MET) · 주야 교대 노출" },
  { id: "act_ambush", name: "🫥 매복 · 관측", task: "static", gear: "ecwcs", pax: 40, desc: "장시간 정적 자세 유지 (1 MET) · 말초 순환 저하로 동상 위험 가중" },
  { id: "act_custom", name: "⚙️ 사용자 직접설정", task: "heavy", gear: "single", pax: 240, desc: "과업 및 복장 직접 선택" }
];

/* Military Task Metabolic Rates & Gear Adjustments (Celsius Basis)
   met: TB MED 508 표 3-1 「Intensity of exercise for selected military tasks」 기준 MET 등급
   ── 혹서기에는 대사율이 '부하'지만, 혹한기에는 대사열이 인체의 유일한 내부 열원이므로
      '방어'로 부호가 뒤집힌다. 따라서 정적 과업(1 MET)이 한랭에서는 최고 위험군이 된다. */
const TASKS = [
  { id: "static", name: "정적 과업 (1 MET)",  w: "~115 W/m²", met: 1.0,
    ex: "경계·보초 근무 · 위병소 근무 · 매복 · 관측 · 사격장 대기",
    src: "TB MED 508 표 3-1 Sedentary (Sentry duty · Gate duty)" },
  { id: "easy",  name: "경작업 (2~3 MET)",   w: "250 W", met: 2.5,
    ex: "총기 손질 · 영점 사격자세 · 제식 훈련 · 실내/그늘 강의",
    src: "TB MED 508 표 3-1 Easy work (Weapon maintenance · Drill and ceremony)" },
  { id: "mod",   name: "중등작업 (4~5 MET)", w: "425 W", met: 4.5,
    ex: "30 lb 부하 정찰 · 전술 포복 · 진지 구축 · 경계 훈련",
    src: "TB MED 508 표 3-1 Moderate work (Patrolling · Defensive position construction)" },
  { id: "heavy", name: "중작업 (6 MET)",     w: "600 W", met: 6.0,
    ex: "45 lb 완전군장 행군 · 4인 들것 환자 수송 · 야외 구보",
    src: "TB MED 508 표 3-1 Hard work (Walking ≥40-lb load · Field assaults)" },
  { id: "vhard", name: "고강도 (8 MET)",     w: "800 W", met: 8.0,
    ex: "3km 뜀걸음 체력측정 · 장애물/유격 코스 · 2인 들것 고속 수송",
    src: "TB MED 507 고강도 구간 (TB MED 508 Hard work 초과)" }
];

/* clo: TB MED 508 표 3-2 「Insulation value of different pieces of Army clothing」
   ※ 원문 주의: 개별 clo 값의 단순 합산은 층간 압축으로 총 단열값을 과대평가한다. */
const GEARS = [
  { id: "pt",     name: "체육복 / PT복",      adj: () => -1.0,  clo: 0.60,
    src: "체육복 (통풍 우수 -1.0°C 보정) · 0.60 clo" },
  { id: "scu",    name: "전투복",             adj: () => 0.0,   clo: 1.15,
    src: "기준 복장 (전투복 보정 없음 +0.0°C) · BDU 1.15 clo" },
  { id: "single", name: "단독군장",           adj: () => 1.5,   clo: 1.25,
    src: "단독군장 (전투복+방탄헬멧+전투조끼 +1.5°C 가산) · 1.25 clo" },
  { id: "iba",    name: "완전군장 / 방탄복",   adj: () => 2.8,   clo: 1.40,
    src: "TB MED 507 · 방탄복 착용 시 습한 기후에서 WBGT +5°F(+2.8°C) 가산" },
  { id: "cbrn",   name: "화생방 보호의",      adj: t => (t === "easy" || t === "static") ? 5.6 : 11.1, clo: 1.60,
    src: "TB MED 507 · MOPP 4 착용 시 경작업 +10°F(+5.6°C) / 중등·중작업 +20°F(+11.1°C)" },
  { id: "ecwcs",  name: "방한복 (ECWCS)",     adj: () => 3.4,   clo: 3.40,
    src: "TB MED 508 표 3-2 Total ECWCS 3.40 clo · 혹한기 다층 단열" }
];

/* ══════════ 한랭 요구 단열값 (TB MED 508 그림 3-2) ══════════
   그림 3-2는 기온 × 활동수준(MET)별 요구 clo를 제시한다. 원문의 워크드 예제
     · 20°F(-6.7℃) / 4~5 MET → 약 1 clo
     · 0°F(-17.8℃) / 3 MET  → 약 2 clo
   두 지점에 맞춰 보정한 표준 열균형식을 사용한다. (그림 3-2 전제: 풍속 5 mph 미만)
   ※ ISO 11079 IREQ 정식 산출로 교체 가능하도록 이 함수만 분리해 둔다. */
const MET_W = 58.15;            // 1 MET = 58.15 W/m²
const T_SKIN = 33.0;            // 평균 피부온도 (℃)
const DRY_FRACTION = 0.85;      // 호흡·증발 손실을 제외한 건열 손실 비율

function requiredClo(ta, met) {
  const M = Math.max(1.0, met) * MET_W;
  const req = (T_SKIN - ta) / (0.155 * DRY_FRACTION * M);
  return Math.max(0, +req.toFixed(2));
}

/* 풍속 보정: 그림 3-2는 5 mph(2.2 m/s) 미만 전제. 초과 시 착용 단열이 유효하게 감소한다. */
function effectiveClo(cloWorn, ws) {
  const excess = Math.max(0, (ws || 0) - 2.2);
  return +(cloWorn * Math.max(0.45, 1 - 0.09 * excess)).toFixed(2);
}

/* ══════════ 말초 동상 노출시간 (TB MED 508 그림 3-5) ══════════
   가장 취약한 5% 인원의 '볼(cheek) 동상' 발생까지의 시간(분).
   행 = 풍속(mph), 열 = 기온(°F). 999 = >120분(원문 ">120"). */
const FROSTBITE_WIND_MPH = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const FROSTBITE_TEMP_F  = [10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40, -45];
const FROSTBITE_MIN = [
  [999, 999, 999, 999,  31,  22,  17,  14,  12,  11,   9,   8],
  [999, 999, 999,  28,  19,  15,  12,  10,   9,   7,   7,   6],
  [999, 999,  33,  20,  15,  12,   9,   8,   7,   6,   5,   4],
  [999, 999,  23,  16,  12,   9,   8,   8,   6,   5,   4,   4],
  [999,  42,  19,  13,  10,   8,   7,   6,   5,   4,   4,   3],
  [999,  28,  16,  12,   9,   7,   6,   5,   4,   4,   3,   3],
  [999,  23,  14,  10,   8,   6,   5,   4,   4,   3,   3,   2],
  [999,  20,  13,   9,   7,   6,   5,   4,   3,   3,   2,   2],
  [999,  18,  12,   8,   7,   5,   4,   4,   3,   3,   2,   2],
  [999,  16,  11,   8,   6,   5,   4,   3,   3,   2,   2,   2]
];

/* 동상 위험등급 및 버디체크 주기 (TB MED 508 표 3-4) */
const FROSTBITE_RISK = [
  { id: "low",     name: "낮음",  color: "var(--c1)", buddy: null, act: "자가·동료 관찰 강화, 노출 피부 차단, 발한 회피" },
  { id: "high",    name: "높음",  color: "var(--c3)", buddy: 25,   act: "20~30분마다 동료 점검 의무화, 방한복·방풍(머리/손/발/안면) 착용, 재가온 시설 운용" },
  { id: "severe",  name: "심각",  color: "var(--c4)", buddy: 10,   act: "10분마다 동료 점검 의무화, 노출 피부 전면 차단, 2인 1조 이상 편성, 계속 활동 유지" },
  { id: "extreme", name: "극심",  color: "var(--black-fill)", buddy: 10, act: "과업 시간 최소화 및 활동 변경 검토, 노출 피부 전면 차단, 2인 1조 이상 편성" }
];

function frostbiteMinutes(taC, wsMs) {
  const tf = taC * 9 / 5 + 32;
  const mph = (wsMs || 0) * 2.23694;
  if (tf > 10) return { min: 999, risk: FROSTBITE_RISK[0] };
  let wi = 0;
  while (wi < FROSTBITE_WIND_MPH.length - 1 && mph >= FROSTBITE_WIND_MPH[wi + 1]) wi++;
  let ti = 0;
  while (ti < FROSTBITE_TEMP_F.length - 1 && tf <= FROSTBITE_TEMP_F[ti + 1]) ti++;
  const m = FROSTBITE_MIN[wi][ti];
  const risk = m >= 999 ? FROSTBITE_RISK[0]
    : m < 5 ? FROSTBITE_RISK[3]
    : m <= 10 ? FROSTBITE_RISK[2]
    : m <= 30 ? FROSTBITE_RISK[1]
    : FROSTBITE_RISK[0];
  return { min: m, risk };
}

/* ══════════ [제거됨] 작업/휴식 주기 · 급수량 산출 ══════════
   TB MED 507의 Work/Rest and Water Consumption Table은 '열순응 완료 병사가 연속 작업을
   4시간 지속'하는 미군 기준으로, 우리 훈련 편성(50분 교육/10분 휴식, 행군 대휴식 등)과
   단위가 맞지 않아 지시값으로 내보내지 않는다.
   또한 육군 교육훈련 규정은 시간당 분배가 아니라 '1일 ○시간 이내'라는
   일일 누적 노출 제한 방식을 쓰므로 어법도 다르다.
   급수량은 근거가 확보되지 않은 구간(혹한기)이 있어 함께 제외한다.

   → TB MED 507은 아래 두 가지로만 사용한다.
      · 열지수 등급(CAT 1~5) 임계값  25.6 / 27.8 / 29.4 / 31.1 / 32.2 ℃
      · 복장 WBGT 가산  방탄복 +5°F · MOPP4 경작업 +10°F / 중등·중작업 +20°F  */

const CAT = [
  { l: "—", c: "var(--c0)", i: "var(--dim)" },
  { l: "CAT 1 백", c: "var(--c1)", i: "#13202E" },
  { l: "CAT 2 녹", c: "var(--c2)", i: "#fff" },
  { l: "CAT 3 황", c: "var(--c3)", i: "#13202E" },
  { l: "CAT 4 적", c: "var(--c4)", i: "#fff" },
  { l: "CAT 5 흑", c: "var(--black-fill)", i: "#fff" }
];

const KMA = [
  { l: "—", c: "var(--c0)", i: "var(--dim)" },
  { l: "관심", c: "var(--k1)", i: "#fff" },
  { l: "주의", c: "var(--k2)", i: "#13202E" },
  { l: "경고", c: "var(--k3)", i: "#fff" },
  { l: "위험", c: "var(--k4)", i: "#fff" }
];

const LV = [
  { n: "해당 없음", c: "var(--c0)", i: "var(--ink)", a: "온열 지침 적용 구간 밖입니다. 통상 절차대로 진행합니다." },
  { n: "관심", c: "var(--c1)", i: "#13202E", a: "급수 지점을 지정하고 병력 건강 상태를 지속 관찰합니다." },
  { n: "주의", c: "var(--c2)", i: "#fff",    a: "그늘 휴식지를 운용하고 정기적 급수 주기를 고정합니다." },
  { n: "경고", c: "var(--c3)", i: "#13202E", a: "작업·휴식 주기를 강제하고 고강도 과업은 이른 시각으로 이동합니다." },
  { n: "위험", c: "var(--c4)", i: "#fff",    a: "14–17시 야외 과업을 통제하고 실내 교육/대체 과업으로 전환합니다." },
  { n: "중대 위험", c: "var(--black-fill)", i: "#fff", a: "긴급 조치를 제외한 전 야외 훈련을 중지하고 강력 냉각 구역을 개설합니다." }
];

const catOfC = c => (isNaN(c) || c < 25.6) ? 0 : c < 27.8 ? 1 : c < 29.4 ? 2 : c < 31.1 ? 3 : c < 32.2 ? 4 : 5;
const kmaLv = app => (isNaN(app) || app < 31.0) ? 0 : app < 33.0 ? 1 : app < 35.0 ? 2 : app < 38.0 ? 3 : 4;
const pad = n => String(n).padStart(2, "0");

/* ═══════════ REGION (지역) DATABASE ═══════════ */
const REGIONS = {
  nonsan: {
    id: "nonsan",
    name: "논산 육군훈련소",
    short: "논산",
    icon: "🏕️",
    location: "충청남도 논산시 연무대읍 (육군훈련소)",
    lat: 36.1133, lon: 127.0989,
    kmaGridX: 68, kmaGridY: 95,   // 기상청 격자 좌표
    fallbackTA: [26.1,26.5,27.8,29.5,31.2,32.8,34.1,35.0,35.8,36.2,35.9,35.0,33.6,31.8,30.0,28.6,27.6],
    fallbackRH: [82,80,76,70,63,57,52,48,45,44,45,48,53,59,66,72,77]
  },
  yangpyeong: {
    id: "yangpyeong",
    name: "양평 지역",
    short: "양평",
    icon: "⛰️",
    location: "경기도 양평군",
    lat: 37.4917, lon: 127.4875,
    kmaGridX: 69, kmaGridY: 133,
    fallbackTA: [24.8,25.2,26.5,28.3,30.0,31.6,32.8,33.5,34.2,34.5,34.2,33.3,31.8,30.1,28.5,27.1,26.0],
    fallbackRH: [85,83,79,73,66,60,55,51,48,46,48,51,56,62,69,75,80]
  }
};

/* ═══════════ APP STATE ═══════════ */

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const S = {
  region: "nonsan",
  planDate: getTodayStr(),
  activeActivityId: "act_march40",
  task: "heavy", gear: "iba", pax: 600, from: 8, to: 12,
  meas: HOURS.map(() => null),
  envData: { ta: 33.2, rh: 68, ws: 2.1, chillTemp: 34.5, wbgt: 31.8, pm10: 42, pm25: 22, dustStatus: "보통", uvIndex: 8, pop: 10 },
  byDateWeather: {},      // 현재 선택 지역의 30일 데이터
  byRegionWeather: {},    // { nonsan: {...}, yangpyeong: {...} } 지역별 30일 데이터 전체
  modalRegion: "nonsan"   // 30일 DB 팝업에서 보고 있는 지역
};

/* 선택 지역의 30일 데이터를 S.byDateWeather 로 적용 */
function applyRegionDataset(regionId) {
  const bucket = S.byRegionWeather && S.byRegionWeather[regionId];
  if (bucket && bucket.byDate) {
    S.byDateWeather = bucket.byDate;
    return true;
  }
  return false;
}

function seg(id, items, key, hintId, hintFn, cb) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(o => `<button type="button" data-v="${o.id}" aria-pressed="${S[key]===o.id}">${o.name}</button>`).join("");
  el.querySelectorAll("button").forEach(b => b.onclick = () => {
    S[key] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
    el.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v) === String(S[key])));

    // 수동 조작 시 '사용자 직접설정' 프리셋으로 자동 전환하여 UI 하이라이트 갱신
    if (key === "task" || key === "gear") {
      S.activeActivityId = "act_custom";
      renderActivityPresets();
    }

    if (hintId) {
      const hintEl = document.getElementById(hintId);
      if (hintEl && typeof hintFn === 'function') hintEl.textContent = hintFn();
    }
    if (typeof cb === 'function') cb();
  });
  if (hintId) {
    const hintEl = document.getElementById(hintId);
    if (hintEl && typeof hintFn === 'function') hintEl.textContent = hintFn();
  }
}

function renderActivityPresets() {
  const container = document.getElementById("actPresets");
  if (!container) return;
  container.innerHTML = UNIT_ACTIVITIES.map(act => `
    <button type="button" class="act-btn ${S.activeActivityId === act.id ? 'active' : ''}" onclick="selectActivity('${act.id}')">
      ${act.name}
    </button>
  `).join("");
}

window.selectActivity = function(actId) {
  S.activeActivityId = actId;
  const act = UNIT_ACTIVITIES.find(a => a.id === actId);
  if (act && actId !== 'act_custom') {
    S.task = act.task; S.gear = act.gear; S.pax = act.pax;
    const paxEl = document.getElementById("pax");
    if (paxEl) paxEl.value = act.pax;
  }
  seg("task", TASKS, "task", "taskHint", () => { const t = TASKS.find(x => x.id === S.task); return t ? `${t.w} · ${t.ex}` : ''; }, () => recomputeAll());
  seg("gear", GEARS, "gear", "gearHint", () => { const g = GEARS.find(x => x.id === S.gear); return g ? g.src : ''; }, () => recomputeAll());
  renderActivityPresets();
  recomputeAll();
};

/* ═══════════ REGION SELECTOR ═══════════ */
function renderRegionSelector() {
  const container = document.getElementById("regionSelector");
  if (!container) return;
  container.innerHTML = Object.values(REGIONS).map(r => `
    <button type="button" class="region-btn ${S.region === r.id ? 'active' : ''}" onclick="switchRegion('${r.id}')">
      <span class="region-icon">${r.icon}</span>
      <span class="region-name">${r.short}</span>
    </button>
  `).join("");
}

window.switchRegion = function(regionId) {
  if (!REGIONS[regionId] || S.region === regionId) return;
  S.region = regionId;
  const r = REGIONS[regionId];

  // Update fallback data arrays
  TA = [...r.fallbackTA];
  RH = [...r.fallbackRH];
  APP = TA.map((t, i) => +(t + (RH[i] > 60 ? (RH[i] - 60) * 0.08 : 0)).toFixed(1));
  BASE = TA.map((t, i) => +(t * 0.7 + (RH[i] / 100) * 8.5 + 2.0).toFixed(1));

  // Update header location text
  const subEl = document.querySelector(".sub");
  if (subEl) {
    const dateStr = document.getElementById("currentDateStr");
    subEl.innerHTML = `${r.location} · <span id="currentDateStr">${dateStr ? dateStr.textContent : S.planDate}</span>`;
  }

  // Swap in the selected region's 30-day dataset
  applyRegionDataset(regionId);

  // Re-render region buttons
  renderRegionSelector();

  // Re-apply weather data for current date & recompute
  applyDateWeather(S.planDate);
  recomputeAll();
};

function getDayDiffFromToday(targetDateStr) {
  const today = new Date();
  const target = new Date(targetDateStr);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function applyDateWeather(targetDate) {
  const diffDays = getDayDiffFromToday(targetDate);
  const isApiRange = diffDays <= 10;

  const hintEl = document.getElementById("dateSourceHint");
  if (hintEl) {
    if (isApiRange) {
      hintEl.textContent = "* D+10일 이내: 기상청 API 실시간 예보 연동중";
      hintEl.style.color = "var(--accent)";
    } else {
      hintEl.textContent = "* D+11일 이후: 지난 1년 기후 실측 데이터 기반 추정";
      hintEl.style.color = "var(--k2)";
    }
  }

  if (S.byDateWeather && S.byDateWeather[targetDate]) {
    const dayObj = S.byDateWeather[targetDate];
    if (dayObj.data && Array.isArray(dayObj.data.ta)) {
      TA = dayObj.data.ta;
      RH = dayObj.data.rh;
      APP = dayObj.data.app;
      BASE = dayObj.data.wbgt;
    }
    if (dayObj.env) {
      S.envData = dayObj.env;
    }
  } else {
    // Authentic Seasonal Fallback Generator based on Month
    const dParts = (targetDate || "").split("-");
    const month = dParts.length >= 2 ? parseInt(dParts[1], 10) : 8;

    // ⚠ `month in [12,1,2]`는 값이 아니라 배열 '인덱스'를 검사하므로 12월이 가을로 분류된다.
    //    includes()로 교정.
    if ([12, 1, 2].includes(month)) { // Winter
      TA = [-5.0, -4.5, -3.0, -1.5, 0.0, 2.0, 3.5, 4.5, 5.0, 4.8, 3.5, 1.0, -1.0, -2.5, -3.8, -4.5, -5.0];
      RH = [65, 62, 58, 52, 45, 40, 38, 35, 33, 34, 38, 42, 48, 55, 60, 63, 65];
      APP = TA.map(t => t - 3.0);
      BASE = TA.map(t => t * 0.7 + 3.0);
      S.envData = { ta: 5.0, rh: 33, ws: 3.5, chillTemp: 1.2, wbgt: 6.5, pm10: 55, pm25: 32, dustStatus: "보통", uvIndex: 3, pop: 10 };
    } else if ([3, 4, 5].includes(month)) { // Spring
      TA = [10.0, 11.0, 13.0, 15.5, 17.5, 19.5, 21.0, 22.0, 22.5, 22.0, 20.5, 18.0, 16.0, 14.0, 12.5, 11.0, 10.0];
      RH = [55, 50, 45, 38, 32, 28, 25, 23, 22, 23, 26, 30, 36, 42, 48, 52, 55];
      APP = TA.map(t => t + 0.5);
      BASE = TA.map(t => t * 0.7 + 4.0);
      S.envData = { ta: 22.5, rh: 22, ws: 2.8, chillTemp: 22.8, wbgt: 19.5, pm10: 88, pm25: 48, dustStatus: "나쁨", uvIndex: 6, pop: 10 };
    } else if ([6, 7, 8].includes(month)) { // Summer
      TA = [26.1,26.5,27.8,29.5,31.2,32.8,34.1,35.0,35.8,36.2,35.9,35.0,33.6,31.8,30.0,28.6,27.6];
      RH = [82,80,76,70,63,57,52,48,45,44,45,48,53,59,66,72,77];
      APP = [28.0,28.5,30.1,32.0,33.9,35.4,36.6,37.4,38.1,38.5,38.2,37.4,36.1,34.3,32.5,30.9,29.6];
      BASE = [24.0,24.5,25.8,27.2,28.6,29.8,30.8,31.5,32.0,32.3,32.0,31.2,30.0,28.4,26.8,25.5,24.6];
      S.envData = { ta: 36.2, rh: 44, ws: 2.1, chillTemp: 38.5, wbgt: 32.3, pm10: 42, pm25: 22, dustStatus: "보통", uvIndex: 9, pop: 20 };
    } else { // Autumn
      TA = [12.5, 13.5, 15.5, 17.5, 19.5, 21.0, 22.2, 23.0, 23.3, 23.0, 21.5, 19.2, 17.0, 15.5, 14.0, 13.0, 12.5];
      RH = [68, 64, 59, 53, 46, 41, 38, 36, 35, 36, 39, 44, 50, 56, 61, 65, 68];
      APP = TA.map(t => t + 0.2);
      BASE = TA.map(t => t * 0.7 + 3.5);
      S.envData = { ta: 23.3, rh: 35, ws: 2.2, chillTemp: 23.5, wbgt: 20.0, pm10: 40, pm25: 20, dustStatus: "좋음", uvIndex: 5, pop: 10 };
    }
  }
}

function fill() {
  const idx = S.meas.map((v, i) => (v === null || isNaN(v)) ? -1 : i).filter(i => i >= 0);
  if (!idx.length) return { series: BASE.slice(), src: HOURS.map(() => "기준"), any: false };
  const out = [], src = [];
  for (let i = 0; i < HOURS.length; i++) {
    if (S.meas[i] !== null && !isNaN(S.meas[i])) { out.push(S.meas[i]); src.push("실측"); continue; }
    const lo = idx.filter(j => j < i).pop(), hi = idx.find(j => j > i);
    if (lo === undefined && hi !== undefined) { out.push(S.meas[hi]); src.push("보간"); }
    else if (hi === undefined && lo !== undefined) { out.push(S.meas[lo]); src.push("보간"); }
    else if (lo !== undefined && hi !== undefined) {
      const t = (i - lo) / (hi - lo);
      out.push(S.meas[lo] + (S.meas[hi] - S.meas[lo]) * t);
      src.push("보간");
    } else {
      out.push(typeof BASE[i] === 'number' && !isNaN(BASE[i]) ? BASE[i] : 25.0);
      src.push("기준");
    }
  }
  return { series: out, src, any: true };
}

/* ══════════ 4-SEASON ALL-WEATHER HAZARD ENGINE ══════════ */
function calculateWindChill(ta, ws) {
  const wsVal = typeof ws === 'number' && !isNaN(ws) ? ws : 2.0;
  const vKmh = wsVal * 3.6;
  if (ta <= 10.0 && vKmh >= 4.8) {
    const chill = 13.12 + 0.6215 * ta - 11.37 * Math.pow(vKmh, 0.16) + 0.3965 * ta * Math.pow(vKmh, 0.16);
    return +chill.toFixed(1);
  }
  return +ta.toFixed(1);
}

function computeSeasonalRisk(ta, rh, ws, pm10, pm25, wC, month) {
  const chillTemp = calculateWindChill(ta, ws);
  const isWinterSeason = month === 12 || month === 1 || month === 2 || ta <= 10.0;
  const isDustSeason = (month >= 3 && month <= 5 || month >= 9 && month <= 11) && (pm10 > 80 || pm25 > 35);
  
  // 1. Winter Coldwave Risk Level (현기준.md 체감온도 지침)
  let winterLv = 0;
  let winterStatus = "정상";
  let winterDesc = "정상 야외훈련 실시 가능";
  let winterAction = "방한 용품 불출 및 장병 체온 관리";

  if (chillTemp <= -24.1) {
    winterLv = 5;
    winterStatus = "혹한 중지";
    winterDesc = "야외훈련 중지 및 주둔지 훈련 전면 대체";
    winterAction = "야외훈련을 중지하고 주둔지/실내 훈련으로 대체 (방한대책 구비 부대 제외).";
  } else if (chillTemp <= -18.1) {
    winterLv = 3;
    winterStatus = "혹한 제한";
    winterDesc = "야외훈련 실시 가능 (주둔지 훈련 전환 검토)";
    winterAction = "야외훈련 내용과 시간 조정, 주둔지 훈련 전환 검토 및 방한장구 착용.";
  } else if (chillTemp <= -10.1) {
    winterLv = 2;
    winterStatus = "혹한 주의";
    winterDesc = "정상 야외훈련 가능 (훈련 내용/시간 조정)";
    winterAction = "야외훈련 내용과 시간 조정 실시, 동상 위험 부위 지속 점검.";
  } else if (chillTemp <= 0.0) {
    winterLv = 1;
    winterStatus = "혹한 관심";
    winterDesc = "정상 야외훈련 가능";
    winterAction = "방한용품 착용 상태 점검 및 야외 활동 시 체온 유지 관찰.";
  }

  // 2. Dust/PM Air Quality Risk Level (현기준.md 미세먼지/황사 지침)
  let dustLv = 0;
  let dustStatus = "좋음/보통";
  let dustDesc = "정상 야외훈련 실시";
  let dustAction = "일반 야외 훈련 진행";

  // ⚠ PM2.5 경보 임계는 150 (환경부 현행). 2018.7.1 강화로 주의보 90→75, 경보 180→150.
  //    구 기준 180으로 되돌리지 말 것.
  if (pm10 > 300 || pm25 > 150) {
    dustLv = 5;
    dustStatus = "미세먼지 경보";
    dustDesc = "실내 훈련/교육 전면 전환";
    dustAction = "야외 훈련 금지 및 실내 교육 전면 전환. 무리한 야외 뜀걸음/행군 금지.";
  } else if (pm10 > 150 || pm25 > 75) {
    dustLv = 4;
    dustStatus = "미세먼지 주의보";
    dustDesc = "야외훈련 단축 및 실내 전환 검토";
    dustAction = "지휘관 판단 하 훈련시간 단축 및 실내훈련 전환. 야외 행군/뜀걸음 최소화.";
  } else if (pm10 > 80 || pm25 > 35) {
    dustLv = 2;
    dustStatus = "미세먼지 나쁨";
    dustDesc = "안전대책 강구 후 훈련 조정";
    dustAction = "미세먼지 마스크 불출 및 착용. 실시간 농도 고려 훈련장소, 시간, 방법 조정.";
  }

  // 3. Summer Heatwave Risk Level (TB MED 507 & 현기준.md 온열지수 지침)
  const summerCat = catOfC(wC);
  let summerLv = summerCat;
  let summerStatus = "정상";
  let summerDesc = "정상 야외훈련 가능";
  let summerAction = "급수 및 그늘 휴식지 운용";

  if (wC >= 32.0) {
    summerStatus = "온열 중지";
    summerDesc = "옥외 훈련 중지 (필수 활동만 실시)";
    summerAction = "경계작전 등 필수 활동만 실시하고 아침·저녁 서늘한 시간대 최대 활용.";
  } else if (wC >= 31.0) {
    summerStatus = "온열 제한";
    summerDesc = "옥외 훈련 제한 및 중지";
    summerAction = "1일 6시간 이내 제한된 활동만 가능, 직사광선 노출 과업 최소화.";
  } else if (wC >= 29.5) {
    summerStatus = "온열 부분제한";
    summerDesc = "과중한 훈련 지양 및 조정";
    summerAction = "뜀걸음, 행군 등 과중한 훈련 지양, 옥외훈련 조정 시행.";
  } else if (wC >= 26.5) {
    summerStatus = "온열 주의";
    summerDesc = "미숙련자 주의 및 그늘 휴식";
    summerAction = "양성교육 및 야외훈련 시 미숙련자 주의 관찰, 그늘 휴식지 개설.";
  }

  // Select Active Season Risk Engine Mode
  let activeSeason = "SUMMER";
  let seasonIcon = "☀️";
  let seasonLabel = "혹서기 온열 위험 평가 모드";
  let activeLv = summerLv;
  let activeStatus = summerStatus;
  let activeDesc = summerDesc;
  let activeAction = summerAction;

  if (isWinterSeason && winterLv >= summerLv) {
    activeSeason = "WINTER";
    seasonIcon = "❄️";
    seasonLabel = "혹한기 한랭/동상 위험 평가 모드";
    activeLv = winterLv;
    activeStatus = winterStatus;
    activeDesc = winterDesc;
    activeAction = winterAction;
  } else if (isDustSeason && dustLv > summerLv && dustLv > winterLv) {
    activeSeason = "DUST";
    seasonIcon = "😷";
    seasonLabel = "미세먼지/황사 위험 평가 모드";
    activeLv = dustLv;
    activeStatus = dustStatus;
    activeDesc = dustDesc;
    activeAction = dustAction;
  }

  return {
    activeSeason,
    seasonIcon,
    seasonLabel,
    chillTemp,
    activeLv,
    activeStatus,
    activeDesc,
    activeAction,
    summerLv,
    winterLv,
    dustLv,
    summerCat
  };
}

function computeDay() {
  applyDateWeather(S.planDate);
  const dParts = (S.planDate || "").split("-");
  const month = dParts.length >= 2 ? parseInt(dParts[1], 10) : 8;
  const env = S.envData || {};

  const g = GEARS.find(x => x.id === S.gear) || GEARS[0];
  const adjC = g.adj ? g.adj(S.task) : 0;
  const f = fill();

  return HOURS.map((h, i) => {
    const wRaw = typeof f.series[i] === 'number' && !isNaN(f.series[i])
      ? f.series[i]
      : (typeof BASE[i] === 'number' && !isNaN(BASE[i]) ? BASE[i] : 25.0);
    const wC = wRaw + adjC;
    const taVal = typeof TA[i] === 'number' && !isNaN(TA[i]) ? TA[i] : 25.0;
    const rhVal = typeof RH[i] === 'number' && !isNaN(RH[i]) ? RH[i] : 60;
    const wsVal = typeof env.ws === 'number' && !isNaN(env.ws) ? env.ws : 2.0;
    const pm10Val = typeof env.pm10 === 'number' && !isNaN(env.pm10) ? env.pm10 : 40;
    const pm25Val = typeof env.pm25 === 'number' && !isNaN(env.pm25) ? env.pm25 : 20;

    const seasonal = computeSeasonalRisk(taVal, rhVal, wsVal, pm10Val, pm25Val, wC, month);
    const cat = seasonal.summerCat;
    const appVal = typeof APP[i] === 'number' && !isNaN(APP[i]) ? APP[i] : 28.0;
    const kl = kmaLv(appVal);
    const lv = Math.max(kl, seasonal.activeLv);

    const cold = assessCold(taVal, wsVal, seasonal.chillTemp, S.task, g);
    const isCold = seasonal.activeSeason === "WINTER";
    // 한랭에서는 대사율 축이 뒤집힌다 — 정적 과업·단열 부족일수록 위험이 커진다
    const lvFinal = isCold ? Math.min(5, lv + cold.lvBump) : lv;

    return {
      h, ta: taVal, rh: rhVal, app: appVal, wRaw, wC, cat, kl, lv: lvFinal, seasonal,
      src: f.src[i] || "기준", cold, isCold
    };
  });
}

/* ══════════════════════════════════════════════════════════════
   판정 2단 구조
   ──────────────────────────────────────────────────────────────
   [1차] 규정 판정 (절대) — 육군 교육훈련 규정의 온도지수·체감온도·미세먼지 행동기준
         어떤 경우에도 하향 조정하지 않는다.

   [2차] 기상 요인 상세 평가 (보강) — 규정이 다루지 않는 축을 공개 근거로 보완
         · 과업 대사율      TB MED 507 / TB MED 508 (과업별 MET)
         · 복장 단열·보정   TB MED 507 (WBGT 가산) / TB MED 508 (clo)
         · 열지수 등급 임계  TB MED 507 (CAT 1~5)
         · 동상 노출시간    TB MED 508
         · 체감온도 산출식  기상청 (여름철 체감온도 3.0 / 겨울철 풍냉식)
         · 대기질 임계      환경부 대기오염 경보 발령기준
         · 감소대책 체계    「사업장 위험성평가에 관한 지침」(고용노동부 고시)

   ※ 2차 평가가 1차보다 엄격할 경우 경고로 제시하며, 1차 규정의 중지 기준을
     완화하는 방향으로는 어떤 산출도 적용하지 않는다.
   ══════════════════════════════════════════════════════════════ */

/* 규정 판정 결과를 표준 형태로 정리 (1차) */
function regulationVerdict(peak) {
  const s = peak.seasonal || {};
  const isCold = s.activeSeason === "WINTER";
  const isDust = s.activeSeason === "DUST";
  const idx = isCold ? s.chillTemp : peak.wRaw;   // 보정 전 원 지수 = 규정 판정 대상
  return {
    scope: isCold ? "체감온도" : isDust ? "미세먼지" : "온도지수",
    value: isDust ? `PM10 ${S.envData.pm10} · PM2.5 ${S.envData.pm25} ㎍/㎥`
                  : `${(typeof idx === "number" ? idx.toFixed(1) : idx)}${isCold ? "℃" : ""}`,
    status: s.activeStatus || "정상",
    action: s.activeAction || "정상 야외훈련 실시",
    lv: s.activeLv || 0,
    isStop: (!isCold && peak.wRaw >= 32.0) || (isCold && s.chillTemp <= -24.1),
    src: "육군 교육훈련 규정"
  };
}

/* 감소대책 — ① 제거 → ② 대체 → ③ 공학적 → ④ 관리적 → ⑤ 개인보호구 우선순위
   각 대책은 4M(Man·Machine·Media·Management)으로 분류한다
   근거: 「사업장 위험성평가에 관한 지침」(고용노동부 고시) 위험성 감소대책 수립 원칙 */
function buildMeasures(peak, safeWindowLabel) {
  const s = peak.seasonal || {};
  const isCold = s.activeSeason === "WINTER";
  const isDust = s.activeSeason === "DUST";
  const cold = peak.cold || {};
  const out = [];
  const add = (pri, priName, m4, text) => out.push({ pri, priName, m4, text });

  if (peak.lv >= 4) {
    add(1, "제거", "Media", isDust
      ? "야외훈련 중지 및 실내 교육으로 전면 전환"
      : "해당 시간대 야외훈련 중지 · 실내/주둔지 훈련으로 대체");
  }
  if (safeWindowLabel && safeWindowLabel !== "없음" && peak.lv >= 3) {
    add(2, "대체", "Media", `훈련 시간대를 안전 시간창(${safeWindowLabel})으로 이동`);
  } else if (peak.lv >= 3) {
    add(2, "대체", "Management", "연기 불가 임무의 경우 교대 주기 단축 및 예비 인원 확보로 개인 노출시간 단축");
  }
  if (peak.lv >= 3) {
    add(2, "대체", "Management", isCold
      ? "정적 과업(경계·매복)을 이동성 과업으로 교대 편성하여 대사열 확보"
      : "고강도 과업을 저강도 과업으로 대체하거나 이른 시각으로 이동");
  }
  add(3, "공학적", "Machine", isCold
    ? "재가온 시설(난방 천막·온풍기) 설치 및 방풍막 구축"
    : "그늘 휴식지 및 냉각 구역 개설");
  if (isCold) {
    add(4, "관리적", "Management", `노출/재가온 주기 적용 (${cold.cycleLabel || "상시 관찰"})`);
  }
  if (cold.frostbiteRisk && cold.frostbiteRisk.buddy) {
    add(4, "관리적", "Man", `동료 점검(버디체크) ${cold.frostbiteRisk.buddy}분 주기 의무화`);
  }
  add(4, "관리적", "Man", isCold
    ? "손·발·귀 감각 이상 여부 수시 확인 및 젖은 피복 즉시 교체"
    : "어지럼·두통·오심 등 이상 징후 관찰 및 즉시 보고 체계 유지");
  add(5, "개인보호구", "Man", isCold
    ? `방한 피복 착용 상태 점검 (요구 ${cold.reqClo != null ? cold.reqClo.toFixed(2) : "-"} clo / 착용 ${cold.wornClo != null ? cold.wornClo.toFixed(2) : "-"} clo)`
    : isDust ? "미세먼지 마스크 불출 및 야외활동 시 착용 강제"
    : "방탄복·완전군장 착용 시간 최소화, 통풍 조치");

  return out.sort((a, b) => a.pri - b.pri);
}

/* ══════════ 종합 판정 (1차 규정 + 2차 상세) ══════════ */
function computeVerdict(D, peak, safeWindowLabel) {
  const reg = regulationVerdict(peak);
  const s = peak.seasonal || {};
  const isCold = s.activeSeason === "WINTER";
  const g = GEARS.find(x => x.id === S.gear) || GEARS[0];
  const taskObj = TASKS.find(x => x.id === S.task) || TASKS[1];

  // 2차 상세: 과업·복장 보정을 반영한 유효 지수와 그에 대응하는 규정 등급
  const rawIdx = peak.wRaw;
  const effIdx = peak.wC;
  const adj = +(effIdx - rawIdx).toFixed(1);

  // 보정 후 지수가 규정의 어느 구간에 해당하는지 (경고 판단용)
  const bandOf = v => v >= 32.0 ? 4 : v >= 31.0 ? 3 : v >= 29.5 ? 2 : v >= 26.5 ? 1 : 0;
  const bandName = ["해당없음", "주의", "부분제한", "제한", "중지"];
  const rawBand = bandOf(rawIdx), effBand = bandOf(effIdx);

  // 규정 판정보다 상세 평가가 엄격해지는 경우를 경고로 잡는다.
  //  · 혹서기 : 복장 보정 후 유효 온도지수가 상위 구간으로 올라간 경우
  //  · 혹한기 : 요구 단열값 미달 또는 동상 위험 '높음' 이상인 경우
  //             (규정의 체감온도 단일 축은 과업 대사율·복장 단열을 보지 않으므로 누락됨)
  const c = peak.cold || {};
  const coldEscalated = isCold && (
    (c.deficit != null && c.deficit >= 0.3) ||
    (c.frostbiteMin != null && c.frostbiteMin <= 30) ||
    !!c.isStatic
  );
  const escalated = isCold ? coldEscalated : (effBand > rawBand);
  let escalReason = "";
  if (isCold && coldEscalated) {
    const rs = [];
    if (c.deficit >= 0.3) rs.push(`방한 단열 ${c.deficit.toFixed(2)} clo 부족`);
    if (c.frostbiteMin != null && c.frostbiteMin <= 30) rs.push(`동상 발생 ${c.frostbiteMin}분`);
    if (c.isStatic) rs.push("정적 과업 — 대사열 생산 없음");
    escalReason = rs.join(" · ");
  }

  return {
    reg,
    detail: {
      task: taskObj.name, gear: g.name,
      rawIdx, effIdx, adj,
      rawBandName: bandName[rawBand], effBandName: bandName[effBand],
      escalated, escalReason,
      cold: peak.cold || null,
      isCold
    },
    measures: buildMeasures(peak, safeWindowLabel)
  };
}

/* ══════════ 한랭 평가 엔진 (TB MED 508) ══════════
   혹서기에는 대사율이 '부하'지만 혹한기에는 대사열이 인체의 유일한 내부 열원이다.
   따라서 대사율이 낮을수록 요구 단열값이 커지고, 착용 단열이 못 미치면 노출 한계가 짧아진다.
   여름 로직과 부호가 반대이므로 별도 함수로 분리한다.
   근거: TB MED 508 그림 3-2(기온×MET별 요구 clo) · 표 3-1(과업별 MET)
        표 3-2(복장 clo) · 그림 3-5(동상 발생시간) · 표 3-4(버디체크 주기) */
function assessCold(ta, ws, chill, taskId, gear) {
  const taskObj = TASKS.find(t => t.id === taskId) || TASKS[1];
  const met = taskObj.met || 2.5;
  const reqClo = requiredClo(ta, met);
  const wornClo = effectiveClo(gear && gear.clo ? gear.clo : 1.15, ws);
  const deficit = +(reqClo - wornClo).toFixed(2);
  const fb = frostbiteMinutes(ta, ws);

  let lvBump = 0;
  if (deficit >= 2.0) lvBump = 3;
  else if (deficit >= 1.0) lvBump = 2;
  else if (deficit >= 0.3) lvBump = 1;
  if (met <= 1.0 && ta <= 10.0) lvBump += 1;       // 정적 자세의 말초 순환 저하
  if (fb.min <= 10) lvBump = Math.max(lvBump, 3);  // 동상 심각·극심 구간

  let cycleLabel, cycleMin = null;
  if (fb.min >= 999 && deficit <= 0) {
    cycleLabel = "열평형 유지 · 상시 관찰";
  } else {
    const limits = [];
    if (fb.min < 999) limits.push(fb.min);
    if (fb.risk.buddy) limits.push(fb.risk.buddy);
    if (deficit > 0) limits.push(Math.max(10, Math.round(60 / (1 + deficit))));
    cycleMin = limits.length ? Math.min(...limits) : null;
    cycleLabel = cycleMin ? `노출 ${cycleMin}분 / 재가온` : "상시 관찰";
  }

  return {
    met, reqClo, wornClo, deficit,
    frostbiteMin: fb.min, frostbiteRisk: fb.risk,
    lvBump, cycleMin, cycleLabel,
    isStatic: met <= 1.0,
    // 고강도 과업은 활동 중에는 안전하나 발한 후 정지 시점에 급격히 냉각된다 (after-drop)
    afterDrop: met >= 4.5 && ta <= 10.0
  };
}

/* 훈련 시간대 [S.from ~ S.to] 내 최악 시각 탐색
   ⚠ 기존 reduce는 위험등급이 더 낮아도 WBGT가 높으면 선택되는 결함이 있었다.
   등급을 1순위로, 동률일 때만 계절별 대표 지표로 비교한다.
   혹서기는 WBGT 최대(오후), 혹한기는 체감온도 최소(새벽)가 최악 시각이다. */
function getSelectedWindowPeakData(D) {
  const inWindow = D.filter(d => d.h >= S.from && d.h <= S.to);
  if (!inWindow.length) return D[0];
  const isCold = inWindow.some(d => d.seasonal && d.seasonal.activeSeason === "WINTER");
  return inWindow.reduce((best, cur) => {
    if (cur.lv !== best.lv) return cur.lv > best.lv ? cur : best;
    if (isCold) {
      const cc = cur.seasonal ? cur.seasonal.chillTemp : cur.ta;
      const bc = best.seasonal ? best.seasonal.chillTemp : best.ta;
      return cc < bc ? cur : best;
    }
    return cur.wC > best.wC ? cur : best;
  }, inWindow[0]);
}

function getLegacyVerdict(peakData) {
  const s = peakData.seasonal;
  if (!s) {
    return { status: "정상", class: "p-low", desc: "정상 야외훈련 실시 가능" };
  }
  const badgeClass = s.activeLv >= 4 ? "p-high" : s.activeLv >= 2 ? "p-mid" : "p-low";
  return {
    status: `${s.activeStatus} (${s.seasonIcon} ${s.seasonLabel.split(" ")[0]})`,
    class: badgeClass,
    desc: s.activeDesc
  };
}

function renderComparison(D) {
  const compBox = document.getElementById("compBox");
  if (!compBox) return;

  const n = getSelectedWindowPeakData(D);
  const peakW = n.wRaw;
  const legacy = getLegacyVerdict(n);
  const proposedCat = n.cat;
  const seasonal = n.seasonal || {};
  const proposedLv = LV[n.lv] || LV[0];
  const gearObj = GEARS.find(g => g.id === S.gear) || GEARS[0];

  const seasonBadgeText = seasonal.seasonLabel || "4계절 기후 위험 평가";

  compBox.innerHTML = `
    <div class="comp-col legacy">
      <span class="comp-title">📋 규정 판정 (${pad(n.h)}:00 ${seasonal.seasonIcon || ''} 육군 교육훈련 규정 기준)</span>
      <div class="comp-card">
        <div class="head">
          <span>${legacy.status}</span>
          <span class="p-badge ${legacy.class}">${legacy.status.split(" ")[0]}</span>
        </div>
        <div class="desc">
          ${legacy.desc}<br>
          <small style="color:var(--faint)">* 단점: 전투복/방탄복/보호의 복장 보정 및 과업 대사량 미반영</small>
        </div>
      </div>
    </div>

    <div class="comp-col proposed">
      <span class="comp-title">🪖 과업·복장 보정 결과 (${pad(n.h)}:00 ${seasonal.seasonIcon || ''} ${seasonBadgeText})</span>
      <div class="comp-card" style="border-color:var(--accent);background:var(--accent-bg)">
        <div class="head">
          <span style="color:var(--accent)">${seasonal.activeStatus || proposedLv.n} (체감/보정 ${seasonal.activeSeason === 'WINTER' ? '체감' + seasonal.chillTemp + '°C' : 'WBGT ' + n.wC.toFixed(1) + '°C'})</span>
          <span class="p-badge p-high">4계절 복합 보정</span>
        </div>
        <div class="desc">
          <b>권장 조치</b>: ${seasonal.activeAction || proposedLv.a}<br>
          <small style="color:var(--accent)">* 강점: 4계절 기후(${seasonal.seasonLabel}) + 복장 보정(${gearObj.name} ${gearObj.src}) 대사량 정밀 산정</small>
        </div>
      </div>
    </div>
  `;
}

function renderTimelineGrid(D) {
  const container = document.getElementById("timelineGrid");
  if (!container) return;

  container.innerHTML = D.map(d => {
    const l = LV[d.lv] || LV[0];
    const s = d.seasonal || {};
    const isWinter = s.activeSeason === "WINTER";
    const bgCol = l.c === "var(--c0)" ? "var(--glass-2)" : l.c;
    const txtCol = l.i || "var(--ink)";
    const tempLabel = isWinter ? `체감 ${s.chillTemp}°C` : `WBGT ${d.wC.toFixed(1)}°C`;
    const statusText = s.activeStatus || l.n;

    return `
      <div class="time-card" style="cursor:pointer" onclick="highlightHour(${d.h})">
        <div class="t-hour">${pad(d.h)}:00 ${s.seasonIcon || ''}</div>
        <div class="t-lvl" style="background:${bgCol};color:${txtCol}">${statusText} (${d.lv}단계)</div>
        <div class="t-sub">${tempLabel}</div>
        <div class="t-sub" style="color:var(--accent)">${d.lv <= 3 ? "훈련 가능" : "훈련 불가"}</div>
      </div>
    `;
  }).join("");
}

window.highlightHour = function(hour) {
  const i = HOURS.indexOf(hour);
  if (i >= 0) {
    const row = document.querySelectorAll("#tbl tbody tr")[i];
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.outline = '2px solid var(--accent)';
      setTimeout(() => row.style.outline = '', 2000);
    }
  }
};

function drawDay(D) {
  const chartEl = document.getElementById("chart");
  if (!chartEl) return;

  const W = 900, L = 46, R = 16, T = 12, PH = 228, SY = PH + T + 30, SH = 26, GP = 8, yMin = 20, yMax = 46;
  const x = i => L + i * (W - L - R) / (HOURS.length - 1);
  const y = v => {
    const num = (v === null || v === undefined || isNaN(v)) ? 25 : v;
    const clamped = Math.min(46, Math.max(20, num));
    return T + PH - (clamped - yMin) / (yMax - yMin) * PH;
  };

  const line = a => a.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  let s = "";

  for (let v = 20; v <= 44; v += 4) {
    s += `<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" stroke="var(--grid)"/>`;
    s += `<text x="${L-9}" y="${y(v)+4}" text-anchor="end" fill="var(--faint)" font-size="10.5" font-family="var(--mono)">${v}°C</text>`;
  }

  [[31, "31 관심"], [33, "33 주의"], [35, "35 경고"], [38, "38 위험"]].forEach(([v, t]) => {
    s += `<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" stroke="var(--k3)" stroke-dasharray="2 5" opacity=".5"/>`;
    s += `<text x="${W-R}" y="${y(v)-5}" text-anchor="end" fill="var(--k3)" font-size="9.5" font-family="var(--mono)" opacity=".8">${t}</text>`;
  });

  const i0 = Math.max(0, HOURS.indexOf(S.from)), i1 = Math.max(0, HOURS.indexOf(S.to));
  s += `<rect x="${x(i0)}" y="${T}" width="${Math.max(0, x(i1)-x(i0))}" height="${PH}" fill="var(--accent)" opacity=".07"/>`;
  [i0, i1].forEach(i => s += `<line x1="${x(i)}" y1="${T}" x2="${x(i)}" y2="${T+PH}" stroke="var(--accent)" opacity=".45"/>`);
  
  s += `<path d="${line(D.map(d => d.wC))}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<path d="${line(D.map(d => d.app))}" fill="none" stroke="var(--k3)" stroke-width="2.5" stroke-linejoin="round"/>`;

  D.forEach((d, i) => {
    const cy = y(d.wC);
    s += d.src === "실측"
      ? `<circle cx="${x(i)}" cy="${cy}" r="4" fill="var(--accent)"/>`
      : `<circle cx="${x(i)}" cy="${cy}" r="3" fill="none" stroke="var(--faint)" stroke-width="1.4"/>`;
  });

  const cw = (W - L - R) / HOURS.length;
  [
    ["기상청", d => KMA[d.kl] || KMA[0], d => (KMA[d.kl] ? KMA[d.kl].l : "—"), d => false],
    ["미군",   d => CAT[d.cat] || CAT[0], d => (d.cat ? "C" + d.cat : "—"), d => d.cat === 5],
    ["채택",   d => LV[d.lv] || LV[0],   d => (d.lv || "—"),             d => d.lv === 5]
  ].forEach(([lab, get, txt, blk], r) => {
    const yy = SY + r * (SH + GP);
    s += `<text x="${L-9}" y="${yy+17}" text-anchor="end" fill="var(--dim)" font-size="10.5" font-family="var(--mono)">${lab}</text>`;
    D.forEach((d, i) => {
      const o = get(d), cx = L + i * cw, B = blk(d);
      s += `<rect x="${cx+1}" y="${yy}" width="${cw-2}" height="${SH}" rx="4" fill="${o.c}"${B ? ' stroke="var(--black-line)"' : ''}/>`;
      if (B) s += `<line x1="${cx+2}" y1="${yy+SH-1}" x2="${cx+cw-2}" y2="${yy+1}" stroke="var(--black-line)" stroke-width="1.5"/>`;
      s += `<text x="${cx+cw/2}" y="${yy+17}" text-anchor="middle" font-weight="640" font-family="var(--mono)" fill="${o.i}">${txt(d)}</text>`;
    });
  });

  const ty = SY + 3 * (SH + GP) + 15;
  D.forEach((d, i) => {
    if (d.h % 2) return;
    s += `<text x="${L+i*cw+cw/2}" y="${ty}" text-anchor="middle" fill="var(--faint)" font-size="10.5" font-family="var(--mono)">${pad(d.h)}</text>`;
  });

  chartEl.innerHTML = s;
}

function renderDay() {
  const D = computeDay();
  renderEnvCards();
  drawDay(D);
  renderComparison(D);
  renderTimelineGrid(D);

  const n = getSelectedWindowPeakData(D);
  const l = LV[n.lv] || LV[0];

  const peakTimeNote = document.getElementById("peakTimeNote");
  if (peakTimeNote) {
    peakTimeNote.textContent = `계획 구간 (${pad(S.from)}:00~${pad(S.to)}:00) 중 최악 피크 시각 [${pad(n.h)}:00] 기준`;
  }
  
  const vEl = document.getElementById("verdict");
  if (vEl) {
    const kmaLabel = KMA[n.kl] ? KMA[n.kl].l : "—";
    const catLabel = CAT[n.cat] ? CAT[n.cat].l : "—";
    vEl.innerHTML =
      `<div class="chip ${n.lv===5?"hatch":""}" style="${n.lv===5?"":`background:${l.c};color:${l.i}`}">${n.lv}</div>
       <div><h3>${l.n} (피크 시각 ${pad(n.h)}:00)</h3><p>${l.a}<br><span style="color:var(--faint)">기상청 ${kmaLabel} · 미군 ${catLabel} → 높은 쪽 채택</span></p></div>`;
  }
  
  const isCold = n.seasonal && n.seasonal.activeSeason === "WINTER";
  const cold = n.cold || {};

  const prEl = document.getElementById("planRange");
  if (prEl) prEl.textContent = `${pad(S.from)}:00 – ${pad(S.to)}:00 · ${S.pax}명`;

  // 계획 구간 내 훈련 가능 시간 집계
  const i0 = Math.max(0, HOURS.indexOf(S.from)), i1 = Math.max(0, HOURS.indexOf(S.to));
  let okH = 0, totH = 0;
  for (let i = i0; i < i1; i++) { if (D[i]) { totH++; if (D[i].lv <= 3) okH++; } }
  const okEl = document.getElementById("okHours");
  if (okEl) okEl.innerHTML = `${okH}<small> / ${totH}시간</small>`;
  const okDescEl = document.getElementById("okHoursDesc");
  if (okDescEl) {
    okDescEl.textContent = totH
      ? `계획 구간 ${totH}시간 중 채택 등급 3단계 이하 시간 (가용률 ${Math.round(okH / totH * 100)}%)`
      : "계획 구간을 선택하십시오";
  }

  let best = null, cur = null;
  D.forEach((d, i) => {
    if (d.lv <= 3) {
      if (cur === null) cur = i;
      if (!best || (i - cur) >= (best[1] - best[0])) best = [cur, i];
    } else cur = null;
  });

  const safeWinLabel = best ? `${pad(D[best[0]].h)}:00 – ${pad(D[best[1]].h+1)}:00` : "없음";
  const swEl = document.getElementById("safeWin");
  if (swEl) swEl.textContent = safeWinLabel;

  renderColdPanel(n, isCold);
  const verdict = computeVerdict(D, n, safeWinLabel);
  renderVerdictPanel(verdict);
  renderBrief(buildBrief(D, n, verdict, safeWinLabel));
  const slotsEl = document.getElementById("slots");
  if (slotsEl) slotsEl.innerHTML = D.map(d => `<span class="slot ${d.lv<=3?"ok":"no"}">${pad(d.h)} ${d.lv<=3?"가":"불가"}</span>`).join("");
  
  const m = S.meas.filter(v => v !== null && !isNaN(v)).length;
  const meEl = document.getElementById("measEcho");
  if (meEl) meEl.textContent = m ? `실측 ${m} / 17 시각 · 나머지 보간` : "실측 없음 · 표본 기준값 사용";
  
  const tbody = document.querySelector("#tbl tbody");
  if (tbody) {
    tbody.innerHTML = D.map(d => {
      const kmaColor = KMA[d.kl] ? (KMA[d.kl].c === "var(--c0)" ? "var(--dim)" : KMA[d.kl].c) : "var(--dim)";
      const kmaText = KMA[d.kl] ? KMA[d.kl].l : "—";
      const catText = CAT[d.cat] ? CAT[d.cat].l : "—";
      const lvText = LV[d.lv] ? LV[d.lv].n : "—";
      const isPeakInWindow = d.h === n.h;
      return `
        <tr class="${isPeakInWindow ? "now" : ""}">
          <td style="font-family:var(--mono)">${pad(d.h)}:00 ${isPeakInWindow ? "🔥 [피크]" : ""}</td>
          <td class="num">${d.ta.toFixed(1)}</td><td class="num">${d.rh}</td><td class="num">${d.app.toFixed(1)}</td>
          <td style="color:${kmaColor}">${kmaText}</td>
          <td class="num">${d.wC.toFixed(1)}°C</td><td>${catText}</td>
          <td><b>${d.lv} ${lvText}</b></td><td style="color:var(--faint)">${d.src}</td>
        </tr>`;
    }).join("");
  }
}

/* 한랭 지표 패널 — 요구/착용 단열값, 동상 노출시간, after-drop 경고 */
function renderColdPanel(n, isCold) {
  const box = document.getElementById("coldPanel");
  if (!box) return;
  const c = n.cold || {};
  if (!isCold || !c.frostbiteRisk) { box.hidden = true; return; }
  box.hidden = false;

  const fb = c.frostbiteMin >= 999 ? "120분 초과" : `${c.frostbiteMin}분`;
  const r = c.frostbiteRisk;
  const deficitTxt = c.deficit > 0
    ? `<b style="color:var(--c4)">${c.deficit} clo 부족</b>`
    : `<b style="color:var(--c1)">충족</b>`;

  box.innerHTML = `
    <div class="cold-grid">
      <div class="cold-item">
        <label>과업 대사율</label>
        <b>${c.met} MET</b>
        <small>${c.isStatic ? "정적 과업 — 한랭 최고 위험군" : "활동성 과업"}</small>
      </div>
      <div class="cold-item">
        <label>요구 단열값 / 착용</label>
        <b>${c.reqClo} / ${c.wornClo} clo</b>
        <small>${deficitTxt}</small>
      </div>
      <div class="cold-item">
        <label>노출 피부 동상 발생</label>
        <b style="color:${r.color}">${fb}</b>
        <small>동상 위험 <b style="color:${r.color}">${r.name}</b></small>
      </div>
      <div class="cold-item">
        <label>노출 / 재가온 주기</label>
        <b>${c.cycleLabel}</b>
        <small>${r.buddy ? `동료 점검 ${r.buddy}분 주기` : "자가·동료 관찰"}</small>
      </div>
    </div>
    ${c.afterDrop ? `<p class="cold-warn">⚠️ <b>발한 후 정지 시점 급냉(after-drop) 주의</b> — 고강도 과업은 활동 중에는 안전하나, 젖은 상태로 휴식에 들어가면 급격히 냉각됩니다. 정지 직전 겉옷 추가·환복을 준비하십시오.</p>` : ""}
    ${c.isStatic ? `<p class="cold-warn">🥶 <b>정적 과업 경고</b> — 대사열 생산이 없어 한랭손상 위험이 가장 높은 과업군입니다. 교대 주기 단축과 재가온 시설 운용이 필수입니다.</p>` : ""}
    <p class="cold-src">근거: TB MED 508 표 3-1(과업별 MET) · 표 3-2(복장 clo) · 그림 3-2(요구 단열값) · 그림 3-5(동상 발생시간) · 표 3-4(버디체크 주기)</p>
  `;
}

/* ══════════════════════════════════════════════════════════════
   활동 개시 전 안전브리핑 — 5단계
   ──────────────────────────────────────────────────────────────
   위험성평가 결과가 문서에 머물지 않고 현장 행동으로 이어지도록, 활동 직전 지휘자가
   병력과 함께 시행하는 5단계 절차를 산출값으로 자동 생성한다.
   근거: 「사업장 위험성평가에 관한 지침」(고용노동부 고시)의 작업 전 안전점검회의(TBM)
        — 위험성평가 결과를 작업 전 회의로 공유·주지하도록 규정한 절차를 부대활동에 적용
   ※ 활동 개시 여부 결정은 전적으로 지휘관 권한이며, 본 시스템은 판단 근거만 제시한다.
   ══════════════════════════════════════════════════════════════ */
let _briefText = "";

function buildBrief(D, peak, verdict, safeWin) {
  const s = peak.seasonal || {};
  const cold = peak.cold || {};
  const isCold = s.activeSeason === "WINTER";
  const isDust = s.activeSeason === "DUST";
  const r = REGIONS[S.region] || {};
  const act = UNIT_ACTIVITIES.find(a => a.id === S.activeActivityId) || {};
  const taskObj = TASKS.find(t => t.id === S.task) || {};
  const gearObj = GEARS.find(g => g.id === S.gear) || {};

  /* 규정상 절대 중지 기준 — 본 시스템 판단이 아니라 육군규정에 의한 강제 조항 */
  const hardStop =
    (!isCold && peak.wRaw >= 32.0) ? { on: true, why: `온도지수 ${peak.wRaw.toFixed(1)} — 육군규정 32.0 이상 '중지'` }
    : (isCold && s.chillTemp <= -24.1) ? { on: true, why: `체감온도 ${s.chillTemp}℃ — 육군규정 -24.1℃ 이하 '중지'` }
    : { on: false, why: "" };

  let go, goCls, goWhy;
  if (hardStop.on) {
    go = "시행 보류 권고"; goCls = "p-high";
    goWhy = `${hardStop.why}. 경계작전 등 필수 활동만 시행하고 야외훈련은 중지 대상입니다.`;
  } else if (verdict.reg.lv >= 4) {
    go = "시행 보류 권고"; goCls = "p-high";
    goWhy = `규정 판정 '${verdict.reg.status}' — ${verdict.reg.action}`;
  } else if (verdict.reg.lv >= 2 || verdict.detail.escalated) {
    go = "조건부 시행"; goCls = "p-mid";
    goWhy = `규정 판정 '${verdict.reg.status}'. ` +
            (verdict.detail.escalated
              ? `다만 과업·복장 보정 시 '${verdict.detail.effBandName}' 수준에 해당하므로, 아래 감소대책 시행을 전제로 판단하십시오.`
              : `아래 감소대책 시행을 전제로 시행 가능합니다.`);
  } else {
    go = "시행 가능"; goCls = "p-low";
    goWhy = `규정 판정 '${verdict.reg.status}' — 계획된 감소대책 유지 하에 시행 가능합니다.`;
  }

  const hazards = [];
  if (isCold) {
    hazards.push(`피크 시각 ${pad(peak.h)}:00 체감온도 <b>${s.chillTemp}℃</b> (${s.activeStatus})`);
    if (cold.frostbiteMin < 999) hazards.push(`노출 피부 동상 발생까지 <b>${cold.frostbiteMin}분</b> — 위험 ${cold.frostbiteRisk.name}`);
    if (cold.deficit > 0) hazards.push(`방한 단열 <b>${cold.deficit.toFixed(2)} clo 부족</b> (요구 ${cold.reqClo.toFixed(2)} / 착용 ${cold.wornClo.toFixed(2)})`);
    if (cold.isStatic) hazards.push(`<b>정적 과업</b> — 대사열 생산이 없어 한랭손상 위험 최고`);
    if (cold.afterDrop) hazards.push(`발한 후 정지 시점 <b>급냉(after-drop)</b> 위험`);
  } else if (isDust) {
    hazards.push(`미세먼지 ${s.activeStatus} — PM10 ${S.envData.pm10} · PM2.5 ${S.envData.pm25} ㎍/㎥`);
  } else {
    hazards.push(`피크 시각 ${pad(peak.h)}:00 규정 판정 지수 <b>${peak.wRaw.toFixed(1)}℃</b> (${s.activeStatus})`);
    hazards.push(`${gearObj.name} 보정 적용 시 유효 온도지수 <b>${peak.wC.toFixed(1)}℃</b>`);
  }

  const asks = isCold
    ? ["손·발·귀에 감각 저하나 저림이 있는 사람?", "어제 잠을 못 잤거나 몸 상태가 좋지 않은 사람?", "방한 장구 미수령·젖은 상태인 사람?"]
    : ["최근 감기·발열·설사 증상이 있는 사람?", "어제 잠을 못 잤거나 아침 식사를 거른 사람?", "이전에 온열손상 병력이 있는 사람?"];

  const declares = isCold
    ? ["나는 손발 감각이 둔해지면 즉시 보고한다.",
       "나는 땀이 나면 겉옷을 열어 조절하고, 정지 전에 겉옷을 추가한다.", "나는 2인 1조를 유지하고 동료의 안면 상태를 확인한다."]
    : ["나는 어지럼·두통·오심이 오면 즉시 보고한다.",
       "나는 휴식 시 그늘·냉각 구역으로 이동한다.", "나는 동료의 이상 징후를 관찰하고 즉시 보고한다."];

  const checks = isCold
    ? ["방한 피복 착용 상태 (머리·손·발·안면 노출 차단)", "젖은 피복 교체용 예비 내피·양말 휴대",
       "재가온 시설(난방 천막·온풍기) 가동 상태", "통신장비 배터리 저온 성능 저하 점검", "구급낭 및 후송 차량 대기 상태"]
    : ["그늘 휴식지·냉각 구역 개설 상태", "응급 냉각(냉수 침수) 준비 상태",
       "구급낭 및 후송 차량 대기 상태", "통신장비 작동 확인"];

  const fsb = {
    go, goCls, goWhy, hardStop,
    header: {
      region: r.location || "-",
      date: S.planDate,
      window: `${pad(S.from)}:00 – ${pad(S.to)}:00`,
      // 프리셋 선택 후 과업·복장을 수동 변경했다면 라벨이 실제 설정과 어긋나므로 표시
      act: (act.name || "-") + ((act.task && (act.task !== S.task || act.gear !== S.gear)) ? " (조정됨)" : ""),
      task: taskObj.name || "-",
      gear: gearObj.name || "-",
      pax: S.pax,
      safeWin
    },
    hazards, asks, declares, checks, verdict
  };

  _briefText = briefToText(fsb);
  return fsb;
}

function briefToText(f) {
  const h = f.header;
  const strip = t => String(t).replace(/<[^>]+>/g, "");
  return [
    `[활동 개시 전 안전브리핑]`,
    `일자 ${h.date} · 시간대 ${h.window} · ${h.region}`,
    `활동 ${h.act} / 과업 ${h.task} / 복장 ${h.gear} / 인원 ${h.pax}명`,
    ``,
    `1단계. 핵심 위험요소 공유`,
    ...f.hazards.map((x, i) => `  ${i + 1}) ${strip(x)}`),
    `  규정 판정 : ${f.verdict.reg.scope} ${f.verdict.reg.value} → ${f.verdict.reg.status}`,
    `  안전 훈련 가능 시간창: ${h.safeWin}`,
    ``,
    `2단계. 병력 참여 위험확인 (거수 확인)`,
    ...f.asks.map((x, i) => `  ${i + 1}) ${x}`),
    ``,
    `3단계. 행동 선언 (복창)`,
    ...f.declares.map((x, i) => `  ${i + 1}) ${x}`),
    ``,
    `4단계. 장비·무기·통신체계 점검`,
    ...f.checks.map((x, i) => `  □ ${x}`),
    ``,
    `5단계. 지휘관 최종승인`,
    `  판단 근거: ${f.go} — ${strip(f.goWhy)}`,
    `  ※ 활동 개시 여부는 지휘관이 결정합니다.`,
    ``,
    `[감소대책 — 우선순위순]`,
    ...f.verdict.measures.map(m => `  ${m.pri}.${m.priName} (${m.m4}) ${strip(m.text)}`)
  ].join("\n");
}

window.copyBrief = function () {
  if (!_briefText) return;
  const done = () => {
    const b = document.getElementById("briefCopied");
    if (b) { b.hidden = false; setTimeout(() => { b.hidden = true; }, 2200); }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(_briefText).then(done).catch(() => fallbackCopy(_briefText, done));
  } else fallbackCopy(_briefText, done);
};

function fallbackCopy(text, cb) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); cb(); } catch (e) { /* noop */ }
  document.body.removeChild(ta);
}

function renderBrief(f) {
  const box = document.getElementById("briefPanel");
  if (!box) return;
  const h = f.header;
  const step = (n, title, body) => `
    <div class="brief-step">
      <div class="brief-no">${n}</div>
      <div class="brief-body"><h4>${title}</h4>${body}</div>
    </div>`;

  box.innerHTML = `
    <div class="brief-head">
      <div><label>일자 · 시간대</label><b>${h.date} · ${h.window}</b></div>
      <div><label>지역</label><b>${h.region}</b></div>
      <div><label>활동 · 과업</label><b>${h.act} / ${h.task}</b></div>
      <div><label>복장 · 인원</label><b>${h.gear} / ${h.pax}명</b></div>
    </div>

    ${step(1, "핵심 위험요소 공유 <small>(계획단계 평가 결과를 행동 기준으로 전환)</small>",
      `<ul class="brief-ul">${f.hazards.map(x => `<li>${x}</li>`).join("")}</ul>
       <p class="brief-kv">규정 판정 <b>${f.verdict.reg.scope} ${f.verdict.reg.value} → ${f.verdict.reg.status}</b>
        · 안전 훈련 가능 시간창 <b>${h.safeWin}</b></p>`)}

    ${step(2, "병력 참여 위험확인 <small>(거수 확인 — 위험 인식의 행동 전환 준비)</small>",
      `<ul class="brief-ul ask">${f.asks.map(x => `<li>${x}</li>`).join("")}</ul>`)}

    ${step(3, "행동 선언 <small>(복창 — 위험 인식을 개인별 행동 기준으로 고정)</small>",
      `<ul class="brief-ul say">${f.declares.map(x => `<li>“${x}”</li>`).join("")}</ul>`)}

    ${step(4, "장비·무기·통신체계 점검 <small>(돌발 사고 가능성 사전 차단)</small>",
      `<ul class="brief-ul chk">${f.checks.map(x => `<li>${x}</li>`).join("")}</ul>`)}

    ${step(5, "지휘관 최종승인 <small>(시행 / 조건부 시행 / 보류)</small>",
      `<div class="brief-go ${f.goCls}">
         <b>${f.go}</b>
         <p>${f.goWhy}</p>
       </div>
       ${f.hardStop.on ? `<p class="brief-hard">⛔ 육군규정상 <b>중지</b> 기준에 해당합니다. 본 항목은 시스템 판단이 아니라 규정에 의한 강제 조항으로, 하향 조정할 수 없습니다.</p>` : ""}
       <p class="brief-auth">※ 활동 개시 여부는 <b>전적으로 지휘관의 권한</b>입니다. 본 체계는 판단에 필요한 정량 근거를 제공하는 지원 도구입니다.</p>`)}

    <span class="brief-copied" id="briefCopied" hidden>✔ 브리핑 전문이 복사되었습니다</span>
  `;
}

/* 판정 패널 — 1차 규정(절대) / 2차 기상 요인 상세(보강) */
function renderVerdictPanel(v) {
  const box = document.getElementById("verdictPanel");
  if (!box) return;
  const M4 = { Man: "인적", Machine: "기계적", Media: "환경적", Management: "관리적" };
  const r = v.reg, d = v.detail, c = d.cold || {};

  box.innerHTML = `
    <div class="vd-two">
      <div class="vd-col vd-reg">
        <div class="vd-tag">1차 · 규정 판정 <b>(육군 규정 절대 기준)</b></div>
        <div class="vd-idx">${r.scope} <b>${r.value}</b></div>
        <div class="vd-status ${r.isStop ? "stop" : ""}">${r.status}</div>
        <p class="vd-act">${r.action}</p>
        <p class="vd-src">근거 : ${r.src}</p>
        ${r.isStop ? `<p class="vd-stop">⛔ 규정상 <b>중지</b> 기준에 해당함. 본 항목은 시스템 판단이 아니라 규정에 의한 강제 조항으로 하향 조정할 수 없음.</p>` : ""}
      </div>

      <div class="vd-col vd-det">
        <div class="vd-tag">2차 · 세부 산출 근거 <b>(TB MED 507 / 508 보강)</b></div>
        ${d.isCold ? `
          <table class="vd-tbl">
            <tr><td>과업 대사율</td><td><b>${c.met != null ? c.met : "-"} MET</b> · ${d.task}</td></tr>
            <tr><td>요구 / 착용 단열</td><td><b>${c.reqClo != null ? c.reqClo.toFixed(2) : "-"} / ${c.wornClo != null ? c.wornClo.toFixed(2) : "-"} clo</b></td></tr>
            <tr><td>노출 / 재가온</td><td><b>${c.cycleLabel || "-"}</b></td></tr>
            <tr><td>동상 발생시간</td><td><b>${c.frostbiteMin >= 999 ? "120분 초과" : (c.frostbiteMin || "-") + "분"}</b> · 위험 ${c.frostbiteRisk ? c.frostbiteRisk.name : "-"}</td></tr>
          </table>
          <p class="vd-src">근거 : TB MED 508 (과업별 MET · 요구 단열값 · 동상 발생시간 · 동료점검 주기)</p>
        ` : `
          <table class="vd-tbl">
            <tr><td>과업 대사율</td><td><b>${c.met != null ? c.met : "-"} MET</b> · ${d.task}</td></tr>
            <tr><td>규정 판정 지수</td><td><b>${d.rawIdx.toFixed(1)}</b> → ${d.rawBandName}</td></tr>
            <tr><td>복장 보정</td><td>${d.gear} <b>${d.adj >= 0 ? "+" : ""}${d.adj}℃</b></td></tr>
            <tr><td>보정 후 유효 지수</td><td><b>${d.effIdx.toFixed(1)}</b> → ${d.effBandName} 상당</td></tr>
          </table>
          <p class="vd-src">근거 : TB MED 507 (열지수 등급 임계 · 복장 WBGT 가산)</p>
        `}
        ${d.escalated ? (d.isCold
          ? `<p class="vd-warn">⚠️ 규정 판정은 <b>${r.status}</b>이나, 과업·복장 조건상 보강 조치 필요 — ${d.escalReason}. 규정의 체감온도 단일 축은 과업 대사율·복장 단열을 반영하지 않음.</p>`
          : `<p class="vd-warn">⚠️ 규정 판정은 <b>${d.rawBandName}</b>이나, 과업·복장 보정 시 <b>${d.effBandName}</b> 수준에 해당함. 규정 준수와 별도로 보강 조치 필요.</p>`) : ""}
      </div>
    </div>

    <h4 class="vd-h">감소대책 (우선순위순 · 4M 분류)</h4>
    <table class="aras-tbl">
      <thead><tr><th style="width:64px">우선순위</th><th style="width:74px">4M</th><th>대책</th></tr></thead>
      <tbody>
        ${v.measures.map(m => `
          <tr>
            <td><span class="aras-pri p${m.pri}">${m.pri}. ${m.priName}</span></td>
            <td><span class="aras-m4">${M4[m.m4]}</span></td>
            <td>${m.text}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <p class="aras-note">
      <b>1차 규정 판정은 절대 기준</b>으로 어떤 경우에도 완화되지 않으며, 2차 상세 평가는 규정이 다루지 않는
      과업 대사율·복장 단열 축을 공개 근거로 보완한 참고 자료임.
      감소대책 우선순위 체계는 「사업장 위험성평가에 관한 지침」(고용노동부 고시)을 따름.
    </p>
  `;
}

/* ═══════════ 30일 훈련 가능 캘린더 엔진 ═══════════
   파이프라인이 산출한 전 시점(31일 × 시간대 × 지역)을 전수 판정하여
   과업·복장·인원 조건별 "어느 날 몇 시가 훈련 가능한가"를 달력 형태로 시각화한다.
   핵심: computeDay() 로직을 재사용하므로 모든 보정(착의·대사율·MET·clo·동상)이 동일하게 적용된다. */

let _calRegion = null; // 캘린더 전용 지역 선택 (null이면 S.region 추종)

function computeDayForDate(dateStr) {
  const savedPlanDate = S.planDate;
  S.planDate = dateStr;
  const D = computeDay();
  S.planDate = savedPlanDate;
  return D;
}

function computeCalendar(regionId) {
  const savedRegion = S.region;
  const savedByDate = S.byDateWeather;
  const needSwap = regionId && regionId !== savedRegion;

  if (needSwap) {
    const bucket = S.byRegionWeather && S.byRegionWeather[regionId];
    if (bucket && bucket.byDate) S.byDateWeather = bucket.byDate;
    const r = REGIONS[regionId];
    if (r) { TA = [...r.fallbackTA]; RH = [...r.fallbackRH]; }
  }

  const dataset = S.byDateWeather || {};
  const dates = Object.keys(dataset).sort();
  const results = [];

  for (const dateStr of dates) {
    const D = computeDayForDate(dateStr);
    const peak = getSelectedWindowPeakData(D);
    const trainableHours = D.filter(d => d.lv <= 3);

    let best = null, cur = null;
    D.forEach((d, i) => {
      if (d.lv <= 3) {
        if (cur === null) cur = i;
        if (!best || (i - cur) >= (best[1] - best[0])) best = [cur, i];
      } else cur = null;
    });
    const safeWin = best ? `${pad(D[best[0]].h)}:00–${pad(D[best[1]].h+1)}:00` : "없음";

    results.push({
      date: dateStr,
      trainableCount: trainableHours.length,
      totalHours: D.length,
      peakLv: peak.lv,
      peakSeason: peak.seasonal,
      safeWindow: safeWin,
      peak
    });
  }

  if (needSwap) {
    S.byDateWeather = savedByDate;
    const r = REGIONS[savedRegion];
    if (r) { TA = [...r.fallbackTA]; RH = [...r.fallbackRH]; }
  }

  return results;
}

function renderCalendarRegionTabs() {
  const container = document.getElementById("calRegionTabs");
  if (!container) return;
  const activeRegion = _calRegion || S.region;
  const ids = (S.byRegionWeather && Object.keys(S.byRegionWeather).length)
    ? Object.keys(S.byRegionWeather) : Object.keys(REGIONS);

  container.innerHTML = ids.map(id => {
    const meta = REGIONS[id] || {};
    return `<button type="button" class="cal-region-tab ${activeRegion === id ? 'active' : ''}"
      onclick="switchCalRegion('${id}')">${meta.icon || '📍'} ${meta.short || id}</button>`;
  }).join("");
}

window.switchCalRegion = function(regionId) {
  _calRegion = regionId;
  renderCalendarView();
};

function renderCalendarStats(calData) {
  const box = document.getElementById("calStats");
  if (!box) return;

  const total = calData.length;
  if (!total) { box.innerHTML = ""; return; }

  // 분석 규모를 실제 산출값으로 표기 (일수 × 시간대 × 지역)
  const scopeEl = document.getElementById("calScopeLabel");
  if (scopeEl) {
    const regionCount = S.byRegionWeather ? Object.keys(S.byRegionWeather).length : 1;
    const slots = calData.reduce((s, d) => s + d.totalHours, 0) * Math.max(1, regionCount);
    scopeEl.textContent = `${slots.toLocaleString()}시점`;
  }

  const totalHoursAll = calData.reduce((s, d) => s + d.totalHours, 0);
  const trainableAll = calData.reduce((s, d) => s + d.trainableCount, 0);
  const pct = totalHoursAll ? Math.round(trainableAll / totalHoursAll * 100) : 0;
  const barColor = pct >= 60 ? "var(--c2)" : pct >= 30 ? "var(--c3)" : "var(--c4)";

  // 등급별 일수 분포 (피크 등급 기준)
  const lvCounts = [0,0,0,0,0,0];
  calData.forEach(d => { if (d.peakLv >= 0 && d.peakLv <= 5) lvCounts[d.peakLv]++; });
  const lvColors = ["var(--c0)","var(--c1)","var(--c2)","var(--c3)","var(--c4)","var(--black-fill)"];
  const lvNames = ["해당없음","관심","주의","경고","위험","중대위험"];

  // 완전 가용일 (17/17시간 가능) vs 불가일
  const fullDays = calData.filter(d => d.trainableCount >= d.totalHours).length;
  const noDays = calData.filter(d => d.trainableCount === 0).length;

  // 1. 최장 연속 훈련 가능일 (Streak: 피크 등급 3단계 이하 및 가용시간 8시간 이상)
  let maxStreak = 0, currentStreak = 0;
  let maxStreakStart = "", maxStreakEnd = "";
  let currentStreakStart = "";

  calData.forEach((d, idx) => {
    const isGoodDay = d.peakLv <= 3 && d.trainableCount >= 8;
    if (isGoodDay) {
      if (currentStreak === 0) currentStreakStart = d.date;
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStreakStart = currentStreakStart;
        maxStreakEnd = d.date;
      }
    } else {
      currentStreak = 0;
    }
  });

  const streakRangeStr = maxStreak > 0
    ? `${maxStreakStart.slice(5).replace('-', '/')} ~ ${maxStreakEnd.slice(5).replace('-', '/')}`
    : "없음";

  // 2. 10일 순기별 기상 위험 분포 (초순 1~10일, 중순 11~20일, 하순 21~30일)
  const decades = [
    { name: "초순(1~10일)", items: calData.slice(0, 10) },
    { name: "중순(11~20일)", items: calData.slice(10, 20) },
    { name: "하순(21~30일)", items: calData.slice(20, 30) }
  ];

  const decadeStats = decades.map(dec => {
    if (!dec.items.length) return { name: dec.name, pct: 0, highRiskDays: 0 };
    const totH = dec.items.reduce((s, d) => s + d.totalHours, 0);
    const trH = dec.items.reduce((s, d) => s + d.trainableCount, 0);
    const highRiskDays = dec.items.filter(d => d.peakLv >= 4).length;
    const pct = totH ? Math.round(trH / totH * 100) : 0;
    return { name: dec.name, pct, highRiskDays };
  });

  // 가장 여건이 우수한 순기 찾기
  let bestDecade = decadeStats[0];
  decadeStats.forEach(d => { if (d.pct > bestDecade.pct) bestDecade = d; });

  box.innerHTML = `
    <div class="cal-stat-box">
      <span class="cs-label">30일 훈련 가용률</span>
      <span class="cs-val">${pct}<small>% (${trainableAll}/${totalHoursAll}시간)</small></span>
      <div class="cs-bar"><div class="cs-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
    </div>
    <div class="cal-stat-box">
      <span class="cs-label">완전 가용일 / 완전 불가일</span>
      <span class="cs-val">${fullDays}<small>일 가용</small> / ${noDays}<small>일 불가</small></span>
      <span class="cs-label" style="margin-top:2px">전체 ${total}일 중 (피크 3단계 이하)</span>
    </div>
    <div class="cal-stat-box">
      <span class="cs-label">🔥 최장 연속 훈련 가능일 (Streak)</span>
      <span class="cs-val">${maxStreak}<small>일 연속 가용</small></span>
      <span class="cs-label" style="margin-top:2px;color:var(--accent)">구간: ${streakRangeStr}</span>
    </div>
    <div class="cal-stat-box">
      <span class="cs-label">📊 10일 순기별 가용 여건</span>
      <span class="cs-val">${bestDecade.name.split('(')[0]} <small>최고 ${bestDecade.pct}%</small></span>
      <span class="cs-label" style="margin-top:2px">
        ${decadeStats.map(d => `${d.name.slice(0,2)}:${d.pct}%`).join(' · ')}
      </span>
    </div>
    <div class="cal-stat-box" style="grid-column: 1 / -1">
      <span class="cs-label">피크 등급별 일수 분포</span>
      <div class="cal-dist">
        ${lvCounts.map((c, i) => c > 0 ? `<span class="cal-dist-chip" style="background:${lvColors[i]};color:${i===0||i===1||i===3?'#13202E':'#fff'}">
          ${lvNames[i]} ${c}일</span>` : "").join("")}
      </div>
    </div>
  `;
}

function renderCalendar(calData) {
  const container = document.getElementById("calGrid");
  if (!container) return;

  if (!calData.length) {
    container.innerHTML = `<p style="color:var(--dim);padding:24px;text-align:center">
      30일 날씨 DB 데이터를 불러오는 중... 상단의 ⚡ 날씨 수집 버튼을 누르거나 잠시 후 새로고침해 주세요.</p>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const dowNames = ["일","월","화","수","목","금","토"];

  // 월별로 그룹핑
  const months = {};
  calData.forEach(d => {
    const ym = d.date.slice(0, 7); // "2026-08"
    if (!months[ym]) months[ym] = [];
    months[ym].push(d);
  });

  let html = "";

  for (const [ym, days] of Object.entries(months)) {
    const [y, m] = ym.split("-");
    html += `<div class="cal-month-hdr">${y}년 ${parseInt(m)}월</div>`;

    // 요일 헤더
    html += `<div class="cal-dow-row">${dowNames.map(d => `<div class="cal-dow">${d}</div>`).join("")}</div>`;

    html += `<div class="cal-grid-inner">`;

    // 첫 날짜의 요일에 맞춰 빈 셀 삽입
    const firstDate = new Date(days[0].date + "T00:00:00");
    const startDow = firstDate.getDay(); // 0=일 ~ 6=토
    for (let i = 0; i < startDow; i++) {
      html += `<div class="cal-cell empty"></div>`;
    }

    for (const d of days) {
      const isToday = d.date === today;
      const isSelected = d.date === S.planDate;
      const lv = Math.min(5, Math.max(0, d.peakLv));
      const s = d.peakSeason || {};
      const seasonIcon = s.seasonIcon || "";
      const lvObj = LV[lv] || LV[0];
      const dayNum = parseInt(d.date.slice(8), 10);

      html += `
        <div class="cal-cell lv${lv} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             onclick="selectCalDate('${d.date}')" title="${d.date} · 피크 ${lv}단계 · ${d.trainableCount}/${d.totalHours}시간 가용">
          <div class="cal-date">
            ${isToday ? '<span class="cal-today-dot"></span>' : ''}
            ${dayNum}
            <span class="cal-season">${seasonIcon}</span>
          </div>
          <div class="cal-hours"><b>${d.trainableCount}</b>/${d.totalHours}h</div>
          <div class="cal-safe">${d.safeWindow}</div>
          <span class="cal-lv-badge" style="background:${lvObj.c};color:${lvObj.i}">${lv}</span>
        </div>`;
    }

    html += `</div>`;
  }

  container.innerHTML = html;
}

window.selectCalDate = function(dateStr) {
  S.planDate = dateStr;
  const dateInput = document.getElementById("planDate");
  if (dateInput) dateInput.value = dateStr;
  const dateStrEl = document.getElementById("currentDateStr");
  if (dateStrEl) dateStrEl.textContent = dateStr;
  recomputeAll();

  // 스크롤을 상세 패널로 이동
  const compBox = document.getElementById("compBox");
  if (compBox) compBox.scrollIntoView({ behavior: "smooth", block: "start" });
};

function renderCalendarView() {
  const activeRegion = _calRegion || S.region;
  renderCalendarRegionTabs();
  const calData = computeCalendar(activeRegion);
  renderCalendarStats(calData);
  renderCalendar(calData);
}

function recomputeAll() {
  renderDay();
  renderCalendarView();
}

/* 📂 MODAL POPUP CONTROL FUNCTIONS FOR LATEST_WEATHER.JSON VIEWER (HIGH CONTRAST) */
window.openJsonModal = function() {
  const modal = document.getElementById("jsonModal");
  if (!modal) return;
  modal.hidden = false;
  if (!S.byRegionWeather || !S.byRegionWeather[S.modalRegion]) S.modalRegion = S.region;
  renderJsonModalBody();
};

/* 30일 DB 팝업 상단 지역 선택 탭 (논산 / 양평) */
function renderModalRegionTabs() {
  const tabs = document.getElementById("mRegionTabs");
  if (!tabs) return;
  const ids = (S.byRegionWeather && Object.keys(S.byRegionWeather).length)
    ? Object.keys(S.byRegionWeather)
    : Object.keys(REGIONS);

  tabs.innerHTML = ids.map(id => {
    const meta = REGIONS[id] || {};
    const bucket = (S.byRegionWeather && S.byRegionWeather[id]) || {};
    const label = meta.short || bucket.short || id;
    const icon = meta.icon || "📍";
    const count = bucket.byDate ? Object.keys(bucket.byDate).length : 0;
    return `<button type="button" class="modal-region-btn ${S.modalRegion === id ? 'active' : ''}" onclick="switchModalRegion('${id}')">
      <span>${icon} ${label}</span><small>${count ? count + '일' : '연동중'}</small>
    </button>`;
  }).join("");
}

window.switchModalRegion = function(regionId) {
  S.modalRegion = regionId;
  renderJsonModalBody();
};

function renderJsonModalBody() {
  const rangeEl = document.getElementById("mMetaRange");
  const locEl = document.getElementById("mMetaLocation");
  const tbody = document.querySelector("#mSummaryTable tbody");

  renderModalRegionTabs();

  const bucket = (S.byRegionWeather && S.byRegionWeather[S.modalRegion]) || null;
  const dataset = bucket && bucket.byDate ? bucket.byDate : (S.modalRegion === S.region ? S.byDateWeather : {});
  const regionMeta = REGIONS[S.modalRegion] || {};

  if (locEl) {
    locEl.textContent = (bucket && bucket.location) || regionMeta.location || "-";
  }

  const dates = dataset ? Object.keys(dataset).sort() : [];
  if (rangeEl) {
    rangeEl.textContent = dates.length ? `${dates.length}개 날짜 (${dates[0]} ~ ${dates[dates.length-1]})` : "31개 날짜 예보 연동완료";
  }

  if (tbody) {
    if (dates.length) {
      tbody.innerHTML = dates.map(dStr => {
        const item = dataset[dStr] || {};
        const env = item.env || {};
        const isSelected = dStr === S.planDate && S.modalRegion === S.region;
        const diffDays = getDayDiffFromToday(dStr);
        const isApi = diffDays <= 10;
        const sourceLabel = isApi ? "📡 기상청 API 연동" : "📊 지난 1년 기후 추정";
        const sourceColor = isApi ? "#38BDF8" : "#F59E0B";

        return `
          <tr class="${isSelected ? "now" : ""}">
            <td style="font-family:var(--mono);color:${isSelected ? "#38BDF8" : "#F8FAFC"}">
              <b>${dStr}</b> ${isSelected ? "📌 [선택일]" : ""}
            </td>
            <td><span style="font-size:12px;color:${sourceColor};font-weight:600">${sourceLabel}</span></td>
            <td class="num" style="color:#F1F5F9">${env.ta ? env.ta.toFixed(1) : "33.2"}°C</td>
            <td class="num" style="color:#94A3B8">${env.rh || 68}%</td>
            <td class="num" style="color:#38BDF8;font-weight:700">${env.chillTemp ? env.chillTemp.toFixed(1) : "34.5"}°C</td>
            <td class="num" style="color:#F59E0B;font-weight:700">${env.wbgt ? env.wbgt.toFixed(1) : "31.8"}°C</td>
            <td><span style="font-size:12px;color:#4ADE80;font-weight:600">${env.pm10 || 42} µg/m³ (${env.dustStatus || "보통"})</span></td>
          </tr>
        `;
      }).join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#94A3B8;padding:24px">저장된 30일치 데이터베이스 항목을 불러오는 중...</td></tr>`;
    }
  }
}

window.closeJsonModal = function() {
  const modal = document.getElementById("jsonModal");
  if (modal) modal.hidden = true;
};

window.closeJsonModalOnOverlay = function(e) {
  if (e.target.id === "jsonModal") closeJsonModal();
};

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeJsonModal();
});

/* ⚡ TOP HEADER BUTTON: FETCH WEATHER FORECAST DATA VIA DATA PIPELINE */
let _pipelinePolling = null; // polling interval reference

window.triggerGitHubActionPipeline = async function() {
  const toast = document.getElementById("ghToast");
  const toastTitle = document.getElementById("ghToastTitle");
  const toastText = document.getElementById("ghToastText");
  const ghBadge = document.getElementById("ghBadge");
  const btn = document.getElementById("btnFetchWeather");

  // Disable button during pipeline
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

  if (toast) toast.hidden = false;
  if (toastTitle) toastTitle.textContent = "🚀 기상 데이터 수집 요청 중...";
  if (toastText) toastText.textContent = "파이프라인 트리거를 전송하고 있습니다.";
  
  if (ghBadge) {
    ghBadge.textContent = '● 수집 요청 중...';
    ghBadge.className = 'badge warn';
  }

  try {
    const res = await fetch('/api/trigger-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planDate: S.planDate,
        fromHour: S.from,
        toHour: S.to,
        activityId: S.activeActivityId
      })
    });

    const json = await res.json();
    console.log("Trigger API Response:", json);

    if (json.triggered) {
      if (toastTitle) toastTitle.textContent = "🔄 데이터 수집 파이프라인 가동됨";
      if (toastText) toastText.textContent = "수집 상태를 실시간 확인 중입니다... (약 1~3분 소요)";
      if (ghBadge) {
        ghBadge.textContent = '● ⏳ 수집 대기열 등록됨';
        ghBadge.className = 'badge warn';
      }
      // Start polling for status
      startPipelineStatusPolling();
    } else {
      if (toastTitle) toastTitle.textContent = "ℹ️ 수집 요청 실패";
      if (toastText) toastText.textContent = json.message || '알 수 없는 오류';
      if (ghBadge) {
        ghBadge.textContent = `● 연동 실패: ${json.error || '오류'}`;
        ghBadge.className = 'badge warn';
      }
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
      setTimeout(() => { if (toast) toast.hidden = true; }, 4000);
    }
  } catch (e) {
    console.log('데이터 연동 trigger note:', e.message);
    if (toastTitle) toastTitle.textContent = "⚠️ 네트워크 오류";
    if (toastText) toastText.textContent = e.message;
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    setTimeout(() => { if (toast) toast.hidden = true; }, 4000);
  }
};

/* 🔄 Pipeline Status Polling — 15초 간격으로 수집 상태 확인 */
function startPipelineStatusPolling() {
  if (_pipelinePolling) clearInterval(_pipelinePolling);

  let pollCount = 0;
  const maxPolls = 30; // 최대 7.5분 (15s × 30)

  // 첫 폴링은 10초 뒤 (GitHub Actions 큐 등록 시간 고려)
  setTimeout(() => {
    checkPipelineStatus();
    _pipelinePolling = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls) {
        stopPipelinePolling('timeout');
        return;
      }
      checkPipelineStatus();
    }, 15000);
  }, 10000);
}

async function checkPipelineStatus() {
  const toast = document.getElementById("ghToast");
  const toastTitle = document.getElementById("ghToastTitle");
  const toastText = document.getElementById("ghToastText");
  const ghBadge = document.getElementById("ghBadge");

  try {
    const res = await fetch('/api/action-status');
    const data = await res.json();
    console.log("Pipeline status:", data);

    if (data.status === 'queued') {
      if (toastTitle) toastTitle.textContent = "⏳ 수집 대기열 대기 중";
      if (toastText) toastText.textContent = "파이프라인이 실행 순서를 기다리고 있습니다...";
      if (ghBadge) { ghBadge.textContent = '● ⏳ 수집 대기 중'; ghBadge.className = 'badge warn'; }

    } else if (data.status === 'running') {
      if (toastTitle) toastTitle.textContent = "🔄 데이터 수집 진행 중...";
      if (toastText) toastText.textContent = "기상청 API에서 날씨 데이터를 수집하고 있습니다. 잠시만 기다려주세요.";
      if (ghBadge) { ghBadge.textContent = '● 🔄 수집 중...'; ghBadge.className = 'badge warn'; }

    } else if (data.status === 'success') {
      stopPipelinePolling('success');

    } else if (data.status === 'failed') {
      stopPipelinePolling('failed');

    } else if (data.status === 'cancelled') {
      stopPipelinePolling('cancelled');
    }
  } catch (e) {
    console.log('Status poll error:', e.message);
  }
}

function stopPipelinePolling(reason) {
  if (_pipelinePolling) { clearInterval(_pipelinePolling); _pipelinePolling = null; }

  const toast = document.getElementById("ghToast");
  const toastTitle = document.getElementById("ghToastTitle");
  const toastText = document.getElementById("ghToastText");
  const ghBadge = document.getElementById("ghBadge");
  const btn = document.getElementById("btnFetchWeather");

  if (reason === 'success') {
    if (toastTitle) toastTitle.textContent = "✅ 데이터 수집 완료!";
    if (toastText) toastText.textContent = "날씨 DB가 최신 데이터로 업데이트되었습니다. 자동으로 반영합니다.";
    if (ghBadge) { ghBadge.textContent = '● ✅ 수집 완료'; ghBadge.className = 'badge live'; }
    // 자동으로 최신 날씨 데이터 새로고침
    setTimeout(() => { fetchKmaLiveWeather(); }, 1500);
    setTimeout(() => { if (toast) toast.hidden = true; }, 5000);

  } else if (reason === 'failed') {
    if (toastTitle) toastTitle.textContent = "❌ 데이터 수집 실패";
    if (toastText) toastText.textContent = "파이프라인 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    if (ghBadge) { ghBadge.textContent = '● ❌ 수집 실패'; ghBadge.className = 'badge warn'; }
    setTimeout(() => { if (toast) toast.hidden = true; }, 5000);

  } else if (reason === 'cancelled') {
    if (toastTitle) toastTitle.textContent = "⚠️ 수집 취소됨";
    if (toastText) toastText.textContent = "파이프라인이 취소되었습니다.";
    if (ghBadge) { ghBadge.textContent = '● ⚠️ 수집 취소'; ghBadge.className = 'badge warn'; }
    setTimeout(() => { if (toast) toast.hidden = true; }, 4000);

  } else { // timeout
    if (toastTitle) toastTitle.textContent = "⏱️ 상태 확인 시간 초과";
    if (toastText) toastText.textContent = "수집이 아직 진행 중일 수 있습니다. 잠시 후 새로고침해주세요.";
    if (ghBadge) { ghBadge.textContent = '● ⏱️ 확인 시간 초과'; ghBadge.className = 'badge warn'; }
    setTimeout(() => { if (toast) toast.hidden = true; }, 4000);
  }

  // Re-enable button
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
}

async function fetchKmaLiveWeather() {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const json = await res.json();
      const badg = document.getElementById("liveBadge");

      // 다지역(논산·양평) 데이터셋 우선 적용
      if (json && json.regions) {
        S.byRegionWeather = json.regions;
        if (!applyRegionDataset(S.region)) {
          const first = Object.keys(json.regions)[0];
          if (first) { S.region = first; applyRegionDataset(first); }
        }
        S.modalRegion = S.region;
        renderRegionSelector();
      } else if (json && json.byDate) {
        // 구버전 단일 지역 JSON 호환
        S.byDateWeather = json.byDate;
      }
      if (json && (json.status === 'LIVE_KMA_DATA' || json.status === 'LIVE_GITHUB_ACTION_DATA')) {
        if (badg) {
          badg.textContent = '● D+10일 기상청 API / D+11~30일 1년 기후 추정';
          badg.className = 'badge live';
        }
      }
      if (json && json.startDate) {
        const dateInput = document.getElementById("planDate");
        if (dateInput) {
          if (json.startDate) dateInput.min = json.startDate;
          if (json.endDate) dateInput.max = json.endDate;
          if (!dateInput.value || dateInput.value < json.startDate || dateInput.value > json.endDate) {
            dateInput.value = json.startDate;
            S.planDate = json.startDate;
            const dateStrEl = document.getElementById("currentDateStr");
            if (dateStrEl) dateStrEl.textContent = S.planDate;
          }
        }
      }
    }
  } catch (e) {
    console.log('Local fallback climo mode');
  }

  recomputeAll();
}

function renderEnvCards() {
  const container = document.getElementById("envBanner");
  if (!container) return;
  const e = S.envData || {};
  const diffDays = getDayDiffFromToday(S.planDate);
  const isApi = diffDays <= 10;
  const srcText = isApi ? `선택일(${S.planDate}) 기상청 API 예보` : `선택일(${S.planDate}) 1년 기후 추정`;

  container.innerHTML = `
    <div class="env-chip">
      <div class="tag">기온 (TA)</div>
      <div class="val" style="color:var(--ink)">${e.ta || 33.2}°C</div>
      <div class="sub">${srcText}</div>
    </div>
    <div class="env-chip">
      <div class="tag">상대습도 (RH)</div>
      <div class="val" style="color:var(--k1)">${e.rh || 68}%</div>
      <div class="sub">습도 보정</div>
    </div>
    <div class="env-chip">
      <div class="tag">풍속 (WS)</div>
      <div class="val" style="color:var(--dim)">${e.ws || 2.1} <small>m/s</small></div>
      <div class="sub">바람 보정</div>
    </div>
    <div class="env-chip">
      <div class="tag">체감온도 (App)</div>
      <div class="val" style="color:var(--accent)">${e.chillTemp || 34.5}°C</div>
      <div class="sub">기상청 체감 3.0</div>
    </div>
    <div class="env-chip">
      <div class="tag">기본 WBGT</div>
      <div class="val" style="color:var(--k3)">${e.wbgt || 31.8}°C</div>
      <div class="sub">단순 열지수</div>
    </div>
    <div class="env-chip">
      <div class="tag">미세먼지 (PM10)</div>
      <div class="val" style="color:${(e.pm10 || 42)>80?'var(--c4)':'#3E9B5A'}">${e.pm10 || 42} <small>µg/m³</small></div>
      <div class="sub">상태: <b>${e.dustStatus || '보통'}</b></div>
    </div>
    <div class="env-chip">
      <div class="tag">초미세 (PM2.5)</div>
      <div class="val" style="color:${(e.pm25 || 22)>35?'var(--c4)':'#3E9B5A'}">${e.pm25 || 22} <small>µg/m³</small></div>
      <div class="sub">상태: <b>${e.dustStatus || '보통'}</b></div>
    </div>
    <div class="env-chip">
      <div class="tag">자외선 / 강수</div>
      <div class="val" style="color:#C79A3E">UV ${e.uvIndex || 8}</div>
      <div class="sub">강수확률 ${e.pop || 10}%</div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderRegionSelector();
  renderActivityPresets();

  const dateInput = document.getElementById("planDate");
  if (dateInput) {
    dateInput.value = S.planDate;
    const dateStrEl = document.getElementById("currentDateStr");
    if (dateStrEl) dateStrEl.textContent = S.planDate;

    dateInput.onchange = e => {
      S.planDate = e.target.value;
      const dateStrEl = document.getElementById("currentDateStr");
      if (dateStrEl) dateStrEl.textContent = `${S.planDate}`;
      recomputeAll();
    };
  }

  seg("task", TASKS, "task", "taskHint", () => { const t = TASKS.find(x => x.id === S.task); return t ? `${t.w} · ${t.ex}` : ''; }, () => recomputeAll());
  seg("gear", GEARS, "gear", "gearHint", () => { const g = GEARS.find(x => x.id === S.gear); return g ? g.src : ''; }, () => recomputeAll());

  const sf = document.getElementById("from"), st = document.getElementById("to");
  if (sf && st) {
    HOURS.forEach(h => {
      sf.insertAdjacentHTML("beforeend", `<option value="${h}" ${h===S.from?"selected":""}>${pad(h)}:00</option>`);
      st.insertAdjacentHTML("beforeend", `<option value="${h}" ${h===S.to?"selected":""}>${pad(h)}:00</option>`);
    });
    sf.onchange = () => { S.from = +sf.value; if (S.to <= S.from) { S.to = Math.min(21, S.from + 1); st.value = S.to; } recomputeAll(); };
    st.onchange = () => { S.to = +st.value; if (S.to <= S.from) { S.from = Math.max(5, S.to - 1); sf.value = S.from; } recomputeAll(); };
  }

  const paxEl = document.getElementById("pax");
  if (paxEl) paxEl.oninput = e => { S.pax = Math.max(1, +e.target.value || 1); recomputeAll(); };

  const root = document.documentElement;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";
  
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.onclick = () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      recomputeAll();
    };
  }

  const mg = document.getElementById("mgrid");
  if (mg) {
    mg.innerHTML = HOURS.map((h, i) =>
      `<div class="cell" data-i="${i}"><span>${pad(h)}:00</span>
       <input type="number" step="0.1" min="10" max="45" data-i="${i}" placeholder="—" aria-label="${pad(h)}시 실측 WBGT"></div>`
    ).join("");

    mg.addEventListener("input", e => {
      const i = +e.target.dataset.i, v = e.target.value;
      S.meas[i] = v === "" ? null : +v;
      mg.children[i].classList.toggle("meas", S.meas[i] !== null);
      recomputeAll();
    });

    const mLoad = document.getElementById("mLoad");
    if (mLoad) mLoad.onclick = () => {
      S.meas = BASE.slice();
      [...mg.querySelectorAll("input")].forEach((el, i) => { el.value = BASE[i].toFixed(1); mg.children[i].classList.add("meas") });
      recomputeAll();
    };
    const mClear = document.getElementById("mClear");
    if (mClear) mClear.onclick = () => {
      S.meas = HOURS.map(() => null);
      [...mg.querySelectorAll("input")].forEach((el, i) => { el.value = ""; mg.children[i].classList.remove("meas") });
      recomputeAll();
    };
    const mInterp = document.getElementById("mInterp");
    if (mInterp) mInterp.onclick = () => {
      const f = fill(); if (!f.any) return;
      S.meas = f.series.slice();
      [...mg.querySelectorAll("input")].forEach((el, i) => { el.value = S.meas[i].toFixed(1); mg.children[i].classList.add("meas") });
      recomputeAll();
    };
  }

  fetchKmaLiveWeather();
});
