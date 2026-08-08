# 🪖 군 부대활동 온열·환경위험 예측 및 지휘 통제 지원 시스템
> **Military Heat & Environmental Risk Forecasting Command & Control Dashboard**  
> *육군훈련소(논산 연무대) 신병 및 각급 부대 야외 훈련 사전 위험도 자동 예측 · 식수 보급 소요 산출 · 8대 기상재난 실시간 경보 시스템*

---

## 📌 프로젝트 개요 (Overview)

본 시스템은 단순 WBGT(열지수) 32°C 기준에 의존하던 기존 국방부 지침의 한계를 극복하고, **미 육군성 TB MED 507(2022.4 개정판)** 교리 및 **미 공군 DAFI 48-151** 착의 보정 규정을 섭씨(°C) 알고리즘으로 체계화한 **국방 특화 온열/환경위험 지휘 통제 대시보드**입니다.

오늘 기준 **+30일치(31개 일자)의 시각별 기온, 습도, 체감온도, WBGT, 미세먼지, UV 지수 데이터베이스**를 바탕으로, 지휘관이 훈련 날짜와 시간대, 훈련 인원, 과업 대사량, 착의 복장을 선택하는 즉시 **0초 실시간 반응형(Zero-click Reactive)**으로 지휘관 결정 가이드, 1:1 현 규정 비교 카드, 시간당 급수량(L) 및 필요 20L 물통 수량을 정밀 산출합니다.

---

## 🌟 주요 핵심 기능 (Key Features)

### 1. ⚡ 30일간 기상 예보 데이터 사전 수집 & 파이프라인 (Python Automation)
- **30-Day Multi-Date Dataset**: 오늘 기준 +30일치(31개 일자)의 05:00~21:00 시각별 8대 기상 데이터를 사전 수집 및 `data/latest_weather.json` 저장.
- **GitHub Actions 연동**: 상단 Header **`[⚡ GitHub Actions 날씨 수집]`** 버튼 또는 3시간 주기 Cron 자동화로 원격 백그라운드 데이터 수집.
- **📂 30일 DB 현황 한눈에 보기 (고대비 모달)**: 수집된 31개 일자의 기상 요약 데이터를 선명한 Sticky Table Header 모달 팝업으로 한눈에 파악.

### 2. 🧮 0초 반응형 실시간 정밀 위험도 & 식수 소요 산출 (Zero-click Reactive UX)
- **10대 부대활동 퀵 선택**: 사격, 10km/40km 전술행군, 각개전투/포복, 화생방 제독, 유격/장애물 등 대표 훈련을 1클릭 설정.
- **계획 시간대 피크 시각 동적 위험 판정**: 지휘관이 설정한 시간대(예: `08:00~11:00`) 구간 내 최악 피크 시각(예: `11:00`)을 자동 탐색하여 피크 위험 등급 및 권장 수칙 산출.
- **식수 & 20L 물통 개수 정밀 계산**: TB MED 507 과업 강도별 Quarts/hr 기준을 리터(L)로 환산하여 훈련 인원수 및 훈련 시간대 대비 총 필요 식수량(L) 및 20L 물통 필요 개수 자동 계산.

### 3. ⚠️ 8대 기상재난·특보 실시간 뉴스 연동 (Naver News Open API)
- **8대 기상재난 특보 연동**: 폭염, 한파, 태풍/집중호우, 낙뢰/벼락, 강풍, 건조/산불, 황사/미세먼지/자외선, 식중독/위생 기사 실시간 수집.
- **스마트 기상 조건 매칭**: 선택한 훈련 날짜의 예상 기온, 강수확률, 풍속, 미세먼지 수치에 따라 최고 위험도 기상 특보 기사 자동 배치.
- **🔄 기사 새로고침 & ➕ 더보기 기능**: 기사 셔플 및 연속 3건씩 추가 로딩 UI 지원.

---

## 📐 군사 규정 및 과학적 산출 근거 (Regulations & Formulas)

### 1. 근거 교리
- **미 육군성/공군 공동 규정**: `TB MED 507: Heat Stress Control and Heat Casualty Management` (2022.4.12 개정판, 섭씨 환산 수식 적용).
- **미 공군 규정**: `DAFI 48-151` 표 3.2 (방탄복/전투조끼 착용 시 `+2.8°C` 보정).
- **화생방 보호의 착의 보정**: TB MED 507 표 3-2 주7 (MOPP 4단계 보호의 착용 시 경작업 `+5.6°C`, 중등/중작업 `+11.1°C` 가산).

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

- **Frontend**: Vanilla HTML5, Modern CSS (Glassmorphism, Dark Aesthetics), Pure JavaScript ES6+
- **Data Engine**: Python 3.11 (`scripts/fetch_data.py`), Naver News Open API
- **Backend / Serverless**: Vercel Serverless Functions (`api/weather.js`, `api/trigger-action.js`)
- **Automation / CI/CD**: GitHub Actions (`.github/workflows/fetch_weather.yml`)

---

## 💻 실행 및 배포 방법 (Getting Started)

### 로컬 실행
```bash
# 1. 환경 변수 (.env) 설정
NAVER_CLIENT_ID="your_naver_id"
NAVER_CLIENT_SECRET="your_naver_secret"

# 2. 데이터 파이프라인 스크립트 실행 (30일 예보 & 뉴스 수집)
python scripts/fetch_data.py

# 3. 웹 서버 실행 (Python Simple Server 또는 Live Server)
python -m http.server 8000
```
웹 브라우저에서 `http://localhost:8000` 접속.

---

## 📄 라이선스 & 권장사항 (Notice)
- 본 시스템은 부대 훈련 사전 계획 수립용입니다.
- TB MED 507 교리에 의거하여 **당일 훈련 현장의 실제 최종 통제 판단은 현장 실측 WBGT 수치를 우선 사용해야 합니다**.