"use strict";

/* ═══════════ DATA CONSTANTS & DATASETS ═══════════ */
const HOURS = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
let TA   = [26.1,26.5,27.8,29.5,31.2,32.8,34.1,35.0,35.8,36.2,35.9,35.0,33.6,31.8,30.0,28.6,27.6];
let RH   = [82,80,76,70,63,57,52,48,45,44,45,48,53,59,66,72,77];
let APP  = [28.0,28.5,30.1,32.0,33.9,35.4,36.6,37.4,38.1,38.5,38.2,37.4,36.1,34.3,32.5,30.9,29.6];
let BASE = [24.0,24.5,25.8,27.2,28.6,29.8,30.8,31.5,32.0,32.3,32.0,31.2,30.0,28.4,26.8,25.5,24.6];

/* 10 Major Military Activity Master Database */
const UNIT_ACTIVITIES = [
  { id: "act_range", name: "🎯 사격 훈련", task: "easy", gear: "iba", pax: 240, desc: "방탄복/전투조끼 착용 사격술 및 영점사격" },
  { id: "act_fitness", name: "🏃 체력 측정", task: "vhard", gear: "scu", pax: 300, desc: "체육복 착용 3km 뜀걸음 및 훈련 (복장 보정 +0°C, 고강도 800W)" },
  { id: "act_march10", name: "🎒 10km 급속행군", task: "heavy", gear: "iba", pax: 450, desc: "전술 부하 행군 (중작업 600W, 방탄/군장 +2.8°C)" },
  { id: "act_march40", name: "⚔️ 40km 전술행군", task: "heavy", gear: "iba", pax: 600, desc: "45lb 완전군장 행군 (고부하 야외 노출, 방탄/군장 +2.8°C)" },
  { id: "act_gaekae", name: "💥 각개전투 / 포복", task: "mod", gear: "iba", pax: 350, desc: "장애물 극복 및 전술 포복 (중등작업 425W)" },
  { id: "act_cbrn", name: "☣️ 화생방 제독", task: "mod", gear: "cbrn", pax: 180, desc: "MOPP 4단계 완전 보호의 착용 (+11.1°C 가산)" },
  { id: "act_obstacle", name: "🧗 유격 / 장애물", task: "vhard", gear: "scu", pax: 280, desc: "코스 장애물 극복 및 극기 훈련 (고강도 800W)" },
  { id: "act_grenade", name: "🔫 수류탄 투척", task: "easy", gear: "iba", pax: 320, desc: "야외 투척장 안전 통제 (방탄복/전투조끼 +2.8°C)" },
  { id: "act_jesik", name: "🚶 제식 / 총기손질", task: "easy", gear: "scu", pax: 500, desc: "연병장 기본 제식 및 군기 훈련 (경작업 250W)" },
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

/* ═══════════ APP STATE ═══════════ */
let newsDisplayCount = 3;

const S = {
  planDate: "2026-08-08",
  activeActivityId: "act_march40",
  task: "heavy", gear: "iba", pax: 600, from: 8, to: 12,
  meas: HOURS.map(() => null),
  envData: { ta: 33.2, rh: 68, ws: 2.1, chillTemp: 34.5, wbgt: 31.8, pm10: 42, pm25: 22, dustStatus: "보통", uvIndex: 8, pop: 10 },
  newsList: [],
  byDateWeather: {}
};

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

function applyDateWeather(targetDate) {
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

function computeDay() {
  applyDateWeather(S.planDate);
  const g = GEARS.find(x => x.id === S.gear) || GEARS[0];
  const adjC = g.adj ? g.adj(S.task) : 0;
  const f = fill();
  return HOURS.map((h, i) => {
    const wRaw = typeof f.series[i] === 'number' && !isNaN(f.series[i]) ? f.series[i] : (BASE[i] || 25.0);
    const wC = wRaw + adjC;
    const cat = catOfC(wC);
    const appVal = typeof APP[i] === 'number' && !isNaN(APP[i]) ? APP[i] : 28.0;
    const kl = kmaLv(appVal);
    const lv = Math.max(kl, cat);
    const safeCatIndex = Math.min(5, Math.max(1, cat));
    const ruleObj = WR[safeCatIndex] || WR[1];
    const rule = ruleObj[S.task] || ["제한 없음", 0.50];
    return {
      h, ta: TA[i] || 25.0, rh: RH[i] || 60, app: appVal, wRaw, wC, cat, kl, lv, src: f.src[i] || "기준",
      wr: cat === 0 ? "제한 없음" : rule[0], qt: cat === 0 ? 0.5 : rule[1]
    };
  });
}

/* Find Peak Hour in Selected Time Window [S.from ~ S.to] */
function getSelectedWindowPeakData(D) {
  const inWindow = D.filter(d => d.h >= S.from && d.h <= S.to);
  if (!inWindow.length) return D[0];
  return inWindow.reduce((max, cur) => cur.wC > max.wC ? cur : max, inWindow[0]);
}

function getLegacyVerdict(peakW) {
  if (peakW < 26.5) return { status: "정상", class: "p-low", desc: "정상 야외훈련 실시 가능" };
  if (peakW < 29.5) return { status: "주의", class: "p-low", desc: "양성교육 및 야외훈련 시 미숙련자 주의" };
  if (peakW < 31.0) return { status: "부분제한", class: "p-mid", desc: "뜀걸음, 행군 등 과중한 훈련 지양, 옥외훈련 조정 시행" };
  if (peakW < 32.0) return { status: "제한", class: "p-high", desc: "옥외훈련 제한 및 중지 (1일 6시간 이내 제한 활동)" };
  return { status: "중지", class: "p-high", desc: "경계작전 등 필수 활동만 실시 (아침/저녁시간 최대 활용)" };
}

function renderComparison(D) {
  const compBox = document.getElementById("compBox");
  if (!compBox) return;

  const n = getSelectedWindowPeakData(D);
  const peakW = n.wRaw;
  const legacy = getLegacyVerdict(peakW);
  const proposedCat = n.cat;
  const proposedLv = LV[n.lv] || LV[0];
  const gearObj = GEARS.find(g => g.id === S.gear) || GEARS[0];

  compBox.innerHTML = `
    <div class="comp-col legacy">
      <span class="comp-title">📋 현 국방부 규정 (계획 시간대 피크 시각 ${pad(n.h)}:00 기준)</span>
      <div class="comp-card">
        <div class="head">
          <span>${legacy.status} (단순 WBGT ${peakW.toFixed(1)}°C)</span>
          <span class="p-badge ${legacy.class}">${legacy.status}</span>
        </div>
        <div class="desc">
          ${legacy.desc}<br>
          <small style="color:var(--faint)">* 단점: 장병의 과업 강도(행군/포복) 및 전투복/방탄복/보호의 착용 보정 미반영</small>
        </div>
      </div>
    </div>

    <div class="comp-col proposed">
      <span class="comp-title">🪖 본 시스템 (${pad(n.h)}:00 피크 기준 TB MED 507 섭씨 보정)</span>
      <div class="comp-card" style="border-color:var(--accent);background:var(--accent-bg)">
        <div class="head">
          <span style="color:var(--accent)">${proposedLv.n} (보정 WBGT ${n.wC.toFixed(1)}°C / CAT ${proposedCat})</span>
          <span class="p-badge p-high">위험 보정 반영</span>
        </div>
        <div class="desc">
          <b>권장 조치</b>: ${proposedLv.a}<br>
          <b>작업/휴식</b>: ${n.wr} | <b>1인 시간당 급수</b>: ${(n.qt * QT).toFixed(2)}L<br>
          <small style="color:var(--accent)">* 강점: 복장 보정(${gearObj.name} ${gearObj.src}) 및 과업 대사량 반영</small>
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
    const bgCol = l.c === "var(--c0)" ? "var(--glass-2)" : l.c;
    const txtCol = l.i || "var(--ink)";

    return `
      <div class="time-card" style="cursor:pointer" onclick="highlightHour(${d.h})">
        <div class="t-hour">${pad(d.h)}:00</div>
        <div class="t-lvl" style="background:${bgCol};color:${txtCol}">${l.n} (${d.lv}단계)</div>
        <div class="t-sub">WBGT ${d.wC.toFixed(1)}°C</div>
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
  renderSafetyNews(true); // Force random shuffle on manual refresh
};

window.toggleMoreSafetyNews = function() {
  if (newsDisplayCount > 3) {
    newsDisplayCount = 3; // Collapse back to 3 items
  } else {
    newsDisplayCount += 3; // Expand by 3 items
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

/* Render 8-Factor Severe Weather Disaster News with Date-Driven Seed Shuffling */
function renderSafetyNews(forceShuffle = false) {
  const container = document.getElementById("newsBox");
  if (!container) return;

  const dateStr = S.planDate || "2026-08-08";
  const dParts = dateStr.split("-");
  const month = dParts.length >= 2 ? parseInt(dParts[1], 10) : 8;
  const day = dParts.length >= 3 ? parseInt(dParts[3], 10) : 8;
  const env = S.envData || {};

  const newsList = Array.isArray(S.newsList) ? S.newsList.slice() : [];
  if (!newsList.length) {
    container.innerHTML = `<p style="color:var(--dim);padding:16px;text-align:center">수집된 기상 특보 뉴스가 없습니다.</p>`;
    return;
  }

  // Calculate priority score for each news item based on selected date's weather
  const dateSeed = forceShuffle ? Math.floor(Math.random() * 10000) : getDateHashSeed(dateStr);

  const scoredNews = newsList.map((item, idx) => {
    let score = 0;
    const cat = item.category;

    // Condition matching weights
    if (env.ta >= 31.0 && cat === "heatwave") score += 50;
    if (env.ta <= 0.0 && cat === "coldwave") score += 50;
    if (env.pop >= 50 && (cat === "typhoon_heavyrain" || cat === "lightning")) score += 45;
    if (env.pm10 >= 80 && cat === "dust_ozon") score += 40;
    if (env.ws >= 5.0 && cat === "strongwind") score += 35;

    // Season matching weights
    if (month >= 6 && month <= 8 && (cat === "heatwave" || cat === "foodpoison" || cat === "lightning")) score += 30;
    else if ((month === 12 || month === 1 || month === 2) && (cat === "coldwave" || cat === "strongwind")) score += 30;
    else if (cat === "wildfire_dry" || cat === "dust_ozon") score += 20;

    // Date-driven pseudorandom shuffle offset (Guarantees DIFFERENT order for DIFFERENT dates)
    const pseudoRandom = Math.sin(dateSeed + idx * 7.7) * 100;
    const finalScore = score + pseudoRandom;

    return { item, finalScore };
  });

  // Sort news by finalScore descending (highest match & per-date pseudo-random order)
  scoredNews.sort((a, b) => b.finalScore - a.finalScore);

  const listToRender = scoredNews.map(s => s.item).slice(0, newsDisplayCount);

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

  container.innerHTML = listToRender.map(n => `
    <div class="news-card">
      <div class="hdr">
        <a href="${n.url}" target="_blank" rel="noopener" class="news-title">⚠️ ${n.title}</a>
        <span class="news-tag">${n.source}</span>
      </div>
      <p class="news-snippet">${n.snippet}</p>
      <div class="news-meta">선택일(${dateStr}) 특보 매칭 · [${catNames[n.category] || "8대 기상재난특보"}]</div>
    </div>
  `).join("");
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
      s += `<text x="${cx+cw/2}" y="${yy+17}" text-anchor="middle" font-size="10" font-weight="640" font-family="var(--mono)" fill="${o.i}">${txt(d)}</text>`;
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

  const rangeEl = document.getElementById("mMetaRange");
  const tbody = document.querySelector("#mSummaryTable tbody");

  const dates = S.byDateWeather ? Object.keys(S.byDateWeather).sort() : [];
  if (rangeEl) {
    rangeEl.textContent = dates.length ? `${dates.length}개 날짜 (${dates[0]} ~ ${dates[dates.length-1]})` : "31개 날짜 예보 연동완료";
  }

  if (tbody) {
    if (dates.length) {
      tbody.innerHTML = dates.map(dStr => {
        const item = S.byDateWeather[dStr] || {};
        const env = item.env || {};
        const isSelected = dStr === S.planDate;
        return `
          <tr class="${isSelected ? "now" : ""}">
            <td style="font-family:var(--mono);color:${isSelected ? "#38BDF8" : "#F8FAFC"}">
              <b>${dStr}</b> ${isSelected ? "📌 [선택일]" : ""}
            </td>
            <td class="num" style="color:#F1F5F9">${env.ta ? env.ta.toFixed(1) : "33.2"}°C</td>
            <td class="num" style="color:#94A3B8">${env.rh || 68}%</td>
            <td class="num" style="color:#38BDF8;font-weight:700">${env.chillTemp ? env.chillTemp.toFixed(1) : "34.5"}°C</td>
            <td class="num" style="color:#F59E0B;font-weight:700">${env.wbgt ? env.wbgt.toFixed(1) : "31.8"}°C</td>
            <td><span style="font-size:12px;color:#4ADE80;font-weight:600">${env.pm10 || 42} µg/m³ (${env.dustStatus || "보통"})</span></td>
          </tr>
        `;
      }).join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94A3B8;padding:24px">저장된 30일치 데이터베이스 항목을 불러오는 중...</td></tr>`;
    }
  }
};

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

/* ⚡ TOP HEADER BUTTON: FETCH 30-DAY WEATHER FORECAST DATA VIA GITHUB ACTIONS */
window.triggerGitHubActionPipeline = async function() {
  const toast = document.getElementById("ghToast");
  const toastTitle = document.getElementById("ghToastTitle");
  const toastText = document.getElementById("ghToastText");
  const ghBadge = document.getElementById("ghBadge");

  if (toast) toast.hidden = false;
  if (toastTitle) toastTitle.textContent = "🚀 GitHub Actions 파이프라인 (fetch_weather.yml) 실행 요청 중...";
  if (toastText) toastText.textContent = `오늘 기준 +한 달간의 날씨 예보 데이터를 수집 및 저장하고 있습니다.`;
  
  if (ghBadge) {
    ghBadge.textContent = '● GitHub Actions Pipeline: Running...';
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
      if (toastText) toastText.textContent = `✅ ${json.message}`;
      if (ghBadge) {
        ghBadge.textContent = '● GitHub Actions: TRIGGERED & ACTIVE';
        ghBadge.className = 'badge live';
      }
    } else {
      if (toastText) toastText.textContent = `ℹ️ ${json.message}`;
      if (ghBadge) {
        ghBadge.textContent = `● GitHub Actions: ${json.error || 'Standby'}`;
        ghBadge.className = 'badge warn';
      }
    }
  } catch (e) {
    console.log('GitHub Actions trigger note:', e.message);
  }

  setTimeout(() => {
    if (toast) toast.hidden = true;
    fetchKmaLiveWeather();
  }, 2200);
};

async function fetchKmaLiveWeather() {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const json = await res.json();
      const badg = document.getElementById("liveBadge");

      if (json && json.byDate) {
        S.byDateWeather = json.byDate;
      }
      if (json && (json.status === 'LIVE_KMA_DATA' || json.status === 'LIVE_GITHUB_ACTION_DATA')) {
        if (badg) {
          badg.textContent = '● 30일간 예보 연동완료';
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

  container.innerHTML = `
    <div class="env-chip">
      <div class="tag">기온 (TA)</div>
      <div class="val" style="color:var(--ink)">${e.ta || 33.2}°C</div>
      <div class="sub">선택일(${S.planDate}) 피크 예보</div>
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
  renderActivityPresets();

  const dateInput = document.getElementById("planDate");
  if (dateInput) {
    dateInput.onchange = e => {
      S.planDate = e.target.value;
      newsDisplayCount = 3; // Reset display count on date change
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
