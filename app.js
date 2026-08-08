"use strict";

/* ═══════════ DATA CONSTANTS & DATASETS ═══════════ */
const HOURS = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
let TA   = [26.1,26.5,27.8,29.5,31.2,32.8,34.1,35.0,35.8,36.2,35.9,35.0,33.6,31.8,30.0,28.6,27.6];
let RH   = [82,80,76,70,63,57,52,48,45,44,45,48,53,59,66,72,77];
let APP  = [28.0,28.5,30.1,32.0,33.9,35.4,36.6,37.4,38.1,38.5,38.2,37.4,36.1,34.3,32.5,30.9,29.6];
let BASE = [24.0,24.5,25.8,27.2,28.6,29.8,30.8,31.5,32.0,32.3,32.0,31.2,30.0,28.4,26.8,25.5,24.6];

/* 8 Core Military Activity Master Database */
const UNIT_ACTIVITIES = [
  { id: "act_range", name: "🎯 사격 훈련", task: "easy", gear: "iba", pax: 240, desc: "방탄복/전투조끼 착용 사격술 및 영점사격" },
  { id: "act_fitness", name: "🏃 체력 측정", task: "vhard", gear: "scu", pax: 300, desc: "체육복 착용 3km 뜀걸음 및 훈련 (복장 보정 +0°C, 고강도 800W)" },
  { id: "act_march10", name: "🎒 10km 급속행군", task: "heavy", gear: "iba", pax: 450, desc: "전술 부하 행군 (중작업 600W, 방탄/군장 +2.8°C)" },
  { id: "act_march40", name: "⚔️ 40km 전술행군", task: "heavy", gear: "iba", pax: 600, desc: "45lb 완전군장 행군 (고부하 야외 노출, 방탄/군장 +2.8°C)" },
  { id: "act_gaekae", name: "💥 각개전투 / 포복", task: "mod", gear: "iba", pax: 350, desc: "장애물 극복 및 전술 포복 (중등작업 425W)" },
  { id: "act_cbrn", name: "☣️ 화생방 제독", task: "mod", gear: "cbrn", pax: 180, desc: "MOPP 4단계 완전 보호의 착용 (+11.1°C 가산)" },
  { id: "act_obstacle", name: "🧗 유격 / 장애물", task: "vhard", gear: "scu", pax: 280, desc: "코스 장애물 극복 및 극기 훈련 (고강도 800W)" },
  { id: "act_custom", name: "⚙️ 사용자 직접설정", task: "heavy", gear: "iba", pax: 240, desc: "과업 및 복장 직접 선택" }
];

/* Military Task Metabolic Rates & Gear Adjustments (Celsius Basis) */
const TASKS = [
  { id: "easy",  name: "경작업 (~250W)",   w: "250 W", ex: "총기 손질 · 영점 사격자세 · 제식 훈련 · 실내/그늘 강의" },
  { id: "mod",   name: "중등작업 (~425W)", w: "425 W", ex: "30 lb 부하 정찰 · 전술 포복 · 진지 구축 · 경계 훈련" },
  { id: "heavy", name: "중작업 (~600W)",   w: "600 W", ex: "45 lb 완전군장 행군 · 4인 들것 환자 수송 · 야외 구보" },
  { id: "vhard", name: "고강도 (~800W)",   w: "800 W", ex: "3km 뜀걸음 체력측정 · 장애물/유격 코스 · 2인 들것 고속 수송" }
];

const GEARS = [
  { id: "scu",  name: "전투복 / 체육복", adj: () => 0,                src: "기준 복장 (보정 없음 +0.0°C)" },
  { id: "iba",  name: "방탄복·군장",   adj: () => 2.8,              src: "DAFI 48-151 · +2.8°C 가산 (+5°F)" },
  { id: "cbrn", name: "화생방 보호의", adj: t => t==="easy"?5.6:11.1, src: "TB MED 507 표 3-2 주7 · +5.6 / +11.1°C 가산" }
];

const WR = {
  1: { easy: ["제한 없음", 0.50], mod: ["제한 없음", 0.75], heavy: ["40 / 20", 0.75], vhard: ["20 / 40", 1.00] },
  2: { easy: ["제한 없음", 0.50], mod: ["제한 없음", 0.75], heavy: ["30 / 30", 1.00], vhard: ["15 / 45", 1.00] },
  3: { easy: ["제한 없음", 0.75], mod: ["제한 없음", 0.75], heavy: ["30 / 30", 1.00], vhard: ["10 / 50", 1.00] },
  4: { easy: ["제한 없음", 0.75], mod: ["50 / 10", 0.75],   heavy: ["20 / 40", 1.00], vhard: ["10 / 50", 1.00] },
  5: { easy: ["제한 없음", 1.00], mod: ["20 / 40", 1.00],   heavy: ["15 / 45", 1.00], vhard: ["10 / 50", 1.00] }
};

const QT = 0.9464;

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
let newsDisplayCount = 3;

const S = {
  region: "nonsan",
  planDate: "2026-08-08",
  activeActivityId: "act_march40",
  task: "heavy", gear: "iba", pax: 600, from: 8, to: 12,
  meas: HOURS.map(() => null),
  envData: { ta: 33.2, rh: 68, ws: 2.1, chillTemp: 34.5, wbgt: 31.8, pm10: 42, pm25: 22, dustStatus: "보통", uvIndex: 8, pop: 10 },
  newsList: [],
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
    seg("task", TASKS, "task", "taskHint", () => { const t = TASKS.find(x => x.id === S.task); return t ? `${t.w} · ${t.ex}` : ''; }, () => recomputeAll());
    seg("gear", GEARS, "gear", "gearHint", () => { const g = GEARS.find(x => x.id === S.gear); return g ? g.src : ''; }, () => recomputeAll());
  }
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

    if (month in [12, 1, 2]) { // Winter
      TA = [-5.0, -4.5, -3.0, -1.5, 0.0, 2.0, 3.5, 4.5, 5.0, 4.8, 3.5, 1.0, -1.0, -2.5, -3.8, -4.5, -5.0];
      RH = [65, 62, 58, 52, 45, 40, 38, 35, 33, 34, 38, 42, 48, 55, 60, 63, 65];
      APP = TA.map(t => t - 3.0);
      BASE = TA.map(t => t * 0.7 + 3.0);
      S.envData = { ta: 5.0, rh: 33, ws: 3.5, chillTemp: 1.2, wbgt: 6.5, pm10: 55, pm25: 32, dustStatus: "보통", uvIndex: 3, pop: 10 };
    } else if (month in [3, 4, 5]) { // Spring
      TA = [10.0, 11.0, 13.0, 15.5, 17.5, 19.5, 21.0, 22.0, 22.5, 22.0, 20.5, 18.0, 16.0, 14.0, 12.5, 11.0, 10.0];
      RH = [55, 50, 45, 38, 32, 28, 25, 23, 22, 23, 26, 30, 36, 42, 48, 52, 55];
      APP = TA.map(t => t + 0.5);
      BASE = TA.map(t => t * 0.7 + 4.0);
      S.envData = { ta: 22.5, rh: 22, ws: 2.8, chillTemp: 22.8, wbgt: 19.5, pm10: 88, pm25: 48, dustStatus: "나쁨", uvIndex: 6, pop: 10 };
    } else if (month in [6, 7, 8]) { // Summer
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
      out.push(BASE[i] || 25.0); src.push("기준");
    }
  }
  return { series: out, src, any: true };
}

/* ══════════ 4-SEASON ALL-WEATHER HAZARD ENGINE ══════════ */
function calculateWindChill(ta, ws) {
  const vKmh = (ws || 2.0) * 3.6;
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

  if (pm10 > 300 || pm25 > 180) {
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
    const wRaw = typeof f.series[i] === 'number' && !isNaN(f.series[i]) ? f.series[i] : (BASE[i] || 25.0);
    const wC = wRaw + adjC;
    const taVal = TA[i] || 25.0;
    const rhVal = RH[i] || 60;
    const wsVal = env.ws || 2.0;
    const pm10Val = env.pm10 || 40;
    const pm25Val = env.pm25 || 20;

    const seasonal = computeSeasonalRisk(taVal, rhVal, wsVal, pm10Val, pm25Val, wC, month);
    const cat = seasonal.summerCat;
    const appVal = typeof APP[i] === 'number' && !isNaN(APP[i]) ? APP[i] : 28.0;
    const kl = kmaLv(appVal);
    const lv = Math.max(kl, seasonal.activeLv);
    const safeCatIndex = Math.min(5, Math.max(1, cat));
    const ruleObj = WR[safeCatIndex] || WR[1];
    const rule = ruleObj[S.task] || ["제한 없음", 0.50];

    return {
      h, ta: taVal, rh: rhVal, app: appVal, wRaw, wC, cat, kl, lv, seasonal, src: f.src[i] || "기준",
      wr: (cat === 0 && seasonal.activeSeason === "SUMMER") ? "제한 없음" : rule[0],
      qt: (cat === 0 && seasonal.activeSeason === "SUMMER") ? 0.5 : rule[1]
    };
  });
}

/* Find Peak Hour in Selected Time Window [S.from ~ S.to] */
function getSelectedWindowPeakData(D) {
  const inWindow = D.filter(d => d.h >= S.from && d.h <= S.to);
  if (!inWindow.length) return D[0];
  return inWindow.reduce((max, cur) => cur.lv > max.lv ? cur : cur.wC > max.wC ? cur : max, inWindow[0]);
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
      <span class="comp-title">📋 현 규정 (계획 시간대 ${pad(n.h)}:00 ${seasonal.seasonIcon || ''} 계절 지침 기준)</span>
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
      <span class="comp-title">🪖 본 시스템 (${pad(n.h)}:00 ${seasonal.seasonIcon || ''} ${seasonBadgeText} TB MED 507 보정)</span>
      <div class="comp-card" style="border-color:var(--accent);background:var(--accent-bg)">
        <div class="head">
          <span style="color:var(--accent)">${seasonal.activeStatus || proposedLv.n} (체감/보정 ${seasonal.activeSeason === 'WINTER' ? '체감' + seasonal.chillTemp + '°C' : 'WBGT ' + n.wC.toFixed(1) + '°C'})</span>
          <span class="p-badge p-high">4계절 복합 보정</span>
        </div>
        <div class="desc">
          <b>권장 조치</b>: ${seasonal.activeAction || proposedLv.a}<br>
          <b>작업/휴식</b>: ${n.wr} | <b>1인 시간당 급수</b>: ${(n.qt * QT).toFixed(2)}L<br>
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
        <div class="t-sub" style="color:var(--accent)">${d.wr}</div>
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

/* Refresh & Expand/Collapse Toggle Safety News Handlers */
window.refreshSafetyNews = function() {
  newsDisplayCount = 3;
  updateNewsToggleBtnUI();
  renderSafetyNews(true);
};

window.toggleMoreSafetyNews = function() {
  if (newsDisplayCount > 3) {
    newsDisplayCount = 3;
  } else {
    newsDisplayCount += 3;
  }
  updateNewsToggleBtnUI();
  renderSafetyNews();
};

function updateNewsToggleBtnUI() {
  const iconEl = document.getElementById("btnToggleNewsIcon");
  const textEl = document.getElementById("btnToggleNewsText");
  if (iconEl && textEl) {
    if (newsDisplayCount > 3) {
      iconEl.textContent = "➖";
      textEl.textContent = "접기 (3건 보기)";
    } else {
      iconEl.textContent = "➕";
      textEl.textContent = "더보기";
    }
  }
}

/* Date String Seed Hash Helper for Unique Per-Date News Order */
function getDateHashSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* Render Severe Weather Incident News with Military First Priority & Authentic News Published Date */
function renderSafetyNews(forceShuffle = false) {
  const container = document.getElementById("newsBox");
  if (!container) return;

  const dateStr = S.planDate || "2026-08-08";
  const dParts = dateStr.split("-");
  const month = dParts.length >= 2 ? parseInt(dParts[1], 10) : 8;
  const env = S.envData || {};

  const newsList = Array.isArray(S.newsList) ? S.newsList.slice() : [];
  if (!newsList.length) {
    container.innerHTML = `<p style="color:var(--dim);padding:16px;text-align:center">수집된 기상 특보 사고 기사가 없습니다.</p>`;
    return;
  }

  const dateSeed = forceShuffle ? Math.floor(Math.random() * 10000) : getDateHashSeed(dateStr);

  function anyKw(str, kws) {
    return kws.some(kw => str.includes(kw));
  }

  const accidentKws = ["사고", "사례", "피해", "발생", "열사병", "열탈진", "온열질환", "동상", "한랭질환", "저체온증", "침수", "고립", "붕괴", "산불", "쓰러", "인명", "병원", "이송", "부상", "사망", "질환", "응급"];

  const scoredNews = newsList.map((item, idx) => {
    let score = 0;
    const cat = item.category;
    const isMilitary = item.isMilitary || anyKw(item.title + item.snippet, ["군", "군대", "장병", "부대", "훈련", "국방", "육군", "해군", "공군"]);
    const isAccident = item.isAccident || anyKw(item.title + item.snippet, accidentKws);

    // 1. ACCIDENT PRIORITY FIRST: Massive score boost for recent weather accident/incident news (+400 points)
    if (isAccident) {
      score += 400;
    }

    // 2. MILITARY PRIORITY: Additional score boost for military related incident news (+300 points)
    if (isMilitary) {
      score += 300;
    }

    // 3. STRICT HARD EXCLUSION: Physical impossibility rules
    if ((month === 12 || month === 1 || month === 2) && (cat === "heatwave" || cat === "foodpoison")) {
      return { item, finalScore: -99999 }; // Never show heatwave in winter
    }
    if ((month >= 6 && month <= 8) && (cat === "coldwave")) {
      return { item, finalScore: -99999 }; // Never show coldwave in summer
    }

    // 4. DATE WEATHER HAZARD MATCHING WEIGHTS (+150 ~ +300 points)
    if ((month === 12 || month === 1 || month === 2) && (cat === "coldwave" || cat === "strongwind")) {
      score += 300;
    } else if ((month >= 6 && month <= 8) && (cat === "heatwave" || cat === "foodpoison" || cat === "lightning" || cat === "typhoon_heavyrain")) {
      score += 300;
    } else if ((month >= 3 && month <= 5 || month >= 9 && month <= 11) && (cat === "wildfire_dry" || cat === "dust_ozon")) {
      score += 300;
    }

    if (env.ta >= 31.0 && cat === "heatwave") score += 150;
    if (env.ta <= 5.0 && cat === "coldwave") score += 150;
    if (env.pop >= 50 && (cat === "typhoon_heavyrain" || cat === "lightning")) score += 120;
    if (env.pm10 >= 80 && cat === "dust_ozon") score += 100;
    if (env.ws >= 4.0 && cat === "strongwind") score += 80;

    // 5. Per-Date Pseudo-random offset for unique date variations
    const pseudoRandom = Math.sin(dateSeed + idx * 7.7) * 40;
    const finalScore = score + pseudoRandom;

    return { item, finalScore, isMilitary, isAccident };
  });

  // Filter out hard excluded items (-99999) and sort descending (Accident & Military First + Date Weather Match)
  const validScored = scoredNews.filter(s => s.finalScore > -9000);
  validScored.sort((a, b) => b.finalScore - a.finalScore);

  const listToRender = validScored.map(s => s.item).slice(0, newsDisplayCount);

  if (!listToRender.length) {
    container.innerHTML = `<p style="color:var(--dim);padding:16px;text-align:center">선택하신 날짜(${dateStr}) 계절 조건에 맞는 기상 재난 사고 기사가 없습니다.</p>`;
    return;
  }

  const catNames = {
    heatwave: "☀️ 폭염/온열",
    coldwave: "❄️ 한파/동상",
    typhoon_heavyrain: "🌧️ 태풍/호우",
    lightning: "⚡ 낙뢰/벼락",
    strongwind: "💨 강풍/시설물",
    wildfire_dry: "🌲 건조/산불",
    dust_ozon: "😷 미세먼지/황사",
    foodpoison: "🍱 식중독/위생"
  };

  container.innerHTML = listToRender.map(n => {
    const isMil = n.isMilitary || anyKw(n.title + n.snippet, ["군", "군대", "장병", "부대", "훈련", "국방"]);
    const isAcc = n.isAccident || anyKw(n.title + n.snippet, accidentKws);
    const pubDateStr = n.date ? `보도일자: ${n.date}` : "최신 보도";
    const borderStyle = isAcc && isMil ? 'border-left:3.5px solid var(--accent);background:var(--glass-2)' : isAcc ? 'border-left:3.5px solid #ff4d4f;background:var(--glass-2)' : '';
    
    return `
      <div class="news-card" style="${borderStyle}">
        <div class="hdr">
          <a href="${n.url}" target="_blank" rel="noopener" class="news-title">
            ${isMil ? '🪖' : '🚨'} ${n.title}
          </a>
          <span class="news-tag" style="${isMil ? 'background:var(--accent);color:#fff' : 'background:#ff4d4f;color:#fff'}">${n.source}</span>
        </div>
        <p class="news-snippet">${n.snippet}</p>
        <div class="news-meta">${pubDateStr} · [${catNames[n.category] || "8대 기상재난"}] ${isAcc ? '🚨 사고사례 우선배치' : ''} ${isMil ? '★ 군 관련' : ''}</div>
      </div>
    `;
  }).join("");
}
}

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
  renderSafetyNews();

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
  
  const wrEl = document.getElementById("wr");
  if (wrEl) wrEl.textContent = n.wr;
  const wrDescEl = document.getElementById("wrDesc");
  if (wrDescEl) wrDescEl.textContent = n.wr === "제한 없음" ? "시간당 작업 제한 없음 (연속 4시간까지)" : "분 단위 · 매 시간 반복";
  const waterEl = document.getElementById("water");
  if (waterEl) waterEl.innerHTML = (n.qt * QT).toFixed(2) + "<small>L</small>";
  
  const i0 = Math.max(0, HOURS.indexOf(S.from)), i1 = Math.max(0, HOURS.indexOf(S.to));
  let q = 0; for (let i = i0; i < i1; i++) q += (D[i] ? D[i].qt : 0.5);
  const L_ = q * QT * S.pax;
  
  const prEl = document.getElementById("planRange");
  if (prEl) prEl.textContent = `${pad(S.from)}:00 – ${pad(S.to)}:00 · ${S.pax}명`;
  const twEl = document.getElementById("totalWater");
  if (twEl) twEl.innerHTML = Math.round(L_).toLocaleString() + "<small>L</small>";
  const twdEl = document.getElementById("totalWaterDesc");
  if (twdEl) twdEl.textContent = `20 L 물통 ${Math.ceil(L_/20)}개 · 1인 ${(q*QT).toFixed(1)} L`;
  
  let best = null, cur = null;
  D.forEach((d, i) => {
    if (d.lv <= 3) {
      if (cur === null) cur = i;
      if (!best || (i - cur) >= (best[1] - best[0])) best = [cur, i];
    } else cur = null;
  });
  
  const swEl = document.getElementById("safeWin");
  if (swEl) swEl.textContent = best ? `${pad(D[best[0]].h)}:00 – ${pad(D[best[1]].h+1)}:00` : "없음";
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

function recomputeAll() {
  renderDay();
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
      if (json && json.news) S.newsList = json.news;
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
    dateInput.onchange = e => {
      S.planDate = e.target.value;
      newsDisplayCount = 3;
      updateNewsToggleBtnUI();
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
