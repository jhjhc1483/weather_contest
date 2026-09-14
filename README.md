# 🪖 군 부대활동 온열·환경위험 예측 및 지휘 통제 지원 시스템
> **Military Heat & Environmental Risk Forecasting Command & Control Dashboard**  
> *육군훈련소(논산 연무대) 신병 및 각급 부대 야외 훈련 사전 위험도 자동 예측 · 식수 보급 소요 산출 · AI 기상작전보좌관(Gemini Flash) 대화형 지휘 통제 지원 대시보드*

---

## 📌 프로젝트 개요 (Overview)

본 시스템은 단순 WBGT(온도지수) 단일 기준에 의존하던 기존 부대 통제의 한계를 극복하고, **미 육군성 TB MED 507(2022.4 개정판)** 교리, **미 공군 DAFI 48-151** 착의 보정 수칙 및 대한민국 국방 환기·환경 지침을 체계적으로 섭씨(°C) 알고리즘화한 **국방 특화 온열·환경위험 지휘 통제 지원 통합 플랫폼**입니다.

오늘 기준 **+30일치(31개 일자)의 시각별 기온, 습도, 체감온도, WBGT, 풍속, 미세먼지, 자외선(UV) 지수 데이터베이스**를 바탕으로, 지휘관이 훈련 날짜, 시간대, 훈련 인원, 과업 대사량, 착의 복장을 선택하는 즉시 **0초 실시간 반응형(Zero-click Reactive)**으로 피크 시각 위험 등급, 지휘관 결정 가이드, 시간당 급수량(L) 및 필요 20L 물통 수량을 정밀 산출합니다.

또한 최신 **Google Gemini 2.5 Flash 기반 'AI 기상작전보좌관'**을 탑재하여, 대한민국 표준시(KST) 기반의 훈련 가용성 분석과 지휘관과의 능동적 티키타카(역질문) 대화형 질의응답을 지원합니다.

---

## 🌟 주요 핵심 기능 (Key Features)

### 1. 🤖 AI 기상작전보좌관 (Gemini 2.5 Flash 기반 대화형 지휘 지원)
- **대한민국 표준시 (KST, UTC+9) 시공간 엔진**: 
  - 브라우저 및 서버리스 환경에 구애받지 않고 항상 한국 표준시를 절대 기준으로 인식.
  - "이번 달 사격 가능한 주는?", "내일 훈련 어때?" 등 질문 시 현재 한국 날짜 및 1~4주차 일자 구간을 자로 잰 듯 정확히 계산하여 응답.
- **능동적 작전 대화 메커니즘 (티키타카 상호작용)**:
  - 질문 조건이 모호할 경우 일방적인 장문 보고서 대신 부대(논산/양평), 시간대(오전/오후), 복장(단독/완전군장) 등을 되묻는 **역질문(Clarification)**을 던져 지휘관과 단계적 의사결정 진행.
- **30일 기상 DB & 군사 교리 컨텍스트 자동 주입 (Context Injection)**:
  - 현재 선택된 부대의 30일치 기상 예보치, TB MED 507/508 대사율 및 착의 보정치, 캘린더 엔진의 안전 골든타임을 프롬프트에 실시간 주입하여 할루시네이션(환각) 원천 차단.
- **초고속 응답 & 텍스트 잘림 방지 최적화**:
  - Gemini 2.5 Flash의 Thinking 토큰을 최적화(`thinkingBudget: 0`)하고 출력 토큰을 2,500토큰으로 확장하여 끊김 없는 고속 스트리밍급 응답 실현.
- **Google AI Studio API 키 클라이언트 관리 & 영구 파기 기능**:
  - 챗봇 상단 톱니바퀴(⚙️) 설정에서 개별 API 키 등록 및 브라우저 로컬스토리지 저장 지원.
  - 언제든 **[API 키 삭제]** 버튼을 통해 기기 내 저장된 키를 1클릭으로 즉시 영구 파기 가능.
- **이중 호출 아키텍처 (Serverless + Direct Client Fallback)**:
  - Cloudflare Pages Functions (`/api/chat`) 백엔드를 우선 호출하며, 로컬 개발 환경(Live Server) 등 백엔드 부재 시 클라이언트 직접 호출로 자동 폴백.

### 2. 🗺️ 다지역(Multi-Region) 작전 지원 (충남 논산 & 경기 양평)
- **전략적 핵심 거점 다변화**:
  - **충남 논산 (육군훈련소)**: 신병 양성 및 야외 기초 군사훈련 특화 기상 분석
  - **경기 양평 (기계화/산악 부대)**: 수도권 방어 및 기동/포병 훈련 특화 기상 분석
- **원클릭 지역 전환**: 대시보드 상단 탭에서 지역 변경 시 30일 기상 DB 및 대시보드 전 지표 즉시 실시간 전환.

### 3. ⚡ 30일간 기상 예보 데이터 수집 파이프라인 (Python Automation)
- **30-Day Multi-Date Dataset**: 오늘 기준 +30일치(31개 일자)의 05:00~21:00 시각별 8대 기상 데이터를 수집 및 `data/latest_weather.json`에 영구 저장.
- **하이브리드 예보 파이프라인**:
  - **D+0 ~ D+10**: 기상청 단기/중기 예보 OpenAPI 실시간 연동
  - **D+11 ~ D+30**: 기후 통계(Climatology) 1개년 기상 실측치 기반 예측치 결합
- **원격 데이터 갱신 트리거**:
  - 대시보드 Header **`[⚡ 날씨 수집 (+10일치)]`** 버튼을 클릭하여 GitHub Actions 또는 Serverless API를 통해 즉시 최신 데이터 재수집 가능.
  - **3시간 주기 GitHub Actions Cron**을 통한 무인 자동 데이터 업데이트.
- **📂 30일 DB 현황 모달**: 수집된 31개 일자의 8대 기상 데이터를 Sticky Table Header 구조의 고대비 모달 팝업으로 한눈에 파악.

### 4. 🧮 0초 반응형 실시간 정밀 위험도 & 식수 소요 산출 (Zero-click Reactive UX)
- **8대 육군 훈련 과업 퀵 선택**: 영점/사격술, 10km/40km 전술행군, 3km 뜀걸음, 각개전투/포복, 화생방 제독, 혹한기 경계 등 대표 훈련을 1클릭으로 대사량(W) 자동 세팅.
- **피크 시각 동적 위험 판정**: 계획 훈련 시간대(예: `08:00~12:00`) 내 최악의 피크 시각을 자동 탐색하여 피크 위험 등급 및 권장 휴식/급수 지침 제시.
- **복장 착의 보정 (Heat Adjustment Factors)**:
  - 전투조끼 / 방탄복 착용 시: **+2.8°C**
  - MOPP 4단계 화생방 보호의 착용 시: 강도별 **+5.6°C ~ +11.1°C** 가산
- **식수 & 20L 물통 개수 정밀 계산**: TB MED 507 과업 강도별 Quarts/hr 기준을 리터(L)로 환산하여 훈련 인원수 및 훈련 시간대 대비 총 필요 식수량(L) 및 **20L 물통 필요 개수** 자동 계산.

### 5. ⚠️ 기상 조건별 사건사고 사례 및 안전 경보 연동 (Naver News Open API)
- **실제 사건사고 사례 수집**: 군 사고뿐만 아니라, **현재 기상 조건(폭염·한파·호우·강풍 등)에서 실제 발생한 민간/산업/야외활동 사건사고 사례**를 폭넓게 수집·연동.
- **스마트 기상 조건 매칭**: 선택한 날짜의 기온, 강수확률, 풍속, 미세먼지 수치 등 실제 기상 위험 요소와 가장 연관성이 높은 사고사례 기사를 최우선 매칭.

### 6. 📱 PWA (Progressive Web App) 오프라인 지원
- **Service Worker (`sw.js`) & Web App Manifest**: 통신망이 제한되는 야외 훈련장이나 작전 지역에서도 브라우저 캐시를 통해 무중단 오프라인 대시보드 열람 가능.
- **홈 화면 바로가기(A2HS)** 지원으로 모바일·태블릿 태블릿 PC에서 네이티브 앱처럼 구동.

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
| **Frontend** | HTML5, Vanilla CSS, ES6+ JavaScript, PWA | Glassmorphism 군사 UI, CSS Grid/Flexbox 반응형, Service Worker |
| **AI Engine** | Google Gemini 2.5 Flash | Thinking Budget 0, 2500 토큰, KST 컨텍스트 주입, 티키타카 프롬프트 |
| **Data Engine** | Python 3.11 (`scripts/fetch_data.py`) | 기상청 OpenAPI, 네이버 뉴스 OpenAPI, 기후 통계 융합 파이프라인 |
| **Serverless / API** | Cloudflare Pages Functions / Vercel | `/api/weather`, `/api/chat`, `/api/trigger-action`, `/api/action-status` |
| **Automation** | GitHub Actions (`.github/workflows/fetch_weather.yml`) | 3시간 주기 자동 기상 수집 및 원격 트리거 파이프라인 |

---

## 📂 디렉터리 구조 (Directory Structure)

```text
weather_contest/
├── index.html                  # 메인 지휘 통제 대시보드 UI & AI 챗봇 인터페이스
├── styles.css                  # 군사 다크 테마, 챗봇 플로팅 UI 및 반응형 CSS
├── app.js                      # 대시보드 반응형 엔진, KST 날짜 엔진, AI 챗봇 클라이언트
├── sw.js                       # Progressive Web App (PWA) Service Worker (v12)
├── manifest.json               # 모바일 PWA 웹앱 매니페스트
├── data/
│   └── latest_weather.json     # 논산·양평 30일치(31개 일자) 기상 예보 및 뉴스 데이터셋
├── scripts/
│   └── fetch_data.py           # 파이썬 기상 수집 및 기후 융합 엔진
├── functions/api/              # Cloudflare Pages Serverless Functions
│   ├── weather.js              # 기상 데이터 제공 API
│   ├── chat.js                 # Gemini 2.5 Flash AI 기상작전보좌관 API
│   ├── trigger-action.js       # GitHub Action 수집 실행 트리거 API
│   └── action-status.js        # 수집 진행 상태 확인 API
├── api/                        # Vercel Serverless Functions (호환용)
├── .github/workflows/
│   └── fetch_weather.yml       # GitHub Actions 자동 수집 워크플로우
├── wrangler.json               # Cloudflare Pages 배포 설정
└── vercel.json                 # Vercel 호환 설정 파일
```

---

## 🚀 로컬 개발 및 시작하기 (Getting Started)

### 1. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 필요한 API 키를 설정합니다.

```env
# 기상청 & 네이버 뉴스 수집용
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
KMA_API_KEY=your_kma_api_key

# (선택) Cloudflare Pages Functions 배포용 Gemini API 키
GEMINI_API_KEY=your_gemini_api_key
```
> **참고**: 로컬 개발 시에는 챗봇 상단 설정(⚙️) 버튼을 통해 브라우저 로컬스토리지에 직접 Gemini API 키를 등록하고 언제든 삭제할 수 있습니다.

### 2. 데이터 수집 파이프라인 실행 (Python)
```bash
python scripts/fetch_data.py
```

### 3. 로컬 웹 서버 실행
별도의 번들링이나 복잡한 빌드 과정 없이 정적 웹 서버(VS Code Live Server, python http.server 등)로 즉시 실행할 수 있습니다.

```bash
python -m http.server 8000
# 웹 브라우저에서 http://localhost:8000 접속
```
> **안내**: VS Code Live Server(포트 5500) 환경에서도 백엔드 API 부재 시 `/data/latest_weather.json` 정적 데이터와 클라이언트 직접 통신으로 자동 대체(Fallback)되어 모든 기능이 정상 동작합니다.

---

## 📄 라이선스 & 유의사항 (Notice)
- 본 시스템은 군 부대 훈련 사전 계획 수립 및 지휘 통제 의사결정 지원 목적의 시스템입니다.
- TB MED 507 교리에 의거하여 **당일 훈련 현장의 최종 통제 판단은 훈련장 현장 실측 WBGT 수치를 최우선 고려**해야 합니다.