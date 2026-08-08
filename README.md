# 🪖 군 부대활동 온열·환경위험 예측 및 지휘 통제 지원 시스템
> **Military Heat & Environmental Risk Forecasting Command & Control Dashboard**  
> *육군훈련소(논산 연무대) 신병 및 각급 부대 야외 훈련 사전 위험도 자동 예측 · 식수 보급 소요 산출 · 8대 기상재난 및 군 사고사례 실시간 경보 대시보드*

---

## 📌 프로젝트 개요 (Overview)

본 시스템은 단순 WBGT(열지수) 단일 기준에 의존하던 기존 부대 통제의 한계를 극복하고, **미 육군성 TB MED 507(2022.4 개정판)** 교리, **미 공군 DAFI 48-151** 착의 보정 수칙 및 국방 환경지침을 체계적으로 섭씨(°C) 알고리즘화한 **국방 특화 온열·환경위험 지휘 통제 지원 대시보드**입니다.

오늘 기준 **+30일치(31개 일자)의 시각별 기온, 습도, 체감온도, WBGT, 미세먼지, 자외선(UV) 지수 데이터베이스**를 바탕으로, 지휘관이 훈련 날짜, 시간대, 훈련 인원, 과업 대사량, 착의 복장을 선택하는 즉시 **0초 실시간 반응형(Zero-click Reactive)**으로 피크 시각 위험 등급, 지휘관 결정 가이드, 1:1 규정 비교 카드, 시간당 급수량(L) 및 필요 20L 물통 수량을 정밀 산출합니다.

---

## 🌟 주요 핵심 기능 (Key Features)

### 1. ⚡ 30일간 기상 예보 데이터 수집 & 파이프라인 (Python Automation)
- **30-Day Multi-Date Dataset**: 오늘 기준 +30일치(31개 일자)의 05:00~21:00 시각별 8대 기상 데이터를 수집 및 `data/latest_weather.json`에 저장.
- **하이브리드 예보 파이프라인**:
  - **D+0 ~ D+10**: 기상청 단기/중기 예보 OpenAPI 실시간 연동
  - **D+11 ~ D+30**: 기후 통계(Climatology) 1개년 기상 DB 기반 예측치 결합
- **원격 데이터 갱신 트리거**:
  - 대시보드 Header **`[⚡ 날씨 수집 (+10일치)]`** 버튼을 클릭하여 GitHub Actions 또는 Serverless API를 통해 즉시 원격 데이터 수집 유도.
  - **3시간 주기 GitHub Actions Cron**을 통한 무인 자동 데이터 업데이트.
- **📂 30일 DB 현황 모달**: 수집된 31개 일자의 8대 기상 데이터를 Sticky Table Header 구조의 고대비 모달 팝업으로 한눈에 파악.

### 2. 🧮 0초 반응형 실시간 정밀 위험도 & 식수 소요 산출 (Zero-click Reactive UX)
- **10대 부대활동 퀵 선택**: 사격, 10km/40km 전술행군, 각개전투/포복, 화생방 제독, 유격/장애물 등 대표 훈련을 1클릭으로 대사량(W) 자동 설정.
- **계획 시간대 피크 시각 동적 위험 판정**: 설정한 훈련 시간대(예: `08:00~11:00`) 내 최악의 피크 시각(예: `11:00`)을 자동 탐색하여 피크 위험 등급 및 권장 휴식/급수 지침 제시.
- **복장 착의 보정 (Heat Adjustment Factors)**:
  - 전투조끼 / 방탄복 착용 시: **+2.8°C**
  - MOPP 4단계 화생방 보호의 착용 시: 강도별 **+5.6°C ~ +11.1°C** 가산
- **식수 & 20L 물통 개수 정밀 계산**: TB MED 507 과업 강도별 Quarts/hr 기준을 리터(L)로 환산하여 훈련 인원수 및 훈련 시간대 대비 총 필요 식수량(L) 및 **20L 물통 필요 개수** 자동 계산.

### 3. ⚠️ 8대 기상재난·군 사고사례 실시간 연동 (Naver News Open API)
- **8대 기상재난 특보 & 군 사고 뉴스**: 폭염, 한파, 태풍/집중호우, 낙뢰/벼락, 강풍, 건조/산불, 황사/미세먼지, 식중독/위생 관련 뉴스 및 실제 군 사고사례 데이터 연동.
- **스마트 기상 조건 매칭**: 선택한 훈련 날짜의 기온, 강수확률, 풍속, 미세먼지 수치에 따라 가장 연관된 고위험 특보 기사를 우대 배치.
- **뉴스 셔플 & 더보기 UI**: 기사 새로고침 및 3건씩 카드 추가 로딩 지원.

---

## 📐 군사 규정 및 과학적 산출 근거 (Regulations & Formulas)

### 1. 근거 교리
- **미 육군성/공군 공동 규정**: `TB MED 507: Heat Stress Control and Heat Casualty Management` (2022.4.12 개정판)
- **미 공군 규정**: `DAFI 48-151` (방탄복/전투조끼 착용 시 `+2.8°C` 보정)
- **화생방 보호의 착의 보정**: TB MED 507 표 3-2 주7 (MOPP 4단계 착용 시 경작업 `+5.6°C`, 중등/중작업 `+11.1°C` 가산)

### 2. 열지수(WBGT)별 1인 시간당 권장 급수량 (Quarts -> Liters)

| 미군 WBGT 등급 | 보정 WBGT (°C) | 경작업 (~250W) | 중등작업 (~425W) | 중작업 (~600W) | 고강도 (~800W) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **CAT 1 (백색)** | 25.6 ~ 27.7°C | 0.47 L/hr | 0.71 L/hr | 0.71 L/hr | 0.95 L/hr |
| **CAT 2 (녹색)** | 27.8 ~ 29.3°C | 0.47 L/hr | 0.71 L/hr | 0.95 L/hr | 0.95 L/hr |
| **CAT 3 (황색)** | 29.4 ~ 31.0°C | 0.71 L/hr | 0.71 L/hr | 0.95 L/hr | 0.95 L/hr |
| **CAT 4 (적색)** | 31.1 ~ 32.1°C | 0.71 L/hr | 0.71 L/hr | 0.95 L/hr | 0.95 L/hr |
| **CAT 5 (흑색)** | 32.2°C 이상 | 0.95 L/hr | 0.95 L/hr | 0.95 L/hr | 0.95 L/hr |

---

## 🛠️ 기술 아키텍처 (Tech Stack)

| 구분 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Modern Vanilla CSS, ES6+ JavaScript | Glassmorphism UI, Responsive Web, CSS Variables |
| **Data Engine** | Python 3.11 (`scripts/fetch_data.py`) | 기상청 OpenAPI, 네이버 뉴스 OpenAPI, 기후 통계 결합 |
| **Serverless / API** | Cloudflare Pages Functions / Vercel Functions | `/api/weather`, `/api/trigger-action`, `/api/action-status` |
| **Automation** | GitHub Actions (`.github/workflows/fetch_weather.yml`) | 3시간 주기 자동 기상 수집 및 JSON 갱신 파이프라인 |

---

## 📂 디렉터리 구조 (Directory Structure)

```text
weather_contest/
├── index.html                  # 메인 지휘 통제 대시보드 UI
├── styles.css                  # 모던 다크 테마 및 반응형 CSS 스타일시트
├── app.js                      # 실시간 위험도/식수 산출 및 대시보드 인터랙션 로직
├── sw.js                       # Service Worker (PWA 지원)
├── data/
│   └── latest_weather.json     # 30일치(31개 일자) 기상 예보 및 뉴스 데이터셋
├── scripts/
│   └── fetch_data.py           # 파이썬 기상 수집 파이프라인 엔진
├── functions/api/              # Cloudflare Pages Serverless Functions
│   ├── weather.js              # 기상 데이터 제공 API
│   ├── trigger-action.js       # GitHub Action 수집 실행 트리거 API
│   └── action-status.js        # 수집 진행 상태 확인 API
├── api/                        # Vercel Serverless Functions (호환용)
├── .github/workflows/
│   └── fetch_weather.yml       # GitHub Actions 자동 수집 워크플로우
├── wrangler.json               # Cloudflare Pages 설정 파일
└── vercel.json                 # Vercel 호환 설정 파일
```

---

## 🚀 로컬 개발 및 시작하기 (Getting Started)

### 1. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 네이버 및 기상청 API 키를 설정합니다.

```env
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
KMA_API_KEY=your_kma_api_key
```

### 2. 데이터 수집 엔진 실행 (Python)
```bash
python scripts/fetch_data.py
```

### 3. 로컬 서버 구동
별도의 복잡한 빌드 과정 없이 정적 웹 서버(VS Code Live Server, python http.server 등)로 실행할 수 있습니다.

```bash
python -m http.server 8000
# http://localhost:8000 접속
```

---

## 📄 라이선스 & 유의사항 (Notice)
- 본 시스템은 부대 훈련 사전 계획 수립 및 지휘 통제 지원 목적입니다.
- TB MED 507 교리에 의거하여 **당일 훈련 현장의 실제 최종 통제 판단은 현장 실측 WBGT 수치를 우선 고려해야 합니다**.